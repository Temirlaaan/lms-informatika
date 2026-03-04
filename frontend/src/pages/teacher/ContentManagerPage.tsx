import { useState, useEffect } from 'react';
import type { Section, Topic, Lesson } from '../../types';
import {
  getTeacherSections,
  createSection,
  updateSection,
  deleteSection,
  getTeacherTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  getTeacherLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../../api/teacher';

/* ─── Section Form ─── */
function SectionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Section;
  onSave: (data: Partial<Section>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [order, setOrder] = useState(initial?.order ?? 1);
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, order, icon, is_published: isPublished });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border rounded-lg p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Атауы</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Иконка</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Сипаттама</label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Реттілік</label>
          <input
            type="number"
            className="w-24 border rounded px-3 py-2 text-sm"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-2 mt-5">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span className="text-sm text-gray-700">Жарияланған</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
          Сақтау
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400">
          Болдырмау
        </button>
      </div>
    </form>
  );
}

/* ─── Topic Form ─── */
function TopicForm({
  sectionId,
  initial,
  onSave,
  onCancel,
}: {
  sectionId: number;
  initial?: Topic;
  onSave: (data: { section: number; title: string; order: number; is_published: boolean }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [order, setOrder] = useState(initial?.order ?? 1);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ section: sectionId, title, order, is_published: isPublished });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded p-3 mb-2 space-y-2">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Тақырып атауы</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Реттілік</label>
          <input
            type="number"
            className="w-20 border rounded px-3 py-2 text-sm"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-1 pb-2">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          <span className="text-xs text-gray-600">Жарияланған</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">
          Сақтау
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-400">
          Болдырмау
        </button>
      </div>
    </form>
  );
}

/* ─── Lesson Editor ─── */
function LessonEditor({
  topicId,
  lesson,
  onSaved,
}: {
  topicId: number;
  lesson: Lesson | null;
  onSaved: () => void;
}) {
  const [content, setContent] = useState(lesson?.content ?? '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(lesson?.content ?? '');
    setVideoUrl(lesson?.video_url ?? '');
  }, [lesson]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (lesson) {
        await updateLesson(lesson.id, { content, video_url: videoUrl || undefined });
      } else {
        await createLesson({ topic: topicId, content, video_url: videoUrl || undefined });
      }
      onSaved();
    } catch {
      alert('Сабақты сақтау кезінде қате орын алды');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson) return;
    if (!confirm('Сабақты жою керек пе?')) return;
    try {
      await deleteLesson(lesson.id);
      onSaved();
    } catch {
      alert('Сабақты жою кезінде қате орын алды');
    }
  };

  return (
    <div className="bg-white border rounded p-3 space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">Сабақ мазмұны</h4>
      <textarea
        className="w-full border rounded px-3 py-2 text-sm"
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Сабақ мазмұнын жазыңыз..."
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Видео сілтемесі (міндетті емес)</label>
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Сақталуда...' : 'Сақтау'}
        </button>
        {lesson && (
          <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700">
            Жою
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ContentManagerPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [showTopicForm, setShowTopicForm] = useState<number | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [activeTopic, setActiveTopic] = useState<number | null>(null);

  const fetchAll = async () => {
    try {
      const [secRes, topRes, lesRes] = await Promise.all([
        getTeacherSections(),
        getTeacherTopics(),
        getTeacherLessons(),
      ]);
      setSections(secRes.data);
      setTopics(topRes.data);
      setLessons(lesRes.data);
    } catch {
      setError('Деректерді жүктеу кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* Section handlers */
  const handleSaveSection = async (data: Partial<Section>) => {
    try {
      if (editingSection) {
        await updateSection(editingSection.id, data);
      } else {
        await createSection(data);
      }
      setShowSectionForm(false);
      setEditingSection(null);
      await fetchAll();
    } catch {
      alert('Бөлімді сақтау кезінде қате орын алды');
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm('Бөлімді жою керек пе? Барлық тақырыптар мен сабақтар жойылады.')) return;
    try {
      await deleteSection(id);
      await fetchAll();
    } catch {
      alert('Бөлімді жою кезінде қате орын алды');
    }
  };

  /* Topic handlers */
  const handleSaveTopic = async (data: { section: number; title: string; order: number; is_published: boolean }) => {
    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, data);
      } else {
        await createTopic(data);
      }
      setShowTopicForm(null);
      setEditingTopic(null);
      await fetchAll();
    } catch {
      alert('Тақырыпты сақтау кезінде қате орын алды');
    }
  };

  const handleDeleteTopic = async (id: number) => {
    if (!confirm('Тақырыпты жою керек пе?')) return;
    try {
      await deleteTopic(id);
      await fetchAll();
    } catch {
      alert('Тақырыпты жою кезінде қате орын алды');
    }
  };

  if (loading) return <p className="text-gray-600">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const sectionTopics = (sectionId: number) => topics.filter((t) => t.section === sectionId).sort((a, b) => a.order - b.order);
  const topicLesson = (topicId: number) => lessons.find((l) => l.topic === topicId) ?? null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Контент басқару</h1>
        <button
          onClick={() => {
            setEditingSection(null);
            setShowSectionForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
        >
          Бөлім қосу
        </button>
      </div>

      {/* Section Form */}
      {showSectionForm && (
        <SectionForm
          initial={editingSection ?? undefined}
          onSave={handleSaveSection}
          onCancel={() => {
            setShowSectionForm(false);
            setEditingSection(null);
          }}
        />
      )}

      {/* Sections Table */}
      {sections.length === 0 ? (
        <p className="text-gray-500">Бөлімдер жоқ. Жаңа бөлім қосыңыз.</p>
      ) : (
        <div className="space-y-3">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow">
                {/* Section row */}
                <div className="flex items-center justify-between px-5 py-4">
                  <button
                    className="flex-1 text-left"
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  >
                    <span className="font-semibold text-gray-800">{section.title}</span>
                    <span className="text-sm text-gray-500 ml-3">{section.description}</span>
                  </button>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-gray-400">#{section.order}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        section.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {section.is_published ? 'Жарияланған' : 'Жарияланбаған'}
                    </span>
                    <button
                      onClick={() => {
                        setEditingSection(section);
                        setShowSectionForm(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Өзгерту
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Жою
                    </button>
                  </div>
                </div>

                {/* Expanded: Topics */}
                {expandedSection === section.id && (
                  <div className="border-t px-5 py-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">Тақырыптар</h3>
                      <button
                        onClick={() => {
                          setEditingTopic(null);
                          setShowTopicForm(section.id);
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                      >
                        Тақырып қосу
                      </button>
                    </div>

                    {showTopicForm === section.id && (
                      <TopicForm
                        sectionId={section.id}
                        initial={editingTopic ?? undefined}
                        onSave={handleSaveTopic}
                        onCancel={() => {
                          setShowTopicForm(null);
                          setEditingTopic(null);
                        }}
                      />
                    )}

                    {sectionTopics(section.id).length === 0 ? (
                      <p className="text-sm text-gray-400">Тақырыптар жоқ</p>
                    ) : (
                      sectionTopics(section.id).map((topic) => (
                        <div key={topic.id}>
                          <div className="flex items-center justify-between bg-white border rounded px-3 py-2">
                            <button
                              className="flex-1 text-left text-sm text-gray-800"
                              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
                            >
                              {topic.title}
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">#{topic.order}</span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  topic.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {topic.is_published ? 'Жар.' : 'Жоқ'}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingTopic(topic);
                                  setShowTopicForm(section.id);
                                }}
                                className="text-indigo-600 hover:text-indigo-800 text-xs"
                              >
                                Өзгерту
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(topic.id)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Жою
                              </button>
                            </div>
                          </div>

                          {/* Lesson editor */}
                          {activeTopic === topic.id && (
                            <div className="ml-4 mt-2">
                              <LessonEditor
                                topicId={topic.id}
                                lesson={topicLesson(topic.id)}
                                onSaved={fetchAll}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
