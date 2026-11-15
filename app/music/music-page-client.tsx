"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Plus, Loader2, AlertCircle, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MusicPageClient() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendCount, setSendCount] = useState(0);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

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
            Produce Kafka messages for music downloads.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="max-w-xl"
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
    </div>
  );
}
