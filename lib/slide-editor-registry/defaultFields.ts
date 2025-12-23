import type { EditorField } from "./types";

// Canonical superset of fields that can appear on any slide editor.
export const DEFAULT_SLIDE_FIELDS: EditorField[] = [
  { key: "slideId", label: "Slide UUID", helpText: "System UUID for the slide (read-only).", required: false, uiType: "text" },
  { key: "slideType", label: "Slide type", helpText: "Type key used to select the editor (read-only).", required: false, uiType: "text" },
  { key: "groupId", label: "Group UUID", helpText: "Owning group UUID (read-only).", required: false, uiType: "text" },
  { key: "orderIndex", label: "Order index", helpText: "Sequence position in the group.", required: false, uiType: "number" },

  { key: "title", label: "Title", helpText: "Primary heading for the slide.", required: false, uiType: "text" },
  { key: "subtitle", label: "Subtitle", helpText: "Secondary heading or subtopic.", required: false, uiType: "text" },
  { key: "body", label: "Body", helpText: "Main slide copy shown to learners.", required: false, uiType: "textarea" },
  { key: "note", label: "Note (internal)", helpText: "Author-only notes; not shown to learners.", required: false, uiType: "textarea" },

  { key: "defaultLang", label: "Default language", helpText: "Language hint for TTS or prompts.", required: false, uiType: "select" },
  { key: "secondaryLang", label: "Secondary language", helpText: "Optional secondary language code.", required: false, uiType: "text" },
  { key: "translation", label: "Translation", helpText: "Translated text or gloss.", required: false, uiType: "textarea" },
  { key: "phoneticHint", label: "Phonetic hint", helpText: "IPA or custom phonetic guidance.", required: false, uiType: "text" },

  { key: "imageId", label: "Image ID", helpText: "Reference ID for an image asset.", required: false, uiType: "text" },
  { key: "imageUrl", label: "Image URL", helpText: "Direct URL for an image asset.", required: false, uiType: "text" },
  { key: "audioId", label: "Audio ID", helpText: "Reference ID for an audio asset.", required: false, uiType: "text" },
  { key: "videoId", label: "Video ID", helpText: "Reference ID for a video asset.", required: false, uiType: "text" },
  { key: "lottieId", label: "Lottie ID", helpText: "Reference ID for a Lottie animation.", required: false, uiType: "text" },
  { key: "waveformId", label: "Waveform ID", helpText: "Reference ID for waveform data.", required: false, uiType: "text" },

  { key: "delayMs", label: "Delay (ms)", helpText: "Suggested delay before showing content.", required: false, uiType: "number" },
  { key: "autoAdvance", label: "Auto-advance", helpText: "Suggest auto-advancing when complete.", required: false, uiType: "boolean" },
  { key: "minDuration", label: "Min duration (ms)", helpText: "Suggested minimum time on slide.", required: false, uiType: "number" },
  { key: "maxDuration", label: "Max duration (ms)", helpText: "Suggested maximum time on slide.", required: false, uiType: "number" },

  { key: "isInteractive", label: "Is interactive", helpText: "Marks the slide as interactive-capable.", required: false, uiType: "boolean" },
  { key: "requiresInput", label: "Requires input", helpText: "Learner must provide input to proceed.", required: false, uiType: "boolean" },
  { key: "allowSkip", label: "Allow skip", helpText: "UI can expose a skip affordance.", required: false, uiType: "boolean" },
  { key: "allowRetry", label: "Allow retry", helpText: "UI can expose a retry affordance.", required: false, uiType: "boolean" },
  { key: "isActivity", label: "Is activity", helpText: "Marks whether the slide counts as an activity.", required: false, uiType: "boolean" },

  { key: "buttons", label: "Buttons", helpText: "Comma-separated list (next, back, replay, hint, skip, validate).", required: false, uiType: "textarea" },

  { key: "code", label: "Code", helpText: "Internal shorthand identifier.", required: false, uiType: "text" },
  { key: "slideGoal", label: "Slide goal", helpText: "Outcome-focused intent for the slide.", required: false, uiType: "textarea" },
  { key: "activityName", label: "Activity name", helpText: "Human-readable activity pattern name.", required: false, uiType: "text" },
  { key: "requiresExternalTTS", label: "Requires external TTS", helpText: "Flag when external TTS is required.", required: false, uiType: "boolean" },
  { key: "tags", label: "Tags", helpText: "Comma-separated internal tags.", required: false, uiType: "textarea" },
  { key: "difficultyHint", label: "Difficulty hint", helpText: "Internal difficulty signal for planning.", required: false, uiType: "text" },
  { key: "reviewWeight", label: "Review weight", helpText: "Optional weight for review scheduling.", required: false, uiType: "number" },

  { key: "expectedSpeech", label: "Expected speech", helpText: "Target speech text or list.", required: false, uiType: "textarea" },
  { key: "speechMode", label: "Speech mode", helpText: "repeat, free, or choose.", required: false, uiType: "select" },
  { key: "minConfidence", label: "Min confidence", helpText: "Minimum confidence threshold.", required: false, uiType: "number" },
  { key: "showPronunciationHelp", label: "Show pronunciation help", helpText: "Expose pronunciation hints in UI.", required: false, uiType: "boolean" },
  { key: "phrases", label: "Phrases", helpText: "Scripted phrases content (per type).", required: false, uiType: "textarea" },

  { key: "choices", label: "Choices", helpText: "List of choices (one per line or JSON).", required: false, uiType: "textarea" },
  { key: "correctChoiceIds", label: "Correct choice IDs", helpText: "List of correct choice IDs.", required: false, uiType: "textarea" },
  { key: "allowMultiple", label: "Allow multiple", helpText: "Allow multiple selections.", required: false, uiType: "boolean" },
  { key: "shuffleChoices", label: "Shuffle choices", helpText: "Shuffle the choice order.", required: false, uiType: "boolean" },

  { key: "items", label: "Items", helpText: "Sequence items (JSON or one per line).", required: false, uiType: "textarea" },
  { key: "groups", label: "Groups", helpText: "Grouping definitions (JSON or one per line).", required: false, uiType: "textarea" },
  { key: "chunks", label: "Chunks", helpText: "Chunk definitions (JSON or one per line).", required: false, uiType: "textarea" },

  { key: "pairs", label: "Pairs", helpText: "Matching pairs (JSON or one per line).", required: false, uiType: "textarea" },
  { key: "dragTargets", label: "Drag targets", helpText: "Drag target definitions.", required: false, uiType: "textarea" },
  { key: "dropZones", label: "Drop zones", helpText: "Drop zone definitions.", required: false, uiType: "textarea" },

  { key: "scoreType", label: "Score type", helpText: "none, confidence, or accuracy.", required: false, uiType: "select" },
  { key: "passThreshold", label: "Pass threshold", helpText: "Suggested threshold for passing.", required: false, uiType: "number" },
  { key: "maxScoreValue", label: "Max score", helpText: "Optional maximum score.", required: false, uiType: "number" },
  { key: "passRequiredForNext", label: "Pass required for next", helpText: "Require passing score to proceed.", required: false, uiType: "boolean" },
  { key: "showScoreToLearner", label: "Show score to learner", helpText: "Expose score results in UI.", required: false, uiType: "boolean" },

  { key: "aiPrompt", label: "AI prompt", helpText: "Prompt context for AI behaviors.", required: false, uiType: "textarea" },
  { key: "aiPersona", label: "AI persona", helpText: "Persona or tone guidance.", required: false, uiType: "text" },
  { key: "aiResponseMode", label: "AI response mode", helpText: "reactive, scripted, or mixed.", required: false, uiType: "select" },
  { key: "aiMemoryKey", label: "AI memory key", helpText: "Key for shared agent memory.", required: false, uiType: "text" },

  { key: "layoutVariant", label: "Layout variant", helpText: "Layout variant or template key.", required: false, uiType: "text" },
  { key: "emphasisTarget", label: "Emphasis target", helpText: "Primary element to emphasize.", required: false, uiType: "text" },
  { key: "highlightMode", label: "Highlight mode", helpText: "Highlight behavior hint.", required: false, uiType: "text" },
  { key: "animationPreset", label: "Animation preset", helpText: "Animation preset key.", required: false, uiType: "text" },

  { key: "trackEvents", label: "Track events", helpText: "Enable event tracking.", required: false, uiType: "boolean" },
  { key: "eventLabels", label: "Event labels", helpText: "Comma-separated event labels.", required: false, uiType: "textarea" },
  { key: "debugNotes", label: "Debug notes", helpText: "Internal debug notes.", required: false, uiType: "textarea" },

  { key: "customProps", label: "Custom props", helpText: "Freeform JSON escape hatch.", required: false, uiType: "json" },
];
