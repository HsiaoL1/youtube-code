import { DEFAULT_HLS } from '@/lib/constants';
import type { Comment, LiveRoom, Playlist, User, Video } from '@/types';

const avatars = [
  'https://i.pravatar.cc/120?img=12',
  'https://i.pravatar.cc/120?img=24',
  'https://i.pravatar.cc/120?img=36',
  'https://i.pravatar.cc/120?img=48',
  'https://i.pravatar.cc/120?img=5',
  'https://i.pravatar.cc/120?img=15',
  'https://i.pravatar.cc/120?img=33',
  'https://i.pravatar.cc/120?img=57'
];

export const users: User[] = [
  {
    id: 'u1',
    name: 'Alice User',
    handle: '@alice',
    avatarUrl: avatars[0],
    role: 'user',
    followersCount: 1200
  },
  {
    id: 'u2',
    name: 'Chris Creator',
    handle: '@creator',
    avatarUrl: avatars[1],
    role: 'creator',
    followersCount: 98000
  },
  {
    id: 'u3',
    name: 'Ada Admin',
    handle: '@admin',
    avatarUrl: avatars[2],
    role: 'admin',
    followersCount: 3200
  },
  {
    id: 'u4',
    name: 'Nora Stream',
    handle: '@nora',
    avatarUrl: avatars[3],
    role: 'creator',
    followersCount: 45000
  },
  {
    id: 'u5',
    name: 'Max Gaming',
    handle: '@maxgaming',
    avatarUrl: avatars[4],
    role: 'creator',
    followersCount: 320000
  },
  {
    id: 'u6',
    name: 'Melody Vibes',
    handle: '@melodyvibes',
    avatarUrl: avatars[5],
    role: 'creator',
    followersCount: 1500000
  },
  {
    id: 'u7',
    name: 'News Daily',
    handle: '@newsdaily',
    avatarUrl: avatars[6],
    role: 'creator',
    followersCount: 890000
  },
  {
    id: 'u8',
    name: 'Sport Zone',
    handle: '@sportzone',
    avatarUrl: avatars[7],
    role: 'creator',
    followersCount: 670000
  }
];

const cover = (seed: string) => `https://picsum.photos/seed/${seed}/640/360`;

export const videos: Video[] = [
  {
    id: 'v1',
    type: 'long',
    title: 'React 18 in Production: Battle-tested Patterns',
    description: 'Deep dive into data, route and rendering patterns. We cover Suspense, transitions, server components, and how to structure large React applications for performance and maintainability.',
    coverUrl: cover('react18'),
    duration: 1330,
    views: 560000,
    likes: 22000,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    author: users[1],
    tags: ['react', 'frontend'],
    category: 'Tech',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v2',
    type: 'long',
    title: 'How We Designed a Modern Video UX',
    description: 'Case study on feed, playback, and creator flow. Learn about the design decisions behind building a video platform from scratch.',
    coverUrl: cover('ux'),
    duration: 920,
    views: 210000,
    likes: 8000,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    author: users[3],
    tags: ['ux', 'product'],
    category: 'Design',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v3',
    type: 'long',
    title: 'Top 10 Indie Games You Missed in 2024',
    description: 'Hidden gems from the indie scene that deserve your attention. From puzzle platformers to narrative adventures.',
    coverUrl: cover('indiegames'),
    duration: 1580,
    views: 890000,
    likes: 45000,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: users[4],
    tags: ['gaming', 'indie'],
    category: 'Gaming',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v4',
    type: 'long',
    title: 'Lo-fi Beats to Study & Relax To - 3 Hour Mix',
    description: 'Chill lo-fi hip hop beats perfect for studying, working, or relaxing. Enjoy 3 hours of uninterrupted vibes.',
    coverUrl: cover('lofi'),
    duration: 10800,
    views: 4200000,
    likes: 180000,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    author: users[5],
    tags: ['music', 'lofi', 'study'],
    category: 'Music',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v5',
    type: 'long',
    title: 'Breaking: Major Tech Layoffs Across Silicon Valley',
    description: 'Analysis of the latest wave of tech layoffs, what it means for the industry, and how affected workers can navigate this challenging time.',
    coverUrl: cover('technews'),
    duration: 720,
    views: 1300000,
    likes: 32000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: users[6],
    tags: ['news', 'tech'],
    category: 'News',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v6',
    type: 'long',
    title: 'Champions League Final Highlights',
    description: 'Full highlights from an incredible Champions League final. Goals, saves, and drama.',
    coverUrl: cover('football'),
    duration: 960,
    views: 5600000,
    likes: 210000,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    author: users[7],
    tags: ['sports', 'football'],
    category: 'Sports',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v7',
    type: 'long',
    title: 'Building a Full-Stack App with Next.js 15',
    description: 'Complete tutorial covering Next.js 15 features including server actions, parallel routes, and the new caching model.',
    coverUrl: cover('nextjs'),
    duration: 2400,
    views: 340000,
    likes: 15000,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    author: users[1],
    tags: ['nextjs', 'tutorial'],
    category: 'Education',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v8',
    type: 'long',
    title: 'Movie Recap: The Best Films of 2024',
    description: 'A look back at the most memorable films of the year, from blockbusters to art-house gems.',
    coverUrl: cover('movies'),
    duration: 1800,
    views: 780000,
    likes: 28000,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    author: users[3],
    tags: ['entertainment', 'movies'],
    category: 'Entertainment',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v9',
    type: 'long',
    title: 'Guitar Tutorial: Learn 5 Songs in 30 Minutes',
    description: 'Beginner-friendly guitar lesson. Learn to play popular songs with simple chords and strumming patterns.',
    coverUrl: cover('guitar'),
    duration: 1860,
    views: 450000,
    likes: 19000,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    author: users[5],
    tags: ['music', 'tutorial'],
    category: 'Music',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v10',
    type: 'long',
    title: 'Minecraft Speedrun World Record Attempt',
    description: 'Watch this insane speedrun attempt of Minecraft. Will we break the record?',
    coverUrl: cover('minecraft'),
    duration: 1200,
    views: 2100000,
    likes: 95000,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    author: users[4],
    tags: ['gaming', 'minecraft', 'speedrun'],
    category: 'Gaming',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v11',
    type: 'long',
    title: 'CSS Has Changed: Modern Techniques You Should Know',
    description: 'Container queries, cascade layers, :has() selector, and more. CSS in 2024 is incredibly powerful.',
    coverUrl: cover('moderncss'),
    duration: 1100,
    views: 280000,
    likes: 12000,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    author: users[1],
    tags: ['css', 'frontend'],
    category: 'Tech',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 'v12',
    type: 'long',
    title: 'NBA Playoffs: Top 10 Plays of the Week',
    description: 'The most jaw-dropping dunks, assists, and game-winners from this week in the NBA playoffs.',
    coverUrl: cover('nba'),
    duration: 660,
    views: 3400000,
    likes: 150000,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: users[7],
    tags: ['sports', 'basketball'],
    category: 'Sports',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  },
  {
    id: 's1',
    type: 'short',
    title: '30s Tip: Better Loading States',
    description: 'Skeletons > spinners for content surfaces.',
    coverUrl: cover('short1'),
    duration: 30,
    views: 99000,
    likes: 6300,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: users[1],
    tags: ['shorts'],
    category: 'Tech',
    visibility: 'public',
    status: 'published'
  },
  {
    id: 's2',
    type: 'short',
    title: '1 Minute CSS Grid Layout',
    description: 'Practical grid recipe in under a minute.',
    coverUrl: cover('short2'),
    duration: 45,
    views: 142000,
    likes: 10800,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: users[3],
    tags: ['css'],
    category: 'Tech',
    visibility: 'public',
    status: 'published'
  },
  {
    id: 's3',
    type: 'short',
    title: 'Insane Goal from Last Night',
    description: 'You have to see this bicycle kick!',
    coverUrl: cover('short3'),
    duration: 15,
    views: 2800000,
    likes: 180000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: users[7],
    tags: ['sports', 'football'],
    category: 'Sports',
    visibility: 'public',
    status: 'published'
  },
  {
    id: 's4',
    type: 'short',
    title: 'Epic Gaming Clutch Moment',
    description: '1v5 clutch that broke the internet.',
    coverUrl: cover('short4'),
    duration: 25,
    views: 1500000,
    likes: 95000,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    author: users[4],
    tags: ['gaming', 'clutch'],
    category: 'Gaming',
    visibility: 'public',
    status: 'published'
  },
  {
    id: 'r1',
    type: 'replay',
    title: 'Livestream Replay: Architecture AMA',
    description: 'Replay of live architecture discussion. We covered microservices, monoliths, and everything in between.',
    coverUrl: cover('replay'),
    duration: 3800,
    views: 42000,
    likes: 1800,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    author: users[3],
    tags: ['live', 'replay'],
    category: 'Tech',
    visibility: 'public',
    status: 'published',
    hlsUrl: DEFAULT_HLS
  }
];

export const liveRooms: LiveRoom[] = [
  {
    id: 'l1',
    title: 'Building Creator Studio Live',
    coverUrl: cover('live1'),
    author: users[3],
    viewers: 12400,
    category: 'Tech',
    status: 'live',
    hlsUrl: DEFAULT_HLS,
    startedAt: new Date(Date.now() - 3600_000).toISOString()
  },
  {
    id: 'l2',
    title: 'Frontend System Design Review',
    coverUrl: cover('live2'),
    author: users[1],
    viewers: 5300,
    category: 'Education',
    status: 'live',
    hlsUrl: DEFAULT_HLS,
    startedAt: new Date(Date.now() - 5200_000).toISOString()
  },
  {
    id: 'l3',
    title: 'Late Night Gaming Session - Elden Ring DLC',
    coverUrl: cover('live3'),
    author: users[4],
    viewers: 28900,
    category: 'Gaming',
    status: 'live',
    hlsUrl: DEFAULT_HLS,
    startedAt: new Date(Date.now() - 7200_000).toISOString()
  },
  {
    id: 'l4',
    title: 'Live Music Production: Making a Beat from Scratch',
    coverUrl: cover('live4'),
    author: users[5],
    viewers: 8700,
    category: 'Music',
    status: 'live',
    hlsUrl: DEFAULT_HLS,
    startedAt: new Date(Date.now() - 1800_000).toISOString()
  }
];

export const playlists: Playlist[] = [
  {
    id: 'p1',
    title: 'Frontend Architecture Series',
    items: videos.filter((v) => ['v1', 'v2', 'r1'].includes(v.id))
  }
];

export let comments: Comment[] = [
  {
    id: 'c1',
    entityType: 'video',
    entityId: 'v1',
    author: users[0],
    content: 'This was the clearest explanation of query keys I\'ve ever seen. Subscribed!',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likeCount: 120
  },
  {
    id: 'c2',
    entityType: 'video',
    entityId: 'v1',
    author: users[1],
    content: 'Thanks! We will publish part 2 soon.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likeCount: 32,
    parentId: 'c1'
  },
  {
    id: 'c3',
    entityType: 'live',
    entityId: 'l1',
    author: users[0],
    content: '@creator can you share the repo later?',
    createdAt: new Date(Date.now() - 200000).toISOString(),
    likeCount: 2
  },
  {
    id: 'c4',
    entityType: 'video',
    entityId: 'v1',
    author: users[4],
    content: 'Great video! I wish you covered more about React Server Components though.',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    likeCount: 45
  },
  {
    id: 'c5',
    entityType: 'video',
    entityId: 'v3',
    author: users[0],
    content: 'Number 7 was so good! I played it for like 40 hours straight.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likeCount: 89
  },
  {
    id: 'c6',
    entityType: 'video',
    entityId: 'v3',
    author: users[5],
    content: 'The soundtrack alone makes some of these worth playing.',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    likeCount: 28
  },
  {
    id: 'c7',
    entityType: 'video',
    entityId: 'v4',
    author: users[0],
    content: 'I listen to this every day while working. Thank you for making it!',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    likeCount: 340
  },
  {
    id: 'c8',
    entityType: 'video',
    entityId: 'v6',
    author: users[4],
    content: 'What a match! That last-minute goal was unreal.',
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    likeCount: 156
  },
  {
    id: 'c9',
    entityType: 'video',
    entityId: 'v7',
    author: users[0],
    content: 'Finally a Next.js 15 tutorial that actually explains the caching changes properly.',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    likeCount: 67
  },
  {
    id: 'c10',
    entityType: 'video',
    entityId: 'v10',
    author: users[7],
    content: 'The RNG on that Ender Pearl was insane, no way that was legit lol',
    createdAt: new Date(Date.now() - 36000000).toISOString(),
    likeCount: 203
  },
  {
    id: 'c11',
    entityType: 'video',
    entityId: 'v10',
    author: users[4],
    content: 'It was 100% legit, I verified the seed. Check the description for proof.',
    createdAt: new Date(Date.now() - 32000000).toISOString(),
    likeCount: 89,
    parentId: 'c10'
  }
];

export let currentUser: User | null = null;

export const authAccounts = [
  { identifier: 'user', password: '123456', userId: 'u1' },
  { identifier: 'creator', password: '123456', userId: 'u2' },
  { identifier: 'admin', password: '123456', userId: 'u3' }
];

export const chapters = [
  { id: 'ch1', title: 'Introduction', time: 0 },
  { id: 'ch2', title: 'Data Layer', time: 220 },
  { id: 'ch3', title: 'Route Strategy', time: 570 },
  { id: 'ch4', title: 'Q&A', time: 980 }
];
