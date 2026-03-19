import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGradebook } from '../../api/grades';

interface StudentItem {
  student_id: number;
  student_name: string;
}

export default function StudentsListPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await getGradebook();
        setStudents(data.students.map((s: StudentItem) => ({
          student_id: s.student_id,
          student_name: s.student_name,
        })));
      } catch {
        setError('Оқушылар тізімін жүктеу кезінде қате орын алды');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <p className="text-muted-foreground">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Оқушылар</h1>

      {students.length === 0 ? (
        <p className="text-muted-foreground">Оқушылар жоқ</p>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Аты-жөні</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Әрекет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s, idx) => (
                <tr key={s.student_id} className="hover:bg-secondary">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{s.student_name}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/teacher/students/${s.student_id}`)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm hover:underline"
                    >
                      Толығырақ
                    </button>
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
