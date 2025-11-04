import { useState, useEffect, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface UseCacheOptions {
  ttl?: number; // Time to live in milliseconds
  key: string;
}

export function useCache<T>(options: UseCacheOptions) {
  const { ttl = 5 * 60 * 1000, key } = options; // Default 5 minutes
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  
  const get = (cacheKey: string): T | null => {
    const entry = cacheRef.current.get(`${key}:${cacheKey}`);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(`${key}:${cacheKey}`);
      return null;
    }
    
    return entry.data;
  };
  
  const set = (cacheKey: string, data: T, customTtl?: number): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl
    };
    
    cacheRef.current.set(`${key}:${cacheKey}`, entry);
  };
  
  const clear = (cacheKey?: string): void => {
    if (cacheKey) {
      cacheRef.current.delete(`${key}:${cacheKey}`);
    } else {
      // Clear all entries for this key prefix
      const keysToDelete = Array.from(cacheRef.current.keys())
        .filter(k => k.startsWith(`${key}:`));
      keysToDelete.forEach(k => cacheRef.current.delete(k));
    }
  };
  
  const has = (cacheKey: string): boolean => {
    return get(cacheKey) !== null;
  };
  
  return { get, set, clear, has };
}

// Helper hook for caching async functions
export function useCachedAsync<T, Args extends readonly unknown[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseCacheOptions & { enabled?: boolean }
) {
  const { enabled = true, ...cacheOptions } = options;
  const cache = useCache<T>(cacheOptions);
  const [loading, setLoading] = useState(false);
  
  const execute = async (...args: Args): Promise<T> => {
    const cacheKey = JSON.stringify(args);
    
    if (enabled) {
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }
    
    setLoading(true);
    try {
      const result = await asyncFn(...args);
      if (enabled) {
        cache.set(cacheKey, result);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  const clearCache = (cacheKey?: string) => {
    cache.clear(cacheKey);
  };
  
  return { execute, loading, clearCache, cache };
}