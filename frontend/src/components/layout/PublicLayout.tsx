import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary">
              LMS Информатика
            </Link>
            <nav className="flex items-center gap-2" aria-label="Басты навигация">
              <ThemeToggle />
              {user ? (
                <Button asChild>
                  <Link
                    to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                  >
                    {user.full_name || user.username}
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Кіру</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Тіркелу</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
