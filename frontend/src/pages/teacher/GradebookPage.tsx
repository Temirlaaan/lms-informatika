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
      return 'bg-green-100 text-green-800';
    case 4:
      return 'bg-blue-100 text-blue-800';
    case 3:
      return 'bg-yellow-100 text-yellow-800';
    case 2:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-600';
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

  if (loading) return <p className="text-gray-600">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-gray-500">Деректер жоқ</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Бағалар журналы</h1>

      {data.students.length === 0 ? (
        <p className="text-gray-500">Оқушылар жоқ</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                  Оқушы
                </th>
                {data.sections.map((sec) => (
                  <th key={sec} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {sec}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.students.map((student) => (
                <tr key={student.student_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium sticky left-0 bg-white z-10">
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
                              className={`inline-block w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${gradeColor(entry.grade_value)}`}
                            >
                              {entry.grade_value}
                            </span>
                            <span className="text-xs text-gray-400">{entry.score.toFixed(0)}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
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
