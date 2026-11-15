import { GeneralDownloadsShell } from "./general-downloads-shell";

export default function GeneralDownloadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GeneralDownloadsShell>{children}</GeneralDownloadsShell>;
}
