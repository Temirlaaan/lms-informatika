import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { getTopic, completeTopic } from '../../api/courses';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import ImageLightbox from '../../components/common/ImageLightbox';

interface LessonImage {
  id: number;
  image: string;
  caption: string;
}

interface VideoSource {
  type: 'youtube' | 'file';
  url: string;
}

interface LessonData {
  id: number;
  content: string;
  video_url?: string;
  video_source?: VideoSource | null;
  images: LessonImage[];
}

interface TopicDetail {
  id: number;
  title: string;
  section: number;
  lesson: LessonData | null;
  is_completed: boolean;
  has_quiz: boolean;
  prev_topic_id: number | null;
  next_topic_id: number | null;
}

export default function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
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
    return <p className="text-muted-foreground">Тақырып табылмады</p>;
  }

  const videoSource = topic.lesson?.video_source;

  return (
    <div className="max-w-4xl">
      <Breadcrumbs
        items={[
          { label: 'Бөлімдер', to: '/student' },
          { label: 'Бөлім', to: `/student/sections/${topic.section}` },
          { label: topic.title },
        ]}
      />

      <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
          {topic.is_completed && (
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
              Аяқталды
            </span>
          )}
        </div>

        {/* Video */}
        {videoSource?.type === 'youtube' && getYouTubeId(videoSource.url) && (
          <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYouTubeId(videoSource.url)}`}
              title={topic.title}
              allowFullScreen
            />
          </div>
        )}
        {videoSource?.type === 'file' && (
          <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-black">
            <video
              className="w-full h-full"
              src={videoSource.url}
              controls
              controlsList="nodownload"
            />
          </div>
        )}

        {/* Content — sanitized to prevent XSS */}
        {topic.lesson?.content && (
          <div
            className="prose max-w-none mb-6 [&_img]:cursor-pointer [&_img]:transition [&_img:hover]:opacity-80"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.lesson.content) }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'IMG') {
                setLightboxSrc((target as HTMLImageElement).src);
              }
            }}
          />
        )}

        {/* Images */}
        {topic.lesson?.images && topic.lesson.images.length > 0 && (
          <div className="space-y-4 mb-6">
            {topic.lesson.images.map((img) => (
              <figure key={img.id}>
                <img
                  src={img.image}
                  alt={img.caption}
                  className="rounded-lg max-w-full cursor-pointer hover:opacity-80 transition"
                  onClick={() => setLightboxSrc(img.image)}
                />
                {img.caption && (
                  <figcaption className="text-sm text-muted-foreground mt-1">{img.caption}</figcaption>
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
        </div>
      </div>

      {/* Prev/Next Navigation */}
      <div className="flex justify-between mb-6">
        {topic.prev_topic_id ? (
          <button
            onClick={() => navigate(`/student/topics/${topic.prev_topic_id}`)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Алдыңғы тақырып
          </button>
        ) : (
          <div />
        )}
        {topic.next_topic_id ? (
          <button
            onClick={() => navigate(`/student/topics/${topic.next_topic_id}`)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Келесі тақырып
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Prominent Quiz Navigation */}
      {topic.has_quiz && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-center">
          <p className="text-blue-100 mb-3 text-sm">Сабақты оқып болдыңыз ба? Білімді тексеріңіз!</p>
          <Link
            to={`/student/quiz/${topic.id}`}
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3 rounded-lg text-lg font-bold hover:bg-blue-50 transition shadow"
          >
            Тестке өту
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}
