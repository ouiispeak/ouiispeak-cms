/**
 * Field key constants for identifying system, metadata, and special fields.
 * Single source of truth for field categorization across all slide editors.
 */

/**
 * System fields that are read-only identity/structure fields.
 * These are typically displayed but not editable in the editor UI.
 */
export const SYSTEM_FIELD_KEYS = new Set<string>([
  "slideId",
  "slideType",
  "groupId",
  "orderIndex",
]);

/**
 * All metadata fields (authoring metadata + special metadata).
 * These fields are handled separately from normal editable props.
 */
export const METADATA_FIELD_KEYS = new Set<string>([
  "code",
  "slideGoal",
  "activityName",
  "requiresExternalTTS",
  "buttons",
  "tags",
  "difficultyHint",
  "reviewWeight",
  "isActivity",
  "scoreType",
  "passThreshold",
  "maxScoreValue",
  "passRequiredForNext",
  "showScoreToLearner",
]);

/**
 * Authoring metadata fields that appear in AuthoringMetadataSection.
 * These are the "standard" authoring fields (code, slideGoal, etc.).
 */
export const AUTHORING_METADATA_KEYS = new Set<string>([
  "code",
  "slideGoal",
  "activityName",
  "requiresExternalTTS",
  "tags",
  "difficultyHint",
  "reviewWeight",
]);

/**
 * Special metadata fields that have custom rendering logic.
 * These are metadata fields but handled specially (buttons, scoring fields, etc.).
 */
export const SPECIAL_METADATA_KEYS = new Set<string>([
  "buttons",
  "isActivity",
  "scoreType",
  "passThreshold",
  "maxScoreValue",
  "passRequiredForNext",
  "showScoreToLearner",
]);

/**
 * System fields that can be copied to clipboard.
 */
export const COPYABLE_SYSTEM_FIELDS = new Set<string>(["slideId", "groupId"]);

/**
 * Helper function to check if a field key is a system field.
 */
export function isSystemFieldKey(key: string): boolean {
  return SYSTEM_FIELD_KEYS.has(key);
}

/**
 * Helper function to check if a field key is a metadata field.
 */
export function isMetadataFieldKey(key: string): boolean {
  return METADATA_FIELD_KEYS.has(key);
}

/**
 * Helper function to check if a field key is an authoring metadata field.
 */
export function isAuthoringMetadataFieldKey(key: string): boolean {
  return AUTHORING_METADATA_KEYS.has(key);
}

/**
 * Helper function to check if a field key is a special metadata field.
 */
export function isSpecialMetadataFieldKey(key: string): boolean {
  return SPECIAL_METADATA_KEYS.has(key);
}

/**
 * Helper function to check if a system field can be copied.
 */
export function isCopyableSystemField(key: string): boolean {
  return COPYABLE_SYSTEM_FIELDS.has(key);
}

