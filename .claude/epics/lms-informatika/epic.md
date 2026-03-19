---
name: lms-informatika
status: completed
created: 2026-03-03T10:37:56Z
progress: 100%
prd: .claude/prds/lms-informatika.md
github: https://github.com/Temirlaaan/lms-informatika/issues/1
---

# Epic: LMS "Информатика 5 сынып"

## Overview

Full-stack LMS implementation for 5th grade Informatics in Kazakh language. Django 5 + DRF backend with PostgreSQL, React 18 + TypeScript + Vite + Tailwind frontend. Two roles (student/teacher), 5 course sections with 15 topics, quiz system with auto-grading, and seed data with realistic Kazakh-language content.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | djangorestframework-simplejwt | PRD requirement; access 15min + refresh 7 days |
| Custom User | AbstractUser extension | Need role, full_name, grade_class, avatar fields |
| API style | DRF ViewSets + Routers | Minimizes boilerplate for CRUD-heavy teacher panel |
| Frontend state | React Context + hooks | Sufficient for auth state; no Redux needed for this scale |
| API client | Axios with interceptors | JWT refresh handling built into interceptor |
| CSS | Tailwind CSS | Fast prototyping, responsive out of the box |
| Routing | React Router v6 | Role-based layout routes with ProtectedRoute wrapper |
| Quiz timer | Client-side countdown + server-side validation | Timer UX on frontend; server enforces time_limit on submit |

## Technical Approach

### Backend (Django 5 + DRF)
- **4 Django apps:** accounts, courses, quizzes, grades
- **Custom User model** extending AbstractUser with role-based permissions
- **DRF ViewSets** for all CRUD operations; custom actions for quiz start/submit, topic complete
- **Permission classes:** IsStudent, IsTeacher, IsAuthenticated — applied per-view
- **Quiz scoring logic:** Server-side calculation on submit; Grade model auto-created from QuizAttempt
- **Correct answer protection:** Serializer excludes `is_correct` from Choice until attempt is completed
- **Django Admin:** Register all models for superuser access

### Frontend (React 18 + TypeScript)
- **AuthContext** wraps app; stores JWT tokens in localStorage; Axios interceptor handles refresh
- **ProtectedRoute** component checks role and redirects unauthorized users
- **Layout components:** StudentLayout (sidebar + content), TeacherLayout (sidebar + content), PublicLayout
- **15 pages** as defined in PRD, organized by role under `pages/auth/`, `pages/student/`, `pages/teacher/`
- **Reusable UI components:** Card, Button, ProgressBar, Modal, Table, Form inputs
- **Quiz page:** Timer component, question navigation, auto-submit on expiry

### Infrastructure
- PostgreSQL local (DB: lms_informatika, User: lms_user)
- Django CORS configured for localhost:5173
- MEDIA_ROOT for avatar and lesson image uploads
- Vite dev server proxying API requests to Django

## Implementation Strategy

Sequential build with parallelization where possible. Each task is a self-contained deliverable:

1. **Setup first** — both projects bootable before any features
2. **Auth second** — everything else depends on authenticated requests
3. **Courses + Quizzes in parallel** — independent API domains, can be built simultaneously
4. **Grades + Teacher panel** — depends on courses and quizzes being complete
5. **Seed data last** — needs all models and logic in place

### Testing Approach
- Django: Use DRF's APITestCase for endpoint testing
- Frontend: Manual testing of flows (diploma project scope)
- End-to-end: Verify full student and teacher flows with seed data

## Task Breakdown

- [ ] **Task 1: Project Setup & All Models** — Initialize Django project (settings, PostgreSQL, apps), define all 12 models across 4 apps, run migrations, register in Django Admin. Initialize Vite + React + TS + Tailwind project with folder structure.
- [ ] **Task 2: Auth Backend** — JWT endpoints (register, login, refresh, profile), custom User serializer, IsStudent/IsTeacher permission classes.
- [ ] **Task 3: Auth Frontend** — AuthContext with JWT storage + Axios interceptor, Login/Register pages, ProtectedRoute component, role-based routing in App.tsx.
- [ ] **Task 4: Course Content Backend** — Section/Topic/Lesson ViewSets, TopicProgress tracking, progress summary endpoint. Nested serializers for section→topics→lesson.
- [ ] **Task 5: Quiz & Grades Backend** — Quiz/Question/Choice ViewSets, start/submit actions with scoring logic, attempt tracking, Grade auto-creation. Grades API (student journal + teacher gradebook + statistics).
- [ ] **Task 6: Student Frontend — Courses** — Landing page, student dashboard, sections list with progress bars, section detail, topic/lesson page with YouTube embed and "mark complete".
- [ ] **Task 7: Student Frontend — Quiz & Grades** — Quiz page with countdown timer + auto-submit, result page with score breakdown, grade journal page.
- [ ] **Task 8: Teacher Frontend** — Teacher dashboard with class stats, content management (CRUD sections/topics/lessons), quiz management (CRUD quizzes/questions), gradebook, student detail page.
- [ ] **Task 9: Seed Data & Polish** — Management command `seed_data` with 5 sections, 15 topics, 15 lessons, 15 quizzes, 75 questions in Kazakh. Test users (admin, teacher, student). Final integration testing.

## Dependencies

```
Task 1 (Setup & Models)
  └── Task 2 (Auth Backend)
        └── Task 3 (Auth Frontend)
              ├── Task 4 (Course Backend) ──┐
              │     └── Task 6 (Student Courses FE)
              └── Task 5 (Quiz+Grades Backend)
                    ├── Task 7 (Student Quiz+Grades FE)
                    └── Task 8 (Teacher FE)
                          └── Task 9 (Seed Data & Polish)
```

Tasks 4+5 can run in parallel. Tasks 6+7+8 can run in parallel (after their backend dependency).

## Success Criteria (Technical)

- `python manage.py migrate` runs cleanly with all 12 models
- All API endpoints return correct responses with proper auth/permissions
- Student flow works end-to-end: register → login → browse sections → read lesson → take quiz → view grades
- Teacher flow works: login → manage content → view gradebook → view statistics
- `python manage.py seed_data` populates full course with 75 Kazakh-language questions
- Frontend is responsive on mobile (375px) and desktop (1280px+)
- All UI text is in Kazakh language
- Quiz timer works correctly with auto-submit
- Correct answers hidden until quiz submission

## Estimated Effort

| Task | Effort |
|------|--------|
| 1. Setup & Models | Medium |
| 2. Auth Backend | Small |
| 3. Auth Frontend | Medium |
| 4. Course Backend | Small |
| 5. Quiz+Grades Backend | Medium |
| 6. Student Courses FE | Medium |
| 7. Student Quiz+Grades FE | Medium |
| 8. Teacher FE | Large |
| 9. Seed Data & Polish | Medium |

**Critical path:** Tasks 1 → 2 → 3 → 5 → 8 → 9

## Tasks Created
- [ ] #2 - Project Setup & All Models (parallel: false)
- [ ] #3 - Auth Backend (parallel: false)
- [ ] #4 - Auth Frontend (parallel: false)
- [ ] #5 - Course Content Backend (parallel: true)
- [ ] #9 - Quiz & Grades Backend (parallel: true)
- [ ] #10 - Student Frontend — Courses (parallel: true)
- [ ] #6 - Student Frontend — Quiz & Grades (parallel: true)
- [ ] #7 - Teacher Frontend (parallel: true)
- [ ] #8 - Seed Data & Polish (parallel: false)

Total tasks: 9
Parallel tasks: 5
Sequential tasks: 4
