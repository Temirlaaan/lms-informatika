# Промпт для Claude Code — Видео загрузка, Lightbox, Улучшения LMS

Проект: LMS "Информатика 5 сынып" — Django 5 + DRF бэкенд, React 19 + TypeScript + Tailwind 4 фронтенд.

Выполняй задачи последовательно. После каждого изменения фронтенда проверяй `cd frontend && npx tsc -b`.

---

## ЗАДАЧА 1: Загрузка видео с компьютера (не только YouTube)

Сейчас поле `video_url` в модели `Lesson` — это `URLField`, принимающее только YouTube ссылки. Нужно добавить возможность загружать видео файлы с компьютера учителя.

### 1.1. Бэкенд — модель

В `backend/courses/models.py`, модель `Lesson`:
- Оставь поле `video_url = models.URLField(blank=True, null=True)` — для YouTube
- Добавь новое поле `video_file = models.FileField(upload_to='lesson_videos/', blank=True, null=True)` — для загруженных видео
- Добавь метод `get_video_source()` который возвращает dict:
  ```python
  def get_video_source(self):
      if self.video_file:
          return {'type': 'file', 'url': self.video_file.url}
      elif self.video_url:
          return {'type': 'youtube', 'url': self.video_url}
      return None
  ```

### 1.2. Бэкенд — настройки

В `backend/config/settings.py`:
- Увеличь `DATA_UPLOAD_MAX_MEMORY_SIZE` до `100 * 1024 * 1024` (100 МБ) для поддержки видеофайлов
- Добавь `FILE_UPLOAD_MAX_MEMORY_SIZE = 100 * 1024 * 1024`

### 1.3. Бэкенд — сериализаторы

В `backend/courses/serializers.py`:

**LessonSerializer** (для студентов — read-only):
```python
class LessonSerializer(serializers.ModelSerializer):
    images = LessonImageSerializer(many=True, read_only=True)
    video_source = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'content', 'video_url', 'video_file', 'video_source', 'images']

    def get_video_source(self, obj):
        return obj.get_video_source()
```

**TeacherLessonSerializer** (для учителей — read/write):
```python
class TeacherLessonSerializer(serializers.ModelSerializer):
    video_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    video_file = serializers.FileField(required=False, allow_null=True)
    images = LessonImageSerializer(many=True, read_only=True)
    video_source = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'topic', 'content', 'video_url', 'video_file', 'video_source', 'images']

    def get_video_source(self, obj):
        return obj.get_video_source()

    def validate_video_url(self, value):
        if not value or not value.strip():
            return None
        return value

    def validate_video_file(self, value):
        if value:
            # Максимум 100 МБ
            max_size = 100 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError('Видео файл тым үлкен (макс. 100 МБ)')
            # Разрешённые форматы
            allowed_types = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError('Тек MP4, WebM, OGG форматтары рұқсат етіледі')
        return value
```

### 1.4. Бэкенд — views

В `backend/courses/views.py`, `TeacherLessonViewSet`:
- Убедись что он поддерживает `multipart/form-data`. Добавь `parser_classes`:
```python
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class TeacherLessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    serializer_class = TeacherLessonSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Lesson.objects.all()
```

### 1.5. Бэкенд — миграция

Создай и примени миграцию:
```bash
cd backend
python manage.py makemigrations courses
python manage.py migrate
```

### 1.6. Фронтенд — API layer

В `frontend/src/api/teacher.ts`:
- Измени `createLesson` и `updateLesson` чтобы они могли отправлять `FormData` (для файловой загрузки):

```typescript
export const createLesson = (data: FormData) =>
  api.post('/courses/teacher/lessons/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateLesson = (id: number, data: FormData) =>
  api.patch(`/courses/teacher/lessons/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
```

### 1.7. Фронтенд — types

В `frontend/src/types/index.ts`, интерфейс `Lesson`:
```typescript
export interface VideoSource {
  type: 'youtube' | 'file';
  url: string;
}

export interface Lesson {
  id: number;
  topic: number;
  content: string;
  video_url?: string;
  video_file?: string;
  video_source?: VideoSource | null;
  images?: LessonImage[];
}
```

### 1.8. Фронтенд — ContentManagerPage (учитель)

В `frontend/src/pages/teacher/ContentManagerPage.tsx`, компонент `LessonEditor`:

Замени текущую секцию "Видео сілтемесі" на выбор типа видео:

```
Видео қосу:
[Таңдау: ○ YouTube сілтемесі  ○ Файлдан жүктеу]

Если YouTube:
  <input> для URL (как сейчас)

Если файл:
  <input type="file" accept="video/mp4,video/webm,video/ogg">
  Если уже есть загруженный файл — показать его имя и кнопку "Жою"
  Прогресс-бар загрузки (опционально)
```

При сохранении собирай `FormData`:
```typescript
const handleSave = async () => {
  setSaving(true);
  try {
    const formData = new FormData();
    formData.append('content', content);

    if (videoType === 'youtube') {
      const trimmedUrl = videoUrl.trim();
      const processedUrl = trimmedUrl ? (toYouTubeEmbedUrl(trimmedUrl) || trimmedUrl) : '';
      formData.append('video_url', processedUrl || '');
      // Очистить video_file если переключились на YouTube
      formData.append('video_file', '');
    } else if (videoType === 'file' && videoFile) {
      formData.append('video_file', videoFile);
      formData.append('video_url', '');
    }

    if (lesson) {
      formData.append('topic', String(lesson.topic));
      await updateLesson(lesson.id, formData);
    } else {
      formData.append('topic', String(topicId));
      await createLesson(formData);
    }
    onSaved();
  } catch {
    alert('Сабақты сақтау кезінде қате орын алды');
  } finally {
    setSaving(false);
  }
};
```

Добавь стейты:
```typescript
const [videoType, setVideoType] = useState<'youtube' | 'file'>(
  lesson?.video_file ? 'file' : 'youtube'
);
const [videoFile, setVideoFile] = useState<File | null>(null);
```

### 1.9. Фронтенд — TopicDetailPage (ученик)

В `frontend/src/pages/student/TopicDetailPage.tsx`:

Замени текущую секцию рендера видео. Вместо проверки только YouTube, используй `video_source`:

```tsx
{/* Video */}
{topic.lesson?.video_source && (
  topic.lesson.video_source.type === 'youtube' ? (
    <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-black">
      <iframe
        className="w-full h-full"
        src={topic.lesson.video_source.url}
        title={topic.title}
        allowFullScreen
      />
    </div>
  ) : (
    <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-black">
      <video
        className="w-full h-full"
        src={topic.lesson.video_source.url}
        controls
        controlsList="nodownload"
        preload="metadata"
      >
        Сіздің браузеріңіз видео тегін қолдамайды.
      </video>
    </div>
  )
)}
```

Убери старую функцию `getYouTubeId()` — она больше не нужна, т.к. бэкенд уже возвращает готовый embed URL в `video_source`.

---

## ЗАДАЧА 2: Lightbox — увеличение картинок по клику

Нужно чтобы при клике на картинку в уроке она открывалась в полноэкранном оверлее (lightbox). Без внешних библиотек — реализуй сам.

### 2.1. Создай компонент ImageLightbox

Создай файл `frontend/src/components/common/ImageLightbox.tsx`:

```tsx
import { useEffect, useCallback } from 'react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition"
        aria-label="Жабу"
      >
        ×
      </button>

      {/* Картинка */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
```

### 2.2. Используй в TopicDetailPage

В `frontend/src/pages/student/TopicDetailPage.tsx`:

1. Импортируй: `import ImageLightbox from '../../components/common/ImageLightbox';`
2. Добавь стейт: `const [lightboxImage, setLightboxImage] = useState<{src: string; alt: string} | null>(null);`
3. В секции рендера картинок — добавь `onClick` и стиль `cursor-pointer`:

```tsx
{topic.lesson?.images && topic.lesson.images.length > 0 && (
  <div className="space-y-4 mb-6">
    {topic.lesson.images.map((img) => (
      <figure key={img.id}>
        <img
          src={img.image}
          alt={img.caption || 'Сабақ суреті'}
          className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition"
          onClick={() => setLightboxImage({ src: img.image, alt: img.caption || 'Сабақ суреті' })}
        />
        {img.caption && (
          <figcaption className="text-sm text-muted-foreground mt-1">{img.caption}</figcaption>
        )}
      </figure>
    ))}
  </div>
)}
```

4. В конце компонента (перед закрывающим `</div>`) добавь lightbox:
```tsx
{lightboxImage && (
  <ImageLightbox
    src={lightboxImage.src}
    alt={lightboxImage.alt}
    onClose={() => setLightboxImage(null)}
  />
)}
```

### 2.3. Lightbox для картинок внутри HTML контента (prose)

Картинки вставленные через ReactQuill рендерятся через `dangerouslySetInnerHTML` в блоке `.prose`. Для них тоже нужен lightbox.

В `TopicDetailPage.tsx`:
1. Добавь `useRef` на div с контентом: `const contentRef = useRef<HTMLDivElement>(null);`
2. Добавь useEffect который вешает click handler на все `<img>` внутри prose:

```tsx
useEffect(() => {
  if (!contentRef.current) return;
  const images = contentRef.current.querySelectorAll('img');
  const handleClick = (e: Event) => {
    const img = e.target as HTMLImageElement;
    setLightboxImage({ src: img.src, alt: img.alt || 'Сабақ суреті' });
  };
  images.forEach((img) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', handleClick);
  });
  return () => {
    images.forEach((img) => {
      img.removeEventListener('click', handleClick);
    });
  };
}, [topic?.lesson?.content]);
```

3. На div с prose добавь ref:
```tsx
<div
  ref={contentRef}
  className="prose max-w-none mb-6"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.lesson.content) }}
/>
```

---

## ЗАДАЧА 3: Улучшения для полноценного LMS

### 3.1. Порядок тем (drag-and-drop не нужен, но нумерация и навигация)

В `TopicDetailPage.tsx` добавь навигацию "Алдыңғы тақырып" / "Келесі тақырып":

1. В бэкенде `TopicDetailSerializer` добавь поля `prev_topic_id` и `next_topic_id`:
```python
class TopicDetailSerializer(serializers.ModelSerializer):
    # ... существующие поля ...
    prev_topic_id = serializers.SerializerMethodField()
    next_topic_id = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ['id', 'title', 'order', 'section', 'lesson', 'is_completed', 'has_quiz', 'prev_topic_id', 'next_topic_id']

    def get_prev_topic_id(self, obj):
        prev = Topic.objects.filter(
            section=obj.section, order__lt=obj.order, is_published=True
        ).order_by('-order').first()
        return prev.id if prev else None

    def get_next_topic_id(self, obj):
        next_t = Topic.objects.filter(
            section=obj.section, order__gt=obj.order, is_published=True
        ).order_by('order').first()
        return next_t.id if next_t else None
```

2. Во фронте `TopicDetailPage.tsx` — внизу страницы (перед блоком теста) добавь навигацию:
```tsx
<div className="flex justify-between items-center mt-6">
  {topic.prev_topic_id ? (
    <Link to={`/student/topics/${topic.prev_topic_id}`} className="...">
      ← Алдыңғы тақырып
    </Link>
  ) : <div />}
  {topic.next_topic_id ? (
    <Link to={`/student/topics/${topic.next_topic_id}`} className="...">
      Келесі тақырып →
    </Link>
  ) : <div />}
</div>
```

### 3.2. Подтверждение перед отправкой теста

В `QuizPage.tsx`, в функции `handleSubmit` — перед отправкой покажи confirm диалог:

```typescript
const unanswered = quiz.questions.filter(q => !answers[q.id] || answers[q.id].length === 0).length;
let confirmMessage = 'Жауаптарды жіберу керек пе?';
if (unanswered > 0) {
  confirmMessage = `${unanswered} сұраққа жауап берілмеді. Жіберу керек пе?`;
}
if (!confirm(confirmMessage)) return;
```

Это НЕ нужно делать если таймер истёк (автоматическая отправка) — проверь что confirm показывается только при ручном нажатии кнопки.

### 3.3. Прогресс внутри теста — индикатор отвеченных вопросов

В `QuizPage.tsx`, в sticky header рядом с таймером добавь счётчик:

```tsx
const answeredCount = Object.keys(answers).filter(qId => answers[Number(qId)]?.length > 0).length;

// В header:
<span className="text-sm text-muted-foreground">
  {answeredCount}/{quiz.questions.length}
</span>
```

### 3.4. Поиск по контенту (для студента)

Добавь поиск по разделам и темам на странице `SectionsPage.tsx`:

1. Добавь `<input>` для поиска вверху страницы
2. Фильтруй `sections` по `title` и `description` (клиентская фильтрация, данных мало)

```tsx
const [search, setSearch] = useState('');
const filtered = sections.filter(s =>
  s.title.toLowerCase().includes(search.toLowerCase()) ||
  s.description.toLowerCase().includes(search.toLowerCase())
);
```

### 3.5. Статус "Оқылуда" для тем

Сейчас тема может быть только "Аяқталды" или ничего. Добавь визуальный статус "Оқылуда" — если студент открывал тему но не нажал "Аяқтау".

В бэкенде `backend/courses/models.py`, `TopicProgress`:
- Добавь поле `opened_at = models.DateTimeField(blank=True, null=True)` — когда студент впервые открыл тему

В бэкенде `backend/courses/views.py`, метод `retrieve` в `TopicViewSet`:
- При GET запросе темы студентом — автоматически создавай/обновляй `TopicProgress` с `opened_at`:
```python
def retrieve(self, request, pk=None):
    topic = self.get_object()
    if request.user.role == 'student':
        progress, created = TopicProgress.objects.get_or_create(
            student=request.user, topic=topic,
            defaults={'opened_at': timezone.now()}
        )
        if not progress.opened_at:
            progress.opened_at = timezone.now()
            progress.save()
    serializer = self.get_serializer(topic)
    return Response(serializer.data)
```

В сериализаторах — в `TopicListSerializer` измени `get_is_completed` чтобы возвращать статус:
```python
status = serializers.SerializerMethodField()

def get_status(self, obj):
    request = self.context.get('request')
    if request and request.user.is_authenticated and request.user.role == 'student':
        progress = TopicProgress.objects.filter(student=request.user, topic=obj).first()
        if progress and progress.is_completed:
            return 'completed'
        elif progress and progress.opened_at:
            return 'in_progress'
    return 'not_started'
```

Во фронте в `SectionDetailPage.tsx` — используй `topic.status` для отображения:
- `completed` → зелёный кружок с ✓
- `in_progress` → синий кружок с ⋯ или иконка книги
- `not_started` → серый кружок с номером

### 3.6. Breadcrumbs навигация

Добавь breadcrumbs (навигационную цепочку) на страницах:
- `SectionDetailPage`: `Бөлімдер > {section.title}`
- `TopicDetailPage`: `Бөлімдер > {section.title} > {topic.title}`
- `QuizPage`: `Бөлімдер > ... > Тест`

Создай компонент `frontend/src/components/common/Breadcrumbs.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {item.href ? (
            <Link to={item.href} className="hover:text-primary transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

Используй вместо текущих `← Бөлімге оралу` ссылок.

### 3.7. Пустые состояния с иллюстрациями

Замени скучные текстовые "Бағалар жоқ", "Бөлімдер жоқ" на красивые пустые состояния с иконками из lucide-react:

```tsx
// Пример для GradesPage:
<div className="bg-card rounded-xl shadow-sm p-12 text-center">
  <Award className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
  <h3 className="text-lg font-medium text-foreground mb-2">Бағалар әлі жоқ</h3>
  <p className="text-muted-foreground mb-4">Тест тапсырыңыз, нәтижелер осында көрінеді</p>
  <Link to="/student/sections" className="text-primary hover:underline">
    Бөлімдерге өту →
  </Link>
</div>
```

Сделай аналогично для всех пустых состояний в проекте.

---

## Порядок выполнения

1. **Бэкенд**: модель Lesson (video_file), миграция, сериализаторы, views (parser_classes), TopicProgress (opened_at), навигация prev/next
2. **Фронтенд компоненты**: ImageLightbox, Breadcrumbs
3. **Фронтенд страницы**: ContentManagerPage (видео загрузка), TopicDetailPage (видео + lightbox + навигация), QuizPage (confirm + прогресс), SectionsPage (поиск), SectionDetailPage (статусы + breadcrumbs)
4. **Типы**: обнови types/index.ts
5. Проверяй `cd frontend && npx tsc -b` после каждого файла
6. Проверяй Python файлы: `python3 -c "import py_compile; py_compile.compile('path/to/file.py', doraise=True)"`

## Дизайн-гайды

- Все новые элементы должны использовать CSS-переменные темы (bg-card, text-foreground, text-muted-foreground, bg-secondary, border-border) — НЕ хардкод цвета
- Кнопки: используй существующие стили (bg-primary, bg-accent, bg-destructive)
- Иконки: из lucide-react
- Анимации: transition для hover эффектов, animate-pulse для важных состояний
- Казахский язык для всех UI текстов
