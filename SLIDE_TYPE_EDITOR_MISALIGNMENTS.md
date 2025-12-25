# Slide Type Editor System Misalignments

## Desired Behavior vs Current Implementation

### 1. **Default Slide Type Starting State** ❌ MISALIGNED

**Desired:**
- Default starts with ALL 88 fields in "Unavailable" (hidden)
- Only "label" field should be in "Available" (visible) initially
- Clean CMS with no data = all fields hidden except label

**Current:**
- `CODE_DEFAULT_PRESETS.default = { hiddenFieldKeys: [] }`
- This means ALL fields are visible by default
- **Fix needed:** Change to `{ hiddenFieldKeys: ALL_FIELDS_EXCEPT_LABEL }`

**Location:** `lib/slide-editor-registry/presets.ts:30`

---

### 2. **Column Naming in Default Editor** ❌ MISALIGNED

**Desired:**
- Default editor columns: "Available" and "Unavailable"
- Child editors columns: "Visible" and "Hidden"

**Current:**
- Default editor uses: "Visible fields" and "Hidden fields"
- Child editors use: "Visible fields" and "Hidden fields"

**Location:** `app/cms/slide-types/[type]/edit/page.tsx:343,394`

---

### 3. **Child Type Starting State** ❌ MISALIGNED

**Desired:**
- Child types (title, text, ai-speak) start with ONLY required fields visible (e.g., "label")
- All other fields that are Available in Default should appear in Hidden column
- User must manually opt-in each field

**Current:**
- `CODE_DEFAULT_PRESETS` includes many fields for child types:
  - `"text-slide": { visibleFieldKeys: computeVisibleFieldKeys([]) }` = ALL fields visible
  - `"title-slide": { visibleFieldKeys: computeVisibleFieldKeys(["body", "note", ...]) }` = Most fields visible
  - `"ai-speak-repeat": { visibleFieldKeys: computeVisibleFieldKeys(["body", "note"]) }` = Most fields visible

**Fix needed:** Child types should start with empty/minimal visibleFieldKeys (only required fields)

**Location:** `lib/slide-editor-registry/presets.ts:31-34`

---

### 4. **Parent Gating Logic** ⚠️ PARTIALLY ALIGNED

**Desired:**
- When Default moves field to "Available", it should appear in child types' "Hidden" column
- Child types can then move it from "Hidden" to "Visible"
- Fields not Available in Default cannot be shown in child types

**Current:**
- Resolver correctly computes `typeHiddenKeys` = fields available in Default but not visible in child
- Logic appears correct: `defaultVisibleKeys.forEach((key) => { if (!typeVisibleKeys.has(key)) typeHiddenKeys.add(key) })`
- **Potential issue:** When Default unhides a field, child types might not immediately see it in Hidden column if their preset doesn't refresh

**Location:** `lib/slide-editor-registry/resolver.ts:154-160`

---

### 5. **Destructive Cascade Behavior** ✅ ALIGNED

**Desired:**
- When Default hides a field, it should be removed from all child types' Visible lists
- This is "forget" behavior - child types lose access

**Current:**
- Code correctly removes field from all child types' visibleFieldKeys when Default hides it
- Lines 183-215 in `app/cms/slide-types/[type]/edit/page.tsx` implement this

**Location:** `app/cms/slide-types/[type]/edit/page.tsx:183-215`

---

### 6. **Form Preview** ✅ ALIGNED

**Desired:**
- Form preview shows only fields that are Visible for that specific slide type
- Should match exactly what appears in the actual slide editor

**Current:**
- `previewSchema = { fields: visibleFields }` - correct
- Uses `visibleFields` which comes from resolver's `visibleKeys`
- This is correctly filtered by slide type

**Location:** `app/cms/slide-types/[type]/edit/page.tsx:314`

---

## Summary of Required Fixes

### Critical Fixes:

1. **Change Default starting state:**
   - Set `default: { hiddenFieldKeys: ALL_FIELDS_EXCEPT_LABEL }`
   - Only "label" should be visible initially

2. **Change Child type starting states:**
   - Remove all code defaults for child types OR set them to minimal (only required fields)
   - Child types should start with empty visibleFieldKeys (opt-in behavior)

3. **Update column labels:**
   - Default editor: "Available" / "Unavailable"
   - Child editors: "Visible" / "Hidden"

### Potential Issues to Verify:

4. **Real-time updates:**
   - When Default unhides a field, verify child type editors immediately show it in Hidden column
   - May need to ensure presetsConfig state updates trigger re-render

5. **Required fields handling:**
   - Ensure "label" is always visible and cannot be hidden
   - Verify REQUIRED_ALWAYS_VISIBLE_KEYS logic works correctly

---

## Root Cause Analysis

The fundamental issue is that the system was designed with an "opt-out" model (all fields visible, hide what you don't want) but the user wants an "opt-in" model (all fields hidden, show what you need).

The current code defaults assume fields should be visible by default, which conflicts with the desired behavior where:
- Default starts with everything hidden
- Child types start with minimal fields visible
- Users explicitly opt-in to fields they need

This mismatch causes confusion and bugs because the system is fighting against the desired workflow.

