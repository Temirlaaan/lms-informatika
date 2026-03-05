import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProgress } from '../../api/courses';
import { getMyGrades } from '../../api/grades';

interface ProgressItem {
  section_id: number;
  section_title: string;
  total_topics: number;
  completed_topics: number;
  percentage: number;
}

interface GradeItem {
  id: number;
  section: number;
  section_title: string;
  score: number;
  grade_value: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getProgress().then((r) => setProgress(r.data)),
      getMyGrades().then((r) => setGrades(r.data)).catch(() => {}),
    ])
      .catch(() => setError('Деректерді жүктеу кезінде қате орын алды'))
      .finally(() => setLoading(false));
  }, []);

  const totalTopics = progress.reduce((s, p) => s + p.total_topics, 0);
  const completedTopics = progress.reduce((s, p) => s + p.completed_topics, 0);
  const overallPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Басты бет</h1>
        <p className="text-gray-600 mt-1">
          Қош келдіңіз, {user?.full_name || user?.username}!
        </p>
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Жалпы прогресс</h2>
        <div className="flex items-center gap-4">
          <div
            className="flex-1 bg-gray-200 rounded-full h-4"
            role="progressbar"
            aria-valuenow={overallPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="bg-accent h-4 rounded-full transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">{overallPercent}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {completedTopics} / {totalTopics} тақырып аяқталды
        </p>
      </div>

      {/* Section progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Бөлімдер</h2>
          <Link to="/student/sections" className="text-primary text-sm hover:underline">
            Барлығын көру
          </Link>
        </div>
        {progress.length === 0 ? (
          <p className="text-gray-400 text-sm">Бөлімдер әлі жоқ</p>
        ) : (
          <div className="space-y-3">
            {progress.map((p) => (
              <div key={p.section_id} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-48 truncate">{p.section_title}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{p.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent grades */}
      {grades.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Бағалар</h2>
            <Link to="/student/grades" className="text-primary text-sm hover:underline">
              Журналды көру
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {grades.map((g) => (
              <div key={g.id} className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 truncate">{g.section_title}</p>
                <p className={`text-2xl font-bold mt-1 ${
                  g.grade_value === 5 ? 'text-green-600' :
                  g.grade_value === 4 ? 'text-blue-600' :
                  g.grade_value === 3 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {g.grade_value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
