# Verified Facts & P0 Plan
## CMS + Lesson Pipeline - Fact-Based Analysis

**Date:** 2025-01-27  
**Method:** Code tracing, actual usage verification, call site analysis

---

## Verified Facts

### Language Format
- **CMS Form Storage**: `"english"`, `"french"`, `"both"` (dropdown values in `app/edit-slide/[slideId]/page.tsx` lines 955-957)
- **Conversion Function**: `mapLanguageToPlayerFormat()` in `app/edit-slide/[slideId]/page.tsx` lines 94-101 converts CMS format → player format
- **Saved to props_json**: `"en"`, `"fr"` (converted via `mapLanguageToPlayerFormat()` at lines 409, 465, 490)
- **Component Expectations**: `"en" | "fr"` (verified in `components/ui/ChoiceElementMapper.tsx` line 15, `lib/hooks/useLessonManager.ts` line 29)
- **Fact**: CMS stores `"english"`/`"french"` in form state but converts to `"en"`/`"fr"` when saving to `props_json`. Components expect `"en"`/`"fr"`.

### Audio File URLs
- **Function**: `getAudioFileUrl()` in `lib/storage/audioFiles.ts` lines 69-75
- **Returns**: Full Supabase public URL: `https://[project].supabase.co/storage/v1/object/public/lesson-audio/[path]`
- **Saved to props_json**: Full URL stored directly (verified in `app/edit-slide/[slideId]/page.tsx` lines 401, 461)
- **File Mode**: `speech.fileUrl` contains full Supabase URL
- **Fact**: CMS saves full Supabase public URLs to `props_json.speech.fileUrl`. No relative paths used.

### Slide Type Registry Locations
- **useLessonManager.ts**: Switch statement lines 13-47 defines default props per type
- **manage-slides/page.tsx**: Dropdown options lines 153-160
- **group-slides/[groupId]/page.tsx**: Array lines 427-434
- **edit-slide/[slideId]/page.tsx**: Conditional rendering throughout (lines 165, 203, 336, 357, 385, 432, 479, 731, 750, 805, 826, 864, 966, 990, 992, 1014, 1065, 1143, 1150, 1235)
- **lessonManagement.ts**: Queries DB for unique types lines 64-68, adds "default" line 97
- **slides.ts**: `defaultIsActivity()` function lines 145-153 references types
- **Fact**: Slide types are hardcoded in 6+ locations. No single source of truth.

### Required Props (from actual save logic)
- **ai-speak-repeat**: `lines` array (2D array) - only saved if `phrases.trim()` exists (line 481). If empty, `lines` not in props_json.
- **ai-speak-student-repeat**: `elements` array - only saved if `elements.length > 0` (line 387). Can be empty array `[]` in default props (line 37).
- **speech-match**: `elements` array - only saved if `choiceElements.length > 0` (line 434). Can be empty array `[]` in default props (line 43).
- **lesson-end**: `message` (from `lessonEndMessage`) - saved if `slideType === "lesson-end"` (line 358). Default props include `message: ""` (line 18).
- **title-slide**: `title` - default props include `title: "New title slide"` (line 16).
- **text-slide**: `title`, `body` - default props include both (line 21).
- **Fact**: Save logic allows empty arrays/strings. No validation that required props exist before save.

---

## Supported Types (as implemented)

| Type | Where Rendered | Required Props (from code) | Optional Props |
|------|---------------|---------------------------|---------------|
| `title-slide` | `useLessonManager.ts:15`, `edit-slide` conditionals | `title` | `subtitle`, `label` |
| `lesson-end` | `useLessonManager.ts:17`, `edit-slide:165,336,357,750` | `title`, `message` | `actions` (JSON array), `label` |
| `text-slide` | `useLessonManager.ts:19`, `edit-slide` conditionals | `title`, `body` | `subtitle`, `buttons`, `label` |
| `ai-speak-repeat` | `useLessonManager.ts:22`, `edit-slide:479-502` | `lines` (2D array) - only if phrases provided | `title`, `subtitle`, `defaultLang`, `label` |
| `ai-speak-student-repeat` | `useLessonManager.ts:34`, `edit-slide:385-431` | `elements` array (can be empty) | `instructions`, `promptLabel`, `onCompleteAtIndex`, `label` |
| `speech-match` | `useLessonManager.ts:39`, `edit-slide:432-477` | `elements` array (can be empty), `title`, `subtitle` | `note`, `label` |
| `default` | `useLessonManager.ts:14`, `lessonManagement.ts:97` | `title` | All fields visible |

**Note**: "default" type is added to unique types list in `lessonManagement.ts` line 97 but has no specific rendering logic.

---

## P0 Plan (minimal)

### 1. Create single slide type registry
- **File**: `lib/schemas/slideTypeRegistry.ts`
- **Change**: Export `VALID_SLIDE_TYPES` array with all 7 types from verified list above
- **Import in**: `app/manage-slides/page.tsx` (replace hardcoded dropdown), `app/group-slides/[groupId]/page.tsx` (replace array), `lib/hooks/useLessonManager.ts` (replace switch cases), `lib/data/slides.ts` (replace hardcoded array in `defaultIsActivity`)

### 2. Add Zod schemas for props_json per type
- **File**: `lib/schemas/slidePropsSchemas.ts`
- **Change**: Create Zod schemas for each slide type's props structure (based on verified save logic)
- **Schemas needed**: `titleSlidePropsSchema`, `lessonEndPropsSchema`, `textSlidePropsSchema`, `aiSpeakRepeatPropsSchema`, `aiSpeakStudentRepeatPropsSchema`, `speechMatchPropsSchema`
- **Export**: Union type `SlidePropsSchema` that selects schema by type

### 3. Validate props_json at load time
- **File**: `lib/data/slides.ts`
- **Change**: In `loadSlideById()` function, after line 137, add validation: parse `props_json` against schema for `slide.type`. Return error if validation fails.
- **Import**: `slidePropsSchemas.ts` from step 2

### 4. Validate props_json at save time
- **File**: `lib/data/slides.ts`
- **Change**: In `updateSlide()` function, before line 246, add validation: if `input.props_json` provided, validate against schema for `input.type` (or existing type if type not changing). Return error if validation fails.

### 5. Add required field validation in editor before save
- **File**: `app/edit-slide/[slideId]/page.tsx`
- **Change**: In `handleSave()` function, before line 314, add checks:
  - If `slideType === "ai-speak-repeat"` and `phrases.trim() === ""`, show error "ai-speak-repeat slides require phrases"
  - If `slideType === "lesson-end"` and `lessonEndMessage.trim() === ""`, show error "lesson-end slides require message"
  - If `slideType === "text-slide"` and `body.trim() === ""`, show error "text-slide slides require body"
- **Return early**: Don't call `updateSlide()` if validation fails

### 6. Standardize language format (remove conversion)
- **File**: `app/edit-slide/[slideId]/page.tsx`
- **Change**: 
  - Line 955-957: Change dropdown options to `"en"`, `"fr"`, `"both"` (remove "english"/"french")
  - Remove `mapLanguageToPlayerFormat()` function (lines 94-101)
  - Remove calls to `mapLanguageToPlayerFormat()` at lines 409, 465, 490 (use `defaultLang` directly)
  - Update `ChoiceElementMapper` and `StudentRepeatElementMapper` to expect `"en"`/`"fr"` format

### 7. Document audio URL format decision
- **File**: `lib/storage/audioFiles.ts`
- **Change**: Add JSDoc comment to `getAudioFileUrl()`: "Returns full Supabase public URL. Player must accept full URLs."
- **Note**: If player doesn't accept full URLs, this becomes P0 blocker (requires player changes or URL transformation)

### 8. Add type-to-schema mapping
- **File**: `lib/schemas/slidePropsSchemas.ts`
- **Change**: Export function `getPropsSchemaForType(type: string): z.ZodSchema` that returns correct schema for type
- **Use in**: Steps 3 and 4 for validation

---

## Summary

**Verified Facts:**
- Language: CMS form uses `"english"`/`"french"` but converts to `"en"`/`"fr"` in props_json
- Audio: Full Supabase URLs saved directly
- Types: 7 types hardcoded in 6+ locations
- Props: Save logic allows empty required fields

**P0 Changes:**
- 8 minimal changes (no refactors, no patterns, no architecture changes)
- Focus: Single registry, validation, format standardization
- Estimated effort: 1-2 days

