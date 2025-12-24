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
 * Gets visible fields for a slide type using the resolver.
 *
 * IMPORTANT:
 * Hiding a field only affects the editor UI.
 * Slide data is never deleted automatically.
 * See ADR-001 for schema evolution rules.
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

/**
 * Gets selectable slide types with labels (excludes "default" and types without proper definitions)
 * Returns unique, sorted list of type keys that have valid editor definitions
 */
export function getSelectableSlideTypes(): string[] {
  const config = getPresetsConfig();
  const typeKeys = Object.keys(config.presets).filter((type) => type !== "default");
  
  // Deduplicate and return sorted
  return Array.from(new Set(typeKeys)).sort();
}

/**
 * Gets selectable slide types with their labels for dropdowns
 * Excludes "default" and types without proper definitions
 * Returns array of { key, label } objects, sorted by label
 * 
 * @param getSlideEditorDefinitionFn - Function to get editor definition (passed to avoid circular dependency)
 */
export function getSelectableSlideTypesWithLabels(
  getSlideEditorDefinitionFn?: (type: string) => { type: string; label: string }
): Array<{ key: string; label: string }> {
  // Lazy import to avoid circular dependency
  if (!getSlideEditorDefinitionFn) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const registry = require("./index");
    getSlideEditorDefinitionFn = registry.getSlideEditorDefinition;
  }
  
  const typeKeys = getSelectableSlideTypes();
  const result: Array<{ key: string; label: string }> = [];
  const seenLabels = new Set<string>();
  
  for (const typeKey of typeKeys) {
    // Skip "default" explicitly (defense in depth)
    if (typeKey === "default") {
      continue;
    }
    
    const definition = getSlideEditorDefinitionFn?.(typeKey);
    if (!definition) continue;
    
    // Skip if this is the default/fallback definition (indicates missing definition)
    // Check by comparing the definition type or label
    if (definition.type === "default" && typeKey !== "default") {
      // This type doesn't have a proper definition - exclude it
      if (process.env.NODE_ENV === "development") {
        console.warn(`[SlideType] Type "${typeKey}" has no definition, excluding from selectable types`);
      }
      continue;
    }
    
    // Skip if label is "Default" and this isn't actually the default type
    if (definition.label === "Default" && typeKey !== "default") {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[SlideType] Type "${typeKey}" resolved to "Default" label, excluding from selectable types`);
      }
      continue;
    }
    
    // Skip duplicates by label (if same label already seen, skip this one)
    if (seenLabels.has(definition.label)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[SlideType] Type "${typeKey}" has duplicate label "${definition.label}", excluding`);
      }
      continue;
    }
    
    seenLabels.add(definition.label);
    result.push({
      key: typeKey,
      label: definition.label || `[Missing definition] ${typeKey}`,
    });
  }
  
  // Sort by label for usability
  result.sort((a, b) => a.label.localeCompare(b.label));
  
  // Debug output (dev only)
  if (process.env.NODE_ENV === "development") {
    console.log("[SlideType] Selectable types:", result.map((r) => `${r.key} -> "${r.label}"`).join(", "));
  }
  
  return result;
}

