# Pronunciation Assessment Error Investigation

## Error Details
- **Location**: Player app (`submitPronunciationAssessment.ts:46`)
- **Error**: API returning empty response `{}`
- **Context**: Happening when submitting pronunciation assessment for `ai-speak-student-repeat` slides

## Current CMS Data Structure

### What CMS Saves for `ai-speak-student-repeat` Elements:

```typescript
{
  samplePrompt: string,  // Required
  referenceText?: string, // Optional
  speech: {
    mode: "file" | "tts",
    // If mode === "file":
    fileUrl: string,  // Full Supabase public URL
    // If mode === "tts":
    lang: string,     // e.g., "en", "fr", "both"
    text: string     // Uses referenceText || samplePrompt
  }
}
```

### Example Saved Data:
```json
{
  "elements": [
    {
      "samplePrompt": "Bonjour",
      "referenceText": "Bonjour",
      "speech": {
        "mode": "file",
        "fileUrl": "https://[project].supabase.co/storage/v1/object/public/lesson-audio/media-assets/global/letters/bonjour.wav"
      }
    }
  ]
}
```

## Potential Issues

### 1. Missing `referenceText` for Pronunciation Assessment
- **Issue**: `referenceText` is optional in CMS, but pronunciation assessment API likely requires it
- **Impact**: If `referenceText` is missing, the API has nothing to compare against
- **Fix Needed**: Ensure `referenceText` is always present when speech assessment is needed

### 2. File URL Format
- **Current**: CMS saves full Supabase public URL (`https://...supabase.co/storage/v1/object/public/...`)
- **Question**: Does the player/API expect:
  - Full URL (current)?
  - Relative path (`media-assets/global/letters/bonjour.wav`)?
  - Bucket + path (`lesson-audio/media-assets/...`)?

### 3. API Endpoint Configuration
- **Error shows**: Empty response `{}` from API
- **Possible causes**:
  - API endpoint doesn't exist or is misconfigured
  - API expects different request format
  - Missing required fields in request payload
  - CORS or authentication issues

### 4. Data Structure Mismatch
- **Player might expect**:
  - Different field names
  - Additional required fields (e.g., `expectedText`, `targetText`)
  - Different `speech` object structure

## Recommendations

### Immediate Checks:
1. **Verify `referenceText` is always set**: For pronunciation assessment to work, `referenceText` should be required (or default to `samplePrompt` if not provided)
2. **Check player code**: Review `submitPronunciationAssessment.ts` to see:
   - What data it sends to the API
   - What fields it expects from the slide data
   - What the API endpoint URL is
3. **Check API endpoint**: Verify the pronunciation assessment API exists and is configured correctly

### Potential CMS Fixes:
1. **Make `referenceText` required** or auto-populate from `samplePrompt` if missing
2. **Add validation** to ensure elements have required fields for pronunciation assessment
3. **Check file URL format** - verify if player expects full URL or relative path

## Next Steps
1. Review player code (`submitPronunciationAssessment.ts` and `OpenSourcePronunciation.tsx`)
2. Check API endpoint configuration and expected request format
3. Compare CMS saved data with what player expects
4. Test with a slide that has `referenceText` set vs. one without

