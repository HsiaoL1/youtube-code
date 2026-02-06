# Youtobe Codex — Backend Implementation Specification

> Tech Stack: Go + MySQL + Redis
> Frontend: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui (already implemented)
> This document covers all 35 API endpoints the frontend depends on.

---

## Table of Contents

- [1. Database Schema (MySQL)](#1-database-schema-mysql)
- [2. Redis Cache Strategy](#2-redis-cache-strategy)
- [3. API Endpoints](#3-api-endpoints)
  - [3.1 Auth](#31-auth)
  - [3.2 Feed](#32-feed)
  - [3.3 Search](#33-search)
  - [3.4 Video](#34-video)
  - [3.5 Shorts](#35-shorts)
  - [3.6 Live](#36-live)
  - [3.7 Comments](#37-comments)
  - [3.8 Channel](#38-channel)
  - [3.9 Playlist](#39-playlist)
  - [3.10 Studio (Creator)](#310-studio-creator)
  - [3.11 Admin](#311-admin)
- [4. Data Models (JSON Response Format)](#4-data-models-json-response-format)
- [5. Middleware](#5-middleware)
- [6. Go Project Structure](#6-go-project-structure)
- [7. Recommended Libraries](#7-recommended-libraries)
- [8. Async Tasks (Message Queue)](#8-async-tasks-message-queue)
- [9. Development Roadmap](#9-development-roadmap)

---

## 1. Database Schema (MySQL)

### 1.1 users

```sql
CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uid             VARCHAR(32)  NOT NULL UNIQUE COMMENT 'Business ID, e.g. u1, u20250206',
  name            VARCHAR(64)  NOT NULL,
  handle          VARCHAR(64)  NOT NULL UNIQUE COMMENT 'e.g. @alice',
  avatar_url      VARCHAR(512) NOT NULL DEFAULT '',
  password        VARCHAR(128) NOT NULL COMMENT 'bcrypt hash',
  role            ENUM('user','creator','admin') NOT NULL DEFAULT 'user',
  followers_count INT UNSIGNED NOT NULL DEFAULT 0,
  banned          TINYINT(1)   NOT NULL DEFAULT 0,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_handle (handle),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.2 videos

```sql
CREATE TABLE videos (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vid         VARCHAR(32)  NOT NULL UNIQUE COMMENT 'Business ID, e.g. v1, s1, r1',
  type        ENUM('long','short','live','replay') NOT NULL DEFAULT 'long',
  title       VARCHAR(256) NOT NULL,
  description TEXT,
  cover_url   VARCHAR(512) NOT NULL DEFAULT '',
  hls_url     VARCHAR(512) DEFAULT NULL,
  duration    INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'seconds',
  views       INT UNSIGNED NOT NULL DEFAULT 0,
  likes       INT UNSIGNED NOT NULL DEFAULT 0,
  author_uid  VARCHAR(32)  NOT NULL COMMENT 'FK -> users.uid',
  tags        JSON         COMMENT '["react","frontend"]',
  category    VARCHAR(64)  NOT NULL DEFAULT '',
  visibility  ENUM('public','unlisted','private') NOT NULL DEFAULT 'public',
  status      ENUM('published','reviewing','rejected','draft') NOT NULL DEFAULT 'reviewing',
  schedule_at DATETIME     DEFAULT NULL COMMENT 'Scheduled publish time',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_author (author_uid),
  INDEX idx_category (category),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_views (views DESC),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.3 comments

```sql
CREATE TABLE comments (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cid         VARCHAR(32)  NOT NULL UNIQUE,
  entity_type ENUM('video','short','live') NOT NULL,
  entity_id   VARCHAR(32)  NOT NULL COMMENT 'FK -> videos.vid or live_rooms.lid',
  author_uid  VARCHAR(32)  NOT NULL COMMENT 'FK -> users.uid',
  content     TEXT         NOT NULL,
  parent_id   VARCHAR(32)  DEFAULT NULL COMMENT 'Reply target cid, NULL = root comment',
  like_count  INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_author (author_uid),
  INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.4 live_rooms

```sql
CREATE TABLE live_rooms (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lid        VARCHAR(32)  NOT NULL UNIQUE,
  title      VARCHAR(256) NOT NULL,
  cover_url  VARCHAR(512) NOT NULL DEFAULT '',
  hls_url    VARCHAR(512) NOT NULL,
  author_uid VARCHAR(32)  NOT NULL COMMENT 'FK -> users.uid',
  viewers    INT UNSIGNED NOT NULL DEFAULT 0,
  category   VARCHAR(64)  NOT NULL DEFAULT '',
  status     ENUM('live','offline') NOT NULL DEFAULT 'offline',
  stream_key VARCHAR(128) DEFAULT NULL COMMENT 'Stream push secret key',
  replay_vid VARCHAR(32)  DEFAULT NULL COMMENT 'FK -> videos.vid for replay',
  started_at DATETIME     DEFAULT NULL,
  ended_at   DATETIME     DEFAULT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_author (author_uid),
  INDEX idx_status (status),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.5 playlists

```sql
CREATE TABLE playlists (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pid        VARCHAR(32)  NOT NULL UNIQUE,
  title      VARCHAR(256) NOT NULL,
  owner_uid  VARCHAR(32)  NOT NULL COMMENT 'FK -> users.uid',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner (owner_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.6 playlist_items

```sql
CREATE TABLE playlist_items (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  playlist_id VARCHAR(32) NOT NULL COMMENT 'FK -> playlists.pid',
  video_id    VARCHAR(32) NOT NULL COMMENT 'FK -> videos.vid',
  sort_order  INT         NOT NULL DEFAULT 0,
  UNIQUE KEY uk_playlist_video (playlist_id, video_id),
  INDEX idx_playlist (playlist_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.7 chapters

```sql
CREATE TABLE chapters (
  id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chid     VARCHAR(32)  NOT NULL UNIQUE,
  video_id VARCHAR(32)  NOT NULL COMMENT 'FK -> videos.vid',
  title    VARCHAR(256) NOT NULL,
  time_sec INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Chapter start time in seconds',
  INDEX idx_video (video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.8 reports

```sql
CREATE TABLE reports (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rid          VARCHAR(32)  NOT NULL UNIQUE,
  reason       VARCHAR(128) NOT NULL COMMENT 'Copyright / Harassment / Spam ...',
  target_type  ENUM('video','comment','user','live') NOT NULL,
  target_id    VARCHAR(32)  NOT NULL,
  reporter_uid VARCHAR(32)  NOT NULL COMMENT 'FK -> users.uid',
  status       ENUM('open','processing','resolved','dismissed') NOT NULL DEFAULT 'open',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.9 subscriptions

```sql
CREATE TABLE subscriptions (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subscriber_uid VARCHAR(32) NOT NULL COMMENT 'FK -> users.uid (who subscribes)',
  channel_uid    VARCHAR(32) NOT NULL COMMENT 'FK -> users.uid (who is subscribed to)',
  created_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sub (subscriber_uid, channel_uid),
  INDEX idx_channel (channel_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.10 video_likes

```sql
CREATE TABLE video_likes (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_uid   VARCHAR(32) NOT NULL,
  video_id   VARCHAR(32) NOT NULL COMMENT 'FK -> videos.vid',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_video (user_uid, video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.11 comment_likes

```sql
CREATE TABLE comment_likes (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_uid   VARCHAR(32) NOT NULL,
  comment_id VARCHAR(32) NOT NULL COMMENT 'FK -> comments.cid',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_comment (user_uid, comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 2. Redis Cache Strategy

| Key Pattern | Type | Purpose | TTL |
|---|---|---|---|
| `feed:home:{category}` | String (JSON) | Home feed cache | 5 min |
| `feed:trending` | String (JSON) | Trending feed cache | 5 min |
| `video:{vid}` | String (JSON) | Video detail cache | 10 min |
| `video:{vid}:views` | String (int) | View counter (periodically flushed to MySQL) | No expiry |
| `video:{vid}:likes` | String (int) | Like counter | No expiry |
| `live:{lid}:viewers` | String (int) | Live room real-time viewer count | Cleaned on stream end |
| `live:{lid}:chat` | List | Live chat messages (last 100) | Cleaned on stream end |
| `user:token:{token}` | String (JSON) | Login session cache | 7 days |
| `search:{hash}` | String (JSON) | Search results cache | 2 min |
| `channel:{uid}` | String (JSON) | Channel info cache | 10 min |
| `rate_limit:{uid}:{action}` | String (count) | Rate limiting (comments/likes) | 1 min |

### Cache Usage Notes

- **View counts**: On each play, `INCR video:{vid}:views`. Background cron job flushes to MySQL every minute with batch `UPDATE`.
- **Live viewers**: `SADD live:{lid}:viewers_set {uid}` on join + `SCARD` for count (deduplication). Or simple `INCR/DECR`.
- **Live chat**: `RPUSH` to write + `LRANGE` to read latest N entries. Optionally push via WebSocket/SSE instead of polling.
- **Cache invalidation**: On write operations (publish/delete video), proactively delete related cache keys.

---

## 3. API Endpoints

> Base path: `/api`
> Auth header: `Authorization: Bearer {token}` (for authenticated endpoints)

---

### 3.1 Auth

#### POST /api/auth/login

Login and return user info + token.

**Request Body:**
```json
{
  "identifier": "string",   // username or handle, min 2 chars
  "password": "string"      // min 6 chars
}
```

**Response 200:**
```json
{
  "user": { "User object" },
  "token": "jwt-xxx"
}
```

**Error Responses:**
- `400`: `{ "message": "Invalid payload" }`
- `401`: `{ "message": "Invalid credentials" }`

**Backend Logic:**
1. Validate input (identifier >= 2, password >= 6)
2. Query `users` table: `WHERE handle = CONCAT('@', ?) OR name = ?`
3. `bcrypt.CompareHashAndPassword` to verify password
4. Generate JWT token (payload: `uid`, `role`, expiry: 7 days)
5. Store in Redis: `SET user:token:{token} {user_json} EX 604800`
6. Return user + token

---

#### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "string",     // min 2 chars
  "handle": "string",   // min 2 chars, must be unique
  "password": "string"  // min 6 chars
}
```

**Response 200:**
```json
{
  "user": { "User object" },
  "token": "jwt-xxx"
}
```

**Error Responses:**
- `400`: `{ "message": "Invalid payload" }`
- `409`: `{ "message": "Handle already exists" }`

**Backend Logic:**
1. Validate input
2. Check `handle` uniqueness in DB
3. `bcrypt.GenerateFromPassword` to hash password
4. Insert into `users` table, generate uid via snowflake or `u{timestamp}`
5. Default `avatar_url`: `https://i.pravatar.cc/120?img={random}`
6. Generate token, return

---

#### GET /api/auth/me

Get current logged-in user info. **Requires auth.**

**Response 200:**
```json
{ "user": { "User object" } }
```

Returns `{ "user": null }` if token is invalid or missing.

**Backend Logic:**
1. Extract token from Authorization header
2. Check Redis `user:token:{token}` first (cache hit → return)
3. Cache miss → parse JWT, query MySQL, backfill Redis
4. Invalid token or user not found → return `{ "user": null }`

---

#### POST /api/auth/logout

Logout (invalidate token).

**Response 200:**
```json
{ "ok": true }
```

**Backend Logic:** `DEL user:token:{token}` from Redis.

---

### 3.2 Feed

#### GET /api/feed/home

Home page video feed, filtered by category.

**Query Params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `category` | string | `"All"` | `All\|Music\|Gaming\|Tech\|Design\|Education\|News\|Sports\|Entertainment` |

**Response 200:**
```json
{
  "items": [ "Video objects" ]
}
```

**Backend Logic:**
1. Check Redis `feed:home:{category}`
2. Cache miss → query MySQL:
   - `category == "All"`: `SELECT * FROM videos WHERE status='published' AND visibility='public' AND type IN ('long','replay') ORDER BY created_at DESC LIMIT 40`
   - Otherwise: add `AND category = ?`
3. Each video needs author info (JOIN users or batch query in Go)
4. Write to Redis with 5 min TTL
5. Return

---

#### GET /api/feed/trending

Trending videos sorted by view count.

**Response 200:**
```json
{ "items": [ "Video objects" ] }
```

**Backend Logic:**
- `SELECT * FROM videos WHERE status='published' AND visibility='public' ORDER BY views DESC LIMIT 40`
- Cache in `feed:trending` with 5 min TTL

---

#### GET /api/feed/subscriptions

Current user's subscription feed. **Requires auth.**

**Response 200:**
```json
{ "items": [ "Video objects" ] }
```

**Backend Logic:**
1. Get `uid` from JWT
2. Query `subscriptions` table for all `channel_uid` values this user subscribes to
3. `SELECT * FROM videos WHERE author_uid IN (?, ?, ...) AND status='published' ORDER BY created_at DESC LIMIT 40`
4. If not logged in, return empty array or general recommendations

---

### 3.3 Search

#### GET /api/search

Full-site search. Returns videos, shorts, live rooms, and channels simultaneously.

**Query Params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | `""` | Search keyword |
| `tab` | string | `"video"` | `video\|short\|live\|channel` (frontend uses to highlight tab, backend can return all) |
| `sort` | string | `"relevance"` | `relevance\|latest\|views` |

**Response 200:**
```json
{
  "videos":   [ "Video objects (type=long|replay)" ],
  "shorts":   [ "Video objects (type=short)" ],
  "lives":    [ "LiveRoom objects" ],
  "channels": [ "User objects" ],
  "activeTab": "video"
}
```

**Backend Logic:**
1. Check Redis `search:{md5(q+sort)}`
2. Cache miss:
   - **Videos**: `SELECT * FROM videos WHERE status='published' AND title LIKE CONCAT('%', ?, '%')`, sort by `sort` param
   - Split results into `videos` (type=long/replay) and `shorts` (type=short)
   - **Live rooms**: `SELECT * FROM live_rooms WHERE status='live' AND title LIKE CONCAT('%', ?, '%')`
   - **Channels**: `SELECT * FROM users WHERE name LIKE CONCAT('%', ?, '%') OR handle LIKE CONCAT('%', ?, '%')`
3. For production scale, integrate Elasticsearch for full-text search
4. Cache for 2 min

---

### 3.4 Video

#### GET /api/videos/:id

Video detail with chapter list.

**Response 200:**
```json
{
  "video": { "Video object" },
  "chapters": [
    { "id": "ch1", "title": "Introduction", "time": 0 },
    { "id": "ch2", "title": "Data Layer", "time": 220 }
  ]
}
```

**Error:** `404` `{ "message": "Not found" }`

**Backend Logic:**
1. Check Redis `video:{vid}`
2. Cache miss: query `videos` JOIN `users` + query `chapters` WHERE `video_id = ?`
3. `INCR video:{vid}:views` (async flush to MySQL)
4. Cache video detail for 10 min

---

#### GET /api/videos/:id/recommendations

Recommended videos (excluding current video).

**Response 200:**
```json
{ "items": [ "Video objects" ] }
```

**Backend Logic:**
- Simple: same category + same author's other videos, exclude current id
- Advanced: tag similarity + popularity weighting
- `SELECT * FROM videos WHERE vid != ? AND status='published' AND (category = ? OR author_uid = ?) ORDER BY views DESC LIMIT 20`

---

#### POST /api/videos/:id/like

Like a video. **Requires auth.**

**Response 200:**
```json
{ "ok": true, "likes": 22001 }
```

**Backend Logic:**
1. Get uid from JWT
2. `INSERT INTO video_likes (user_uid, video_id) VALUES (?, ?)` (unique key deduplication)
3. If insert succeeds: `INCR video:{vid}:likes` + async `UPDATE videos SET likes = likes + 1 WHERE vid = ?`
4. If already liked: optionally toggle (unlike) via `DELETE` + `DECR`
5. Rate limit: `INCR rate_limit:{uid}:like`, max 30 per minute

---

#### POST /api/videos/:id/favorite

Favorite/bookmark a video. **Requires auth.**

**Response 200:**
```json
{ "ok": true }
```

**Backend Logic:** Add to user's default favorites playlist (can extend with a `favorites` table later).

---

### 3.5 Shorts

#### GET /api/shorts

Get all Shorts videos.

**Response 200:**
```json
{ "items": [ "Video objects (type=short)" ] }
```

**Backend Logic:**
- `SELECT * FROM videos WHERE type='short' AND status='published' ORDER BY created_at DESC LIMIT 50`

---

#### POST /api/shorts/:id/like

Like a Short. **Requires auth.** Same logic as video like.

**Response 200:**
```json
{ "ok": true, "likes": 6301 }
```

---

#### POST /api/shorts/:id/favorite

Favorite a Short. **Requires auth.**

**Response 200:**
```json
{ "ok": true }
```

---

### 3.6 Live

#### GET /api/live

Live room list, filtered by category.

**Query Params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `category` | string | `"All"` | `All\|Tech\|Education\|Gaming\|Music` |

**Response 200:**
```json
{ "items": [ "LiveRoom objects" ] }
```

**Backend Logic:**
- `SELECT * FROM live_rooms WHERE status='live'`, filter by category if not "All"
- `viewers` should be read from Redis in real-time: `GET live:{lid}:viewers`

---

#### GET /api/live/:id

Live room detail.

**Response 200:**
```json
{
  "room": { "LiveRoom object" },
  "replay": { "Video object or null" }
}
```

**Error:** `404` `{ "message": "Not found" }`

**Backend Logic:**
1. Query `live_rooms` JOIN `users`
2. If `replay_vid` is not null, query the associated `videos` record
3. Read viewers from Redis for real-time count

---

#### GET /api/live/:id/chat

Live chat messages (polled by frontend every 3 seconds).

**Response 200:**
```json
{
  "items": [
    {
      "id": "c3",
      "author": { "User object" },
      "content": "Message content (sensitive words filtered)",
      "createdAt": "ISO datetime"
    }
  ]
}
```

**Backend Logic:**
1. Read from Redis: `LRANGE live:{lid}:chat -100 -1` (latest 100 messages)
2. If Redis is empty, fall back to `comments` table: `WHERE entity_type='live' AND entity_id=?`
3. All content must pass through sensitive word filter (replace spam/profanity with `***`)
4. **Advanced**: Use WebSocket for real-time push instead of polling

---

### 3.7 Comments

#### GET /api/comments

Get comments for a specific entity (video/short/live).

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `entityType` | string | `video\|short\|live` |
| `entityId` | string | e.g. `v1`, `s1`, `l1` |

**Response 200:**
```json
{
  "items": [
    {
      "id": "c1",
      "entityType": "video",
      "entityId": "v1",
      "author": { "User object" },
      "content": "Comment text",
      "createdAt": "ISO datetime",
      "likeCount": 120,
      "parentId": null
    }
  ]
}
```

**Backend Logic:**
1. `SELECT * FROM comments WHERE entity_type=? AND entity_id=? ORDER BY created_at ASC`
2. JOIN `users` table for author info
3. Frontend assembles the tree structure (root comments + replies), backend returns a flat list

---

#### POST /api/comments

Create a comment. **Requires auth.**

**Request Body:**
```json
{
  "entityType": "video",
  "entityId": "v1",
  "content": "string",    // 1-300 chars
  "parentId": "c1"        // optional, reply to a comment
}
```

**Response 200:**
```json
{ "item": { "Comment object" } }
```

**Error:** `400` `{ "message": "Invalid comment" }`

**Backend Logic:**
1. Get uid from JWT as author (**do NOT accept currentUserId from request body** - that's a frontend mock leftover)
2. Validate content length: 1-300 chars
3. **Sensitive word filter**: replace `spam`, profanity, etc. with `***`
4. **@mention handling**: `@username` → `<@username>` or store mention relationships (for future notifications)
5. Generate cid, INSERT into `comments`
6. Rate limit: max 10 comments per user per minute
7. **Optional**: Use message queue to async notify the replied user / video author

---

#### DELETE /api/comments/:id

Delete a comment. **Requires auth** (only comment author or admin can delete).

**Response 200:**
```json
{ "ok": true }
```

**Error:** `403` `{ "message": "Forbidden" }`

**Backend Logic:**
1. Query comment, verify `author_uid == current uid` or `current role == admin`
2. Physical delete or soft delete
3. If there are child replies, decide strategy: cascade delete or keep with "deleted" display

---

#### POST /api/comments/:id/like

Like a comment. **Requires auth.**

**Response 200:**
```json
{ "ok": true, "likeCount": 121 }
```

**Backend Logic:** Same pattern as video likes, using `comment_likes` table for deduplication + `INCR`.

---

### 3.8 Channel

#### GET /api/channel/:id

Channel detail + video list by this channel.

**Response 200:**
```json
{
  "channel": { "User object" },
  "content": [ "Video objects" ]
}
```

**Error:** `404` `{ "message": "Not found" }`

**Backend Logic:**
1. Query `users` table WHERE `uid = ?`
2. Query `videos` table WHERE `author_uid = ? AND status='published'` ORDER BY created_at DESC
3. Cache `channel:{uid}` with 10 min TTL

---

### 3.9 Playlist

#### GET /api/playlists/:id

Playlist detail with videos.

**Response 200:**
```json
{
  "playlist": {
    "id": "p1",
    "title": "Frontend Architecture Series",
    "items": [ "Video objects" ]
  }
}
```

**Error:** `404` `{ "message": "Not found" }`

**Backend Logic:**
1. Query `playlists` table
2. JOIN `playlist_items` + `videos`, sorted by `sort_order`
3. Each video JOINs `users` for author info

---

### 3.10 Studio (Creator)

> All endpoints below require auth + role check (role = `creator` or `admin`).

#### GET /api/studio/overview

Creator dashboard overview.

**Response 200:**
```json
{
  "cards": [
    { "label": "Views",     "value": "1.3M" },
    { "label": "Followers", "value": "98K" },
    { "label": "Revenue",   "value": "$12,540" }
  ],
  "latest": [ "Video objects, latest 3" ]
}
```

**Backend Logic:**
1. Aggregate current user's total video views: `SELECT SUM(views) FROM videos WHERE author_uid = ?`
2. Read `users.followers_count`
3. Revenue from a separate revenue table (or hardcode mock for now)
4. Latest 3: `SELECT * FROM videos WHERE author_uid = ? ORDER BY created_at DESC LIMIT 3`

---

#### GET /api/studio/content

Content management list for current creator.

**Query Params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `status` | string | `"all"` | `all\|published\|reviewing\|rejected\|draft` |

**Response 200:**
```json
{ "items": [ "Video objects" ] }
```

**Backend Logic:**
- `SELECT * FROM videos WHERE author_uid = ?`, add `AND status = ?` when status is not "all"
- ORDER BY created_at DESC

---

#### POST /api/studio/upload

Upload/create a new video.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "coverUrl": "string",
  "tags": ["react", "frontend"],
  "category": "Tech",
  "visibility": "public",
  "status": "reviewing"
}
```

**Response 200:**
```json
{ "item": { "Video object" } }
```

**Backend Logic:**
1. `author_uid` from JWT
2. Generate vid
3. In production, `coverUrl` and video files should be uploaded via **Object Storage (OSS/S3)**, only store URLs here
4. Video transcoding via message queue: upload complete → send message → transcoding service processes → callback updates `hls_url`
5. Default `status = reviewing`, awaiting admin review

---

#### PATCH /api/studio/content/:id

Update video info.

**Request Body (Partial):**
```json
{
  "title": "string",
  "status": "published",
  "...any video fields"
}
```

**Response 200:**
```json
{ "item": { "Video object" } }
```

**Backend Logic:**
1. Verify `author_uid == current uid`
2. Partial update only the fields provided

---

#### POST /api/studio/live/toggle

Start/stop live stream toggle.

**Response 200:**
```json
{ "ok": true }
```

**Backend Logic:**
1. Query `live_rooms` WHERE `author_uid = ?`
2. If none exists, create one and generate `stream_key`
3. Toggle status: `live` ↔ `offline`
4. On start: set `started_at = NOW()`, Redis `SET live:{lid}:viewers 0`
5. On stop: set `ended_at = NOW()`, optionally auto-create a replay video record

---

#### GET /api/studio/comments

All comments under current creator's videos.

**Response 200:**
```json
{ "items": [ "Comment objects" ] }
```

**Backend Logic:**
```sql
SELECT c.* FROM comments c
JOIN videos v ON c.entity_id = v.vid
WHERE v.author_uid = ? AND c.entity_type = 'video'
ORDER BY c.created_at DESC
```

---

### 3.11 Admin

> All endpoints below require auth + role check (role = `admin`).

#### GET /api/admin/dashboard

Admin dashboard stats.

**Response 200:**
```json
{
  "stats": [
    { "label": "Pending Reviews", "value": 18 },
    { "label": "Reports Open",    "value": 27 },
    { "label": "Active Creators", "value": 342 }
  ]
}
```

**Backend Logic:**
```sql
SELECT COUNT(*) FROM videos WHERE status = 'reviewing';
SELECT COUNT(*) FROM reports WHERE status IN ('open', 'processing');
SELECT COUNT(*) FROM users WHERE role = 'creator' AND banned = 0;
```

---

#### GET /api/admin/review-queue

Videos pending review or previously rejected.

**Response 200:**
```json
{ "items": [ "Video objects (status=reviewing|rejected)" ] }
```

**Backend Logic:**
- `SELECT * FROM videos WHERE status IN ('reviewing', 'rejected') ORDER BY created_at ASC`

---

#### POST /api/admin/review-queue/:id/action

Review action on a video.

**Request Body:**
```json
{ "action": "approve" | "reject" | "take_down" }
```

**Response 200:**
```json
{ "ok": true, "item": { "Video object" } }
```

**Backend Logic:**
- `approve` → status = `published`
- `reject` → status = `rejected`
- `take_down` → status = `draft`
- Invalidate related caches
- **Optional**: send notification to video author about review result via message queue

---

#### GET /api/admin/reports

Report list.

**Response 200:**
```json
{
  "items": [
    { "id": "rp1", "reason": "Copyright", "target": "v2", "status": "open" }
  ]
}
```

---

#### POST /api/admin/reports/:id/action

Handle a report.

**Request Body:**
```json
{ "action": "resolve" | "dismiss" }
```

**Response 200:**
```json
{ "ok": true }
```

---

#### GET /api/admin/users

User management list.

**Response 200:**
```json
{
  "items": [
    { "...User object fields", "banned": false }
  ]
}
```

---

#### POST /api/admin/users/:id/action

User management action (ban/unban/role change).

**Request Body:**
```json
{ "action": "ban" | "unban" | "set_role", "role": "creator" }
```

**Response 200:**
```json
{ "ok": true }
```

---

## 4. Data Models (JSON Response Format)

> **Important**: Go struct tags must use `json:"camelCase"` to match frontend expectations. MySQL column names use snake_case, conversion happens in Go structs.

### User

```json
{
  "id": "u2",
  "name": "Chris Creator",
  "handle": "@creator",
  "avatarUrl": "https://i.pravatar.cc/120?img=24",
  "role": "creator",
  "followersCount": 98000
}
```

### Video

```json
{
  "id": "v1",
  "type": "long",
  "title": "React 18 in Production: Battle-tested Patterns",
  "description": "Deep dive into data, route and rendering patterns.",
  "coverUrl": "https://picsum.photos/seed/react18/640/360",
  "hlsUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "duration": 1330,
  "views": 560000,
  "likes": 22000,
  "createdAt": "2026-02-03T12:00:00.000Z",
  "author": { "User object" },
  "tags": ["react", "frontend"],
  "category": "Tech",
  "visibility": "public",
  "status": "published"
}
```

### Comment

```json
{
  "id": "c1",
  "entityType": "video",
  "entityId": "v1",
  "author": { "User object" },
  "content": "This was the clearest explanation of query keys.",
  "createdAt": "2026-02-06T10:00:00.000Z",
  "likeCount": 120,
  "parentId": null
}
```

### LiveRoom

```json
{
  "id": "l1",
  "title": "Building Creator Studio Live",
  "coverUrl": "https://picsum.photos/seed/live1/640/360",
  "author": { "User object" },
  "viewers": 12400,
  "category": "Tech",
  "status": "live",
  "hlsUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "startedAt": "2026-02-06T09:00:00.000Z"
}
```

### Chapter

```json
{
  "id": "ch1",
  "title": "Introduction",
  "time": 0
}
```

### Playlist

```json
{
  "id": "p1",
  "title": "Frontend Architecture Series",
  "items": [ "Video objects" ]
}
```

---

## 5. Middleware

| Middleware | Purpose | Scope |
|---|---|---|
| **CORS** | Allow frontend cross-origin requests | Global |
| **JWT Auth** | Parse token, inject user into context | Authenticated routes |
| **RoleGuard** | Check `ctx.User.Role` against allowed roles | Studio (creator/admin), Admin (admin) |
| **RateLimiter** | Redis-based request rate limiting | Comment creation, likes, login |
| **RequestLogger** | Log request method, path, duration, status | Global |
| **Recovery** | Recover from panics gracefully | Global |
| **ContentFilter** | Sensitive word filtering for comments/chat content | Comment creation, live chat |

### Rate Limiting Rules

| Action | Limit | Window |
|---|---|---|
| Login attempts | 5 per IP | 1 min |
| Comment creation | 10 per user | 1 min |
| Video/comment likes | 30 per user | 1 min |
| Video upload | 5 per user | 1 hour |

---

## 6. Go Project Structure

```
youtobe-api/
├── cmd/
│   └── server/
│       └── main.go                // Entry point
├── internal/
│   ├── config/
│   │   └── config.go              // Config loading (MySQL/Redis/JWT secret etc.)
│   ├── middleware/
│   │   ├── cors.go
│   │   ├── auth.go                // JWT parsing
│   │   ├── role.go                // Role check
│   │   ├── ratelimit.go           // Redis rate limiting
│   │   └── logger.go
│   ├── model/                     // DB models (maps to MySQL tables)
│   │   ├── user.go
│   │   ├── video.go
│   │   ├── comment.go
│   │   ├── live_room.go
│   │   ├── playlist.go
│   │   ├── chapter.go
│   │   └── report.go
│   ├── handler/                   // HTTP handlers (route functions)
│   │   ├── auth.go                // login / register / me / logout
│   │   ├── feed.go                // home / trending / subscriptions
│   │   ├── search.go
│   │   ├── video.go               // detail / recommendations / like / favorite
│   │   ├── shorts.go
│   │   ├── live.go                // list / detail / chat
│   │   ├── comment.go             // list / create / delete / like
│   │   ├── channel.go
│   │   ├── playlist.go
│   │   ├── studio.go              // overview / content / upload / update / comments
│   │   └── admin.go               // dashboard / review / reports / users
│   ├── service/                   // Business logic layer
│   │   ├── auth_service.go
│   │   ├── feed_service.go
│   │   ├── video_service.go
│   │   ├── comment_service.go
│   │   ├── live_service.go
│   │   └── admin_service.go
│   ├── repo/                      // Data access layer (MySQL queries)
│   │   ├── user_repo.go
│   │   ├── video_repo.go
│   │   ├── comment_repo.go
│   │   ├── live_repo.go
│   │   ├── playlist_repo.go
│   │   └── report_repo.go
│   ├── cache/                     // Redis wrapper
│   │   └── redis.go
│   └── pkg/
│       ├── jwt.go                 // JWT generation & parsing
│       ├── filter.go              // Sensitive word filter
│       ├── response.go            // Unified JSON response helpers
│       └── snowflake.go           // ID generation
├── migrations/                    // SQL migration files
│   ├── 001_create_users.sql
│   ├── 002_create_videos.sql
│   ├── 003_create_comments.sql
│   ├── 004_create_live_rooms.sql
│   ├── 005_create_playlists.sql
│   ├── 006_create_chapters.sql
│   ├── 007_create_reports.sql
│   ├── 008_create_subscriptions.sql
│   ├── 009_create_video_likes.sql
│   └── 010_create_comment_likes.sql
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

---

## 7. Recommended Libraries

| Purpose | Library |
|---|---|
| HTTP framework | `github.com/gin-gonic/gin` or `github.com/go-chi/chi/v5` |
| MySQL driver | `github.com/go-sql-driver/mysql` + `github.com/jmoiron/sqlx` or `gorm.io/gorm` |
| Redis client | `github.com/redis/go-redis/v9` |
| JWT | `github.com/golang-jwt/jwt/v5` |
| Password hashing | `golang.org/x/crypto/bcrypt` |
| Config management | `github.com/spf13/viper` |
| Logging | `go.uber.org/zap` |
| Input validation | `github.com/go-playground/validator/v10` |
| ID generation | `github.com/bwmarrin/snowflake` |
| Message queue (optional) | `github.com/nsqio/go-nsq` or `github.com/rabbitmq/amqp091-go` |
| DB migration | `github.com/golang-migrate/migrate/v4` |

---

## 8. Async Tasks (Message Queue)

| Scenario | Producer | Consumer | Notes |
|---|---|---|---|
| Video transcoding | Upload endpoint sends `{vid, raw_url}` | Transcoding service consumes, updates `hls_url` on completion | Supports multiple resolutions (360p/720p/1080p) |
| View count flush | Cron job every minute reads dirty Redis keys | Batch `UPDATE` to MySQL | `GETSET video:{vid}:views 0` to atomically read + reset |
| Review notification | Review action endpoint sends `{vid, action}` | Notification service pushes to creator | In-app notification or email |
| Comment notification | Comment creation sends `{comment, target_uid}` | Notification service sends to video author / replied user | Can batch to reduce noise |
| Live replay generation | Stop-stream sends `{lid, recording_url}` | Recording service generates replay video | Creates new video record with type=replay |

---

## 9. Development Roadmap

### Phase 1 — Core (Frontend becomes fully functional)

1. User authentication (login / register / me / logout)
2. Feed endpoints (home / trending / subscriptions)
3. Video detail + recommendations
4. Shorts list
5. Comments CRUD (list / create / delete / like)
6. Channel detail

### Phase 2 — Creator + Live

7. Video like (with dedup)
8. Search endpoint
9. Live room list + detail + chat
10. All Studio endpoints (overview / content / upload / update / comments / live toggle)
11. Playlist detail

### Phase 3 — Admin + Optimization

12. All Admin endpoints (dashboard / review / reports / users)
13. Report system
14. Full Redis caching layer
15. Message queue async tasks
16. Rate limiting

---

## Appendix: Frontend Integration

When the backend is ready, the only frontend change needed is updating `src/lib/api/client.ts` to make real HTTP requests instead of calling `mockService`. Example:

```typescript
// Before (mock)
export const feedApi = {
  home: mockService.home,
};

// After (real)
export const feedApi = {
  home: (category = 'All') =>
    fetch(`/api/feed/home?category=${category}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
};
```

All 35 API endpoints, request/response formats, and business logic are documented above. No other frontend changes are required.
