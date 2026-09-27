import { MusicShell } from "./music-shell";

export default function MusicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MusicShell>{children}</MusicShell>;
}
