import * as grpc from "@grpc/grpc-js";
import {
  DownloadServiceClient,
  DownloadAnimeResponse,
  GetStatusResponse,
  SetDownloadResponse,
} from "@/generated/Download";
import { getSecret } from "@/lib/loadSecrets";
import { setKey, getKey, addToList, getList } from "@/lib/redisClient";

export interface DownloadItem {
  id: string;
  filename: string;
  size: string;
  status: string;
  progress: number;
  url: string;
  created_at: string;
}

export interface GetDownloadsResponse {
  items: DownloadItem[];
  source: "grpc_server" | "fallback";
  grpcTarget: string;
  error?: string;
}

export interface CreateDownloadResponse {
  item?: DownloadItem;
  id?: string;
  source: "grpc_server" | "fallback";
  grpcTarget: string;
  error?: string;
}

export function getGrpcUrls(): string[] {
  const envVal = getSecret("CFG_PEGASUS_PODS") || process.env.GRPC_URLS || "localhost:50051";
  return envVal
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

let index = 0;

export function getUserClient() {
  const urls = getGrpcUrls();
  if (urls.length === 0) {
    throw new Error("GRPC_URLS is not configured");
  }

  const urlGrpc = urls[index % urls.length];
  index++;

  const client = new DownloadServiceClient(
    urlGrpc,
    grpc.credentials.createInsecure()
  );

  return {
    client,
    urlGrpc,
  };
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export async function createDownloadViaGrpc(
  filename: string,
  url: string,
  downloadPath: string = ""
): Promise<CreateDownloadResponse> {
  let client: DownloadServiceClient;
  let urlGrpc: string;

  try {
    const uc = getUserClient();
    client = uc.client;
    urlGrpc = uc.urlGrpc;
  } catch (err: any) {
    return {
      source: "fallback",
      grpcTarget: "unknown",
      error: err?.message || "Failed to initialize gRPC client",
    };
  }

  return new Promise((resolve) => {
    const deadline = new Date(Date.now() + 5000); // 5s deadline
    let currentDownloadId = "";
    client.downloadAnime(
      { url, downloadPath },
      new grpc.Metadata(),
      { deadline },
      async (err: grpc.ServiceError | null, response?: DownloadAnimeResponse) => {
        if (err || !response) {
          console.error(`[gRPC Client] downloadAnime error (${urlGrpc}):`, err);
          resolve({
            source: "grpc_server",
            grpcTarget: urlGrpc,
            error: err?.message || "Failed to dispatch download to gRPC service",
          });
          return;
        }

        try {
          const downloadId = response.id;
          // Store mapping in Redis (as requested)
          await setKey(filename, downloadId);

          const newItem: DownloadItem = {
            id: downloadId,
            filename,
            size: "Starting...",
            status: "IN_PROGRESS",
            progress: 0,
            url:urlGrpc,
            created_at: new Date().toISOString(),
          };

          client.setDownloadLimit(
              {
                id:downloadId,
                limit:1024,

              },
              new grpc.Metadata(),
              { deadline },
              async (err: grpc.ServiceError | null, response?: SetDownloadResponse) => {
                if (err || !response) {
                  console.error(`[gRPC Client] downloadAnime error (${urlGrpc}):`, err);
                  resolve({
                    source: "grpc_server",
                    grpcTarget: urlGrpc,
                    error: err?.message || "Failed to dispatch download to gRPC service",
                  });
                  return;
                }
              }



          )

          // Store full item and add to list in Redis

          await setKey(`download:${filename}`, JSON.stringify(newItem));
          await addToList("downloads:list", filename);
          currentDownloadId = downloadId;
          resolve({
            item: newItem,
            id: downloadId,
            source: "grpc_server",
            grpcTarget: urlGrpc,
          });
        } catch (redisErr: any) {
          console.warn("[Redis] Failed to cache download item:", redisErr);
          resolve({
            id: response.id,
            source: "grpc_server",
            grpcTarget: urlGrpc,
            error: "gRPC succeeded but Redis caching failed: " + redisErr?.message,
          });
        }
      }
    );

  });
}

export async function fetchDownloadsFromGrpc(filter: string = ""): Promise<GetDownloadsResponse> {
  let urlGrpc = "localhost:50051";
  let client: DownloadServiceClient | null = null;
  let grpcError: string | undefined;

  try {
    const uc = getUserClient();
    client = uc.client;
    urlGrpc = uc.urlGrpc;
  } catch (e: any) {
    grpcError = e?.message || "Failed to initialize gRPC client";
  }
  const names = await getList("downloads:list");
  const items: DownloadItem[] = names.map((filename) => ({
    id: crypto.randomUUID(),
    filename,
    size: "",
    status: "",
    progress: 0,
    url: "",
    created_at: new Date().toISOString(),
  }));

  return {
    items,
    source: "grpc_server",
    grpcTarget: urlGrpc,
    error: grpcError,
  };
}