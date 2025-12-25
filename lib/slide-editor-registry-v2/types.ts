/**
 * Types for the new schema-driven slide type system
 */

export type EditorFieldUiType = "text" | "textarea" | "json" | "number" | "boolean" | "select";

export type EditorField = {
  key: string;
  label: string;
  helpText?: string;
  required?: boolean;
  uiType: EditorFieldUiType;
};

export type EditorSchema = {
  fields: EditorField[];
};

/**
 * Field availability configuration for Default slide type
 * Controls which fields are "Available" (can be used by child types)
 */
export type DefaultFieldAvailability = {
  availableFieldKeys: Set<string>; // Fields that are Available (can be used by child types)
};

/**
 * Default state: Only "label" is available, all others are unavailable
 */
export function createDefaultAvailability(): DefaultFieldAvailability {
  return {
    availableFieldKeys: new Set(["label"]), // Only label is available by default
  };
}

