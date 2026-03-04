import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizByTopic, startQuiz, submitQuiz } from '../../api/quizzes';

interface ChoiceItem {
  id: number;
  text: string;
  order: number;
}

interface QuestionItem {
  id: number;
  text: string;
  question_type: 'single' | 'multiple' | 'true_false';
  points: number;
  order: number;
  choices: ChoiceItem[];
}

interface QuizData {
  id: number;
  title: string;
  description: string;
  time_limit_minutes: number;
  max_attempts: number;
  questions: QuestionItem[];
  attempts_used?: number;
}

export default function QuizPage() {
  const { id: topicId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (!quiz || !attemptId || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const payload = Object.entries(answers).map(([qId, cIds]) => ({
      question_id: Number(qId),
      selected_choice_ids: cIds,
    }));

    try {
      await submitQuiz(quiz.id, payload);
      navigate(`/student/quiz/${topicId}/result`, { state: { quizId: quiz.id, attemptId } });
    } catch {
      setError('Жіберу кезінде қате орын алды');
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [quiz, attemptId, answers, navigate, topicId]);

  useEffect(() => {
    if (timeLeft <= 0 && attemptId && !submittedRef.current) {
      handleSubmit();
    }
  }, [timeLeft, attemptId, handleSubmit]);

  useEffect(() => {
    if (!topicId) return;
    getQuizByTopic(Number(topicId))
      .then((r) => {
        setQuiz(r.data);
        if (r.data.attempts_used >= r.data.max_attempts) {
          setError('Әрекет лимитіне жеттіңіз');
          setLoading(false);
          return;
        }
        return startQuiz(r.data.id);
      })
      .then((r) => {
        if (r) {
          setAttemptId(r.data.attempt_id);
          setTimeLeft((quiz?.time_limit_minutes || 15) * 60);
        }
      })
      .catch(() => setError('Тестті жүктеу мүмкін болмады'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  useEffect(() => {
    if (quiz && attemptId) {
      setTimeLeft(quiz.time_limit_minutes * 60);
    }
  }, [quiz, attemptId]);

  useEffect(() => {
    if (timeLeft > 0 && attemptId) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attemptId, timeLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectChoice = (questionId: number, choiceId: number, type: string) => {
    setAnswers((prev) => {
      if (type === 'multiple') {
        const current = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: current.includes(choiceId)
            ? current.filter((id) => id !== choiceId)
            : [...current, choiceId],
        };
      }
      return { ...prev, [questionId]: [choiceId] };
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (error && !quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">← Артқа</button>
      </div>
    );
  }

  if (!quiz) return null;

  if (error === 'Әрекет лимитіне жеттіңіз') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{quiz.title}</h1>
        <p className="text-red-500 text-lg mb-4">Әрекет лимитіне жеттіңіз ({quiz.max_attempts}/{quiz.max_attempts})</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">← Артқа</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with timer */}
      <div className="sticky top-0 bg-white shadow-sm rounded-lg p-4 mb-6 flex justify-between items-center z-10">
        <h1 className="text-lg font-bold text-gray-800">{quiz.title}</h1>
        <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-gray-800">
                <span className="text-primary font-bold mr-2">{idx + 1}.</span>
                {q.text}
              </h3>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                {q.points} ұпай
              </span>
            </div>
            <div className="space-y-2">
              {q.choices.map((c) => {
                const selected = (answers[q.id] || []).includes(c.id);
                const isMultiple = q.question_type === 'multiple';
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                      selected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type={isMultiple ? 'checkbox' : 'radio'}
                      name={`q-${q.id}`}
                      checked={selected}
                      onChange={() => selectChoice(q.id, c.id, q.question_type)}
                      className="text-primary"
                    />
                    <span className="text-gray-700">{c.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 text-center pb-8">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? 'Жіберілуде...' : 'Жауаптарды жіберу'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
