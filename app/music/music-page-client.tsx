"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Plus,
  Radio,
  Loader2,
  AlertCircle,
  Send,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LogEntry {
  id: string;
  topic: string;
  partition: number;
  offset: string;
  value: string;
  receivedAt: string;
}

export function MusicPageClient() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendCount, setSendCount] = useState(0);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [streamStatus, setStreamStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting");
  const [streamTopic, setStreamTopic] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource("/api/music/stream");

    es.addEventListener("status", (event) => {
      try {
        const data = JSON.parse(event.data);
        setStreamStatus("connected");
        setStreamTopic(data.topic ?? null);
        setStreamError(null);
      } catch {
        setStreamStatus("connected");
      }
    });

    es.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => [
          ...prev,
          {
            id: `${data.topic}-${data.partition}-${data.offset}-${Date.now()}`,
            topic: data.topic,
            partition: data.partition,
            offset: data.offset,
            value: data.value,
            receivedAt: data.receivedAt,
          },
        ]);
      } catch {
        // ignore malformed events
      }
    });

    es.addEventListener("error", (event) => {
      if (event instanceof MessageEvent && event.data) {
        try {
          const data = JSON.parse(event.data);
          setStreamError(data.error || "Stream error");
        } catch {
          setStreamError("Stream error");
        }
      }
      setStreamStatus("error");
    });

    es.onerror = () => {
      setStreamStatus("error");
    };

    return () => {
      es.close();
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleAddMusic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const payload = { url: url.trim(), title: title.trim() };
    setSendError(null);
    setSending(true);

    // Fire immediately so repeated clicks each produce their own message.
    void (async () => {
      try {
        const res = await fetch("/api/music", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to send music message");
        }

        setSendCount((c) => c + 1);
        setLastStatus(`Sent to topic "${data.topic}"`);
      } catch (err) {
        setSendError(err instanceof Error ? err.message : "Send failed");
      } finally {
        setSending(false);
      }
    })();
  };

  const formatValue = (value: string) => {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  };

  return (
    <div className="flex flex-col gap-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2.5 rounded-lg bg-white/5 text-emerald-400">
          <Music size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Music</h1>
          <p className="text-sm text-zinc-400">
            Produce Kafka messages and watch the live topic log.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="glass border-white/10 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus size={18} className="text-emerald-400" />
                Add music
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMusic} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-500">Title (optional)</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Track name"
                    className="bg-zinc-950/50 border-white/10 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-500">URL</label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="bg-zinc-950/50 border-white/10 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {sending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  Send to Kafka
                </Button>

                <p className="text-xs text-zinc-500">
                  Each click produces a new message — you can send the same URL
                  multiple times.
                </p>

                {lastStatus && (
                  <p className="text-xs text-emerald-400">
                    {lastStatus} · total sends: {sendCount}
                  </p>
                )}
                {sendError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    {sendError}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-white/10 bg-zinc-900/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Radio size={18} className="text-sky-400" />
                Kafka log
              </CardTitle>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs ${
                    streamStatus === "connected"
                      ? "text-emerald-400"
                      : streamStatus === "error"
                        ? "text-red-400"
                        : "text-amber-400"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      streamStatus === "connected"
                        ? "bg-emerald-400"
                        : streamStatus === "error"
                          ? "bg-red-400"
                          : "bg-amber-400 animate-pulse"
                    }`}
                  />
                  {streamStatus}
                  {streamTopic ? ` · ${streamTopic}` : ""}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setLogs([])}
                  className="text-zinc-500 hover:text-white"
                  title="Clear log"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {streamError && (
                <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  {streamError}
                </p>
              )}
              <div className="h-[420px] overflow-y-auto rounded-md border border-white/5 bg-zinc-950/80 p-3 font-mono text-xs">
                {logs.length === 0 ? (
                  <p className="text-zinc-600">
                    Waiting for messages on the Kafka topic…
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {logs.map((entry) => (
                      <div
                        key={entry.id}
                        className="border-b border-white/5 pb-3 last:border-0"
                      >
                        <div className="text-zinc-500 mb-1">
                          [{entry.receivedAt}] {entry.topic} p{entry.partition} #
                          {entry.offset}
                        </div>
                        <pre className="whitespace-pre-wrap break-all text-zinc-200">
                          {formatValue(entry.value)}
                        </pre>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
