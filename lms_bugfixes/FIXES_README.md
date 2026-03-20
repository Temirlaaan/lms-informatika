# LMS Информатика — Исправления багов

## Обнаруженные баги и исправления

### 🔴 Критические

#### 1. Контент урока не отображается с форматированием
- **Причина:** `@tailwindcss/typography` не установлен → класс `prose` не работает. Tailwind 4 preflight сбрасывает стили `<h2>`, `<ul>`, `<ol>`, `<blockquote>`, `<code>` и др.
- **Файлы:** `frontend/src/index.css`, `frontend/src/pages/student/TopicDetailPage.tsx`
- **Исправление:** Заменил `prose` на кастомный `.lesson-content` класс со всеми нужными стилями для HTML-элементов (заголовки, списки, таблицы, код, цитаты, ссылки). Стили адаптированы для dark mode.

#### 2. Видео не воспроизводится (ReactPlayer)
- **Причина:** Использован проп `src` вместо `url` (ReactPlayer v3 API)
- **Файл:** `frontend/src/pages/student/TopicDetailPage.tsx`
- **Было:** `<ReactPlayer src={videoSource.url} ...>`
- **Стало:** `<ReactPlayer url={videoSource.url} ...>`

#### 3. Отсутствуют миграции БД
- **Причина:** Поля `Lesson.video_file` и `TopicProgress.opened_at` есть в моделях, но нет в миграциях → Django упадёт при обращении к ним
- **Файл:** `backend/courses/migrations/0002_lesson_video_file_topicprogress_opened_at.py`
- **Исправление:** Добавлена миграция

#### 4. Белый экран при смене аватарки
- **Причина:** Несколько проблем:
  - `useEffect` cleanup агрессивно делает `URL.revokeObjectURL` при каждом изменении `avatarPreview`, что может отозвать URL до завершения рендера
  - Нет `onError` на `<img>` — если avatar URL невалиден, рендер не падает, но изображение пустое
  - Нет валидации размера файла перед отправкой
- **Файл:** `frontend/src/pages/ProfilePage.tsx`
- **Исправление:**
  - `useEffect` cleanup только при unmount компонента
  - Добавлен `onError` handler с fallback на инициалы
  - Валидация размера файла (макс 5МБ) при выборе
  - Порядок операций: сначала revoke blob, потом clear state, потом refreshUser

#### 5. DOMPurify стрипает iframe из контента
- **Причина:** DOMPurify с дефолтными настройками удаляет `<iframe>` теги (YouTube embeds в контенте)
- **Файл:** `frontend/src/pages/student/TopicDetailPage.tsx`
- **Исправление:** Добавлен конфиг `ADD_TAGS: ['iframe']` с разрешёнными атрибутами

### 🟡 Средние

#### 6. QuizResultPage — цвета в dark mode
- **Причина:** `bg-green-50` и `bg-red-50` слишком светлые в тёмной теме
- **Файл:** `frontend/src/pages/student/QuizResultPage.tsx`
- **Исправление:** Добавлены `dark:` варианты для всех цветов ответов

### 🟢 Потенциальные проблемы

#### 7. Аватар в sidebar не кеш-бастится
В `TeacherLayout.tsx` и `StudentLayout.tsx` аватар берётся из `user.avatar` без `?t=...`, поэтому после смены аватарки браузер может показывать старое изображение до хард-рефреша.

#### 8. `seed_data.py` — max_attempts=3 для всех тестов
При повторном seed_data существующие данные пропускаются (`get_or_create`), что корректно. Но если изменить seed_data и перезапустить — обновления не применятся к существующим записям.

#### 9. Нет CSRF protection для API
JWT-only аутентификация без CSRF middleware для API endpoints. Для API это нормально, но если сессионная аутентификация включена параллельно — может быть уязвимость.

---

## Как применить исправления

```bash
# 1. Замени файлы
cp fixes/frontend/src/index.css                              frontend/src/index.css
cp fixes/frontend/src/pages/student/TopicDetailPage.tsx      frontend/src/pages/student/TopicDetailPage.tsx
cp fixes/frontend/src/pages/student/QuizResultPage.tsx       frontend/src/pages/student/QuizResultPage.tsx
cp fixes/frontend/src/pages/ProfilePage.tsx                  frontend/src/pages/ProfilePage.tsx
cp fixes/backend/courses/migrations/0002_*.py                backend/courses/migrations/

# 2. Примени миграцию
cd backend
python manage.py migrate

# 3. Проверь TypeScript
cd frontend
npx tsc -b

# 4. Пересобери
docker compose up --build
```
