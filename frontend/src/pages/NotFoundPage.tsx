import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();

  const homeLink = user
    ? user.role === 'teacher'
      ? '/teacher/dashboard'
      : '/student/dashboard'
    : '/';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Бет табылмады</h2>
        <p className="text-gray-600 mb-6">
          Сіз іздеген бет табылмады немесе жойылған.
        </p>
        <Link
          to={homeLink}
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Басты бетке оралу
        </Link>
      </div>
    </div>
  );
}
