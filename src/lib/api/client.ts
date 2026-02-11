import type { Comment, LoginInput, RegisterInput, User, Video } from '@/types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const authApi = {
  async login(input: LoginInput) {
    const data = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    localStorage.setItem('token', data.token);
    return data;
  },
  async register(input: RegisterInput) {
    const data = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    localStorage.setItem('token', data.token);
    return data;
  },
  async me() {
    return request<{ user: User | null }>('/api/auth/me');
  },
  async logout() {
    localStorage.removeItem('token');
    await request('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }
};

export const feedApi = {
  home: (category = 'All') =>
    request<{ items: Video[] }>(`/api/feed/home?category=${encodeURIComponent(category)}`),
  trending: () => request<{ items: Video[] }>('/api/feed/trending'),
  subscriptions: () => request<{ items: Video[] }>('/api/feed/subscriptions')
};

export const searchApi = {
  query: (q: string, tab: string, sort: string) =>
    request<{
      videos: Video[];
      shorts: Video[];
      lives: any[];
      channels: User[];
      activeTab: string;
    }>(`/api/search?q=${encodeURIComponent(q)}&tab=${encodeURIComponent(tab)}&sort=${encodeURIComponent(sort)}`)
};

export const videoApi = {
  detail: (id: string) => request<{ video: Video; chapters: any[] }>(`/api/videos/${id}`),
  recommendations: (id: string) => request<{ items: Video[] }>(`/api/videos/${id}/recommendations`),
  like: (id: string) =>
    request<{ likes: number }>(`/api/videos/${id}/like`, { method: 'POST' }),
  favorite: (id: string) =>
    request<{ ok: boolean }>(`/api/videos/${id}/favorite`, { method: 'POST' })
};

export const shortsApi = {
  list: () => request<{ items: Video[] }>('/api/shorts'),
  like: (id: string) =>
    request<{ likes: number }>(`/api/shorts/${id}/like`, { method: 'POST' }),
  favorite: (id: string) =>
    request<{ ok: boolean }>(`/api/shorts/${id}/favorite`, { method: 'POST' })
};

export const liveApi = {
  list: (category = 'All') =>
    request<{ items: any[] }>(`/api/live?category=${encodeURIComponent(category)}`),
  detail: (id: string) => request<{ room: any; replay: Video }>(`/api/live/${id}`),
  chat: (id: string) => request<{ items: Comment[] }>(`/api/live/${id}/chat`)
};

export const commentApi = {
  list: (entityType: string, entityId: string) =>
    request<{ items: Comment[] }>(
      `/api/comments?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`
    ),
  create: (payload: Partial<Comment> & { currentUserId?: string }) =>
    request<{ item: Comment }>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  delete: (id: string) =>
    request<{ ok: boolean }>(`/api/comments/${id}`, { method: 'DELETE' }),
  like: (id: string) =>
    request<{ likeCount: number }>(`/api/comments/${id}/like`, { method: 'POST' })
};

export const channelApi = {
  detail: (id: string) => request<{ channel: User; content: Video[] }>(`/api/channel/${id}`)
};

export const playlistApi = {
  detail: (id: string) => request<{ playlist: any }>(`/api/playlists/${id}`)
};

export const studioApi = {
  overview: () => request<{ cards: any[]; latest: Video[] }>('/api/studio/overview'),
  content: (status = 'all') =>
    request<{ items: Video[] }>(`/api/studio/content?status=${encodeURIComponent(status)}`),
  upload: (payload: Partial<Video>) =>
    request<{ item: Video }>('/api/studio/upload', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  update: (id: string, payload: Partial<Video>) =>
    request<{ item: Video }>(`/api/studio/content/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  toggleLive: () => request<{ ok: boolean }>('/api/studio/live/toggle', { method: 'POST' }),
  comments: () => request<{ items: Comment[] }>('/api/studio/comments')
};

export const adminApi = {
  dashboard: () => request<{ stats: any[] }>('/api/admin/dashboard'),
  reviewQueue: () => request<{ items: Video[] }>('/api/admin/review-queue'),
  reviewAction: (id: string, action: 'approve' | 'reject' | 'take_down') =>
    request<{ ok: boolean; item: Video }>(`/api/admin/review-queue/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    }),
  reports: () => request<{ items: any[] }>('/api/admin/reports'),
  reportAction: (id: string, action: string) =>
    request<{ ok: boolean }>(`/api/admin/reports/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    }),
  users: () => request<{ items: (User & { banned: boolean })[] }>('/api/admin/users'),
  userAction: (id: string, action: string) =>
    request<{ ok: boolean }>(`/api/admin/users/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
};
