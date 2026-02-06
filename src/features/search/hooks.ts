import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api/client';

export function useSearch(q: string, tab: string, sort: string) {
  return useQuery({
    queryKey: ['search', q, tab, sort],
    queryFn: () => searchApi.query(q, tab, sort),
    enabled: q.trim().length > 0
  });
}
