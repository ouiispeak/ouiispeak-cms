/**
 * Form Utility Functions
 * 
 * Helper functions for working with form configurations.
 */

import type { FormConfig, FormSection, FormFieldConfig } from "../schemas/slideTypeConfig";

/**
 * Groups fields by their section
 */
export function groupFieldsBySection(formConfig: FormConfig): Array<{
  section: FormSection;
  fields: FormFieldConfig[];
}> {
  // Create a map of section ID to section
  const sectionMap = new Map<string, FormSection>();
  formConfig.sections.forEach(section => {
    sectionMap.set(section.id, section);
  });

  // Group fields by section ID
  const fieldsBySection = new Map<string, FormFieldConfig[]>();
  formConfig.fields.forEach(field => {
    if (!fieldsBySection.has(field.sectionId)) {
      fieldsBySection.set(field.sectionId, []);
    }
    fieldsBySection.get(field.sectionId)!.push(field);
  });

  // Build result array with sections sorted by order
  const result: Array<{ section: FormSection; fields: FormFieldConfig[] }> = [];
  
  formConfig.sections
    .sort((a, b) => a.order - b.order)
    .forEach(section => {
      const fields = fieldsBySection.get(section.id) || [];
      if (fields.length > 0) {
        result.push({ section, fields });
      }
    });

  return result;
}

/**
 * Gets all field IDs from a form configuration
 */
export function getFieldIds(formConfig: FormConfig): string[] {
  return formConfig.fields.map(field => field.fieldId);
}

/**
 * Gets visible field IDs from a form configuration
 */
export function getVisibleFieldIds(formConfig: FormConfig): string[] {
  return formConfig.fields
    .filter(field => field.visible)
    .map(field => field.fieldId);
}

/**
 * Gets required field IDs from a form configuration
 */
export function getRequiredFieldIds(formConfig: FormConfig): string[] {
  return formConfig.fields
    .filter(field => field.required && field.visible)
    .map(field => field.fieldId);
}

