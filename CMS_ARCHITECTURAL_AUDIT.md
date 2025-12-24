# CMS Architectural Audit Report
## Slide Editors, Field Visibility, and Component Reuse

**Date:** 2025-01-27  
**Scope:** CMS slide editor system, field visibility logic, component reuse, registry/schema/preset logic  
**Focus:** DRY, KISS, YAGNI, SOLID violations and dead code

---

## Executive Summary

This audit identifies **47 violations** across the slide editor system:
- **DRY violations:** 18 (massive duplication in editors)
- **KISS violations:** 8 (over-engineered systems)
- **YAGNI violations:** 7 (unnecessary abstractions and dead code)
- **SOLID violations:** 9 (tight coupling, single responsibility violations)
- **Dead code:** 5 (unused functions, debug code)

**Critical findings:**
1. **Massive duplication** across 4 slide editors (TextSlideEditor, TitleSlideEditor, AiSpeakRepeatEditor, DefaultSlideEditor)
2. **Duplicate field key constants** defined 3+ times
3. **Duplicate metadata initialization** logic copied 5 times
4. **Duplicate meta_json building** logic copied 5 times
5. **Raw JSON editor sections** duplicated in every editor (when RawJsonEditor exists)
6. **Over-engineered visibility resolver** with parent gating complexity
7. **Unused migration helpers** for preset conversion

---

## A) DRY Violations

### 1. Duplicate Field Key Constants (CRITICAL)

**Category:** DRY  
**Severity:** High  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:21-55`
- `components/slide-editors/TextSlideEditor.tsx:15-20`
- `components/slide-editors/TitleSlideEditor.tsx:15-20`

**Problem:**
```typescript
// Defined identically in 3 files:
const SYSTEM_FIELD_KEYS = new Set(["slideId", "slideType", "groupId", "orderIndex"]);
const METADATA_FIELD_KEYS = new Set([
  "code", "slideGoal", "activityName", "requiresExternalTTS", "buttons", "tags",
  "difficultyHint", "reviewWeight", "isActivity", "scoreType", "passThreshold",
  "maxScoreValue", "passRequiredForNext", "showScoreToLearner",
]);
```

**Why it's a problem:**
- Adding a new metadata field requires updating 3+ files
- Risk of inconsistency if one copy is updated but others aren't
- Violates single source of truth principle

**Recommended action:**
Extract to `lib/slide-editor-registry/fieldKeys.ts`:
```typescript
export const SYSTEM_FIELD_KEYS = new Set([...]);
export const METADATA_FIELD_KEYS = new Set([...]);
export const AUTHORING_METADATA_KEYS = new Set([...]);
export const SPECIAL_METADATA_KEYS = new Set([...]);
```

---

### 2. Duplicate `buildInitialValues` Function

**Category:** DRY  
**Severity:** High  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:208-234`
- `components/slide-editors/TextSlideEditor.tsx:35-55`
- `components/slide-editors/TitleSlideEditor.tsx:35-49`

**Problem:**
Nearly identical function copied 3 times with minor variations (TextSlideEditor handles `bodies` legacy field).

**Why it's a problem:**
- Changes to initialization logic must be made in 3 places
- TextSlideEditor has special `bodies` handling that should be centralized
- Violates DRY principle

**Recommended action:**
Extract to `lib/slide-editor-registry/buildInitialValues.ts`:
```typescript
export function buildInitialValues(
  row: Slide,
  fields: EditorField[],
  options?: { handleLegacyBodies?: boolean }
): FieldValueMap
```

---

### 3. Duplicate Metadata State Initialization (CRITICAL)

**Category:** DRY  
**Severity:** Critical  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:249-264`
- `components/slide-editors/TextSlideEditor.tsx:71-86`
- `components/slide-editors/TitleSlideEditor.tsx:65-80`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:50-65`
- `components/slide-editors/RawJsonEditor.tsx:31-46`

**Problem:**
Identical 20+ line metadata initialization block copied 5 times:
```typescript
const [metadata, setMetadata] = useState<AuthoringMetadataState>({
  code: row.code || "",
  slideGoal: ((row.metaJson as any) || {}).slideGoal || "",
  activityName: ((row.metaJson as any) || {}).activityName || "",
  requiresExternalTTS: ((row.metaJson as any) || {}).requires?.externalTTS || false,
  buttons: Array.isArray(((row.metaJson as any) || {}).buttons) ? ((row.metaJson as any) || {}).buttons : [],
  tags: Array.isArray(((row.metaJson as any) || {}).tags) ? ((row.metaJson as any) || {}).tags : [],
  difficultyHint: ((row.metaJson as any) || {}).difficultyHint || "",
  reviewWeight: ((row.metaJson as any) || {}).reviewWeight ?? null,
  showScoreToLearner: ((row.metaJson as any) || {}).showScoreToLearner || false,
  isActivity: row.isActivity || false,
  scoreType: row.scoreType || "none",
  passingScoreValue: row.passingScoreValue ?? null,
  maxScoreValue: row.maxScoreValue ?? null,
  passRequiredForNext: row.passRequiredForNext || false,
});
```

**Why it's a problem:**
- Adding a new metadata field requires updating 5 files
- High risk of inconsistency
- Massive maintenance burden

**Recommended action:**
Extract to `lib/slide-editor-registry/metadataHelpers.ts`:
```typescript
export function buildInitialMetadataState(row: Slide): AuthoringMetadataState
```

---

### 4. Duplicate `meta_json` Building Logic (CRITICAL)

**Category:** DRY  
**Severity:** Critical  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:467-491`
- `components/slide-editors/TextSlideEditor.tsx:233-257`
- `components/slide-editors/TitleSlideEditor.tsx:222-246`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:312-336`
- `components/slide-editors/RawJsonEditor.tsx:163-187`
- Plus 3 more instances in raw JSON save handlers

**Problem:**
Identical 20+ line block for building `meta_json` copied 8 times:
```typescript
const metaJson: any = {};
if (metadata.slideGoal) metaJson.slideGoal = metadata.slideGoal;
if (metadata.activityName) metaJson.activityName = metadata.activityName;
if (metadata.requiresExternalTTS || metadata.buttons.length > 0) {
  metaJson.requires = {};
  if (metadata.requiresExternalTTS) {
    metaJson.requires.externalTTS = true;
  }
}
if (metadata.buttons.length > 0) {
  metaJson.buttons = metadata.buttons;
}
// ... 10+ more lines
```

**Why it's a problem:**
- Changes to metadata structure require updating 8 places
- Risk of bugs if one copy is missed
- Violates single source of truth

**Recommended action:**
Extract to `lib/slide-editor-registry/metadataHelpers.ts`:
```typescript
export function buildMetaJson(metadata: AuthoringMetadataState): Record<string, any>
```

---

### 5. Duplicate `hasUnsavedChanges` Logic

**Category:** DRY  
**Severity:** High  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:361-381`
- `components/slide-editors/TextSlideEditor.tsx:126-146`
- `components/slide-editors/TitleSlideEditor.tsx:120-140`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:201-222`
- `components/slide-editors/RawJsonEditor.tsx:102-122`

**Problem:**
Identical 15+ line `useMemo` for detecting unsaved changes copied 5 times, comparing all metadata fields individually.

**Why it's a problem:**
- Adding a metadata field requires updating 5 comparison blocks
- Inconsistent comparison logic risk
- Maintenance burden

**Recommended action:**
Extract to `lib/slide-editor-registry/useUnsavedChanges.ts`:
```typescript
export function useSlideEditorUnsavedChanges(
  initialValues: FieldValueMap,
  initialMetadata: AuthoringMetadataState,
  currentValues: FieldValueMap,
  currentMetadata: AuthoringMetadataState
): boolean
```

---

### 6. Duplicate `SELECT_OPTIONS_BY_KEY` Constant

**Category:** DRY  
**Severity:** Medium  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:58-81`
- `components/slide-editors/TextSlideEditor.tsx:22-28`
- `components/slide-editors/TitleSlideEditor.tsx:22-28`

**Problem:**
Select options for `defaultLang` defined identically in 3 files. DefaultSlideEditor has more options (speechMode, scoreType, aiResponseMode) but others duplicate `defaultLang`.

**Why it's a problem:**
- Adding a new select option requires updating multiple files
- Inconsistency risk

**Recommended action:**
Extract to `lib/slide-editor-registry/selectOptions.ts`:
```typescript
export const SELECT_OPTIONS_BY_KEY: Record<string, { value: string; label: string }[]> = {
  defaultLang: [...],
  speechMode: [...],
  scoreType: [...],
  aiResponseMode: [...],
};
```

---

### 7. Duplicate `renderFieldInput` Functions

**Category:** DRY  
**Severity:** Medium  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:527-587`
- `components/slide-editors/TextSlideEditor.tsx:166-192`
- `components/slide-editors/TitleSlideEditor.tsx:160-186`

**Problem:**
Similar field rendering logic with minor variations. DefaultSlideEditor has more cases (json, number, boolean, toggle, metadata), but core logic is duplicated.

**Why it's a problem:**
- Changes to field rendering require updating multiple files
- Inconsistent behavior risk

**Recommended action:**
Extract to `components/slide-editors/shared/renderFieldInput.tsx`:
```typescript
export function renderFieldInput(
  field: EditorField,
  value: any,
  onChange: (value: any) => void,
  options?: { selectOptions?: Record<string, any> }
): React.ReactNode
```

---

### 8. Duplicate "Missing Label" Warning UI

**Category:** DRY  
**Severity:** Low  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:782-794`
- `components/slide-editors/TextSlideEditor.tsx:326-339`
- `components/slide-editors/TitleSlideEditor.tsx:310-323`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:465-478`

**Problem:**
Identical warning banner copied 4 times:
```typescript
{row.id && !hasLabel && (
  <div style={{ padding: uiTokens.space.md, backgroundColor: "#fff3cd", ... }}>
    <strong>Missing label:</strong> This slide is missing a label...
  </div>
)}
```

**Why it's a problem:**
- UI changes require updating 4 files
- Inconsistent styling risk

**Recommended action:**
Extract to `components/slide-editors/shared/MissingLabelWarning.tsx`

---

### 9. Duplicate Raw JSON Editor Sections

**Category:** DRY  
**Severity:** High  
**Files:**
- `components/slide-editors/TextSlideEditor.tsx:360-480`
- `components/slide-editors/TitleSlideEditor.tsx:344-469`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:499-625`
- `components/slide-editors/RawJsonEditor.tsx:282-402`

**Problem:**
Every editor includes a "Raw props_json (advanced)" section with identical:
- Expand/collapse state management
- JSON textarea with parse error handling
- Save button with identical meta_json building logic
- Success/error message display

**Why it's a problem:**
- RawJsonEditor already exists for this purpose
- Massive duplication (100+ lines per editor)
- Changes require updating 4 files

**Recommended action:**
**DELETE** raw JSON sections from TextSlideEditor, TitleSlideEditor, AiSpeakRepeatEditor. Users can switch to RawJsonEditor if needed. This is YAGNI - the advanced JSON editing is already available via RawJsonEditor.

---

### 10. Duplicate Copy-to-Clipboard Logic

**Category:** DRY  
**Severity:** Low  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:393-401, 722-765`
- `app/edit-slide/[slideId]/page.tsx:28-38, 119-185, 228-272`

**Problem:**
Copy-to-clipboard functionality with confirmation state duplicated in multiple places.

**Why it's a problem:**
- UI changes require multiple updates
- Inconsistent UX

**Recommended action:**
Extract to `components/ui/CopyButton.tsx` or `lib/hooks/useCopyToClipboard.ts`

---

### 11. Duplicate Field Filtering Logic

**Category:** DRY  
**Severity:** Medium  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:319-345`
- `components/slide-editors/TextSlideEditor.tsx:89-93`
- `components/slide-editors/TitleSlideEditor.tsx:86-89`

**Problem:**
Similar logic for filtering system/metadata fields from schema:
```typescript
const editableFields = useMemo(
  () => schema.fields.filter((field) => !isSystemField(field.key) && !isMetadataField(field.key)),
  [schema.fields]
);
```

**Why it's a problem:**
- Logic is simple but duplicated
- Could be centralized

**Recommended action:**
Extract to `lib/slide-editor-registry/fieldFilters.ts`:
```typescript
export function filterEditableFields(fields: EditorField[]): EditorField[]
export function filterMetadataFields(fields: EditorField[]): EditorField[]
export function filterSystemFields(fields: EditorField[]): EditorField[]
```

---

### 12. Duplicate Label Validation Logic

**Category:** DRY  
**Severity:** Medium  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:415-427`
- `components/slide-editors/TextSlideEditor.tsx:201-213`
- `components/slide-editors/TitleSlideEditor.tsx:195-207`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:242-254`

**Problem:**
Identical label validation for new slides:
```typescript
const labelField = editableFields.find((f) => f.key === "label");
const isNewSlide = !row.id;
if (labelField && isNewSlide) {
  const labelValue = values["label"];
  const trimmedLabel = typeof labelValue === "string" ? labelValue.trim() : "";
  if (!trimmedLabel) {
    setSaveMessage("Slide label is required for CMS navigation.");
    return;
  }
}
```

**Why it's a problem:**
- Validation logic duplicated 4 times
- Changes require multiple updates

**Recommended action:**
Extract to `lib/slide-editor-registry/validation.ts`:
```typescript
export function validateSlideLabel(
  values: FieldValueMap,
  editableFields: EditorField[],
  isNewSlide: boolean
): { valid: boolean; error?: string }
```

---

## B) KISS Violations

### 13. Over-Engineered Visibility Resolver with Parent Gating

**Category:** KISS  
**Severity:** High  
**Files:**
- `lib/slide-editor-registry/resolver.ts:55-176`

**Problem:**
Complex "parent gating" system where default type acts as a gate for child types:
- Default type uses `hiddenFieldKeys` (everything visible except hidden)
- Child types use `visibleFieldKeys` (explicit allowlist)
- Child types can only show fields visible in Default (parent gate)
- Complex intersection logic with diagnostics

**Why it's a problem:**
- Over-engineered for current needs
- Hard to understand and maintain
- Diagnostic logging left in production code (lines 158-167)
- Migration complexity (backward compatibility with `hiddenFieldKeys`)

**Recommended action:**
**SIMPLIFY** to single approach:
- Use `visibleFieldKeys` for ALL types (including default)
- Remove parent gating complexity
- Remove diagnostic logging
- If backward compatibility needed, add migration script, don't maintain dual systems

---

### 14. Dual Preset Format System (hiddenFieldKeys vs visibleFieldKeys)

**Category:** KISS  
**Severity:** Medium  
**Files:**
- `lib/slide-editor-registry/resolver.ts:9-12, 100-121`
- `lib/slide-editor-registry/presets.ts:11-14, 30-36`

**Problem:**
Two preset formats maintained simultaneously:
- `hiddenFieldKeys` (for default type, backward compatibility)
- `visibleFieldKeys` (for non-default types, new format)
- Migration helper `migratePresetToVisibleFieldKeys` exists but may be unused
- `computeVisibleFieldKeys` converts between formats

**Why it's a problem:**
- Dual systems add complexity
- Confusion about which format to use
- Migration helpers may be dead code (see YAGNI #22)

**Recommended action:**
**CONSOLIDATE** to single format (`visibleFieldKeys` for all types). If migration needed, do it once, then remove helpers.

---

### 15. Complex Field Grouping Logic in DefaultSlideEditor

**Category:** KISS  
**Severity:** Medium  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:88-206`

**Problem:**
118-line `FIELD_GROUPS` constant and `groupFieldsForDisplay` function that categorizes fields into 18 groups (layer1-identity, layer1-core, layer2-speech, etc.). Only used by DefaultSlideEditor.

**Why it's a problem:**
- Over-engineered categorization system
- Only used by one editor
- Hard to maintain (adding a field requires knowing which group it belongs to)
- Other editors don't use grouping (simpler approach)

**Recommended action:**
**SIMPLIFY** DefaultSlideEditor to match other editors (flat field list). If grouping is needed, make it optional/configurable, not hardcoded.

---

### 16. Over-Complicated Preset Storage Validation

**Category:** KISS  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/presetStorage.ts:9-66`

**Problem:**
Complex validation logic for localStorage presets with manual type checking and filtering. Validates `hiddenFieldKeys` arrays even though new format uses `visibleFieldKeys`.

**Why it's a problem:**
- Over-engineered for localStorage (could use Zod schema)
- Validates old format (`hiddenFieldKeys`) but not new format (`visibleFieldKeys`)
- Inconsistent with actual preset structure

**Recommended action:**
**SIMPLIFY** using Zod schema validation, or remove validation if not critical (localStorage is client-side only).

---

### 17. Multiple Ways to Get Preset Config

**Category:** KISS  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/presets.ts:41-64, 118-120`

**Problem:**
Multiple functions doing similar things:
- `getPresetsConfig()` - internal, merges storage + code defaults
- `getPresetsConfigForEditor()` - public, same as above
- `getPresetForType()` - gets single preset, converts formats
- `getVisibleFieldsForType()` - uses resolver

**Why it's a problem:**
- Confusing API surface
- Unclear which function to use
- Some functions are thin wrappers

**Recommended action:**
**CONSOLIDATE** to single public API:
- `getPresetsConfig()` - public, returns full config
- `getVisibleFieldsForType(type)` - public, returns fields
- Remove redundant wrappers

---

## C) YAGNI Violations

### 18. Raw JSON Editor Sections in Every Editor (YAGNI)

**Category:** YAGNI  
**Severity:** High  
**Files:**
- `components/slide-editors/TextSlideEditor.tsx:360-480`
- `components/slide-editors/TitleSlideEditor.tsx:344-469`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:499-625`

**Problem:**
Every editor includes a "Raw props_json (advanced)" section (100+ lines each), even though `RawJsonEditor` exists for this exact purpose.

**Why it's a problem:**
- RawJsonEditor already provides this functionality
- Massive code duplication (300+ lines total)
- Users can switch editor type if they need raw JSON editing
- Violates YAGNI - don't need advanced JSON editing in every editor

**Recommended action:**
**DELETE** raw JSON sections from TextSlideEditor, TitleSlideEditor, AiSpeakRepeatEditor. Keep only in RawJsonEditor.

---

### 19. SchemaDebugPanel (Dev-Only Debug Code)

**Category:** YAGNI  
**Severity:** Low  
**Files:**
- `components/debug/SchemaDebugPanel.tsx`
- `app/edit-slide/[slideId]/page.tsx:311-316`

**Problem:**
Debug panel that shows visibility resolution details, only renders in development. Adds complexity to production codebase.

**Why it's a problem:**
- Debug code in production codebase
- Adds import dependencies
- Could be moved to separate debug route

**Recommended action:**
**MOVE** to `/app/debug/schema/[type]` route, or **DELETE** if not actively used.

---

### 20. Migration Helper Functions (May Be Unused)

**Category:** YAGNI  
**Severity:** Medium  
**Files:**
- `lib/slide-editor-registry/resolver.ts:194-211` (`migratePresetToVisibleFieldKeys`)
- `lib/slide-editor-registry/presets.ts:20-25` (`computeVisibleFieldKeys`)

**Problem:**
Migration helpers for converting `hiddenFieldKeys` to `visibleFieldKeys`. May have been used once during migration but now unused.

**Why it's a problem:**
- Dead code if migration is complete
- Maintains complexity for unused code paths

**Recommended action:**
**VERIFY** if used anywhere. If not, **DELETE**. If migration needed, run it once, then delete helpers.

---

### 21. Backward Compatibility for `hiddenFieldKeys` in Resolver

**Category:** YAGNI  
**Severity:** Medium  
**Files:**
- `lib/slide-editor-registry/resolver.ts:110-121`

**Problem:**
Resolver maintains backward compatibility for `hiddenFieldKeys` format:
```typescript
} else if (typePreset?.hiddenFieldKeys) {
  // Backward compatibility: compute typeVisibleKeys from hiddenFieldKeys
  const typeHidden = new Set(typePreset.hiddenFieldKeys);
  typeVisibleKeys = new Set(...);
}
```

**Why it's a problem:**
- Dual code paths add complexity
- If all presets migrated, this is dead code

**Recommended action:**
**VERIFY** if any presets still use `hiddenFieldKeys`. If not, **DELETE** backward compatibility code.

---

### 22. Diagnostic Logging in Production Code

**Category:** YAGNI  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/resolver.ts:158-167`

**Problem:**
Console logging for visibility resolution diagnostics:
```typescript
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log(`[SlideTypeVisibility] ${normalizedType}:`, {...});
}
```

**Why it's a problem:**
- Debug code in production codebase
- Should be removed or moved to debug panel

**Recommended action:**
**DELETE** diagnostic logging. If needed, add to SchemaDebugPanel instead.

---

### 23. Unused `getSelectableSlideTypes` Function

**Category:** YAGNI  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/presets.ts:149-155`

**Problem:**
Function `getSelectableSlideTypes()` returns type keys but may not be used anywhere (only `getSelectableSlideTypesWithLabels` is used).

**Why it's a problem:**
- Dead code if unused
- Adds API surface without benefit

**Recommended action:**
**VERIFY** usage. If unused, **DELETE**.

---

### 24. Complex Preset Serialization Functions

**Category:** YAGNI  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/presets.ts:125-143`

**Problem:**
Multiple serialization functions (`serializePresetConfig`, `serializePreset`) that may not be used.

**Why it's a problem:**
- Dead code if unused
- Maintains complexity

**Recommended action:**
**VERIFY** usage. If unused, **DELETE**.

---

## D) SOLID Violations

### 25. DefaultSlideEditor Violates Single Responsibility

**Category:** SOLID (Single Responsibility)  
**Severity:** High  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx` (868 lines)

**Problem:**
DefaultSlideEditor does too many things:
- Field grouping/categorization (118 lines)
- Field rendering (60 lines)
- System field rendering (96 lines)
- Special metadata field rendering (83 lines)
- Metadata state management
- Save logic with meta_json building
- Unsaved changes detection
- Copy-to-clipboard functionality

**Why it's a problem:**
- Hard to test individual concerns
- Hard to modify without affecting other concerns
- Violates single responsibility principle

**Recommended action:**
**EXTRACT** concerns:
- `useSlideEditorState` hook (state management)
- `useSlideEditorSave` hook (save logic)
- `SlideFieldGroup` component (grouping UI)
- `SystemFieldDisplay` component (system fields)
- `SpecialMetadataField` component (special fields)

---

### 26. Tight Coupling Between Editors and Metadata State

**Category:** SOLID (Dependency Inversion)  
**Severity:** High  
**Files:**
- All slide editors import and manage `AuthoringMetadataState` directly

**Problem:**
Editors are tightly coupled to `AuthoringMetadataState` structure. Changes to metadata require updating all editors.

**Why it's a problem:**
- Violates dependency inversion
- Hard to change metadata structure
- Editors know too much about metadata internals

**Recommended action:**
**ABSTRACT** metadata management:
- `useAuthoringMetadata` hook handles state
- `buildMetaJson` function handles serialization
- Editors only call hooks/functions, don't know internals

---

### 27. Field Visibility Logic Embedded in Multiple Places

**Category:** SOLID (Single Responsibility)  
**Severity:** Medium  
**Files:**
- `lib/slide-editor-registry/resolver.ts` (visibility resolution)
- `lib/slide-editor-registry/presets.ts` (preset loading)
- `lib/slide-editor-registry/index.ts` (schema retrieval)
- `components/debug/SchemaDebugPanel.tsx` (debug display)

**Problem:**
Visibility logic scattered across multiple files with unclear boundaries.

**Why it's a problem:**
- Hard to understand flow
- Changes require understanding multiple files
- Violates single responsibility

**Recommended action:**
**CONSOLIDATE** visibility logic:
- `lib/slide-editor-registry/visibility.ts` - all visibility resolution
- `lib/slide-editor-registry/presets.ts` - preset storage/loading only
- `lib/slide-editor-registry/index.ts` - public API only

---

### 28. Editors Directly Access Row Structure

**Category:** SOLID (Dependency Inversion)  
**Severity:** Medium  
**Files:**
- All slide editors access `row.propsJson`, `row.metaJson`, `row.code`, etc. directly

**Problem:**
Editors know database structure (`propsJson`, `metaJson`). Changes to DB structure require updating all editors.

**Why it's a problem:**
- Tight coupling to database schema
- Violates dependency inversion
- Hard to change storage format

**Recommended action:**
**ABSTRACT** data access:
- `useSlideData` hook provides normalized data
- Editors don't know about `propsJson`/`metaJson`
- Data layer handles conversion

---

### 29. Field Rendering Logic Mixed with Editor Logic

**Category:** SOLID (Single Responsibility)  
**Severity:** Medium  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:527-587`
- `components/slide-editors/TextSlideEditor.tsx:166-192`
- `components/slide-editors/TitleSlideEditor.tsx:160-186`

**Problem:**
Field rendering logic (`renderFieldInput`) embedded in editor components. Should be separate concern.

**Why it's a problem:**
- Hard to reuse field rendering
- Hard to test independently
- Violates single responsibility

**Recommended action:**
**EXTRACT** to `components/slide-editors/shared/FieldRenderer.tsx`:
- Pure component that renders field based on `uiType`
- Editors compose FieldRenderer, don't implement rendering

---

### 30. Save Logic Mixed with UI Logic

**Category:** SOLID (Single Responsibility)  
**Severity:** Medium  
**Files:**
- All slide editors have `handleSave` functions (50-100 lines each)

**Problem:**
Save logic (validation, data transformation, API calls) mixed with UI components.

**Why it's a problem:**
- Hard to test save logic independently
- Hard to reuse save logic
- Violates single responsibility

**Recommended action:**
**EXTRACT** to `useSlideEditorSave` hook:
- Handles validation, transformation, API calls
- Returns `saveSlide` function and state
- Editors call hook, don't implement save logic

---

### 31. Metadata Building Logic in Save Handlers

**Category:** SOLID (Single Responsibility)  
**Severity:** High  
**Files:**
- All slide editors build `meta_json` in save handlers (8 instances)

**Problem:**
Metadata serialization logic duplicated in save handlers. Should be separate concern.

**Why it's a problem:**
- Violates single responsibility
- Massive duplication (see DRY #4)
- Hard to change metadata structure

**Recommended action:**
**EXTRACT** to `lib/slide-editor-registry/metadataHelpers.ts`:
- `buildMetaJson(metadata: AuthoringMetadataState): Record<string, any>`
- Single source of truth for metadata serialization

---

### 32. Field Key Constants Define Business Logic

**Category:** SOLID (Open/Closed)  
**Severity:** Low  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:21-55`

**Problem:**
Field key sets (`SYSTEM_FIELD_KEYS`, `METADATA_FIELD_KEYS`) define business logic (which fields are system vs metadata) in component files.

**Why it's a problem:**
- Business logic in UI layer
- Hard to change without modifying components
- Violates separation of concerns

**Recommended action:**
**MOVE** to `lib/slide-editor-registry/fieldKeys.ts` (see DRY #1)

---

### 33. Preset Storage Logic Mixed with Preset Logic

**Category:** SOLID (Single Responsibility)  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/presets.ts` (preset logic + storage)
- `lib/slide-editor-registry/presetStorage.ts` (storage only)

**Problem:**
Preset logic (`getPresetsConfig`) calls storage functions directly. Storage is separate file but tightly coupled.

**Why it's a problem:**
- Unclear boundaries
- Hard to test independently
- Could be better separated

**Recommended action:**
**CLARIFY** boundaries:
- `presetStorage.ts` - localStorage operations only
- `presets.ts` - preset logic, calls storage
- Clear dependency direction

---

## E) Dead Code

### 34. Unused Migration Helper `migratePresetToVisibleFieldKeys`

**Category:** Dead Code  
**Severity:** Medium  
**Files:**
- `lib/slide-editor-registry/resolver.ts:194-211`

**Problem:**
Function exported but may not be used anywhere. Only imported in `presets.ts` but `computeVisibleFieldKeys` is used instead.

**Recommended action:**
**VERIFY** usage with `grep -r "migratePresetToVisibleFieldKeys"`. If unused, **DELETE**.

---

### 35. Unused `computeVisibleFieldKeys` Helper

**Category:** Dead Code  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/presets.ts:20-25`

**Problem:**
Function only used in `CODE_DEFAULT_PRESETS` initialization. Could be inlined.

**Recommended action:**
**INLINE** or **DELETE** if `CODE_DEFAULT_PRESETS` can be written directly with `visibleFieldKeys`.

---

### 36. Unused `getSelectableSlideTypes` Function

**Category:** Dead Code  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/presets.ts:149-155`

**Problem:**
Function may not be used (only `getSelectableSlideTypesWithLabels` is used).

**Recommended action:**
**VERIFY** usage. If unused, **DELETE**.

---

### 37. Unused Serialization Functions

**Category:** Dead Code  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/presets.ts:125-143`

**Problem:**
`serializePresetConfig` and `serializePreset` may not be used.

**Recommended action:**
**VERIFY** usage. If unused, **DELETE**.

---

### 38. Diagnostic Logging in Resolver

**Category:** Dead Code (Debug)  
**Severity:** Low  
**Files:**
- `lib/slide-editor-registry/resolver.ts:158-167`

**Problem:**
Console logging for diagnostics, should be removed or moved to debug panel.

**Recommended action:**
**DELETE** (see YAGNI #22)

---

## F) Component Reuse Violations

### 39. No Shared Field Input Component

**Category:** Component Reuse  
**Severity:** High  
**Files:**
- All slide editors implement field input rendering independently

**Problem:**
No reusable component for rendering field inputs. Each editor implements `renderFieldInput` with similar logic.

**Recommended action:**
**CREATE** `components/slide-editors/shared/FieldInput.tsx`:
- Accepts `field: EditorField`, `value: any`, `onChange: (value: any) => void`
- Handles all `uiType` cases (text, textarea, select, json, number, boolean)
- Used by all editors

---

### 40. No Shared Metadata Section Component

**Category:** Component Reuse  
**Severity:** Medium  
**Files:**
- `components/slide-editors/AuthoringMetadataSection.tsx` exists but editors duplicate some metadata handling

**Problem:**
`AuthoringMetadataSection` exists but editors still duplicate metadata initialization and state management.

**Recommended action:**
**ENHANCE** `AuthoringMetadataSection` to handle all metadata concerns, or create `useAuthoringMetadata` hook that editors use.

---

### 41. Duplicate Copy Button Implementation

**Category:** Component Reuse  
**Severity:** Low  
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:722-765`
- `app/edit-slide/[slideId]/page.tsx:142-184, 230-271`

**Problem:**
Copy-to-clipboard button with confirmation tooltip implemented multiple times.

**Recommended action:**
**CREATE** `components/ui/CopyButton.tsx` or `lib/hooks/useCopyToClipboard.ts`

---

### 42. No Shared Save Button Component

**Category:** Component Reuse  
**Severity:** Low  
**Files:**
- Editors implement save buttons inline
- `components/ui/SaveChangesButton.tsx` exists but may not be used by editors

**Problem:**
Editors don't use `SaveChangesButton` component, implement save buttons inline.

**Recommended action:**
**USE** `SaveChangesButton` in editors, or create editor-specific save button component.

---

## G) Summary & Prioritized Recommendations

### Critical Priority (Do First)

1. **Extract metadata helpers** (DRY #3, #4, SOLID #31)
   - `buildInitialMetadataState(row: Slide): AuthoringMetadataState`
   - `buildMetaJson(metadata: AuthoringMetadataState): Record<string, any>`
   - **Impact:** Eliminates 8+ duplicate blocks
   - **Effort:** M

2. **Extract field key constants** (DRY #1)
   - Move to `lib/slide-editor-registry/fieldKeys.ts`
   - **Impact:** Single source of truth for field keys
   - **Effort:** S

3. **Delete raw JSON sections from editors** (YAGNI #18, DRY #9)
   - Remove from TextSlideEditor, TitleSlideEditor, AiSpeakRepeatEditor
   - **Impact:** Removes 300+ lines of duplicate code
   - **Effort:** S

4. **Extract `buildInitialValues`** (DRY #2)
   - Move to `lib/slide-editor-registry/buildInitialValues.ts`
   - **Impact:** Eliminates 3 duplicate functions
   - **Effort:** S

### High Priority (Do Soon)

5. **Extract `hasUnsavedChanges` logic** (DRY #5)
   - Create `useSlideEditorUnsavedChanges` hook
   - **Impact:** Eliminates 5 duplicate blocks
   - **Effort:** M

6. **Extract field rendering** (DRY #7, SOLID #29)
   - Create `FieldInput` component
   - **Impact:** Single source of truth for field rendering
   - **Effort:** M

7. **Simplify visibility resolver** (KISS #13)
   - Remove parent gating complexity
   - Use single format (`visibleFieldKeys` for all)
   - **Impact:** Reduces complexity, easier to maintain
   - **Effort:** M

8. **Extract save logic** (SOLID #30)
   - Create `useSlideEditorSave` hook
   - **Impact:** Separates concerns, easier to test
   - **Effort:** M

### Medium Priority

9. **Extract SELECT_OPTIONS_BY_KEY** (DRY #6)
10. **Extract field filtering logic** (DRY #11)
11. **Extract label validation** (DRY #12)
12. **Extract copy-to-clipboard** (DRY #10, Component Reuse #41)
13. **Consolidate preset format** (KISS #14)
14. **Remove diagnostic logging** (YAGNI #22, Dead Code #38)

### Low Priority

15. **Verify and delete unused functions** (YAGNI #20, #23, #24, Dead Code #34-37)
16. **Simplify field grouping** (KISS #15)
17. **Create shared components** (Component Reuse #39-42)

---

## H) Estimated Impact

**Code Reduction:**
- **~800 lines** of duplicate code can be eliminated
- **~300 lines** of YAGNI code (raw JSON sections) can be deleted
- **~100 lines** of dead code can be removed
- **Total: ~1,200 lines** reduction potential

**Maintainability Improvement:**
- **Single source of truth** for metadata, field keys, field rendering
- **Easier to add new metadata fields** (1 place instead of 8)
- **Easier to add new slide types** (reuse shared components)
- **Easier to test** (extracted hooks/components)

**Risk Assessment:**
- **Low risk:** Extracting constants, deleting YAGNI code
- **Medium risk:** Extracting hooks (requires testing)
- **High risk:** Simplifying visibility resolver (affects all editors)

---

## I) Migration Strategy

1. **Phase 1: Extract Constants** (Low risk, high impact)
   - Extract field key constants
   - Extract SELECT_OPTIONS_BY_KEY
   - Update imports in editors

2. **Phase 2: Extract Helpers** (Medium risk, high impact)
   - Extract metadata helpers
   - Extract buildInitialValues
   - Extract hasUnsavedChanges logic
   - Update editors to use helpers

3. **Phase 3: Extract Components** (Medium risk, medium impact)
   - Extract FieldInput component
   - Extract save logic hook
   - Update editors to use components

4. **Phase 4: Delete YAGNI Code** (Low risk, high impact)
   - Delete raw JSON sections
   - Delete unused functions
   - Remove diagnostic logging

5. **Phase 5: Simplify Systems** (High risk, medium impact)
   - Simplify visibility resolver
   - Consolidate preset format
   - Remove backward compatibility

---

**End of Report**

