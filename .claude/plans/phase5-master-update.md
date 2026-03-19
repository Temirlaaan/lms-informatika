# Phase 5: Master Update — Implementation Plan

## Scope Summary
5 work streams: Media Audit, Local Video, Gamification (Badges), Selective Pagination, Analytics Charts.
**Skipped:** Rich Text editor replacement (ReactQuill already installed and working).

---

## Step 1: Media Audit (Backend + Frontend)

**Goal:** Verify every image/avatar URL chain works end-to-end in Docker.

### 1.1 Backend audit
- **`backend/accounts/serializers.py`** — Verify `UserSerializer` and `ProfileSerializer` include `avatar` field. **Status: already included.** No change needed.
- **`backend/courses/serializers.py`** — Verify student `LessonSerializer` includes `images` (nested `LessonImageSerializer`). Verify `QuestionSerializer` includes `image`. **Status: already included.** No change needed.
- **`backend/quizzes/serializers.py`** — Verify `QuestionSerializer` includes `image` field. **Status: already included.**

### 1.2 Frontend audit
- **`frontend/src/pages/student/TopicDetailPage.tsx`** — Verify lesson images render with correct URLs. Check if `img.image` produces full URL or relative path.
- **`frontend/src/pages/student/ProfilePage.tsx`** — Verify avatar display uses `user.avatar` URL correctly.
- **`frontend/src/pages/student/QuizPage.tsx`** (or equivalent) — Verify question images render.

### 1.3 Docker/nginx audit
- **`frontend/nginx.conf`** — Verify `/media/` proxy passes to backend correctly. **Status: already configured.**
- **`backend/config/urls.py`** — Verify `re_path(r'^media/(?P<path>.*)$', serve, ...)` exists (not `static()` which breaks when `DEBUG=False`). **Status: already uses `re_path`.**

**Deliverable:** Report of findings. Fix any broken chains found.

---

## Step 2: Local Video — Backend

### 2.1 New model: `LessonVideo` in `backend/courses/models.py`
```python
class LessonVideo(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='videos')
    video_file = models.FileField(upload_to='videos/')
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.title
```

### 2.2 New serializers in `backend/courses/serializers.py`
- `LessonVideoSerializer` (read-only, for students): fields `id`, `video_file`, `title`
- `TeacherLessonVideoSerializer` (CRUD, for teachers): fields `id`, `lesson`, `video_file`, `title`, with file size validation (500MB max)
- Update `LessonSerializer`: add `videos = LessonVideoSerializer(many=True, read_only=True)`
- Update `TeacherLessonSerializer`: add `videos = LessonVideoSerializer(many=True, read_only=True)`

### 2.3 New view: `TeacherLessonVideoViewSet` in `backend/courses/views.py`
- Permission: `IsTeacher`
- `create()` — multipart/form-data upload, max 5 videos per lesson
- `destroy()` — delete video + file

### 2.4 URL routes in `backend/courses/urls.py`
```
POST   /api/courses/teacher/lesson-videos/        → create
DELETE /api/courses/teacher/lesson-videos/<id>/    → destroy
```

### 2.5 Settings in `backend/config/settings.py`
- `DATA_UPLOAD_MAX_MEMORY_SIZE = 500 * 1024 * 1024`  (500 MB)

### 2.6 Migration
```bash
python manage.py makemigrations courses
python manage.py migrate
```

---

## Step 3: Local Video — Docker/nginx

### 3.1 `frontend/nginx.conf`
Add `client_max_body_size 500m;` in the `server` block (or `http` level).

---

## Step 4: Local Video — Frontend

### 4.1 Install react-player
```bash
cd frontend && npm install react-player
```

### 4.2 Types in `frontend/src/types/index.ts`
```typescript
export interface LessonVideo {
  id: number;
  video_file: string;
  title: string;
}
```
Update `Lesson` interface: add `videos?: LessonVideo[]`

### 4.3 API in `frontend/src/api/teacher.ts`
```typescript
export const uploadLessonVideo = (data: FormData) =>
  api.post('/courses/teacher/lesson-videos/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteLessonVideo = (id: number) =>
  api.delete(`/courses/teacher/lesson-videos/${id}/`);
```

### 4.4 Update `frontend/src/pages/teacher/ContentManagerPage.tsx`
- Add video upload section in LessonEditor (below image upload)
- File input accepting `video/*`, max 500MB frontend validation
- Display uploaded videos list with delete button
- Same pattern as image upload: save lesson first, then upload video via FormData

### 4.5 Update `frontend/src/pages/student/TopicDetailPage.tsx`
- Import `ReactPlayer` from `react-player`
- After existing YouTube iframe section, render local videos:
```tsx
{lesson.videos?.map(video => (
  <ReactPlayer key={video.id} url={video.video_file} controls width="100%" />
))}
```

---

## Step 5: Gamification — Backend

### 5.1 New models in `backend/accounts/models.py`
```python
class Badge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    image_url = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return self.name

class ProfileBadge(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awarded_to')
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'badge')
        ordering = ['-awarded_at']
```

### 5.2 Serializers in `backend/accounts/serializers.py`
```python
class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'image_url']

class ProfileBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = ProfileBadge
        fields = ['id', 'badge', 'awarded_at']
```

### 5.3 View in `backend/accounts/views.py`
```python
class MyBadgesView(generics.ListAPIView):
    serializer_class = ProfileBadgeSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return ProfileBadge.objects.filter(student=self.request.user).select_related('badge')
```

### 5.4 URL in `backend/accounts/urls.py`
```
GET /api/auth/badges/ → MyBadgesView
```

### 5.5 Signal in `backend/quizzes/signals.py` (NEW file)
- On `QuizAttempt` post_save, when `is_completed=True` and `score > 90`:
  - Get or create Badge with name='Отличник'
  - Create `ProfileBadge` if not exists (ignore duplicate)

### 5.6 Register signal in `backend/quizzes/apps.py`
```python
def ready(self):
    import quizzes.signals
```

### 5.7 Seed 'Отличник' badge in `backend/accounts/management/commands/seed_data.py`
- Add Badge.objects.get_or_create(name='Отличник', defaults={...})

### 5.8 Migration
```bash
python manage.py makemigrations accounts
python manage.py migrate
```

---

## Step 6: Gamification — Frontend

### 6.1 Types in `frontend/src/types/index.ts`
```typescript
export interface Badge {
  id: number;
  name: string;
  description: string;
  image_url: string;
}
export interface ProfileBadge {
  id: number;
  badge: Badge;
  awarded_at: string;
}
```

### 6.2 API in `frontend/src/api/auth.ts`
```typescript
export const getMyBadges = () => api.get<ProfileBadge[]>('/auth/badges/');
```

### 6.3 Update `frontend/src/pages/student/ProfilePage.tsx`
- Fetch badges on mount
- Display badges section below profile info (icon + name + awarded_at)

### 6.4 Update `frontend/src/layouts/StudentLayout.tsx`
- Fetch badge count
- Show badge count or icons near user info in sidebar

---

## Step 7: Selective Pagination — Backend

**Important:** Global pagination would break ALL frontend list fetches (currently expect arrays, pagination wraps in `{count, next, previous, results}`). Use selective pagination only.

### 7.1 `backend/config/settings.py`
Do NOT set global DEFAULT_PAGINATION_CLASS. Instead, set pagination per-view.

### 7.2 Apply pagination only to large-list views:
- **`backend/accounts/views.py`** `StudentListView` — add `pagination_class = PageNumberPagination` with `page_size = 20`
- **`backend/quizzes/views.py`** `AttemptViewSet` — add pagination

### 7.3 Frontend: update affected API calls
- `frontend/src/api/auth.ts` — `getStudents()` must handle paginated response
- `frontend/src/api/quizzes.ts` — `getAttempts()` must handle paginated response
- Add `PaginatedResponse<T>` type to `types/index.ts`

---

## Step 8: Analytics Charts — Frontend

### 8.1 Install recharts
```bash
cd frontend && npm install recharts
```

### 8.2 Update `frontend/src/pages/student/DashboardPage.tsx`
- Import `BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer` from recharts
- Add bar chart showing progress percentage per section (data already fetched from `/api/courses/progress/`)
- Place chart below the existing progress cards

### 8.3 Update `frontend/src/pages/teacher/DashboardPage.tsx`
- Import recharts components
- Add bar chart showing average score per section (data already fetched from `/api/grades/statistics/` → `section_stats`)
- Place chart below existing statistics cards

---

## Execution Order (dependency-aware)

| # | Task | Depends on | Files |
|---|------|-----------|-------|
| 1 | Media Audit | — | Read-only audit, fix if needed |
| 2 | Backend: LessonVideo model + serializers + views + URLs | — | courses/models,serializers,views,urls + settings |
| 3 | Backend: Migration for LessonVideo | Step 2 | `makemigrations` |
| 4 | Docker: nginx client_max_body_size | — | nginx.conf |
| 5 | Frontend: install react-player + recharts | — | package.json |
| 6 | Frontend: types + API for videos | Step 2 | types/index.ts, teacher.ts |
| 7 | Frontend: ContentManagerPage video upload | Step 6 | ContentManagerPage.tsx |
| 8 | Frontend: TopicDetailPage video playback | Step 6 | TopicDetailPage.tsx |
| 9 | Backend: Badge + ProfileBadge models | — | accounts/models.py |
| 10 | Backend: Badge serializers + views + URLs | Step 9 | accounts/serializers,views,urls |
| 11 | Backend: Quiz completion signal | Step 9 | quizzes/signals.py, quizzes/apps.py |
| 12 | Backend: Seed badge + migration | Step 9 | seed_data.py, `makemigrations` |
| 13 | Backend: Selective pagination | — | settings.py, accounts/views, quizzes/views |
| 14 | Frontend: Badge types + API | Step 10 | types/index.ts, auth.ts |
| 15 | Frontend: ProfilePage badges | Step 14 | ProfilePage.tsx |
| 16 | Frontend: StudentLayout badge display | Step 14 | StudentLayout.tsx |
| 17 | Frontend: Student dashboard chart | Step 5 | DashboardPage.tsx (student) |
| 18 | Frontend: Teacher dashboard chart | Step 5 | DashboardPage.tsx (teacher) |
| 19 | Frontend: Pagination handling | Step 13 | types, auth.ts, quizzes.ts |

## Verification
1. `cd backend && python manage.py makemigrations --check` — no pending migrations
2. `cd frontend && npx tsc -b` — no type errors
3. `docker compose up --build` — builds and runs
4. Upload video via teacher → plays on student view
5. Score >90% on quiz → badge appears on profile + sidebar
6. Charts render on both dashboards
7. Student list paginates correctly
