import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shortsApi } from '@/lib/api/client';

export function useShortsList() {
  return useQuery({ queryKey: ['shorts'], queryFn: shortsApi.list });
}

export function useLikeShort() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shortsApi.like(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shorts'] })
  });
}
