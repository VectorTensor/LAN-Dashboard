import Redis from 'ioredis';

export interface CacheEntry {
  key: string;
  value: string;
  ttl?: number; // seconds
}

export interface RedisStatusResponse {
  connected: boolean;
  target: string;
  source: 'redis_server' | 'fallback';
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

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Prevent multiple instances of Redis client in Next.js development hot reloading
const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

// Local fallback in-memory cache when Redis server is offline
const fallbackStore = new Map<string, { value: string; expiresAt?: number }>([
  ['sys:status', { value: 'OPERATIONAL' }],
  ['cache:session:user_1', { value: '{"id":"usr_101","role":"admin"}', expiresAt: Date.now() + 3600000 }],
  ['rate_limit:ip:127.0.0.1', { value: '42', expiresAt: Date.now() + 60000 }],
  ['config:feature_flags', { value: '{"betaDownloads":true,"grpcCompression":true}' }],
]);

function createRedisInstance(): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 1500,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      // Don't keep retrying continuously if Redis is down
      if (times > 2) return null;
      return Math.min(times * 200, 1000);
    },
  });

  client.on('error', (err) => {
    // Suppress unhandled error log floods when offline
    console.warn(`[Redis Client Warning] (${REDIS_URL}): ${err.message}`);
  });

  return client;
}

export function getRedisClient(): Redis {
  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = createRedisInstance();
  }
  return globalForRedis.redisClient;
}

export async function fetchRedisData(): Promise<RedisStatusResponse> {
  const client = getRedisClient();
  const target = REDIS_URL;

  try {
    if (client.status === 'wait') {
      await client.connect();
    }

    const pingResult = await client.ping();
    if (pingResult !== 'PONG') {
      throw new Error('Unexpected PONG response');
    }

    // Server is live
    const allKeys = await client.keys('*');
    const entries: CacheEntry[] = [];

    for (const key of allKeys.slice(0, 50)) {
      const val = await client.get(key);
      const ttl = await client.ttl(key);
      entries.push({
        key,
        value: val || '',
        ttl: ttl > 0 ? ttl : undefined,
      });
    }

    // Optional server info
    let infoParsed: any = {};
    try {
      const rawInfo = await client.info();
      const versionMatch = rawInfo.match(/redis_version:(.+)/);
      const memoryMatch = rawInfo.match(/used_memory_human:(.+)/);
      const clientsMatch = rawInfo.match(/connected_clients:(.+)/);
      const uptimeMatch = rawInfo.match(/uptime_in_days:(.+)/);

      infoParsed = {
        redisVersion: versionMatch ? versionMatch[1].trim() : '7.x',
        usedMemoryHuman: memoryMatch ? memoryMatch[1].trim() : 'N/A',
        connectedClients: clientsMatch ? parseInt(clientsMatch[1].trim()) : 1,
        uptimeInDays: uptimeMatch ? parseInt(uptimeMatch[1].trim()) : 0,
      };
    } catch {
      infoParsed = { redisVersion: 'Connected' };
    }

    return {
      connected: true,
      target,
      source: 'redis_server',
      keysCount: allKeys.length,
      keys: entries,
      info: infoParsed,
    };
  } catch (err: any) {
    // Graceful fallback when Redis server is down
    const fallbackEntries: CacheEntry[] = [];
    const now = Date.now();

    fallbackStore.forEach((item, key) => {
      if (!item.expiresAt || item.expiresAt > now) {
        fallbackEntries.push({
          key,
          value: item.value,
          ttl: item.expiresAt ? Math.round((item.expiresAt - now) / 1000) : undefined,
        });
      }
    });

    return {
      connected: false,
      target,
      source: 'fallback',
      keysCount: fallbackEntries.length,
      keys: fallbackEntries,
      error: err?.message || 'Redis server unreachable at ' + target,
    };
  }
}

export async function setRedisKey(key: string, value: string, ttlSeconds?: number): Promise<{ success: boolean; source: string }> {
  const client = getRedisClient();

  try {
    if (client.status === 'wait') {
      await client.connect();
    }
    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, value, 'EX', ttlSeconds);
    } else {
      await client.set(key, value);
    }
    return { success: true, source: 'redis_server' };
  } catch {
    // Update local fallback store
    fallbackStore.set(key, {
      value,
      expiresAt: ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : undefined,
    });
    return { success: true, source: 'fallback' };
  }
}

export async function deleteRedisKey(key: string): Promise<{ success: boolean; source: string }> {
  const client = getRedisClient();

  try {
    if (client.status === 'wait') {
      await client.connect();
    }
    await client.del(key);
    fallbackStore.delete(key);
    return { success: true, source: 'redis_server' };
  } catch {
    fallbackStore.delete(key);
    return { success: true, source: 'fallback' };
  }
}
