import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSection } from '../../api/courses';

interface TopicItem {
  id: number;
  title: string;
  order: number;
  is_completed: boolean;
  has_quiz: boolean;
}

interface SectionDetail {
  id: number;
  title: string;
  description: string;
  icon: string;
  topics: TopicItem[];
}

export default function SectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<SectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getSection(Number(id))
        .then((r) => setSection(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!section) {
    return <p className="text-gray-500">Бөлім табылмады</p>;
  }

  const completed = section.topics.filter((t) => t.is_completed).length;

  return (
    <div>
      <Link to="/student/sections" className="text-primary text-sm hover:underline mb-4 inline-block">
        ← Бөлімдерге оралу
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{section.icon || '📘'}</span>
          <h1 className="text-2xl font-bold text-gray-800">{section.title}</h1>
        </div>
        <p className="text-gray-600 mb-4">{section.description}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{ width: `${section.topics.length > 0 ? Math.round((completed / section.topics.length) * 100) : 0}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">
            {completed} / {section.topics.length} аяқталды
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {section.topics.map((topic) => (
          <Link
            key={topic.id}
            to={`/student/topics/${topic.id}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 flex items-center justify-between block"
          >
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                topic.is_completed
                  ? 'bg-accent text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {topic.is_completed ? '✓' : topic.order}
              </span>
              <span className="font-medium text-gray-800">{topic.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {topic.has_quiz && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Тест бар</span>
              )}
              {topic.is_completed && (
                <span className="text-xs text-accent font-medium">Аяқталды</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
