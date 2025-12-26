# Codebase Audit Report: ouiispeak-cms

**Date:** 2025-01-27  
**Scope:** Full repository scan for DRY, KISS, YAGNI, SOLID violations and dead code

---

## A) Findings by Principle

### DRY Violations

**1. Duplicate `slugify` function**
- **Principle:** DRY
- **Severity:** Medium
- **Files:** 
  - `app/edit-lesson/[lessonId]/page.tsx:50-56`
  - `app/new-lesson/page.tsx:30-36`
  - `app/new-module/page.tsx:14-20`
- **What's wrong:** Identical slugify function copied 3 times. Changes must be made in 3 places.
- **Risk:** Inconsistent slug generation if one copy is updated but others aren't.
- **Fix recommendation:** Extract to `lib/utils.ts` or `lib/slugify.ts` and import.
- **Estimated effort:** S

**2. Duplicate `nullIfEmpty` helper**
- **Principle:** DRY
- **Severity:** Medium
- **Files:**
  - `app/edit-lesson/[lessonId]/page.tsx:208`
  - `app/new-lesson/page.tsx:104`
  - `app/edit-group/[groupId]/page.tsx:197`
  - `app/new-group/page.tsx:94`
- **What's wrong:** Same helper function duplicated 4 times for converting empty strings to null.
- **Risk:** Inconsistent behavior if implementations diverge.
- **Fix recommendation:** Extract to `lib/utils.ts` as `nullIfEmpty(s: string): string | null`.
- **Estimated effort:** S

**3. Duplicate Supabase query patterns**
- **Principle:** DRY
- **Severity:** High
- **Files:**
  - Loading modules: `app/page.tsx:185-188`, `app/edit-lesson/[lessonId]/page.tsx:98-101`, `app/new-lesson/page.tsx:63-66`, `app/edit-module/[moduleId]/page.tsx:63-67`, `app/modules-browser/page.tsx:31-34`
  - Loading lessons: `app/page.tsx:189-192`, `app/new-slide/page.tsx:43-47`, `app/new-group/page.tsx:52-56`, `app/edit-group/[groupId]/page.tsx:79-83`, `app/lesson-slides/[lessonId]/page.tsx:55-59`
  - Loading groups: `app/page.tsx:193-196`, `app/edit-slide/[slideId]/page.tsx:95-99`, `app/new-slide/page.tsx:68-72`, `app/lesson-slides/[lessonId]/page.tsx:65-69`
  - Loading slides: `app/page.tsx:197-200`, `app/edit-slide/[slideId]/page.tsx:70-74`, `app/lesson-slides/[lessonId]/page.tsx:60-64`
- **What's wrong:** Same query patterns repeated across 10+ files. No centralized data access layer.
- **Risk:** Schema changes require updates in many places. Inconsistent error handling. Hard to add caching/monitoring.
- **Fix recommendation:** Create `lib/data/modules.ts`, `lib/data/lessons.ts`, `lib/data/groups.ts`, `lib/data/slides.ts` with functions like `loadModules()`, `loadLessonsByModule(moduleId)`, etc.
- **Estimated effort:** M

**4. Duplicate type definitions (DB row shapes)**
- **Principle:** DRY
- **Severity:** Medium
- **Files:**
  - `ModuleRow` defined in: `app/page.tsx:13-19`, `app/edit-lesson/[lessonId]/page.tsx:15-19`, `app/new-lesson/page.tsx:15-20`, `app/modules-browser/page.tsx:9-14`
  - `LessonRow` defined in: `app/page.tsx:21-27`, `app/new-slide/page.tsx:14`, `app/new-group/page.tsx:14-18`, `app/edit-group/[groupId]/page.tsx:15-19`, `app/lesson-slides/[lessonId]/page.tsx:16-20`, `app/slides-browser/page.tsx:10-14`
  - `GroupRow` defined in: `app/page.tsx:29-34`, `app/edit-slide/[slideId]/page.tsx:36-40`, `app/new-slide/page.tsx:15`, `app/lesson-slides/[lessonId]/page.tsx:22-26`, `app/slides-browser/page.tsx:16-21`
  - `SlideRow` defined in: `app/page.tsx:36-43`, `app/edit-slide/[slideId]/page.tsx:19-34`, `app/new-slide/page.tsx:17-23`, `app/lesson-slides/[lessonId]/page.tsx:14-20`, `app/slides-browser/page.tsx:23-29`
- **What's wrong:** Same DB row types redefined in every file. Changes to DB schema require updating many type definitions.
- **Risk:** Type drift, inconsistent field access, maintenance burden.
- **Fix recommendation:** Create `lib/types/db.ts` with shared types: `type ModuleRow = {...}`, `type LessonRow = {...}`, etc. Import everywhere.
- **Estimated effort:** M

**5. Duplicate inline styles**
- **Principle:** DRY
- **Severity:** Low
- **Files:**
  - Delete button SVG: `app/page.tsx:493-506`, `app/page.tsx:581-601`, `app/lesson-slides/[lessonId]/page.tsx:582-595` (appears 3+ times)
  - Error message styling: `app/new-slide/page.tsx:216-223`, `app/new-lesson/page.tsx:251-258`, `app/edit-lesson/[lessonId]/page.tsx:455-463` (pattern repeated 10+ times)
  - Success message styling: Same pattern as error messages
  - Player link button styling: `app/page.tsx:554-577`, `app/lesson-slides/[lessonId]/page.tsx:465-488` (duplicated)
- **What's wrong:** Repeated inline style objects for common UI patterns.
- **Risk:** Inconsistent styling, harder to maintain design system.
- **Fix recommendation:** Extract to `components/ui/Message.tsx` and `components/ui/DeleteButton.tsx`. Use `uiTokens` consistently.
- **Estimated effort:** S

**6. Duplicate form submission patterns**
- **Principle:** DRY
- **Severity:** Medium
- **Files:** All `new-*` and `edit-*` pages follow identical patterns:
  - `app/new-module/page.tsx:47-79`
  - `app/new-lesson/page.tsx:85-154`
  - `app/new-group/page.tsx:69-138`
  - `app/new-slide/page.tsx:87-161`
  - `app/edit-module/[moduleId]/page.tsx:96-144`
  - `app/edit-lesson/[lessonId]/page.tsx:183-246`
  - `app/edit-group/[groupId]/page.tsx:153-233`
- **What's wrong:** Same pattern: validate → setSaving(true) → supabase.insert/update → handle error → setSaving(false). No abstraction.
- **Risk:** Inconsistent error handling, hard to add features like optimistic updates or retry logic.
- **Fix recommendation:** Create `lib/hooks/useSupabaseMutation.ts` hook or `lib/data/mutations.ts` with helpers.
- **Estimated effort:** M

### KISS Violations

**7. Overly complex edit-slide page**
- **Principle:** KISS
- **Severity:** High
- **Files:** `app/edit-slide/[slideId]/page.tsx` (1727 lines)
- **What's wrong:** Single file contains multiple editors (AiSpeakRepeatEditor, TitleSlideEditor, TextSlideEditor, RawJsonEditor), complex state management, validation logic, and UI rendering all mixed together.
- **Risk:** Hard to test, modify, or extend. Adding new slide types requires modifying this massive file.
- **Fix recommendation:** Split into separate files: `components/slide-editors/AiSpeakRepeatEditor.tsx`, `components/slide-editors/TitleSlideEditor.tsx`, etc. Extract shared logic to hooks.
- **Estimated effort:** L

**8. Complex delete confirmation state machine**
- **Principle:** KISS
- **Severity:** Medium
- **Files:** `app/page.tsx:58-72, 233-312, 327-401`
- **What's wrong:** Two-step delete confirmation with custom state machine (`deleteStep: 1 | 2`, `deleteConfirmText`, `DeleteState` union type). Over-engineered for a simple confirmation.
- **Risk:** Harder to understand and maintain than a simple `window.confirm()` or modal component.
- **Fix recommendation:** Replace with a reusable `ConfirmDialog` component or use browser `confirm()` for MVP.
- **Estimated effort:** S

**9. Dual table system (production vs authoring)**
- **Principle:** KISS
- **Severity:** High
- **Files:** 
  - Production tables: `modules`, `lessons`, `lesson_groups`, `slides` (used by most pages)
  - Authoring tables: `lessons_authoring`, `lesson_groups_authoring`, `slides_authoring` (used by `new-slide-ai`, `edit-slide-ai`, `slides-browser`, `test-db`, `db-slide-*`)
- **What's wrong:** Two parallel table systems with unclear purpose. Some pages use production tables, others use authoring tables. Creates confusion and duplication.
- **Risk:** Data inconsistency, unclear which tables are "real", maintenance burden.
- **Fix recommendation:** Decide on single source of truth. Either migrate authoring pages to production tables OR document the workflow clearly and consolidate.
- **Estimated effort:** L

**10. Duplicate slide creation pages**
- **Principle:** KISS
- **Severity:** Medium
- **Files:**
  - `app/new-slide/page.tsx` (uses `slides` table)
  - `app/new-slide-ai/page.tsx` (uses `slides_authoring` table)
- **What's wrong:** Two pages doing essentially the same thing but writing to different tables. Unclear which one to use.
- **Risk:** Confusion, data inconsistency, maintenance burden.
- **Fix recommendation:** Consolidate into one page. If authoring workflow is needed, make it a feature flag or separate step in the same page.
- **Estimated effort:** M

**11. Complex nested data mapping logic**
- **Principle:** KISS
- **Severity:** Medium
- **Files:** `app/page.tsx:78-167`
- **What's wrong:** Complex `useMemo` with multiple Maps building hierarchical structure (modulesByLevel, lessonsByModule, groupsByLesson, slidesByGroup, ungroupedSlidesByLesson). Logic is hard to follow.
- **Risk:** Performance issues if data grows, hard to debug, brittle.
- **Fix recommendation:** Extract to `lib/data/buildHierarchy.ts` with clear functions and tests. Or use a library like `lodash.groupBy`.
- **Estimated effort:** M

### YAGNI Violations

**12. Unused slideSchema.ts**
- **Principle:** YAGNI
- **Severity:** Low
- **Files:** `lib/slideSchema.ts` (only imported by `app/mock-slide/[slide]/page.tsx`)
- **What's wrong:** Legacy schema file defining slide types that don't match current DB structure. Only used by a mock/test page.
- **Risk:** Confusion about which schema is "real". Dead code.
- **Fix recommendation:** Delete `lib/slideSchema.ts` and `app/mock-slide/[slide]/page.tsx` if mock page isn't needed. Or document it as legacy/test-only.
- **Estimated effort:** S

**13. Debug/test pages**
- **Principle:** YAGNI
- **Severity:** Medium
- **Files:**
  - `app/debug-tables/page.tsx` (empty placeholder)
  - `app/test-db/page.tsx` (connection test)
  - `app/db-slide-test/page.tsx` (test slide loading)
  - `app/db-slide-rename/page.tsx` (test slide updating)
- **What's wrong:** Development/debug pages left in production codebase. Not referenced anywhere, likely leftover experiments.
- **Risk:** Clutters codebase, confuses new developers, may expose test data.
- **Fix recommendation:** Delete all debug/test pages OR move to `/debug/*` route with authentication.
- **Estimated effort:** S

**14. Authoring table pages (new-slide-ai, edit-slide-ai)**
- **Principle:** YAGNI
- **Severity:** Medium
- **Files:**
  - `app/new-slide-ai/page.tsx`
  - `app/edit-slide-ai/page.tsx`
  - `app/slides-browser/page.tsx` (uses authoring tables)
- **What's wrong:** Pages using `slides_authoring` table system that may be legacy/unused. Unclear if this is active workflow.
- **Risk:** Confusion about which pages to use, potential data inconsistency.
- **Fix recommendation:** If authoring workflow is needed, document it clearly. If not, delete these pages and migrate any needed functionality to production pages.
- **Estimated effort:** M

**15. Mock data files**
- **Principle:** YAGNI
- **Severity:** Low
- **Files:**
  - `mock-data/slide1.json`
  - `mock-data/slide2.json`
  - `mock-data/real-ai-speak-repeat.json`
- **What's wrong:** Mock JSON files only used by test/mock pages. If those pages are deleted, these become dead code.
- **Risk:** Clutters repo, may become outdated.
- **Fix recommendation:** Delete if mock pages are removed. Otherwise keep but document as test-only.
- **Estimated effort:** S

**16. Legacy exports in uiTokens.ts**
- **Principle:** YAGNI
- **Severity:** Low
- **Files:** `lib/uiTokens.ts:47-54`
- **What's wrong:** Legacy exports (`border`, `bg`, `primary`, etc.) marked as deprecated but still exported. May not be used anywhere.
- **Risk:** Confusion, encourages use of deprecated API.
- **Fix recommendation:** Search for usages. If unused, delete. If used, migrate to `uiTokens.color.*` and then delete.
- **Estimated effort:** S

### SOLID Violations

**17. Pages directly import Supabase (no data access layer)**
- **Principle:** SOLID (Dependency Inversion)
- **Severity:** High
- **Files:** Every page file imports `lib/supabase` directly:
  - `app/page.tsx:5`
  - `app/new-module/page.tsx:5`
  - `app/edit-module/[moduleId]/page.tsx:5`
  - `app/new-lesson/page.tsx:5`
  - `app/edit-lesson/[lessonId]/page.tsx:5`
  - `app/new-group/page.tsx:4`
  - `app/edit-group/[groupId]/page.tsx:5`
  - `app/new-slide/page.tsx:5`
  - `app/edit-slide/[slideId]/page.tsx:5`
  - And 10+ more files
- **What's wrong:** Pages are tightly coupled to Supabase implementation. Can't swap database, add caching, or test without Supabase.
- **Risk:** Hard to test, migrate, or add features like offline support. Changes to DB structure require updating many files.
- **Fix recommendation:** Create data access layer: `lib/data/modules.ts`, `lib/data/lessons.ts`, `lib/data/groups.ts`, `lib/data/slides.ts`. Pages import from data layer, not Supabase directly.
- **Estimated effort:** L

**18. Domain types leak DB structure**
- **Principle:** SOLID (Interface Segregation)
- **Severity:** Medium
- **Files:** All pages use `ModuleRow`, `LessonRow`, `GroupRow`, `SlideRow` which are direct DB row shapes with snake_case fields like `order_index`, `module_id`, `props_json`.
- **What's wrong:** UI components and business logic depend on database schema details. Changes to DB require changes throughout app.
- **Risk:** Tight coupling, hard to refactor DB schema, UI code knows too much about storage.
- **Fix recommendation:** Create domain models: `lib/domain/Module.ts`, `lib/domain/Lesson.ts`, etc. with camelCase and business logic. Data layer converts between DB rows and domain models.
- **Estimated effort:** L

**19. Pages mix UI, data fetching, validation, and navigation**
- **Principle:** SOLID (Single Responsibility)
- **Severity:** High
- **Files:** Every `new-*` and `edit-*` page:
  - `app/new-module/page.tsx` (UI + Supabase queries + validation + navigation)
  - `app/edit-lesson/[lessonId]/page.tsx` (UI + Supabase queries + validation + navigation + 20+ form fields)
  - `app/edit-slide/[slideId]/page.tsx` (UI + Supabase queries + validation + navigation + 4 different editors)
- **What's wrong:** Pages are "god components" that do everything. Hard to test, reuse, or modify individual concerns.
- **Risk:** Hard to test business logic separately, can't reuse validation, UI tightly coupled to data flow.
- **Fix recommendation:** Extract custom hooks: `useModuleForm()`, `useLessonForm()`, etc. that handle data fetching, validation, and submission. Pages only handle UI.
- **Estimated effort:** L

**20. Validation logic scattered**
- **Principle:** SOLID (Single Responsibility)
- **Severity:** Medium
- **Files:** Validation happens inline in pages:
  - `app/new-group/page.tsx:79-91` (group_type validation)
  - `app/edit-group/[groupId]/page.tsx:162-194` (group_type, passing_score_type, JSON validation)
  - `app/new-lesson/page.tsx:90-93` (required fields)
  - `app/edit-module/[moduleId]/page.tsx:105-115` (status/visibility validation)
- **What's wrong:** Validation rules duplicated and scattered. No single source of truth. Hard to ensure consistency.
- **Risk:** Inconsistent validation, hard to update rules, business logic scattered.
- **Fix recommendation:** Create Zod schemas for each entity: `lib/schemas/moduleSchema.ts`, `lib/schemas/lessonSchema.ts`, etc. Use in both client and server.
- **Estimated effort:** M

---

## B) Architecture & Coupling Map

### Current Layering (Messy)

**Domain Concepts:**
- **Location:** Mixed into pages and `lib/loadLesson.ts`
- **Types:** `ModuleRow`, `LessonRow`, `GroupRow`, `SlideRow` defined per-file
- **Business Logic:** Scattered in pages (slugify, nullIfEmpty, validation)

**Supabase Access:**
- **Location:** Direct imports in every page (`lib/supabase.ts`)
- **Pattern:** `supabase.from("table").select(...).eq(...)` repeated everywhere
- **No abstraction layer**

**UI Primitives:**
- **Location:** `components/ui/` (well-organized)
- **Files:** `PageShell.tsx`, `PageContainer.tsx`, `CmsSection.tsx`, `FormField.tsx`, `Input.tsx`, `Select.tsx`, `Textarea.tsx`, `LinkButton.tsx`
- **Status:** ✅ Good separation

**Validation:**
- **Location:** Mixed:
  - `lib/realSlideSchema.ts` (Zod schema for ai-speak-repeat slides)
  - `lib/slideSchema.ts` (legacy, unused)
  - Inline validation in pages (required fields, enum checks)

**State/Navigation Logic:**
- **Location:** Inside page components
- **Pattern:** `useState` + `useEffect` + `useRouter` mixed with UI rendering

### Coupling Hotspots

**1. `app/page.tsx`**
- **Couples:** UI rendering + Supabase queries + hierarchical data mapping + delete logic + navigation
- **Dependencies:** Direct Supabase import, complex state management
- **Impact:** Hard to test, modify, or extract features

**2. `app/edit-slide/[slideId]/page.tsx`**
- **Couples:** UI rendering + Supabase queries + validation + 4 different editor components + navigation
- **Dependencies:** Direct Supabase import, `realSlideSchema`, complex conditional rendering
- **Impact:** 1727 lines, hard to maintain, adding new slide types requires modifying this file

**3. All `new-*` and `edit-*` pages**
- **Couples:** Form UI + Supabase mutations + validation + error handling + navigation
- **Dependencies:** Direct Supabase import, inline validation logic
- **Impact:** Duplication, hard to add features like optimistic updates or retry logic

**4. `lib/loadLesson.ts`**
- **Couples:** Supabase queries + Zod validation + data transformation
- **Dependencies:** Direct Supabase import, `realSlideSchema`
- **Impact:** Only used by `lesson-preview` page, but shows pattern that should be replicated

---

## C) Dead / Unnecessary Files Report

| File Path | Type | Referenced? | Likely Original Purpose | Recommendation | Notes |
|-----------|------|-------------|------------------------|----------------|-------|
| `app/debug-tables/page.tsx` | debug | N | Placeholder debug page | **DELETE** | Empty placeholder, no functionality |
| `app/test-db/page.tsx` | debug | N | Supabase connection test | **DELETE** | Development tool, not needed in prod |
| `app/db-slide-test/page.tsx` | debug | N | Test slide loading/validation | **DELETE** | Development tool, uses `slides_authoring` |
| `app/db-slide-rename/page.tsx` | debug | N | Test slide updating | **DELETE** | Development tool, uses `slides_authoring` |
| `app/mock-slide/[slide]/page.tsx` | test | N | Display mock slides from JSON | **DELETE** | Only uses legacy `slideSchema.ts` |
| `app/real-slide/page.tsx` | test | N | Display hardcoded slide from JSON | **DELETE** | Test page, uses mock data |
| `lib/slideSchema.ts` | schema | Y (only by mock-slide) | Legacy slide schema | **DELETE** | Unused except by mock-slide (which should be deleted) |
| `mock-data/slide1.json` | mock | Y (only by mock-slide) | Mock slide data | **DELETE** | Only used by mock-slide page |
| `mock-data/slide2.json` | mock | Y (only by mock-slide) | Mock slide data | **DELETE** | Only used by mock-slide page |
| `mock-data/real-ai-speak-repeat.json` | mock | Y (only by real-slide) | Mock slide data | **DELETE** | Only used by real-slide page |
| `app/new-slide-ai/page.tsx` | page | Y (routed) | Create slide in authoring table | **ARCHIVE or DELETE** | Uses `slides_authoring`. If authoring workflow is needed, keep. Otherwise delete. |
| `app/edit-slide-ai/page.tsx` | page | Y (routed) | Edit slide in authoring table | **ARCHIVE or DELETE** | Uses `slides_authoring`, hardcoded ID "slide-ai-001". If authoring workflow is needed, keep. Otherwise delete. |
| `app/slides-browser/page.tsx` | page | Y (routed) | Browse slides in authoring tables | **ARCHIVE or DELETE** | Uses `lessons_authoring`, `lesson_groups_authoring`, `slides_authoring`. If authoring workflow is needed, keep. Otherwise delete. |
| `lib/uiTokens.ts:47-54` | legacy exports | **CHECK** | Backward compatibility exports | **DELETE if unused** | Marked deprecated. Search codebase for usages of `border`, `bg`, `primary`, etc. If unused, delete. |

**Summary:**
- **Safe to delete immediately:** 9 files (debug/test pages, mock data, legacy schema)
- **Needs decision:** 3 files (authoring table pages - depends on workflow)
- **Needs check:** Legacy exports in uiTokens.ts

---

## D) Prioritized Refactor Plan (MVP-safe)

### Do Now (Highest ROI, Least Risk)

**1. Extract `slugify` and `nullIfEmpty` to `lib/utils.ts`**
- **Affected files:** `app/edit-lesson/[lessonId]/page.tsx`, `app/new-lesson/page.tsx`, `app/new-module/page.tsx`, `app/edit-group/[groupId]/page.tsx`, `app/new-group/page.tsx`
- **End state:** Single source of truth for these utilities
- **Effort:** S
- **Risk:** Low (pure functions, easy to test)

**2. Delete debug/test pages**
- **Affected files:** `app/debug-tables/page.tsx`, `app/test-db/page.tsx`, `app/db-slide-test/page.tsx`, `app/db-slide-rename/page.tsx`, `app/mock-slide/[slide]/page.tsx`, `app/real-slide/page.tsx`
- **End state:** Cleaner codebase, no test pages in production routes
- **Effort:** S
- **Risk:** None (not referenced anywhere)

**3. Delete legacy schema and mock data**
- **Affected files:** `lib/slideSchema.ts`, `mock-data/*.json`
- **End state:** Only active schemas remain
- **Effort:** S
- **Risk:** None (only used by deleted mock pages)

**4. Extract shared type definitions to `lib/types/db.ts`**
- **Affected files:** All pages using `ModuleRow`, `LessonRow`, `GroupRow`, `SlideRow`
- **End state:** Single source of truth for DB row types
- **Effort:** M
- **Risk:** Low (type-only change, TypeScript will catch errors)

**5. Create reusable message components**
- **Affected files:** All `new-*` and `edit-*` pages
- **End state:** `components/ui/SuccessMessage.tsx` and `components/ui/ErrorMessage.tsx` replace inline styles
- **Effort:** S
- **Risk:** Low (UI-only change)

### Do Soon (Medium Priority)

**6. Create data access layer for modules**
- **Affected files:** `app/page.tsx`, `app/edit-lesson/[lessonId]/page.tsx`, `app/new-lesson/page.tsx`, `app/edit-module/[moduleId]/page.tsx`, `app/modules-browser/page.tsx`
- **End state:** `lib/data/modules.ts` with `loadModules()`, `loadModuleById(id)`, `createModule(data)`, `updateModule(id, data)`, `deleteModule(id)`
- **Effort:** M
- **Risk:** Medium (touches many files, but can be done incrementally)

**7. Create data access layer for lessons**
- **Affected files:** All pages loading/creating/updating lessons
- **End state:** `lib/data/lessons.ts` with similar functions
- **Effort:** M
- **Risk:** Medium

**8. Create data access layer for groups**
- **Affected files:** All pages loading/creating/updating groups
- **End state:** `lib/data/groups.ts` with similar functions
- **Effort:** M
- **Risk:** Medium

**9. Create data access layer for slides**
- **Affected files:** All pages loading/creating/updating slides
- **End state:** `lib/data/slides.ts` with similar functions
- **Effort:** M
- **Risk:** Medium

**10. Extract form submission logic to hooks**
- **Affected files:** All `new-*` and `edit-*` pages
- **End state:** `lib/hooks/useModuleForm.ts`, `lib/hooks/useLessonForm.ts`, etc. handle loading, validation, submission
- **Effort:** M
- **Risk:** Medium (can be done incrementally, one page at a time)

**11. Consolidate slide creation pages**
- **Affected files:** `app/new-slide/page.tsx`, `app/new-slide-ai/page.tsx`
- **End state:** Single `app/new-slide/page.tsx` that works with production tables. Remove authoring version if not needed.
- **Effort:** M
- **Risk:** Medium (need to confirm authoring workflow isn't needed)

**12. Simplify delete confirmation**
- **Affected files:** `app/page.tsx`
- **End state:** Replace complex state machine with `ConfirmDialog` component or `window.confirm()`
- **Effort:** S
- **Risk:** Low (UI-only change)

### Later (Only If Needed)

**13. Split edit-slide page into separate editor components**
- **Affected files:** `app/edit-slide/[slideId]/page.tsx` (1727 lines)
- **End state:** `components/slide-editors/AiSpeakRepeatEditor.tsx`, `components/slide-editors/TitleSlideEditor.tsx`, `components/slide-editors/TextSlideEditor.tsx`, `components/slide-editors/RawJsonEditor.tsx`
- **Effort:** L
- **Risk:** High (large refactor, but improves maintainability)

**14. Create domain models (separate from DB rows)**
- **Affected files:** All pages, data access layer
- **End state:** `lib/domain/Module.ts`, `lib/domain/Lesson.ts`, etc. with camelCase and business logic. Data layer converts DB rows ↔ domain models.
- **Effort:** L
- **Risk:** High (major architectural change)

**15. Consolidate dual table system**
- **Affected files:** All pages using authoring tables
- **End state:** Single source of truth. Either migrate authoring pages to production tables OR document workflow clearly.
- **Effort:** L
- **Risk:** High (data migration risk)

**16. Extract validation to Zod schemas**
- **Affected files:** All pages with inline validation
- **End state:** `lib/schemas/moduleSchema.ts`, `lib/schemas/lessonSchema.ts`, etc. Used in both client and server.
- **Effort:** M
- **Risk:** Medium (can be done incrementally)

**17. Extract hierarchical data mapping**
- **Affected files:** `app/page.tsx`
- **End state:** `lib/data/buildHierarchy.ts` with clear functions and tests
- **Effort:** M
- **Risk:** Low (isolated logic)

**18. Create custom hooks for complex pages**
- **Affected files:** `app/page.tsx`, `app/lesson-slides/[lessonId]/page.tsx`
- **End state:** `lib/hooks/useCmsHierarchy.ts`, `lib/hooks/useLessonSlides.ts` extract complex logic
- **Effort:** M
- **Risk:** Medium (can be done incrementally)

---

## Bonus: Missing Abstractions Worth Adding Now

**1. Single Supabase data access layer** ✅ (Already in plan above)
- **Why:** Reduces duplication, enables caching, easier testing
- **Priority:** High (addresses DRY violation #3)

**2. Consistent validation schemas** ✅ (Already in plan above)
- **Why:** Single source of truth for validation rules
- **Priority:** Medium (addresses SOLID violation #20)

**3. Reusable form hooks** ✅ (Already in plan above)
- **Why:** Reduces duplication in new/edit pages
- **Priority:** Medium (addresses DRY violation #6)

**4. ConfirmDialog component**
- **Why:** Replaces complex delete confirmation state machine
- **Priority:** Low (nice-to-have, addresses KISS violation #8)

---

## Summary Statistics

- **Total violations found:** 20
- **DRY violations:** 6
- **KISS violations:** 5
- **YAGNI violations:** 5
- **SOLID violations:** 4
- **Dead files identified:** 9-12 (depending on authoring workflow decision)
- **High severity issues:** 6
- **Medium severity issues:** 10
- **Low severity issues:** 4

**Estimated total refactor effort:**
- **Do Now:** ~2-3 days
- **Do Soon:** ~1-2 weeks
- **Later:** ~1-2 months (if needed)

