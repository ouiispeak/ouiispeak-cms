import type { EditorField } from "./types";

/**
 * Field grouping configuration for organizing editor fields into logical categories.
 * Used by both slide editors and slide type preset editors to maintain consistent grouping.
 */
export const FIELD_GROUPS = [
  {
    id: "layer1-identity",
    title: "Identity & structure",
    keys: ["slideId", "slideType", "groupId", "orderIndex", "label"],
  },
  {
    id: "layer1-core",
    title: "Core content",
    keys: ["title", "subtitle", "body", "note"],
  },
  {
    id: "layer1-language",
    title: "Language & localization",
    keys: ["defaultLang", "secondaryLang", "translation", "phoneticHint"],
  },
  {
    id: "layer1-media",
    title: "Media references",
    keys: ["imageId", "imageUrl", "audioId", "videoId", "lottieId", "waveformId"],
  },
  {
    id: "layer1-timing",
    title: "Timing & flow",
    keys: ["delayMs", "autoAdvance", "minDuration", "maxDuration"],
  },
  {
    id: "layer1-interaction",
    title: "Interaction flags",
    keys: ["isInteractive", "requiresInput", "allowSkip", "allowRetry", "isActivity"],
  },
  {
    id: "layer1-buttons",
    title: "Buttons & affordances",
    keys: ["buttons"],
  },
  {
    id: "layer1-metadata",
    title: "Authoring metadata",
    keys: [
      "code",
      "slideGoal",
      "activityName",
      "requiresExternalTTS",
      "tags",
      "difficultyHint",
      "reviewWeight",
    ],
  },
  {
    id: "layer1-freeform",
    title: "Freeform / escape hatch",
    keys: ["customProps"],
  },
  {
    id: "layer2-speech",
    title: "Speech & audio interaction",
    keys: ["expectedSpeech", "speechMode", "minConfidence", "showPronunciationHelp", "phrases"],
  },
  {
    id: "layer2-choice",
    title: "Choice & selection",
    keys: ["choices", "correctChoiceIds", "allowMultiple", "shuffleChoices"],
  },
  {
    id: "layer2-sequencing",
    title: "Sequencing & grouping",
    keys: ["items", "groups", "chunks"],
  },
  {
    id: "layer2-matching",
    title: "Matching / mapping",
    keys: ["pairs", "dragTargets", "dropZones"],
  },
  {
    id: "layer2-scoring",
    title: "Scoring hints",
    keys: ["scoreType", "passThreshold", "maxScoreValue", "passRequiredForNext", "showScoreToLearner"],
  },
  {
    id: "layer3-ai",
    title: "AI / agent behavior hints",
    keys: ["aiPrompt", "aiPersona", "aiResponseMode", "aiMemoryKey"],
  },
  {
    id: "layer3-visual",
    title: "Visual behavior hints",
    keys: ["layoutVariant", "emphasisTarget", "highlightMode", "animationPreset"],
  },
  {
    id: "layer3-analytics",
    title: "Analytics & observation",
    keys: ["trackEvents", "eventLabels", "debugNotes"],
  },
] as const;

export type FieldGroup = {
  id: string;
  title: string;
  keys: readonly string[];
};

export type GroupedFieldResult = {
  id: string;
  title: string;
  keys: readonly string[];
  fields: EditorField[];
};

/**
 * Groups editor fields into categories based on FIELD_GROUPS configuration.
 * Fields that don't match any group are placed in an "Other" group.
 *
 * @param fields - Array of editor fields to group
 * @returns Array of grouped field results, each containing the group metadata and matching fields
 */
export function groupFieldsForDisplay(fields: EditorField[]): GroupedFieldResult[] {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const used = new Set<string>();

  const grouped: GroupedFieldResult[] = FIELD_GROUPS.map((group) => {
    const groupFields = group.keys
      .map((key) => {
        const field = byKey.get(key);
        if (field) used.add(key);
        return field;
      })
      .filter(Boolean) as EditorField[];
    return { ...group, fields: groupFields };
  }).filter((group) => group.fields.length > 0);

  const remaining = fields.filter((field) => !used.has(field.key));
  if (remaining.length > 0) {
    grouped.push({
      id: "layer1-other",
      title: "Other",
      keys: [],
      fields: remaining,
    });
  }

  return grouped;
}

