import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studioApi } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VideoCard } from '@/components/common/video-card';
import type { ContentStatus } from '@/types';

const uploadSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  tags: z.string().optional(),
  category: z.string().min(1),
  visibility: z.enum(['public', 'unlisted', 'private']),
  scheduleAt: z.string().optional(),
  coverUrl: z.string().optional()
});

type UploadInput = z.infer<typeof uploadSchema>;

export function StudioOverviewPage() {
  const q = useQuery({ queryKey: ['studio', 'overview'], queryFn: studioApi.overview });
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(q.data?.cards ?? []).map((card) => (
          <Card key={card.label}><CardHeader><CardTitle>{card.label}</CardTitle></CardHeader><CardContent>{card.value}</CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {(q.data?.latest ?? []).map((item) => <VideoCard key={item.id} video={item} />)}
      </div>
    </section>
  );
}

export function StudioUploadPage() {
  const qc = useQueryClient();
  const form = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: localStorage.getItem('draft:title') ?? '',
      description: localStorage.getItem('draft:description') ?? '',
      tags: '',
      category: 'Tech',
      visibility: 'public',
      scheduleAt: '',
      coverUrl: ''
    }
  });

  const coverUrl = form.watch('coverUrl');

  const upload = useMutation({
    mutationFn: (values: UploadInput) =>
      studioApi.upload({
        ...values,
        tags: values.tags?.split(',').map((x) => x.trim()) ?? [],
        status: values.scheduleAt ? 'draft' : 'reviewing'
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
      localStorage.removeItem('draft:title');
      localStorage.removeItem('draft:description');
      form.reset();
    }
  });

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader><CardTitle>上传视频</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={form.handleSubmit((v) => upload.mutate(v))}>
            <Input placeholder="标题" {...form.register('title')} onBlur={(e) => localStorage.setItem('draft:title', e.target.value)} />
            <Textarea placeholder="简介" {...form.register('description')} onBlur={(e) => localStorage.setItem('draft:description', e.target.value)} />
            <Input placeholder="封面URL（mock）" {...form.register('coverUrl')} />
            <Input placeholder="标签，逗号分隔" {...form.register('tags')} />
            <Input placeholder="分类" {...form.register('category')} />
            <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" {...form.register('visibility')}>
              <option value="public">公开</option>
              <option value="unlisted">不公开列出</option>
              <option value="private">私密</option>
            </select>
            <Input type="datetime-local" {...form.register('scheduleAt')} />
            <Button type="submit" disabled={upload.isPending}>提交（mock）</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>封面预览</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border p-2">
            {coverUrl ? <img src={coverUrl} className="aspect-video w-full rounded object-cover" /> : <p className="text-sm text-muted-foreground">暂无封面</p>}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function StudioContentPage() {
  const [status, setStatus] = useState('all');
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['studio', 'content', status], queryFn: () => studioApi.content(status) });
  const mutate = useMutation({
    mutationFn: ({ id, next }: { id: string; next: ContentStatus }) => studioApi.update(id, { status: next }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['studio', 'content'] })
  });

  return (
    <section className="space-y-3">
      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="all">全部</option>
        <option value="published">已发布</option>
        <option value="reviewing">审核中</option>
        <option value="rejected">驳回</option>
        <option value="draft">草稿</option>
      </select>
      <div className="space-y-2">
        {(q.data?.items ?? []).map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">状态：{item.status}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => mutate.mutate({ id: item.id, next: 'draft' })}>下架</Button>
              <Button size="sm" onClick={() => mutate.mutate({ id: item.id, next: 'published' })}>发布</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StudioLivePage() {
  const [on, setOn] = useState(false);
  const q = useQuery({ queryKey: ['live', 'list'], queryFn: () => studioApi.content('published') });
  return (
    <section className="space-y-4">
      <Card><CardContent className="pt-4"><p>推流地址：rtmp://mock/live/stream-key-xxx</p><p>推流码：mock-key-1234</p></CardContent></Card>
      <Button onClick={() => setOn((v) => !v)}>{on ? '停播' : '开播'}</Button>
      <div className="space-y-2">
        {q.data?.items.slice(0, 3).map((v) => <div key={v.id} className="rounded border p-2 text-sm">回放：{v.title}</div>)}
      </div>
    </section>
  );
}

export function StudioCommentsPage() {
  const q = useQuery({ queryKey: ['studio', 'comments'], queryFn: studioApi.comments });
  return (
    <section className="space-y-3">
      {(q.data?.items as any[] | undefined)?.map((item) => (
        <div key={item.id} className="rounded-lg border p-3">
          <p className="text-sm"><span className="font-medium">{item.author.name}</span>: {item.content}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline">回复</Button>
            <Button size="sm" variant="outline">置顶</Button>
          </div>
        </div>
      ))}
    </section>
  );
}

export function StudioSettingsPage() {
  return (
    <section className="max-w-xl space-y-3">
      <Input placeholder="频道名称" defaultValue="Creator Channel" />
      <Input placeholder="头像 URL" defaultValue="https://i.pravatar.cc/120?img=24" />
      <Input placeholder="横幅 URL" defaultValue="https://picsum.photos/seed/banner/1200/320" />
      <Textarea placeholder="频道简介" defaultValue="Build products and ship fast." />
      <Button>保存设置</Button>
    </section>
  );
}
