import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import type { Role } from '@/types';

export function RoleRoute({ allow }: { allow: Role[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
