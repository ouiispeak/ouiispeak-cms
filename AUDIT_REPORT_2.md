# Codebase Audit Report #2: ouiispeak-cms

**Date:** 2025-02-07  
**Scope:** Full repository audit after cleanup/refactor  
**Goal:** Confirm cleanup is complete and surface remaining dust

---

## Executive Summary
- Direct Supabase calls remain in production pages/components, bypassing the new data layer (`app/new-slide`, `app/edit-group`, `app/edit-lesson`, slide editors).
- Delete impact messaging counts `user_lessons`, but the delete routines never remove them (risk of orphans/misleading prompts).
- Dashboard and context bar are still monoliths (>500 LOC each) mixing data loading, UI, and delete flows.
- Legacy lesson loader + preview route still ship outside the data/domain layer, duplicating lesson loading logic.
- Debug/authoring page under `/debug/new-slide-ai` still compiles and writes to authoring tables (flag-gated but shipped).
- Activity-type normalization lives in both UI and data layers, inviting drift.
- Tests pass (`npm run test:run` via Vitest), and core data utilities/schemas exist with coverage.

---

## Findings by Principle

### DRY
- **Severity: Medium — Duplicate lesson loaders**  
  `lib/loadLesson.ts:1-95` reimplements lesson/group/slide loading with snake_case rows while `lib/data/lessons.ts:101-205` provides the canonical loader. `app/lesson-preview/[lessonId]/page.tsx:5-56` uses the legacy path, so fixes to the data layer won’t reach the preview.  
  **Fix:** Consolidate on `lib/data/lessons.loadLessonById` (or move the preview under it) and delete `lib/loadLesson.ts`.

- **Severity: Low — Activity type normalization duplicated**  
  UI forms normalize/concat activity types (`app/new-lesson/page.tsx:62-105`, `app/edit-lesson/[lessonId]/page.tsx:200-238`) while the data layer already normalizes arrays/strings (`lib/data/lessons.ts:133-146`). Divergent rules will drift.  
  **Fix:** Keep normalization in one shared helper (`lessonInputSchema` transform) and let pages pass raw form values.

### KISS
- **Severity: Medium — CmsHome remains a monolith**  
  `app/page.tsx:41-188` (and the rest of the 688-line file) combines data fetching, hierarchy building, delete flows, and accordion UI. The mix of responsibilities makes changes risky.  
  **Fix:** Extract a `useCmsData` hook for loading/deletes, a `CmsHierarchy` presenter for the nested lists, and keep the dialog wiring separate.

- **Severity: Medium — CmsContextBar handles orchestration + UI**  
  `components/cms/CmsContextBar.tsx:1-170` (599 lines total) fetches ancestors, selectors, memoizes IDs, and renders breadcrumbs in one component. The nested effects/states are hard to reason about.  
  **Fix:** Split into a data hook (ancestor/selector loading) and a pure breadcrumb/selector UI component; co-locate memoized derivations with the hook.

### YAGNI / Dead Code
- **Severity: Medium — Legacy lesson preview route**  
  `app/lesson-preview/[lessonId]/page.tsx:5-56` surfaces raw JSON via `lib/loadLesson.ts:1-95`, duplicating lesson loading and exposing internal schema publicly.  
  **Fix:** Remove or move under `/debug`, and reuse the data-layer loader to avoid maintaining two paths.

- **Severity: Low — Debug authoring page still ships**  
  `app/debug/new-slide-ai/page.tsx:60-200` writes directly to `lessons_authoring`/`slides_authoring` via Supabase even though it is env-flagged. It adds maintenance surface and build weight.  
  **Fix:** Quarantine behind a build-time flag or remove if authoring tables aren’t part of prod flows.

### SOLID / Coupling
- **Severity: High — Writes bypass the data layer**  
  Production pages/components call Supabase directly: insert in `app/new-slide/page.tsx:154-165`, updates in `app/edit-group/[groupId]/page.tsx:158-179`, `app/edit-lesson/[lessonId]/page.tsx:215-239`, and slide updates in `components/slide-editors/AiSpeakRepeatEditor.tsx:167-181`. These skip shared validation/mappers.  
  **Fix:** Route all mutations through `lib/data/slides|groups|lessons` (or helpers exposed from `useSlideEditor`) so validation, result shapes, and logging stay centralized.

- **Severity: Medium — UI still depends on DB row shapes**  
  Reads go straight to Supabase with `*Row` types (`app/page.tsx:73-95`, `app/modules-browser/page.tsx:26-29`, `app/edit-lesson/[lessonId]/page.tsx:87-118`), leaking snake_case into UI and duplicating select strings the data layer already owns.  
  **Fix:** Swap to `loadModules/loadLessons` (or a dashboard loader) returning domain models; keep `lib/types/db` usage inside data/mappers only.

- **Severity: Medium — Delete impact vs. actual deletes mismatch**  
  Impact queries count `user_lessons` (`lib/data/deleteImpact.ts:7-21`, `88-111`), but delete routines never remove that table (`lib/data/modules.ts:190-247`, `lib/data/lessons.ts:288-319`). Confirmations may overpromise and leave orphans.  
  **Fix:** Either cascade delete `user_lessons` alongside slides/groups or drop it from impact messaging and UI copy.

---

## Dust Under Couches
- **Unused/legacy surface:** Debug/DB route stubs (`app/db-slide-rename/`, `app/db-slide-test/`, `app/test-db/`, `app/mock-slide/`, `app/real-slide/`) have no `page.tsx`; `app/lesson-preview/[lessonId]/page.tsx:5-56` relies on a legacy loader. `app/edit-group/[groupId]/page.tsx:17` still imports `updateGroup` but never uses it.
- **Duplicate patterns:** Direct Supabase CRUD logic is repeated across pages (`app/new-slide/page.tsx:154-165`, `app/edit-group/[groupId]/page.tsx:158-179`, `app/edit-lesson/[lessonId]/page.tsx:215-239`) and editors (`components/slide-editors/AiSpeakRepeatEditor.tsx:167-181`) instead of shared mutations.
- **Direct Supabase usage in app/** (reads vs writes):  
  Writes — `app/new-slide/page.tsx:154-165`, `app/edit-group/[groupId]/page.tsx:158-179`, `app/edit-lesson/[lessonId]/page.tsx:215-239`, slide editors (`components/slide-editors/AiSpeakRepeatEditor.tsx:167-181`).  
  Reads — `app/page.tsx:73-95`, `app/modules-browser/page.tsx:26-29`, `app/edit-lesson/[lessonId]/page.tsx:87-118`, plus debug routes (`app/debug/new-slide-ai/page.tsx:65-90`, `app/debug/edit-slide-ai/page.tsx:34-76`, `app/debug/slides-browser/page.tsx:32-44`).

---

## Final Checklist
- `rg "supabase\.from\(" app` → 0 matches because calls break across lines; actual Supabase usages enumerated above from `rg -n "supabase" app`.
- Files > 400 LOC: `app/page.tsx` (688), `components/cms/CmsContextBar.tsx` (599), `app/lesson-slides/[lessonId]/page.tsx` (524), `app/edit-lesson/[lessonId]/page.tsx` (470), `components/slide-editors/AiSpeakRepeatEditor.tsx` (412).
- Likely non-production routes under `app/`: `/debug/*`, `/lesson-preview/[lessonId]`, `/db-slide-rename`, `/db-slide-test`, `/test-db`, `/mock-slide`, `/real-slide`.

---

## Tests
- `npm run test:run` (Vitest) — ✅ all 16 tests passed.

---

## Prioritized Action Plan
- **Do Now (S/M):** Route all Supabase writes to the data layer (`app/new-slide`, `app/edit-group`, `app/edit-lesson`, slide editors) and align delete impact with actual cascades (add `user_lessons` delete or adjust messaging). Remove the legacy lesson loader/preview route or move under data layer.
- **Do Soon (M):** Split `app/page.tsx` and `components/cms/CmsContextBar.tsx` into data hooks + presentational components; swap dashboard/modules-browser/edit-lesson reads to data loaders/domain models.
- **Later (S):** Clean up unused/empty route stubs; centralize activity-type normalization; decide whether debug authoring pages should be excluded from production bundles.
