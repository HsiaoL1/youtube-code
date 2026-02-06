import { useQuery } from '@tanstack/react-query';
import { feedApi } from '@/lib/api/client';

export function useHomeFeed(category: string) {
  return useQuery({
    queryKey: ['feed', 'home', category],
    queryFn: () => feedApi.home(category)
  });
}

export function useTrendingFeed() {
  return useQuery({
    queryKey: ['feed', 'trending'],
    queryFn: feedApi.trending
  });
}

export function useSubscriptionsFeed() {
  return useQuery({
    queryKey: ['feed', 'subscriptions'],
    queryFn: feedApi.subscriptions
  });
}
