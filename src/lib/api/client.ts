import type { LoginInput, RegisterInput } from '@/types';
import { mockService } from './service';

let token: string | null = localStorage.getItem('token');

export const authApi = {
  async login(input: LoginInput) {
    const data = await mockService.login(input);
    token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  },
  async register(input: RegisterInput) {
    const data = await mockService.register(input);
    token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  },
  me: () => mockService.me(token),
  async logout() {
    token = null;
    localStorage.removeItem('token');
  }
};

export const feedApi = {
  home: mockService.home,
  trending: mockService.trending,
  subscriptions: mockService.subscriptions
};

export const searchApi = {
  query: mockService.search
};

export const videoApi = {
  detail: mockService.videoDetail,
  recommendations: mockService.recommendations,
  like: mockService.likeVideo,
  favorite: async () => ({ ok: true })
};

export const shortsApi = {
  list: mockService.listShorts,
  like: mockService.likeShort,
  favorite: async () => ({ ok: true })
};

export const liveApi = {
  list: mockService.listLive,
  detail: mockService.liveDetail,
  chat: mockService.liveChat
};

export const commentApi = {
  list: mockService.listComments,
  create: mockService.createComment,
  delete: mockService.deleteComment,
  like: mockService.likeComment
};

export const channelApi = {
  detail: mockService.channel
};

export const playlistApi = {
  detail: mockService.playlist
};

export const studioApi = {
  overview: mockService.studioOverview,
  content: mockService.studioContent,
  upload: mockService.studioUpload,
  update: mockService.studioUpdate,
  toggleLive: async () => ({ ok: true }),
  comments: mockService.studioComments
};

export const adminApi = {
  dashboard: mockService.adminDashboard,
  reviewQueue: mockService.adminReviewQueue,
  reviewAction: mockService.adminReviewAction,
  reports: mockService.adminReports,
  reportAction: async () => ({ ok: true }),
  users: mockService.adminUsers,
  userAction: async () => ({ ok: true })
};
