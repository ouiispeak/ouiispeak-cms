# Slide Type Editor System - Desired Behavior Specification

## System Overview

The slide type editor system controls which form fields are available and visible when creating/editing slides. It uses a **parent gate + opt-in** model where:

1. **Default slide type** acts as the global gatekeeper
2. **Child slide types** (title, text, ai-speak, etc.) opt-in to fields that are available in Default
3. Each slide type can have different fields visible, preventing errors and reducing UI clutter

---

## Core Principles

### 1. **Opt-In Model (Not Opt-Out)**
- Fields start **hidden** by default
- Users explicitly **enable** fields they need
- This prevents accidental inclusion of fields that shouldn't be used

### 2. **Parent Gate System**
- Default slide type controls what's **available** to child types
- Child types can only show fields that are **available** in Default
- If Default hides a field, child types cannot show it (even if previously enabled)

### 3. **Isolation Between Slide Types**
- Each slide type maintains its own **visible fields** list
- Enabling a field in one child type does NOT enable it in other child types
- Each slide type's form is unique based on its visible fields

---

## Default Slide Type Editor

### Purpose
Controls which fields are **available** to all child slide types. Acts as a global gatekeeper.

### Starting State (Clean CMS, No Data)
- **Available column:** Only "label" field (required field)
- **Unavailable column:** All other 87 fields

### Column Labels
- Left column: **"Available"** (fields that child types can use)
- Right column: **"Unavailable"** (fields that child types cannot access)

### Behavior

#### Moving Field from Unavailable → Available:
1. Field moves from "Unavailable" to "Available" column
2. Field becomes **available** to all child slide types
3. Field appears in child types' **"Hidden"** column (not automatically visible)
4. Child types must still manually enable it to make it visible

#### Moving Field from Available → Unavailable:
1. Field moves from "Available" to "Unavailable" column
2. Field is **removed** from all child types' visible fields (destructive cascade)
3. Field disappears from all child type editors
4. If a child type had this field visible, it's automatically removed

### Example Flow:
```
Initial state:
- Available: [label]
- Unavailable: [title, subtitle, body, ... 85 more fields]

User adds "title" to Available:
- Available: [label, title]
- Unavailable: [subtitle, body, ... 85 more fields]

Result:
- "title" now appears in ALL child types' Hidden column
- Child types can choose to enable it (move to Visible)
- But it's not automatically visible in any child type
```

---

## Child Slide Type Editors (Title, Text, AI-Speak, etc.)

### Purpose
Each child type controls which **available** fields are **visible** in its form.

### Starting State (Clean CMS, No Data)
- **Visible column:** Only "label" field (required field)
- **Hidden column:** All fields that are **available** in Default (but not yet visible in this type)

### Column Labels
- Left column: **"Visible"** (fields shown in the form for this slide type)
- Right column: **"Hidden"** (fields available from Default but not visible in this type)

### Behavior

#### Moving Field from Hidden → Visible:
1. Field moves from "Hidden" to "Visible" column
2. Field becomes visible **only** in this specific slide type's form
3. Other child types are unaffected
4. Form preview updates to show the new field

#### Moving Field from Visible → Hidden:
1. Field moves from "Visible" to "Hidden" column
2. Field is hidden **only** in this specific slide type's form
3. Other child types are unaffected
4. Form preview updates to hide the field

### Constraints
- **Cannot show fields that are Unavailable in Default**
- If Default hides a field, it disappears from this child type's Hidden column
- If this child type had the field visible, it's automatically removed (cascade from Default)

### Example Flow (Title Slide Type):
```
Initial state (after Default has "title" and "subtitle" in Available):
- Visible: [label]
- Hidden: [title, subtitle] (these are available from Default)

User adds "title" to Visible:
- Visible: [label, title]
- Hidden: [subtitle]

User adds "subtitle" to Visible:
- Visible: [label, title, subtitle]
- Hidden: []

Result:
- Title slide form now shows: label, title, subtitle
- Text slide form still shows: label only (not affected)
- AI-Speak slide form still shows: label only (not affected)
```

---

## Form Preview

### Purpose
Shows exactly what the form will look like when editing a slide of this type.

### Behavior
- Displays **only** fields that are in the "Visible" column
- Organized by categories (Identity, Core Content, Language, etc.)
- Matches exactly what appears in the actual slide editor
- Updates in real-time as fields are moved between Visible/Hidden

### Example:
```
Title Slide Type:
- Visible: [label, title, subtitle]
- Form Preview shows: 3 fields organized in categories

Text Slide Type:
- Visible: [label, body]
- Form Preview shows: 2 fields organized in categories

AI-Speak Slide Type:
- Visible: [label]
- Form Preview shows: 1 field (label only)
```

---

## Data Flow & State Management

### Storage
- Settings stored in `localStorage` as `SlideTypePresetsConfig`
- Format:
  ```typescript
  {
    version: 1,
    presets: {
      "default": { hiddenFieldKeys: ["field1", "field2", ...] },
      "title-slide": { visibleFieldKeys: ["label", "title", "subtitle"] },
      "text-slide": { visibleFieldKeys: ["label", "body"] },
      "ai-speak-repeat": { visibleFieldKeys: ["label"] }
    }
  }
  ```

### Default Presets (Code Defaults)
- Used when `localStorage` is empty or invalid
- **Default:** `{ hiddenFieldKeys: ALL_FIELDS_EXCEPT_LABEL }`
- **Child types:** `{ visibleFieldKeys: ["label"] }` (minimal, opt-in)

### Resolution Logic
1. Load presets from `localStorage` (or use code defaults)
2. For Default: `visible = ALL_FIELDS - hiddenFieldKeys`
3. For Child types: `visible = (Default.available ∩ child.visibleFieldKeys) ∪ requiredFields`
4. Child types' Hidden column = `Default.available - child.visible`

---

## Key Behaviors Summary

### ✅ What Should Happen:

1. **Default starts with everything hidden** (except label)
2. **Child types start with minimal fields** (only label)
3. **Default controls availability** - fields must be Available in Default before child types can use them
4. **Child types opt-in individually** - enabling a field in one type doesn't affect others
5. **Destructive cascade** - hiding in Default removes from all child types
6. **Form preview matches actual form** - shows exactly what will appear when editing

### ❌ What Should NOT Happen:

1. **Fields should NOT be visible by default** (except required fields like label)
2. **Child types should NOT inherit visibility** - they must explicitly enable fields
3. **Default should NOT automatically add fields to child types** - it only makes them available
4. **One child type's changes should NOT affect others** - each type is independent
5. **Form preview should NOT show all 88 fields** - only visible fields for that type

---

## Edge Cases & Special Rules

### Required Fields
- "label" field is **always visible** and cannot be hidden
- Required fields appear in all slide types regardless of settings

### Field Categories
- Fields are organized into logical groups (Identity, Core Content, Language, etc.)
- Categories help users understand field relationships
- Categories are for display only - don't affect functionality

### Unknown Slide Types
- If a slide has a type not in the registry, it uses the "default" preset
- Unknown types fall back to raw JSON editor

### Migration & Backward Compatibility
- System supports both `hiddenFieldKeys` (legacy) and `visibleFieldKeys` (current)
- Legacy presets are automatically converted when loaded
- Empty or invalid presets are replaced with code defaults

---

## User Workflow Example

### Scenario: Setting up Title Slide Type

1. **User opens Default slide type editor**
   - Sees: Available [label], Unavailable [87 other fields]
   - Adds "title" to Available
   - Adds "subtitle" to Available
   - Result: Available [label, title, subtitle], Unavailable [85 other fields]

2. **User opens Title slide type editor**
   - Sees: Visible [label], Hidden [title, subtitle]
   - Adds "title" to Visible
   - Adds "subtitle" to Visible
   - Result: Visible [label, title, subtitle], Hidden []

3. **User creates a new Title slide**
   - Form shows: label, title, subtitle fields
   - Can fill in these three fields
   - Other fields are not shown

4. **User opens Text slide type editor**
   - Sees: Visible [label], Hidden [title, subtitle]
   - Does NOT add title/subtitle (keeps them hidden)
   - Result: Visible [label], Hidden [title, subtitle]

5. **User creates a new Text slide**
   - Form shows: label field only
   - Cannot accidentally add title or subtitle
   - Clean, focused form

---

## Success Criteria

The system is working correctly when:

1. ✅ Default starts with all fields hidden (except label)
2. ✅ Child types start with minimal fields (only label)
3. ✅ Default's "Available" column controls what child types can access
4. ✅ Child types' "Hidden" column shows fields available from Default but not yet visible
5. ✅ Enabling a field in one child type doesn't affect others
6. ✅ Hiding a field in Default removes it from all child types
7. ✅ Form preview matches actual form for each slide type
8. ✅ Settings persist after page refresh
9. ✅ Adding one field doesn't add all fields
10. ✅ Each slide type has its own independent field visibility

