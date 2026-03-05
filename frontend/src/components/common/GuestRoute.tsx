import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) {
    const redirect = user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
