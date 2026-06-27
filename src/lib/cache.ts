/**
 * Minimal cache-aside helper.
 *
 * - Local/dev: in-memory Map with TTL (zero setup).
 * - Production: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to use
 *   serverless Redis over HTTP (works on Vercel). No extra npm dependency.
 *
 * This is the read-path "Redis cache-aside" layer from the plan: check cache
 * first, fall back to the source on a miss, then write the result back.
 */

type Entry = { value: unknown; expiresAt: number };
const memory = new Map<string, Entry>();

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(REST_URL && REST_TOKEN);

async function redisGet(key: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${REST_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REST_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: string | null };
    return data.result ? JSON.parse(data.result) : null;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: unknown, ttl: number): Promise<void> {
  try {
    await fetch(
      `${REST_URL}/set/${encodeURIComponent(key)}?EX=${ttl}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REST_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(JSON.stringify(value)),
      }
    );
  } catch {
    // best-effort cache; ignore failures
  }
}

/** Remove all cache entries whose key starts with the given prefix. */
export function invalidateByPrefix(prefix: string): void {
  for (const key of memory.keys()) {
    if (key.startsWith(prefix)) memory.delete(key);
  }
}

/** Get a value from cache or compute, store, and return it. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<T> {
  if (useRedis) {
    const hit = (await redisGet(key)) as T | null;
    if (hit !== null) return hit;
    const value = await compute();
    await redisSet(key, value, ttlSeconds);
    return value;
  }

  const now = Date.now();
  const entry = memory.get(key);
  if (entry && entry.expiresAt > now) return entry.value as T;

  const value = await compute();
  memory.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
  return value;
}
