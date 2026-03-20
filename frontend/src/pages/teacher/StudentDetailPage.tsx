import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentGrades } from '../../api/grades';

interface StudentGradeEntry {
  section_name: string;
  grade_value: number;
  score: number;
}

interface StudentDetail {
  student_id: number;
  student_name: string;
  grade_class: string;
  grades: StudentGradeEntry[];
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

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const { data } = await getStudentGrades(Number(id));
        setStudent(data);
      } catch {
        setError('Оқушы деректерін жүктеу кезінде қате орын алды');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p className="text-muted-foreground">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!student) return <p className="text-muted-foreground">Оқушы табылмады</p>;

  return (
    <div>
      <button
        onClick={() => navigate('/teacher/gradebook')}
        className="text-indigo-600 hover:text-indigo-800 text-sm mb-4 inline-block"
      >
        &larr; Журналға оралу
      </button>

      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">{student.student_name}</h1>
        {student.grade_class && (
          <p className="text-muted-foreground">Сынып: {student.grade_class}</p>
        )}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-3">Бөлімдер бойынша бағалар</h2>

      {student.grades.length === 0 ? (
        <p className="text-muted-foreground">Бағалар жоқ</p>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Бөлім</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Баға</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Балл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {student.grades.map((g, idx) => (
                <tr key={idx} className="hover:bg-secondary">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{g.section_name}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold ${gradeColor(g.grade_value)}`}
                    >
                      {g.grade_value}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-foreground">{g.score.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
