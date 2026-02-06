import { delay, http, HttpResponse } from 'msw';
import { z } from 'zod';
import {
  authAccounts,
  chapters,
  comments,
  liveRooms,
  playlists,
  users,
  videos
} from './db';
import {
  commentInputSchema,
  loginSchema,
  registerSchema,
  type Comment,
  type User,
  type Video
} from '@/types';

const API = '/api';

const sanitize = (text: string) =>
  text.replace(/(spam|傻瓜|笨蛋)/gi, '***').replace(/@([\w]+)/g, '<@$1>');

const querySort = (list: Video[], sort: string | null) => {
  if (sort === 'latest') return [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  if (sort === 'views') return [...list].sort((a, b) => b.views - a.views);
  return list;
};

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    await delay(350);
    const payload = loginSchema.safeParse(await request.json());
    if (!payload.success) return HttpResponse.json({ message: 'Invalid payload' }, { status: 400 });
    const account = authAccounts.find(
      (a) => a.identifier === payload.data.identifier && a.password === payload.data.password
    );
    if (!account) return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    const user = users.find((u) => u.id === account.userId) ?? null;
    return HttpResponse.json({ user, token: `token-${account.userId}` });
  }),

  http.post(`${API}/auth/register`, async ({ request }) => {
    await delay(500);
    const payload = registerSchema.safeParse(await request.json());
    if (!payload.success) return HttpResponse.json({ message: 'Invalid payload' }, { status: 400 });
    const newUser: User = {
      id: `u${Date.now()}`,
      name: payload.data.name,
      handle: `@${payload.data.handle.replace('@', '')}`,
      avatarUrl: 'https://i.pravatar.cc/120?img=65',
      role: 'user',
      followersCount: 0
    };
    users.push(newUser);
    return HttpResponse.json({ user: newUser, token: `token-${newUser.id}` });
  }),

  http.get(`${API}/auth/me`, async ({ request }) => {
    await delay(250);
    const auth = request.headers.get('authorization');
    if (!auth) return HttpResponse.json({ user: null });
    const id = auth.replace('Bearer token-', '');
    const user = users.find((u) => u.id === id) ?? null;
    return HttpResponse.json({ user });
  }),

  http.post(`${API}/auth/logout`, async () => {
    await delay(180);
    return HttpResponse.json({ ok: true });
  }),

  http.get(`${API}/feed/home`, async ({ request }) => {
    await delay(300);
    const category = new URL(request.url).searchParams.get('category');
    const list = category && category !== 'All' ? videos.filter((v) => v.category === category) : videos;
    return HttpResponse.json({ items: list });
  }),

  http.get(`${API}/feed/trending`, async () => {
    await delay(300);
    const items = [...videos].sort((a, b) => b.views - a.views);
    return HttpResponse.json({ items });
  }),

  http.get(`${API}/feed/subscriptions`, async () => {
    await delay(300);
    return HttpResponse.json({ items: videos.filter((v) => ['u2', 'u4'].includes(v.author.id)) });
  }),

  http.get(`${API}/search`, async ({ request }) => {
    await delay(350);
    const sp = new URL(request.url).searchParams;
    const q = (sp.get('q') ?? '').toLowerCase();
    const tab = sp.get('tab') ?? 'video';
    const sort = sp.get('sort');
    const matchedVideos = querySort(videos.filter((v) => v.title.toLowerCase().includes(q)), sort);
    const matchedChannels = users.filter((u) => u.name.toLowerCase().includes(q));
    return HttpResponse.json({
      videos: matchedVideos.filter((v) => ['long', 'replay'].includes(v.type)),
      shorts: matchedVideos.filter((v) => v.type === 'short'),
      lives: liveRooms.filter((l) => l.title.toLowerCase().includes(q)),
      channels: matchedChannels,
      activeTab: tab
    });
  }),

  http.get(`${API}/videos/:id`, async ({ params }) => {
    await delay(220);
    const video = videos.find((v) => v.id === params.id);
    if (!video) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ video, chapters });
  }),

  http.get(`${API}/videos/:id/recommendations`, async ({ params }) => {
    await delay(220);
    const items = videos.filter((v) => v.id !== params.id);
    return HttpResponse.json({ items });
  }),

  http.post(`${API}/videos/:id/like`, async ({ params }) => {
    const video = videos.find((v) => v.id === params.id);
    if (video) video.likes += 1;
    return HttpResponse.json({ ok: true, likes: video?.likes ?? 0 });
  }),

  http.post(`${API}/videos/:id/favorite`, async () => HttpResponse.json({ ok: true })),

  http.get(`${API}/shorts`, async () => {
    await delay(220);
    return HttpResponse.json({ items: videos.filter((v) => v.type === 'short') });
  }),

  http.post(`${API}/shorts/:id/like`, async ({ params }) => {
    const item = videos.find((v) => v.id === params.id);
    if (item) item.likes += 1;
    return HttpResponse.json({ ok: true, likes: item?.likes ?? 0 });
  }),

  http.post(`${API}/shorts/:id/favorite`, async () => HttpResponse.json({ ok: true })),

  http.get(`${API}/live`, async ({ request }) => {
    await delay(250);
    const category = new URL(request.url).searchParams.get('category');
    const items = category && category !== 'All' ? liveRooms.filter((x) => x.category === category) : liveRooms;
    return HttpResponse.json({ items });
  }),

  http.get(`${API}/live/:id`, async ({ params }) => {
    await delay(220);
    const room = liveRooms.find((x) => x.id === params.id);
    if (!room) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const replay = videos.find((v) => v.id === 'r1');
    return HttpResponse.json({ room, replay });
  }),

  http.get(`${API}/live/:id/chat`, async ({ params }) => {
    await delay(180);
    return HttpResponse.json({
      items: comments
        .filter((c) => c.entityType === 'live' && c.entityId === params.id)
        .map((c) => ({ ...c, content: sanitize(c.content) }))
    });
  }),

  http.get(`${API}/comments`, async ({ request }) => {
    await delay(220);
    const sp = new URL(request.url).searchParams;
    const entityId = sp.get('entityId');
    const entityType = sp.get('entityType');
    const items = comments.filter((c) => c.entityId === entityId && c.entityType === entityType);
    return HttpResponse.json({ items });
  }),

  http.post(`${API}/comments`, async ({ request }) => {
    await delay(220);
    const body = (await request.json()) as Partial<Comment> & { currentUserId?: string };
    const parsed = commentInputSchema.safeParse({ content: body.content });
    if (!parsed.success) return HttpResponse.json({ message: 'Invalid comment' }, { status: 400 });
    const author = users.find((u) => u.id === body.currentUserId) ?? users[0];
    const item: Comment = {
      id: `c${Date.now()}`,
      entityType: (body.entityType as Comment['entityType']) ?? 'video',
      entityId: body.entityId ?? '',
      author,
      content: sanitize(parsed.data.content),
      createdAt: new Date().toISOString(),
      likeCount: 0,
      parentId: body.parentId
    };
    comments.unshift(item);
    return HttpResponse.json({ item });
  }),

  http.delete(`${API}/comments/:id`, async ({ params }) => {
    const idx = comments.findIndex((c) => c.id === params.id);
    if (idx >= 0) comments.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${API}/comments/:id/like`, async ({ params }) => {
    const item = comments.find((c) => c.id === params.id);
    if (item) item.likeCount += 1;
    return HttpResponse.json({ ok: true, likeCount: item?.likeCount ?? 0 });
  }),

  http.get(`${API}/channel/:id`, async ({ params }) => {
    const channel = users.find((u) => u.id === params.id);
    if (!channel) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const content = videos.filter((v) => v.author.id === channel.id);
    return HttpResponse.json({ channel, content });
  }),

  http.get(`${API}/playlists/:id`, async ({ params }) => {
    const playlist = playlists.find((p) => p.id === params.id);
    if (!playlist) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ playlist });
  }),

  http.get(`${API}/studio/overview`, async () => {
    await delay(280);
    return HttpResponse.json({
      cards: [
        { label: 'Views', value: '1.3M' },
        { label: 'Followers', value: '98K' },
        { label: 'Revenue', value: '$12,540' }
      ],
      latest: videos.slice(0, 3)
    });
  }),

  http.get(`${API}/studio/content`, async ({ request }) => {
    await delay(250);
    const status = new URL(request.url).searchParams.get('status');
    const items = status && status !== 'all' ? videos.filter((v) => v.status === status) : videos;
    return HttpResponse.json({ items });
  }),

  http.post(`${API}/studio/upload`, async ({ request }) => {
    await delay(380);
    const payload = (await request.json()) as Partial<Video>;
    const item: Video = {
      id: `v${Date.now()}`,
      type: 'long',
      title: payload.title ?? 'Untitled',
      description: payload.description ?? '',
      coverUrl: payload.coverUrl ?? 'https://picsum.photos/seed/upload/640/360',
      duration: 0,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      author: users[1],
      tags: payload.tags ?? [],
      category: payload.category ?? 'Tech',
      visibility: payload.visibility ?? 'public',
      status: payload.status ?? 'reviewing'
    };
    videos.unshift(item);
    return HttpResponse.json({ item });
  }),

  http.patch(`${API}/studio/content/:id`, async ({ params, request }) => {
    const payload = (await request.json()) as Partial<Video>;
    const item = videos.find((v) => v.id === params.id);
    if (item) Object.assign(item, payload);
    return HttpResponse.json({ item });
  }),

  http.post(`${API}/studio/live/toggle`, async () => HttpResponse.json({ ok: true })),

  http.get(`${API}/studio/comments`, async () => {
    return HttpResponse.json({ items: comments.filter((c) => c.entityType === 'video') });
  }),

  http.get(`${API}/admin/dashboard`, async () => {
    await delay(280);
    return HttpResponse.json({
      stats: [
        { label: 'Pending Reviews', value: 18 },
        { label: 'Reports Open', value: 27 },
        { label: 'Active Creators', value: 342 }
      ]
    });
  }),

  http.get(`${API}/admin/review-queue`, async () => {
    return HttpResponse.json({ items: videos.filter((v) => ['reviewing', 'rejected'].includes(v.status)) });
  }),

  http.post(`${API}/admin/review-queue/:id/action`, async ({ params, request }) => {
    const { action } = z.object({ action: z.enum(['approve', 'reject', 'take_down']) }).parse(await request.json());
    const item = videos.find((v) => v.id === params.id);
    if (item) {
      item.status = action === 'approve' ? 'published' : action === 'reject' ? 'rejected' : 'draft';
    }
    return HttpResponse.json({ ok: true, item });
  }),

  http.get(`${API}/admin/reports`, async () => {
    return HttpResponse.json({
      items: [
        { id: 'rp1', reason: 'Copyright', target: 'v2', status: 'open' },
        { id: 'rp2', reason: 'Harassment', target: 'c3', status: 'processing' }
      ]
    });
  }),

  http.post(`${API}/admin/reports/:id/action`, async () => HttpResponse.json({ ok: true })),

  http.get(`${API}/admin/users`, async () => {
    return HttpResponse.json({ items: users.map((u) => ({ ...u, banned: false })) });
  }),

  http.post(`${API}/admin/users/:id/action`, async () => HttpResponse.json({ ok: true }))
];
