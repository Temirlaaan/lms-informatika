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

  if (loading) return <p className="text-gray-600">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Оқушылар</h1>

      {students.length === 0 ? (
        <p className="text-gray-500">Оқушылар жоқ</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Аты-жөні</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Әрекет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((s, idx) => (
                <tr key={s.student_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.student_name}</td>
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
