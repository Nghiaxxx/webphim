import { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';
import useApiCache from './useApiCache';

export const useMovies = () => {
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);

  // Cache API calls with 5 minutes TTL
  const { data: nowShowingData, loading: loadingNowShowing } = useApiCache(
    (signal) => publicAPI.movies.getAll('now_showing', signal),
    ['movies', 'now_showing'],
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );

  const { data: comingSoonData, loading: loadingComingSoon } = useApiCache(
    (signal) => publicAPI.movies.getAll('coming_soon', signal),
    ['movies', 'coming_soon'],
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );

  const { data: allMoviesData, loading: loadingAll } = useApiCache(
    (signal) => publicAPI.movies.getAll(undefined, signal),
    ['movies', 'all'],
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );

  useEffect(() => {
    // If we have status-based data, use it
    if (nowShowingData !== null && comingSoonData !== null) {
      if ((nowShowingData && nowShowingData.length > 0) || (comingSoonData && comingSoonData.length > 0)) {
        setNowShowingMovies(nowShowingData || []);
        setComingSoonMovies(comingSoonData || []);
        return;
      }
    }

    // Fallback: if no status-based data, use all movies and split
    if (allMoviesData && allMoviesData.length > 0) {
      setNowShowingMovies(allMoviesData.slice(0, 4));
      setComingSoonMovies(allMoviesData.slice(4));
    }
  }, [nowShowingData, comingSoonData, allMoviesData]);

  const loading = loadingNowShowing || loadingComingSoon || loadingAll;

  return { nowShowingMovies, comingSoonMovies, loading };
};
