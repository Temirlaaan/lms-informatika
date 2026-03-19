# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LMS "Информатика 5 сынып" — a Kazakh-language Learning Management System for Grade 5 Computer Science. Django 5 + DRF backend, React 19 + TypeScript + Tailwind 4 frontend, SQLite database.

## Build & Run

```bash
# Docker (production-like)
docker compose up --build          # Backend :8000, Frontend :3000

# Backend (local dev)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data         # Creates 3 users, 5 sections, 15 topics, quizzes
python manage.py runserver         # http://localhost:8000

# Frontend (local dev) — proxies /api to :8000
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

## Type Checking & Linting

```bash
# Frontend — strict mode with noUnusedLocals/noUnusedParameters
cd frontend && npx tsc -b          # Must pass before Docker build (tsc -b && vite build)
cd frontend && npm run lint        # ESLint

# Backend — no pytest installed yet; syntax check only
python3 -c "import py_compile; py_compile.compile('path/to/file.py', doraise=True)"
```

**Important:** Docker frontend build runs `tsc -b` which fails on unused imports/variables. Always run `npx tsc -b` locally before pushing.

## Architecture

### Backend (Django 5 + DRF)

Four apps: `accounts`, `courses`, `quizzes`, `grades`. Each has models/views/serializers/urls.

**Auth:** JWT via simplejwt (15min access, 7d refresh). Custom `User` model with `role` field (`student`/`teacher`). Registration is student-only; teachers created via Django admin (`/admin/`). Permissions: `IsStudent`, `IsTeacher` in `accounts/permissions.py`.

**API routes** (all under `/api/`):
- `/api/auth/` — register, login, token refresh, profile
- `/api/courses/` — sections, topics, lessons (student read-only + teacher CRUD at `/courses/teacher/`)
- `/api/quizzes/` — quiz by topic, start/submit attempt (student) + teacher CRUD at `/quizzes/teacher/`
- `/api/grades/` — student grades, teacher gradebook, statistics

**Key models:**
- `Section → Topic → Lesson` (1:1 Topic↔Lesson, Lesson has LessonImage children)
- `Quiz → Question → Choice` (1:1 Topic↔Quiz)
- `QuizAttempt → StudentAnswer` (tracks each attempt with timing)
- `Grade` (unique per student+section, stores best attempt score)
- `TopicProgress` (unique per student+topic, tracks completion)

**Database:** SQLite at `DB_DIR/db.sqlite3`. Docker mounts volume at `/app/data`.

### Frontend (React 19 + Vite 7 + Tailwind 4)

**Routing (App.tsx):** Three route groups wrapped by guards:
- `GuestRoute` — `/`, `/login`, `/register` (redirects logged-in users)
- `ProtectedRoute({student})` — `/student/*` inside `StudentLayout`
- `ProtectedRoute({teacher})` — `/teacher/*` inside `TeacherLayout`

**State:** AuthContext for user/login/logout. No external state library — each page fetches its own data via Axios.

**API layer:** `src/api/` — separate files per domain (`courses.ts`, `quizzes.ts`, `grades.ts`, `teacher.ts`). Axios instance in `axios.ts` with JWT interceptor and token refresh.

**Key components:**
- `ErrorBoundary` — catches render crashes
- `Toast` — context-based notification system (`useToast()`)
- `ContentManagerPage` — uses ReactQuill WYSIWYG editor, YouTube URL auto-embed
- `TopicDetailPage` — sanitizes lesson HTML via DOMPurify
- `QuizPage` — resilient timer (localStorage end-time + backend `started_at`)

## Conventions

- All UI text in Kazakh (kk). HTML `lang="kk"`.
- Backend time zone: `Asia/Almaty`. All API dates in ISO 8601.
- Quiz scoring: total_points from ALL questions (unanswered = 0), best attempt kept in Grade.
- Backend enforces quiz time limit (time_limit + 30s grace period).
- Lesson `video_url`: frontend converts YouTube URLs to embed format; backend accepts null for empty.
