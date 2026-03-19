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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-2">Бет табылмады</h2>
        <p className="text-muted-foreground mb-6">
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
