# PRD: LMS "Информатика 5 сынып" — Казахский язык

## Обзор проекта

Создать Learning Management System (LMS) для предмета "Информатика" 5 класса на казахском языке.
Это дипломный проект. Весь интерфейс, контент, сообщения, валидация — на казахском языке.
Система включает: регистрацию/авторизацию (ученик/учитель), учебные материалы по 5 разделам,
тестирование с автоматической проверкой, журнал оценок.

## Технологический стек

- **Backend:** Python 3.12, Django 5, Django REST Framework, PostgreSQL, JWT (simplejwt)
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios
- **Инфраструктура:** VM (Ubuntu), PostgreSQL установлен локально, Git + GitHub

## Структура проекта

```
lms-informatika/
├── backend/
│   ├── config/              # Django settings, urls, wsgi
│   ├── accounts/            # Пользователи, авторизация, JWT
│   ├── courses/             # Бөлімдер, тақырыптар, сабақтар
│   ├── quizzes/             # Тесттер, сұрақтар, жауаптар
│   ├── grades/              # Бағалар журналы
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance, API функции
│   │   ├── components/      # layout/, ui/, common/
│   │   ├── pages/           # auth/, student/, teacher/
│   │   ├── hooks/           # useAuth, useQuiz и т.д.
│   │   ├── context/         # AuthContext
│   │   ├── types/           # TypeScript интерфейсы
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Функциональные требования

### FR-1: Авторизация и пользователи
- Регистрация с выбором роли: Оқушы (ученик) / Мұғалім (учитель)
- JWT-аутентификация: access token (15 мин) + refresh token (7 дней)
- Поля: username, password, full_name, role, grade_class (для учеников, напр. "5А")
- Профиль пользователя с аватаром
- Защита роутов по ролям (ученик не видит учительские страницы и наоборот)

### FR-2: Учебный контент (курс)
- 5 разделов (бөлім) с фиксированной структурой
- Каждый раздел содержит 3 темы (тақырып)
- Каждая тема содержит урок (сабақ): HTML-контент, изображения, видео (YouTube embed)
- Отслеживание прогресса: ученик отмечает тему как пройденную
- Прогресс-бар для каждого раздела

### FR-3: Тестирование
- Каждая тема имеет тест с 5 вопросами
- Типы вопросов: один правильный ответ, несколько правильных, правда/ложь
- Таймер обратного отсчёта (15 минут по умолчанию)
- Автоматическая отправка при истечении таймера
- Ограничение попыток (по умолчанию 3)
- Мгновенный показ результата: баллы, правильные/неправильные ответы
- Правильные ответы не доступны через API до завершения теста

### FR-4: Оценки
- Автоматический расчёт: ≥85% = 5, ≥70% = 4, ≥50% = 3, <50% = 2
- Личный журнал оценок для ученика
- Общий журнал для учителя (все ученики × все разделы)
- Статистика: средний балл, процент завершённости

### FR-5: Панель учителя
- CRUD для разделов, тем, уроков
- CRUD для тестов и вопросов
- Просмотр списка учеников и их результатов
- Общая статистика класса

### FR-6: Seed Data
- Management command `python manage.py seed_data`
- Суперюзер: admin / admin123
- Учитель: teacher / teacher123
- Ученик: student / student123 (класс 5А)
- Полное заполнение: 5 бөлім, 15 тақырып, 15 уроков, 15 тестов, 75 вопросов
- Весь контент реалистичный, на казахском языке, соответствует программе информатики 5 класса

---

## Контент курса

### 1-БӨЛІМ: Ақпарат және ақпаратты ұсыну
1. Ақпарат деген не — Ақпарат ұғымы, ақпарат көздері
2. Ақпарат түрлері — Мәтіндік, графикалық, дыбыстық, бейне ақпарат
3. Ақпаратты беру — Ақпаратты беру тәсілдері, байланыс құралдары

### 2-БӨЛІМ: Компьютерлік графика
1. Растрлық сурет — Пиксельдер, растрлық редакторлар, форматтар
2. Векторлық сурет — Векторлық графика принципі
3. Растр және векторлық суреттерді салыстыру — Айырмашылықтар, қолдану

### 3-БӨЛІМ: Робототехника негіздері
1. Робот деген не — Робот ұғымы, робототехника тарихы
2. Робот түрлері — Өнеркәсіптік, тұрмыстық, медициналық роботтар
3. Роботты қолдану — Роботтардың қолдану салалары

### 4-БӨЛІМ: Роботтың қозғалысы және алгоритмдер
1. Роботтың сызық бойымен қозғалысы — Датчиктер, сызықты бақылау
2. Қарапайым командалар — Алға, артқа, бұрылу командалары
3. Қадамдап орындау — Алгоритм ұғымы, қадамдық орындау

### 5-БӨЛІМ: Компьютер және интернет қауіпсіздігі
1. Компьютермен дұрыс жұмыс істеу — Эргономика, денсаулық
2. Интернеттегі қауіп-қатерлер — Вирустар, фишинг, алаяқтық
3. Жеке деректерді қорғау — Құпиясөз, жеке ақпарат қауіпсіздігі

---

## Модели данных

### accounts.User (extends AbstractUser)
| Поле | Тип | Описание |
|------|-----|----------|
| role | CharField(10) | 'student' / 'teacher' |
| full_name | CharField(255) | Толық аты |
| avatar | ImageField | Аватар (optional) |
| grade_class | CharField(10) | Сынып: "5А", "5Б" (only students) |
| created_at | DateTimeField | auto_now_add |

### courses.Section (Бөлім)
| Поле | Тип | Описание |
|------|-----|----------|
| title | CharField(255) | Бөлім атауы |
| description | TextField | Сипаттама |
| order | PositiveIntegerField | Реттік нөмір |
| icon | CharField(50) | Иконка аты |
| is_published | BooleanField | Жарияланды ма |

### courses.Topic (Тақырып)
| Поле | Тип | Описание |
|------|-----|----------|
| section | FK → Section | Бөлімге сілтеме |
| title | CharField(255) | Тақырып атауы |
| order | PositiveIntegerField | Реттік нөмір |
| is_published | BooleanField | Жарияланды ма |

### courses.Lesson (Сабақ)
| Поле | Тип | Описание |
|------|-----|----------|
| topic | OneToOne → Topic | Тақырыпқа сілтеме |
| content | TextField | HTML контент |
| video_url | URLField | YouTube видео (optional) |

### courses.LessonImage
| Поле | Тип | Описание |
|------|-----|----------|
| lesson | FK → Lesson | Сабаққа сілтеме |
| image | ImageField | Сурет файлы |
| caption | CharField(255) | Сурет сипаттамасы |

### courses.TopicProgress
| Поле | Тип | Описание |
|------|-----|----------|
| student | FK → User | Оқушы |
| topic | FK → Topic | Тақырып |
| is_completed | BooleanField | Аяқталды ма |
| completed_at | DateTimeField | Аяқталған уақыт |
| unique_together | (student, topic) | |

### quizzes.Quiz (Тест)
| Поле | Тип | Описание |
|------|-----|----------|
| topic | OneToOne → Topic | Тақырыпқа сілтеме |
| title | CharField(255) | Тест атауы |
| description | TextField | Сипаттама |
| time_limit_minutes | PositiveIntegerField | Уақыт лимиті (дефолт 15) |
| passing_score | PositiveIntegerField | Өту балы % (дефолт 60) |
| max_attempts | PositiveIntegerField | Макс. әрекет (дефолт 3) |
| is_published | BooleanField | Жарияланды ма |

### quizzes.Question (Сұрақ)
| Поле | Тип | Описание |
|------|-----|----------|
| quiz | FK → Quiz | Тестке сілтеме |
| text | TextField | Сұрақ мәтіні |
| question_type | CharField(10) | 'single' / 'multiple' / 'true_false' |
| image | ImageField | Сурет (optional) |
| points | PositiveIntegerField | Балл (дефолт 1) |
| order | PositiveIntegerField | Реттік нөмір |

### quizzes.Choice (Нұсқа)
| Поле | Тип | Описание |
|------|-----|----------|
| question | FK → Question | Сұраққа сілтеме |
| text | CharField(500) | Нұсқа мәтіні |
| is_correct | BooleanField | Дұрыс жауап па |
| order | PositiveIntegerField | Реттік нөмір |

### quizzes.QuizAttempt (Тест әрекеті)
| Поле | Тип | Описание |
|------|-----|----------|
| student | FK → User | Оқушы |
| quiz | FK → Quiz | Тест |
| score | FloatField | Пайыздық балл |
| total_points | PositiveIntegerField | Жалпы балл |
| earned_points | PositiveIntegerField | Жинаған балл |
| started_at | DateTimeField | Басталуы |
| finished_at | DateTimeField | Аяқталуы |
| is_completed | BooleanField | Аяқталды ма |

### quizzes.StudentAnswer (Оқушы жауабы)
| Поле | Тип | Описание |
|------|-----|----------|
| attempt | FK → QuizAttempt | Әрекетке сілтеме |
| question | FK → Question | Сұрақ |
| selected_choices | M2M → Choice | Таңдалған нұсқалар |
| is_correct | BooleanField | Дұрыс па |
| points_earned | PositiveIntegerField | Алынған балл |

### grades.Grade (Баға)
| Поле | Тип | Описание |
|------|-----|----------|
| student | FK → User | Оқушы |
| section | FK → Section | Бөлім |
| quiz_attempt | FK → QuizAttempt | Тест әрекеті (nullable) |
| score | FloatField | Пайыздық балл |
| grade_value | PositiveIntegerField | Баға: 2, 3, 4, 5 |

Баға шкаласы: ≥85% → 5, ≥70% → 4, ≥50% → 3, <50% → 2

---

## API Endpoints

### Auth — `/api/auth/`
- `POST /register/` — Тіркелу
- `POST /login/` — Кіру (JWT)
- `POST /token/refresh/` — Токен жаңарту
- `GET /profile/` — Профиль
- `PUT /profile/` — Профильді өзгерту

### Courses — `/api/courses/`
- `GET /sections/` — Барлық бөлімдер
- `GET /sections/:id/` — Бөлім + тақырыптар
- `GET /topics/:id/` — Тақырып + сабақ
- `POST /topics/:id/complete/` — Тақырыпты аяқтау
- `GET /progress/` — Оқушы прогресі

### Quizzes — `/api/quizzes/`
- `GET /topic/:topic_id/` — Тақырып тесті
- `POST /:quiz_id/start/` — Тестті бастау
- `POST /:quiz_id/submit/` — Тестті тапсыру
- `GET /attempts/` — Менің нәтижелерім
- `GET /attempts/:id/` — Нәтиже детальды

### Grades — `/api/grades/`
- `GET /my/` — Менің бағаларым
- `GET /journal/` — Баға журналы (teacher)
- `GET /student/:id/` — Оқушы бағалары (teacher)
- `GET /statistics/` — Статистика

### Teacher — `/api/teacher/`
- CRUD: `/sections/`, `/topics/`, `/lessons/`, `/quizzes/`, `/questions/`
- `GET /students/` — Оқушылар тізімі

---

## Страницы Frontend

### Публичные
1. `/` — Лендинг (описание курса, кнопки Кіру/Тіркелу)
2. `/login` — Кіру формасы
3. `/register` — Тіркелу формасы

### Оқушы (student) — `/student/`
4. `/student/dashboard` — Обзор: прогресс, последние оценки
5. `/student/sections` — 5 бөлім карточками с прогресс-баром
6. `/student/sections/:id` — Темы раздела с отметками прогресса
7. `/student/topics/:id` — Материал урока + кнопка "Тестке өту"
8. `/student/quiz/:id` — Тест: таймер, вопросы, варианты
9. `/student/quiz/:id/result` — Результат теста
10. `/student/grades` — Журнал оценок

### Мұғалім (teacher) — `/teacher/`
11. `/teacher/dashboard` — Статистика класса
12. `/teacher/content` — CRUD разделов, тем, уроков
13. `/teacher/quizzes` — CRUD тестов и вопросов
14. `/teacher/gradebook` — Журнал оценок всех учеников
15. `/teacher/students/:id` — Детали ученика

---

## UI/UX требования
- Адаптивный дизайн (мобильные + десктоп)
- Сайдбар навигация для панелей
- Цвета: основной #2563EB (синий), акцент #10B981 (зелёный)
- Оценки: 5=зелёный, 4=синий, 3=жёлтый, 2=красный
- Современный образовательный стиль
- Весь UI текст на казахском

---

## Настройки Django
- LANGUAGE_CODE = 'kk'
- TIME_ZONE = 'Asia/Almaty'
- PostgreSQL: DB_NAME=lms_informatika, DB_USER=lms_user, DB_HOST=localhost
- CORS разрешён для localhost:5173 (Vite dev server)
- MEDIA_ROOT для загрузки файлов

---

## Декомпозиция на эпики (для CCPM)

### Epic 1: Project Setup & Models (последовательно, первый)
- Инициализация Django проекта с настройками PostgreSQL
- Создание всех моделей (accounts, courses, quizzes, grades)
- Миграции
- Django Admin регистрация моделей
- Инициализация Vite + React + TS + Tailwind проекта
- Базовая структура папок фронтенда

### Epic 2: Auth System (последовательно, после Epic 1)
- Backend: register, login, profile, JWT endpoints, permissions
- Frontend: AuthContext, ProtectedRoute, Login/Register pages

### Epic 3: Course Content (параллельно backend + frontend после Epic 2)
- Backend: Section, Topic, Lesson API + progress tracking
- Frontend: sections list, section detail, topic/lesson page

### Epic 4: Quiz System (параллельно backend + frontend после Epic 2)
- Backend: Quiz, Question, Choice, Attempt, Answer API + scoring logic
- Frontend: quiz page с таймером, result page

### Epic 5: Grades & Teacher Panel (параллельно backend + frontend после Epic 3+4)
- Backend: grades API, teacher CRUD API, statistics
- Frontend: student grades page, teacher dashboard, content management, gradebook

### Epic 6: Seed Data & Polish (последний)
- Management command seed_data с полным контентом на казахском
- 75 реалистичных вопросов
- README.md
- Финальное тестирование всех флоу

---

## Параллелизация задач (для мультиагентов CCPM)

Задачи которые МОЖНО делать параллельно:
- Backend API courses + Backend API quizzes (после auth готов)
- Frontend student pages + Frontend teacher pages (после базовых компонентов)
- Seed data content writing (независимо от кода, после моделей)

Задачи которые НЕЛЬЗЯ параллелить:
- Models → API (API зависит от моделей)
- Auth backend → Auth frontend → остальные страницы
- Quiz API → Grades API (grades зависят от quiz attempts)
