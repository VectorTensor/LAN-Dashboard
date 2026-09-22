import { createClient } from "redis";
import { getSecret } from "@/lib/loadSecrets";

export interface CacheEntry {
  key: string;
  value: string;
  ttl?: number;
}

export interface RedisStatusResponse {
  connected: boolean;
  target: string;
  source: "redis_server" | "fallback";
  keysCount: number;
  keys: CacheEntry[];
  error?: string;
  info?: {
    redisVersion?: string;
    usedMemoryHuman?: string;
    connectedClients?: number;
    uptimeInDays?: number;
  };
}

type RedisClientType = ReturnType<typeof createClient>;

let redisInstance: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisInstance) {
    const redisUrl = getSecret("CFG_REDIS_URL") || process.env.REDIS_URL || "redis://localhost:6379";
    redisInstance = createClient({
      url: redisUrl,
    });
    redisInstance.on("error", (err) => {
      console.warn("[Redis Client Warning]:", err?.message || err);
    });
  }
  if (!redisInstance.isOpen) {
    await redisInstance.connect();
  }
  return redisInstance;
}

export async function getKey(key: string): Promise<string | null> {
  const client = await getRedisClient();
  return client.get(key);
}

export async function setKey(key: string, value: string): Promise<void> {
  const client = await getRedisClient();
  await client.set(key, value);
}

export async function getList(key: string): Promise<string[]> {
  const client = await getRedisClient();
  return client.lRange(key, 0, -1);
}

export async function addToList(key: string, ...items: string[]): Promise<void> {
  if (items.length === 0) return;
  const client = await getRedisClient();
  await client.rPush(key, items);
}

export async function removeFromList(key: string, item: string): Promise<void> {
  const client = await getRedisClient();
  await client.lRem(key, 1, item);
}

// Support for Redis dashboard API
export async function fetchRedisData(): Promise<RedisStatusResponse> {
  const target = getSecret("CFG_REDIS_URL") || process.env.REDIS_URL || "redis://localhost:6379";
  try {
    const client = await getRedisClient();
    const pingResult = await client.ping();
    if (pingResult !== "PONG") {
      throw new Error("Unexpected PONG response");
    }

    const allKeys = await client.keys("*");
    const entries: CacheEntry[] = [];

    for (const key of allKeys.slice(0, 50)) {
      const val = await client.get(key);
      const ttl = await client.ttl(key);
      entries.push({
        key,
        value: val || "",
        ttl: ttl > 0 ? ttl : undefined,
      });
    }

    return {
      connected: true,
      target,
      source: "redis_server",
      keysCount: allKeys.length,
      keys: entries,
    };
  } catch (err: any) {
    return {
      connected: false,
      target,
      source: "fallback",
      keysCount: 0,
      keys: [],
      error: err?.message || "Redis server unreachable at " + target,
    };
  }
}

export async function setRedisKey(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<{ success: boolean; source: string }> {
  try {
    const client = await getRedisClient();
    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, value, { EX: ttlSeconds });
    } else {
      await client.set(key, value);
    }
    return { success: true, source: "redis_server" };
  } catch {
    return { success: false, source: "fallback" };
  }
}

export async function deleteRedisKey(
  key: string
): Promise<{ success: boolean; source: string }> {
  try {
    const client = await getRedisClient();
    await client.del(key);
    return { success: true, source: "redis_server" };
  } catch {
    return { success: false, source: "fallback" };
  }
}