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
} from '../../api/teacher';
import SectionForm from '../../components/teacher/SectionForm';
import TopicForm from '../../components/teacher/TopicForm';
import LessonEditor from '../../components/teacher/LessonEditor';

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

  if (loading) return <p className="text-muted-foreground">Жүктелуде...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const sectionTopics = (sectionId: number) => topics.filter((t) => t.section === sectionId).sort((a, b) => a.order - b.order);
  const topicLesson = (topicId: number) => lessons.find((l) => l.topic === topicId) ?? null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Контент басқару</h1>
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
        <p className="text-muted-foreground">Бөлімдер жоқ. Жаңа бөлім қосыңыз.</p>
      ) : (
        <div className="space-y-3">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id} className="bg-card rounded-lg shadow">
                {/* Section row */}
                <div className="flex items-center justify-between px-5 py-4">
                  <button
                    className="flex-1 text-left"
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  >
                    <span className="font-semibold text-foreground">{section.title}</span>
                    <span className="text-sm text-muted-foreground ml-3">{section.description}</span>
                  </button>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-muted-foreground">#{section.order}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        section.is_published ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'
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
                  <div className="border-t px-5 py-4 bg-secondary space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-foreground">Тақырыптар</h3>
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
                      <p className="text-sm text-muted-foreground">Тақырыптар жоқ</p>
                    ) : (
                      sectionTopics(section.id).map((topic) => (
                        <div key={topic.id}>
                          <div className="flex items-center justify-between bg-card border rounded px-3 py-2">
                            <button
                              className="flex-1 text-left text-sm text-foreground"
                              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
                            >
                              {topic.title}
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">#{topic.order}</span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  topic.is_published ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'
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
