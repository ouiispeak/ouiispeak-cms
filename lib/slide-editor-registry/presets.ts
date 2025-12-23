import type { EditorField } from "./types";
import { DEFAULT_SLIDE_FIELDS } from "./defaultFields";
import {
  resolveSlideTypeVisibility,
  type SlideTypePresetsConfig,
  getDefaultPresetsConfig,
} from "./resolver";
import { loadPresetsFromStorage } from "./presetStorage";

export type SlideTypePreset = {
  hiddenFieldKeys: string[];
};

// Code-defined presets (fallback defaults). These are merged with localStorage presets.
export const CODE_DEFAULT_PRESETS: Record<string, SlideTypePreset> = {
  default: { hiddenFieldKeys: [] },
  "text-slide": { hiddenFieldKeys: [] },
  text: { hiddenFieldKeys: [] },
  "title-slide": { hiddenFieldKeys: ["body", "note", "phrases", "defaultLang"] },
  "ai-speak-repeat": { hiddenFieldKeys: ["body", "note"] },
};

/**
 * Gets the current preset configuration (localStorage-backed, falls back to code defaults)
 */
function getPresetsConfig(): SlideTypePresetsConfig {
  const stored = loadPresetsFromStorage();
  const codeDefaults = getDefaultPresetsConfig();

  // Merge code defaults into stored presets (code defaults take precedence for missing types)
  const merged: SlideTypePresetsConfig = {
    version: stored.version,
    presets: { ...stored.presets },
  };

  // Ensure default preset exists
  if (!merged.presets.default) {
    merged.presets.default = CODE_DEFAULT_PRESETS.default || { hiddenFieldKeys: [] };
  }

  // Add code defaults for types not in storage
  for (const [type, preset] of Object.entries(CODE_DEFAULT_PRESETS)) {
    if (!merged.presets[type]) {
      merged.presets[type] = preset;
    }
  }

  return merged;
}

/**
 * Gets visible fields for a slide type using the resolver
 */
export function getVisibleFieldsForType(type?: string | null): EditorField[] {
  const normalized = (type || "default").trim() || "default";
  const config = getPresetsConfig();
  const result = resolveSlideTypeVisibility(normalized, DEFAULT_SLIDE_FIELDS, config);
  return DEFAULT_SLIDE_FIELDS.filter((field) => result.visibleKeys.has(field.key));
}

/**
 * Gets preset for a specific type (returns effective hidden keys including inheritance)
 */
export function getPresetForType(type?: string | null): SlideTypePreset {
  const normalized = (type || "default").trim() || "default";
  const config = getPresetsConfig();
  const result = resolveSlideTypeVisibility(normalized, DEFAULT_SLIDE_FIELDS, config);
  return {
    hiddenFieldKeys: Array.from(result.hiddenKeys),
  };
}

/**
 * Gets the raw preset config (for editor use)
 */
export function getPresetsConfigForEditor(): SlideTypePresetsConfig {
  return getPresetsConfig();
}

/**
 * Serializes the full preset config for export
 */
export function serializePresetConfig(config: SlideTypePresetsConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Serializes a single preset (legacy format for backward compatibility)
 */
export function serializePreset(type: string, preset: SlideTypePreset): string {
  const normalized = type.trim() || "default";
  const config = getPresetsConfigForEditor();
  const payload: SlideTypePresetsConfig = {
    version: config.version,
    presets: {
      ...config.presets,
      [normalized]: { hiddenFieldKeys: preset.hiddenFieldKeys },
    },
  };
  return serializePresetConfig(payload);
}

