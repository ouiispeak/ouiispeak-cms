import type { SlideTypePresetsConfig } from "./resolver";
import { getDefaultPresetsConfig } from "./resolver";

const STORAGE_KEY = "slideTypePresets";

/**
 * Loads presets from localStorage, falling back to code defaults if invalid or missing
 */
export function loadPresetsFromStorage(): SlideTypePresetsConfig {
  if (typeof window === "undefined") {
    return getDefaultPresetsConfig();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultPresetsConfig();
    }

    const parsed = JSON.parse(stored) as unknown;

    // Basic validation
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "version" in parsed &&
      "presets" in parsed &&
      typeof parsed.version === "number" &&
      typeof parsed.presets === "object" &&
      parsed.presets !== null
    ) {
      // Validate each preset - support both hiddenFieldKeys (default type) and visibleFieldKeys (non-default types)
      const presets = parsed.presets as Record<string, unknown>;
      const validatedPresets: Record<string, { hiddenFieldKeys?: string[]; visibleFieldKeys?: string[] }> = {};

      for (const [key, value] of Object.entries(presets)) {
        if (typeof value === "object" && value !== null) {
          const preset: { hiddenFieldKeys?: string[]; visibleFieldKeys?: string[] } = {};
          
          // Support hiddenFieldKeys (for default type)
          if ("hiddenFieldKeys" in value && Array.isArray(value.hiddenFieldKeys)) {
            preset.hiddenFieldKeys = value.hiddenFieldKeys.filter((k: unknown) => typeof k === "string");
          }
          
          // Support visibleFieldKeys (for non-default types)
          if ("visibleFieldKeys" in value && Array.isArray(value.visibleFieldKeys)) {
            preset.visibleFieldKeys = value.visibleFieldKeys.filter((k: unknown) => typeof k === "string");
          }
          
          // Only add preset if it has at least one valid key array
          if (preset.hiddenFieldKeys || preset.visibleFieldKeys) {
            validatedPresets[key] = preset;
          }
        }
      }

      return {
        version: parsed.version,
        presets: validatedPresets,
      };
    }

    // Invalid structure, fall back to defaults
    if (process.env.NODE_ENV === "development") {
      console.warn("[SlideTypePreset] Invalid localStorage data, using defaults");
    }
    return getDefaultPresetsConfig();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[SlideTypePreset] Failed to parse localStorage data:", error);
    }
    return getDefaultPresetsConfig();
  }
}

/**
 * Saves presets to localStorage
 */
export function savePresetsToStorage(config: SlideTypePresetsConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const toStore = {
      version: config.version,
      presets: config.presets,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[SlideTypePreset] Failed to save to localStorage:", error);
    }
  }
}

/**
 * Clears presets from localStorage
 */
export function clearPresetsFromStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[SlideTypePreset] Failed to clear localStorage:", error);
    }
  }
}

