/**
 * useOfflineCache
 *
 * A thin wrapper around localStorage that caches entity list results.
 * When online, fresh data is fetched and stored; when offline (or on error),
 * the cached copy is returned so users can still read content.
 *
 * Usage:
 *   const { data, isLoading, isOffline } = useOfflineCache("journal", fetcher);
 */
import { useState, useEffect, useRef, useCallback } from "react";

const CACHE_PREFIX = "aura_cache_";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Storage quota exceeded — skip silently
  }
}

export function useOfflineCache(cacheKey, fetcher, deps = []) {
  const [data, setData] = useState(() => readCache(cacheKey) ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const fresh = await fetcher();
      if (!mountedRef.current) return;
      setData(fresh);
      setIsOffline(false);
      writeCache(cacheKey, fresh);
    } catch {
      if (!mountedRef.current) return;
      const cached = readCache(cacheKey);
      if (cached) {
        setData(cached);
        setIsOffline(true);
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [cacheKey, fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, isLoading, isOffline, refetch: load };
}

/** Persist a single write through to cache and optimistically update state */
export function updateCache(cacheKey, updater) {
  const cached = readCache(cacheKey);
  if (!cached) return;
  writeCache(cacheKey, updater(cached));
}