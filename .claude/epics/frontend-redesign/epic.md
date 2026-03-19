---
name: frontend-redesign
status: backlog
created: 2026-03-18T14:55:00Z
progress: 0%
prd: .claude/prds/frontend-redesign.md
github: https://github.com/Temirlaaan/lms-informatika/issues/12
---

# Epic: Frontend Redesign with shadcn/ui

## Overview

Migrate the LMS frontend from raw Tailwind utility classes to a structured design system using shadcn/ui. The project currently has 18 pages and 7 components, all using inline Tailwind classes with no shared UI primitives. This epic introduces shadcn/ui components, dark/light theme support, `@/` path aliases, and systematically redesigns all pages for a modern Notion/Vercel-inspired look.

**Key constraint:** No backend changes. This is a pure frontend visual overhaul preserving all existing functionality.

## Architecture Decisions

### AD-1: shadcn/ui over full component libraries (MUI, Ant Design)
- **Rationale:** shadcn/ui copies component source into the project — no runtime dependency, full control, tree-shakeable. Perfect for a small project that needs to grow.
- Components live in `src/components/ui/` as owned source code.

### AD-2: Tailwind CSS v4 `@theme` + CSS variables for theming
- **Rationale:** shadcn/ui uses CSS custom properties for colors. Tailwind v4's `@theme` directive maps directly to CSS variables. No need for `tailwind.config.js` — everything stays in `index.css`.
- Light/dark theme via `class` strategy on `<html>` element.

### AD-3: Path aliases `@/` → `src/`
- **Rationale:** shadcn/ui components use `@/lib/utils` imports. Required for CLI generation. Configure in both `vite.config.ts` (resolve.alias) and `tsconfig.app.json` (paths).

### AD-4: Custom ThemeProvider over `next-themes`
- **Rationale:** `next-themes` is Next.js-specific. Build a lightweight ThemeProvider (~30 lines) using React Context + localStorage + `prefers-color-scheme` media query.

### AD-5: Lucide React for icons
- **Rationale:** shadcn/ui default icon set. Tree-shakeable, consistent style, Cyrillic-friendly labels.

### AD-6: No Framer Motion in Phase 1
- **Rationale:** Keep bundle lean. Use CSS transitions/animations for hover effects and page transitions. Add Framer Motion as optional polish later.

## Technical Approach

### Foundation Layer
1. **Install dependencies:** `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/*` (per-component)
2. **Configure path aliases:** Update `vite.config.ts` and `tsconfig.app.json`
3. **Create `cn()` utility:** `src/lib/utils.ts` — standard shadcn helper
4. **Rewrite `index.css`:** Replace 2-color `@theme` with full shadcn CSS variable set (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring) for both `:root` (light) and `.dark` (dark)
5. **Add Inter font** via Google Fonts in `index.html`

### Component Layer (shadcn/ui)
Generate or manually create these components in `src/components/ui/`:
- **Core:** Button, Card, Input, Textarea, Label, Select, Checkbox, Badge, Avatar, Separator
- **Overlay:** Dialog, AlertDialog, DropdownMenu, Sheet, Tooltip
- **Data:** Table, Skeleton, Progress
- **Feedback:** Toast/Sonner (replace custom Toast.tsx)
- **Navigation:** Tabs, Breadcrumb

### Theme System
- `ThemeProvider` context wrapping `<App>`
- Theme toggle button in sidebar (both StudentLayout and TeacherLayout)
- System preference detection on first visit
- Persist to `localStorage` key `theme`

### Page Migration Strategy
Each page migration follows the same pattern:
1. Replace raw `<button className="...">` with `<Button variant="..." />`
2. Replace raw card divs with `<Card><CardHeader>...</CardHeader><CardContent>...</CardContent></Card>`
3. Replace raw inputs with `<Input>`, `<Label>`, etc.
4. Replace raw tables with `<Table>` components
5. Add Skeleton loading states
6. Ensure dark mode classes work (replace hardcoded colors with CSS variables)
7. Add lucide-react icons where appropriate

## Task Breakdown

### Task 1: Setup shadcn/ui Foundation
- Install npm packages (cva, clsx, tailwind-merge, lucide-react)
- Configure `@/` path alias in vite.config.ts and tsconfig.app.json
- Create `src/lib/utils.ts` with `cn()` helper
- Rewrite `src/index.css` with full shadcn CSS variable theme (light + dark)
- Add Inter font to index.html
- **Files:** vite.config.ts, tsconfig.app.json, src/lib/utils.ts, src/index.css, index.html

### Task 2: Generate Core UI Components
- Create Button, Card, Input, Textarea, Label, Select, Badge, Separator, Skeleton, Progress
- All in `src/components/ui/` following shadcn/ui patterns
- **Files:** src/components/ui/*.tsx (10-12 new files)

### Task 3: Generate Overlay & Data UI Components
- Create Dialog, AlertDialog, DropdownMenu, Sheet, Table, Tabs, Breadcrumb, Tooltip
- Replace existing custom Toast with shadcn/ui Sonner or Toast
- **Files:** src/components/ui/*.tsx (8-10 new files), remove src/components/common/Toast.tsx

### Task 4: Theme System + Layout Redesign
- Create ThemeProvider context (src/components/ThemeProvider.tsx)
- Add theme toggle to StudentLayout and TeacherLayout sidebars
- Redesign sidebar: modern nav with lucide icons, active state styling, dark mode
- Redesign header/topbar
- Update App.tsx to wrap with ThemeProvider
- **Files:** src/components/ThemeProvider.tsx, StudentLayout.tsx, TeacherLayout.tsx, App.tsx

### Task 5: Redesign Auth & Common Pages
- LoginPage: centered Card layout, clean form with shadcn inputs
- RegisterPage: same Card pattern, role badge
- LandingPage: hero section, feature cards, CTA
- NotFoundPage: illustration + navigation
- ProfilePage: avatar placeholder, form with shadcn components
- **Files:** 5 page files in src/pages/

### Task 6: Redesign Student Pages (Dashboard, Sections, Topic)
- DashboardPage: section Cards with icons, Progress bars, welcome header
- SectionsPage: grid of Cards with topic counts
- SectionDetailPage: topic list with completion indicators, Badge for quiz
- TopicDetailPage: clean content layout, video embed, prev/next navigation, styled quiz CTA
- **Files:** 4 page files in src/pages/student/

### Task 7: Redesign Student Quiz Pages
- QuizPage: question Cards, timer Badge, answer selection with proper states, Progress bar
- QuizResultPage: score visualization, answer review with correct/incorrect indicators
- GradesPage: Table component with section grades
- **Files:** 3 page files in src/pages/student/

### Task 8: Redesign Teacher Pages
- ContentManagerPage: Tabs for sections/topics/lessons, Card-based editing, clean WYSIWYG area
- QuizManagerPage: Table for questions, Dialog for add/edit, Badge for question types
- GradebookPage: sortable Table, student scores, filters
- StudentDetailPage: student info Card, attempt history Table
- StudentsListPage: Table with search
- DashboardPage (teacher): stats Cards, quick actions
- **Files:** 6 page files in src/pages/teacher/

### Task 9: Mobile Optimization & Responsive Polish
- Sheet component for mobile sidebar (replace current mobile nav)
- Responsive grid adjustments on all card layouts
- Touch-friendly tap targets (min 44px)
- Test all pages at 375px, 768px, 1024px, 1440px breakpoints
- **Files:** Layout components, all page files (CSS adjustments)

### Task 10: Loading States, Animations & Final QA
- Add Skeleton loading to all pages that fetch data
- CSS transitions on Card hover (scale, shadow)
- Page transition animations via CSS
- Remove old inline color classes that conflict with theme
- Verify dark mode on every page
- Verify no TypeScript errors (`tsc -b`)
- **Files:** All pages (add Skeleton), index.css (animations)

## Dependencies

### External Packages (to install)
| Package | Purpose | Size Impact |
|---------|---------|------------|
| class-variance-authority | Component variants | ~3KB |
| clsx | Class merging | ~1KB |
| tailwind-merge | Tailwind class dedup | ~5KB |
| lucide-react | Icons | Tree-shakeable |
| @radix-ui/* | Headless UI primitives | Per-component |

### Internal Dependencies
- Task 1 (Foundation) blocks all other tasks
- Tasks 2-3 (Components) block Tasks 5-8 (Page redesigns)
- Task 4 (Theme) blocks Tasks 5-8 (Pages need dark mode)
- Task 9-10 (Polish) depend on all page redesigns

### Dependency Graph
```
Task 1 → Task 2 → Task 5, 6, 7, 8
Task 1 → Task 3 → Task 5, 6, 7, 8
Task 1 → Task 4 → Task 5, 6, 7, 8
Tasks 5-8 → Task 9 → Task 10
```

## Success Criteria (Technical)

- [ ] `npx tsc -b` passes with zero errors
- [ ] All 18 pages render correctly in light and dark themes
- [ ] All shadcn/ui components use CSS variables (no hardcoded colors)
- [ ] `@/` path alias works in all imports
- [ ] Bundle size increase < 50KB gzipped
- [ ] No visual regressions in functionality (all existing features work)
- [ ] Mobile layout works at 375px width
- [ ] Docker build succeeds

## Estimated Effort

| Task | Effort |
|------|--------|
| 1. Foundation setup | 2-3 hours |
| 2. Core UI components | 2-3 hours |
| 3. Overlay & data components | 2-3 hours |
| 4. Theme + Layouts | 3-4 hours |
| 5. Auth & common pages | 2-3 hours |
| 6. Student pages (main) | 3-4 hours |
| 7. Student quiz pages | 2-3 hours |
| 8. Teacher pages | 4-5 hours |
| 9. Mobile polish | 2-3 hours |
| 10. Loading states & QA | 2-3 hours |
| **Total** | **~24-34 hours** |

Critical path: Tasks 1 → 2/3/4 (parallel) → 5/6/7/8 (parallel) → 9 → 10

## Tasks Created
- [ ] #22 - Setup shadcn/ui Foundation (parallel: false) — blocks all
- [ ] #23 - Create Core UI Components (parallel: true)
- [ ] #24 - Create Overlay and Data UI Components (parallel: true)
- [ ] #25 - Theme System and Layout Redesign (parallel: true)
- [ ] #27 - Redesign Auth and Common Pages (parallel: true)
- [ ] #26 - Redesign Student Main Pages (parallel: true)
- [ ] #28 - Redesign Student Quiz Pages (parallel: true)
- [ ] #29 - Redesign Teacher Pages (parallel: true)
- [ ] #30 - Mobile Optimization and Responsive Polish (parallel: false)
- [ ] #31 - Loading States, Animations, and Final QA (parallel: false)

Total tasks: 10
Parallel tasks: 7
Sequential tasks: 3
Estimated total effort: 24-34 hours
