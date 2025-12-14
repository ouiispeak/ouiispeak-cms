# CMS Page Inventory

## Authoring (Create)

### `/new-module`
- **File:** `app/new-module/page.tsx`
- **Purpose:** Create a new module with title, slug, level, order index, and description
- **Tables:** `modules`
- **Actions:**
  - Form: title, slug, level, order index, description
  - Submit button: "Create module"

### `/new-lesson`
- **File:** `app/new-lesson/page.tsx`
- **Purpose:** Create a new lesson within a module
- **Tables:** `modules`, `lessons`
- **Actions:**
  - Form: module selection, lesson slug part, title, order index
  - Submit button: "Create lesson"

### `/new-group`
- **File:** `app/new-group/page.tsx`
- **Purpose:** Create a new lesson group within a lesson
- **Tables:** `lessons`, `lesson_groups`
- **Actions:**
  - Form: lesson selection, order index, group title
  - Submit button: "Create group"

### `/new-slide`
- **File:** `app/new-slide/page.tsx`
- **Purpose:** Create a new ai-speak-repeat slide in the `slides` table
- **Tables:** `lessons`, `lesson_groups`, `slides`
- **Actions:**
  - Form: lesson selection, group selection, order index, slide title
  - Submit button: "Create slide"

### `/new-slide-ai`
- **File:** `app/new-slide-ai/page.tsx`
- **Purpose:** Create a new ai-speak-repeat slide in the `slides_authoring` table
- **Tables:** `lessons_authoring`, `lesson_groups_authoring`, `slides_authoring`
- **Actions:**
  - Form: lesson selection, group selection, order index, title, subtitle, note, default language, phrases (textarea)
  - Submit button: "Create slide"

## Editing

### `/edit-slide/[slideId]`
- **File:** `app/edit-slide/[slideId]/page.tsx`
- **Purpose:** Edit an existing slide from the `slides` table
- **Tables:** `slides`
- **Actions:**
  - Form: title, subtitle, note, default language, phrases (textarea)
  - Submit button: "Save changes"

### `/edit-slide-ai`
- **File:** `app/edit-slide-ai/page.tsx`
- **Purpose:** Edit a hardcoded slide (id: "slide-ai-001") from `slides_authoring` table
- **Tables:** `slides_authoring`
- **Actions:**
  - Form: title input
  - Submit button: "Save title"

## Browsers / Lists

### `/modules-browser`
- **File:** `app/modules-browser/page.tsx`
- **Purpose:** Browse all modules and their associated lessons
- **Tables:** `modules`, `lessons`
- **Actions:**
  - Read-only display

### `/slides-browser`
- **File:** `app/slides-browser/page.tsx`
- **Purpose:** Browse all slides organized by lesson and group from authoring tables
- **Tables:** `lessons_authoring`, `lesson_groups_authoring`, `slides_authoring`
- **Actions:**
  - Links to `/edit-slide/[slideId]` for each slide
  - Read-only display with navigation links

### `/lesson-slides/[lessonId]`
- **File:** `app/lesson-slides/[lessonId]/page.tsx`
- **Purpose:** Browse and manage slides for a specific lesson, organized by groups
- **Tables:** `slides`, `lesson_groups`
- **Actions:**
  - Button: "+ Add ai-speak-repeat slide" (creates slide and redirects to edit)
  - Button: "+ Add slide to this group" (per group)
  - Links: "Edit" for each slide

### `/lesson-preview/[...lessonId]`
- **File:** `app/lesson-preview/[...lessonId]/page.tsx`
- **Purpose:** Preview lesson content including groups and slides
- **Tables:** `lessons`, `lesson_groups`, `slides` (via `loadLessonById`)
- **Actions:**
  - Read-only display

## Debug / Test / Scratch

### `/db-slide-rename`
- **File:** `app/db-slide-rename/page.tsx`
- **Purpose:** Test page to rename a slide title via query parameter (?title=...)
- **Tables:** `slides_authoring`
- **Actions:**
  - Query parameter: `title`
  - Updates slide "slide-ai-001"

### `/db-slide-test`
- **File:** `app/db-slide-test/page.tsx`
- **Purpose:** Test page to load and display a slide from database
- **Tables:** `slides_authoring`
- **Actions:**
  - Read-only display of slide "slide-ai-001"

### `/debug-tables`
- **File:** `app/debug-tables/page.tsx`
- **Purpose:** Placeholder debug page (just displays "OK")
- **Tables:** None
- **Actions:**
  - None

### `/test-db`
- **File:** `app/test-db/page.tsx`
- **Purpose:** Test Supabase connection by querying lessons_authoring table
- **Tables:** `lessons_authoring`
- **Actions:**
  - Read-only connection test

### `/mock-slide/[slide]`
- **File:** `app/mock-slide/[slide]/page.tsx`
- **Purpose:** Display mock slide data from JSON files (slide1.json or slide2.json)
- **Tables:** None (reads from mock-data files)
- **Actions:**
  - Read-only display

### `/real-slide`
- **File:** `app/real-slide/page.tsx`
- **Purpose:** Display real slide from JSON file (real-ai-speak-repeat.json)
- **Tables:** None (reads from mock-data file)
- **Actions:**
  - Read-only display

## Other / Unknown

### `/`
- **File:** `app/page.tsx`
- **Purpose:** Default Next.js homepage template (not CMS-related)
- **Tables:** None
- **Actions:**
  - Links to external Next.js resources

---

## Candidates for Deletion Later

- **`/edit-slide-ai`** - Hardcoded to edit only "slide-ai-001"; likely duplicate of `/edit-slide/[slideId]`
- **`/new-slide` vs `/new-slide-ai`** - Two similar pages creating slides in different tables (`slides` vs `slides_authoring`); may be duplicates or serve different purposes
- **`/db-slide-rename`** - Test/debug page; likely temporary
- **`/db-slide-test`** - Test/debug page; likely temporary
- **`/debug-tables`** - Empty placeholder; likely temporary
- **`/test-db`** - Connection test page; likely temporary
- **`/mock-slide/[slide]`** - Uses mock JSON files; may be for development only
- **`/real-slide`** - Uses mock JSON file; may be for development only
- **`/`** - Default Next.js template; should be replaced with CMS dashboard or navigation

