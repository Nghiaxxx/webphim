import { useState, useEffect, useRef } from 'react';

/**
 * Simple in-memory cache for API responses
 * Cache expires after specified TTL (time to live) in milliseconds
 */
const cache = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

/**
 * Custom hook for caching API responses
 * @param {Function} apiCall - Function that returns a Promise
 * @param {Array} dependencies - Array of dependencies for the API call (like query params)
 * @param {Object} options - Options object
 * @param {number} options.ttl - Time to live in milliseconds (default: 5 minutes)
 * @param {boolean} options.enabled - Whether to enable caching (default: true)
 * @returns {Object} { data, loading, error, refetch }
 */
const useApiCache = (apiCall, dependencies = [], options = {}) => {
  const { ttl = DEFAULT_TTL, enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const apiCallRef = useRef(apiCall);

  // Store latest apiCall in ref to avoid stale closures
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);

  // Create cache key from dependencies
  const cacheKey = JSON.stringify(dependencies);

  useEffect(() => {
    // Cancel previous request if component unmounts or dependencies change
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    if (enabled && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      const now = Date.now();

      // Check if cache is still valid
      if (now - cached.timestamp < ttl) {
        setData(cached.data);
        setLoading(false);
        setError(null);
        return;
      } else {
        // Cache expired, remove it
        cache.delete(cacheKey);
      }
    }

    // Fetch new data
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    // Call API with abort signal using ref to get latest apiCall
    const fetchPromise = apiCallRef.current(abortControllerRef.current.signal);
    
    fetchPromise
      .then((response) => {
        if (!abortControllerRef.current?.signal.aborted) {
          setData(response);
          setError(null);

          // Cache the response
          if (enabled) {
            cache.set(cacheKey, {
              data: response,
              timestamp: Date.now(),
            });
          }
        }
      })
      .catch((err) => {
        // Don't set error if request was aborted
        if (err.name === 'AbortError') {
          return;
        }
        if (!abortControllerRef.current?.signal.aborted) {
          setError(err);
          setData(null);
        }
      })
      .finally(() => {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cacheKey, ttl, enabled]);

  // Function to manually refetch data
  const refetch = () => {
    // Clear cache for this key
    if (enabled && cache.has(cacheKey)) {
      cache.delete(cacheKey);
    }

    // Force refetch
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    apiCallRef.current(abortControllerRef.current.signal)
      .then((response) => {
        if (!abortControllerRef.current.signal.aborted) {
          setData(response);
          setError(null);

          if (enabled) {
            cache.set(cacheKey, {
              data: response,
              timestamp: Date.now(),
            });
          }
        }
      })
      .catch((err) => {
        if (!abortControllerRef.current.signal.aborted) {
          setError(err);
        }
      })
      .finally(() => {
        if (!abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      });
  };

  return { data, loading, error, refetch };
};

/**
 * Clear all cache or specific cache entry
 */
export const clearCache = (cacheKey = null) => {
  if (cacheKey) {
    cache.delete(JSON.stringify(cacheKey));
  } else {
    cache.clear();
  }
};

export default useApiCache;

