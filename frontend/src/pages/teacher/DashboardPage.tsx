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

  if (loading) return <p className="text-muted-foreground">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Басты бет</h1>
      <p className="text-muted-foreground mb-6">
        Қош келдіңіз, {user?.full_name || user?.username}!
      </p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg shadow p-5">
          <p className="text-sm text-muted-foreground">Оқушылар саны</p>
          <p className="text-3xl font-bold text-indigo-600">{stats?.total_students ?? 0}</p>
        </div>
        <div className="bg-card rounded-lg shadow p-5">
          <p className="text-sm text-muted-foreground">Бөлімдер саны</p>
          <p className="text-3xl font-bold text-green-600">{stats?.total_sections ?? 0}</p>
        </div>
        <div className="bg-card rounded-lg shadow p-5">
          <p className="text-sm text-muted-foreground">Тесттер саны</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.total_quizzes ?? 0}</p>
        </div>
        <div className="bg-card rounded-lg shadow p-5">
          <p className="text-sm text-muted-foreground">Орташа балл</p>
          <p className="text-3xl font-bold text-amber-600">
            {stats?.average_score != null ? `${stats.average_score.toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Per-section statistics */}
      <h2 className="text-lg font-semibold text-foreground mb-3">Бөлімдер бойынша статистика</h2>
      {stats?.section_stats && stats.section_stats.length > 0 ? (
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Бөлім</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Орташа балл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Аяқтаған оқушылар</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Аяқтау деңгейі</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.section_stats.map((s, idx) => (
                <tr key={idx} className="hover:bg-secondary">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{s.section_name}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{s.avg_score.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {s.students_completed} / {s.total_students}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 max-w-[120px]">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${s.completion_rate}%` }}
                        />
                      </div>
                      <span className="text-foreground">{s.completion_rate.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted-foreground">Статистика жоқ</p>
      )}
    </div>
  );
}
