import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, BookOpen, Award, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/student/dashboard', label: 'Басты бет', icon: Home },
  { path: '/student/sections', label: 'Бөлімдер', icon: BookOpen },
  { path: '/student/grades', label: 'Бағалар', icon: Award },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEsc);

    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden bg-primary text-primary-foreground p-4 flex justify-between items-center border-b">
        <span className="font-bold">LMS Информатика</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary/80"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Мәзірді жабу' : 'Мәзірді ашу'}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card shadow-lg border-r transform transition-transform lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary hidden lg:block">LMS Информатика</h2>
              <div className="mt-3">
                <Link to="/student/profile" className="flex items-center gap-3 hover:text-primary transition" onClick={() => setSidebarOpen(false)}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.full_name || user?.username || 'Аватар'} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {(user?.full_name || user?.username || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-card-foreground">{user?.full_name || user?.username}</p>
                    {user?.grade_class && (
                      <p className="text-sm text-muted-foreground">Сынып: {user.grade_class}</p>
                    )}
                  </div>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  asChild
                >
                  <Link to={item.path} onClick={() => setSidebarOpen(false)}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}

            <Button
              variant={isActive('/student/profile') ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              asChild
            >
              <Link to="/student/profile" onClick={() => setSidebarOpen(false)}>
                <User className="h-4 w-4" />
                Профиль
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Шығу
            </Button>
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
