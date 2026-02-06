import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AdminDashboardPage() {
  const q = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminApi.dashboard });
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {(q.data?.stats ?? []).map((s) => (
        <Card key={s.label}><CardHeader><CardTitle>{s.label}</CardTitle></CardHeader><CardContent>{s.value}</CardContent></Card>
      ))}
    </section>
  );
}

export function AdminContentReviewPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin', 'review'], queryFn: adminApi.reviewQueue });
  const action = useMutation({
    mutationFn: ({ id, act }: { id: string; act: 'approve' | 'reject' | 'take_down' }) => adminApi.reviewAction(id, act),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'review'] })
  });

  return (
    <section className="space-y-3">
      {q.data?.items.map((item) => (
        <div key={item.id} className="rounded-lg border p-3">
          <p className="font-medium">{item.title}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => action.mutate({ id: item.id, act: 'approve' })}>通过</Button>
            <Button size="sm" variant="outline" onClick={() => action.mutate({ id: item.id, act: 'reject' })}>驳回</Button>
            <Button size="sm" variant="destructive" onClick={() => action.mutate({ id: item.id, act: 'take_down' })}>下架</Button>
          </div>
        </div>
      ))}
    </section>
  );
}

export function AdminReportsPage() {
  const q = useQuery({ queryKey: ['admin', 'reports'], queryFn: adminApi.reports });
  return (
    <section className="space-y-2">
      {(q.data?.items as any[] | undefined)?.map((r) => (
        <div key={r.id} className="rounded-lg border p-3 text-sm">
          {r.reason} {'->'} {r.target} ({r.status})
        </div>
      ))}
    </section>
  );
}

export function AdminUsersPage() {
  const q = useQuery({ queryKey: ['admin', 'users'], queryFn: adminApi.users });
  return (
    <section className="space-y-2">
      {(q.data?.items as any[] | undefined)?.map((u) => (
        <div key={u.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
          <span>{u.name} ({u.role})</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">封禁/解封</Button>
            <Button size="sm" variant="outline">切换角色</Button>
          </div>
        </div>
      ))}
    </section>
  );
}
