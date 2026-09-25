"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Server,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Loader2,
  Pause,
  Play,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DownloadItem {
  id: string;
  filename: string;
  size: string;
  status: string;
  progress: number;
  speed: string;
  url: string;
  created_at: string;
}

interface GrpcApiResponse {
  items?: DownloadItem[];
  item?: DownloadItem;
  success?: boolean;
  source?: "grpc_server" | "fallback";
  grpcTarget?: string;
  error?: string;
  message?: string;
}

export function DownloadsPageClient() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [grpcMeta, setGrpcMeta] = useState<{
    source: string;
    grpcTarget: string;
    error?: string;
  }>({
    source: "connecting",
    grpcTarget: "localhost:50051",
  });

  const [filename, setFilename] = useState("");
  const [url, setUrl] = useState("");
  const [downloadPath, setDownloadPath] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionFilename, setActionFilename] = useState<string | null>(null);

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/downloads");
      const data: GrpcApiResponse = await res.json();
      if (data.items) {
        setDownloads(data.items);
      }
      setGrpcMeta({
        source: data.source || "unknown",
        grpcTarget: data.grpcTarget || "localhost:50051",
        error: data.error,
      });
    } catch (err) {
      console.error("Failed to fetch downloads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const handleCreateDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, url, downloadPath }),
      });
      const data: GrpcApiResponse = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to create download");
      }

      setFilename("");
      setUrl("");
      setDownloadPath("");
      setShowAddForm(false);
      await fetchDownloads();
    } catch (err) {
      console.error("Failed to create download:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleControlDownload = async (
    itemFilename: string,
    action: "pause" | "resume"
  ) => {
    setActionFilename(itemFilename);
    try {
      const res = await fetch(`/api/downloads/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: itemFilename }),
      });
      const data: GrpcApiResponse = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed to ${action} download`);
      }

      await fetchDownloads();
    } catch (err) {
      console.error(`Failed to ${action} download:`, err);
    } finally {
      setActionFilename(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Loader2 size={12} className="animate-spin" />
            Downloading
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Pause size={12} />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={12} />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Download className="text-purple-400" size={32} />
            Downloads & gRPC Client
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Server-side gRPC Service Integration for high-performance file transport and pipeline assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchDownloads}
            variant="outline"
            className="border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium"
          >
            <Plus size={16} className="mr-2" />
            New gRPC Download
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Server size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  Server-side gRPC Channel
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                  proto3
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target: <code className="text-purple-300 font-mono">{grpcMeta.grpcTarget}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {grpcMeta.source === "grpc_server" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <Zap size={14} />
                Live gRPC Server Connected
              </div>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium"
                title={grpcMeta.error}
              >
                <AlertCircle size={14} />
                gRPC Ready (Server Fallback Mode)
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-6 backdrop-blur-md"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={18} className="text-purple-400" />
            Dispatch Request to gRPC Download Service
          </h3>
          <form onSubmit={handleCreateDownload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Filename</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. archlinux-2026.09-x86_64.iso"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Download Source URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/file.iso"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Path to store</label>
              <input
                type="text"
                value={downloadPath}
                onChange={(e) => setDownloadPath(e.target.value)}
                placeholder="world-trigger/"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                className="text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-500 text-white"
              >
                {submitting ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                Send gRPC Request
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-zinc-400">
            <Loader2 className="animate-spin mr-2" size={24} />
            Loading gRPC downloads...
          </div>
        ) : downloads.length === 0 ? (
          <Card className="glass border-white/10 text-center p-8 text-zinc-400">
            No downloads available. Click New gRPC Download to start one.
          </Card>
        ) : (
          downloads.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-white truncate">
                          {item.filename}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
                        <span>Size: {item.size}</span>
                        <span>•</span>
                        <span>Speed: {item.speed || "—"}</span>
                        <span>•</span>
                        <span className="truncate max-w-xs">{item.url}</span>
                        <span>•</span>
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>

                      {(() => {
                        const status = item.status.toUpperCase();
                        const busy = actionFilename === item.filename;
                        if (status === "COMPLETED") return null;

                        if (status === "PAUSED") {
                          return (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() =>
                                handleControlDownload(item.filename, "resume")
                              }
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                              title="Resume download"
                            >
                              {busy ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Play size={14} />
                              )}
                              <span className="ml-1.5">Resume</span>
                            </Button>
                          );
                        }

                        return (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              handleControlDownload(item.filename, "pause")
                            }
                            className="border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
                            title="Pause download"
                          >
                            {busy ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Pause size={14} />
                            )}
                            <span className="ml-1.5">Pause</span>
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
