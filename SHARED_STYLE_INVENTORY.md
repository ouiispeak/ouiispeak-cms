# Shared Style Inventory Report
## ouiispeak-cms Codebase Analysis

**Date:** Analysis Only - No Changes Made  
**Scope:** `app/**/page.tsx` and `components/**`  
**Method:** Pattern identification across inline styles and structural patterns

---

## A) Page Layout Patterns

### Main Container
**Pattern:** `<main style={{ padding: 24 }}>`
- **Files:** All 21 page.tsx files
- **Variations:**
  - `padding: 24` (most common)
  - `padding: 24, maxWidth: 720` (edit/new forms: edit-slide, edit-lesson, edit-module, edit-group, new-slide, new-lesson, new-module, new-group, new-slide-ai)
  - `padding: 24, maxWidth: 900` (lesson-slides)
  - `padding: 24, maxWidth: 600` (edit-slide-ai)
  - `padding: 24, maxWidth: 980` (lesson-preview)
  - `padding: 24, width: "90vw"` (page.tsx dashboard)

### Page Header Section
**Pattern:** `<header style={{ marginBottom: 24 }}>` or `<div style={{ marginBottom: 16 }}>`
- **Files:** page.tsx, lesson-slides
- **Common:** Margin bottom 16-24px after h1

### Back Button Container
**Pattern:** `<div style={{ padding: "16px 24px 0 24px" }}>`
- **Files:** All pages (via BackButton component or inline in server components)
- **Note:** Already componentized as `BackButton.tsx`

---

## B) Typography Patterns

### Page Title (h1)
**Pattern:** Default h1 styling (from globals.css: `fontSize: 2.5rem, fontWeight: 400`)
- **Files:** All pages
- **Variations:**
  - `fontSize: "1.75rem"` (lesson-slides)
  - Default (all others)

### Section Headers (h2)
**Pattern:** Default h2 styling (from globals.css: `fontSize: 2rem, fontWeight: 400`)
- **Files:** Most pages
- **Variations:**
  - `marginTop: 0, marginBottom: 16, fontSize: 18` (edit-slide form sections)
  - `color: "red"` (error states)
  - `marginTop: 24` (success messages)
  - `marginTop: 32` (debug sections)

### Helper Text / Muted Text
**Pattern:** `fontSize: 12-14, opacity: 0.6-0.7`
- **Files:** page.tsx, new-module, new-lesson, edit-lesson, modules-browser, lesson-slides, lesson-preview
- **Common styles:**
  - `fontSize: 12, opacity: 0.7` (helper text)
  - `fontSize: 13, opacity: 0.6` (metadata)
  - `fontSize: 13, color: "#000000"` (counts/labels)
  - `fontSize: 14, color: "#666"` (secondary info)

### Code/Monospace Text
**Pattern:** `<code>` or `<pre>` elements
- **Files:** Most pages
- **Common:** `fontSize: 12` for `<pre>` elements

### Labels
**Pattern:** `<label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>`
- **Files:** All form pages (edit-*, new-*)
- **Variations:**
  - `marginBottom: 6` (most common)
  - `marginBottom: 8` (some edit-slide forms)
  - `fontSize: 14` (sometimes specified)

---

## C) Surface Patterns (Cards / Panels / Boxes)

### Form Section Card
**Pattern:** `<div style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 4 }}>`
- **Files:** edit-slide (Slide Type, Placement sections)
- **Usage:** Groups related form fields

### Section Card (Modules Browser)
**Pattern:** `<section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 16 }}>`
- **Files:** modules-browser, slides-browser
- **Usage:** Module/lesson grouping cards

### Dashboard Grid Container
**Pattern:** `<div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>`
- **Files:** page.tsx
- **Usage:** Main hierarchical tree container

### Dashboard Row (Level/Module/Lesson/Group)
**Pattern:** Background `#edeae7`, padding 12-16px, borderBottom `#eee`
- **Files:** page.tsx
- **Variations:**
  - Level: `padding: 16, backgroundColor: "#edeae7"`
  - Module: `padding: "14px 16px", paddingLeft: 32, backgroundColor: "#edeae7"`
  - Lesson: `padding: "12px 16px", paddingLeft: 48, backgroundColor: "#edeae7"`
  - Group: `padding: "10px 16px", paddingLeft: 64, backgroundColor: "#edeae7"`
  - Slide: `padding: "8px 16px", paddingLeft: 80, backgroundColor: "#edeae7"`

### Divider Line
**Pattern:** `<div style={{ borderTop: "1px solid #ddd", marginTop: 12, marginBottom: 12 }}></div>`
- **Files:** lesson-slides
- **Alternative:** `borderTop: "1px solid #ddd", paddingTop: 16` (edit-slide advanced sections)

### Modal/Overlay
**Pattern:** Fixed overlay with centered content
- **Files:** page.tsx (delete confirmation)
- **Styles:**
  - Overlay: `position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1000`
  - Content: `backgroundColor: "#ffffff", padding: 24, borderRadius: 8, maxWidth: 500, width: "90%"`

---

## D) Action Controls

### Primary Button (Standard)
**Pattern:** `padding: "8px 16px", fontSize: 14, fontWeight: 400, borderRadius: 6, border: "1px solid #9bbfb2", backgroundColor: "#9bbfb2", color: "#222326"`
- **Files:** All edit/new pages, page.tsx
- **Hover:** `backgroundColor: "#8aaea1"`
- **Disabled:** `opacity: 0.7, cursor: "not-allowed"`
- **Note:** Already componentized as `Button.tsx` but many inline instances remain

### Small Action Button (Link-style)
**Pattern:** `padding: "6px 12px", borderRadius: 6, border: "1px solid #9bbfb2", backgroundColor: "#9bbfb2", color: "#222326", fontSize: 13, fontWeight: 400, display: "inline-block"`
- **Files:** page.tsx (edit, manage, + Add buttons)
- **Hover:** `backgroundColor: "#8aaea1"`

### Danger/Delete Button
**Pattern:** `padding: "8px 12px", borderRadius: 6, border: "1px solid #bf6f6f", backgroundColor: "#bf6f6f", color: "#222326", fontSize: 14`
- **Files:** page.tsx (delete module/lesson buttons)
- **Hover:** `backgroundColor: "#ad5f5f"`
- **Note:** Button component supports `variant="danger"` but not used consistently

### Secondary/Gray Button
**Pattern:** `padding: "6px 12px", borderRadius: 6, border: "1px solid #a6a198", backgroundColor: "#a6a198", color: "#222326", fontSize: 13`
- **Files:** page.tsx (JSON, player links), lesson-slides
- **Hover:** `backgroundColor: "#959088"`

### Icon Button (Delete)
**Pattern:** Delete button with SVG icon, `display: "flex", alignItems: "center", justifyContent: "center"`
- **Files:** page.tsx
- **SVG:** 16x16, strokeWidth: 2, currentColor

### Button Group Container
**Pattern:** `<div style={{ display: "flex", gap: 8, alignItems: "center" }}>`
- **Files:** page.tsx, lesson-slides
- **Variations:**
  - `gap: 8` (most common)
  - `gap: 12` (level row)
  - `justifyContent: "flex-end"` (modal actions)

### Link as Button
**Pattern:** Links styled as buttons (same styles as buttons but `textDecoration: "none"`)
- **Files:** page.tsx, lesson-slides
- **Note:** Many instances could use Button component with `as` prop or LinkButton component

---

## E) Form Controls

### Text Input
**Pattern:** `width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", fontSize: 14`
- **Files:** All form pages
- **Background:** Inherits from globals.css `#edeae7`

### Select/Dropdown
**Pattern:** Same as text input
- **Files:** All form pages
- **Variations:**
  - `fontSize: 13, padding: "4px 8px"` (small dropdown in lesson-slides)

### Textarea
**Pattern:** Same as text input + `rows: 4-20`
- **Files:** edit-slide, new-module, edit-module, new-lesson
- **Variations:**
  - `fontFamily: "monospace"` (JSON editors)
  - `rows: 6` (standard)
  - `rows: 15-20` (raw JSON)

### Form Field Container
**Pattern:** `<div style={{ marginBottom: 12-16 }}>`
- **Files:** All form pages
- **Variations:**
  - `marginBottom: 12` (new-module)
  - `marginBottom: 16` (most others)

### Form Row (Side-by-side)
**Pattern:** `<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>`
- **Files:** edit-slide (Placement section)
- **Child:** `flex: "1 1 200px"`

### Error Message
**Pattern:** `color: "red"` or conditional `color: message.includes("error") ? "red" : "green"`
- **Files:** All form pages
- **Variations:**
  - `marginTop: 16` (after form)
  - `marginTop: 12` (new-lesson)

### Success Message
**Pattern:** `color: "green"` or conditional based on message content
- **Files:** All form pages

### Helper Text Below Input
**Pattern:** `<p style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>`
- **Files:** new-module, new-lesson, edit-lesson

---

## F) Tables / Lists

### List Container (ul)
**Pattern:** Default `<ul>` styling
- **Files:** modules-browser, slides-browser, page.tsx (ungrouped slides)

### List Item
**Pattern:** Default `<li>` styling
- **Files:** modules-browser, slides-browser

### Empty State Message
**Pattern:** `opacity: 0.6, fontSize: 13` or `color: "#000000", fontSize: 12-14`
- **Files:** page.tsx, modules-browser, lesson-slides
- **Messages:**
  - "No modules yet."
  - "No lessons yet."
  - "No groups yet."
  - "No slides in this group yet."
  - "No lessons in this module yet."

---

## G) Alerts / Empty States

### Loading State
**Pattern:** `<p>Loading…</p>` or `<p>Loading [item]…</p>`
- **Files:** All pages with async data
- **No specific styling** (inherits default)

### Error State
**Pattern:** `<p style={{ color: "red" }}>` or `<h2 style={{ color: "red" }}>Error</h2>`
- **Files:** All pages
- **Variations:**
  - Simple: `color: "red"`
  - With heading: `<h2 style={{ color: "red" }}>Error</h2><p>{message}</p>`
  - Inline: `Error: {message}`

### Empty State Container
**Pattern:** Same as row styling but with message
- **Files:** page.tsx (no modules/lessons/groups)
- **Style:** Inherits from parent row container

### Success Alert (After Save)
**Pattern:** Conditional message with green color
- **Files:** All form pages
- **Style:** `color: "green"` or conditional based on message content

---

## H) Additional Patterns

### Collapsible Toggle Button
**Pattern:** Transparent button with arrow indicator
- **Files:** page.tsx
- **Style:** `background: "transparent", border: "none", cursor: "pointer", fontWeight: 400, fontSize: 18-24, padding: 0, textAlign: "left"`
- **Indicator:** `▾` (open) or `▸` (closed)

### Flex Container (Horizontal)
**Pattern:** `display: "flex", alignItems: "center", justifyContent: "space-between"`
- **Files:** page.tsx (row headers), lesson-slides
- **Variations:**
  - `justifyContent: "space-between"` (row headers)
  - `justifyContent: "flex-end"` (button groups)

### Debug/Preview Sections
**Pattern:** `<pre style={{ fontSize: 12 }}>` or `<h3 style={{ marginTop: 32 }}>`
- **Files:** edit-slide, new-slide, new-lesson, lesson-preview
- **Usage:** Raw JSON display, debug info

### Raw JSON Editor Toggle
**Pattern:** Collapsible section with expand/collapse button
- **Files:** edit-slide (all editor variants)
- **Button:** `padding: "4px 8px", fontSize: 13, borderRadius: 4, border: "1px solid #ccc"`
- **Content:** Textarea with monospace font

---

## Component Roadmap Proposal

### Priority 1: Highest Duplication + Highest Impact

#### 1. **Button Component** ✅ (Partially Done)
- **Status:** Exists but not used consistently
- **Location:** `components/Button.tsx`
- **Action:** Replace all inline button styles with Button component
- **Variants needed:** primary, secondary, danger, small
- **Files affected:** ~15 files with inline button styles

#### 2. **FormField Component**
- **Purpose:** Label + Input/Select/Textarea wrapper
- **Location:** `components/ui/FormField.tsx`
- **Props:** label, type, value, onChange, helperText, error
- **Files affected:** All edit-* and new-* pages (~10 files)
- **Pattern:** `<div style={{ marginBottom: 16 }}><label>...</label><input>...</input></div>`

#### 3. **Card/Section Component**
- **Purpose:** Bordered container for grouped content
- **Location:** `components/ui/Card.tsx`
- **Props:** title (optional), padding, variant
- **Files affected:** edit-slide, modules-browser, slides-browser, page.tsx
- **Pattern:** `<div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 4-8 }}>`

#### 4. **PageContainer Component**
- **Purpose:** Standardized main wrapper
- **Location:** `components/ui/PageContainer.tsx`
- **Props:** maxWidth (optional), children
- **Files affected:** All 21 page.tsx files
- **Pattern:** `<main style={{ padding: 24, maxWidth: 720 }}>`

#### 5. **LinkButton Component**
- **Purpose:** Link styled as button
- **Location:** `components/ui/LinkButton.tsx`
- **Props:** href, variant, children
- **Files affected:** page.tsx (many instances), lesson-slides
- **Pattern:** Links with button styling

### Priority 2: Next Set

#### 6. **Alert/Message Component**
- **Purpose:** Success/error/info messages
- **Location:** `components/ui/Alert.tsx`
- **Props:** type (success/error/info), message
- **Files affected:** All form pages
- **Pattern:** Conditional color based on message content

#### 7. **EmptyState Component**
- **Purpose:** "No items yet" messages
- **Location:** `components/ui/EmptyState.tsx`
- **Props:** message, icon (optional)
- **Files affected:** page.tsx, modules-browser, lesson-slides
- **Pattern:** Consistent empty state styling

#### 8. **Modal Component**
- **Purpose:** Overlay dialogs
- **Location:** `components/ui/Modal.tsx`
- **Props:** isOpen, onClose, title, children
- **Files affected:** page.tsx (delete confirmation)
- **Pattern:** Fixed overlay with centered content

#### 9. **DashboardRow Component**
- **Purpose:** Hierarchical tree row
- **Location:** `components/ui/DashboardRow.tsx`
- **Props:** level, title, actions, children, isOpen, onToggle
- **Files affected:** page.tsx
- **Pattern:** Collapsible row with background color and padding

#### 10. **FormSection Component**
- **Purpose:** Grouped form fields with title
- **Location:** `components/ui/FormSection.tsx`
- **Props:** title, children
- **Files affected:** edit-slide
- **Pattern:** `<div style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 4 }}>`

### Priority 3: Lower Priority / Utility

#### 11. **Typography Components**
- **Location:** `components/ui/Typography.tsx` or Tailwind @layer
- **Components:** Heading, Text, HelperText, Code
- **Alternative:** Tailwind @layer components in globals.css
- **Files affected:** All pages

#### 12. **Divider Component**
- **Location:** `components/ui/Divider.tsx`
- **Props:** variant (thin/thick), spacing
- **Files affected:** lesson-slides, edit-slide

#### 13. **LoadingSpinner Component**
- **Location:** `components/ui/LoadingSpinner.tsx`
- **Files affected:** All pages with loading states

---

## Implementation Recommendations

### Component vs Tailwind @layer vs Constants

#### Use Components For:
- **Complex interactive elements:** Button, Modal, FormField, Card
- **Elements with logic:** Alert (conditional styling), EmptyState (conditional rendering)
- **Reusable patterns:** PageContainer, LinkButton, DashboardRow

#### Use Tailwind @layer components For:
- **Typography variants:** Heading sizes, text utilities
- **Simple utilities:** Spacing helpers, color utilities
- **Base styles:** Already partially done in globals.css

#### Use Constants File For:
- **Color palette:** `lib/constants/colors.ts`
  - Primary: `#9bbfb2`
  - Primary hover: `#8aaea1`
  - Danger: `#bf6f6f`
  - Danger hover: `#ad5f5f`
  - Secondary: `#a6a198`
  - Background: `#edeae7`
  - Border: `#ddd`, `#eee`, `#ccc`
- **Spacing scale:** `lib/constants/spacing.ts`
- **Border radius:** `lib/constants/radius.ts`

### File Structure Recommendation

```
components/
  ui/
    Button.tsx (enhance existing)
    LinkButton.tsx
    FormField.tsx
    FormSection.tsx
    Card.tsx
    PageContainer.tsx
    Alert.tsx
    EmptyState.tsx
    Modal.tsx
    DashboardRow.tsx
    Divider.tsx
    LoadingSpinner.tsx
  BackButton.tsx (existing)
lib/
  constants/
    colors.ts
    spacing.ts
    radius.ts
app/
  globals.css (enhance with @layer components)
```

---

## Summary Statistics

- **Total Pages Analyzed:** 21
- **Total Components Found:** 2 (Button, BackButton)
- **Most Repeated Pattern:** Button styling (57+ instances)
- **Most Repeated Layout:** `<main style={{ padding: 24 }}>` (21 instances)
- **Most Repeated Form Pattern:** Input styling (50+ instances)
- **Color Palette:** 7 primary colors identified
- **Border Radius Values:** 3 (4px, 6px, 8px)
- **Padding Values:** 4 (8px, 12px, 16px, 24px)

---

**End of Report**  
*No code changes were made during this analysis.*

