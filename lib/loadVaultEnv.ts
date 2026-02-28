// lib/loadVaultEnv.ts
import fs from "fs";
import path from "path";

/**
 * Load all Vault-injected secrets from a directory into process.env
 * @param dir Directory where Vault injects secrets (default: /secrets)
 */
export function loadVaultEnv(dir: string = "/secrets"): void {
  if (!fs.existsSync(dir)) {
    console.warn(`Vault secrets directory "${dir}" does not exist`);
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      const value = fs.readFileSync(filePath, "utf8").trim();
      process.env[file] = value;
    }
  });
}
