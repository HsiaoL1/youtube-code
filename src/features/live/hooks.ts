import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { liveApi } from '@/lib/api/client';

export function useLiveList(category: string) {
  return useQuery({ queryKey: ['live', category], queryFn: () => liveApi.list(category) });
}

export function useLiveDetail(id: string) {
  return useQuery({ queryKey: ['live', id], queryFn: () => liveApi.detail(id) });
}

export function useLiveChat(id: string) {
  return useQuery({ queryKey: ['live', id, 'chat'], queryFn: () => liveApi.chat(id), refetchInterval: 3000 });
}

export function useStudioToggleLive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => Promise.resolve({ ok: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live'] })
  });
}
