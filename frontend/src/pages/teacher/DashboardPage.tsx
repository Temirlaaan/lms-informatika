import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Басты бет</h1>
      <p className="text-gray-600">
        Қош келдіңіз, {user?.full_name || user?.username}! Бұл мұғалім панелі.
      </p>
    </div>
  );
}
