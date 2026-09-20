"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  Loader2,
  Key,
  Zap,
  AlertCircle,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CacheEntry {
  key: string;
  value: string;
  ttl?: number;
}

interface RedisStatusResponse {
  connected: boolean;
  target: string;
  source: "redis_server" | "fallback";
  keysCount: number;
  keys: CacheEntry[];
  error?: string;
}

export default function RedisPage() {
  const [data, setData] = useState<RedisStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newTtl, setNewTtl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchRedis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/redis");
      const json: RedisStatusResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch Redis data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedis();
  }, []);

  const handleSetKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || newValue === "") return;

    setSubmitting(true);
    try {
      await fetch("/api/redis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newKey,
          value: newValue,
          ttl: newTtl ? parseInt(newTtl, 10) : undefined,
        }),
      });
      setNewKey("");
      setNewValue("");
      setNewTtl("");
      setShowAddForm(false);
      await fetchRedis();
    } catch (err) {
      console.error("Failed to set key:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!confirm(`Delete key "${key}" from Redis?`)) return;

    try {
      await fetch(`/api/redis?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      await fetchRedis();
    } catch (err) {
      console.error("Failed to delete key:", err);
    }
  };

  const filteredKeys =
    data?.keys?.filter(
      (item) =>
        item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.value.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Database className="text-red-400" size={32} />
            Redis Cache Manager
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Server-side Redis Client integration for in-memory caching, sessions, and rate-limiting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchRedis}
            variant="outline"
            className="border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-600 hover:bg-red-500 text-white font-medium"
          >
            <Plus size={16} className="mr-2" />
            Set Key Value
          </Button>
        </div>
      </div>

      {/* Connection Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Database size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  Server-side Redis Connection
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                  ioredis
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                URL: <code className="text-red-300 font-mono">{data?.target || "redis://localhost:6379"}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data?.connected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <Zap size={14} />
                Live Redis Connected
              </div>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium"
                title={data?.error}
              >
                <AlertCircle size={14} />
                Redis Ready (Server Fallback Mode)
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Add Key Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-red-500/20 bg-red-950/20 p-6 backdrop-blur-md"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Key size={18} className="text-red-400" />
            Set Redis Key-Value Pair
          </h3>
          <form onSubmit={handleSetKey} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Key</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. app:config:theme"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Value</label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. dark"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">TTL (Seconds, optional)</label>
              <input
                type="number"
                value={newTtl}
                onChange={(e) => setNewTtl(e.target.value)}
                placeholder="e.g. 3600"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
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
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                {submitting ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                Execute SET Command
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filter and Key List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/10 rounded-lg px-3 py-2">
          <Search size={16} className="text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Redis keys or values..."
            className="bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none w-full"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-zinc-400">
            <Loader2 className="animate-spin mr-2" size={24} />
            Loading Redis keys...
          </div>
        ) : filteredKeys.length === 0 ? (
          <Card className="glass border-white/10 text-center p-8 text-zinc-400">
            No keys match your query. Click "Set Key Value" to add one.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/40">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-white/5 text-xs text-zinc-400 uppercase border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Key</th>
                  <th className="py-3.5 px-4 font-semibold">Value</th>
                  <th className="py-3.5 px-4 font-semibold">TTL</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredKeys.map((item) => (
                  <tr key={item.key} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-red-300">
                      {item.key}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 max-w-md truncate">
                      {item.value}
                    </td>
                    <td className="py-3 px-4">
                      {item.ttl ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock size={12} />
                          {item.ttl}s
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono">No Expiry</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        onClick={() => handleDeleteKey(item.key)}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
