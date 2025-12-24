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
 * For non-default types (PARENT GATING + OPT-IN):
 * - effectiveVisibleKeys = (defaultVisibleKeys ∩ typeVisibleKeys) ∪ requiredAlwaysVisibleKeys
 * - Default acts as parent gate: if hidden in Default, cannot be visible in child types
 * - Child types are OPT-IN: fields default to hidden and require explicit enablement
 * - Child types can only opt-in to fields that are visible in Default
 * - Required keys (e.g., "label") are always visible regardless of settings
 * 
 * IMPORTANT:
 * - Hiding a field in Default makes it hidden in ALL child types (parent gate)
 * - Making a field visible in Default does NOT make it visible in child types (opt-in)
 * - Child types must explicitly add fields to their visibleFieldKeys to show them
 * - If a child type has no preset, it defaults to empty visibleFieldKeys (all hidden)
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
      // No preset: default to empty set (opt-in behavior - all fields hidden by default)
      // Child types must explicitly add fields to visibleFieldKeys to show them
      typeVisibleKeys = new Set<string>();
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
    // These are fields that are allowed by Default but NOT opted-in by this child type
    typeHiddenKeys = new Set<string>();
    defaultVisibleKeys.forEach((key) => {
      // Field is allowed by Default
      if (!typeVisibleKeys.has(key) && !REQUIRED_ALWAYS_VISIBLE_KEYS.has(key)) {
        // Field is NOT in child type's allowlist (not opted-in) and not required
        // This means it's hidden in this child type but could be shown if opted-in
        typeHiddenKeys.add(key);
      }
    });
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

