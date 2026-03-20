import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { getSection } from '../../api/courses';
import Breadcrumbs from '../../components/common/Breadcrumbs';

interface TopicItem {
  id: number;
  title: string;
  order: number;
  is_completed: boolean;
  has_quiz: boolean;
  status: 'completed' | 'in_progress' | 'not_started';
}

interface SectionDetail {
  id: number;
  title: string;
  description: string;
  icon: string;
  topics: TopicItem[];
}

const statusConfig = {
  completed: { label: 'Аяқталды', bg: 'bg-accent/10 text-accent', icon: '✓' },
  in_progress: { label: 'Оқылуда', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: '▶' },
  not_started: { label: '', bg: 'bg-secondary text-muted-foreground', icon: '' },
};

export default function SectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<SectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getSection(Number(id))
        .then((r) => setSection(r.data))
        .catch(() => setError('Бөлімді жүктеу кезінде қате орын алды'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }
  if (error) return <p className="text-red-600">{error}</p>;

  if (!section) {
    return <p className="text-muted-foreground">Бөлім табылмады</p>;
  }

  const completed = section.topics.filter((t) => t.is_completed).length;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Бөлімдер', to: '/student' },
          { label: section.title },
        ]}
      />

      <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{section.icon || '📘'}</span>
          <h1 className="text-2xl font-bold text-foreground">{section.title}</h1>
        </div>
        <p className="text-muted-foreground mb-4">{section.description}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-full h-2 max-w-xs">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{ width: `${section.topics.length > 0 ? Math.round((completed / section.topics.length) * 100) : 0}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {completed} / {section.topics.length} аяқталды
          </span>
        </div>
      </div>

      {section.topics.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Тақырыптар әлі жоқ</h3>
          <p className="text-muted-foreground">Бұл бөлімге тақырыптар қосылғанда осында көрінеді</p>
        </div>
      ) : (
        <div className="space-y-3">
          {section.topics.map((topic) => {
            const cfg = statusConfig[topic.status ?? (topic.is_completed ? 'completed' : 'not_started')];
            return (
              <Link
                key={topic.id}
                to={`/student/topics/${topic.id}`}
                className="bg-card rounded-lg shadow-sm hover:shadow-md transition p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    topic.is_completed
                      ? 'bg-accent text-white'
                      : topic.status === 'in_progress'
                        ? 'bg-blue-600 text-white'
                        : 'bg-secondary text-muted-foreground'
                  }`}>
                    {cfg.icon || topic.order}
                  </span>
                  <span className="font-medium text-foreground">{topic.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {topic.has_quiz && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Тест бар</span>
                  )}
                  {cfg.label && (
                    <span className={`text-xs px-2 py-1 rounded ${cfg.bg}`}>{cfg.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
