import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSections } from '../../api/courses';

interface SectionItem {
  id: number;
  title: string;
  description: string;
  order: number;
  icon: string;
  topic_count: number;
  progress_percentage: number;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSections()
      .then((r) => setSections(r.data))
      .catch(() => setError('Бөлімдерді жүктеу кезінде қате орын алды'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Бөлімдер</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.id}
            to={`/student/sections/${section.id}`}
            className="bg-card rounded-xl shadow-sm hover:shadow-md transition p-6 block"
          >
            <div className="text-3xl mb-3">{section.icon || '📘'}</div>
            <h2 className="text-lg font-semibold text-foreground mb-1">{section.title}</h2>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{section.description}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all"
                  style={{ width: `${section.progress_percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{section.progress_percentage}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{section.topic_count} тақырып</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
