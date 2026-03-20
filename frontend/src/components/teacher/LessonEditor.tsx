import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { Lesson, LessonImage, VideoSource } from '../../types';
import {
  createLesson,
  updateLesson,
  deleteLesson,
  uploadLessonImage,
  deleteLessonImage,
} from '../../api/teacher';
import { useToast } from '../common/Toast';

/**
 * Convert any YouTube URL to embed format.
 * Supports: watch?v=, youtu.be/, /embed/, /shorts/
 * Returns null if not a valid YouTube URL.
 */
function toYouTubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}

const quillToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
];

interface LessonEditorProps {
  topicId: number;
  lesson: Lesson | null;
  onSaved: () => void;
}

export default function LessonEditor({ topicId, lesson, onSaved }: LessonEditorProps) {
  const [content, setContent] = useState(lesson?.content ?? '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url ?? '');
  const [videoMode, setVideoMode] = useState<'youtube' | 'file'>(
    lesson?.video_source?.type === 'file' ? 'file' : 'youtube'
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideoSource, setExistingVideoSource] = useState<VideoSource | null>(lesson?.video_source ?? null);
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<LessonImage[]>(lesson?.images ?? []);
  const quillRef = useRef<ReactQuill | null>(null);

  useEffect(() => {
    setContent(lesson?.content ?? '');
    setVideoUrl(lesson?.video_url ?? '');
    setVideoMode(lesson?.video_source?.type === 'file' ? 'file' : 'youtube');
    setVideoFile(null);
    setExistingVideoSource(lesson?.video_source ?? null);
    setImages(lesson?.images ?? []);
  }, [lesson]);

  const imageHandler = useCallback(() => {
    if (!lesson) {
      showToast('Алдымен сабақты сақтаңыз, содан кейін суреттерді қоса аласыз', 'error');
      return;
    }
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/png,image/jpeg,image/webp,image/gif');
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast('Файл өте үлкен (макс. 5МБ)', 'error');
        return;
      }
      const formData = new FormData();
      formData.append('lesson', String(lesson.id));
      formData.append('image', file);
      try {
        const res = await uploadLessonImage(formData);
        const url: string | undefined = res.data.image_url || res.data.image;
        if (!url || (!url.startsWith('/media/') && !url.startsWith('http'))) {
          showToast('Серверден қате жауап келді', 'error');
          return;
        }
        const editor = quillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', url);
        }
      } catch {
        showToast('Суретті жүктеу кезінде қате орын алды', 'error');
      }
    };
  }, [lesson, showToast]);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: quillToolbar,
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('content', content);

      if (videoMode === 'youtube') {
        const trimmedUrl = videoUrl.trim();
        const processedUrl = trimmedUrl ? (toYouTubeEmbedUrl(trimmedUrl) || trimmedUrl) : '';
        formData.append('video_url', processedUrl);
      } else {
        formData.append('video_url', '');
        if (videoFile) {
          formData.append('video_file', videoFile);
        }
      }

      if (lesson) {
        await updateLesson(lesson.id, formData);
      } else {
        formData.append('topic', String(topicId));
        await createLesson(formData);
      }
      onSaved();
    } catch {
      showToast('Сабақты сақтау кезінде қате орын алды', 'error');
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
      showToast('Сабақты жою кезінде қате орын алды', 'error');
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!lesson) {
      showToast('Алдымен сабақты сақтаңыз', 'error');
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        showToast(`Файл өте үлкен: ${file.name} (макс. 5МБ)`, 'error');
        return;
      }
    }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('lesson', String(lesson.id));
        formData.append('image', file);
        await uploadLessonImage(formData);
      }
      onSaved();
    } catch {
      showToast('Суретті жүктеу кезінде қате орын алды', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Суретті жою керек пе?')) return;
    try {
      await deleteLessonImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      showToast('Суретті жою кезінде қате орын алды', 'error');
    }
  };

  return (
    <div className="bg-card border rounded p-3 space-y-3">
      {/* WYSIWYG Editor */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Сабақ мазмұны</h4>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={quillModules}
          placeholder="Сабақ мазмұнын жазыңыз..."
          className="bg-card [&_.ql-editor]:min-h-[150px]"
        />
      </div>

      {/* Video */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Видео (міндетті емес)
        </label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setVideoMode('youtube')}
            className={`px-3 py-1.5 rounded text-sm ${
              videoMode === 'youtube'
                ? 'bg-indigo-600 text-white'
                : 'bg-secondary text-foreground hover:bg-muted'
            }`}
          >
            YouTube сілтемесі
          </button>
          <button
            type="button"
            onClick={() => setVideoMode('file')}
            className={`px-3 py-1.5 rounded text-sm ${
              videoMode === 'file'
                ? 'bg-indigo-600 text-white'
                : 'bg-secondary text-foreground hover:bg-muted'
            }`}
          >
            Видео файл
          </button>
        </div>
        {videoMode === 'youtube' ? (
          <>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... немесе https://youtu.be/..."
            />
            {videoUrl.trim() && toYouTubeEmbedUrl(videoUrl) && (
              <p className="text-xs text-green-600 mt-1">
                YouTube сілтемесі анықталды — автоматты түрде embed форматына ауыстырылады
              </p>
            )}
            {videoUrl.trim() && !toYouTubeEmbedUrl(videoUrl) && (
              <p className="text-xs text-amber-600 mt-1">
                YouTube сілтемесі танылмады — URL сол қалпында сақталады
              </p>
            )}
          </>
        ) : (
          <>
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              className="w-full border rounded px-3 py-2 text-sm"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              MP4, WebM, OGG форматтары (макс. 100 МБ)
            </p>
            {existingVideoSource?.type === 'file' && !videoFile && (
              <p className="text-xs text-green-600 mt-1">
                Жүктелген видео бар
              </p>
            )}
          </>
        )}
      </div>

      {/* Image Upload */}
      <div className="border-2 border-dashed border-border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">Сабақ суреттері</h4>
        {!lesson ? (
          <p className="text-xs text-amber-600">
            Алдымен сабақты сақтаңыз, содан кейін суреттерді жүктей аласыз
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Сабаққа қатысты суреттерді жүктеңіз (PNG, JPG, WEBP)
            </p>
            <label className={`inline-flex items-center gap-2 cursor-pointer bg-secondary hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploading ? 'Жүктелуде...' : 'Суреттерді таңдау'}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
                disabled={uploading}
              />
            </label>

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                    <img
                      src={img.image}
                      alt={img.caption || 'Сабақ суреті'}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                      title="Жою"
                    >
                      &times;
                    </button>
                    {img.caption && (
                      <p className="text-xs text-muted-foreground p-1 truncate">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
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
