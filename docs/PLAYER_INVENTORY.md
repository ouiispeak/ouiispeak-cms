# Player & Lesson System Inventory

## 1. LESSON LOADING

### Active Files
- **`lib/loadLesson.ts`**
  - Main lesson loader function `loadLessonById()`
  - Loads from production tables: `lessons`, `lesson_groups`, `slides`
  - Accepts UUID or slug as lessonId
  - Only supports `ai-speak-repeat` slide type (filters others out)
  - Returns structured `LoadedLesson` type with groups and slides

- **`lib/supabase.ts`**
  - Supabase client initialization
  - Used by all data loading operations

### Database Tables (Production)
- **`lessons`** - Main lesson table (id, slug, title, module_id, order_index)
- **`lesson_groups`** - Groups within lessons (id, lesson_id, title, order_index)
- **`slides`** - Slides within groups (id, lesson_id, group_id, type, props_json, order_index)

### Database Tables (Authoring/Draft)
- **`lessons_authoring`** - Draft lessons (has status, version, updated_by fields)
- **`lesson_groups_authoring`** - Draft groups
- **`slides_authoring`** - Draft slides (has status, version, updated_by fields)

---

## 2. LESSON RENDERING

### Active Files
- **`app/lesson-preview/[lessonId]/page.tsx`**
  - CMS preview page for lessons
  - Uses `loadLessonById()` to load lesson data
  - Displays lesson structure as JSON (read-only preview)
  - No actual player rendering - just data display

### Player Integration
- **External player link**: `http://localhost:3000/lecons/db/${lessonId}`
  - Referenced in `app/page.tsx` as "player" link
  - Player appears to be separate application/service
  - Not part of this CMS codebase

---

## 3. SLIDE RENDERING

### Active Files
- **`app/lesson-preview/[lessonId]/page.tsx`**
  - Displays slide data as JSON (no visual rendering)
  - Shows structure: groups → slides with props

### Mock/Test Slide Rendering
- **`app/mock-slide/[slide]/page.tsx`**
  - Renders mock slides from JSON files (slide1.json, slide2.json)
  - Uses legacy `slideSchema` (slideType: "text" | "speak")
  - Displays slide content based on slideType
  - **Status**: Mock/experimental - uses legacy schema

- **`app/real-slide/page.tsx`**
  - Renders single slide from `mock-data/real-ai-speak-repeat.json`
  - Uses `realSlideSchema` (type: "ai-speak-repeat")
  - Displays slide props: title, subtitle, note, lines
  - **Status**: Test/debug - hardcoded to one slide

---

## 4. PROGRESSION / NAVIGATION

### Files
- **`app/lesson-preview/[lessonId]/page.tsx`**
  - Basic lesson structure display
  - No navigation/progression logic in CMS
  - Player handles progression (external)

### Navigation Links
- **`app/page.tsx`** (CMS dashboard)
  - Links to `/lesson-preview/${lid}` for preview
  - Links to external player: `http://localhost:3000/lecons/db/${lid}`
  - Links to `/lesson-slides/${lid}` for management

---

## 5. SLIDE TYPE DEFINITIONS

### Current Production Schema
- **`lib/realSlideSchema.ts`**
  - Defines `aiSpeakRepeatSlideSchema`
  - Slide type: `"ai-speak-repeat"`
  - Props: title, subtitle, note, defaultLang, lines[][], gapClass, hideTitle, onCompleteAtIndex
  - Used by: `loadLesson.ts`, `edit-slide/[slideId]/page.tsx`, `new-slide/page.tsx`
  - **Status**: ACTIVE - only slide type currently supported in production

### Legacy Schema (Unused in Production)
- **`lib/slideSchema.ts`**
  - Defines discriminated union: `slideType: "text" | "speak"`
  - Slide types:
    - `"text"` (activityType: "textDisplay") - props: lines, mediaId, audioId
    - `"speak"` (activityType: "speakRepeat") - props: promptAudioId, transcript, attemptsAllowed
  - Used by: `mock-slide/[slide]/page.tsx` only
  - **Status**: LEGACY - not used in production database or loadLesson

### Slide Type Support Summary
- **Production**: Only `"ai-speak-repeat"` supported
- **Legacy/Mock**: `"text"` and `"speak"` types exist in schema but not used in production

---

## 6. HARDCODED LESSONS / MOCK DATA

### Mock Data Files
- **`mock-data/slide1.json`**
  - Legacy slide format (slideType: "text")
  - Used by `mock-slide/[slide]/page.tsx`
  - **Status**: Mock/experimental

- **`mock-data/slide2.json`**
  - Legacy slide format (slideType: "speak")
  - Used by `mock-slide/[slide]/page.tsx`
  - **Status**: Mock/experimental

- **`mock-data/real-ai-speak-repeat.json`**
  - Current slide format (type: "ai-speak-repeat")
  - Used by `real-slide/page.tsx`
  - **Status**: Test/debug - hardcoded example

### Hardcoded Slide References
- **`app/edit-slide-ai/page.tsx`**
  - Hardcoded to edit slide with id: `"slide-ai-001"`
  - Uses `slides_authoring` table
  - **Status**: Test/debug - not dynamic

- **`app/db-slide-test/page.tsx`**
  - Hardcoded to load slide id: `"slide-ai-001"`
  - Uses `slides_authoring` table
  - **Status**: Test/debug

- **`app/db-slide-rename/page.tsx`**
  - Hardcoded to update slide id: `"slide-ai-001"`
  - Uses `slides_authoring` table
  - **Status**: Test/debug

---

## 7. FILE STATUS CLASSIFICATION

### ACTIVE / PRODUCTION FILES
- `lib/loadLesson.ts` - Core lesson loader
- `lib/realSlideSchema.ts` - Current slide schema
- `lib/supabase.ts` - Database client
- `app/lesson-preview/[lessonId]/page.tsx` - Lesson preview
- `app/edit-slide/[slideId]/page.tsx` - Slide editor (production)
- `app/new-slide/page.tsx` - Create slides (production table)
- `app/lesson-slides/[lessonId]/page.tsx` - Manage slides (production)
- `app/page.tsx` - CMS dashboard (uses production tables)

### LEGACY / UNUSED IN PRODUCTION
- `lib/slideSchema.ts` - Legacy slide schema (text/speak types)
- `app/mock-slide/[slide]/page.tsx` - Uses legacy schema
- `mock-data/slide1.json` - Legacy format
- `mock-data/slide2.json` - Legacy format

### AUTHORING / DRAFT SYSTEM (Separate from Production)
- `app/new-slide-ai/page.tsx` - Creates in `slides_authoring` table
- `app/edit-slide-ai/page.tsx` - Edits in `slides_authoring` table
- `app/slides-browser/page.tsx` - Browses `slides_authoring` table
- Tables: `lessons_authoring`, `lesson_groups_authoring`, `slides_authoring`

### TEST / DEBUG / EXPERIMENTAL
- `app/real-slide/page.tsx` - Hardcoded slide display
- `app/db-slide-test/page.tsx` - Test slide loading
- `app/db-slide-rename/page.tsx` - Test slide updating
- `app/test-db/page.tsx` - Connection test
- `app/debug-tables/page.tsx` - Placeholder debug page
- `mock-data/real-ai-speak-repeat.json` - Test data

### REDUNDANT / DUPLICATE PATTERNS
- **Slide creation**: 
  - `app/new-slide/page.tsx` (production `slides` table)
  - `app/new-slide-ai/page.tsx` (authoring `slides_authoring` table)
  - **Note**: Two parallel systems

- **Slide editing**:
  - `app/edit-slide/[slideId]/page.tsx` (production `slides` table)
  - `app/edit-slide-ai/page.tsx` (authoring `slides_authoring` table, hardcoded ID)
  - **Note**: Two parallel systems

---

## 8. DATABASE TABLE USAGE

### Production Tables (Active)
- `modules` - Used by CMS dashboard, new-lesson, modules-browser
- `lessons` - Used by loadLesson, CMS dashboard, all lesson management
- `lesson_groups` - Used by loadLesson, CMS dashboard, group management
- `slides` - Used by loadLesson, CMS dashboard, slide management

### Authoring Tables (Separate System)
- `lessons_authoring` - Used by slides-browser, new-slide-ai, test-db
- `lesson_groups_authoring` - Used by slides-browser, new-slide-ai
- `slides_authoring` - Used by slides-browser, new-slide-ai, edit-slide-ai, db-slide-*

---

## 9. SCHEMA DOCUMENTATION

### Schema Docs
- `docs/schema.lessons.md` - Documents `lessons_authoring` table
- `docs/schema.lessons.sql` - SQL for `lessons_authoring` table
- `docs/schema.groups.md` - Documents `lesson_groups_authoring` table
- `docs/schema.groups.sql` - SQL for `lesson_groups_authoring` table
- `docs/schema.slides.md` - Documents `slides_authoring` table
- `docs/schema.slides.sql` - SQL for `slides_authoring` table
- **Note**: Docs only cover authoring tables, not production tables

---

## 10. SUMMARY

### Key Findings
1. **Dual table system**: Production (`lessons`, `slides`) vs Authoring (`lessons_authoring`, `slides_authoring`)
2. **Single slide type in production**: Only `"ai-speak-repeat"` is supported by `loadLesson.ts`
3. **Legacy schema exists**: `slideSchema.ts` defines `"text"` and `"speak"` but unused in production
4. **Player is external**: Player rendering happens at `localhost:3000/lecons/db/[lessonId]` (not in this codebase)
5. **Multiple test/debug pages**: Several pages hardcode slide IDs or use mock data
6. **No progression logic**: CMS only loads/displays data; player handles navigation

### Unused/Redundant Files
- `lib/slideSchema.ts` - Legacy schema, not used in production
- `app/mock-slide/[slide]/page.tsx` - Uses legacy schema, mock only
- `app/real-slide/page.tsx` - Hardcoded test page
- `app/db-slide-test/page.tsx` - Debug/test page
- `app/db-slide-rename/page.tsx` - Debug/test page
- `app/debug-tables/page.tsx` - Empty placeholder
- `app/test-db/page.tsx` - Connection test
- `mock-data/*.json` - All mock/test data files

