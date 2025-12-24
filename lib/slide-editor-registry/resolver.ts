import type { EditorField } from "./types";

/**
 * Versioned preset configuration schema
 */
export type SlideTypePresetsConfig = {
  version: number;
  presets: Record<string, { hiddenFieldKeys: string[] }>;
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
 * Resolves effective visibility for a slide type using inheritance:
 * - defaultHidden = presets["default"].hiddenFieldKeys
 * - typeHidden = presets[type].hiddenFieldKeys
 * - For non-default: effectiveHidden = union(defaultHidden, typeHidden)
 * - For default: effectiveHidden = defaultHidden
 * - effectiveVisible = allFields - effectiveHidden
 *
 * IMPORTANT:
 * Hiding a field only affects the editor UI.
 * Slide data is never deleted automatically.
 * See ADR-001 for schema evolution rules.
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

  // Get default preset (always exists)
  const defaultPreset = presets.presets["default"] || { hiddenFieldKeys: [] };
  const defaultHiddenKeys = new Set(defaultPreset.hiddenFieldKeys);

  // Get type-specific preset (if not default)
  const typePreset = isDefault ? null : presets.presets[normalizedType];
  const typeHiddenKeys = new Set(typePreset?.hiddenFieldKeys || []);

  // Build effective hidden set: union of default + type-specific
  const effectiveHiddenKeys = new Set<string>(defaultHiddenKeys);
  if (!isDefault) {
    typeHiddenKeys.forEach((key) => effectiveHiddenKeys.add(key));
  }

  // Build field key set for validation
  const allFieldKeys = new Set(allFields.map((f) => f.key));

  // Warn about unknown keys but don't crash
  const validateKeys = (keys: Set<string>, source: string) => {
    keys.forEach((key) => {
      if (!allFieldKeys.has(key)) {
        if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
          console.warn(`[SlideTypePreset] Unknown field key "${key}" in ${source}, ignoring.`);
        }
      }
    });
  };

  validateKeys(defaultHiddenKeys, "default preset");
  if (!isDefault) {
    validateKeys(typeHiddenKeys, `${normalizedType} preset`);
  }

  // Calculate visible keys
  const visibleKeys = new Set<string>();
  allFields.forEach((field) => {
    if (!effectiveHiddenKeys.has(field.key)) {
      visibleKeys.add(field.key);
    }
  });

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

export { CURRENT_VERSION };

