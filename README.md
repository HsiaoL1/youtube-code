# Youtobe Codex Frontend

类 YouTube 视频平台前端（React + TypeScript + TailwindCSS），包含：首页/搜索/长视频/短视频/直播/创作者后台/管理后台。

## 技术栈

- React 18 + TypeScript + Vite
- TailwindCSS
- shadcn/ui 风格组件（Radix primitives）
- react-router-dom
- @tanstack/react-query
- react-hook-form + zod
- zustand（auth/session + player/theme）
- hls.js（长视频/直播播放器）
- Mock Service（本地 mock service，可替换为真实后端）

## 启动

```bash
pnpm i
pnpm dev
```

## Mock 账号

- `user / 123456`
- `creator / 123456`
- `admin / 123456`

## 主要路由

- 公共：`/` `/trending` `/subscriptions` `/search?q=` `/watch/:id` `/shorts` `/live` `/live/:id` `/channel/:id` `/playlist/:id`
- 认证：`/login` `/register`
- Studio（creator/admin）：`/studio` `/studio/upload` `/studio/content` `/studio/live` `/studio/comments` `/studio/settings`
- Admin（admin）：`/admin/dashboard` `/admin/content` `/admin/reports` `/admin/users`

## 架构说明

- `src/app`: router/providers/layout/guards
- `src/features/*`: 业务模块 + react-query hooks + pages
- `src/components`: 通用组件（VideoCard/Player/CommentThread 等）
- `src/lib`: api/mock/utils/constants
- `src/store`: zustand 状态
- `src/types`: 共享类型与 zod schema

## 可替换后端

当前 `src/lib/api/client.ts` 通过 `src/lib/api/service.ts` 提供 mock 数据；后续替换为真实接口时保留 `features` hooks 不变，仅替换 `client.ts` 实现即可。
