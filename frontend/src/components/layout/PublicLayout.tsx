import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary">
              LMS Информатика
            </Link>
            <nav className="flex items-center gap-4">
              {user ? (
                <Link
                  to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {user.full_name || user.username}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary transition"
                  >
                    Кіру
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Тіркелу
                  </Link>
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
