import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStatistics } from '../../api/grades';

interface SectionStat {
  section_name: string;
  avg_score: number;
  students_completed: number;
  total_students: number;
  completion_rate: number;
}

interface Statistics {
  total_students: number;
  total_sections: number;
  total_quizzes: number;
  average_score: number;
  section_stats: SectionStat[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getStatistics();
        setStats(data);
      } catch {
        setError('Статистиканы жүктеу кезінде қате орын алды');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-gray-600">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Басты бет</h1>
      <p className="text-gray-600 mb-6">
        Қош келдіңіз, {user?.full_name || user?.username}!
      </p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Оқушылар саны</p>
          <p className="text-3xl font-bold text-indigo-600">{stats?.total_students ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Бөлімдер саны</p>
          <p className="text-3xl font-bold text-green-600">{stats?.total_sections ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Тесттер саны</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.total_quizzes ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Орташа балл</p>
          <p className="text-3xl font-bold text-amber-600">
            {stats?.average_score != null ? `${stats.average_score.toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Per-section statistics */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Бөлімдер бойынша статистика</h2>
      {stats?.section_stats && stats.section_stats.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Бөлім</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Орташа балл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Аяқтаған оқушылар</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Аяқтау деңгейі</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.section_stats.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.section_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.avg_score.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {s.students_completed} / {s.total_students}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${s.completion_rate}%` }}
                        />
                      </div>
                      <span className="text-gray-700">{s.completion_rate.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">Статистика жоқ</p>
      )}
    </div>
  );
}
