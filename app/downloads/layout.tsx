import { DownloadsShell } from "./downloads-shell";

export default function DownloadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DownloadsShell>{children}</DownloadsShell>;
}
