# CMS Style System Map

**Analysis Date:** 2024  
**Purpose:** Inventory of visual patterns and primitives across the ouiispeak-cms application  
**Status:** Phase 1 — Naming Only (No Code Changes)

---

## Page-Level Primitives

### PageContainer
**Visual Intent:** Provides consistent page-level layout structure with padding and optional max-width constraints. Establishes the main content area boundaries and ensures content doesn't stretch too wide on large screens.

**Where It Appears:**
- All pages (`app/*/page.tsx`)
- Supports `maxWidth` presets: `sm` (600px), `md` (720px), `lg` (900px), or custom number
- Special case: Dashboard uses `width: "90vw"` via style prop

**Current Implementation:** `components/ui/PageContainer.tsx`

---

### PageHeader
**Visual Intent:** Displays the primary page title in a consistent location. Creates visual hierarchy and establishes page context immediately below the navigation bar.

**Where It Appears:**
- All pages (except layout)
- Pattern: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><h1 style={{ margin: 0 }}>Title</h1></div>`
- Examples: "CMS Dashboard", "Edit slide", "Create new lesson", "Lesson Slides"

**Current Implementation:** Inline div wrapper (not yet abstracted)

---

### PageBackButtonRow
**Visual Intent:** Provides consistent navigation back button placement. Creates a dedicated row for backward navigation, separate from page header but visually connected.

**Where It Appears:**
- All pages except dashboard (`app/page.tsx`)
- Pattern: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><BackButton /></div>`
- Uses `BackButton` component or Link-based back navigation for server components

**Current Implementation:** `components/BackButton.tsx` + wrapper div

---

### PageMeta
**Visual Intent:** Provides secondary context information about the page structure or purpose. Helps users understand what they're viewing at a glance.

**Where It Appears:**
- Dashboard: "Grid view: CEFR → Modules → Lessons → Groups → Slides"
- Pattern: `<div style={{ color: "#000000", fontSize: 13, marginTop: 16, marginBottom: 24 }}>...</div>`
- Often appears below page header, above main content

**Current Implementation:** Inline div (not yet abstracted)

---

## Section-Level Primitives

### SectionCard
**Visual Intent:** Groups related content into visually distinct, bounded sections. Creates cognitive separation between different functional areas while maintaining visual consistency.

**Where It Appears:**
- Edit-slide page: "Slide Type", "Placement", "title-slide editor", raw JSON sections
- Dashboard: Each CEFR level (A0, A1, A2, B1, B2, C1, C2)
- Supports optional `title`, `description`, and `actions` props
- Pattern: Rounded corners (`rounded-lg`), border (`1px solid #ddd`), padding (`p-4`), margin-bottom (`mb-6`)

**Current Implementation:** `components/ui/SectionCard.tsx`

---

## Conceptual Primitive: CmsSection

**Status:** Conceptual Definition (Not Yet Implemented)  
**Purpose:** A unified, flexible section primitive that can replace both `SectionCard` and ad-hoc section patterns across the CMS.

### Visual Contract

#### Container Properties
- **Padding:** `16px` (all sides) - equivalent to Tailwind `p-4`
- **Border:** `1px solid #ddd` - uses `border` token from `uiTokens.ts`
- **Border Radius:** `8px` - equivalent to Tailwind `rounded-lg`
- **Margin Bottom:** `24px` - equivalent to Tailwind `mb-6` (spacing between sections)
- **Background Color:** `transparent` (no background) - allows page background to show through
- **Display:** `block` (default block-level element)

#### Visual Intent
Creates a visually distinct, bounded container for grouping related content. The rounded corners and border provide clear visual boundaries without heavy visual weight. The consistent spacing ensures sections don't feel cramped or disconnected from each other.

### Sub-Elements

#### CmsSectionHeader (Optional)
**Visual Intent:** Provides a dedicated area for section title, description, and header-level actions. Creates clear hierarchy and allows actions to be positioned relative to the section title.

**Properties:**
- **Padding:** `0` (inherits from parent CmsSection padding)
- **Margin Bottom:** `16px` (`mb-4`) when present - creates separation between header and body
- **Layout:** Flexbox with `justify-content: space-between` and `align-items: flex-start`
- **Gap:** `16px` (`gap-4`) between title/description area and actions area

**Content Areas:**
- **Title Area (Left):**
  - Title: `<h2>` with `font-size: 18px` (`text-lg`), `font-weight: 400`, `margin: 0`
  - Description (optional): `<p>` with `font-size: 14px` (`text-sm`), `color: #666`, `margin-top: 4px` (`mt-1`), `margin-bottom: 0`
- **Actions Area (Right):**
  - Flex container with `gap: 8px` (`gap-2`)
  - Right-aligned actions (buttons, links, badges)

**When to Use:**
- Section has a title that needs to be prominent
- Section has header-level actions (e.g., "Add Module" button in CEFR section)
- Section needs a description explaining its purpose

**When to Omit:**
- Section is purely content without a title
- Actions are contextual within the body content
- Section is a simple container without header metadata

---

#### CmsSectionBody (Required)
**Visual Intent:** Contains the main content of the section. Provides consistent internal spacing and layout for form fields, lists, or other content.

**Properties:**
- **Padding:** `0` (inherits from parent CmsSection padding)
- **Margin:** `0` (no additional margin unless header/footer present)
- **Layout:** `block` (default) - can be overridden for specific layouts

**Content Patterns:**
- **Form Fields:** Individual fields with `margin-bottom: 16px` between them
- **Lists:** Unstyled lists or custom list layouts
- **Metadata:** UUID displays, technical info with reduced visual weight
- **Nested Content:** Can contain other CmsSection instances for nested structures

**When to Use:**
- Always present (required element)
- Contains the primary content of the section

---

#### CmsSectionFooter (Optional)
**Visual Intent:** Provides a dedicated area for section-level actions, typically primary actions like "Save changes" or "Create". Separates actions from content for clear visual hierarchy.

**Properties:**
- **Padding:** `0` (inherits from parent CmsSection padding)
- **Margin Top:** `24px` (`mt-6`) when present - creates separation from body content
- **Border Top:** `1px solid #ddd` (optional) - visual separator when needed
- **Padding Top:** `16px` (`pt-4`) when border-top is present
- **Layout:** Flexbox with `justify-content: flex-end` (right-aligned) or `flex-start` (left-aligned)

**Content Patterns:**
- **Primary Actions:** Submit buttons, save buttons, create buttons
- **Action Groups:** Multiple related actions with `gap: 8px`
- **Status Messages:** Success/error messages related to section actions

**When to Use:**
- Section has primary actions that operate on the entire section
- Section is a form that needs a submit button
- Section needs status feedback for its actions

**When to Omit:**
- Actions are inline within the body content
- Actions are header-level (use CmsSectionHeader actions instead)
- Section is display-only without actions

---

### Comparison Against Existing Pages

#### edit-slide page
**Current Pattern:** Uses `SectionCard` component

**Examples:**
1. **"Slide Type" section:**
   - Has title in header
   - Body contains single form field
   - No footer (no section-level actions)

2. **"Placement" section:**
   - Has title in header
   - Body contains two side-by-side form fields
   - No footer

3. **"title-slide editor" section:**
   - Has title in header
   - Body contains metadata (UUIDs) and form fields
   - Has footer with "Save changes" button and status message

**CmsSection Mapping:**
- ✅ Header: Title "title-slide editor"
- ✅ Body: UUID metadata + form fields
- ✅ Footer: Save button + status message

**Gap Analysis:**
- Current `SectionCard` supports title/description/actions in header ✓
- Current `SectionCard` doesn't have explicit footer - actions are in body
- CmsSection would add explicit footer support for better separation

---

#### edit-lesson page
**Current Pattern:** No section wrapper, just form fields directly in PageContainer

**Structure:**
- Form fields with `margin-bottom: 16px`
- Save button at bottom of form (not in a section)
- Status message after form

**CmsSection Mapping:**
- Could wrap entire form in CmsSection:
  - ❌ Header: No title needed (page title serves this purpose)
  - ✅ Body: All form fields
  - ✅ Footer: Save button + status message

**Gap Analysis:**
- Current pattern doesn't use sections - form is loose in PageContainer
- CmsSection would provide visual grouping and consistent spacing
- Footer would clearly separate actions from form fields

---

#### edit-module page
**Current Pattern:** No section wrapper, just form fields directly in PageContainer

**Structure:**
- Form fields with `margin-bottom: 12px` or `16px`
- Save button at bottom of form
- Status message after form

**CmsSection Mapping:**
- Could wrap entire form in CmsSection:
  - ❌ Header: No title needed
  - ✅ Body: All form fields
  - ✅ Footer: Save button + status message

**Gap Analysis:**
- Similar to edit-lesson - no visual section grouping
- CmsSection would provide consistent visual treatment
- Footer would improve action placement

---

#### lesson-slides page
**Current Pattern:** Uses `<section>` elements with custom styling

**Structure:**
- Each group is a `<section>` with:
  - `marginBottom: 18px`
  - `paddingBottom: 18px`
  - `borderBottom: "2px solid #ddd"`
- Header area: Group title + actions (Rename button, Add slide dropdown)
- Body: List of slides or empty state
- No explicit footer

**CmsSection Mapping:**
- ✅ Header: Group title + actions (Rename, Add slide)
- ✅ Body: Slides list or empty state
- ❌ Footer: Not used (actions are in header)

**Gap Analysis:**
- Current pattern uses different spacing (18px vs 24px)
- Current pattern uses `borderBottom` instead of full border
- Current pattern uses `2px` border instead of `1px`
- CmsSection would standardize spacing and border treatment
- CmsSection's optional footer isn't needed here (actions in header)

---

### Design Decisions

#### Why 24px margin-bottom?
- Matches current `SectionCard` implementation (`mb-6`)
- Provides clear visual separation between sections
- Consistent with spacing scale (multiples of 8px)

#### Why 16px padding?
- Matches current `SectionCard` implementation (`p-4`)
- Provides comfortable internal spacing
- Allows content to breathe without feeling cramped

#### Why 8px border-radius?
- Matches current `SectionCard` implementation (`rounded-lg`)
- Provides modern, friendly appearance
- Not too rounded (avoids playful/casual feel)

#### Why transparent background?
- Current `SectionCard` has no background color
- Allows page background to show through
- Keeps visual weight light

#### Why optional Header/Footer?
- Not all sections need titles (e.g., form-only sections)
- Not all sections need footer actions (e.g., display-only sections)
- Flexibility allows CmsSection to replace both `SectionCard` and ad-hoc patterns

#### Why separate Footer vs Header actions?
- Footer actions are typically primary actions (Save, Create, Submit)
- Header actions are typically contextual or secondary (Add, Edit, Delete)
- Separation creates clear visual hierarchy and cognitive grouping

---

### Migration Path

**Phase 1 (Current):**
- `SectionCard` exists and works
- Ad-hoc sections exist (lesson-slides, edit-lesson, edit-module)

**Phase 2 (Proposed):**
- Create `CmsSection` component matching this spec
- Add explicit `header`, `body`, `footer` props or slots
- Maintain backward compatibility with `SectionCard` API initially

**Phase 3 (Future):**
- Migrate `SectionCard` usage to `CmsSection`
- Migrate ad-hoc sections to `CmsSection`
- Deprecate `SectionCard` in favor of unified `CmsSection`

---

### SectionDivider
**Visual Intent:** Creates visual separation between hierarchical items within a section. Uses subtle borders to indicate grouping without heavy visual weight.

**Where It Appears:**
- Dashboard: Between modules, lessons, groups, slides (`borderBottom: "1px solid #eee"`)
- Lesson-slides page: Between header and content (`borderTop: "1px solid #ddd"`)
- Pattern: `borderBottom: "1px solid #eee"` or `borderTop: "1px solid #ddd"`
- Used extensively in nested tree structures

**Current Implementation:** Inline style on divs

---

### NestedRow
**Visual Intent:** Represents hierarchical items in a tree structure with progressive indentation. Visual indentation (`paddingLeft`) indicates nesting depth and parent-child relationships.

**Where It Appears:**
- Dashboard: Modules (32px), Lessons (48px), Groups (64px), Slides (80px)
- Pattern: Progressive `paddingLeft` values (32px → 48px → 64px → 80px)
- Each level has consistent padding and border-bottom for separation

**Current Implementation:** Inline styles with calculated paddingLeft

---

### ExpandableRow
**Visual Intent:** Provides collapsible/expandable functionality for hierarchical content. Uses arrow indicators (▾/▸) to show state and allows users to control information density.

**Where It Appears:**
- Dashboard: CEFR levels, modules, lessons, groups
- Pattern: Button with `{isOpen ? "▾" : "▸"} {title}` and toggle handler
- Transparent background, no border, left-aligned text

**Current Implementation:** Inline button elements

---

## Content Primitives

### Label
**Visual Intent:** Identifies form fields and input controls. Provides clear association between labels and their inputs, improving accessibility and usability.

**Where It Appears:**
- All form pages (new/edit pages)
- Pattern: `<label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>...</label>`
- Sometimes includes `fontSize: 14` explicitly
- Often includes required indicators: `<span style={{ color: "red" }}>*</span>`

**Current Implementation:** Standard HTML `<label>` with inline styles

---

### HelperText
**Visual Intent:** Provides supplementary information, hints, or context for form fields or actions. Uses reduced visual weight to indicate secondary importance.

**Where It Appears:**
- Form pages: Below inputs, explaining expected format or providing examples
- Pattern: `<p style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>...</p>` or `color: "#666"`
- Examples: "Full slug will become: module/lesson-1", "Type 'delete' to confirm"

**Current Implementation:** Inline `<p>` elements

---

### MetaText
**Visual Intent:** Displays technical metadata (IDs, slugs, UUIDs) in a non-intrusive way. Helps developers and power users understand system identifiers without cluttering the main interface.

**Where It Appears:**
- Edit pages: "URL slide id: slide-123"
- Lesson-slides: "Lesson id: lesson-456"
- Pattern: `<p style={{ opacity: 0.7, fontSize: 13 }}>Label: <code>value</code></p>`
- Often uses `<code>` wrapper for technical values

**Current Implementation:** Inline `<p>` with `<code>` elements

---

### UUIDText
**Visual Intent:** Displays UUIDs and technical identifiers in a monospace format. Makes long identifiers easier to scan and copy.

**Where It Appears:**
- Edit-slide: "UUID: slide-ai-001", "Group UUID: group-123"
- Pattern: `<div style={{ marginBottom: 8, fontSize: 13, color: "#666" }}>UUID: <code>{id}</code></div>`
- Uses `<code>` element for monospace rendering

**Current Implementation:** Inline div with `<code>` elements

---

### CodeBlock
**Visual Intent:** Displays structured data (JSON, error details) in a readable, monospace format. Allows users to inspect raw data structures and debug issues.

**Where It Appears:**
- Debug pages: `test-db`, `db-slide-test`, `db-slide-rename`
- Preview pages: `lesson-preview`
- Error states: Validation errors, Supabase errors
- Pattern: `<pre style={{ fontSize: 12, marginTop: 16 }}>{JSON.stringify(data, null, 2)}</pre>`
- Often uses `fontSize: 12` for compact display

**Current Implementation:** Standard HTML `<pre>` with inline styles

---

### ErrorText
**Visual Intent:** Communicates error states and validation failures. Uses red color to signal urgency and draw attention to problems that need resolution.

**Where It Appears:**
- All pages: Error states, validation messages
- Pattern: `<p style={{ color: "red" }}>...</p>` or `<h2 style={{ color: "red" }}>Error</h2>`
- Examples: "Supabase error", "Validation failed", "Error loading slide"

**Current Implementation:** Inline styles with `color: "red"`

---

### SuccessText
**Visual Intent:** Confirms successful operations and positive feedback. Uses green color to signal completion and reassure users that actions succeeded.

**Where It Appears:**
- Form pages: After successful saves
- Pattern: `<p style={{ color: "green" }}>...</p>` or conditional `color: message.includes("error") ? "red" : "green"`
- Examples: "Saved successfully!", "Created successfully!"

**Current Implementation:** Inline styles with `color: "green"` or conditional coloring

---

### EmptyState
**Visual Intent:** Communicates absence of content in a helpful, non-alarming way. Guides users toward actions they can take to populate empty sections.

**Where It Appears:**
- Dashboard: "No modules yet.", "No lessons yet.", "No slides in this group yet."
- Pattern: `<div style={{ padding: "12px 16px", paddingLeft: [indent], color: "#000000", fontSize: [12-16] }}>No [items] yet.</div>`
- Uses consistent padding and indentation matching parent level

**Current Implementation:** Inline div elements

---

## Action Zones

### PrimaryActionRow
**Visual Intent:** Groups primary form actions (Save, Create, Submit) in a consistent location. Typically appears at the bottom of forms or sections, providing clear call-to-action.

**Where It Appears:**
- All form pages: "Save changes", "Create module", "Create lesson", "Save JSON"
- Pattern: `<button type="submit" style={{ padding: "8px 16px", fontSize: 14, borderRadius: 6, border: "1px solid #9bbfb2", backgroundColor: "#9bbfb2" }}>...</button>`
- Uses primary color (#9bbfb2) with hover state (#8aaea1)
- Shows loading state: `{saving ? "Saving…" : "Save changes"}`

**Current Implementation:** Inline button elements (some use `Button` component)

---

### InlineActions
**Visual Intent:** Provides contextual actions directly within content rows. Allows quick access to common operations without leaving the current view.

**Where It Appears:**
- Dashboard: "edit", "manage", "JSON", "player" links in module/lesson rows
- Lesson-slides: "Edit" links next to slides
- Pattern: `<Link style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #9bbfb2", backgroundColor: "#9bbfb2", fontSize: 12-13 }}>...</Link>`
- Smaller size (12-13px) and padding (6px 12px) than primary actions
- Often grouped in flex containers with gap: 8

**Current Implementation:** Inline Link/button elements

---

### DestructiveActions
**Visual Intent:** Signals dangerous or irreversible actions (Delete) with distinct visual treatment. Uses red/danger color to warn users before they commit to destructive operations.

**Where It Appears:**
- Dashboard: Delete buttons for modules and lessons
- Lesson-slides: Delete buttons for slides and groups
- Pattern: `<button style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #bf6f6f", backgroundColor: "#bf6f6f", color: "#222326" }}>...</button>`
- Uses danger color (#bf6f6f) with hover state (#ad5f5f)
- Often includes SVG trash icon

**Current Implementation:** Inline button elements (some use `Button` component with `variant="danger"`)

---

### ActionButtonGroup
**Visual Intent:** Groups related actions together horizontally. Creates visual cohesion for actions that operate on the same context or object.

**Where It Appears:**
- Dashboard: Module/lesson action groups (edit, delete, add lesson)
- Lesson-slides: Slide action groups
- Pattern: `<div style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "center" }}>...</div>`
- Uses consistent gap (8px) and alignment
- Often includes count badges: `<span>{count} items</span>`

**Current Implementation:** Inline flex divs

---

### ModalActions
**Visual Intent:** Groups actions within modal dialogs, typically with Cancel and Confirm buttons. Provides clear decision points for critical actions.

**Where It Appears:**
- Dashboard: Delete confirmation modal
- Pattern: `<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>...</div>`
- Cancel button: White background, border
- Confirm button: Red background (#d32f2f) for destructive actions
- Right-aligned (flex-end) for primary action emphasis

**Current Implementation:** Inline flex divs in modal dialogs

---

### SecondaryActionButton
**Visual Intent:** Provides alternative actions that are less prominent than primary actions. Uses secondary color scheme to indicate lower priority.

**Where It Appears:**
- Lesson-slides: "Preview in Player" button
- Lesson pages: "JSON" preview link
- Pattern: `<a style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #a6a198", backgroundColor: "#a6a198" }}>...</a>`
- Uses secondary color (#a6a198) with hover state (#959088)
- Often appears alongside primary actions

**Current Implementation:** Inline Link/button elements

---

## Navigation Primitives

### TopNavBar
**Visual Intent:** Provides persistent site-wide navigation. Creates consistent access to main sections regardless of current page.

**Where It Appears:**
- All pages (via `layout.tsx`)
- Pattern: Dark background (#2b3640), white text, horizontal links with dividers
- Links: "CMS Dashboard", "Modules Browser"
- Pattern: `<nav style={{ borderBottom: "1px solid #ddd", padding: "12px 24px", backgroundColor: "#2b3640" }}>...</nav>`

**Current Implementation:** `app/layout.tsx`

---

## Form Primitives

### FormField
**Visual Intent:** Groups label, input, and optional helper text into a cohesive unit. Creates consistent spacing and association between form elements.

**Where It Appears:**
- All form pages
- Pattern: 
  ```jsx
  <div style={{ marginBottom: 16 }}>
    <label>...</label>
    <input /> or <select />
    <p style={{ fontSize: 12, opacity: 0.7 }}>Helper text</p>
  </div>
  ```
- Consistent margin-bottom (16px) between fields

**Current Implementation:** Inline div wrappers

---

### Input
**Visual Intent:** Standard text input styling for form fields. Provides consistent appearance and interaction across all inputs.

**Where It Appears:**
- All form pages
- Pattern: `style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", fontSize: 14 }}`
- Consistent border color (#ccc) and padding (8px)

**Current Implementation:** Standard HTML inputs with inline styles

---

### Select
**Visual Intent:** Dropdown selection styling matching input fields. Maintains visual consistency with other form controls.

**Where It Appears:**
- Form pages: Module selection, group selection, slide type selection
- Pattern: Same as Input but with `<select>` element
- Includes placeholder option: `<option value="">Select...</option>`

**Current Implementation:** Standard HTML select with inline styles

---

### Textarea
**Visual Intent:** Multi-line text input for longer content. Uses same styling as inputs but with adjustable height.

**Where It Appears:**
- Edit-module: Description field
- Edit-slide: Raw JSON editing
- Pattern: Same as Input but with `rows={4}` or `rows={6}`

**Current Implementation:** Standard HTML textarea with inline styles

---

## Status Primitives

### LoadingState
**Visual Intent:** Indicates that content is being fetched or processed. Provides feedback during async operations.

**Where It Appears:**
- All pages with async data loading
- Pattern: `<p>Loading…</p>` or `<p>Loading slide…</p>`
- Simple text, no special styling

**Current Implementation:** Inline `<p>` elements

---

### StatusMessage
**Visual Intent:** Displays success or error feedback after operations. Provides immediate confirmation or error details.

**Where It Appears:**
- Form pages: After save operations
- Pattern: `<p style={{ marginTop: 16, color: message.includes("error") ? "red" : "green" }}>{message}</p>`
- Conditional coloring based on message content

**Current Implementation:** Inline `<p>` elements with conditional styling

---

## Summary Statistics

- **Total Primitives Identified:** 28
- **Page-Level:** 4 primitives
- **Section-Level:** 4 primitives  
- **Content:** 9 primitives
- **Action Zones:** 6 primitives
- **Navigation:** 1 primitive
- **Form:** 3 primitives
- **Status:** 2 primitives

**Components Already Abstracted:**
- `PageContainer` ✓
- `SectionCard` ✓
- `BackButton` ✓
- `Button` ✓

**Primitives Needing Abstraction:**
- 24 primitives currently implemented as inline styles or patterns

---

## Typography System

**Status:** Audit Complete — Normalization Pending  
**Purpose:** Establish consistent typographic roles to reduce cognitive load by creating predictable visual hierarchy and eliminating arbitrary font size variations.

### Typography Roles

| Role | Font Size | Font Weight | Use Cases | Current Examples |
|------|-----------|-------------|-----------|------------------|
| **PageTitle** | `24px` (1.5rem) | `400` (normal) | Main page heading (`<h1>`) | "CMS Dashboard", "Edit slide", "Create new lesson" |
| **SectionTitle** | `18px` (1.125rem) | `400` (normal) | Section headings (`<h2>`), section card titles, subsection headings | "Slide Type", "Placement", "title-slide editor", CEFR level titles |
| **FieldLabel** | `14px` (0.875rem) | `600` (semi-bold) | Form field labels, input labels | "Slide type", "Module", "Lesson slug", "Order index" |
| **MetaText** | `13px` (0.8125rem) | `400` (normal) | Technical metadata, helper text, IDs, slugs, secondary info | "Lesson id: lesson-123", "Grid view: CEFR → Modules", UUID displays, helper text below inputs |

### Typography Mapping

#### PageTitle (24px, weight 400)
**Current Usage:**
- ✅ `<h1>` elements in page headers: "CMS Dashboard", "Edit slide", "Create new lesson"
- ✅ Most pages use default browser h1 size (~32px) with `margin: 0`
- ⚠️ **Violation:** Lesson Slides page uses `fontSize: "1.75rem"` (28px) - should be normalized to 24px

**Proposed Standard:**
- Font size: `24px` (1.5rem)
- Font weight: `400` (normal)
- Element: `<h1>`
- Margin: `0` (handled by PageHeader wrapper)

---

#### SectionTitle (18px, weight 400)
**Current Usage:**
- ✅ SectionCard titles: `text-lg` (18px), `font-normal` (400) ✓
- ✅ Standalone `<h2>` elements: "Error", "ai-speak-repeat editor", "text-slide editor"
- ⚠️ **Violation:** Dashboard expandable row titles use inconsistent sizes:
  - Modules: `fontSize: 20px` (should be 18px)
  - Lessons: `fontSize: 18px` ✓
  - Groups: `fontSize: 16px` (should be 18px)
  - Slides: `fontSize: 12px` (should be 18px or MetaText)
- ⚠️ **Violation:** Group titles in lesson-slides use `fontWeight: 800` (too heavy) - should be 400
- ⚠️ **Violation:** `<h3>` elements used for subsections (e.g., "Lines", "Raw JSON") - no standard size

**Proposed Standard:**
- Font size: `18px` (1.125rem)
- Font weight: `400` (normal)
- Element: `<h2>` or equivalent
- Use for: Section card titles, subsection headings, expandable row titles

---

#### FieldLabel (14px, weight 600)
**Current Usage:**
- ✅ Form labels consistently use `fontSize: 14px`, `fontWeight: 600` ✓
- ✅ Margin-bottom: `6px` or `8px` (acceptable variation)
- ✅ Display: `block`
- ✅ Examples: "Slide type", "Module", "Lesson slug", "Order index", "Title", "Subtitle"

**Proposed Standard:**
- Font size: `14px` (0.875rem)
- Font weight: `600` (semi-bold)
- Element: `<label>`
- Margin-bottom: `6px` (standardized)
- Display: `block`

---

#### MetaText (13px, weight 400)
**Current Usage:**
- ✅ Technical metadata: `fontSize: 13px` ✓
  - "Lesson id: lesson-123"
  - "URL slide id: slide-123"
  - "UUID: slide-ai-001"
  - "Group UUID: group-123"
- ✅ Helper text: `fontSize: 12px` or `13px` with `opacity: 0.7` or `color: #666`
  - "Full slug will become: module/lesson-1"
  - "Type 'delete' to confirm"
- ✅ Dashboard meta: `fontSize: 13px` - "Grid view: CEFR → Modules → Lessons → Groups → Slides"
- ✅ Count badges: `fontSize: 13px` or `14px` - "{count} modules", "{count} lessons"
- ⚠️ **Violation:** Code blocks use `fontSize: 12px` - acceptable as technical display
- ⚠️ **Violation:** Slide type labels in lists use `fontSize: 12px` - could be MetaText or FieldLabel

**Proposed Standard:**
- Font size: `13px` (0.8125rem)
- Font weight: `400` (normal)
- Color: `#666` or `opacity: 0.7` (for reduced visual weight)
- Use for: IDs, slugs, UUIDs, helper text, technical metadata, count badges

---

### Typography Violations

#### Unclear Role Assignment

1. **Dashboard Expandable Row Titles**
   - **Current:** Modules (20px), Lessons (18px), Groups (16px), Slides (12px)
   - **Issue:** Inconsistent sizing creates visual confusion
   - **Proposed:** All use SectionTitle (18px, weight 400)
   - **Location:** `app/page.tsx` lines 494, 530, 655, 825, 886

2. **Group Titles in Lesson-Slides**
   - **Current:** `fontWeight: 800` (extra-bold)
   - **Issue:** Too heavy, creates visual noise
   - **Proposed:** SectionTitle (18px, weight 400)
   - **Location:** `app/lesson-slides/[lessonId]/page.tsx` line 501

3. **Standalone h2 Elements**
   - **Current:** Various sizes, some with `color: "red"` for errors
   - **Issue:** No consistent sizing for error headings vs. content headings
   - **Proposed:** SectionTitle (18px, weight 400) with conditional color
   - **Location:** Multiple pages (error states, editor headings)

4. **h3 Elements (Subsections)**
   - **Current:** Browser default size (~18px), used for "Lines", "Raw JSON", "Raw slide"
   - **Issue:** No explicit standard
   - **Proposed:** SectionTitle (18px, weight 400) or create SubsectionTitle role
   - **Location:** Debug pages, preview pages

5. **Helper Text Below Inputs**
   - **Current:** `fontSize: 12px` with `opacity: 0.7`
   - **Issue:** Smaller than MetaText standard
   - **Proposed:** MetaText (13px, weight 400) with reduced opacity
   - **Location:** Form pages (new-lesson, edit-lesson, etc.)

6. **Button Text**
   - **Current:** `fontSize: 14px` (primary actions), `fontSize: 13px` (inline actions), `fontSize: 12px` (small buttons)
   - **Issue:** Not a content typography role - belongs to action system
   - **Proposed:** Keep as-is (action system concern, not typography)
   - **Note:** Documented but not a violation of typography system

7. **Code Blocks (pre elements)**
   - **Current:** `fontSize: 12px`
   - **Issue:** Technical display, not content typography
   - **Proposed:** Keep as-is (monospace display concern)
   - **Note:** Documented but acceptable as technical display

8. **Empty States**
   - **Current:** `fontSize: 12px` to `16px` depending on context
   - **Issue:** No clear role assignment
   - **Proposed:** MetaText (13px, weight 400) with reduced opacity
   - **Location:** Dashboard empty states, form empty states

9. **Status Messages (Success/Error)**
   - **Current:** Various sizes, conditional colors
   - **Issue:** No typography role assigned
   - **Proposed:** MetaText (13px, weight 400) with conditional color
   - **Location:** Form pages after save operations

10. **Lesson Title in Lesson-Slides**
    - **Current:** `<h2>` with `margin: 0`, no explicit fontSize
    - **Issue:** Browser default size, not standardized
    - **Proposed:** SectionTitle (18px, weight 400)
    - **Location:** `app/lesson-slides/[lessonId]/page.tsx` line 454

---

### Typography Normalization Benefits

**Why This Reduces Cognitive Load:**

By establishing four clear typographic roles with consistent sizing and weight, users can instantly recognize information hierarchy without consciously processing font size variations, allowing their attention to focus on content meaning rather than visual parsing.

**Specific Benefits:**
1. **Predictable Hierarchy:** Users learn the system once - PageTitle > SectionTitle > FieldLabel > MetaText
2. **Reduced Visual Noise:** Eliminates arbitrary size variations (20px vs 18px vs 16px) that create confusion
3. **Faster Scanning:** Consistent weights (400 for titles, 600 for labels) create clear visual anchors
4. **Accessibility:** Consistent sizing improves readability and screen reader navigation
5. **Developer Clarity:** Clear roles eliminate "what size should this be?" decisions

---

## Phase 4: Button Placement Rules

**Status:** Rule Definition (Not Yet Implemented)  
**Purpose:** Eliminate floating buttons that trigger ADHD/attention issues by establishing strict placement constraints.

### Button Placement Rules

**Going Forward (Do NOT implement yet):**

Buttons may only exist in **3 designated zones**:

#### 1. PageActions (Bottom of Page)
**Location:** At the bottom of the page, outside any sections, within PageContainer  
**Use Cases:** Primary page-level actions that affect the entire page
- "Save changes" for entire forms
- "Create [entity]" for new entity pages
- Page-level submit actions

**Visual Pattern:**
- Appears after all content sections
- Right-aligned or centered
- Uses primary button styling
- May include status messages above button

**Current Violations:**
- ✅ Most form pages already follow this pattern
- ⚠️ Some buttons appear mid-form (should move to bottom)

---

#### 2. SectionFooter (Inside Bordered Box)
**Location:** Within a CmsSection/SectionCard, at the bottom of the section  
**Use Cases:** Actions that operate on a specific section's content
- "Save changes" within a section editor
- "Save JSON" for raw JSON sections
- Section-specific submit actions

**Visual Pattern:**
- Inside CmsSection border
- Separated from body content (margin-top: 24px, optional border-top)
- Right-aligned
- Uses primary button styling

**Current Examples:**
- ✅ Edit-slide: "Save changes" buttons in title-slide editor, text-slide editor sections
- ✅ Edit-slide: "Save JSON" buttons in raw JSON sections

**Current Violations:**
- ⚠️ Some sections have buttons inline with content (should move to footer)

---

#### 3. InlineActions (Small, Right-Aligned, Contextual)
**Location:** Within content rows/lists, right-aligned, small size  
**Use Cases:** Quick actions on specific items without leaving the current view
- "edit" links next to modules/lessons/groups/slides
- "manage" links for lessons
- "Rename" buttons in group headers
- Delete buttons (trash icon) next to items

**Visual Pattern:**
- Small size: `fontSize: 12px` or `13px`
- Small padding: `6px 12px`
- Right-aligned within flex container
- Often grouped with other inline actions
- Uses secondary or danger styling

**Current Examples:**
- ✅ Dashboard: "edit", "manage", delete buttons in module/lesson rows
- ✅ Lesson-slides: "Edit" links, "Rename" buttons, delete buttons
- ✅ SectionCard actions: Header-level actions (e.g., "+ Add Module")

**Current Violations:**
- ⚠️ Some buttons float in middle of content areas
- ⚠️ Some primary actions appear inline when they should be in PageActions or SectionFooter

---

### Button Placement Violations (Current State)

**Floating Buttons to Eliminate:**

1. **Mid-Form Buttons**
   - **Location:** Buttons appearing between form fields
   - **Fix:** Move to PageActions (bottom of page)
   - **Examples:** None currently identified (most forms already follow pattern)

2. **Inline Primary Actions**
   - **Location:** Primary-styled buttons appearing inline with content
   - **Fix:** Move to PageActions or SectionFooter
   - **Examples:** Review edit-slide page for any inline primary buttons

3. **Randomly Placed Secondary Actions**
   - **Location:** Action buttons without clear contextual placement
   - **Fix:** Move to InlineActions zone (right-aligned, grouped)
   - **Examples:** Review all pages for floating action buttons

---

### Button Placement Benefits

**Why This Reduces ADHD Triggers:**

By constraining buttons to three predictable zones, users can quickly locate actions without scanning the entire page, reducing decision fatigue and visual overwhelm that triggers attention issues.

**Specific Benefits:**
1. **Predictable Location:** Users know where to look for actions (bottom of page, bottom of section, or right side of rows)
2. **Reduced Visual Clutter:** No floating buttons competing for attention
3. **Clear Hierarchy:** Primary actions (PageActions/SectionFooter) vs. contextual actions (InlineActions)
4. **Faster Task Completion:** Less time spent searching for action buttons
5. **Reduced Cognitive Load:** Fewer visual elements to process = less mental overhead

---

## Button Placement Analysis

**Status:** Complete Audit — Implementation Pending  
**Purpose:** Categorize all buttons across the CMS and identify placement violations to establish consistent button zones.

### Button Categories

#### PageAction
**Definition:** Primary page-level actions that affect the entire page or complete a top-level form.

**Standard Location:** Bottom of PageContainer, after all content sections, right-aligned or centered.

**Visual Characteristics:**
- Font size: `14px`
- Padding: `8px 16px`
- Primary color: `#9bbfb2` (with hover `#8aaea1`)
- Border radius: `6px`
- Typically `type="submit"` for forms

**Current Instances:**
- ✅ `edit-lesson`: "Save changes" - bottom of form, correct placement
- ✅ `edit-module`: "Save changes" - bottom of form, correct placement
- ✅ `edit-group`: "Save changes" - bottom of form, correct placement
- ✅ `new-lesson`: "Create lesson" - bottom of form, correct placement
- ✅ `new-module`: "Create module" - bottom of form, correct placement
- ✅ `new-group`: "Create group" - bottom of form, correct placement
- ✅ `new-slide`: "Create slide" - bottom of form, correct placement
- ✅ `new-slide-ai`: "Create slide" - bottom of form, correct placement
- ✅ `edit-slide-ai`: "Save title" - bottom of form, correct placement

**Violations:** None identified for PageAction category.

---

#### SectionAction
**Definition:** Actions that operate on a specific section's content, typically saving or submitting data within a bounded section.

**Standard Location:** CmsSectionFooter (inside SectionCard/Section border), separated from body content with margin-top: 24px, right-aligned.

**Visual Characteristics:**
- Font size: `14px`
- Padding: `8px 16px` (primary) or `6px 12px` (secondary)
- Primary color: `#9bbfb2` (with hover `#8aaea1`)
- Border radius: `4px` or `6px`
- May include status messages above button

**Current Instances:**
- ✅ `edit-slide`: "Save changes" in "title-slide editor" SectionCard - inside section, correct placement
- ✅ `edit-slide`: "Save changes" in "text-slide editor" SectionCard - inside section, correct placement
- ✅ `edit-slide`: "Save changes" in "Raw JSON editor" SectionCard - inside section, correct placement
- ✅ `edit-slide`: "Save JSON" buttons (4 instances) - inside raw JSON SectionCard, correct placement

**Violations:** None identified for SectionAction category.

---

#### InlineAction
**Definition:** Small, contextual actions that operate on specific items within lists or rows without leaving the current view.

**Standard Location:** Right-aligned within content rows/lists, grouped with other inline actions, small size.

**Visual Characteristics:**
- Font size: `12px` or `13px`
- Padding: `6px 12px` (small)
- Primary color: `#9bbfb2` (with hover `#8aaea1`) or secondary `#a6a198`
- Border radius: `6px`
- Often grouped in flex containers with `gap: 8px` or `gap: 12px`

**Current Instances:**

**Dashboard (app/page.tsx):**
- ✅ "+ Add Module" link - SectionCard header actions, correct placement
- ✅ "+ Add Lesson" link - module row, right-aligned, correct placement
- ✅ "edit" link - module row, right-aligned, correct placement
- ✅ "edit" link - lesson row, right-aligned, correct placement
- ✅ "manage" link - lesson row, right-aligned, correct placement
- ✅ "JSON" link - lesson row, right-aligned, correct placement
- ✅ "player" link - lesson row, right-aligned, correct placement
- ✅ "edit" link - group row, right-aligned, correct placement
- ✅ Expand/Collapse buttons (▾/▸) - left-aligned in rows, acceptable (UI control, not action)

**Lesson-Slides (app/lesson-slides/[lessonId]/page.tsx):**
- ⚠️ "+ Add group" Button - top of page (margin: "16px 0"), **VIOLATION** - should be PageAction or InlineAction in header
- ⚠️ "Preview in Player" link - top of page (margin: "16px 0"), **VIOLATION** - should be InlineAction in header or PageAction
- ✅ "Rename" Button - group header, right-aligned, correct placement
- ✅ "+ Add slide" dropdown - group header, right-aligned, correct placement
- ✅ "Edit" Link - slide row, right-aligned, correct placement

**Edit-Slide (app/edit-slide/[slideId]/page.tsx):**
- ⚠️ "▶ Raw props_json" toggle button - inside SectionCard body, **VIOLATION** - should be in SectionCard header or separate toggle area

**Violations:**
1. **lesson-slides**: "+ Add group" and "Preview in Player" at top of page - should move to PageActions zone or InlineActions in header
2. **edit-slide**: Raw JSON toggle button in body - should be in SectionCard header or separate toggle control area

---

#### DestructiveAction
**Definition:** Actions that permanently delete or remove data, requiring careful consideration.

**Standard Location:** InlineActions zone (right-aligned in rows) OR ModalActions (in confirmation dialogs).

**Visual Characteristics:**
- Font size: `14px` (modal) or `12px-14px` (inline)
- Padding: `8px 12px` (inline) or `8px 16px` (modal)
- Danger color: `#bf6f6f` (with hover `#ad5f5f`) or `#d32f2f` (modal confirm)
- Border radius: `6px`
- Often includes trash icon (SVG)
- May be disabled during operation

**Current Instances:**

**Dashboard (app/page.tsx):**
- ✅ Delete module button - module row, right-aligned, correct placement (triggers modal)
- ✅ Delete lesson button - lesson row, right-aligned, correct placement (triggers modal)
- ✅ Modal "Cancel" button - modal footer, right-aligned, correct placement
- ✅ Modal "Delete" button - modal footer, right-aligned, correct placement (red `#d32f2f`)

**Lesson-Slides (app/lesson-slides/[lessonId]/page.tsx):**
- ✅ Delete slide button - slide row, right-aligned, correct placement (inline, danger variant)
- ✅ Delete slide button - ungrouped slides, right-aligned, correct placement
- ✅ Delete slide button - unknown groups, right-aligned, correct placement

**Violations:** None identified for DestructiveAction category - all properly placed in InlineActions or ModalActions zones.

---

### Button Placement Violations Summary

#### Critical Violations (Must Fix)

1. **lesson-slides: "+ Add group" Button**
   - **Current:** Top of page (`margin: "16px 0"`), before content
   - **Issue:** Floating button not in designated zone
   - **Proposed:** Move to PageActions zone (bottom of page) OR move to InlineActions in page header area
   - **Location:** `app/lesson-slides/[lessonId]/page.tsx` line 463

2. **lesson-slides: "Preview in Player" Link**
   - **Current:** Top of page (`margin: "16px 0"`), grouped with "+ Add group"
   - **Issue:** Floating action not in designated zone
   - **Proposed:** Move to PageActions zone (bottom of page) OR move to InlineActions in page header area
   - **Location:** `app/lesson-slides/[lessonId]/page.tsx` line 465

3. **edit-slide: Raw JSON Toggle Button**
   - **Current:** Inside SectionCard body, at top of section content
   - **Issue:** Toggle control mixed with content, not clearly an action
   - **Proposed:** Move to SectionCard header actions OR create separate toggle control area above section
   - **Location:** `app/edit-slide/[slideId]/page.tsx` line 811 (multiple instances)

#### Minor Violations (Consider Fixing)

4. **Dashboard: Expand/Collapse Buttons**
   - **Current:** Left-aligned in expandable rows
   - **Issue:** Buttons but function as UI controls, not actions
   - **Proposed:** Acceptable as-is (UI control pattern, not action button)
   - **Note:** These are interaction controls, not action buttons, so placement is acceptable

---

### Proposed Standard Locations

#### PageActions Zone
**Location:** Bottom of PageContainer, after all content sections  
**Layout:** Right-aligned or centered, with optional status message above  
**Spacing:** `margin-top: 24px` from last content section  
**Use For:**
- Form submit buttons ("Save changes", "Create [entity]")
- Page-level primary actions
- Actions that affect entire page content

**Example Structure:**
```jsx
<PageContainer>
  {/* All content sections */}
  
  {/* PageActions Zone */}
  <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
    <Button type="submit">Save changes</Button>
  </div>
  
  {/* Optional status message */}
  {message && <StatusMessage message={message} />}
</PageContainer>
```

---

#### SectionFooter Zone (CmsSection)
**Location:** Inside CmsSection/SectionCard, at bottom of section  
**Layout:** Right-aligned, separated from body with `margin-top: 24px`, optional `border-top: "1px solid #ddd"`  
**Spacing:** `padding-top: 16px` if border-top present  
**Use For:**
- Section-specific save buttons ("Save changes", "Save JSON")
- Actions that operate on section content only
- Section-level status messages

**Example Structure:**
```jsx
<SectionCard title="Section Title">
  {/* Section body content */}
  
  {/* SectionFooter Zone */}
  <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
    <Button type="submit">Save changes</Button>
  </div>
  
  {/* Optional status message */}
  {saveMessage && <StatusMessage message={saveMessage} />}
</SectionCard>
```

---

#### InlineActions Zone
**Location:** Right-aligned within content rows/lists, grouped horizontally  
**Layout:** Flex container with `gap: 8px` or `gap: 12px`, right-aligned  
**Spacing:** No additional margin (inherits from row padding)  
**Use For:**
- Quick edit/manage links
- Contextual actions on list items
- Delete buttons (DestructiveAction variant)
- Add actions in headers ("+ Add Module", "+ Add Lesson")
- Rename/Edit actions in group headers

**Example Structure:**
```jsx
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div>{item.title}</div>
  
  {/* InlineActions Zone */}
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <Link href={`/edit/${id}`}>Edit</Link>
    <Button variant="danger" size="small">Delete</Button>
  </div>
</div>
```

---

#### ModalActions Zone
**Location:** Inside modal dialogs, at bottom of modal content  
**Layout:** Right-aligned, flex container with `gap: 8px`  
**Spacing:** `margin-top: 16px` from modal content  
**Use For:**
- Cancel buttons (white background, border)
- Confirm buttons (primary or danger color)
- Destructive action confirmations

**Example Structure:**
```jsx
<div style={{ /* modal container */ }}>
  {/* Modal content */}
  
  {/* ModalActions Zone */}
  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    <Button variant="danger" onClick={onConfirm}>Delete</Button>
  </div>
</div>
```

---

### Button Placement Rules Summary

| Category | Location | Alignment | Size | Examples |
|----------|----------|-----------|------|----------|
| **PageAction** | Bottom of PageContainer | Right/Center | Standard (14px, 8px 16px) | "Save changes", "Create lesson" |
| **SectionAction** | CmsSectionFooter | Right | Standard (14px, 8px 16px) | "Save changes" in section, "Save JSON" |
| **InlineAction** | Right side of rows/lists | Right | Small (12-13px, 6px 12px) | "edit", "manage", "Rename", "+ Add" |
| **DestructiveAction** | InlineActions or ModalActions | Right | Small (12-14px) | Delete buttons, modal confirms |

### Violation Count

- **Total Buttons Audited:** ~50+ buttons across 12 pages
- **PageAction Violations:** 0
- **SectionAction Violations:** 0
- **InlineAction Violations:** 3 (lesson-slides: 2, edit-slide: 1)
- **DestructiveAction Violations:** 0

### Migration Priority

1. **High Priority:** Fix lesson-slides page floating buttons (affects user workflow)
2. **Medium Priority:** Fix edit-slide Raw JSON toggle placement (affects section clarity)
3. **Low Priority:** Document expand/collapse buttons as UI controls (not violations)

---

## CMS Page Archetypes

**Status:** Complete Analysis — Implementation Pending  
**Purpose:** Define standard page layout patterns to ensure consistent structure across all CMS pages. Each archetype specifies the order and placement of PageHeader, PageMeta, CmsSection, and PageActions components.

### Archetype Overview

| Archetype | Pages | Primary Purpose | Key Characteristics |
|-----------|-------|-----------------|---------------------|
| **Dashboard/Grid View** | `page.tsx` | Overview and navigation | Expandable hierarchy, no PageActions |
| **Form Create** | `new-*` pages | Create new entities | Single form, PageActions at bottom |
| **Form Edit** | `edit-*` pages | Edit existing entities | Multiple sections, PageActions or SectionActions |
| **List/Management** | `lesson-slides`, `modules-browser`, `slides-browser` | Manage collections | Repeating sections, InlineActions |
| **Preview/Display** | `lesson-preview`, `real-slide`, `mock-slide`, `db-slide-test` | View data | Read-only display, no actions |
| **Debug/Test** | `debug-tables`, `test-db`, `db-slide-rename` | Development tools | Minimal structure, diagnostic info |

---

### Archetype 1: Dashboard/Grid View

**Purpose:** Provides hierarchical overview of CMS content structure with expandable/collapsible sections.

**Pages:**
- `app/page.tsx` (CMS Dashboard)

**Standard Layout Order:**

```
┌─────────────────────────────────────────┐
│ PageHeader                              │
│ ┌─────────────────────────────────────┐ │
│ │ <h1>CMS Dashboard</h1>            │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageContainer                           │
│ ┌─────────────────────────────────────┐ │
│ │ PageMeta                            │ │
│ │ "Grid view: CEFR → Modules → ..."  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (CEFR Level A0)          │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionHeader                  │ │ │
│ │ │ Title: "A0"                    │ │ │
│ │ │ Actions: "+ Add Module"        │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionBody                    │ │ │
│ │ │ - Expand/Collapse button       │ │ │
│ │ │ - Module rows (expandable)     │ │ │
│ │ │   - Lesson rows (expandable)   │ │ │
│ │ │     - Group rows (expandable)   │ │ │
│ │ │       - Slide rows              │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (CEFR Level A1)          │ │
│ │ ... (same structure)                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ... (repeating for A2, B1, B2, C1, C2) │
└─────────────────────────────────────────┘
```

**Key Characteristics:**
- **PageHeader:** Required, displays "CMS Dashboard"
- **PageBackButtonRow:** Not present (dashboard is entry point)
- **PageMeta:** Required, explains grid structure
- **CmsSection:** Repeating (one per CEFR level), contains nested expandable content
- **PageActions:** Not present (actions are InlineActions within sections)
- **Modal Dialogs:** May appear for delete confirmations (overlay, not part of layout)

**Component Mapping:**
- PageHeader: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><h1>CMS Dashboard</h1></div>`
- PageMeta: `<div style={{ fontSize: 13, marginTop: 16, marginBottom: 24 }}>Grid view: ...</div>`
- CmsSection: `SectionCard` component with `title` and `actions` props
- SectionBody: Expandable hierarchy with InlineActions in rows

---

### Archetype 2: Form Create

**Purpose:** Create new entities (lessons, modules, groups, slides) via form submission.

**Pages:**
- `app/new-lesson/page.tsx`
- `app/new-module/page.tsx`
- `app/new-group/page.tsx`
- `app/new-slide/page.tsx`
- `app/new-slide-ai/page.tsx`

**Standard Layout Order:**

```
┌─────────────────────────────────────────┐
│ PageHeader                              │
│ ┌─────────────────────────────────────┐ │
│ │ <h1>Create new [entity]</h1>        │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageBackButtonRow                       │
│ ┌─────────────────────────────────────┐ │
│ │ <BackButton title="Back to ..." /> │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageContainer (maxWidth: "md")          │
│ ┌─────────────────────────────────────┐ │
│ │ Error State (if loadError)          │ │
│ │ <p style={{ color: "red" }}>...</p>│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ <form onSubmit={handleSubmit}>      │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ Form Fields                    │ │ │
│ │ │ - Label + Input/Select/Textarea │ │ │
│ │ │ - Label + Input/Select/Textarea │ │ │
│ │ │ ...                            │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │                                     │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ PageActions (inside form)        │ │ │
│ │ │ <Button type="submit">          │ │ │
│ │ │   Create [entity]               │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Status Message (if message)         │ │
│ │ <p style={{ color: "..." }}>...</p>│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Created Entity Display (optional)    │ │
│ │ <h2>Created [entity]</h2>           │ │
│ │ <pre>{JSON.stringify(...)}</pre>   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Key Characteristics:**
- **PageHeader:** Required, displays "Create new [entity]"
- **PageBackButtonRow:** Required, links back to dashboard
- **PageMeta:** Not present (no metadata needed)
- **CmsSection:** Not present (form fields are direct children of form)
- **PageActions:** Required, single submit button at bottom of form
- **Status Messages:** Appear after form, before created entity display

**Component Mapping:**
- PageHeader: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><h1>Create new [entity]</h1></div>`
- PageBackButtonRow: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><BackButton /></div>`
- PageActions: `<Button type="submit">Create [entity]</Button>` inside form, at bottom

**Variations:**
- `new-slide-ai`: Includes conditional form fields based on slide type
- All pages: May show created entity JSON after successful creation

---

### Archetype 3: Form Edit

**Purpose:** Edit existing entities with multiple sections for different aspects of the entity.

**Pages:**
- `app/edit-lesson/[lessonId]/page.tsx`
- `app/edit-module/[moduleId]/page.tsx`
- `app/edit-group/[groupId]/page.tsx`
- `app/edit-slide/[slideId]/page.tsx`
- `app/edit-slide-ai/page.tsx`

**Standard Layout Order:**

```
┌─────────────────────────────────────────┐
│ PageHeader                              │
│ ┌─────────────────────────────────────┐ │
│ │ <h1>Edit [entity]</h1>             │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageBackButtonRow                       │
│ ┌─────────────────────────────────────┐ │
│ │ <BackButton title="Back to ..." /> │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageContainer (maxWidth: "md" or 720)   │
│ ┌─────────────────────────────────────┐ │
│ │ PageMeta                            │ │
│ │ <p>URL [entity] id: <code>...</code>│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Loading/Error State                 │ │
│ │ (if status === "loading" | "error") │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (Basic Info)              │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionHeader                   │ │ │
│ │ │ Title: "Slide Type" or "Details"│ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionBody                    │ │ │
│ │ │ - Form fields                  │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (Placement/Relations)    │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionHeader                   │ │ │
│ │ │ Title: "Placement"              │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionBody                    │ │ │
│ │ │ - Group selection               │ │ │
│ │ │ - Order index                   │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (Type-Specific Editor)    │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionHeader                   │ │ │
│ │ │ Title: "[type] editor"          │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionBody                    │ │ │
│ │ │ - Type-specific form fields     │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionFooter                   │ │ │
│ │ │ <Button type="submit">          │ │ │
│ │ │   Save changes                  │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (Raw JSON - Optional)    │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionBody                    │ │ │
│ │ │ - Toggle button                 │ │ │
│ │ │ - Textarea (if expanded)        │ │ │
│ │ │ - SectionFooter: "Save JSON"     │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ PageActions (Alternative Pattern)    │ │
│ │ (if no SectionFooter)                │ │
│ │ <Button type="submit">Save changes</>│ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Key Characteristics:**
- **PageHeader:** Required, displays "Edit [entity]"
- **PageBackButtonRow:** Required, links back to dashboard
- **PageMeta:** Required, shows entity ID (e.g., "URL slide id: slide-123")
- **CmsSection:** Repeating (2-4 sections typical), each with distinct purpose
- **PageActions OR SectionActions:** 
  - Pattern A: SectionActions in each CmsSection (edit-slide pattern)
  - Pattern B: Single PageActions at bottom (edit-lesson, edit-module pattern)
- **Loading/Error States:** Shown before sections, replace content when present

**Component Mapping:**
- PageHeader: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><h1>Edit [entity]</h1></div>`
- PageBackButtonRow: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><BackButton /></div>`
- PageMeta: `<p>URL [entity] id: <code>{id}</code></p>`
- CmsSection: `SectionCard` component with `title` prop
- SectionActions: `<Button type="submit">Save changes</Button>` in SectionFooter
- PageActions: `<Button type="submit">Save changes</Button>` at bottom of PageContainer

**Variations:**
- `edit-slide`: Uses SectionActions pattern (save button in each section)
- `edit-lesson`, `edit-module`, `edit-group`: Use PageActions pattern (single save at bottom)
- `edit-slide`: Includes optional Raw JSON section with toggle
- All pages: May show status messages after actions

---

### Archetype 4: List/Management

**Purpose:** Manage collections of related entities with inline actions and hierarchical display.

**Pages:**
- `app/lesson-slides/[lessonId]/page.tsx`
- `app/modules-browser/page.tsx`
- `app/slides-browser/page.tsx`

**Standard Layout Order:**

```
┌─────────────────────────────────────────┐
│ PageHeader                              │
│ ┌─────────────────────────────────────┐ │
│ │ <h1>[Page Title]</h1>              │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageBackButtonRow                       │
│ ┌─────────────────────────────────────┐ │
│ │ <BackButton title="Back to ..." /> │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageContainer (maxWidth: "lg" or none)  │
│ ┌─────────────────────────────────────┐ │
│ │ PageMeta (Optional)                  │ │
│ │ <h2>{entity.title}</h2>             │ │
│ │ <p>Entity id: <code>...</code></p>  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ PageActions (Top-Level Actions)      │ │
│ │ <Button>+ Add group</Button>        │ │
│ │ <a>Preview in Player</a>            │ │
│ │ (Note: Currently violates rules)     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (Group/Collection 1)     │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionHeader                   │ │ │
│ │ │ Title: "{group.title}"          │ │ │
│ │ │ Actions: "Rename", "+ Add slide" │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionBody                    │ │ │
│ │ │ - List of items                │ │ │
│ │ │   - Each item with InlineActions│ │ │
│ │ │     "Edit", "Delete"            │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (Group/Collection 2)     │ │
│ │ ... (same structure)                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (Ungrouped Items)        │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionHeader                   │ │ │
│ │ │ Title: "Ungrouped [items]"      │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionBody                    │ │ │
│ │ │ - List with InlineActions       │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Key Characteristics:**
- **PageHeader:** Required, displays page title
- **PageBackButtonRow:** Required, links back to dashboard
- **PageMeta:** Optional, shows entity context (title, ID)
- **PageActions:** Present but currently violates placement rules (should be at bottom or in header)
- **CmsSection:** Repeating (one per group/collection), contains lists with InlineActions
- **InlineActions:** Right-aligned in list rows ("Edit", "Delete", "Rename", "+ Add slide")

**Component Mapping:**
- PageHeader: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><h1>[Title]</h1></div>`
- PageBackButtonRow: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><BackButton /></div>`
- PageMeta: `<h2>{title}</h2><p>Entity id: <code>{id}</code></p>`
- CmsSection: `SectionCard` or `<section>` with border, contains group/collection
- InlineActions: Links and buttons in flex container, right-aligned in rows

**Variations:**
- `lesson-slides`: Groups slides by lesson groups, shows ungrouped slides separately
- `modules-browser`: Shows modules with nested lessons (simpler hierarchy)
- `slides-browser`: Shows lessons → groups → slides (deepest hierarchy)
- All pages: May show loading/error states before sections

**Known Violations:**
- `lesson-slides`: "+ Add group" and "Preview in Player" buttons at top (should be PageActions at bottom or InlineActions in header)

---

### Archetype 5: Preview/Display

**Purpose:** Display entity data in read-only format, typically for debugging or preview purposes.

**Pages:**
- `app/lesson-preview/[lessonId]/page.tsx`
- `app/real-slide/page.tsx`
- `app/mock-slide/[slide]/page.tsx`
- `app/db-slide-test/page.tsx`

**Standard Layout Order:**

```
┌─────────────────────────────────────────┐
│ PageHeader                              │
│ ┌─────────────────────────────────────┐ │
│ │ <h1>[Page Title]</h1>              │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageBackButtonRow                       │
│ ┌─────────────────────────────────────┐ │
│ │ <BackButton /> or <BackLink />     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageContainer (maxWidth: varies)        │
│ ┌─────────────────────────────────────┐ │
│ │ PageMeta                            │ │
│ │ <p>Entity id: <code>...</code></p> │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Loading/Error State                 │ │
│ │ (if status === "loading" | "error") │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (Content Display)        │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionHeader                   │ │ │
│ │ │ Title: "{entity.title}"         │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionBody                    │ │ │
│ │ │ - Formatted content             │ │ │
│ │ │ - Lists, paragraphs              │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CmsSection (Raw JSON)               │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionHeader                   │ │ │
│ │ │ Title: "Raw JSON" or "Raw data" │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ SectionBody                    │ │ │
│ │ │ <pre>{JSON.stringify(...)}</pre>│ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ (No PageActions - read-only)             │
└─────────────────────────────────────────┘
```

**Key Characteristics:**
- **PageHeader:** Required, displays page title
- **PageBackButtonRow:** Required, links back to dashboard
- **PageMeta:** Required, shows entity ID or context
- **CmsSection:** 1-2 sections typical (content display, raw JSON)
- **PageActions:** Not present (read-only pages)
- **Loading/Error States:** Shown before content sections

**Component Mapping:**
- PageHeader: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><h1>[Title]</h1></div>`
- PageBackButtonRow: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><BackButton /></div>` or `<BackLink />`
- PageMeta: `<p>Entity id: <code>{id}</code></p>` or similar
- CmsSection: `SectionCard` or `<section>` with border, contains formatted display
- Raw JSON: `<pre style={{ fontSize: 12 }}>{JSON.stringify(...)}</pre>`

**Variations:**
- `lesson-preview`: Shows full lesson JSON structure
- `real-slide`, `mock-slide`: Shows formatted slide content + raw JSON
- `db-slide-test`: Shows validation result + formatted content + raw DB data
- All pages: May show validation errors in error state

---

### Archetype 6: Debug/Test

**Purpose:** Development and diagnostic pages for testing database connections and data structures.

**Pages:**
- `app/debug-tables/page.tsx`
- `app/test-db/page.tsx`
- `app/db-slide-rename/page.tsx`

**Standard Layout Order:**

```
┌─────────────────────────────────────────┐
│ PageHeader                              │
│ ┌─────────────────────────────────────┐ │
│ │ <h1>[Page Title]</h1>              │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageBackButtonRow                       │
│ ┌─────────────────────────────────────┐ │
│ │ <BackButton /> or <BackLink />     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PageContainer                           │
│ ┌─────────────────────────────────────┐ │
│ │ Minimal Content                     │ │
│ │ - Simple text                       │ │
│ │ - Error messages                    │ │
│ │ - Raw data display                  │ │
│ │ - Diagnostic information            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ (No PageMeta, CmsSection, or PageActions│
│  - minimal structure for dev tools)     │
└─────────────────────────────────────────┘
```

**Key Characteristics:**
- **PageHeader:** Required, displays page title
- **PageBackButtonRow:** Required, links back to dashboard
- **PageMeta:** Not present (minimal structure)
- **CmsSection:** Not present (direct content in PageContainer)
- **PageActions:** Not present (no user actions)
- **Content:** Minimal, diagnostic-focused (text, errors, raw data)

**Component Mapping:**
- PageHeader: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><h1>[Title]</h1></div>`
- PageBackButtonRow: `<div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><BackButton /></div>` or `<BackLink />`
- Content: Direct children of PageContainer (no sections)

**Variations:**
- `debug-tables`: Placeholder page ("OK")
- `test-db`: Shows Supabase connection test results (success/error)
- `db-slide-rename`: May include form for renaming (if implemented)

---

### Archetype Assignment Summary

| Page | Archetype | Notes |
|------|-----------|-------|
| `app/page.tsx` | Dashboard/Grid View | Entry point, no back button |
| `app/new-lesson/page.tsx` | Form Create | Standard create form |
| `app/new-module/page.tsx` | Form Create | Standard create form |
| `app/new-group/page.tsx` | Form Create | Standard create form |
| `app/new-slide/page.tsx` | Form Create | Standard create form |
| `app/new-slide-ai/page.tsx` | Form Create | Conditional fields |
| `app/edit-lesson/[lessonId]/page.tsx` | Form Edit | PageActions pattern |
| `app/edit-module/[moduleId]/page.tsx` | Form Edit | PageActions pattern |
| `app/edit-group/[groupId]/page.tsx` | Form Edit | PageActions pattern |
| `app/edit-slide/[slideId]/page.tsx` | Form Edit | SectionActions pattern, multiple sections |
| `app/edit-slide-ai/page.tsx` | Form Edit | Simplified edit form |
| `app/lesson-slides/[lessonId]/page.tsx` | List/Management | Groups slides, has violations |
| `app/modules-browser/page.tsx` | List/Management | Simple module/lesson list |
| `app/slides-browser/page.tsx` | List/Management | Deep hierarchy display |
| `app/lesson-preview/[lessonId]/page.tsx` | Preview/Display | JSON preview |
| `app/real-slide/page.tsx` | Preview/Display | Formatted + raw display |
| `app/mock-slide/[slide]/page.tsx` | Preview/Display | Mock data display |
| `app/db-slide-test/page.tsx` | Preview/Display | Validation + display |
| `app/debug-tables/page.tsx` | Debug/Test | Minimal placeholder |
| `app/test-db/page.tsx` | Debug/Test | Connection test |
| `app/db-slide-rename/page.tsx` | Debug/Test | Diagnostic tool |

---

## Notes

- Most primitives use consistent spacing values: 8px, 12px, 16px, 24px
- Color palette is centralized in `lib/uiTokens.ts` but not fully utilized
- Border colors: #ddd (main borders), #eee (subtle dividers), #ccc (form inputs)
- Font sizes: 12px (small), 13px (meta), 14px (standard), 16px (medium), 18px (large), 20px (larger), 24px (page titles)
- Border radius: 4px (inputs), 6px (buttons), 8px (cards/modals)
- Opacity values: 0.6 (subtle), 0.7 (helper text, disabled), 1.0 (full)

