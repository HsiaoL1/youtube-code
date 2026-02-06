import { z } from 'zod';

export const roleSchema = z.enum(['user', 'creator', 'admin']);
export const videoTypeSchema = z.enum(['long', 'short', 'live', 'replay']);
export const visibilitySchema = z.enum(['public', 'unlisted', 'private']);
export const contentStatusSchema = z.enum([
  'published',
  'reviewing',
  'rejected',
  'draft'
]);

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  avatarUrl: z.string().url(),
  role: roleSchema,
  followersCount: z.number().int().nonnegative()
});

export const videoSchema = z.object({
  id: z.string(),
  type: videoTypeSchema,
  title: z.string(),
  description: z.string(),
  coverUrl: z.string().url(),
  duration: z.number().int().nonnegative(),
  views: z.number().int().nonnegative(),
  likes: z.number().int().nonnegative(),
  createdAt: z.string(),
  author: userSchema,
  tags: z.array(z.string()),
  category: z.string(),
  visibility: visibilitySchema,
  status: contentStatusSchema,
  hlsUrl: z.string().url().optional()
});

export const commentSchema = z.object({
  id: z.string(),
  entityType: z.enum(['video', 'short', 'live']),
  entityId: z.string(),
  author: userSchema,
  content: z.string(),
  createdAt: z.string(),
  likeCount: z.number().int().nonnegative(),
  parentId: z.string().optional()
});

export const liveRoomSchema = z.object({
  id: z.string(),
  title: z.string(),
  coverUrl: z.string().url(),
  author: userSchema,
  viewers: z.number().int().nonnegative(),
  category: z.string(),
  status: z.enum(['live', 'offline']),
  hlsUrl: z.string().url(),
  startedAt: z.string()
});

export const playlistSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(videoSchema)
});

export const loginSchema = z.object({
  identifier: z.string().min(2),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  name: z.string().min(2),
  handle: z.string().min(2),
  password: z.string().min(6)
});

export const commentInputSchema = z.object({
  content: z.string().min(1).max(300)
});

export type Role = z.infer<typeof roleSchema>;
export type VideoType = z.infer<typeof videoTypeSchema>;
export type Visibility = z.infer<typeof visibilitySchema>;
export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type User = z.infer<typeof userSchema>;
export type Video = z.infer<typeof videoSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type LiveRoom = z.infer<typeof liveRoomSchema>;
export type Playlist = z.infer<typeof playlistSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CommentInput = z.infer<typeof commentInputSchema>;
