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

/** Build a localStorage key for this quiz attempt's end-time */
function timerKey(quizId: number, attemptId: number) {
  return `quiz_end_${quizId}_${attemptId}`;
}

export default function QuizPage() {
  const { id: topicId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [timeLeft, setTimeLeft] = useState(-1);
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

    // Clean up timer from localStorage
    localStorage.removeItem(timerKey(quiz.id, attemptId));

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
    if (timeLeft === 0 && attemptId && !submittedRef.current) {
      handleSubmit();
    }
  }, [timeLeft, attemptId, handleSubmit]);

  useEffect(() => {
    if (!topicId) return;
    let quizData: QuizData;
    getQuizByTopic(Number(topicId))
      .then((r) => {
        quizData = r.data;
        setQuiz(quizData);
        if (quizData.attempts_used !== undefined && quizData.attempts_used >= quizData.max_attempts) {
          setError('Әрекет лимитіне жеттіңіз');
          setLoading(false);
          return;
        }
        return startQuiz(quizData.id);
      })
      .then((r) => {
        if (r) {
          const aId = r.data.attempt_id;
          setAttemptId(aId);

          // Resilient timer: check localStorage first, then compute from started_at
          const key = timerKey(quizData.id, aId);
          const storedEnd = localStorage.getItem(key);
          let endTimeMs: number;

          if (storedEnd) {
            endTimeMs = Number(storedEnd);
          } else if (r.data.started_at) {
            // Backend returned started_at — compute end time from it
            const startedMs = new Date(r.data.started_at).getTime();
            endTimeMs = startedMs + quizData.time_limit_minutes * 60 * 1000;
            localStorage.setItem(key, String(endTimeMs));
          } else {
            // Fallback: start fresh timer from now
            endTimeMs = Date.now() + quizData.time_limit_minutes * 60 * 1000;
            localStorage.setItem(key, String(endTimeMs));
          }

          const remaining = Math.max(0, Math.floor((endTimeMs - Date.now()) / 1000));
          setTimeLeft(remaining);
        }
      })
      .catch(() => setError('Тестті жүктеу мүмкін болмады'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const timerActive = timeLeft > 0 && attemptId !== null;

  useEffect(() => {
    if (!timerActive) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

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
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">&larr; Артқа</button>
      </div>
    );
  }

  if (!quiz) return null;

  if (error === 'Әрекет лимитіне жеттіңіз') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">{quiz.title}</h1>
        <p className="text-red-500 text-lg mb-4">Әрекет лимитіне жеттіңіз ({quiz.max_attempts}/{quiz.max_attempts})</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">&larr; Артқа</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with timer and progress */}
      <div className="sticky top-0 bg-card shadow-sm rounded-lg p-4 mb-6 flex justify-between items-center z-10">
        <div>
          <h1 className="text-lg font-bold text-foreground">{quiz.title}</h1>
          <p className="text-xs text-muted-foreground">
            {Object.keys(answers).length} / {quiz.questions.length} сұрақ жауапталды
          </p>
        </div>
        <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="bg-card rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-foreground">
                <span className="text-primary font-bold mr-2">{idx + 1}.</span>
                {q.text}
              </h3>
              <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
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
                      selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'
                    }`}
                  >
                    <input
                      type={isMultiple ? 'checkbox' : 'radio'}
                      name={`q-${q.id}`}
                      checked={selected}
                      onChange={() => selectChoice(q.id, c.id, q.question_type)}
                      className="text-primary"
                    />
                    <span className="text-foreground">{c.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 text-center pb-8">
        {Object.keys(answers).length < quiz.questions.length && (
          <p className="text-amber-600 text-sm mb-3">
            {quiz.questions.length - Object.keys(answers).length} сұраққа жауап берілмеді
          </p>
        )}
        <button
          onClick={() => {
            const unanswered = quiz.questions.length - Object.keys(answers).length;
            if (unanswered > 0) {
              if (!confirm(`${unanswered} сұраққа жауап берілмеді. Жіберу керек пе?`)) return;
            }
            handleSubmit();
          }}
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
