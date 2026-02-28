import type { NextConfig } from "next";
import { loadVaultEnv } from "./lib/loadVaultEnv";
loadVaultEnv("/vault/secrets");

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
