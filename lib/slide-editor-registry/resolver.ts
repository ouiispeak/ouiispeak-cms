import type { EditorField } from "./types";

/**
 * Versioned preset configuration schema
 * 
 * For "default" type: uses hiddenFieldKeys (everything visible except hidden)
 * For non-default types: uses visibleFieldKeys as explicit allowlist (nothing visible unless listed)
 */
export type SlideTypePresetsConfig = {
  version: number;
  presets: Record<string, { hiddenFieldKeys?: string[]; visibleFieldKeys?: string[] }>;
};

/**
 * Resolver output for a specific slide type
 */
export type VisibilityResult = {
  visibleKeys: Set<string>;
  hiddenKeys: Set<string>;
  defaultHiddenKeys: Set<string>;
  typeHiddenKeys: Set<string>;
};

const CURRENT_VERSION = 1;

/**
 * Required fields that must always be visible regardless of visibility settings.
 * These are identity/structure fields critical for slide functionality.
 */
const REQUIRED_ALWAYS_VISIBLE_KEYS = new Set<string>(["label"]);

/**
 * Resolves effective visibility for a slide type using PARENT GATING:
 * 
 * For "default" type:
 * - defaultVisibleKeys = allFields - defaultHiddenKeys
 * - Uses hiddenFieldKeys (everything visible except hidden)
 * 
 * For non-default types (PARENT GATING):
 * - effectiveVisibleKeys = (defaultVisibleKeys ∩ typeVisibleKeys) ∪ requiredAlwaysVisibleKeys
 * - Default acts as parent gate: if hidden in Default, cannot be visible in child types
 * - Child types can only show fields that are visible in Default
 * - Required keys (e.g., "label") are always visible regardless of settings
 * 
 * IMPORTANT:
 * - Hiding a field in Default makes it hidden in ALL child types (parent gate)
 * - Child types can only opt-in to fields that are visible in Default
 * - This is the ONLY way visibility is computed - no union, no "all fields" default
 * 
 * @param typeKey - The slide type key (e.g., "default", "ai-speak-repeat")
 * @param allFields - All available fields from the registry
 * @param presets - The preset configuration
 * @returns Visibility result with sets of visible/hidden keys
 */
export function resolveSlideTypeVisibility(
  typeKey: string,
  allFields: EditorField[],
  presets: SlideTypePresetsConfig
): VisibilityResult {
  const normalizedType = (typeKey || "default").trim() || "default";
  const isDefault = normalizedType === "default";

  // Build field key set for validation
  const allFieldKeys = new Set(allFields.map((f) => f.key));

  // Get default preset (always exists)
  const defaultPreset = presets.presets["default"] || { hiddenFieldKeys: [] };
  const defaultHiddenKeys = new Set(defaultPreset.hiddenFieldKeys || []);

  // Warn about unknown keys in default preset
  defaultHiddenKeys.forEach((key) => {
    if (!allFieldKeys.has(key) && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn(`[SlideTypePreset] Unknown field key "${key}" in default preset, ignoring.`);
    }
  });

  // Compute defaultVisibleKeys: all fields NOT hidden in default
  const defaultVisibleKeys = new Set<string>();
  allFields.forEach((field) => {
    if (!defaultHiddenKeys.has(field.key)) {
      defaultVisibleKeys.add(field.key);
    }
  });

  let visibleKeys: Set<string>;
  let effectiveHiddenKeys: Set<string>;
  let typeHiddenKeys: Set<string>;

  if (isDefault) {
    // Default type: everything visible except hiddenFieldKeys
    visibleKeys = new Set(defaultVisibleKeys);
    effectiveHiddenKeys = new Set(defaultHiddenKeys);
    typeHiddenKeys = new Set<string>();
  } else {
    // Non-default type: PARENT GATING with intersection
    const typePreset = presets.presets[normalizedType];
    
    // Get typeVisibleKeys (what the type wants to show)
    let typeVisibleKeys: Set<string>;
    if (typePreset?.visibleFieldKeys && typePreset.visibleFieldKeys.length > 0) {
      // Use explicit allowlist from preset
      typeVisibleKeys = new Set(typePreset.visibleFieldKeys);
      
      // Validate visibleFieldKeys
      typeVisibleKeys.forEach((key) => {
        if (!allFieldKeys.has(key) && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
          console.warn(`[SlideTypePreset] Unknown field key "${key}" in ${normalizedType} visibleFieldKeys, ignoring.`);
        }
      });
    } else if (typePreset?.hiddenFieldKeys) {
      // Backward compatibility: compute typeVisibleKeys from hiddenFieldKeys
      const typeHidden = new Set(typePreset.hiddenFieldKeys);
      typeVisibleKeys = new Set(
        allFields
          .filter((f) => !typeHidden.has(f.key))
          .map((f) => f.key)
      );
    } else {
      // No preset: default to all fields (will be gated by defaultVisibleKeys)
      typeVisibleKeys = new Set(allFieldKeys);
    }
    
    // PARENT GATING: effectiveVisibleKeys = (defaultVisibleKeys ∩ typeVisibleKeys) ∪ requiredAlwaysVisibleKeys
    visibleKeys = new Set<string>();
    
    // Add intersection of default visible and type visible
    defaultVisibleKeys.forEach((key) => {
      if (typeVisibleKeys.has(key)) {
        visibleKeys.add(key);
      }
    });
    
    // Always add required keys (even if not in intersection)
    REQUIRED_ALWAYS_VISIBLE_KEYS.forEach((key) => {
      if (allFieldKeys.has(key)) {
        visibleKeys.add(key);
      }
    });
    
    // Compute effective hidden keys
    effectiveHiddenKeys = new Set<string>();
    allFields.forEach((field) => {
      if (!visibleKeys.has(field.key)) {
        effectiveHiddenKeys.add(field.key);
      }
    });
    
    // Type-specific hidden keys (for display purposes)
    typeHiddenKeys = new Set<string>();
    typeVisibleKeys.forEach((key) => {
      if (!defaultVisibleKeys.has(key) && !REQUIRED_ALWAYS_VISIBLE_KEYS.has(key)) {
        // This key is in type's allowlist but hidden by default (parent gate)
        typeHiddenKeys.add(key);
      }
    });
    
    // DIAGNOSTICS (temporary - remove before final)
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.log(`[SlideTypeVisibility] ${normalizedType}:`, {
        defaultVisibleKeysCount: defaultVisibleKeys.size,
        typeVisibleKeysCount: typeVisibleKeys.size,
        effectiveVisibleKeysCount: visibleKeys.size,
        sampleDefaultVisible: Array.from(defaultVisibleKeys).slice(0, 5),
        sampleTypeVisible: Array.from(typeVisibleKeys).slice(0, 5),
        sampleEffectiveVisible: Array.from(visibleKeys).slice(0, 5),
      });
    }
  }

  return {
    visibleKeys,
    hiddenKeys: effectiveHiddenKeys,
    defaultHiddenKeys,
    typeHiddenKeys,
  };
}

/**
 * Gets the default preset config (used as fallback)
 */
export function getDefaultPresetsConfig(): SlideTypePresetsConfig {
  return {
    version: CURRENT_VERSION,
    presets: {
      default: { hiddenFieldKeys: [] },
    },
  };
}

/**
 * Converts a legacy preset (using hiddenFieldKeys) to the new format (using visibleFieldKeys for non-default types).
 * This is a migration helper - new presets should use visibleFieldKeys for non-default types.
 */
export function migratePresetToVisibleFieldKeys(
  typeKey: string,
  hiddenFieldKeys: string[],
  allFields: EditorField[]
): { visibleFieldKeys: string[] } {
  const allFieldKeys = new Set(allFields.map((f) => f.key));
  const hiddenSet = new Set(hiddenFieldKeys);
  
  // Compute visible fields: all fields NOT in hiddenFieldKeys
  const visibleFieldKeys: string[] = [];
  allFields.forEach((field) => {
    if (!hiddenSet.has(field.key) && allFieldKeys.has(field.key)) {
      visibleFieldKeys.push(field.key);
    }
  });
  
  return { visibleFieldKeys };
}

export { CURRENT_VERSION };

