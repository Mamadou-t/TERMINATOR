import { Navigate, Outlet } from 'react-router';
import { Loading } from '~/src/components';
import { useAuth } from '~/src/context/AuthContext';

export default function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Verification de la session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
