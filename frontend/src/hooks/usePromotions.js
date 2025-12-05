import { publicAPI } from '../services/api';
import useApiCache from './useApiCache';

export const usePromotions = () => {
  // Cache promotions API call with 10 minutes TTL (promotions change less frequently)
  const { data, loading, error } = useApiCache(
    (signal) => publicAPI.promotions.getAll(signal),
    ['promotions', 'all'],
    { ttl: 10 * 60 * 1000 } // 10 minutes
  );

  return { 
    promotionsData: data || [], 
    loading, 
    error: error?.message || null 
  };
};
