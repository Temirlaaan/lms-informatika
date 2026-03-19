# Phase 4: Video Upload, Charts, Bug Fixes & Dark Mode Polish

## Context

User feedback on current state:
1. **Photo bug**: Images upload but display as white/broken in teacher gallery; student sees "Сабақ суреті" text but blank image
2. **Video upload**: Currently only YouTube URLs; need direct video file upload (max 50 MB)
3. **Charts**: Dashboards are plain text/tables — need recharts graphs for analytics
4. **Dark mode**: Both dashboards + ContentManagerPage + TopicDetailPage still use hardcoded `bg-white`, `text-gray-*` classes
5. **Editor**: Keep ReactQuill, add table support

---

## Phase 4.1: Bug Fixes (nginx + image display)

### Problem 1: nginx `client_max_body_size`
`frontend/nginx.conf` has no `client_max_body_size` — nginx default is **1 MB**. Any upload >1 MB silently fails with 413. This likely caused the "Bad Request" error when uploading photos.

**Fix:** Add `client_max_body_size 55m;` to nginx.conf (50 MB for video + 5 MB overhead).

### Problem 2: Image display in teacher ContentManagerPage
Images gallery shows `img.image` (e.g. `/media/lesson_images/file.png`) — this is correct. The white display issue may be caused by the image being a format the browser can't render, OR the container CSS hiding it. Need to add loading/error states to `<img>` tags.

**Files modified:**
- `frontend/nginx.conf` — add `client_max_body_size 55m;`

---

## Phase 4.2: Video File Upload

### Backend

**Model change** — `backend/courses/models.py`:
- Add `video_file = models.FileField(upload_to='lesson_videos/', blank=True, null=True)` to `Lesson`
- Keep `video_url` for YouTube links (both can coexist)
- Run `makemigrations` + `migrate`

**Serializer change** — `backend/courses/serializers.py`:
- `LessonSerializer`: add `video_file` to fields (read-only for students)
- `TeacherLessonSerializer`: add `video_file` to fields, add `validate_video_file()` with 50 MB limit

**View change** — `backend/courses/views.py`:
- `TeacherLessonViewSet`: support `multipart/form-data` parser for video upload

**Settings** — `backend/config/settings.py`:
- Increase `DATA_UPLOAD_MAX_MEMORY_SIZE` to `55 * 1024 * 1024` (55 MB)

### Frontend

**Types** — `frontend/src/types/index.ts`:
- Add `video_file?: string` to `Lesson` interface

**API** — `frontend/src/api/teacher.ts`:
- Change `updateLesson` to send `FormData` when video file is included
- Add `uploadLessonVideo(lessonId, file)` function

**ContentManagerPage** — `frontend/src/pages/teacher/ContentManagerPage.tsx`:
- Add video file upload UI below the YouTube URL input
- Show "YouTube немесе видео файл" choice
- Preview uploaded video with `<video>` tag

**TopicDetailPage** — `frontend/src/pages/student/TopicDetailPage.tsx`:
- If `video_file` exists, show `<video controls>` instead of YouTube iframe
- Priority: `video_file` > `video_url` (uploaded video takes precedence)

### Files modified:
| File | Change |
|------|--------|
| `backend/courses/models.py` | Add `video_file` FileField |
| `backend/courses/serializers.py` | Add `video_file` to serializers + validation |
| `backend/courses/views.py` | Add multipart parser |
| `backend/config/settings.py` | Increase upload limit to 55 MB |
| `frontend/src/types/index.ts` | Add `video_file` to Lesson |
| `frontend/src/api/teacher.ts` | Update `updateLesson` for FormData |
| `frontend/src/pages/teacher/ContentManagerPage.tsx` | Video upload UI |
| `frontend/src/pages/student/TopicDetailPage.tsx` | `<video>` player for uploaded files |

---

## Phase 4.3: Recharts Dashboards

### Install
```bash
cd frontend && npm install recharts
```

### Student Dashboard — `frontend/src/pages/student/DashboardPage.tsx`

Add two charts:
1. **Bar chart** — Section progress (% per section, horizontal bars via recharts `BarChart`)
2. **Radar/pie chart** — Grade distribution (scores across sections)

Replace current plain progress bars with recharts `BarChart`. Keep the existing data (no new API needed — `getProgress()` and `getMyGrades()` already return all needed data).

### Teacher Dashboard — `frontend/src/pages/teacher/DashboardPage.tsx`

Add two charts:
1. **Bar chart** — Average score by section (from existing `section_stats`)
2. **Pie chart** — Completion rate overview (completed vs not completed students)

Replace the current table with charts + keep table below. No new API endpoints needed — `getStatistics()` already returns `section_stats` with `avg_score`, `completion_rate`, `students_completed`.

### Files modified:
| File | Change |
|------|--------|
| `frontend/package.json` | Add `recharts` dependency |
| `frontend/src/pages/student/DashboardPage.tsx` | Add BarChart + PieChart |
| `frontend/src/pages/teacher/DashboardPage.tsx` | Add BarChart + PieChart |

---

## Phase 4.4: Dark Mode Polish (Dashboards + Teacher Pages)

Fix hardcoded `bg-white`, `text-gray-*` classes across remaining pages:

### Pages to fix:
1. **Student DashboardPage** — `bg-white` → `bg-card`, `text-gray-800` → `text-foreground`, etc.
2. **Teacher DashboardPage** — same pattern
3. **ContentManagerPage** — `bg-white`, `bg-gray-50`, `text-gray-700/800` → semantic tokens
4. **TopicDetailPage** — `bg-white` → `bg-card`, `text-gray-800` → `text-foreground`

### Pattern:
| Hardcoded | Semantic replacement |
|-----------|---------------------|
| `bg-white` | `bg-card` |
| `bg-gray-50` | `bg-muted` |
| `text-gray-800` | `text-foreground` |
| `text-gray-700` | `text-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-400` | `text-muted-foreground` |
| `bg-gray-200` | `bg-secondary` |
| `bg-gray-100` | `bg-muted` |
| `bg-gray-300` | `bg-secondary` |
| `border-gray-300` | `border-border` |
| `divide-gray-200` | `divide-border` |

### Files modified:
| File | Change |
|------|--------|
| `frontend/src/pages/student/DashboardPage.tsx` | Replace hardcoded colors |
| `frontend/src/pages/student/TopicDetailPage.tsx` | Replace hardcoded colors |
| `frontend/src/pages/teacher/DashboardPage.tsx` | Replace hardcoded colors |
| `frontend/src/pages/teacher/ContentManagerPage.tsx` | Replace hardcoded colors |

---

## Phase 4.5: ReactQuill Toolbar Enhancement

Add table, color, and alignment tools to the existing ReactQuill editor.

**ContentManagerPage.tsx** — expand `quillModules`:
```ts
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};
```

---

## Execution Order

1. **Phase 4.1** — nginx fix (quick, unblocks uploads)
2. **Phase 4.2** — Video upload (backend model + migration + frontend)
3. **Phase 4.3** — Recharts dashboards (install + charts)
4. **Phase 4.4** — Dark mode polish (all remaining pages)
5. **Phase 4.5** — ReactQuill toolbar (small change)

## Verification

1. `cd frontend && npx tsc -b` — no type errors
2. `docker compose up --build` — rebuild containers
3. Upload a 10 MB video → plays in student view
4. Upload a photo → visible in teacher gallery + student view
5. Toggle dark mode → all pages render correctly
6. Student dashboard shows bar/pie charts
7. Teacher dashboard shows bar/pie charts
8. ReactQuill toolbar shows color picker, alignment buttons
