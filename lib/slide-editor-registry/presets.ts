import type { EditorField } from "./types";
import { DEFAULT_SLIDE_FIELDS } from "./defaultFields";
import {
  resolveSlideTypeVisibility,
  type SlideTypePresetsConfig,
  getDefaultPresetsConfig,
} from "./resolver";
import { loadPresetsFromStorage } from "./presetStorage";

export type SlideTypePreset = {
  hiddenFieldKeys?: string[];
  visibleFieldKeys?: string[];
};

/**
 * Converts hiddenFieldKeys to visibleFieldKeys for non-default types.
 * This is used to initialize CODE_DEFAULT_PRESETS in the new format.
 */
function computeVisibleFieldKeys(hiddenFieldKeys: string[]): string[] {
  const hiddenSet = new Set(hiddenFieldKeys);
  return DEFAULT_SLIDE_FIELDS
    .filter((field) => !hiddenSet.has(field.key))
    .map((field) => field.key);
}

// Code-defined presets (fallback defaults). These are merged with localStorage presets.
// OPT-IN MODEL: Fields start hidden by default, users explicitly enable what they need.
// For "default": uses hiddenFieldKeys (everything hidden except what's not in the list)
// For non-default types: uses visibleFieldKeys (explicit allowlist, minimal opt-in)
export const CODE_DEFAULT_PRESETS: Record<string, SlideTypePresetsConfig["presets"][string]> = {
  // Default: All fields hidden except "label" (required field)
  // This means hiddenFieldKeys contains all fields EXCEPT "label"
  default: {
    hiddenFieldKeys: DEFAULT_SLIDE_FIELDS
      .filter((field) => field.key !== "label")
      .map((field) => field.key),
  },
  // Child types: Start with minimal visible fields (only required "label")
  // Users must opt-in to additional fields from Default's Available list
  "text-slide": { visibleFieldKeys: ["label"] },
  text: { visibleFieldKeys: ["label"] },
  "title-slide": { visibleFieldKeys: ["label"] },
  "ai-speak-repeat": { visibleFieldKeys: ["label"] },
};

/**
 * Gets the current preset configuration (localStorage-backed, falls back to code defaults)
 * Merges code defaults with stored presets, ensuring code defaults are used for empty/invalid presets
 */
export function getPresetsConfig(): SlideTypePresetsConfig {
  const stored = loadPresetsFromStorage();
  const codeDefaults = getDefaultPresetsConfig();

  // Merge code defaults into stored presets (code defaults take precedence for missing types)
  const merged: SlideTypePresetsConfig = {
    version: stored.version,
    presets: { ...stored.presets },
  };

  // Always use code default for "default" type to ensure opt-in model is enforced
  // Old localStorage presets may have hiddenFieldKeys: [] (all visible), which conflicts with opt-in model
  // Code default has all fields hidden except "label" (opt-in model)
  merged.presets.default = CODE_DEFAULT_PRESETS.default || { hiddenFieldKeys: [] };

  // Add code defaults for types not in storage OR types with empty/invalid presets
  for (const [type, preset] of Object.entries(CODE_DEFAULT_PRESETS)) {
    if (type === "default") {
      // Already handled above - always use code default
      continue;
    }
    const existingPreset = merged.presets[type];
    // Use code default if:
    // 1. No preset exists, OR
    // 2. Preset exists but has empty visibleFieldKeys (invalid state - should use code default)
    if (!existingPreset) {
      merged.presets[type] = preset;
    } else if (existingPreset.visibleFieldKeys && existingPreset.visibleFieldKeys.length === 0) {
      // Type with empty visibleFieldKeys - use code default instead
      // This handles cases where localStorage has an invalid empty preset
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
 * Gets preset for a specific type (returns effective preset configuration)
 */
export function getPresetForType(type?: string | null): SlideTypePreset {
  const normalized = (type || "default").trim() || "default";
  const config = getPresetsConfig();
  const preset = config.presets[normalized];
  
  if (normalized === "default") {
    // Default type: return hiddenFieldKeys
    return {
      hiddenFieldKeys: preset?.hiddenFieldKeys || [],
    };
  } else {
    // Non-default type: return visibleFieldKeys if present, otherwise compute from hiddenFieldKeys
    if (preset?.visibleFieldKeys) {
      return {
        visibleFieldKeys: preset.visibleFieldKeys,
      };
    } else if (preset?.hiddenFieldKeys) {
      // Backward compatibility: convert hiddenFieldKeys to visibleFieldKeys
      const result = resolveSlideTypeVisibility(normalized, DEFAULT_SLIDE_FIELDS, config);
      return {
        visibleFieldKeys: Array.from(result.visibleKeys),
      };
    } else {
      // No preset: all fields visible
      return {
        visibleFieldKeys: DEFAULT_SLIDE_FIELDS.map((f) => f.key),
      };
    }
  }
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
      [normalized]: preset,
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

