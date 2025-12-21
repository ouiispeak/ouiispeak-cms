import type { EditorField } from "./types";
import { DEFAULT_SLIDE_FIELDS } from "./defaultFields";

export type SlideTypePreset = {
  hiddenFieldKeys: string[];
};

// Code-defined presets. These are UI-only; they do not change saved data.
export const SLIDE_TYPE_PRESETS: Record<string, SlideTypePreset> = {
  default: { hiddenFieldKeys: [] },
  "text-slide": { hiddenFieldKeys: [] },
  text: { hiddenFieldKeys: [] },
  "title-slide": { hiddenFieldKeys: ["body", "note", "phrases", "defaultLang"] },
  "ai-speak-repeat": { hiddenFieldKeys: ["body", "note"] },
};

function buildFieldIndex(fields: EditorField[]): Record<string, EditorField> {
  return fields.reduce((acc, field) => {
    acc[field.key] = field;
    return acc;
  }, {} as Record<string, EditorField>);
}

const fieldIndex = buildFieldIndex(DEFAULT_SLIDE_FIELDS);

export function getVisibleFieldsForType(type?: string | null): EditorField[] {
  const normalized = (type || "default").trim() || "default";
  const preset = SLIDE_TYPE_PRESETS[normalized] || { hiddenFieldKeys: [] };
  const hidden = new Set(preset.hiddenFieldKeys);
  return DEFAULT_SLIDE_FIELDS.filter((field) => !hidden.has(field.key) || !fieldIndex[field.key]);
}

export function getPresetForType(type?: string | null): SlideTypePreset {
  const normalized = (type || "default").trim() || "default";
  return SLIDE_TYPE_PRESETS[normalized] || { hiddenFieldKeys: [] };
}

export function serializePreset(type: string, preset: SlideTypePreset): string {
  const normalized = type.trim() || "default";
  const payload: Record<string, SlideTypePreset> = {
    [normalized]: { hiddenFieldKeys: preset.hiddenFieldKeys },
  };
  return JSON.stringify(payload, null, 2);
}

