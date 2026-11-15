import Redis from 'ioredis';

let redis: Redis | null = null;

// On Vercel (serverless) there is no localhost Redis. If REDIS_URL is not set,
// return a stub whose methods fail immediately, so every caller's existing
// try/catch falls through to the live-fetch path without waiting on a dead
// localhost connection.
const REDIS_DISABLED = !!process.env.VERCEL && !process.env.REDIS_URL;

function disabledRedis(): Redis {
  return new Proxy({}, {
    get(_t, prop) {
      if (prop === 'then' || typeof prop === 'symbol') return undefined;
      return () => { throw new Error('Redis not configured'); };
    },
  }) as unknown as Redis;
}

export function getRedis(): Redis {
  if (REDIS_DISABLED) return disabledRedis();
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      lazyConnect: false,
      maxRetriesPerRequest: 2,
    });
  }
  return redis;
}
