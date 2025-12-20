# CMS Navigation Specification

## 1. Entity → Canonical Pages

| Entity | List Route | Edit Route | Create Route |
|--------|------------|------------|--------------|
| **Module** | `/` (home page - shows all modules in hierarchy) | `/edit-module/[moduleId]` | `/new-module` |
| **Lesson** | `/lesson-slides/[lessonId]` (management page showing groups & slides) | `/edit-lesson/[lessonId]` | `/new-lesson` |
| **Group** | `/lesson-slides/[lessonId]` (shown within lesson context) | `/edit-group/[groupId]` | `/new-group` |
| **Slide** | `/lesson-slides/[lessonId]` (shown within lesson context) | `/edit-slide/[slideId]` | `/new-slide` |

**Evidence:**
- Module list: `app/page.tsx` (home page with full hierarchy)
- Module edit: `app/page.tsx:453` → `/edit-module/${mid}`
- Module create: `app/page.tsx:387` → `/new-module?level=${lvl}`
- Lesson list/manage: `app/page.tsx:517` → `/lesson-slides/${lid}` (labeled "manage")
- Lesson edit: `app/page.tsx:547` → `/edit-lesson/${lid}`
- Lesson create: `app/page.tsx:450` → `/new-lesson?module_id=${mid}`
- Group edit: `app/page.tsx:615` → `/edit-group/${gid}`
- Group create: `app/lesson-slides/[lessonId]/page.tsx:448` → `addGroup()` function (creates inline)
- Slide edit: `app/page.tsx:662,752` → `/edit-slide/${s.id}`
- Slide create: `app/lesson-slides/[lessonId]/page.tsx:511` → `addAiSpeakRepeatSlide()` / `addTextSlide()` functions (creates inline)

## 2. Selector Destination Rules

- **If user selects a Module:** go to `/edit-module/[moduleId]`
  - Evidence: `app/page.tsx:453` - "edit" button links to edit-module

- **If user selects a Lesson:** go to `/lesson-slides/[lessonId]`
  - Evidence: `app/page.tsx:517` - "manage" button (primary action) links to lesson-slides
  - Note: `/edit-lesson/[lessonId]` exists but "manage" is the primary action from home page

- **If user selects a Group:** go to `/edit-group/[groupId]`
  - Evidence: `app/page.tsx:615` - "edit" button links to edit-group

- **If user selects a Slide:** go to `/edit-slide/[slideId]`
  - Evidence: `app/page.tsx:662,752` - "edit" buttons link to edit-slide

## 3. Breadcrumb Destination Rules

- **"Modules" crumb** → `/` (home page showing full hierarchy)
  - Evidence: `app/page.tsx` is the main dashboard

- **Module crumb** → `/edit-module/[moduleId]`
  - Evidence: `app/page.tsx:453` - edit-module is the canonical module page

- **Lesson crumb** → `/lesson-slides/[lessonId]` (preferred) or `/edit-lesson/[lessonId]`
  - Evidence: `app/page.tsx:517` - "manage" is primary action, `app/page.tsx:547` - "edit" is secondary
  - Recommendation: Use `/lesson-slides/[lessonId]` as primary since it shows the full lesson context

- **Group crumb** → `/edit-group/[groupId]`
  - Evidence: `app/page.tsx:615` - edit-group is the canonical group page

- **Slide crumb** → `/edit-slide/[slideId]`
  - Evidence: `app/page.tsx:662,752` - edit-slide is the canonical slide page

## 4. Context-Specific Shortcuts

### From lesson edit (`/edit-lesson/[lessonId]`):
- **"View groups"** → `/lesson-slides/[lessonId]` (shows groups within lesson)
- **"View slides"** → `/lesson-slides/[lessonId]` (shows slides within lesson)
- **"Add group"** → `/new-group?lesson_id=[lessonId]` (if query param supported) or `/new-group` with lesson selection
- **"Add slide"** → `/new-slide` (user selects lesson/group) or `/lesson-slides/[lessonId]` (use inline add buttons)
  - Evidence: `app/lesson-slides/[lessonId]/page.tsx:448,511` - inline add buttons exist on lesson-slides page

### From group edit (`/edit-group/[groupId]`):
- **"Slides in this group"** → `/lesson-slides/[lessonId]` (filtered view, if supported) or `/lesson-slides/[lessonId]` (full lesson view)
  - Note: Group has `lesson_id`, can navigate to lesson-slides page
- **"Add slide"** → `/new-slide` (user selects lesson/group) or `/lesson-slides/[lessonId]` (use inline add buttons)
  - Evidence: `app/lesson-slides/[lessonId]/page.tsx:511` - inline add slide buttons exist

### From slide edit (`/edit-slide/[slideId]`):
- **"Back to group"** → `/edit-group/[groupId]` (if slide has group_id)
  - Note: Slide has `group_id` field, can navigate to group edit page
- **"Back to lesson"** → `/lesson-slides/[lessonId]` (preferred) or `/edit-lesson/[lessonId]`
  - Note: Slide has `lesson_id` field, can navigate to lesson page
- **"Slides list"** → `/lesson-slides/[lessonId]` (shows all slides in lesson)
  - Evidence: `app/lesson-slides/[lessonId]/page.tsx` - this is the slides management page

## 5. Route Conventions

### ID Parameters:
- **Module:** `[moduleId]` - uses UUID (evidence: `app/edit-module/[moduleId]/page.tsx`)
- **Lesson:** `[lessonId]` - uses UUID (evidence: `app/edit-lesson/[lessonId]/page.tsx`, `app/lesson-slides/[lessonId]/page.tsx`)
- **Group:** `[groupId]` - uses UUID (evidence: `app/edit-group/[groupId]/page.tsx`)
- **Slide:** `[slideId]` - uses UUID (evidence: `app/edit-slide/[slideId]/page.tsx`)

**All routes use UUIDs, not slugs.** No routes use slugs for navigation.

### Query Parameters:
- **Create module:** `/new-module?level=A1` (optional level prefill)
  - Evidence: `app/page.tsx:387` → `/new-module?level=${lvl}`
- **Create lesson:** `/new-lesson?module_id=[moduleId]` (optional module prefill)
  - Evidence: `app/page.tsx:450` → `/new-lesson?module_id=${mid}`

### Duplicate/Legacy Routes (DO NOT USE):
- **`/debug/new-slide-ai`** - Legacy authoring table route, behind feature flag
- **`/debug/edit-slide-ai`** - Legacy authoring table route, behind feature flag
- **`/debug/slides-browser`** - Legacy authoring table route, behind feature flag
- **`/lesson-preview/[lessonId]`** - JSON preview page, not a canonical navigation destination
- **`/modules-browser`** - Alternative modules list view, but `/` is the canonical dashboard

**All routes under `/debug/*` are quarantined and should NOT be used as canonical destinations.**

### Additional Notes:
- **`/lesson-slides/[lessonId]`** serves dual purpose:
  1. List/manage page for groups and slides within a lesson
  2. Primary navigation destination for lessons (more useful than edit page)
- **Home page (`/`)** is the primary dashboard showing full hierarchy (CEFR → Modules → Lessons → Groups → Slides)
- **No dedicated list pages** exist for groups or slides - they are always shown in context of their parent lesson via `/lesson-slides/[lessonId]`

