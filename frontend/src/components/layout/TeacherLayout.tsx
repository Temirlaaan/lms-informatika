import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/teacher/dashboard', label: 'Басты бет', icon: '🏠' },
  { path: '/teacher/content', label: 'Контент', icon: '📝' },
  { path: '/teacher/quizzes', label: 'Тесттер', icon: '✅' },
  { path: '/teacher/gradebook', label: 'Журнал', icon: '📊' },
  { path: '/teacher/students', label: 'Оқушылар', icon: '👥' },
];

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-primary text-white p-4 flex justify-between items-center">
        <span className="font-bold">LMS Информатика — Мұғалім</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white text-2xl"
          aria-label={sidebarOpen ? 'Мәзірді жабу' : 'Мәзірді ашу'}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform
            lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-primary hidden lg:block">LMS Информатика</h2>
            <p className="text-xs text-accent font-medium hidden lg:block">Мұғалім панелі</p>
            <div className="mt-3">
              <Link to="/teacher/profile" className="hover:text-primary transition" onClick={() => setSidebarOpen(false)}>
                <p className="font-medium text-gray-800">{user?.full_name || user?.username}</p>
              </Link>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <Link
              to="/teacher/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive('/teacher/profile')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>👤</span>
              <span>Профиль</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition w-full"
            >
              <span>🚪</span>
              <span>Шығу</span>
            </button>
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
