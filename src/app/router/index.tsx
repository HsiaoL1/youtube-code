import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/app/layout/app-shell';
import { RoleRoute } from '@/app/guards/role-route';
import { HomePage, SubscriptionsPage, TrendingPage } from '@/features/feed/pages';
import { SearchPage } from '@/features/search/page';
import { WatchPage } from '@/features/watch/page';
import { ShortsPage } from '@/features/shorts/page';
import { LiveRoomPage, LiveSquarePage } from '@/features/live/pages';
import { ChannelPage } from '@/features/channel/page';
import { PlaylistPage } from '@/features/watch/playlist-page';
import { LoginPage, RegisterPage } from '@/features/auth/pages';
import {
  StudioCommentsPage,
  StudioContentPage,
  StudioLivePage,
  StudioOverviewPage,
  StudioSettingsPage,
  StudioUploadPage
} from '@/features/studio/pages';
import { AdminContentReviewPage, AdminDashboardPage, AdminReportsPage, AdminUsersPage } from '@/features/admin/pages';

function Placeholder({ title }: { title: string }) {
  return <div className="rounded-lg border p-8 text-sm text-muted-foreground">{title}</div>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'trending', element: <TrendingPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'watch/:id', element: <WatchPage /> },
      { path: 'shorts', element: <ShortsPage /> },
      { path: 'live', element: <LiveSquarePage /> },
      { path: 'live/:id', element: <LiveRoomPage /> },
      { path: 'channel/:id', element: <ChannelPage /> },
      { path: 'playlist/:id', element: <PlaylistPage /> },
      { path: 'history', element: <Placeholder title="观看历史（mock）" /> },

      { element: <RoleRoute allow={['creator', 'admin']} />, children: [
        { path: 'studio', element: <StudioOverviewPage /> },
        { path: 'studio/upload', element: <StudioUploadPage /> },
        { path: 'studio/content', element: <StudioContentPage /> },
        { path: 'studio/live', element: <StudioLivePage /> },
        { path: 'studio/comments', element: <StudioCommentsPage /> },
        { path: 'studio/settings', element: <StudioSettingsPage /> }
      ]},

      { element: <RoleRoute allow={['admin']} />, children: [
        { path: 'admin/dashboard', element: <AdminDashboardPage /> },
        { path: 'admin/content', element: <AdminContentReviewPage /> },
        { path: 'admin/reports', element: <AdminReportsPage /> },
        { path: 'admin/users', element: <AdminUsersPage /> }
      ]}
    ]
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '*', element: <Navigate to="/" replace /> }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
