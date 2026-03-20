import { useState, useEffect } from 'react';
import type { Section, Topic, Quiz, Question, Choice } from '../../types';
import {
  getTeacherSections,
  getTeacherTopics,
  getTeacherQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createChoice,
  updateChoice,
  deleteChoice,
} from '../../api/teacher';
import { useToast } from '../../components/common/Toast';

/* ─── Choice Editor ─── */
function ChoiceRow({
  choice,
  onUpdate,
  onDelete,
}: {
  choice: Choice;
  onUpdate: (data: Partial<Choice>) => void;
  onDelete: () => void;
}) {
  const [text, setText] = useState(choice.text);
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center gap-2 py-1">
      <input
        type="checkbox"
        checked={choice.is_correct ?? false}
        onChange={(e) => onUpdate({ is_correct: e.target.checked })}
        title="Дұрыс жауап"
      />
      {editing ? (
        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            onUpdate({ text });
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUpdate({ text });
              setEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        <span
          className="flex-1 text-sm text-foreground cursor-pointer hover:text-indigo-600"
          onClick={() => setEditing(true)}
        >
          {choice.text || 'Жауап мәтінін жазыңыз...'}
        </span>
      )}
      <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-xs">
        Жою
      </button>
    </div>
  );
}

/* ─── Question Editor ─── */
function QuestionEditor({
  question,
  onRefresh,
  onError,
}: {
  question: Question;
  onRefresh: () => void;
  onError: (msg: string) => void;
}) {
  const [text, setText] = useState(question.text);
  const [qType, setQType] = useState(question.question_type);
  const [points, setPoints] = useState(question.points);
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    try {
      await updateQuestion(question.id, { text, question_type: qType, points });
      setEditing(false);
      onRefresh();
    } catch {
      onError('Сұрақты сақтау кезінде қате орын алды');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm('Сұрақты жою керек пе?')) return;
    try {
      await deleteQuestion(question.id);
      onRefresh();
    } catch {
      onError('Сұрақты жою кезінде қате орын алды');
    }
  };

  const handleAddChoice = async () => {
    try {
      await createChoice({
        question: question.id,
        text: '',
        is_correct: false,
        order: (question.choices?.length ?? 0) + 1,
      });
      onRefresh();
    } catch {
      onError('Жауап нұсқасын қосу кезінде қате орын алды');
    }
  };

  const handleUpdateChoice = async (choiceId: number, data: Partial<Choice>) => {
    try {
      await updateChoice(choiceId, data);
      onRefresh();
    } catch {
      onError('Жауапты жаңарту кезінде қате орын алды');
    }
  };

  const handleDeleteChoice = async (choiceId: number) => {
    try {
      await deleteChoice(choiceId);
      onRefresh();
    } catch {
      onError('Жауапты жою кезінде қате орын алды');
    }
  };

  return (
    <div className="border rounded p-3 bg-card space-y-2">
      <div className="flex items-start justify-between">
        {editing ? (
          <div className="flex-1 space-y-2">
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Сұрақ мәтіні"
            />
            <div className="flex gap-3">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={qType}
                onChange={(e) => setQType(e.target.value as Question['question_type'])}
              >
                <option value="single">Бір жауапты</option>
                <option value="multiple">Көп жауапты</option>
                <option value="true_false">Дұрыс/Бұрыс</option>
              </select>
              <input
                type="number"
                className="w-20 border rounded px-2 py-1 text-sm"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={1}
              />
              <span className="text-xs text-muted-foreground mt-1">балл</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700">
                Сақтау
              </button>
              <button onClick={() => setEditing(false)} className="bg-gray-300 text-foreground px-3 py-1 rounded text-xs">
                Болдырмау
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{question.text}</p>
            <p className="text-xs text-muted-foreground">
              {qType === 'single' ? 'Бір жауапты' : qType === 'multiple' ? 'Көп жауапты' : 'Дұрыс/Бұрыс'}{' '}
              | {points} балл
            </p>
          </div>
        )}
        <div className="flex gap-2 ml-2">
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-indigo-600 hover:text-indigo-800 text-xs">
              Өзгерту
            </button>
          )}
          <button onClick={handleDeleteQuestion} className="text-red-600 hover:text-red-800 text-xs">
            Жою
          </button>
        </div>
      </div>

      {/* Choices */}
      <div className="ml-4 border-l-2 border-border pl-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">Жауап нұсқалары</span>
          <button onClick={handleAddChoice} className="text-green-600 hover:text-green-800 text-xs">
            + Нұсқа қосу
          </button>
        </div>
        {question.choices && question.choices.length > 0 ? (
          question.choices
            .sort((a, b) => a.order - b.order)
            .map((c) => (
              <ChoiceRow
                key={c.id}
                choice={c}
                onUpdate={(data) => handleUpdateChoice(c.id, data)}
                onDelete={() => handleDeleteChoice(c.id)}
              />
            ))
        ) : (
          <p className="text-xs text-muted-foreground">Жауап нұсқалары жоқ</p>
        )}
      </div>
    </div>
  );
}

/* ─── Quiz Form ─── */
function QuizForm({
  topics,
  initial,
  onSave,
  onCancel,
}: {
  topics: Topic[];
  initial?: Quiz;
  onSave: (data: Partial<Quiz>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [topicId, setTopicId] = useState(initial?.topic ?? (topics[0]?.id ?? 0));
  const [timeLimit, setTimeLimit] = useState(initial?.time_limit_minutes ?? 30);
  const [passingScore, setPassingScore] = useState(initial?.passing_score ?? 60);
  const [maxAttempts, setMaxAttempts] = useState(initial?.max_attempts ?? 3);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      topic: topicId,
      time_limit_minutes: timeLimit,
      passing_score: passingScore,
      max_attempts: maxAttempts,
      is_published: isPublished,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-secondary border rounded-lg p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Тест атауы</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Тақырып</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={topicId}
            onChange={(e) => setTopicId(Number(e.target.value))}
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Сипаттама</label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Уақыт (мин)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Өту балы (%)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Макс. талпыныс</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Number(e.target.value))}
            min={1}
          />
        </div>
        <label className="flex items-center gap-2 mt-6">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          <span className="text-sm text-foreground">Жарияланған</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
          Сақтау
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 text-foreground px-4 py-2 rounded text-sm hover:bg-gray-400">
          Болдырмау
        </button>
      </div>
    </form>
  );
}

/* ─── Main Page ─── */
export default function QuizManagerPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Record<number, Question[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { showToast } = useToast();
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);

  const fetchAll = async () => {
    try {
      const [secRes, topRes, quizRes] = await Promise.all([
        getTeacherSections(),
        getTeacherTopics(),
        getTeacherQuizzes(),
      ]);
      setSections(secRes.data);
      setTopics(topRes.data);
      const quizzesData: Quiz[] = quizRes.data;
      setQuizzes(quizzesData);

      // Build questions map from quiz data if available
      const qMap: Record<number, Question[]> = {};
      quizzesData.forEach((q: Quiz & { questions?: Question[] }) => {
        if (q.questions) {
          qMap[q.id] = q.questions;
        }
      });
      setQuizQuestions(qMap);
    } catch {
      setError('Деректерді жүктеу кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSaveQuiz = async (data: Partial<Quiz>) => {
    try {
      if (editingQuiz) {
        await updateQuiz(editingQuiz.id, data);
      } else {
        await createQuiz(data);
      }
      setShowQuizForm(false);
      setEditingQuiz(null);
      await fetchAll();
    } catch {
      showToast('Тестті сақтау кезінде қате орын алды', 'error');
    }
  };

  const handleDeleteQuiz = async (id: number) => {
    if (!confirm('Тестті жою керек пе? Барлық сұрақтар мен жауаптар жойылады.')) return;
    try {
      await deleteQuiz(id);
      await fetchAll();
    } catch {
      showToast('Тестті жою кезінде қате орын алды', 'error');
    }
  };

  const handleAddQuestion = async (quizId: number) => {
    try {
      await createQuestion({
        quiz: quizId,
        text: 'Жаңа сұрақ',
        question_type: 'single',
        points: 1,
        order: (quizQuestions[quizId]?.length ?? 0) + 1,
      });
      await fetchAll();
    } catch {
      showToast('Сұрақ қосу кезінде қате орын алды', 'error');
    }
  };

  const getTopicName = (topicId: number) => topics.find((t) => t.id === topicId)?.title ?? '';
  const getSectionForTopic = (topicId: number) => {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? sections.find((s) => s.id === topic.section) : undefined;
  };

  if (loading) return <p className="text-muted-foreground">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Group quizzes by section
  const quizzesBySection: Record<number, Quiz[]> = {};
  quizzes.forEach((q) => {
    const sec = getSectionForTopic(q.topic);
    const secId = sec?.id ?? 0;
    if (!quizzesBySection[secId]) quizzesBySection[secId] = [];
    quizzesBySection[secId].push(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Тест басқару</h1>
        <button
          onClick={() => {
            setEditingQuiz(null);
            setShowQuizForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
        >
          Тест қосу
        </button>
      </div>

      {showQuizForm && (
        <QuizForm
          topics={topics}
          initial={editingQuiz ?? undefined}
          onSave={handleSaveQuiz}
          onCancel={() => {
            setShowQuizForm(false);
            setEditingQuiz(null);
          }}
        />
      )}

      {quizzes.length === 0 ? (
        <p className="text-muted-foreground">Тесттер жоқ. Жаңа тест қосыңыз.</p>
      ) : (
        <div className="space-y-6">
          {sections
            .filter((s) => quizzesBySection[s.id]?.length)
            .map((section) => (
              <div key={section.id}>
                <h2 className="text-lg font-semibold text-foreground mb-2">{section.title}</h2>
                <div className="space-y-3">
                  {quizzesBySection[section.id].map((quiz) => (
                    <div key={quiz.id} className="bg-card rounded-lg shadow">
                      <div className="flex items-center justify-between px-5 py-4">
                        <button
                          className="flex-1 text-left"
                          onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
                        >
                          <span className="font-medium text-foreground">{quiz.title}</span>
                          <span className="text-sm text-muted-foreground ml-2">({getTopicName(quiz.topic)})</span>
                        </button>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="text-xs text-muted-foreground">{quiz.time_limit_minutes} мин</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              quiz.is_published ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            {quiz.is_published ? 'Жарияланған' : 'Жарияланбаған'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingQuiz(quiz);
                              setShowQuizForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Өзгерту
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Жою
                          </button>
                        </div>
                      </div>

                      {expandedQuiz === quiz.id && (
                        <div className="border-t px-5 py-4 bg-secondary space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              Сұрақтар ({quizQuestions[quiz.id]?.length ?? 0})
                            </h3>
                            <button
                              onClick={() => handleAddQuestion(quiz.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                            >
                              Сұрақ қосу
                            </button>
                          </div>
                          {quizQuestions[quiz.id] && quizQuestions[quiz.id].length > 0 ? (
                            <div className="space-y-2">
                              {quizQuestions[quiz.id]
                                .sort((a, b) => a.order - b.order)
                                .map((q) => (
                                  <QuestionEditor key={q.id} question={q} onRefresh={fetchAll} onError={(msg) => showToast(msg, 'error')} />
                                ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Сұрақтар жоқ</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {/* Quizzes without a matching section */}
          {quizzesBySection[0] && quizzesBySection[0].length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-muted-foreground mb-2">Басқа тесттер</h2>
              <div className="space-y-3">
                {quizzesBySection[0].map((quiz) => (
                  <div key={quiz.id} className="bg-card rounded-lg shadow px-5 py-4">
                    <span className="font-medium text-foreground">{quiz.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
