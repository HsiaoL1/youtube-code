import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { videoApi } from '@/lib/api/client';

export function useVideoDetail(id: string) {
  return useQuery({ queryKey: ['video', id], queryFn: () => videoApi.detail(id) });
}

export function useRecommendations(id: string) {
  return useQuery({ queryKey: ['video', id, 'recommend'], queryFn: () => videoApi.recommendations(id) });
}

export function useLikeVideo(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => videoApi.like(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video', id] })
  });
}
