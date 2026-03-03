---
name: lms-informatika
description: Learning Management System for 5th grade Informatics course in Kazakh language — diploma project with Django/React stack
status: backlog
created: 2026-03-03T07:54:28Z
---

# PRD: LMS "Информатика 5 сынып"

## Executive Summary

Build a Learning Management System (LMS) for the subject "Информатика" (Computer Science) for 5th grade students, entirely in Kazakh language. This is a diploma project. The entire interface, content, messages, and validation must be in Kazakh.

The system includes: registration/authentication (student/teacher roles), educational materials across 5 sections, testing with automatic grading, and a grade journal.

**Value Proposition:** Provide a complete, localized digital learning platform for Kazakh-language 5th grade Computer Science education, enabling students to study materials, take quizzes, and track progress, while giving teachers tools to manage content and monitor student performance.

## Problem Statement

There is a need for a dedicated, Kazakh-language LMS for 5th grade Informatics curriculum. Current solutions either lack Kazakh language support, are not tailored to the specific curriculum, or do not provide the integrated content + testing + grading workflow needed for this educational context.

This project addresses the gap by building a purpose-built system with:
- Full Kazakh language UI and content
- Curriculum-aligned course structure (5 sections, 15 topics)
- Integrated quiz system with automatic scoring
- Role-based access for students and teachers

## User Stories

### Persona: Оқушы (Student)
- **US-1:** As a student, I can register with my name, class (e.g., "5А"), and credentials so I can access the platform
- **US-2:** As a student, I can browse 5 course sections and see my progress bar for each section
- **US-3:** As a student, I can read lesson content (text, images, YouTube videos) for each topic
- **US-4:** As a student, I can mark a topic as completed to track my learning progress
- **US-5:** As a student, I can take a timed quiz (15 min) with up to 3 attempts per topic
- **US-6:** As a student, I can see my quiz results immediately with score breakdown
- **US-7:** As a student, I can view my grade journal with all section scores

### Persona: Мұғалім (Teacher)
- **US-8:** As a teacher, I can create/edit/delete sections, topics, and lessons
- **US-9:** As a teacher, I can create/edit/delete quizzes and questions with multiple question types
- **US-10:** As a teacher, I can view the full gradebook for all students across all sections
- **US-11:** As a teacher, I can view individual student details and statistics
- **US-12:** As a teacher, I can see class-wide statistics (average scores, completion rates)

### Acceptance Criteria
- All UI text displayed in Kazakh language
- JWT authentication with 15min access / 7-day refresh tokens
- Role-based route protection (students cannot access teacher pages and vice versa)
- Quiz correct answers not exposed via API until quiz is submitted
- Automatic grade calculation: ≥85%→5, ≥70%→4, ≥50%→3, <50%→2

## Requirements

### Functional Requirements

#### FR-1: Authentication & Users
- Registration with role selection: Оқушы (student) / Мұғалім (teacher)
- JWT authentication: access token (15 min) + refresh token (7 days)
- Fields: username, password, full_name, role, grade_class (for students, e.g., "5А")
- User profile with avatar
- Role-based route protection

#### FR-2: Course Content
- 5 sections (бөлім) with fixed structure
- Each section contains 3 topics (тақырып)
- Each topic contains a lesson (сабақ): HTML content, images, YouTube embed
- Progress tracking: student marks topic as completed
- Progress bar for each section

#### FR-3: Quiz System
- Each topic has a quiz with 5 questions
- Question types: single answer, multiple answers, true/false
- Countdown timer (15 minutes default)
- Auto-submit when timer expires
- Attempt limit (default 3)
- Instant result display: scores, correct/incorrect answers
- Correct answers not accessible via API until quiz completion

#### FR-4: Grades
- Auto-calculation: ≥85%=5, ≥70%=4, ≥50%=3, <50%=2
- Personal grade journal for students
- Full gradebook for teachers (all students × all sections)
- Statistics: average score, completion percentage

#### FR-5: Teacher Panel
- CRUD for sections, topics, lessons
- CRUD for quizzes and questions
- Student list with results
- Class-wide statistics

#### FR-6: Seed Data
- Management command `python manage.py seed_data`
- Superuser: admin / admin123
- Teacher: teacher / teacher123
- Student: student / student123 (class 5А)
- Full content: 5 sections, 15 topics, 15 lessons, 15 quizzes, 75 questions
- All content realistic, in Kazakh, aligned with 5th grade Informatics curriculum

### Non-Functional Requirements

- **Performance:** Pages load within 2 seconds; quiz submissions processed instantly
- **Security:** JWT-based auth, role-based permissions, correct answers not leaked before submission
- **Responsiveness:** Mobile + desktop adaptive design
- **Localization:** All UI text in Kazakh (LANGUAGE_CODE = 'kk', TIME_ZONE = 'Asia/Almaty')
- **Scalability:** PostgreSQL backend, standard Django/React architecture

## Technology Stack

- **Backend:** Python 3.12, Django 5, Django REST Framework, PostgreSQL, JWT (simplejwt)
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios
- **Infrastructure:** VM (Ubuntu), PostgreSQL local, Git + GitHub

## Project Structure

```
lms-informatika/
├── backend/
│   ├── config/              # Django settings, urls, wsgi
│   ├── accounts/            # Users, auth, JWT
│   ├── courses/             # Sections, topics, lessons
│   ├── quizzes/             # Quizzes, questions, answers
│   ├── grades/              # Grade journal
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance, API functions
│   │   ├── components/      # layout/, ui/, common/
│   │   ├── pages/           # auth/, student/, teacher/
│   │   ├── hooks/           # useAuth, useQuiz, etc.
│   │   ├── context/         # AuthContext
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## Data Models

### accounts.User (extends AbstractUser)
| Field | Type | Description |
|-------|------|-------------|
| role | CharField(10) | 'student' / 'teacher' |
| full_name | CharField(255) | Full name |
| avatar | ImageField | Avatar (optional) |
| grade_class | CharField(10) | Class: "5А", "5Б" (students only) |
| created_at | DateTimeField | auto_now_add |

### courses.Section (Бөлім)
| Field | Type | Description |
|-------|------|-------------|
| title | CharField(255) | Section title |
| description | TextField | Description |
| order | PositiveIntegerField | Sort order |
| icon | CharField(50) | Icon name |
| is_published | BooleanField | Published status |

### courses.Topic (Тақырып)
| Field | Type | Description |
|-------|------|-------------|
| section | FK → Section | Section reference |
| title | CharField(255) | Topic title |
| order | PositiveIntegerField | Sort order |
| is_published | BooleanField | Published status |

### courses.Lesson (Сабақ)
| Field | Type | Description |
|-------|------|-------------|
| topic | OneToOne → Topic | Topic reference |
| content | TextField | HTML content |
| video_url | URLField | YouTube video (optional) |

### courses.LessonImage
| Field | Type | Description |
|-------|------|-------------|
| lesson | FK → Lesson | Lesson reference |
| image | ImageField | Image file |
| caption | CharField(255) | Image caption |

### courses.TopicProgress
| Field | Type | Description |
|-------|------|-------------|
| student | FK → User | Student |
| topic | FK → Topic | Topic |
| is_completed | BooleanField | Completed |
| completed_at | DateTimeField | Completion time |
| unique_together | (student, topic) | |

### quizzes.Quiz (Тест)
| Field | Type | Description |
|-------|------|-------------|
| topic | OneToOne → Topic | Topic reference |
| title | CharField(255) | Quiz title |
| description | TextField | Description |
| time_limit_minutes | PositiveIntegerField | Time limit (default 15) |
| passing_score | PositiveIntegerField | Passing score % (default 60) |
| max_attempts | PositiveIntegerField | Max attempts (default 3) |
| is_published | BooleanField | Published status |

### quizzes.Question (Сұрақ)
| Field | Type | Description |
|-------|------|-------------|
| quiz | FK → Quiz | Quiz reference |
| text | TextField | Question text |
| question_type | CharField(10) | 'single' / 'multiple' / 'true_false' |
| image | ImageField | Image (optional) |
| points | PositiveIntegerField | Points (default 1) |
| order | PositiveIntegerField | Sort order |

### quizzes.Choice (Нұсқа)
| Field | Type | Description |
|-------|------|-------------|
| question | FK → Question | Question reference |
| text | CharField(500) | Choice text |
| is_correct | BooleanField | Correct answer |
| order | PositiveIntegerField | Sort order |

### quizzes.QuizAttempt (Тест әрекеті)
| Field | Type | Description |
|-------|------|-------------|
| student | FK → User | Student |
| quiz | FK → Quiz | Quiz |
| score | FloatField | Percentage score |
| total_points | PositiveIntegerField | Total points |
| earned_points | PositiveIntegerField | Earned points |
| started_at | DateTimeField | Start time |
| finished_at | DateTimeField | End time |
| is_completed | BooleanField | Completed |

### quizzes.StudentAnswer (Оқушы жауабы)
| Field | Type | Description |
|-------|------|-------------|
| attempt | FK → QuizAttempt | Attempt reference |
| question | FK → Question | Question |
| selected_choices | M2M → Choice | Selected choices |
| is_correct | BooleanField | Correct |
| points_earned | PositiveIntegerField | Points earned |

### grades.Grade (Баға)
| Field | Type | Description |
|-------|------|-------------|
| student | FK → User | Student |
| section | FK → Section | Section |
| quiz_attempt | FK → QuizAttempt | Quiz attempt (nullable) |
| score | FloatField | Percentage score |
| grade_value | PositiveIntegerField | Grade: 2, 3, 4, 5 |

Grade scale: ≥85% → 5, ≥70% → 4, ≥50% → 3, <50% → 2

## API Endpoints

### Auth — `/api/auth/`
- `POST /register/` — Register
- `POST /login/` — Login (JWT)
- `POST /token/refresh/` — Refresh token
- `GET /profile/` — Profile
- `PUT /profile/` — Update profile

### Courses — `/api/courses/`
- `GET /sections/` — All sections
- `GET /sections/:id/` — Section + topics
- `GET /topics/:id/` — Topic + lesson
- `POST /topics/:id/complete/` — Mark topic completed
- `GET /progress/` — Student progress

### Quizzes — `/api/quizzes/`
- `GET /topic/:topic_id/` — Topic quiz
- `POST /:quiz_id/start/` — Start quiz
- `POST /:quiz_id/submit/` — Submit quiz
- `GET /attempts/` — My results
- `GET /attempts/:id/` — Detailed result

### Grades — `/api/grades/`
- `GET /my/` — My grades
- `GET /journal/` — Grade journal (teacher)
- `GET /student/:id/` — Student grades (teacher)
- `GET /statistics/` — Statistics

### Teacher — `/api/teacher/`
- CRUD: `/sections/`, `/topics/`, `/lessons/`, `/quizzes/`, `/questions/`
- `GET /students/` — Student list

## Frontend Pages

### Public
1. `/` — Landing page (course description, Login/Register buttons)
2. `/login` — Login form
3. `/register` — Registration form

### Student — `/student/`
4. `/student/dashboard` — Overview: progress, recent grades
5. `/student/sections` — 5 sections as cards with progress bars
6. `/student/sections/:id` — Section topics with progress marks
7. `/student/topics/:id` — Lesson content + "Тестке өту" button
8. `/student/quiz/:id` — Quiz: timer, questions, choices
9. `/student/quiz/:id/result` — Quiz result
10. `/student/grades` — Grade journal

### Teacher — `/teacher/`
11. `/teacher/dashboard` — Class statistics
12. `/teacher/content` — CRUD for sections, topics, lessons
13. `/teacher/quizzes` — CRUD for quizzes and questions
14. `/teacher/gradebook` — All students gradebook
15. `/teacher/students/:id` — Student details

## UI/UX Requirements
- Responsive design (mobile + desktop)
- Sidebar navigation for panels
- Colors: primary #2563EB (blue), accent #10B981 (green)
- Grades: 5=green, 4=blue, 3=yellow, 2=red
- Modern educational style
- All UI text in Kazakh

## Course Content

### Section 1: Ақпарат және ақпаратты ұсыну
1. Ақпарат деген не — Ақпарат ұғымы, ақпарат көздері
2. Ақпарат түрлері — Мәтіндік, графикалық, дыбыстық, бейне ақпарат
3. Ақпаратты беру — Ақпаратты беру тәсілдері, байланыс құралдары

### Section 2: Компьютерлік графика
1. Растрлық сурет — Пиксельдер, растрлық редакторлар, форматтар
2. Векторлық сурет — Векторлық графика принципі
3. Растр және векторлық суреттерді салыстыру — Айырмашылықтар, қолдану

### Section 3: Робототехника негіздері
1. Робот деген не — Робот ұғымы, робототехника тарихы
2. Робот түрлері — Өнеркәсіптік, тұрмыстық, медициналық роботтар
3. Роботты қолдану — Роботтардың қолдану салалары

### Section 4: Роботтың қозғалысы және алгоритмдер
1. Роботтың сызық бойымен қозғалысы — Датчиктер, сызықты бақылау
2. Қарапайым командалар — Алға, артқа, бұрылу командалары
3. Қадамдап орындау — Алгоритм ұғымы, қадамдық орындау

### Section 5: Компьютер және интернет қауіпсіздігі
1. Компьютермен дұрыс жұмыс істеу — Эргономика, денсаулық
2. Интернеттегі қауіп-қатерлер — Вирустар, фишинг, алаяқтық
3. Жеке деректерді қорғау — Құпиясөз, жеке ақпарат қауіпсіздігі

## Django Settings
- LANGUAGE_CODE = 'kk'
- TIME_ZONE = 'Asia/Almaty'
- PostgreSQL: DB_NAME=lms_informatika, DB_USER=lms_user, DB_HOST=localhost
- CORS allowed for localhost:5173 (Vite dev server)
- MEDIA_ROOT for file uploads

## Success Criteria
- All 15 topics have lessons with realistic Kazakh-language content
- All 15 quizzes work with timer, auto-submit, and scoring
- Student can complete full flow: register → browse → study → quiz → view grades
- Teacher can manage all content and view gradebook
- Seed data populates complete course with 75 questions
- Responsive UI works on mobile and desktop
- All text displayed in Kazakh

## Constraints & Assumptions
- Diploma project — single developer/small team
- Deployed on Ubuntu VM with local PostgreSQL
- No external auth providers (custom JWT only)
- Content is static seed data (no user-generated content beyond teacher CRUD)
- YouTube embeds for video (no self-hosted video)

## Out of Scope
- Real-time collaboration or chat
- Payment/subscription system
- Multiple courses or grade levels (only 5th grade Informatics)
- Email notifications
- Advanced analytics or reporting dashboards
- Internationalization beyond Kazakh
- File upload for student assignments

## Dependencies
- PostgreSQL database server running locally
- Node.js / npm for frontend build
- Python 3.12 environment for backend
- GitHub repository for version control

## Epic Decomposition

### Epic 1: Project Setup & Models (sequential, first)
- Initialize Django project with PostgreSQL settings
- Create all models (accounts, courses, quizzes, grades)
- Migrations
- Django Admin model registration
- Initialize Vite + React + TS + Tailwind project
- Basic frontend folder structure

### Epic 2: Auth System (sequential, after Epic 1)
- Backend: register, login, profile, JWT endpoints, permissions
- Frontend: AuthContext, ProtectedRoute, Login/Register pages

### Epic 3: Course Content (parallel backend + frontend after Epic 2)
- Backend: Section, Topic, Lesson API + progress tracking
- Frontend: sections list, section detail, topic/lesson page

### Epic 4: Quiz System (parallel backend + frontend after Epic 2)
- Backend: Quiz, Question, Choice, Attempt, Answer API + scoring logic
- Frontend: quiz page with timer, result page

### Epic 5: Grades & Teacher Panel (parallel backend + frontend after Epic 3+4)
- Backend: grades API, teacher CRUD API, statistics
- Frontend: student grades page, teacher dashboard, content management, gradebook

### Epic 6: Seed Data & Polish (last)
- Management command seed_data with full Kazakh content
- 75 realistic questions
- README.md
- Final testing of all flows

## Parallelization Notes

**Can be parallelized:**
- Backend API courses + Backend API quizzes (after auth is ready)
- Frontend student pages + Frontend teacher pages (after base components)
- Seed data content writing (independent of code, after models)

**Cannot be parallelized:**
- Models → API (API depends on models)
- Auth backend → Auth frontend → remaining pages
- Quiz API → Grades API (grades depend on quiz attempts)
