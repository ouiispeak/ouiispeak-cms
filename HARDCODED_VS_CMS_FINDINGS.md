# Hardcoded vs CMS Comparison - Findings

## Hardcoded Version Structure (from `A0Module1Lesson1.ts`)

```typescript
{
  type: 'ai-speak-student-repeat',
  props: {
    title: 'Alphabet - ABCDE',
    elements: [
      {
        samplePrompt: 'A',
        referenceText: 'A',
        speech: { mode: 'file', fileUrl: '/audio/alphabet/A.wav' },
      },
      // ...
    ],
    defaultLang: 'en',
  },
}
```

## Type Definition (from `src/lessons/types.ts`)

```typescript
export type AiSpeakStudentRepeatElement = {
  samplePrompt: string;
  referenceText?: string;  // OPTIONAL
  speech?: SpeechContent;   // OPTIONAL
};

export type SpeechContent = {
  mode: SpeechMode;  // 'tts' | 'file'
  lang?: SupportedLang;
  text?: string;
  fileUrl?: string;
};
```

## Component Behavior (from `AISpeakStudentRepeatSlide.tsx`)

### Line 104: ReferenceText handling
```typescript
const repeatText = element.referenceText ?? element.samplePrompt;
```
- Uses `referenceText` if available, falls back to `samplePrompt`
- **referenceText is OPTIONAL** - component handles missing case

### Line 142-146: Speech handling
```typescript
const speechContent = element.speech ?? { 
  mode: 'tts' as const, 
  text: repeatText, 
  lang: defaultLang 
};
```
- Uses `speech` if available, otherwise generates TTS
- **speech is OPTIONAL** - component generates TTS if missing

### Line 503: Pronunciation assessment
```typescript
referenceText: elementsList[currentElementIndex ?? 0]?.referenceText ?? elementsList[currentElementIndex ?? 0]?.samplePrompt ?? '',
```
- Uses `referenceText` for pronunciation assessment, falls back to `samplePrompt`
- **referenceText is OPTIONAL** - component handles missing case

## CMS Current Implementation

### What CMS Saves:
```typescript
{
  samplePrompt: string,      // Required
  referenceText: string,      // Always present (defaults to samplePrompt)
  speech: {
    mode: "file" | "tts",
    fileUrl?: string,         // Full Supabase URL if file mode
    lang?: string,            // "english"/"french"/"both" if TTS mode
    text?: string             // referenceText || samplePrompt if TTS mode
  }
}
```

### CMS Save Logic (lines 316-348):
1. Always includes `referenceText` (defaults to `samplePrompt` if empty) ✓
2. Always creates `speech` object if `audioPath` OR text exists ✗ **POTENTIAL ISSUE**
3. File URLs are full Supabase URLs ✗ **POTENTIAL ISSUE**
4. Language codes use `"english"`/`"french"` ✗ **POTENTIAL ISSUE**

## Critical Differences Found

### 1. File URL Format ⚠️ **CRITICAL**
- **Hardcoded**: `/audio/alphabet/A.wav` (relative path from public folder)
- **CMS**: `https://[project].supabase.co/storage/v1/object/public/lesson-audio/media-assets/...` (full URL)
- **Impact**: Player might not be able to load audio files from Supabase URLs
- **Solution**: Need to verify if player can handle Supabase URLs, or convert to relative paths

### 2. Language Code Format ⚠️ **CRITICAL**
- **Hardcoded**: `'en'` (from `defaultLang: 'en'`)
- **CMS**: `"english"`, `"french"`, or `"both"` (from `defaultLang` dropdown)
- **Impact**: TTS might fail if language code format is wrong
- **Solution**: Need to map CMS language values to player's `SupportedLang` format

### 3. Speech Object Always Present ⚠️ **MODERATE**
- **Hardcoded**: `speech` is optional - component generates TTS if missing
- **CMS**: Always creates `speech` object if audio OR text exists
- **Impact**: Should be fine, but might cause issues if format is wrong
- **Solution**: Ensure speech object format matches exactly

### 4. ReferenceText Always Present ✓ **OK**
- **Hardcoded**: `referenceText` is optional
- **CMS**: Always includes `referenceText` (defaults to `samplePrompt`)
- **Impact**: Should be fine - component handles both cases
- **Solution**: No change needed

## API Call Analysis (from `submitPronunciationAssessment.ts`)

### Line 34: API endpoint
```typescript
`/api/pronunciation-assessment?referenceText=${encodeURIComponent(referenceText)}`
```
- Sends `referenceText` as query parameter
- **Requires**: `referenceText` must be present (not empty)
- **CMS**: Always includes `referenceText` ✓

### Error at line 45-46:
```typescript
const body = await res.json().catch(() => ({}));
console.error('API error response:', body);
```
- Empty response `{}` suggests API endpoint might not exist or is misconfigured
- **Possible causes**:
  1. API route doesn't exist at `/api/pronunciation-assessment`
  2. API is returning empty response
  3. CORS or authentication issue

## Recommended Fixes

### Priority 1: Language Code Mapping
**Issue**: CMS uses `"english"`/`"french"` but player expects `"en"`/`"fr"`

**Fix**: Map CMS language values to player format:
```typescript
const langMap: Record<string, string> = {
  'english': 'en',
  'french': 'fr',
  'both': 'en', // or handle differently
};
const mappedLang = langMap[defaultLang] || defaultLang || 'en';
```

### Priority 2: File URL Format
**Issue**: CMS saves full Supabase URLs, hardcoded uses relative paths

**Fix Options**:
1. **Option A**: Keep full URLs but verify player can load them
2. **Option B**: Convert to relative paths (extract path from URL)
3. **Option C**: Use a different URL format that player expects

### Priority 3: Verify API Endpoint
**Issue**: Empty response suggests API might not exist

**Fix**: Check if `/api/pronunciation-assessment` route exists in OuiiSpeak repo

## Next Steps

1. **Check language code format**: Verify what `SupportedLang` type expects
2. **Test file URL loading**: Verify if player can load Supabase URLs
3. **Check API route**: Verify `/api/pronunciation-assessment` exists
4. **Update CMS save logic**: Map language codes and potentially adjust file URL format

