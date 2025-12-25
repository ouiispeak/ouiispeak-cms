/**
 * Canonical Field Schema
 * 
 * Single source of truth for all 88 possible form fields.
 * This is the complete definition of what fields can exist on slides.
 * 
 * Fields are categorized by purpose for logical grouping in the UI.
 */

import type { EditorField } from "./types";

export type FieldCategory = 
  | "system"
  | "core-content"
  | "language"
  | "media"
  | "timing"
  | "interaction"
  | "buttons"
  | "authoring-metadata"
  | "speech"
  | "choice"
  | "sequencing"
  | "matching"
  | "scoring"
  | "ai"
  | "visual"
  | "analytics"
  | "freeform";

export interface CanonicalField extends EditorField {
  category: FieldCategory;
}

/**
 * Canonical schema: All 88 fields that can exist on slides
 * 
 * System fields (4):
 * - slideId, slideType, groupId, orderIndex (read-only, from DB)
 * 
 * Content fields (64):
 * - Core content, language, media, timing, interaction, etc.
 * 
 * Authoring metadata (20):
 * - Stored in meta_json or DB columns
 */
export const CANONICAL_FIELDS: CanonicalField[] = [
  // System fields (read-only, from DB columns)
  {
    key: "slideId",
    label: "Slide UUID",
    helpText: "System UUID for the slide (read-only).",
    required: false,
    uiType: "text",
    category: "system",
  },
  {
    key: "slideType",
    label: "Slide type",
    helpText: "Type key used to select the editor (read-only).",
    required: false,
    uiType: "text",
    category: "system",
  },
  {
    key: "groupId",
    label: "Group UUID",
    helpText: "Owning group UUID (read-only).",
    required: false,
    uiType: "text",
    category: "system",
  },
  {
    key: "orderIndex",
    label: "Order index",
    helpText: "Sequence position in the group.",
    required: false,
    uiType: "number",
    category: "system",
  },

  // Core content
  {
    key: "label",
    label: "Label",
    helpText: "Internal name for this slide used in the CMS and navigation. Not shown to learners.",
    required: true,
    uiType: "text",
    category: "core-content",
  },
  {
    key: "title",
    label: "Title",
    helpText: "Primary heading for the slide.",
    required: false,
    uiType: "text",
    category: "core-content",
  },
  {
    key: "subtitle",
    label: "Subtitle",
    helpText: "Secondary heading or subtopic.",
    required: false,
    uiType: "text",
    category: "core-content",
  },
  {
    key: "body",
    label: "Body",
    helpText: "Main slide copy shown to learners.",
    required: false,
    uiType: "textarea",
    category: "core-content",
  },
  {
    key: "note",
    label: "Note (internal)",
    helpText: "Author-only notes; not shown to learners.",
    required: false,
    uiType: "textarea",
    category: "core-content",
  },

  // Language & localization
  {
    key: "defaultLang",
    label: "Default language",
    helpText: "Language hint for TTS or prompts.",
    required: false,
    uiType: "select",
    category: "language",
  },
  {
    key: "secondaryLang",
    label: "Secondary language",
    helpText: "Optional secondary language code.",
    required: false,
    uiType: "text",
    category: "language",
  },
  {
    key: "translation",
    label: "Translation",
    helpText: "Translated text or gloss.",
    required: false,
    uiType: "textarea",
    category: "language",
  },
  {
    key: "phoneticHint",
    label: "Phonetic hint",
    helpText: "IPA or custom phonetic guidance.",
    required: false,
    uiType: "text",
    category: "language",
  },

  // Media references
  {
    key: "imageId",
    label: "Image ID",
    helpText: "Reference ID for an image asset.",
    required: false,
    uiType: "text",
    category: "media",
  },
  {
    key: "imageUrl",
    label: "Image URL",
    helpText: "Direct URL for an image asset.",
    required: false,
    uiType: "text",
    category: "media",
  },
  {
    key: "audioId",
    label: "Audio ID",
    helpText: "Reference ID for an audio asset.",
    required: false,
    uiType: "text",
    category: "media",
  },
  {
    key: "videoId",
    label: "Video ID",
    helpText: "Reference ID for a video asset.",
    required: false,
    uiType: "text",
    category: "media",
  },
  {
    key: "lottieId",
    label: "Lottie ID",
    helpText: "Reference ID for a Lottie animation.",
    required: false,
    uiType: "text",
    category: "media",
  },
  {
    key: "waveformId",
    label: "Waveform ID",
    helpText: "Reference ID for waveform data.",
    required: false,
    uiType: "text",
    category: "media",
  },

  // Timing & flow
  {
    key: "delayMs",
    label: "Delay (ms)",
    helpText: "Suggested delay before showing content.",
    required: false,
    uiType: "number",
    category: "timing",
  },
  {
    key: "autoAdvance",
    label: "Auto-advance",
    helpText: "Suggest auto-advancing when complete.",
    required: false,
    uiType: "boolean",
    category: "timing",
  },
  {
    key: "minDuration",
    label: "Min duration (ms)",
    helpText: "Suggested minimum time on slide.",
    required: false,
    uiType: "number",
    category: "timing",
  },
  {
    key: "maxDuration",
    label: "Max duration (ms)",
    helpText: "Suggested maximum time on slide.",
    required: false,
    uiType: "number",
    category: "timing",
  },

  // Interaction flags
  {
    key: "isInteractive",
    label: "Is interactive",
    helpText: "Marks the slide as interactive-capable.",
    required: false,
    uiType: "boolean",
    category: "interaction",
  },
  {
    key: "requiresInput",
    label: "Requires input",
    helpText: "Learner must provide input to proceed.",
    required: false,
    uiType: "boolean",
    category: "interaction",
  },
  {
    key: "allowSkip",
    label: "Allow skip",
    helpText: "UI can expose a skip affordance.",
    required: false,
    uiType: "boolean",
    category: "interaction",
  },
  {
    key: "allowRetry",
    label: "Allow retry",
    helpText: "UI can expose a retry affordance.",
    required: false,
    uiType: "boolean",
    category: "interaction",
  },
  {
    key: "isActivity",
    label: "Is activity",
    helpText: "Marks whether the slide counts as an activity.",
    required: false,
    uiType: "boolean",
    category: "interaction",
  },

  // Buttons & affordances
  {
    key: "buttons",
    label: "Buttons",
    helpText: "Comma-separated list (next, back, replay, hint, skip, validate).",
    required: false,
    uiType: "textarea",
    category: "buttons",
  },

  // Authoring metadata (stored in meta_json)
  {
    key: "code",
    label: "Code",
    helpText: "Internal shorthand identifier.",
    required: false,
    uiType: "text",
    category: "authoring-metadata",
  },
  {
    key: "slideGoal",
    label: "Slide goal",
    helpText: "Outcome-focused intent for the slide.",
    required: false,
    uiType: "textarea",
    category: "authoring-metadata",
  },
  {
    key: "activityName",
    label: "Activity name",
    helpText: "Human-readable activity pattern name.",
    required: false,
    uiType: "text",
    category: "authoring-metadata",
  },
  {
    key: "requiresExternalTTS",
    label: "Requires external TTS",
    helpText: "Flag when external TTS is required.",
    required: false,
    uiType: "boolean",
    category: "authoring-metadata",
  },
  {
    key: "tags",
    label: "Tags",
    helpText: "Comma-separated internal tags.",
    required: false,
    uiType: "textarea",
    category: "authoring-metadata",
  },
  {
    key: "difficultyHint",
    label: "Difficulty hint",
    helpText: "Internal difficulty signal for planning.",
    required: false,
    uiType: "text",
    category: "authoring-metadata",
  },
  {
    key: "reviewWeight",
    label: "Review weight",
    helpText: "Optional weight for review scheduling.",
    required: false,
    uiType: "number",
    category: "authoring-metadata",
  },

  // Speech & audio interaction
  {
    key: "expectedSpeech",
    label: "Expected speech",
    helpText: "Target speech text or list.",
    required: false,
    uiType: "textarea",
    category: "speech",
  },
  {
    key: "speechMode",
    label: "Speech mode",
    helpText: "repeat, free, or choose.",
    required: false,
    uiType: "select",
    category: "speech",
  },
  {
    key: "minConfidence",
    label: "Min confidence",
    helpText: "Minimum confidence threshold.",
    required: false,
    uiType: "number",
    category: "speech",
  },
  {
    key: "showPronunciationHelp",
    label: "Show pronunciation help",
    helpText: "Expose pronunciation hints in UI.",
    required: false,
    uiType: "boolean",
    category: "speech",
  },
  {
    key: "phrases",
    label: "Phrases",
    helpText: "Scripted phrases content (per type).",
    required: false,
    uiType: "textarea",
    category: "speech",
  },

  // Choice & selection
  {
    key: "choices",
    label: "Choices",
    helpText: "List of choices (one per line or JSON).",
    required: false,
    uiType: "textarea",
    category: "choice",
  },
  {
    key: "correctChoiceIds",
    label: "Correct choice IDs",
    helpText: "List of correct choice IDs.",
    required: false,
    uiType: "textarea",
    category: "choice",
  },
  {
    key: "allowMultiple",
    label: "Allow multiple",
    helpText: "Allow multiple selections.",
    required: false,
    uiType: "boolean",
    category: "choice",
  },
  {
    key: "shuffleChoices",
    label: "Shuffle choices",
    helpText: "Shuffle the choice order.",
    required: false,
    uiType: "boolean",
    category: "choice",
  },

  // Sequencing & grouping
  {
    key: "items",
    label: "Items",
    helpText: "Sequence items (JSON or one per line).",
    required: false,
    uiType: "textarea",
    category: "sequencing",
  },
  {
    key: "groups",
    label: "Groups",
    helpText: "Grouping definitions (JSON or one per line).",
    required: false,
    uiType: "textarea",
    category: "sequencing",
  },
  {
    key: "chunks",
    label: "Chunks",
    helpText: "Chunk definitions (JSON or one per line).",
    required: false,
    uiType: "textarea",
    category: "sequencing",
  },

  // Matching / mapping
  {
    key: "pairs",
    label: "Pairs",
    helpText: "Matching pairs (JSON or one per line).",
    required: false,
    uiType: "textarea",
    category: "matching",
  },
  {
    key: "dragTargets",
    label: "Drag targets",
    helpText: "Drag target definitions.",
    required: false,
    uiType: "textarea",
    category: "matching",
  },
  {
    key: "dropZones",
    label: "Drop zones",
    helpText: "Drop zone definitions.",
    required: false,
    uiType: "textarea",
    category: "matching",
  },

  // Scoring hints
  {
    key: "scoreType",
    label: "Score type",
    helpText: "none, confidence, or accuracy.",
    required: false,
    uiType: "select",
    category: "scoring",
  },
  {
    key: "passThreshold",
    label: "Pass threshold",
    helpText: "Suggested threshold for passing.",
    required: false,
    uiType: "number",
    category: "scoring",
  },
  {
    key: "maxScoreValue",
    label: "Max score",
    helpText: "Optional maximum score.",
    required: false,
    uiType: "number",
    category: "scoring",
  },
  {
    key: "passRequiredForNext",
    label: "Pass required for next",
    helpText: "Require passing score to proceed.",
    required: false,
    uiType: "boolean",
    category: "scoring",
  },
  {
    key: "showScoreToLearner",
    label: "Show score to learner",
    helpText: "Expose score results in UI.",
    required: false,
    uiType: "boolean",
    category: "scoring",
  },

  // AI / agent behavior hints
  {
    key: "aiPrompt",
    label: "AI prompt",
    helpText: "Prompt context for AI behaviors.",
    required: false,
    uiType: "textarea",
    category: "ai",
  },
  {
    key: "aiPersona",
    label: "AI persona",
    helpText: "Persona or tone guidance.",
    required: false,
    uiType: "text",
    category: "ai",
  },
  {
    key: "aiResponseMode",
    label: "AI response mode",
    helpText: "reactive, scripted, or mixed.",
    required: false,
    uiType: "select",
    category: "ai",
  },
  {
    key: "aiMemoryKey",
    label: "AI memory key",
    helpText: "Key for shared agent memory.",
    required: false,
    uiType: "text",
    category: "ai",
  },

  // Visual behavior hints
  {
    key: "layoutVariant",
    label: "Layout variant",
    helpText: "Layout variant or template key.",
    required: false,
    uiType: "text",
    category: "visual",
  },
  {
    key: "emphasisTarget",
    label: "Emphasis target",
    helpText: "Primary element to emphasize.",
    required: false,
    uiType: "text",
    category: "visual",
  },
  {
    key: "highlightMode",
    label: "Highlight mode",
    helpText: "Highlight behavior hint.",
    required: false,
    uiType: "text",
    category: "visual",
  },
  {
    key: "animationPreset",
    label: "Animation preset",
    helpText: "Animation preset key.",
    required: false,
    uiType: "text",
    category: "visual",
  },

  // Analytics & observation
  {
    key: "trackEvents",
    label: "Track events",
    helpText: "Enable event tracking.",
    required: false,
    uiType: "boolean",
    category: "analytics",
  },
  {
    key: "eventLabels",
    label: "Event labels",
    helpText: "Comma-separated event labels.",
    required: false,
    uiType: "textarea",
    category: "analytics",
  },
  {
    key: "debugNotes",
    label: "Debug notes",
    helpText: "Internal debug notes.",
    required: false,
    uiType: "textarea",
    category: "analytics",
  },

  // Freeform / escape hatch
  {
    key: "customProps",
    label: "Custom props",
    helpText: "Freeform JSON escape hatch.",
    required: false,
    uiType: "json",
    category: "freeform",
  },
];

/**
 * Get field by key
 */
export function getFieldByKey(key: string): CanonicalField | undefined {
  return CANONICAL_FIELDS.find((field) => field.key === key);
}

/**
 * Get all fields in a category
 */
export function getFieldsByCategory(category: FieldCategory): CanonicalField[] {
  return CANONICAL_FIELDS.filter((field) => field.category === category);
}

/**
 * Get all field keys
 */
export function getAllFieldKeys(): string[] {
  return CANONICAL_FIELDS.map((field) => field.key);
}

/**
 * Required field: label is always available
 */
export const REQUIRED_FIELD_KEY = "label";

