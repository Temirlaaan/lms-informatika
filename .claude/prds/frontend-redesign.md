---
name: frontend-redesign
description: Redesign frontend with Tailwind CSS + shadcn/ui for modern, clean design with dark/light theme
status: backlog
created: 2026-03-18T14:51:47Z
---

# PRD: Frontend Redesign with Tailwind CSS & shadcn/ui

## Executive Summary

Полный редизайн фронтенда LMS "Информатика 5 сынып" с использованием компонентной библиотеки shadcn/ui поверх Tailwind CSS. Цель — современный, чистый дизайн в стиле Notion/Vercel с поддержкой темной/светлой темы, красивыми карточками курсов и современной типографикой. Проект переходит от inline Tailwind утилит к структурированной дизайн-системе.

## Problem Statement

### Текущие проблемы
1. **Нет дизайн-системы** — все стили написаны как inline Tailwind утилиты, нет переиспользуемых компонентов
2. **Визуальная несогласованность** — разные страницы используют разные паттерны для одних и тех же элементов (кнопки, карточки, формы)
3. **Нет темной темы** — только светлая тема, нет переключателя
4. **Устаревший визуал** — стандартные цвета без визуальной индивидуальности
5. **Плохая мобильная адаптация** — сайдбар работает, но многие страницы не оптимизированы под мобильные

### Почему сейчас
- Проект на стадии MVP, рефакторинг UI дешевле сейчас (28 TSX файлов), чем после масштабирования
- shadcn/ui стал стандартом для React + Tailwind проектов
- Пользователи (школьники 5 класса) ожидают современный интерфейс

## User Stories

### US-1: Ученик видит современный интерфейс
**Как** ученик 5 класса,
**Я хочу** видеть красивый, понятный интерфейс с яркими карточками курсов,
**Чтобы** было приятно и удобно учиться.

**Acceptance Criteria:**
- Карточки курсов с иконками/цветами, прогресс-баром, hover-эффектами
- Чистая типографика с правильной иерархией (Inter/Geist шрифт)
- Плавные анимации переходов между страницами

### US-2: Пользователь переключает тему
**Как** пользователь (ученик или учитель),
**Я хочу** переключаться между светлой и темной темой,
**Чтобы** работать комфортно в любое время суток.

**Acceptance Criteria:**
- Toggle в хедере/сайдбаре для переключения темы
- Тема сохраняется в localStorage
- Автоопределение системной темы при первом визите
- Все компоненты корректно отображаются в обеих темах

### US-3: Учитель управляет контентом в удобном интерфейсе
**Как** учитель,
**Я хочу** управлять курсами, темами и тестами через удобный админский интерфейс,
**Чтобы** тратить минимум времени на технические задачи.

**Acceptance Criteria:**
- Таблицы с сортировкой и фильтрацией (shadcn/ui Table)
- Формы с валидацией и подсказками (shadcn/ui Form)
- Модальные окна для подтверждения действий (shadcn/ui Dialog)
- Breadcrumbs для навигации

### US-4: Интерфейс удобен на мобильном устройстве
**Как** ученик, использующий телефон,
**Я хочу** удобно просматривать уроки и проходить тесты на мобильном,
**Чтобы** учиться где угодно.

**Acceptance Criteria:**
- Responsive layout на всех страницах
- Touch-friendly кнопки и элементы (min 44px target)
- Мобильный сайдбар с жестами (swipe to close)
- Адаптивные карточки курсов (1 колонка на mobile, 2-3 на desktop)

## Requirements

### Functional Requirements

#### FR-1: Дизайн-система на shadcn/ui
- Установить и настроить shadcn/ui с Tailwind CSS v4
- Создать `components/ui/` директорию с базовыми компонентами:
  - Button (варианты: default, destructive, outline, secondary, ghost, link)
  - Card (header, content, footer)
  - Input, Textarea, Select, Checkbox, Radio
  - Dialog, AlertDialog
  - Table (sortable headers)
  - Badge, Avatar
  - Tabs, Accordion
  - Toast (заменить текущий кастомный)
  - Skeleton (loading states)
  - DropdownMenu
  - Sheet (mobile sidebar)
- Настроить path aliases (`@/` → `src/`)

#### FR-2: Тема и цветовая схема
- CSS variables для цветов через `globals.css` (shadcn convention)
- Светлая тема: белый фон, серые акценты, синий primary
- Темная тема: dark slate фон, приглушенные цвета
- ThemeProvider на React Context + localStorage
- Toggle компонент в навигации

#### FR-3: Редизайн страниц

**Студенческие страницы:**
- Dashboard: карточки секций с иконками, прогресс-бар, статистика
- SectionDetail: список тем с чекмарками пройденных
- TopicDetail: чистый layout для контента, видео, навигация prev/next
- QuizPage: карточки вопросов, таймер-badge, прогресс-бар
- QuizResult: визуализация результата (круговая диаграмма), детали ответов

**Учительские страницы:**
- ContentManager: древовидная навигация, inline-editing
- GradebookPage: sortable таблица, фильтры, экспорт
- QuizManager: drag-and-drop порядок вопросов

**Общие:**
- Login/Register: centered card layout, социальные кнопки (будущее)
- Profile: аватар, формы редактирования
- 404: иллюстрация, навигация

#### FR-4: Типографика
- Системный шрифт стек с Inter/Geist как preferred
- Размеры: h1 (2.25rem), h2 (1.875rem), h3 (1.5rem), body (1rem), small (0.875rem)
- Line-height: 1.5 для body, 1.2 для заголовков
- Поддержка кириллицы (казахский, русский)

#### FR-5: Анимации и микро-взаимодействия
- Framer Motion для page transitions
- Hover эффекты на карточках (scale, shadow)
- Skeleton loading вместо спиннеров
- Toast notifications с slide-in анимацией (улучшить существующие)

### Non-Functional Requirements

#### NFR-1: Производительность
- Lighthouse Performance score >= 90
- First Contentful Paint < 1.5s
- Bundle size increase < 50KB gzipped от shadcn/ui (tree-shakeable)
- Lazy loading для страниц через React.lazy

#### NFR-2: Доступность (a11y)
- WCAG 2.1 AA compliance
- Keyboard navigation на всех интерактивных элементах
- ARIA labels на иконках и кнопках
- Контрастность цветов >= 4.5:1

#### NFR-3: Совместимость
- Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- iOS Safari, Android Chrome
- Работа при отключенном JavaScript: graceful degradation message

#### NFR-4: Maintainability
- Компоненты документированы через Storybook (опционально, фаза 2)
- Tailwind config с дизайн-токенами
- Максимум 300 строк на файл компонента

## Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Lighthouse Performance | ~70 | >= 90 |
| Lighthouse Accessibility | ~65 | >= 90 |
| Компонентов в ui/ | 0 | >= 15 |
| Дублирование стилей | Высокое | Минимальное |
| Тема | Только светлая | Светлая + темная |
| Mobile-friendly страниц | ~60% | 100% |

## Constraints & Assumptions

### Constraints
- **Tailwind CSS v4** уже используется — shadcn/ui должен работать с v4 (проверить совместимость)
- **React 19** — все компоненты должны быть совместимы
- **Без path aliases** в текущем конфиге — нужно настроить `@/` alias в vite.config.ts и tsconfig.json
- **28 TSX файлов** — все нужно мигрировать, но можно делать постепенно
- **Казахский язык** — шрифты должны поддерживать кириллицу

### Assumptions
- shadcn/ui совместим с Tailwind CSS v4 (на март 2026 — да)
- Функциональность не меняется — только визуальный слой
- Бэкенд API остается без изменений
- Можно мигрировать постепенно (page-by-page)

## Out of Scope

- Изменения в бэкенд API
- Новые функции (только визуальный редизайн существующих)
- Storybook (фаза 2)
- Internationalization framework (i18n)
- SSR/SSG переход
- E2E тесты UI (отдельный эпик)
- Мобильное приложение (PWA — отдельный эпик)

## Dependencies

### Новые npm пакеты
- `class-variance-authority` — для вариантов компонентов
- `clsx` + `tailwind-merge` — для условных классов (`cn()` утилита)
- `@radix-ui/*` — headless UI примитивы (основа shadcn/ui)
- `lucide-react` — иконки
- `framer-motion` — анимации (опционально)
- `next-themes` или кастомный ThemeProvider — переключение тем

### Внутренние зависимости
- Текущий Toast компонент будет заменен на shadcn/ui Toast
- ErrorBoundary останется, но получит новый стиль
- GuestRoute и ProtectedRoute — без изменений

## Implementation Phases

### Фаза 1: Фундамент (3-5 дней)
- Настройка shadcn/ui, path aliases, `cn()` утилита
- Установка базовых компонентов (Button, Card, Input, etc.)
- ThemeProvider + dark/light toggle
- Обновление globals.css с CSS variables
- Миграция Layout компонентов (StudentLayout, TeacherLayout)

### Фаза 2: Студенческие страницы (3-5 дней)
- Dashboard с новыми карточками
- SectionDetail, TopicDetail
- QuizPage, QuizResult
- Profile page

### Фаза 3: Учительские страницы (3-5 дней)
- ContentManager
- GradebookPage, StudentDetailPage
- QuizManager

### Фаза 4: Общие страницы и Polish (2-3 дня)
- Login, Register
- 404, Error pages
- Анимации, loading states
- Мобильная оптимизация
- Финальный QA
