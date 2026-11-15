"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DownloadType = "YoutubeLink" | "Website";
type MediaType = "Music" | "Video" | "Movie";

export function GeneralDownloadsPageClient() {
  const [fileUrl, setFileUrl] = useState("");
  const [downloadType, setDownloadType] = useState<DownloadType>("YoutubeLink");
  const [name, setName] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("Music");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [album, setAlbum] = useState("");
  const [artist, setArtist] = useState("");

  const handleBeginDownload = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      file_url: fileUrl.trim(),
      downloadType,
      name: name.trim(),
      mediaType,
      ...(mediaType === "Music"
        ? {
            thumbnail_url: thumbnailUrl.trim(),
            album: album.trim(),
            artist: artist.trim(),
          }
        : {}),
    };

    console.log(payload);
  };

  const fieldClass =
    "w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-sky-500";

  return (
    <div className="flex flex-col gap-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2.5 rounded-lg bg-white/5 text-sky-400">
          <Download size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">General Downloads</h1>
          <p className="text-sm text-zinc-400">
            Start a general download for YouTube or website sources.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="max-w-2xl"
      >
        <Card className="glass border-white/10 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus size={18} className="text-sky-400" />
              New general download
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleBeginDownload}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  File URL
                </label>
                <Input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="bg-zinc-950/50 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Download type
                </label>
                <select
                  value={downloadType}
                  onChange={(e) =>
                    setDownloadType(e.target.value as DownloadType)
                  }
                  className={fieldClass}
                  required
                >
                  <option value="YoutubeLink">YoutubeLink</option>
                  <option value="Website">Website</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name"
                  required
                  className="bg-zinc-950/50 border-white/10 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Media type
                </label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as MediaType)}
                  className={fieldClass}
                  required
                >
                  <option value="Music">Music</option>
                  <option value="Video">Video</option>
                  <option value="Movie">Movie</option>
                </select>
              </div>

              {mediaType === "Music" && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Thumbnail URL
                    </label>
                    <Input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-zinc-950/50 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Album
                    </label>
                    <Input
                      value={album}
                      onChange={(e) => setAlbum(e.target.value)}
                      placeholder="Album name"
                      className="bg-zinc-950/50 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Artist
                    </label>
                    <Input
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="Artist name"
                      className="bg-zinc-950/50 border-white/10 text-white"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex justify-end mt-2">
                <Button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white"
                >
                  <Download size={16} />
                  Begin download
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
