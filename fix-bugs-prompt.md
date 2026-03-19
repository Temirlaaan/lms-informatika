# Промпт для Claude Code — исправление багов LMS

Проанализируй проект и исправь следующие баги. Делай всё последовательно, после каждого изменения проверяй `npx tsc -b` во фронтенде чтобы не сломать билд.

---

## 1. КРИТИЧНО: Изображения уроков отображаются белыми / не видны у ученика

### Проблема
DRF `ImageField` при сериализации вызывает `request.build_absolute_uri()`, генерируя абсолютные URL вроде `http://backend:8000/media/lesson_images/foo.jpg`. В Docker браузер не может обратиться к хосту `backend`. В dev-режиме URL `http://localhost:8000/media/...` тоже не всегда работает, т.к. `<img src>` грузит напрямую, минуя Vite proxy.

### Решение
В файле `backend/courses/serializers.py`:

1. В `LessonImageSerializer` — замени поле `image` на `SerializerMethodField`, возвращающий относительный URL (`obj.image.url` возвращает `/media/lesson_images/foo.jpg`):

```python
class LessonImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = LessonImage
        fields = ['id', 'image', 'caption']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None
```

2. В `TeacherLessonImageSerializer` — точно такой же фикс, сделай `image` как `SerializerMethodField` с методом `get_image`, возвращающим `obj.image.url`.

3. Проверь что `frontend/nginx.conf` проксирует `/media/` на бэкенд (уже есть).

4. Проверь что `frontend/vite.config.ts` проксирует `/media` на `http://localhost:8000` (уже есть).

---

## 2. КРИТИЧНО: Тёмная тема не работает на большинстве страниц

### Проблема
Почти все страницы используют хардкод Tailwind цветов (`bg-white`, `text-gray-800`, `bg-gray-50`, `text-gray-600`, `text-gray-500`, `bg-gray-200`, `divide-gray-100`, `divide-gray-200`, `border-gray-200`, `hover:bg-gray-50`) вместо CSS-переменных темы (`bg-card`, `text-foreground`, `bg-secondary`, `text-muted-foreground`, `border-border`).

### Решение
Пройди по ВСЕМ страницам и компонентам ниже и замени хардкод цвета на тематические:

**Маппинг замен:**
- `bg-white` → `bg-card`
- `bg-gray-50` → `bg-secondary` или `bg-muted`
- `text-gray-800` → `text-foreground`
- `text-gray-700` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-gray-400` → `text-muted-foreground`
- `text-gray-300` → `text-muted-foreground`
- `bg-gray-200` (прогресс-бары) → `bg-secondary`
- `bg-gray-100` → `bg-secondary`
- `divide-gray-100` → `divide-border`
- `divide-gray-200` → `divide-border`
- `border-gray-200` → `border-border`
- `hover:bg-gray-50` → `hover:bg-secondary`

**Файлы которые нужно обновить:**
- `frontend/src/pages/student/DashboardPage.tsx`
- `frontend/src/pages/student/SectionsPage.tsx`
- `frontend/src/pages/student/SectionDetailPage.tsx`
- `frontend/src/pages/student/TopicDetailPage.tsx`
- `frontend/src/pages/student/GradesPage.tsx`
- `frontend/src/pages/student/QuizPage.tsx`
- `frontend/src/pages/student/QuizResultPage.tsx`
- `frontend/src/pages/teacher/DashboardPage.tsx`
- `frontend/src/pages/teacher/ContentManagerPage.tsx`
- `frontend/src/pages/teacher/QuizManagerPage.tsx`
- `frontend/src/pages/teacher/GradebookPage.tsx`
- `frontend/src/pages/teacher/StudentsListPage.tsx`
- `frontend/src/pages/teacher/StudentDetailPage.tsx`
- `frontend/src/pages/LandingPage.tsx` (секция features: `bg-white` → `bg-card`, `bg-gray-50` → `bg-secondary`)
- `frontend/src/pages/NotFoundPage.tsx`
- `frontend/src/components/common/ErrorBoundary.tsx`

**ВАЖНО:** Не трогай цвета которые семантически привязаны к оценкам (text-green-600 для оценки 5, text-red-600 для оценки 2 и т.д.) — они должны оставаться как есть.

**ВАЖНО:** Не трогай цвета кнопок (`bg-primary`, `bg-accent`, `bg-indigo-600`, `bg-green-600`, `bg-red-600`) — они должны оставаться как есть.

**ВАЖНО:** В QuizPage.tsx у sticky header `bg-white shadow-sm` замени на `bg-card shadow-sm`.

---

## 3. Race condition при рефреше токена

### Проблема
В `frontend/src/api/axios.ts` — если одновременно несколько запросов получают 401, каждый независимо пытается рефрешнуть токен. Это приводит к множественным рефрешам, из которых все кроме первого провалятся (refresh token одноразовый).

### Решение
Перепиши interceptor в `frontend/src/api/axios.ts` с очередью ожидающих запросов:

```typescript
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh_token')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post('/api/auth/token/refresh/', { refresh });
        localStorage.setItem('access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        processQueue(null, data.access);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 4. Quiz timer — некорректные зависимости useEffect

### Проблема
В `frontend/src/pages/student/QuizPage.tsx`:
```tsx
useEffect(() => {
    // ...
}, [attemptId, timeLeft > 0]); // eslint-disable-line
```
`timeLeft > 0` — это boolean expression в массиве зависимостей. React видит только `true`/`false`, что создаёт баги с пересозданием interval.

### Решение
Замени на:
```tsx
const timerActive = timeLeft > 0 && attemptId !== null;

useEffect(() => {
  if (!timerActive) return;
  
  timerRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [timerActive]);
```

Убери `// eslint-disable-line` комментарий — он больше не нужен.

---

## 5. ReactQuill вставляет картинки как base64 в контент

### Проблема
Когда учитель нажимает кнопку "image" в toolbar ReactQuill и выбирает файл, изображение вставляется как `data:image/png;base64,...` прямо в HTML поле `content`. Это раздувает SQLite базу до десятков мегабайтов.

### Решение
В `frontend/src/pages/teacher/ContentManagerPage.tsx` добавь кастомный image handler для ReactQuill, который загружает файл на сервер через API и вставляет URL:

1. Создай функцию `imageHandler` которая:
   - Создаёт скрытый `<input type="file">` 
   - При выборе файла отправляет его на `/api/courses/teacher/lesson-images/` через FormData
   - Получает URL загруженного изображения
   - Вставляет `<img src="...">` в редактор через `quill.insertEmbed()`

2. Добавь `imageHandler` в `quillModules.toolbar.handlers.image`

3. Проблема: для загрузки изображения нужен `lesson.id`, а при создании нового урока его ещё нет. Поэтому: если `lesson === null`, показывай alert "Алдымен сабақты сақтаңыз, содан кейін суреттерді қоса аласыз" и не открывай file picker.

4. Нужно передать `ref` на ReactQuill чтобы получить доступ к Quill instance. Используй `useRef` и `getEditor()`.

---

## 6. Дублирование логики расчёта оценки

### Проблема
`gradeFromScore()` есть и в бэке (`backend/grades/models.py` → `Grade.calculate_grade`) и во фронте (`frontend/src/pages/student/QuizResultPage.tsx` → `gradeFromScore`). При изменении порогов нужно менять в двух местах.

### Решение
В `QuizResultPage.tsx` — убери функцию `gradeFromScore()`. Вместо этого, в бэкенде добавь `grade_value` в ответ `QuizAttemptDetailSerializer`, и используй его на фронте.

Проверь — в `backend/quizzes/serializers.py` `QuizAttemptDetailSerializer` уже не включает `grade_value`? Нет — потому что Grade создаётся отдельно. Тогда проще всего: в submit endpoint (`backend/quizzes/views.py` метод `submit`) добавь `grade_value` в response data, и на фронте прочитай его оттуда.

Конкретно:
1. В `QuizAttemptDetailSerializer` добавь поле `grade_value = serializers.SerializerMethodField()` которое ищет Grade по attempt и возвращает grade_value (или вычисляет из score).
2. В `QuizResultPage.tsx` используй `result.grade_value` вместо локальной функции.

---

## Порядок выполнения

1. Сначала исправь бэкенд (сериализаторы изображений, grade_value в attempt)
2. Потом исправь фронтенд (тёмная тема, axios interceptor, quiz timer, quill image handler, grade_value)
3. После каждого файла запускай `cd frontend && npx tsc -b` чтобы убедиться что TypeScript билд не сломан
4. В конце проверь что `python3 -c "import py_compile; py_compile.compile('backend/courses/serializers.py', doraise=True)"` и аналогично для других изменённых .py файлов — проходят без ошибок
