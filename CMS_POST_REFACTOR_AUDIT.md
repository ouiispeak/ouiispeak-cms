# CMS Post-Refactor Architectural Audit

**Date:** After Steps 1-5 cleanup  
**Scope:** CMS slide editors, registry, presets, UI components  
**Goal:** Verify single-source-of-truth achieved, identify remaining violations

---

## ✅ REFACTOR VERIFICATION

### Single-Source-of-Truth Achieved

1. **Metadata Init/Serialization** ✅
   - `lib/slide-editor-registry/metadataHelpers.ts` - Single source
   - All 3 editors use `buildInitialMetadataState()` and `buildMetaJson()`
   - **Status:** CONSOLIDATED

2. **Field Identity** ✅
   - `lib/slide-editor-registry/fieldKeys.ts` - Single source
   - `lib/slide-editor-registry/selectOptions.ts` - Single source
   - All editors import from shared modules
   - **Status:** CONSOLIDATED

3. **Unsaved Changes Detection** ✅
   - `lib/slide-editor-registry/useUnsavedChanges.ts` - Single source
   - All 3 editors use `checkUnsavedChanges()` helper
   - **Status:** CONSOLIDATED

4. **Editor Routing** ✅
   - `lib/slide-editor-registry/index.ts` - Single registry
   - Text/title slide types route through DefaultSlideEditor
   - **Status:** CONSOLIDATED

---

## 🔍 FINDINGS BY CATEGORY

### A. DUPLICATION

#### A1. Label Validation Logic (3 instances)
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:321-333`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:198-210`

**Problem:**
- Identical label validation logic duplicated across 2 editors
- Checks for `label` field, validates for new slides, same error message
- ~12 lines duplicated

**Fix:**
- Extract to `lib/slide-editor-registry/validationHelpers.ts`
- Function: `validateRequiredLabel(values: Record<string, any>, schema: EditorSchema, isNewSlide: boolean): string | null`
- **Risk:** LOW (pure function extraction)

#### A2. Missing Label Warning Banner (2 instances)
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:665-677`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:400-410`

**Problem:**
- Identical warning banner JSX duplicated
- Same styling, same message, same conditional logic
- ~12 lines duplicated

**Fix:**
- Extract to `components/slide-editors/MissingLabelWarning.tsx`
- Props: `hasLabel: boolean, isExistingSlide: boolean`
- **Risk:** LOW (UI component extraction)

#### A3. Save Message Rendering (3 instances)
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:743-747`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:413-422`
- `components/slide-editors/RawJsonEditor.tsx:163-167`

**Problem:**
- Similar save message rendering with slight variations
- DefaultSlideEditor uses `includes("error")` check, others use different colors
- Inconsistent styling

**Fix:**
- Extract to `components/slide-editors/SaveMessage.tsx`
- Props: `message: string | null`
- Standardize error detection and styling
- **Risk:** LOW (UI component extraction)

#### A4. Save Handler Structure (3 instances)
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:314-408`
- `components/slide-editors/AiSpeakRepeatEditor.tsx:187-304`
- `components/slide-editors/RawJsonEditor.tsx:82-142`

**Problem:**
- Similar save handler patterns:
  - `e.preventDefault()`, `setSaving(true)`, `onSavingChange?.(true)`
  - Error handling with `setSaveMessage()`
  - Success handling with `setSaveMessage("Saved successfully!")`
  - `finally` block with `setSaving(false)`, `onSavingChange?.(false)`
- Each has type-specific logic (props building, validation)

**Fix:**
- Extract common save handler wrapper to hook: `useSlideEditorSave()`
- Returns `{ handleSave: (e: FormEvent, saveFn: () => Promise<SaveResult>) => Promise<void>, saving, saveMessage }`
- Editors provide type-specific save function
- **Risk:** MEDIUM (requires careful hook design, but high value)

#### A5. CODE_DEFAULT_PRESETS Duplication
**Files:**
- `lib/slide-editor-registry/presets.ts:32-33`

**Problem:**
- Both `"text-slide"` and `"text"` entries in CODE_DEFAULT_PRESETS
- `"text"` alias already handled by registry aliases
- Redundant preset entry

**Fix:**
- Remove `text: { visibleFieldKeys: ... }` from CODE_DEFAULT_PRESETS
- Rely on alias resolution + default preset
- **Risk:** LOW (cleanup only)

---

### B. OVER-COMPLEXITY (KISS/YAGNI)

#### B1. Dual Preset Format (hiddenFieldKeys vs visibleFieldKeys)
**Files:**
- `lib/slide-editor-registry/resolver.ts:6-7, 100-112`
- `lib/slide-editor-registry/presets.ts:12-13, 95-109`

**Problem:**
- System supports both formats for backward compatibility
- Complex migration logic in `migratePresetToVisibleFieldKeys()`
- `getPresetForType()` has branching logic for both formats
- Adds cognitive overhead

**Assessment:**
- **Current state:** Backward compatibility needed for localStorage migration
- **Future:** Once all users migrated, can remove hiddenFieldKeys support
- **Action:** Document migration timeline, add deprecation warning
- **Risk:** LOW (documentation only for now)

#### B2. Parent Gating Logic Complexity
**Files:**
- `lib/slide-editor-registry/resolver.ts:33-48, 94-130`
- `app/cms/slide-types/[type]/edit/page.tsx:279-405`

**Problem:**
- Complex parent gating logic with destructive cascade
- When hiding in Default, removes from all child types' allowlists
- Hard to reason about, many edge cases

**Assessment:**
- **Current state:** Required for UX (hiding in Default should hide everywhere)
- **Complexity:** Necessary for the feature, but could be better documented
- **Action:** Add comprehensive JSDoc explaining behavior
- **Risk:** LOW (documentation only)

#### B3. FIELD_GROUPS Hardcoded in DefaultSlideEditor
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:36-150`

**Problem:**
- Large FIELD_GROUPS constant (115 lines) hardcoded in editor
- Used only for grouping/display, not business logic
- Could be extracted to shared config

**Fix:**
- Move to `lib/slide-editor-registry/fieldGroups.ts`
- Export `FIELD_GROUPS` constant
- **Risk:** LOW (simple extraction)

#### B4. buildInitialValues Function Scope
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:156-182`

**Problem:**
- `buildInitialValues()` is a module-level function but only used in DefaultSlideEditor
- Could be extracted to shared helper if other editors need it
- Currently only DefaultSlideEditor uses it (AiSpeakRepeatEditor has custom init)

**Assessment:**
- **Current:** Only used in one place (YAGNI satisfied)
- **Future:** If other editors need it, extract then
- **Action:** None needed (YAGNI)
- **Risk:** N/A

---

### C. COUPLING (SOLID VIOLATIONS)

#### C1. DefaultSlideEditor Mixes Concerns
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx` (751 lines)

**Problem:**
- Single component handles:
  - Field grouping/display logic
  - System field rendering
  - Special metadata field rendering
  - Save handler with props building
  - Validation logic
  - Copy-to-clipboard functionality
- Violates Single Responsibility Principle

**Fix:**
- Extract field grouping to `useFieldGroups(schema.fields)` hook
- Extract system field rendering to `SystemFieldRenderer` component
- Extract special metadata rendering to `SpecialMetadataFieldRenderer` component
- Extract save handler to `useSlideEditorSave()` hook (see A4)
- **Risk:** MEDIUM (requires careful refactoring, but improves maintainability)

#### C2. Editor Props Interface Too Broad
**Files:**
- `components/slide-editors/types.ts:SlideEditorProps`

**Problem:**
- `SlideEditorProps` includes many concerns:
  - Data: `row`, `schema`
  - UI state: `orderIndex`, `groupId`, `slideType`
  - Callbacks: `onSaveSuccess`, `saveSlide`, `onUnsavedChangesChange`, `onSavingChange`
- All editors must accept all props even if unused

**Assessment:**
- **Current:** Works but could be more granular
- **Future:** Consider splitting into `EditorDataProps` and `EditorCallbacksProps`
- **Action:** Low priority, current structure is acceptable
- **Risk:** LOW (nice-to-have improvement)

#### C3. Preset Storage Coupled to Resolver
**Files:**
- `lib/slide-editor-registry/presetStorage.ts:32-44`
- `lib/slide-editor-registry/resolver.ts:55-130`

**Problem:**
- `presetStorage.ts` validates preset format using hardcoded checks
- Must stay in sync with resolver's format expectations
- No shared type/validation

**Fix:**
- Extract preset validation to `lib/slide-editor-registry/presetValidation.ts`
- Use Zod schema for runtime validation
- **Risk:** LOW (adds type safety)

---

### D. DEAD CODE / UNUSED EXPORTS

#### D1. Unused Export: `getSelectableSlideTypes()`
**Files:**
- `lib/slide-editor-registry/presets.ts:149-162`

**Problem:**
- `getSelectableSlideTypes()` is exported but only used internally by `getSelectableSlideTypesWithLabels()`
- No external imports found

**Fix:**
- Make internal: `function getSelectableSlideTypes(): string[]` (remove export)
- **Risk:** LOW (internal-only change)

#### D2. Potentially Unused: `migratePresetToVisibleFieldKeys()`
**Files:**
- `lib/slide-editor-registry/resolver.ts:182-198`

**Problem:**
- Migration helper function exported but may not be used
- Only referenced in JSDoc comments

**Fix:**
- Search for usages, remove if unused
- **Risk:** LOW (cleanup)

#### D3. Unused Import: `DEFAULT_SLIDE_FIELDS` in some editors
**Files:**
- Check all editor files for unused DEFAULT_SLIDE_FIELDS imports

**Status:**
- ✅ DefaultSlideEditor: Comment says "Removed DEFAULT_SLIDE_FIELDS import"
- ✅ AiSpeakRepeatEditor: No import found
- ✅ RawJsonEditor: No import found
- **Status:** CLEAN

---

### E. UI/COMPONENT REUSE

#### E1. Copy-to-Clipboard Pattern
**Files:**
- `components/slide-editors/DefaultSlideEditor.tsx:299-307, 609-630`
- `app/edit-slide/[slideId]/page.tsx:28-38, 119-185, 228-272`

**Problem:**
- Copy-to-clipboard logic duplicated in DefaultSlideEditor and edit-slide page
- Similar button styling, confirmation message pattern
- Could be reusable component

**Fix:**
- Extract to `components/ui/CopyButton.tsx`
- Props: `text: string, label: string, buttonId?: string`
- Handles clipboard write, confirmation message, error handling
- **Risk:** LOW (UI component extraction)

#### E2. Save Button Pattern
**Files:**
- Multiple pages use similar save button patterns
- `components/ui/SaveChangesButton.tsx` exists but may not be used everywhere

**Status:**
- ✅ `SaveChangesButton` component exists
- Need to verify all pages use it consistently
- **Action:** Audit pages for consistent usage
- **Risk:** LOW (standardization)

#### E3. Form Field Styling
**Files:**
- All editors use `FormField` with `borderColor="#b4d5d5"`
- Hardcoded color repeated many times

**Fix:**
- Extract to constant: `const CMS_FORM_BORDER_COLOR = "#b4d5d5"`
- Or add to `uiTokens.color`
- **Risk:** LOW (constant extraction)

---

## 📊 SUMMARY STATISTICS

### Duplication
- **Label validation:** 2 instances (~12 lines each)
- **Missing label warning:** 2 instances (~12 lines each)
- **Save message rendering:** 3 instances (~5 lines each)
- **Save handler structure:** 3 instances (common pattern)
- **CODE_DEFAULT_PRESETS:** 1 redundant entry

### Over-Complexity
- **Dual preset format:** Necessary for migration, well-handled
- **Parent gating:** Complex but necessary, needs better docs
- **FIELD_GROUPS:** 115 lines hardcoded, could be extracted

### Coupling
- **DefaultSlideEditor:** 751 lines, mixes many concerns
- **Editor props:** Broad interface but acceptable
- **Preset validation:** Coupled to resolver format

### Dead Code
- **getSelectableSlideTypes():** Exported but only used internally
- **migratePresetToVisibleFieldKeys():** May be unused

### UI Reuse
- **Copy-to-clipboard:** Duplicated in 2 places
- **Save button:** Component exists, verify consistent usage
- **Form border color:** Hardcoded in many places

---

## 🎯 PRIORITIZED CLEANUP PLAN

### Step 1: Extract Missing Label Warning Component (LOW RISK)
**Files:** `components/slide-editors/MissingLabelWarning.tsx` (new)  
**Changes:** Extract warning banner from DefaultSlideEditor and AiSpeakRepeatEditor  
**Impact:** ~24 lines deduplicated  
**Risk:** LOW

### Step 2: Extract Label Validation Helper (LOW RISK)
**Files:** `lib/slide-editor-registry/validationHelpers.ts` (new)  
**Changes:** Extract `validateRequiredLabel()` function  
**Impact:** ~24 lines deduplicated  
**Risk:** LOW

### Step 3: Extract Save Message Component (LOW RISK)
**Files:** `components/slide-editors/SaveMessage.tsx` (new)  
**Changes:** Extract save message rendering, standardize styling  
**Impact:** ~15 lines deduplicated, consistency improved  
**Risk:** LOW

### Step 4: Extract Copy-to-Clipboard Component (LOW RISK)
**Files:** `components/ui/CopyButton.tsx` (new)  
**Changes:** Extract copy logic from DefaultSlideEditor and edit-slide page  
**Impact:** ~50 lines deduplicated  
**Risk:** LOW

### Step 5: Extract FIELD_GROUPS Constant (LOW RISK)
**Files:** `lib/slide-editor-registry/fieldGroups.ts` (new)  
**Changes:** Move FIELD_GROUPS from DefaultSlideEditor to shared module  
**Impact:** Better organization, 115 lines moved  
**Risk:** LOW

### Step 6: Clean Up CODE_DEFAULT_PRESETS (LOW RISK)
**Files:** `lib/slide-editor-registry/presets.ts`  
**Changes:** Remove redundant `text` entry, rely on alias resolution  
**Impact:** Cleaner config  
**Risk:** LOW

### Step 7: Make getSelectableSlideTypes Internal (LOW RISK)
**Files:** `lib/slide-editor-registry/presets.ts`  
**Changes:** Remove export, make function internal  
**Impact:** Cleaner API  
**Risk:** LOW

### Step 8: Extract Form Border Color Constant (LOW RISK)
**Files:** `lib/uiTokens.ts` or new constant file  
**Changes:** Extract `"#b4d5d5"` to named constant  
**Impact:** Consistency, easier to change  
**Risk:** LOW

### Step 9: Extract useSlideEditorSave Hook (MEDIUM RISK)
**Files:** `lib/slide-editor-registry/useSlideEditorSave.ts` (new)  
**Changes:** Extract common save handler wrapper  
**Impact:** ~30 lines deduplicated per editor, better error handling  
**Risk:** MEDIUM (requires careful hook design)

### Step 10: Extract Field Grouping Hook (MEDIUM RISK)
**Files:** `lib/slide-editor-registry/useFieldGroups.ts` (new)  
**Changes:** Extract field grouping logic from DefaultSlideEditor  
**Impact:** Reduces DefaultSlideEditor complexity  
**Risk:** MEDIUM (requires testing grouping logic)

---

## 📝 NOTES

### Architecture Strengths
- ✅ Single-source-of-truth achieved for metadata, field keys, select options, unsaved changes
- ✅ Schema-driven editors (all use `schema.fields`)
- ✅ RawJsonEditor is only raw JSON surface
- ✅ Registry is centralized and clean

### Areas for Improvement
- Extract UI components (warnings, messages, copy buttons)
- Extract validation helpers
- Reduce DefaultSlideEditor complexity (extract hooks)
- Standardize form styling constants

### Migration Considerations
- Dual preset format (hiddenFieldKeys/visibleFieldKeys) is temporary for migration
- Parent gating logic is complex but necessary for UX
- Consider documenting migration timeline for preset format

---

**Audit Complete** ✅

