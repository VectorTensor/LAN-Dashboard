import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

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
  source: 'grpc_server' | 'fallback';
  grpcTarget: string;
  error?: string;
}

export interface CreateDownloadResponse {
  item: DownloadItem;
  source: 'grpc_server' | 'fallback';
  grpcTarget: string;
  error?: string;
}

const PROTO_PATH = path.join(process.cwd(), 'proto/downloads.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const downloadsProto = protoDescriptor.downloads;

const GRPC_TARGET = process.env.GRPC_SERVER_URL || 'localhost:50051';

// Initial fallback mock data
let mockDownloads: DownloadItem[] = [
  {
    id: 'dl-1',
    filename: 'ubuntu-24.04-desktop-amd64.iso',
    size: '5.8 GB',
    status: 'COMPLETED',
    progress: 100,
    url: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'dl-2',
    filename: 'alpine-standard-3.20.0-x86_64.iso',
    size: '210 MB',
    status: 'IN_PROGRESS',
    progress: 68,
    url: 'https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/x86_64/alpine-standard-3.20.0-x86_64.iso',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'dl-3',
    filename: 'postgresql-16.3-data-dump.tar.gz',
    size: '1.2 GB',
    status: 'PENDING',
    progress: 0,
    url: 'http://backup.svc.local/dumps/postgresql-16.3-data-dump.tar.gz',
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
];

export function getGrpcClient() {
  return new downloadsProto.DownloadService(
    GRPC_TARGET,
    grpc.credentials.createInsecure()
  );
}

export async function fetchDownloadsFromGrpc(filter: string = ''): Promise<GetDownloadsResponse> {
  return new Promise((resolve) => {
    try {
      const client = getGrpcClient();
      const deadline = new Date(Date.now() + 1500); // 1.5s deadline

      client.GetDownloads({ filter }, { deadline }, (err: grpc.ServiceError | null, response: { items: DownloadItem[] }) => {
        client.close();
        if (err || !response) {
          console.warn(`[gRPC Client] Call failed (${GRPC_TARGET}): ${err?.message}. Using server fallback.`);
          resolve({
            items: mockDownloads,
            source: 'fallback',
            grpcTarget: GRPC_TARGET,
            error: err?.message || 'Server unreachable',
          });
        } else {
          resolve({
            items: response.items || [],
            source: 'grpc_server',
            grpcTarget: GRPC_TARGET,
          });
        }
      });
    } catch (e: any) {
      console.error('[gRPC Client] Initialization error:', e);
      resolve({
        items: mockDownloads,
        source: 'fallback',
        grpcTarget: GRPC_TARGET,
        error: e?.message || 'Initialization failed',
      });
    }
  });
}

export async function createDownloadViaGrpc(filename: string, url: string): Promise<CreateDownloadResponse> {
  return new Promise((resolve) => {
    try {
      const client = getGrpcClient();
      const deadline = new Date(Date.now() + 1500);

      client.CreateDownload({ filename, url }, { deadline }, (err: grpc.ServiceError | null, response: DownloadItem) => {
        client.close();
        if (err || !response) {
          console.warn(`[gRPC Client] CreateDownload failed (${GRPC_TARGET}): ${err?.message}. Creating local fallback entry.`);
          const newItem: DownloadItem = {
            id: `dl-${Date.now()}`,
            filename,
            size: '150 MB',
            status: 'IN_PROGRESS',
            progress: 10,
            url,
            created_at: new Date().toISOString(),
          };
          mockDownloads.unshift(newItem);
          resolve({
            item: newItem,
            source: 'fallback',
            grpcTarget: GRPC_TARGET,
            error: err?.message || 'Server unreachable',
          });
        } else {
          resolve({
            item: response,
            source: 'grpc_server',
            grpcTarget: GRPC_TARGET,
          });
        }
      });
    } catch (e: any) {
      console.error('[gRPC Client] CreateDownload error:', e);
      const newItem: DownloadItem = {
        id: `dl-${Date.now()}`,
        filename,
        size: '150 MB',
        status: 'IN_PROGRESS',
        progress: 10,
        url,
        created_at: new Date().toISOString(),
      };
      mockDownloads.unshift(newItem);
      resolve({
        item: newItem,
        source: 'fallback',
        grpcTarget: GRPC_TARGET,
        error: e?.message || 'Initialization failed',
      });
    }
  });
}

export function getEnvStringList(key: string): string[] {
  return (
      process.env[key]
          ?.split(",")
          .map((value) => value.trim())
          .filter(Boolean) ?? []
  );
}
