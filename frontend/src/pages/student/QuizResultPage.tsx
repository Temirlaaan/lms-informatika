import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getAttemptDetail } from '../../api/quizzes';

interface ChoiceResult {
  id: number;
  text: string;
  is_correct: boolean;
}

interface QuestionResult {
  id: number;
  text: string;
  question_type: string;
  points: number;
  choices: ChoiceResult[];
}

interface AnswerResult {
  id: number;
  question: QuestionResult;
  selected_choice_ids: number[];
  is_correct: boolean;
  points_earned: number;
}

interface AttemptResult {
  id: number;
  quiz: number;
  quiz_title: string;
  score: number;
  total_points: number;
  earned_points: number;
  answers: AnswerResult[];
}

function gradeFromScore(score: number): number {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  return 2;
}

export default function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  const { attemptId } = (location.state || {}) as { quizId?: number; attemptId?: number };

  useEffect(() => {
    if (!attemptId) {
      navigate('/student/sections');
      return;
    }
    getAttemptDetail(attemptId)
      .then((r) => setResult(r.data))
      .catch(() => navigate('/student/sections'))
      .finally(() => setLoading(false));
  }, [attemptId, navigate]);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!result) return null;

  const grade = gradeFromScore(result.score);
  const gradeColor =
    grade === 5 ? 'text-green-600' :
    grade === 4 ? 'text-blue-600' :
    grade === 3 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{result.quiz_title}</h1>
        <p className="text-gray-500 mb-4">Тест нәтижесі</p>
        <div className="flex justify-center gap-8">
          <div>
            <p className="text-4xl font-bold text-primary">{result.score}%</p>
            <p className="text-sm text-gray-500">Нәтиже</p>
          </div>
          <div>
            <p className={`text-4xl font-bold ${gradeColor}`}>{grade}</p>
            <p className="text-sm text-gray-500">Баға</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-700">{result.earned_points}/{result.total_points}</p>
            <p className="text-sm text-gray-500">Ұпай</p>
          </div>
        </div>
      </div>

      {/* Answers breakdown */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Жауаптар</h2>
      <div className="space-y-4">
        {result.answers.map((a, idx) => (
          <div key={a.id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
            a.is_correct ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-800">
                <span className="mr-2">{idx + 1}.</span>
                {a.question.text}
              </h3>
              <span className={`text-sm font-medium ${a.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                {a.points_earned}/{a.question.points} ұпай
              </span>
            </div>
            <div className="space-y-1">
              {a.question.choices.map((c) => {
                const wasSelected = a.selected_choice_ids.includes(c.id);
                let bg = '';
                if (c.is_correct) bg = 'bg-green-50 text-green-700';
                else if (wasSelected && !c.is_correct) bg = 'bg-red-50 text-red-700';
                return (
                  <div key={c.id} className={`flex items-center gap-2 p-2 rounded ${bg}`}>
                    <span>
                      {c.is_correct ? '✓' : wasSelected ? '✗' : '○'}
                    </span>
                    <span>{c.text}</span>
                    {wasSelected && <span className="text-xs ml-auto">(Сіздің жауабыңыз)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center pb-8">
        <Link
          to="/student/sections"
          className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Бөлімдерге оралу
        </Link>
      </div>
    </div>
  );
}
