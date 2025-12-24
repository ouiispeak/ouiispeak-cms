/**
 * Select field options for dropdown/select inputs.
 * Single source of truth for select option lists used across all slide editors.
 */

export type SelectOption = {
  value: string;
  label: string;
};

/**
 * Select options mapped by field key.
 * Used by field rendering logic to populate select dropdowns.
 */
export const SELECT_OPTIONS_BY_KEY: Record<string, SelectOption[]> = {
  defaultLang: [
    { value: "auto", label: "Auto" },
    { value: "en", label: "English (en)" },
    { value: "fr", label: "French (fr)" },
  ],
  speechMode: [
    { value: "repeat", label: "Repeat" },
    { value: "free", label: "Free" },
    { value: "choose", label: "Choose" },
  ],
  scoreType: [
    { value: "none", label: "None" },
    { value: "confidence", label: "Confidence" },
    { value: "accuracy", label: "Accuracy" },
    { value: "percent", label: "Percent (legacy)" },
    { value: "raw", label: "Raw (legacy)" },
  ],
  aiResponseMode: [
    { value: "reactive", label: "Reactive" },
    { value: "scripted", label: "Scripted" },
    { value: "mixed", label: "Mixed" },
  ],
};

/**
 * Gets select options for a field key, or undefined if no options exist.
 */
export function getSelectOptions(fieldKey: string): SelectOption[] | undefined {
  return SELECT_OPTIONS_BY_KEY[fieldKey];
}

