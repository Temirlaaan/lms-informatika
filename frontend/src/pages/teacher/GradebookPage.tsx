import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGradebook } from '../../api/grades';

interface GradeEntry {
  grade_value: number;
  score: number;
}

interface StudentRow {
  student_id: number;
  student_name: string;
  grades: Record<string, GradeEntry>;
}

interface GradebookData {
  sections: string[];
  students: StudentRow[];
}

function gradeColor(grade: number): string {
  switch (grade) {
    case 5:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 4:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 3:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 2:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-muted-foreground dark:bg-gray-800/30';
  }
}

export default function GradebookPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGradebook = async () => {
      try {
        const res = await getGradebook();
        setData(res.data);
      } catch {
        setError('Журналды жүктеу кезінде қате орын алды');
      } finally {
        setLoading(false);
      }
    };
    fetchGradebook();
  }, []);

  if (loading) return <p className="text-muted-foreground">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-muted-foreground">Деректер жоқ</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Бағалар журналы</h1>

      {data.students.length === 0 ? (
        <p className="text-muted-foreground">Оқушылар жоқ</p>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase sticky left-0 bg-secondary z-10">
                  Оқушы
                </th>
                {data.sections.map((sec) => (
                  <th key={sec} className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                    {sec}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.students.map((student) => (
                <tr key={student.student_id} className="hover:bg-secondary">
                  <td className="px-4 py-3 text-sm font-medium sticky left-0 bg-card z-10">
                    <button
                      onClick={() => navigate(`/teacher/students/${student.student_id}`)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {student.student_name}
                    </button>
                  </td>
                  {data.sections.map((sec) => {
                    const entry = student.grades[sec];
                    return (
                      <td key={sec} className="px-4 py-3 text-center">
                        {entry ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold ${gradeColor(entry.grade_value)}`}
                            >
                              {entry.grade_value}
                            </span>
                            <span className="text-xs text-muted-foreground">{entry.score.toFixed(0)}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
