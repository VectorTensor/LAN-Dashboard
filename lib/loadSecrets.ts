// /utils/getSecret.ts
import fs from 'fs';
import path from 'path';

const secretsFile = '/vault/secrets/config';

interface SecretsMap {
  [key: string]: string;
}

// Load secrets once at startup
const secrets: SecretsMap = {};

if (fs.existsSync(secretsFile)) {
  const content = fs.readFileSync(secretsFile, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return; // skip empty lines or comments

    const [key, ...rest] = trimmed.split('='); // allow '=' in value
    if (key && rest.length > 0) {
      secrets[key.trim()] = rest.join('=').trim();
    }
  });
}

/**
 * Get secret value by key
 * @param key string
 * @returns string | undefined
 */
export function getSecret(key: string): string | undefined {
    const value = key in process.env ? process.env[key] : secrets[key];
    return value;
}
