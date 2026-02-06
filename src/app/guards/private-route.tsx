import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

export function PrivateRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
