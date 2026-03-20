# LMS Информатика — Баг-репорт и исправления

## Критические баги

### 🔴 Баг 1: Контент урока не отображается с форматированием

**Проблема:** В `TopicDetailPage.tsx` HTML-контент урока оборачивается в `<div className="prose">`, но Tailwind CSS 4 с preflight сбрасывает все стили (h2, h3, ul, ol выглядят как обычный текст). Плагин `@tailwindcss/typography` **не установлен**.

**Файл:** `frontend/src/pages/student/TopicDetailPage.tsx`, `frontend/package.json`, `frontend/src/index.css`

**Исправление:**
1. Установить `@tailwindcss/typography`
2. Импортировать в CSS
3. Либо добавить кастомные стили для `.lesson-content`

---

### 🔴 Баг 2: ReactPlayer — неправильный проп `src` вместо `url`

**Проблема:** `react-player` v3 использует проп `url`, а не `src`. Видео не воспроизводится.

**Файл:** `frontend/src/pages/student/TopicDetailPage.tsx`, строка ~128

**Было:**
```tsx
<ReactPlayer src={videoSource.url} controls width="100%" height="100%" />
```

**Нужно:**
```tsx
<ReactPlayer url={videoSource.url} controls width="100%" height="100%" />
```

---

### 🔴 Баг 3: Отсутствуют миграции для полей `video_file` и `opened_at`

**Проблема:** Модель `Lesson` содержит `video_file`, а `TopicProgress` — `opened_at`, но в миграциях этих полей нет. Django будет крашиться при обращении к этим полям.

**Файлы:** Нужны новые миграции в `backend/courses/migrations/`

---

### 🔴 Баг 4: Белый экран при смене аватарки (учитель)

**Проблема:** После загрузки аватара `refreshUser()` обновляет `user` в контексте. Но blob URL превью уже revoked через useEffect cleanup, а новый `user.avatar` может быть relative URL без домена. В sidebar'е (TeacherLayout) `<img src={user.avatar}>` рендерится с URL типа `avatars/photo.jpg` (без `/media/` префикса), что вызывает ошибку рендера.

Также проблема race condition: `URL.revokeObjectURL` в useEffect cleanup может отработать до того, как React завершит рендер с новым аватаром.

**Файл:** `frontend/src/pages/ProfilePage.tsx`

**Исправление:** Убрать агрессивный revoke blob URL, добавить fallback для аватара

---

## Средние баги

### 🟡 Баг 5: DOMPurify стрипает iframe/video из контента урока

**Проблема:** Если учитель вставляет YouTube iframe через WYSIWYG редактор, `DOMPurify.sanitize()` с дефолтными настройками удалит `<iframe>` теги.

**Файл:** `frontend/src/pages/student/TopicDetailPage.tsx`

**Исправление:** Настроить DOMPurify для разрешения iframe:
```tsx
DOMPurify.sanitize(content, {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height']
})
```

---

### 🟡 Баг 6: Quill editor — вставка изображений ломается если сабақ не сохранён

**Проблема:** В `LessonEditor.tsx` toolbar image handler вызывает `imageHandler`, который проверяет `if (!lesson)`. Но Quill toolbar image button всё равно кликабелен, что может сбивать пользователя.

---

### 🟡 Баг 7: QuizResultPage — dark mode стили для ответов

**Проблема:** В `QuizResultPage.tsx` цвета правильных/неправильных ответов захардкожены:
```tsx
if (c.is_correct) bg = 'bg-green-50 text-green-700';
else if (wasSelected && !c.is_correct) bg = 'bg-red-50 text-red-700';
```
В dark mode `bg-green-50` и `bg-red-50` будут слишком светлыми.

---

## Мелкие баги / Улучшения

### 🟢 Баг 8: Нет обработки ошибок при загрузке аватарки большого размера

**Проблема:** Frontend не валидирует размер файла аватара перед отправкой. Если пользователь загрузит файл >10MB, Django вернёт ошибку, но без понятного сообщения.

### 🟢 Баг 9: Sidebar аватар не обновляется после смены

**Проблема:** В `TeacherLayout.tsx` и `StudentLayout.tsx` аватар отображается из `user.avatar` без cache busting. Браузер может кешировать старое изображение.

### 🟢 Баг 10: Toast animation в CSS — нет `@keyframes` для animation-name

**Проблема:** Используется `animate-slide-in` в Toast компоненте, keyframes определены в index.css корректно, но animation в `@theme` может не подхватиться Tailwind 4.
