import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { getMyGrades } from '../../api/grades';

interface GradeItem {
  id: number;
  section: number;
  section_title: string;
  score: number;
  grade_value: number;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyGrades()
      .then((r) => setGrades(r.data))
      .catch(() => setError('Бағаларды жүктеу кезінде қате орын алды'))
      .finally(() => setLoading(false));
  }, []);

  const gradeColor = (value: number) => {
    if (value === 5) return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    if (value === 4) return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    if (value === 3) return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Бағалар журналы</h1>

      {grades.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center">
          <Award className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Бағалар әлі жоқ</h3>
          <p className="text-muted-foreground mb-4">Тест тапсырыңыз, нәтижелер осында көрінеді</p>
          <Link to="/student" className="text-primary hover:underline">
            Бөлімдерге өту
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Бөлім</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground">Нәтиже (%)</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground">Баға</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {grades.map((g) => (
                <tr key={g.id}>
                  <td className="px-6 py-4 text-foreground">{g.section_title}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground">{g.score}%</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block w-10 h-10 leading-10 rounded-full font-bold text-lg ${gradeColor(g.grade_value)}`}>
                      {g.grade_value}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
