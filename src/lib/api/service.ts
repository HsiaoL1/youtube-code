import { sleep } from '@/lib/utils';
import { authAccounts, chapters, comments, liveRooms, playlists, users, videos } from '@/lib/mocks/db';
import type { Comment, LoginInput, RegisterInput, User, Video } from '@/types';

const sanitize = (text: string) => text.replace(/(spam|傻瓜|笨蛋)/gi, '***').replace(/@([\w]+)/g, '<@$1>');

export const mockService = {
  async login(input: LoginInput) {
    await sleep(300);
    const account = authAccounts.find((a) => a.identifier === input.identifier && a.password === input.password);
    if (!account) throw new Error('Invalid credentials');
    const user = users.find((u) => u.id === account.userId)!;
    return { user, token: `token-${user.id}` };
  },

  async register(input: RegisterInput) {
    await sleep(350);
    const user: User = {
      id: `u${Date.now()}`,
      name: input.name,
      handle: `@${input.handle.replace('@', '')}`,
      avatarUrl: 'https://i.pravatar.cc/120?img=65',
      role: 'user',
      followersCount: 0
    };
    users.push(user);
    return { user, token: `token-${user.id}` };
  },

  async me(token: string | null) {
    await sleep(180);
    if (!token) return { user: null };
    const id = token.replace('token-', '');
    return { user: users.find((u) => u.id === id) ?? null };
  },

  async home(category = 'All') {
    await sleep(260);
    const items = category === 'All' ? videos : videos.filter((v) => v.category === category);
    return { items };
  },

  async trending() {
    await sleep(260);
    return { items: [...videos].sort((a, b) => b.views - a.views) };
  },

  async subscriptions() {
    await sleep(260);
    return { items: videos.filter((v) => ['u2', 'u4'].includes(v.author.id)) };
  },

  async search(q: string, tab: string, sort: string) {
    await sleep(300);
    let matched = videos.filter((v) => v.title.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'latest') matched = matched.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === 'views') matched = matched.sort((a, b) => b.views - a.views);
    return {
      videos: matched.filter((v) => ['long', 'replay'].includes(v.type)),
      shorts: matched.filter((v) => v.type === 'short'),
      lives: liveRooms.filter((x) => x.title.toLowerCase().includes(q.toLowerCase())),
      channels: users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())),
      activeTab: tab
    };
  },

  async videoDetail(id: string) {
    await sleep(220);
    const video = videos.find((v) => v.id === id);
    if (!video) throw new Error('Not found');
    return { video, chapters };
  },

  async recommendations(id: string) {
    await sleep(200);
    return { items: videos.filter((v) => v.id !== id) };
  },

  async likeVideo(id: string) {
    const item = videos.find((v) => v.id === id);
    if (item) item.likes += 1;
    return { likes: item?.likes ?? 0 };
  },

  async listShorts() {
    await sleep(180);
    return { items: videos.filter((v) => v.type === 'short') };
  },

  async likeShort(id: string) {
    const item = videos.find((v) => v.id === id);
    if (item) item.likes += 1;
    return { likes: item?.likes ?? 0 };
  },

  async listLive(category = 'All') {
    await sleep(200);
    return { items: category === 'All' ? liveRooms : liveRooms.filter((x) => x.category === category) };
  },

  async liveDetail(id: string) {
    await sleep(200);
    const room = liveRooms.find((x) => x.id === id);
    if (!room) throw new Error('Not found');
    return { room, replay: videos.find((v) => v.id === 'r1')! };
  },

  async liveChat(id: string) {
    await sleep(130);
    return { items: comments.filter((c) => c.entityType === 'live' && c.entityId === id).map((c) => ({ ...c, content: sanitize(c.content) })) };
  },

  async listComments(entityType: string, entityId: string) {
    await sleep(150);
    return { items: comments.filter((c) => c.entityType === entityType && c.entityId === entityId) };
  },

  async createComment(payload: Partial<Comment> & { currentUserId?: string }) {
    await sleep(150);
    const author = users.find((u) => u.id === payload.currentUserId) ?? users[0];
    const item: Comment = {
      id: `c${Date.now()}`,
      entityType: (payload.entityType as Comment['entityType']) ?? 'video',
      entityId: payload.entityId ?? '',
      author,
      content: sanitize(payload.content ?? ''),
      createdAt: new Date().toISOString(),
      likeCount: 0,
      parentId: payload.parentId
    };
    comments.unshift(item);
    return { item };
  },

  async deleteComment(id: string) {
    const idx = comments.findIndex((c) => c.id === id);
    if (idx >= 0) comments.splice(idx, 1);
    return { ok: true };
  },

  async likeComment(id: string) {
    const item = comments.find((c) => c.id === id);
    if (item) item.likeCount += 1;
    return { likeCount: item?.likeCount ?? 0 };
  },

  async channel(id: string) {
    const channel = users.find((u) => u.id === id);
    if (!channel) throw new Error('not found');
    return { channel, content: videos.filter((v) => v.author.id === id) };
  },

  async playlist(id: string) {
    const playlist = playlists.find((p) => p.id === id);
    if (!playlist) throw new Error('not found');
    return { playlist };
  },

  async studioOverview() {
    return {
      cards: [
        { label: 'Views', value: '1.3M' },
        { label: 'Followers', value: '98K' },
        { label: 'Revenue', value: '$12,540' }
      ],
      latest: videos.slice(0, 3)
    };
  },

  async studioContent(status = 'all') {
    const items = status === 'all' ? videos : videos.filter((v) => v.status === status);
    return { items };
  },

  async studioUpload(payload: Partial<Video>) {
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
    return { item };
  },

  async studioUpdate(id: string, payload: Partial<Video>) {
    const item = videos.find((v) => v.id === id);
    if (item) Object.assign(item, payload);
    return { item };
  },

  async studioComments() {
    return { items: comments.filter((c) => c.entityType === 'video') };
  },

  async adminDashboard() {
    return {
      stats: [
        { label: 'Pending Reviews', value: 18 },
        { label: 'Reports Open', value: 27 },
        { label: 'Active Creators', value: 342 }
      ]
    };
  },

  async adminReviewQueue() {
    return { items: videos.filter((v) => ['reviewing', 'rejected'].includes(v.status)) };
  },

  async adminReviewAction(id: string, action: 'approve' | 'reject' | 'take_down') {
    const item = videos.find((v) => v.id === id);
    if (item) item.status = action === 'approve' ? 'published' : action === 'reject' ? 'rejected' : 'draft';
    return { ok: true, item };
  },

  async adminReports() {
    return {
      items: [
        { id: 'rp1', reason: 'Copyright', target: 'v2', status: 'open' },
        { id: 'rp2', reason: 'Harassment', target: 'c3', status: 'processing' }
      ]
    };
  },

  async adminUsers() {
    return { items: users.map((u) => ({ ...u, banned: false })) };
  }
};
