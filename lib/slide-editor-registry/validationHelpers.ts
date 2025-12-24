/**
 * Validation helpers for slide editors.
 * Centralized validation logic to ensure consistency across editors.
 */

/**
 * Validates that a label is provided for new slides.
 * Only enforces when isNewSlide is true AND schema includes a "label" field.
 * 
 * @param params - Validation parameters
 * @param params.isNewSlide - Whether this is a new slide (no id yet)
 * @param params.schemaFields - Array of schema fields to check for "label" field
 * @param params.values - Current field values map
 * @returns Error message string if validation fails, null if validation passes
 */
export function validateRequiredLabel(params: {
  isNewSlide: boolean;
  schemaFields: { key: string }[];
  values: Record<string, any>;
}): string | null {
  const { isNewSlide, schemaFields, values } = params;

  // Only enforce for new slides
  if (!isNewSlide) {
    return null;
  }

  // Check if schema includes a "label" field
  const labelField = schemaFields.find((f) => f.key === "label");
  if (!labelField) {
    return null;
  }

  // Validate label value
  const labelValue = values["label"];
  const trimmedLabel = typeof labelValue === "string" ? labelValue.trim() : "";

  if (!trimmedLabel) {
    return "Slide label is required for CMS navigation.";
  }

  return null;
}

