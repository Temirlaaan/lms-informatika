import { useEffect, useState } from 'react';
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

  useEffect(() => {
    getMyGrades()
      .then((r) => setGrades(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const gradeColor = (value: number) => {
    if (value === 5) return 'text-green-600 bg-green-50';
    if (value === 4) return 'text-blue-600 bg-blue-50';
    if (value === 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Бағалар журналы</h1>

      {grades.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          Бағалар әлі жоқ. Тест тапсырыңыз!
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Бөлім</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Нәтиже (%)</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Баға</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map((g) => (
                <tr key={g.id}>
                  <td className="px-6 py-4 text-gray-800">{g.section_title}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{g.score}%</td>
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
