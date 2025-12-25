# AI Speak Student Choose Implementation

## Summary

Successfully implemented `ai-speak-student-choose` slide type in the CMS, based on the `SpeechMatchSlide` component structure from the player repo.

## Props Structure

### Required Props
- `title: string` - Primary heading for the slide
- `elements: Array<{label: string, speech: SpeechContent}>` - Array of choice options
  - Each element has:
    - `label: string` - Display text for the choice button
    - `speech: {mode: 'tts' | 'file', lang?: 'en' | 'fr', text?: string, fileUrl?: string}` - Audio to play

### Optional Props
- `subtitle?: string` - Instructions shown to learners (e.g., "Écoute et clique sur la lettre que tu entends")
- `note?: string` - Optional note displayed below subtitle
- `defaultLang?: 'en' | 'fr'` - Default language for TTS fallback
- `hideTitle?: boolean` - Whether to hide the title

## Example JSON

```json
{
  "title": "Speech Match - Alphabet",
  "subtitle": "Écoute et clique sur la lettre que tu entends",
  "note": "",
  "defaultLang": "en",
  "elements": [
    {
      "label": "A",
      "speech": {
        "mode": "file",
        "fileUrl": "/audio/alphabet/A.wav"
      }
    },
    {
      "label": "B",
      "speech": {
        "mode": "tts",
        "lang": "en",
        "text": "B"
      }
    }
  ]
}
```

## Implementation Details

### Files Modified

1. **`app/group-slides/[groupId]/page.tsx`**
   - Added `ai-speak-student-choose` to slide type dropdown

2. **`app/manage-slides/page.tsx`**
   - Added `choiceElements` and `note` state variables
   - Added conditional rendering for `ai-speak-student-choose` fields:
     - Title, Subtitle, Note fields in Core Content section
     - ChoiceElementMapper in Speech & Audio Interaction section
   - Updated conditional rendering to hide Title/Subtitle/Body for `ai-speak-student-choose`

3. **`app/edit-slide/[slideId]/page.tsx`**
   - Added `choiceElements` and `note` state variables
   - Added loading logic for `ai-speak-student-choose` fields
   - Added save logic to convert `choiceElements` to `elements` array with proper structure
   - Added conditional rendering matching `manage-slides` page

4. **`components/ui/ChoiceElementMapper.tsx`** (NEW)
   - Component for managing choice elements
   - Supports both TTS and file-based audio
   - Allows adding/removing elements
   - Each element has: label, speech mode (tts/file), language, text/fileUrl

5. **`lib/hooks/useLessonManager.ts`**
   - Added default props for `ai-speak-student-choose`:
     ```typescript
     {
       title: "New ai-speak-student-choose slide",
       subtitle: "Écoute et clique sur la lettre que tu entends",
       elements: []
     }
     ```

## Usage

1. **Creating a new slide:**
   - Go to group management page
   - Select "AI Speak Student Choose" from slide type dropdown
   - Fill in title, subtitle, and add choice elements

2. **Editing an existing slide:**
   - Navigate to edit slide page
   - Fields will automatically show/hide based on slide type
   - Use ChoiceElementMapper to add/edit choice options

3. **Choice Elements:**
   - Each element represents a clickable choice option
   - Students hear the audio and click on the matching label
   - Supports both TTS (text-to-speech) and file-based audio
   - Language can be set per element or use default language

## Player Compatibility

The CMS saves data in the exact format expected by the `SpeechMatchSlide` component in the player:
- `elements` array with `label` and `speech` objects
- `speech` object with `mode`, `lang`, `text` (for TTS) or `fileUrl` (for file)
- Language codes are mapped from CMS format ("english"/"french") to player format ("en"/"fr")

## Notes

- The slide type is saved exactly as `ai-speak-student-choose` in the database
- All data is stored in `slides.props_json` (no new database columns)
- The implementation follows the same pattern as `ai-speak-student-repeat`
- Conditional rendering ensures only relevant fields are shown for each slide type

