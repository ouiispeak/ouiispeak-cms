# Refactor-Readiness & Scale-Readiness Audit
## CMS + Lesson Pipeline Full-System Analysis

**Date:** 2025-01-27  
**Scope:** Complete CMS + Lesson pipeline from editor → persistence → loader → player  
**Method:** Static code analysis, data flow tracing, architecture evaluation

---

## ✅ Confirmed Good Paths (End-to-End)

### Core Data Flow: CMS Editor → Database → Loader
- **CMS Editor** (`app/edit-slide/[slideId]/page.tsx`): Loads slide via `loadSlideById()` → extracts props from `propsJson` → renders form fields → saves via `updateSlide()` with `props_json` object
- **Persistence Layer** (`lib/data/slides.ts`): `updateSlide()` writes to `slides` table with `props_json` JSONB column → returns domain model via `toSlide()` mapper
- **Domain Mapping** (`lib/mappers/slideMapper.ts`): Converts snake_case DB rows → camelCase domain models (`Slide`, `SlideMinimal`)
- **Hierarchy Building** (`lib/data/buildHierarchy.ts`): Builds parent-child maps (modules → lessons → groups → slides) with stable ordering by `order_index`

### Slide Type Handling
- **Type Storage**: Slide type stored as string in `slides.type` column (NOT NULL)
- **Type Discovery**: `loadLessonManagement()` queries all slides to extract unique types dynamically (line 64-68 in `lib/data/lessonManagement.ts`)
- **Type Selection**: `manage-slides/page.tsx` hardcodes dropdown options (lines 153-160), but actual types come from DB query

### Defaults & Computed Fields
- **is_activity Default**: `defaultIsActivity()` in `lib/data/slides.ts` (lines 145-153) computes default based on slide type (non-activity types: "default", "title-slide", "title", "lesson-end", "text-slide", "text")
- **NOT NULL Defaults**: `createSlide()` ensures safe defaults: `props_json: {}`, `meta_json: {}`, `score_type: 'none'`, `pass_required_for_next: false`

### Ordering & Sorting
- **Stable Ordering**: All queries use `.order("order_index", { ascending: true })` with fallback to ID comparison in `buildHierarchy.ts` (lines 60-64, 78-82, 104-108)
- **Deterministic Fallback**: When `order_index` is null or equal, falls back to `id.localeCompare()` for stable sort

---

## ❌ Breaks / Incomplete Wiring (Migration Blockers)

### 1. **No Runtime Validation of props_json**
**Symptom:** `props_json` is stored as `unknown`/`any`, no Zod schema validation at load time  
**Files:** 
- `lib/domain/slide.ts` (line 11: `propsJson: unknown`)
- `app/edit-slide/[slideId]/page.tsx` (lines 152, 154: `as any` casts)
- `lib/data/slides.ts` (line 25: `props_json: unknown`)

**Layer:** Typing/Validation  
**False Assumption:** "Player will handle invalid props gracefully"  
**Why It Blocks:** 
- Invalid props_json from CMS can break player silently
- No way to detect schema drift between CMS and player expectations
- Hardcoded lessons removal requires confidence that CMS data matches player contracts

**Minimal Fix:** Add Zod schema validation in `loadSlideById()` that parses `props_json` against slide-type-specific schemas. Fail fast with clear error message.

---

### 2. **Slide Type Registry Hardcoded in UI, Not Centralized**
**Symptom:** Slide type options hardcoded in `manage-slides/page.tsx` (lines 153-160), but actual types come from DB query  
**Files:**
- `app/manage-slides/page.tsx` (lines 153-160: hardcoded `<option>` values)
- `app/edit-slide/[slideId]/page.tsx` (no type registry, reads from DB)

**Layer:** CMS UI  
**False Assumption:** "Slide types are static and won't change"  
**Why It Blocks:**
- Adding new slide type requires code changes in multiple places
- Mismatch between UI dropdown and actual DB types possible
- Hardcoded lessons removal requires dynamic type discovery

**Minimal Fix:** Create single source of truth: `lib/schemas/slideTypeRegistry.ts` that exports `VALID_SLIDE_TYPES` array. Import in both `manage-slides` and `edit-slide` pages. Query DB for existing types but validate against registry.

---

### 3. **Language Format Mismatch Between CMS and Player**
**Symptom:** CMS stores `defaultLang` as `"english"`/`"french"`/`"both"`, but player expects `"en"`/`"fr"`  
**Files:**
- `app/edit-slide/[slideId]/page.tsx` (lines 94-101: `mapLanguageToPlayerFormat()` conversion)
- `app/edit-slide/[slideId]/page.tsx` (lines 409, 465: conversion applied during save)

**Layer:** Data Transform  
**False Assumption:** "Conversion happens at save time, so it's fine"  
**Why It Blocks:**
- Conversion only happens in editor save path, not in loader path
- If slides are created/updated outside CMS, language format will be wrong
- Hardcoded lessons removal requires consistent format throughout pipeline

**Minimal Fix:** Standardize on player format (`"en"`/`"fr"`) in CMS UI. Store in DB as player format. Remove conversion function.

---

### 4. **props_json Structure Varies by Slide Type, No Type-Safe Parsing**
**Symptom:** Each slide type has different props structure (e.g., `ai-speak-student-repeat` has `elements[]`, `ai-speak-repeat` has `lines[][]`), but all stored as `unknown`  
**Files:**
- `app/edit-slide/[slideId]/page.tsx` (lines 385-503: type-specific save logic)
- `lib/realSlideSchema.ts` (only defines schema for `ai-speak-repeat`, not others)

**Layer:** Typing/Validation  
**False Assumption:** "TypeScript `unknown` is enough, runtime will handle it"  
**Why It Blocks:**
- No compile-time safety for props structure
- Runtime errors only surface when player tries to render
- Hardcoded lessons removal requires type-safe contracts

**Minimal Fix:** Create Zod schemas for each slide type in `lib/schemas/slidePropsSchemas.ts`. Export union type `SlideProps = AiSpeakRepeatProps | AiSpeakStudentRepeatProps | ...`. Validate in `loadSlideById()`.

---

### 5. **No Validation That props_json Matches slide.type**
**Symptom:** `type` column and `props_json` structure are independent - nothing enforces they match  
**Files:**
- `lib/data/slides.ts` (no validation in `createSlide()` or `updateSlide()`)
- `app/edit-slide/[slideId]/page.tsx` (save logic assumes type matches props structure)

**Layer:** Persistence  
**False Assumption:** "CMS UI ensures type matches props, so DB doesn't need to check"  
**Why It Blocks:**
- Direct DB updates or migrations could create invalid state
- Player will fail silently or crash when type doesn't match props
- Hardcoded lessons removal requires data integrity guarantees

**Minimal Fix:** Add check in `createSlide()` and `updateSlide()`: validate `props_json` against schema for `type`. Return error if mismatch.

---

### 6. **Audio File URL Format Inconsistency**
**Symptom:** CMS saves full Supabase URLs (`https://.../storage/v1/object/public/lesson-audio/...`), but hardcoded lessons use relative paths (`/audio/alphabet/A.wav`)  
**Files:**
- `app/edit-slide/[slideId]/page.tsx` (line 401: `getAudioFileUrl()` creates full URL)
- `HARDCODED_VS_CMS_COMPARISON.md` (documents mismatch)

**Layer:** Data Transform  
**False Assumption:** "Player accepts both formats"  
**Why It Blocks:**
- Player may expect relative paths, not full URLs
- Hardcoded lessons removal requires format consistency

**Minimal Fix:** Verify player accepts full Supabase URLs. If not, store relative paths in DB and construct URLs at load time.

---

### 7. **Missing props_json Fields Not Validated**
**Symptom:** Editor allows saving slides with missing required fields (e.g., `ai-speak-repeat` without `lines`)  
**Files:**
- `app/edit-slide/[slideId]/page.tsx` (lines 479-502: only saves `lines` if `phrases.trim()` exists)
- No validation that required fields are present

**Layer:** CMS UI / Validation  
**False Assumption:** "Empty slides are valid"  
**Why It Blocks:**
- Player may crash on missing required fields
- Hardcoded lessons removal requires all slides to be complete

**Minimal Fix:** Add required field validation in editor before save. Show error if required fields missing for slide type.

---

### 8. **No Player Integration Test/Verification**
**Symptom:** Preview button exists but no verification that CMS data actually works in player  
**Files:**
- `components/ui/PreviewInPlayerButton.tsx` (just opens URL, no validation)
- `app/edit-slide/[slideId]/page.tsx` (line 77: constructs player URL but doesn't verify it works)

**Layer:** Integration  
**False Assumption:** "If preview URL works, data is valid"  
**Why It Blocks:**
- Player may fail to load CMS slides even if URL is correct
- Hardcoded lessons removal requires confidence that CMS data works in player

**Minimal Fix:** Add integration test that loads a CMS slide in player and verifies it renders correctly. Run as part of CI.

---

## ⚠️ Coupling / DRY Violations / YAGNI Bloat

### 1. **Duplicate Slide Type Definitions**
**Location:**
- `app/manage-slides/page.tsx` (lines 153-160: hardcoded dropdown)
- `app/edit-slide/[slideId]/page.tsx` (no registry, reads from DB)
- `lib/data/lessonManagement.ts` (lines 92-98: queries DB for types)

**Violation:** DRY - slide types defined in multiple places  
**Impact:** Adding new type requires changes in multiple files  
**Fix:** Centralize in `lib/schemas/slideTypeRegistry.ts`

---

### 2. **props_json Parsing Logic Duplicated**
**Location:**
- `app/edit-slide/[slideId]/page.tsx` (lines 152-227: load logic)
- `app/edit-slide/[slideId]/page.tsx` (lines 347-503: save logic)
- `lib/utils/displayName.ts` (line 16: `as any` cast)

**Violation:** DRY - props extraction logic repeated  
**Impact:** Changes to props structure require updates in multiple places  
**Fix:** Extract to `lib/utils/slidePropsParser.ts` with typed functions

---

### 3. **Language Mapping Function Only Used in One Place**
**Location:**
- `app/edit-slide/[slideId]/page.tsx` (lines 94-101: `mapLanguageToPlayerFormat()`)

**Violation:** YAGNI - function exists but only used once, suggests incomplete migration  
**Impact:** If language format is standardized, this function becomes dead code  
**Fix:** Remove function, standardize on player format everywhere

---

### 4. **Tight Coupling Between Editor and Save Logic**
**Location:**
- `app/edit-slide/[slideId]/page.tsx` (lines 314-561: `handleSave()` contains all type-specific logic)

**Violation:** SOLID - Single Responsibility Principle violated  
**Impact:** Adding new slide type requires modifying 200+ line function  
**Fix:** Extract type-specific save logic to `lib/data/slideTypeSavers.ts` with strategy pattern

---

### 5. **Hardcoded Field Visibility Logic**
**Location:**
- `app/edit-slide/[slideId]/page.tsx` (lines 731, 805, 826, 864, 990, 1064, 1143: conditional rendering based on `slideType`)

**Violation:** DRY - field visibility logic scattered throughout component  
**Impact:** Adding new slide type requires updating many conditional checks  
**Fix:** Create `lib/schemas/slideFieldRegistry.ts` that defines which fields are visible for each type

---

### 6. **Unused Archive Code**
**Location:**
- `archive/slide-editing-system/` (entire directory)

**Violation:** YAGNI - old system kept but not used  
**Impact:** Confusion about which system is current, maintenance burden  
**Fix:** Delete `archive/` directory if migration is complete

---

### 7. **Two Editor Pages Doing Similar Things**
**Location:**
- `app/edit-slide/[slideId]/page.tsx` (functional editor)
- `app/manage-slides/page.tsx` (template/master form, lines 20-26 comment says "defining page layout")

**Violation:** DRY - two pages with overlapping functionality  
**Impact:** Changes must be made in two places  
**Fix:** Consolidate into single editor, or clarify that `manage-slides` is truly just a template (then remove duplicate logic)

---

### 8. **Default Slide Type Logic Hardcoded**
**Location:**
- `lib/data/slides.ts` (lines 151: `const nonActivityTypes = ["default", "title-slide", "title", "lesson-end", "text-slide", "text"]`)

**Violation:** DRY - type classification logic hardcoded  
**Impact:** Adding new non-activity type requires code change  
**Fix:** Move to `slideTypeRegistry.ts` with `isActivity: boolean` property per type

---

## 🧱 Dead / Orphaned Code & Props

### 1. **audioId Field Written But Never Used**
**Location:**
- `app/edit-slide/[slideId]/page.tsx` (lines 55, 177, 353: `audioId` state and save)
- `app/edit-slide/[slideId]/page.tsx` (lines 973-986: Audio ID form field marked `[unused]`)

**Status:** Written to `props_json.audioId` but never read by player  
**Impact:** Confusion, wasted storage  
**Fix:** Remove `audioId` field from editor and save logic

---

### 2. **aid_hook Column Never Written**
**Location:**
- `lib/data/slides.ts` (line 9: `aid_hook` in `SLIDE_FIELDS_FULL`)
- `lib/domain/slide.ts` (line 12: `aidHook: string | null`)
- `app/edit-slide/[slideId]/page.tsx` (not in editor)

**Status:** Column exists in DB, loaded into domain model, but never set  
**Impact:** Dead column, confusion  
**Fix:** Remove from schema if unused, or add to editor if needed

---

### 3. **code Column Never Written**
**Location:**
- `lib/data/slides.ts` (line 9: `code` in `SLIDE_FIELDS_FULL`)
- `lib/domain/slide.ts` (line 13: `code: string | null`)
- `app/edit-slide/[slideId]/page.tsx` (not in editor)

**Status:** Column exists, loaded, but never set  
**Impact:** Dead column  
**Fix:** Remove or add to editor

---

### 4. **score_type, passing_score_value, max_score_value, pass_required_for_next Never Written**
**Location:**
- `lib/data/slides.ts` (lines 9, 30-33: columns in schema)
- `lib/domain/slide.ts` (lines 16-19: in domain model)
- `app/edit-slide/[slideId]/page.tsx` (not in editor)

**Status:** Columns exist but never set by CMS  
**Impact:** Scoring system not implemented in CMS  
**Fix:** Add scoring fields to editor, or remove columns if scoring is handled elsewhere

---

### 5. **meta_json.activityName Written But Structure Not Validated**
**Location:**
- `app/edit-slide/[slideId]/page.tsx` (lines 178, 255, 514-516: `activityName` saved to `meta_json`)
- No schema validation for `meta_json`

**Status:** Written but structure not enforced  
**Impact:** Could store invalid structure  
**Fix:** Add Zod schema for `meta_json` structure

---

### 6. **realSlideSchema.ts Only Defines One Type**
**Location:**
- `lib/realSlideSchema.ts` (only `aiSpeakRepeatSlideSchema` defined)

**Status:** File exists but incomplete  
**Impact:** Suggests incomplete migration to typed schemas  
**Fix:** Add schemas for all slide types, or remove file if not using it

---

### 7. **manage-slides/page.tsx Has Mock Save Logic**
**Location:**
- `app/manage-slides/page.tsx` (lines 63-74: `handleSave()` is mock, just `setTimeout`)

**Status:** Page exists but doesn't actually save  
**Impact:** Confusion about which editor to use  
**Fix:** Implement real save logic, or remove page if `edit-slide` is the real editor

---

## 📌 Prioritized Minimal Fix Checklist (NO CODE)

### P0 - Migration Blockers (Must Fix Before Removing Hardcoded Lessons)

1. **Add props_json validation in loader** (`lib/data/slides.ts`)
   - Create Zod schemas for each slide type in `lib/schemas/slidePropsSchemas.ts`
   - In `loadSlideById()`, parse `props_json` against schema for `slide.type`
   - Return error if validation fails

2. **Standardize language format** (`app/edit-slide/[slideId]/page.tsx`)
   - Change dropdown options to `"en"`, `"fr"`, `"both"` (player format)
   - Remove `mapLanguageToPlayerFormat()` function
   - Store language in player format in DB

3. **Validate type matches props_json** (`lib/data/slides.ts`)
   - In `createSlide()` and `updateSlide()`, validate `props_json` against schema for `type`
   - Return error if type/props mismatch

4. **Verify audio URL format** (Player repo)
   - Check if player accepts full Supabase URLs or needs relative paths
   - If relative paths needed, change `getAudioFileUrl()` to return relative path, construct full URL at load time

5. **Add required field validation** (`app/edit-slide/[slideId]/page.tsx`)
   - Before save, check that required fields for slide type are present
   - Show error message if missing

---

### P1 - Scale Risks (Fix Before Scaling to Thousands of Lessons)

6. **Centralize slide type registry** (`lib/schemas/slideTypeRegistry.ts`)
   - Create single source of truth for valid slide types
   - Export `VALID_SLIDE_TYPES` array and `isActivity(type)` function
   - Import in `manage-slides` and `edit-slide` pages

7. **Extract props parsing logic** (`lib/utils/slidePropsParser.ts`)
   - Create typed functions: `parseSlideProps(type, propsJson)` and `serializeSlideProps(type, props)`
   - Use in editor load/save and loader

8. **Fix N+1 query risk in dashboard** (`lib/data/dashboard.ts`)
   - Lines 48-49: `Promise.all()` for lessons is good
   - Lines 72-73: `Promise.all()` for groups is good
   - Lines 86-96: Single query for slides is good
   - **No N+1 issues found** - queries are batched correctly

9. **Add database indices** (Database migration)
   - Ensure `slides.lesson_id` has index (likely exists via FK)
   - Ensure `slides.group_id` has index
   - Ensure `slides.order_index` has index (for sorting)
   - Ensure `lesson_groups.lesson_id` has index
   - Ensure `lessons.module_id` has index

10. **Remove unused columns** (Database migration)
    - Remove `aid_hook` if unused
    - Remove `code` if unused
    - Remove scoring columns if scoring handled elsewhere
    - Or add them to editor if they're needed

---

### P2 - Code Quality / DRY (Fix for Maintainability)

11. **Extract type-specific save logic** (`lib/data/slideTypeSavers.ts`)
    - Create strategy pattern: `saveSlideProps(type, formData) => props_json`
    - Move type-specific logic from `handleSave()` to strategy functions

12. **Create slide field registry** (`lib/schemas/slideFieldRegistry.ts`)
    - Define which fields are visible/required for each slide type
    - Use in editor to conditionally render fields

13. **Remove duplicate editor pages**
    - If `manage-slides` is just a template, remove duplicate logic
    - If `edit-slide` is the real editor, remove `manage-slides` or clarify its purpose

14. **Delete archive code** (`archive/slide-editing-system/`)
    - Remove entire directory if migration is complete

15. **Remove audioId field** (`app/edit-slide/[slideId]/page.tsx`)
    - Remove `audioId` state, form field, and save logic

16. **Add meta_json schema** (`lib/schemas/metaJsonSchema.ts`)
    - Create Zod schema for `meta_json` structure
    - Validate in `createSlide()` and `updateSlide()`

17. **Complete realSlideSchema.ts** (`lib/realSlideSchema.ts`)
    - Add schemas for all slide types, or remove file if not using it

---

## G) Hardcoded Lessons Removal Readiness

### Files/Modules That Become Removable
**None found in CMS repo** - hardcoded lessons are in separate player repo. CMS is already decoupled.

### Breakpoints If Hardcoded Lessons Removed Today
1. **Player repo** would need to load lessons from CMS API instead of hardcoded files
2. **CMS must provide API endpoint** that returns lesson data in player format
3. **Player must handle CMS data format** (props_json structure, language codes, audio URLs)

### Coupling Points to CMS That Must Be Resolved
1. **props_json structure** - Player expects specific structure per slide type, CMS must match exactly
2. **Language format** - Player expects `"en"`/`"fr"`, CMS currently stores `"english"`/`"french"`
3. **Audio URL format** - Player may expect relative paths, CMS stores full URLs
4. **Required fields** - Player may crash on missing required props, CMS doesn't validate

---

## H) Scale & Performance Risks

### Over-fetching
- **Dashboard** (`lib/data/dashboard.ts`): Loads `props_json` for all slides (line 94) - could be large. **Risk:** High memory usage with thousands of slides. **Fix:** Only load `props_json` when needed (e.g., for title extraction), or add `props_json` size limit.

### Large JSON Blobs
- **props_json** stored as JSONB - no size limit enforced. **Risk:** Very large props could slow queries. **Fix:** Add database constraint on `props_json` size, or validate in application layer.

### Excessive Rerenders
- **Editor** (`app/edit-slide/[slideId]/page.tsx`): Large component with many state variables. **Risk:** Rerenders on every keystroke. **Fix:** Use `useMemo`/`useCallback` for expensive computations, split into smaller components.

### Client State Bloat
- **Dashboard** (`lib/hooks/useCmsDashboard.ts`): Loads entire hierarchy into memory. **Risk:** Large memory footprint with thousands of lessons. **Fix:** Implement pagination or virtual scrolling.

### Slow Queries / Missing Indices
- **Queries are batched correctly** (no N+1 issues found)
- **Indices:** Verify `slides.lesson_id`, `slides.group_id`, `slides.order_index` have indices
- **Ordering:** All queries use `order_index` - ensure index exists

### Synchronous Loops Per Slide
- **buildHierarchy.ts** (lines 90-120): Loops through all slides to build maps. **Risk:** O(n) operation, but acceptable if slides are loaded in batches. **Fix:** Already efficient, no changes needed.

---

## I) Error Handling / Observability

### Silent Failures
1. **props_json parsing** (`app/edit-slide/[slideId]/page.tsx` line 152): Uses `as any` - failures are silent. **Fix:** Add try/catch with error message.
2. **JSON.parse for buttons** (line 326): Catches error but only shows message, doesn't prevent save. **Fix:** Prevent save on parse error.
3. **Audio URL extraction** (line 194): No error handling if URL format is unexpected. **Fix:** Add validation.

### Missing Guards
1. **Array operations** (lines 191, 205, 221): No checks that `props.elements` or `props.lines` are arrays before calling `.map()`. **Fix:** Add `Array.isArray()` checks.
2. **Group loading** (line 231): No error handling if group load fails. **Fix:** Show error message, don't crash.

### User-Facing Error Clarity
1. **Save errors** (line 525): Shows raw error message - may not be user-friendly. **Fix:** Map common errors to user-friendly messages.
2. **Load errors** (line 142): Shows technical error message. **Fix:** Add user-friendly error messages.

### Console Spam vs Structured Errors
- **Development logging** (`lib/data/lessons.ts` lines 288-315): Uses `console.log` in dev mode - good practice
- **No structured error logging** - errors are just strings. **Fix:** Add structured error logging (e.g., Sentry) for production.

---

## Summary Statistics

- **Total Files Analyzed:** ~30 core files
- **Confirmed Good Paths:** 4 major flows
- **Migration Blockers:** 8 critical issues
- **DRY Violations:** 8 instances
- **Dead Code:** 7 items
- **Scale Risks:** 6 areas identified
- **Error Handling Gaps:** 5 issues

---

## Critical Path Forward

1. **P0 fixes must be completed** before removing hardcoded lessons
2. **P1 fixes recommended** before scaling to thousands of lessons
3. **P2 fixes** improve maintainability but not blocking

**Estimated Effort:**
- P0: 2-3 days
- P1: 3-4 days  
- P2: 2-3 days

**Total:** ~1-2 weeks for full refactor readiness

