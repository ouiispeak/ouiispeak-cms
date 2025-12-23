# Slide Type Edit Page Stylesheet Reference

**Page:** `/cms/slide-types/default/edit`  
**Purpose:** Reference document for styling consistency across all slide type edit pages  
**Last Updated:** Based on current implementation

---

## Layout Structure

### Page Container
- **Component:** `CmsPageShell`
- **Title:** `Slide type preset: {typeLabel}`

### Breadcrumb Navigation
```tsx
{
  fontSize: 13,
  color: uiTokens.color.textMuted, // #595852
  marginBottom: uiTokens.space.sm, // 12px
  display: "flex",
  alignItems: "center",
  gap: uiTokens.space.xs // 8px
}
```

**Breadcrumb Link:**
```tsx
{
  color: uiTokens.color.textMuted, // #595852
  textDecoration: "none",
  fontWeight: 400
}
```

**Breadcrumb Separator:**
```tsx
{
  color: uiTokens.color.textMuted // #595852
}
```

**Breadcrumb Current Page:**
```tsx
{
  fontWeight: 600
}
```

---

## Section: Field Visibility

### CmsSection Container
```tsx
{
  title: "Field visibility",
  description: "Hide fields to declutter the editor. Hidden fields stay saved; they are just not shown in the UI.",
  backgroundColor: "#f8f0ed", // Light pinkish hue
  borderColor: "#f2e1db",
  headerSpacing: uiTokens.space.lg * 1.5 // 36px
}
```

### Two-Column Grid Container
```tsx
{
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: "5%",
  rowGap: uiTokens.space.lg, // 24px
  alignItems: "stretch"
}
```

### Column Container (Visible Fields / Hidden Fields)
```tsx
{
  display: "flex",
  flexDirection: "column"
}
```

### Column Title (h3)
```tsx
{
  marginBottom: uiTokens.space.sm, // 12px
  fontSize: uiTokens.font.sectionTitle.size, // 18px
  fontWeight: uiTokens.font.sectionTitle.weight // 400
}
```

### Categories Grid Container (for default type)
```tsx
{
  display: "grid",
  gap: uiTokens.space.lg // 24px - spacing between categories
}
```

### Category Container
```tsx
{
  display: "grid",
  gap: uiTokens.space.xs // 8px - internal spacing within category
}
```

### Category Title
```tsx
{
  fontSize: uiTokens.font.sectionTitle.size - 2, // 16px (18 - 2)
  fontWeight: uiTokens.font.sectionTitle.weight, // 400
  color: uiTokens.color.textMuted // #595852
}
```

### Field List (ul)
```tsx
{
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: uiTokens.space.sm // 12px - spacing between field items
}
```

### Visible Field Item (li)
```tsx
{
  padding: uiTokens.space.sm, // 12px
  border: `1px solid ${uiTokens.color.border}`, // #d9d3cc
  borderRadius: uiTokens.radius.md, // 6px
  backgroundColor: uiTokens.color.bgAlt, // #f6f5f3
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}
```

### Hidden Field Item (li)
```tsx
{
  padding: uiTokens.space.sm, // 12px
  border: `1px dashed ${uiTokens.color.border}`, // #d9d3cc (dashed)
  borderRadius: uiTokens.radius.md, // 6px
  backgroundColor: uiTokens.color.surface, // #edeae7
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  opacity: 0.8
}
```

### Field Label (inside field item)
```tsx
{
  fontWeight: 400
}
```

### Field Help Text (metaText class)
```tsx
{
  color: uiTokens.color.textMuted // #595852
}
```

### Hide Button (Visible Fields)
```tsx
{
  border: "1px solid #bf1736",
  background: "#bf1736",
  color: uiTokens.color.textOnDark, // #f6f5f3
  borderRadius: uiTokens.radius.sm, // 4px
  padding: "4px 8px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
}
```

**Hide Button SVG Icon:**
```tsx
{
  width: 16,
  height: 16,
  stroke: uiTokens.color.bg // #f6f5f3
}
```

### Show Button (Hidden Fields)
```tsx
{
  border: `1px solid ${uiTokens.color.primary}`, // #0c9599
  background: uiTokens.color.primary, // #0c9599
  color: uiTokens.color.textOnDark, // #f6f5f3
  borderRadius: uiTokens.radius.sm, // 4px
  padding: "4px 8px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
}
```

**Show Button SVG Icon:**
```tsx
{
  width: 16,
  height: 16,
  stroke: uiTokens.color.bg // #f6f5f3
}
```

### Empty State Message
```tsx
{
  className: "metaText",
  color: uiTokens.color.textMuted // #595852
}
```

---

## Section: Preset JSON

### CmsSection Container
```tsx
{
  title: "Preset JSON (copy/paste back into code)",
  description: "Copy this snippet into lib/slide-editor-registry/presets.ts to persist.",
  backgroundColor: "#f8f0ed", // Light pinkish hue
  borderColor: "#f2e1db"
}
```

### Textarea
```tsx
{
  width: "100%",
  minHeight: 180,
  padding: uiTokens.space.sm, // 12px
  borderRadius: uiTokens.radius.md, // 6px
  border: `1px solid ${uiTokens.color.border}`, // #d9d3cc
  fontFamily: "monospace",
  fontSize: 13,
  backgroundColor: uiTokens.color.surface // #edeae7
}
```

---

## Section: Live Preview

### CmsSection Container
```tsx
{
  title: isDefaultType ? "Live preview - Default slide fields" : "Live preview",
  description: "Preview only — does not save to Supabase.",
  backgroundColor: "transparent",
  borderColor: "#f2e1db"
}
```

### Form Container (DefaultSlideEditor)
```tsx
{
  display: "grid",
  gap: uiTokens.space.lg // 24px - spacing between category groups
}
```

### Category Group Container (DefaultSlideEditor)
```tsx
{
  display: "grid",
  gap: uiTokens.space.xs, // 8px - internal spacing
  padding: uiTokens.space.sm, // 12px
  border: `1px solid ${uiTokens.color.border}`, // #d9d3cc
  borderRadius: uiTokens.radius.md, // 6px
  backgroundColor: "#f8f0ed" // Light pinkish hue
}
```

### Category Title (DefaultSlideEditor)
```tsx
{
  fontSize: uiTokens.font.sectionTitle.size - 2, // 16px
  fontWeight: uiTokens.font.sectionTitle.weight, // 400
  color: uiTokens.color.textMuted // #595852
}
```

### Fields Container (DefaultSlideEditor)
```tsx
{
  display: "grid",
  gap: uiTokens.space.sm // 12px - spacing between form fields
}
```

### Form Field Label (FormField component)
```tsx
{
  display: "flex",
  alignItems: "center",
  gap: uiTokens.space.xs, // 8px
  marginBottom: 6,
  fontSize: uiTokens.font.label.size, // 14px
  fontWeight: 400, // Normal weight (not 600)
  color: uiTokens.color.text // #192026
}
```

---

## Color Palette Reference

### Primary Colors
- **Background:** `#f6f5f3` (uiTokens.color.bg)
- **Surface:** `#edeae7` (uiTokens.color.surface)
- **Text:** `#192026` (uiTokens.color.text)
- **Text Muted:** `#595852` (uiTokens.color.textMuted)
- **Border:** `#d9d3cc` (uiTokens.color.border)

### Section-Specific Colors
- **Field Visibility Background:** `#f8f0ed` (light pinkish hue)
- **Field Visibility Border:** `#f2e1db`
- **Live Preview Background:** `#f8f0ed` (light pinkish hue for form groups)

### Semantic Colors
- **Primary:** `#0c9599` (uiTokens.color.primary)
- **Danger:** `#bf1736` (uiTokens.color.danger)
- **Text on Dark:** `#f6f5f3` (uiTokens.color.textOnDark)

---

## Spacing Reference

### Spacing Tokens
- **xs:** 8px
- **sm:** 12px
- **md:** 16px
- **lg:** 24px

### Spacing Usage
- **Between categories:** `uiTokens.space.lg` (24px)
- **Within category:** `uiTokens.space.xs` (8px)
- **Between field items:** `uiTokens.space.sm` (12px)
- **Between form fields:** `uiTokens.space.sm` (12px)
- **Column title margin bottom:** `uiTokens.space.sm` (12px)
- **Section header spacing:** `uiTokens.space.lg * 1.5` (36px)
- **Column gap:** `5%`
- **Row gap (two-column grid):** `uiTokens.space.lg` (24px)

---

## Typography Reference

### Font Sizes
- **Page Title:** 24px (uiTokens.font.pageTitle.size)
- **Section Title:** 18px (uiTokens.font.sectionTitle.size)
- **Category Title:** 16px (uiTokens.font.sectionTitle.size - 2)
- **Label:** 14px (uiTokens.font.label.size)
- **Meta/Help Text:** 13px (uiTokens.font.meta.size)
- **Code/Monospace:** 12px (uiTokens.font.code.size)
- **Breadcrumb:** 13px

### Font Weights
- **Page Title:** 400 (uiTokens.font.pageTitle.weight)
- **Section Title:** 400 (uiTokens.font.sectionTitle.weight)
- **Category Title:** 400 (uiTokens.font.sectionTitle.weight)
- **Label:** 400 (normal weight, not 600)
- **Meta Text:** 400 (uiTokens.font.meta.weight)
- **Breadcrumb Current:** 600
- **Field Label:** 400

---

## Border Radius Reference

- **sm:** 4px
- **md:** 6px
- **lg:** 8px

### Usage
- **Field items:** `uiTokens.radius.md` (6px)
- **Buttons:** `uiTokens.radius.sm` (4px)
- **Textarea:** `uiTokens.radius.md` (6px)
- **Category groups:** `uiTokens.radius.md` (6px)

---

## Layout Patterns

### Two-Column Grid
- **Display:** `grid`
- **Columns:** `1fr 1fr` (equal width)
- **Column Gap:** `5%`
- **Row Gap:** `uiTokens.space.lg` (24px)
- **Align Items:** `stretch` (ensures columns match height)

### Category Grid (Default Type)
- **Display:** `grid`
- **Gap:** `uiTokens.space.lg` (24px) - spacing between categories

### Field List Grid
- **Display:** `grid`
- **Gap:** `uiTokens.space.sm` (12px) - spacing between field items

### Form Grid
- **Display:** `grid`
- **Gap:** `uiTokens.space.lg` (24px) - spacing between category groups

---

## Component-Specific Styles

### CmsSection
- **Display:** `flow-root`
- **Border Radius:** `uiTokens.radius.lg` (8px)
- **Padding:** `uiTokens.space.md` (16px)
- **Margin Bottom:** `uiTokens.space.lg` (24px)

### Field Item Container
- **Display:** `flex`
- **Justify Content:** `space-between`
- **Align Items:** `center`

### Button (Hide/Show)
- **Display:** `inline-flex`
- **Align Items:** `center`
- **Justify Content:** `center`
- **Padding:** `4px 8px`
- **Cursor:** `pointer`

---

## Notes

1. **Fixed Values Only:** All spacing uses fixed pixel values from `uiTokens.space` - never use percentages for gaps/spacing to avoid overflow issues.

2. **Height Adaptation:** 
   - Two-column grid uses `alignItems: "stretch"` to ensure columns match height
   - Column containers use `display: "flex", flexDirection: "column"` to properly contain content

3. **Color Consistency:**
   - Visible fields use `uiTokens.color.bgAlt` (#f6f5f3)
   - Hidden fields use `uiTokens.color.surface` (#edeae7) with dashed border and 0.8 opacity
   - Form category groups use `#f8f0ed` (light pinkish hue)

4. **Typography Hierarchy:**
   - Section titles: 18px, weight 400
   - Category titles: 16px, weight 400, muted color
   - Field labels: 14px, weight 400 (not 600)
   - Help text: 13px, weight 400, muted color

5. **Border Styles:**
   - Visible fields: solid border
   - Hidden fields: dashed border
   - All use `uiTokens.color.border` (#d9d3cc)

