import { redis } from './redis';

export const cache = {
  async get<T = any>(key: string): Promise<T | null> {
    const raw = await redis.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return raw as T; // fallback for strings
    }
  },

  async set(key: string, value: any, ttlSeconds: number) {
    const toStore = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.set(key, toStore, 'EX', ttlSeconds);
  },

  async getOrSet<T = any>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  },
};
