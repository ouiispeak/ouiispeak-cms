# Hardcoded vs CMS Comparison Report
## ai-speak-student-repeat Slide Structure

## Current CMS Implementation

### What CMS Saves (from `app/edit-slide/[slideId]/page.tsx`):

```typescript
{
  elements: [
    {
      samplePrompt: string,      // Required, trimmed
      referenceText: string,     // Always present (defaults to samplePrompt if empty)
      speech: {
        mode: "file" | "tts",
        // If mode === "file":
        fileUrl: string,         // Full Supabase public URL
        // If mode === "tts":
        lang: string,            // e.g., "en", "fr", "both" (from defaultLang)
        text: string             // Uses referenceText || samplePrompt
      }
    }
  ],
  instructions?: string,
  promptLabel?: string,
  onCompleteAtIndex?: number,
  // ... other props
}
```

### CMS Save Logic (lines 316-348):
1. Filters elements to only include those with `samplePrompt.trim() !== ""`
2. **Always includes `referenceText`** - defaults to `samplePrompt` if empty
3. If `audioPath` is provided:
   - Creates `speech` with `mode: "file"` and full Supabase URL via `getAudioFileUrl()`
4. If no `audioPath` but has text:
   - Creates `speech` with `mode: "tts"`, `lang` from `defaultLang`, `text` from `referenceText || samplePrompt`

### CMS Load Logic (lines 162-172):
1. Loads `samplePrompt` from `el.samplePrompt || ""`
2. Loads `referenceText` from `el.referenceText || ""`
3. Extracts `audioPath` from `el.speech?.fileUrl` using `extractPathFromUrl()`

## Key Questions to Check in Hardcoded Version

### 1. Speech Object Structure
- **Question**: Does the hardcoded version always include a `speech` object, or can it be missing?
- **CMS Current**: Always creates `speech` if audioPath OR text exists
- **Potential Issue**: If hardcoded version doesn't require `speech`, CMS might be adding it unnecessarily

### 2. File URL Format
- **Question**: What format does the hardcoded version use for `fileUrl`?
  - Full URL: `https://[project].supabase.co/storage/v1/object/public/lesson-audio/path/to/file.wav`
  - Relative path: `media-assets/global/letters/bonjour.wav`
  - Bucket + path: `lesson-audio/media-assets/...`
- **CMS Current**: Saves full Supabase public URL
- **Potential Issue**: Player might expect relative path or different format

### 3. ReferenceText Handling
- **Question**: In hardcoded version, is `referenceText`:
  - Always present (required)?
  - Optional but always defaults to `samplePrompt`?
  - Truly optional (can be missing)?
- **CMS Current**: Always includes `referenceText` (defaults to `samplePrompt`)
- **Potential Issue**: If hardcoded version allows missing `referenceText`, CMS might be adding it when not needed

### 4. TTS Mode Text Source
- **Question**: In hardcoded version, when using TTS mode, does `speech.text` use:
  - `referenceText` only?
  - `samplePrompt` only?
  - `referenceText || samplePrompt`?
- **CMS Current**: Uses `referenceText || samplePrompt`
- **Potential Issue**: Mismatch in which text is used for TTS

### 5. Default Language Format
- **Question**: What values does hardcoded version use for `speech.lang`?
  - `"en"`, `"fr"`, `"both"`?
  - `"english"`, `"french"`, `"both"`?
  - ISO codes: `"en-US"`, `"fr-FR"`?
- **CMS Current**: Uses `defaultLang` which can be `"english"`, `"french"`, or `"both"`
- **Potential Issue**: Language code format mismatch

### 6. Element Filtering
- **Question**: Does hardcoded version filter out elements with empty `samplePrompt`?
- **CMS Current**: Filters out elements where `samplePrompt.trim() === ""`
- **Potential Issue**: If hardcoded version allows empty samplePrompt, CMS might be removing valid elements

### 7. Speech Object Presence
- **Question**: Can an element exist without a `speech` object in hardcoded version?
- **CMS Current**: Only creates `speech` if `audioPath` OR (`referenceText` OR `samplePrompt`) exists
- **Potential Issue**: If hardcoded version allows elements without speech, CMS might be adding speech objects

## Critical Differences to Verify

### Most Likely Issues:

1. **File URL Format**: CMS saves full URLs, player might expect relative paths
2. **Language Code Format**: CMS uses `"english"`/`"french"`, player might expect `"en"`/`"fr"`
3. **Speech Object Requirement**: CMS always creates speech if text exists, player might allow missing speech
4. **ReferenceText Requirement**: CMS always includes referenceText, player might allow it to be missing

## Recommended Investigation Steps

1. **Find hardcoded lesson file** in OuiiSpeak repo (likely in `src/data/lessons/` or similar)
2. **Locate ai-speak-student-repeat slide** in hardcoded data
3. **Extract exact structure** of `elements` array
4. **Compare each field** with CMS output:
   - `samplePrompt` format
   - `referenceText` presence/format
   - `speech.mode` values
   - `speech.fileUrl` format (if file mode)
   - `speech.lang` format (if TTS mode)
   - `speech.text` source (if TTS mode)
5. **Check player component** (`OpenSourcePronunciation.tsx`) to see what it expects
6. **Check API call** (`submitPronunciationAssessment.ts`) to see what data it sends

## Files to Check in OuiiSpeak Repo

1. Hardcoded lesson data file (contains example slide)
2. `src/components/lesson/OpenSourcePronunciation.tsx` (player component)
3. `src/lib/audio/submitPronunciationAssessment.ts` (API call)
4. Type definitions for `ai-speak-student-repeat` slide props

