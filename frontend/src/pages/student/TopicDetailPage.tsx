import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopic, completeTopic } from '../../api/courses';

interface LessonImage {
  id: number;
  image: string;
  caption: string;
}

interface LessonData {
  id: number;
  content: string;
  video_url?: string;
  images: LessonImage[];
}

interface TopicDetail {
  id: number;
  title: string;
  section: number;
  lesson: LessonData | null;
  is_completed: boolean;
}

export default function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getTopic(Number(id))
        .then((r) => setTopic(r.data))
        .catch(() => setError('Тақырыпты жүктеу кезінде қате орын алды'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleComplete = async () => {
    if (!topic) return;
    setCompleting(true);
    try {
      await completeTopic(topic.id);
      setTopic({ ...topic, is_completed: true });
    } catch {
      // ignore
    } finally {
      setCompleting(false);
    }
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }
  if (error) return <p className="text-red-600">{error}</p>;

  if (!topic) {
    return <p className="text-gray-500">Тақырып табылмады</p>;
  }

  return (
    <div className="max-w-4xl">
      <Link
        to={`/student/sections/${topic.section}`}
        className="text-primary text-sm hover:underline mb-4 inline-block"
      >
        ← Бөлімге оралу
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{topic.title}</h1>
          {topic.is_completed && (
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
              Аяқталды ✓
            </span>
          )}
        </div>

        {/* Video */}
        {topic.lesson?.video_url && getYouTubeId(topic.lesson.video_url) && (
          <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYouTubeId(topic.lesson.video_url!)}`}
              title={topic.title}
              allowFullScreen
            />
          </div>
        )}

        {/* Content */}
        {topic.lesson?.content && (
          <div
            className="prose max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: topic.lesson.content }}
          />
        )}

        {/* Images */}
        {topic.lesson?.images && topic.lesson.images.length > 0 && (
          <div className="space-y-4 mb-6">
            {topic.lesson.images.map((img) => (
              <figure key={img.id}>
                <img src={img.image} alt={img.caption} className="rounded-lg max-w-full" />
                {img.caption && (
                  <figcaption className="text-sm text-gray-500 mt-1">{img.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {!topic.is_completed && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="bg-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {completing ? 'Күте тұрыңыз...' : 'Тақырыпты аяқтау'}
            </button>
          )}
          <Link
            to={`/student/quiz/${topic.id}`}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Тестке өту
          </Link>
        </div>
      </div>
    </div>
  );
}
