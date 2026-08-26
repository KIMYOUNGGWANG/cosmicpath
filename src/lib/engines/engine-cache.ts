/**
 * Deterministic Engine In-Memory LRU Cache
 * 생년월일시, 성별, 경도 기반 수학적/천문학적 계산 결과를 메모이제이션하여
 * 중복 계산 시간을 0.05ms 이내로 단축합니다.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class EngineCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;
  private defaultTtlMs: number;

  constructor(maxEntries = 1000, defaultTtlMs = 1000 * 60 * 60) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU ordering
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlMs?: number): void {
    if (this.cache.size >= this.maxEntries) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const globalEngineCache = new EngineCache(1500, 1000 * 60 * 60 * 2); // 2시간 TTL
