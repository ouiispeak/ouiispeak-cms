/**
 * Slide Type Configuration Schema
 * 
 * TypeScript types and interfaces for slide type configurations.
 * These types define the structure of form configurations stored in the database.
 * 
 * Used by:
 * - slide_type_configs table (JSONB column structure)
 * - Dynamic form renderer
 * - Master configuration editor
 * - Data layer functions
 */

/**
 * Form Section Configuration
 * 
 * Defines a section container in the form (e.g., "Identity & Structure", "Core Content")
 */
export interface FormSection {
  /** Unique identifier for the section */
  id: string;
  
  /** Display title of the section */
  title: string;
  
  /** Optional description shown below the title */
  description?: string;
  
  /** Display order (lower numbers appear first) */
  order: number;
  
  /** Background color for the section (hex code) */
  backgroundColor?: string;
  
  /** Border color for the section (hex code) */
  borderColor?: string;
}

/**
 * Form Field Configuration
 * 
 * Defines how a field appears in a specific slide type's form.
 * References a field from the FIELD_REGISTRY by fieldId.
 */
export interface FormFieldConfig {
  /** Reference to field in FIELD_REGISTRY */
  fieldId: string;
  
  /** Which section this field belongs to */
  sectionId: string;
  
  /** Display order within the section (lower numbers appear first) */
  order: number;
  
  /** Whether this field is required for this slide type */
  required: boolean;
  
  /** Whether this field is visible for this slide type */
  visible: boolean;
  
  /** Optional conditional visibility logic */
  conditional?: {
    /** Field ID to check against */
    field: string;
    
    /** Comparison operator */
    operator: "equals" | "not-equals" | "exists" | "not-exists" | "contains" | "not-contains";
    
    /** Value to compare against */
    value: unknown;
  };
}

/**
 * Validation Rule
 * 
 * Defines validation rules specific to a slide type.
 * These are in addition to field-level validation from FIELD_REGISTRY.
 */
export interface ValidationRule {
  /** Field ID this rule applies to */
  fieldId: string;
  
  /** Validation rule type */
  rule: 
    | "non-empty"                    // Field must not be empty
    | "at-least-one-element"         // Array must have at least one element (for elements arrays)
    | "at-least-one-choice"          // Array must have at least one valid choice (for choiceElements)
    | "valid-json"                   // Must be valid JSON
    | "valid-json-array"             // Must be valid JSON array
    | "min-length"                   // String must meet minimum length
    | "max-length"                   // String must not exceed maximum length
    | "min-value"                    // Number must meet minimum value
    | "max-value"                    // Number must not exceed maximum value
    | "pattern"                      // Must match regex pattern
    | "custom";                      // Custom validation function name
  
  /** Error message shown when validation fails */
  message: string;
  
  /** Optional parameters for the validation rule */
  params?: Record<string, any>;
}

/**
 * Form Configuration
 * 
 * Complete form structure for a slide type.
 * Defines sections, fields, and validation rules.
 */
export interface FormConfig {
  /** Sections that appear in the form */
  sections: FormSection[];
  
  /** Fields and their configuration */
  fields: FormFieldConfig[];
  
  /** Validation rules specific to this slide type */
  validationRules: ValidationRule[];
}

/**
 * Slide Type Configuration
 * 
 * Complete configuration for a slide type.
 * This is the structure stored in the slide_type_configs table.
 */
export interface SlideTypeConfig {
  /** Unique type key (e.g., "ai-speak-student-repeat") */
  typeKey: string;
  
  /** Display name (e.g., "AI Speak Student Repeat") */
  displayName: string;
  
  /** Whether this configuration is active */
  isActive: boolean;
  
  /** Version number (for tracking changes) */
  version: number;
  
  /** Complete form configuration */
  formConfig: FormConfig;
  
  /** Optional: Timestamp when created */
  createdAt?: string;
  
  /** Optional: Timestamp when last updated */
  updatedAt?: string;
}

/**
 * Slide Type Configuration Database Record
 * 
 * Structure as stored in the database (includes id and timestamps)
 */
export interface SlideTypeConfigRecord {
  id: string;
  type_key: string;
  display_name: string;
  is_active: boolean;
  version: number;
  form_config: FormConfig;
  created_at: string;
  updated_at: string;
}

/**
 * Helper function to convert database record to SlideTypeConfig
 */
export function recordToConfig(record: SlideTypeConfigRecord): SlideTypeConfig {
  return {
    typeKey: record.type_key,
    displayName: record.display_name,
    isActive: record.is_active,
    version: record.version,
    formConfig: record.form_config,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

/**
 * Helper function to convert SlideTypeConfig to database record format
 */
export function configToRecord(config: SlideTypeConfig, id?: string): Omit<SlideTypeConfigRecord, "created_at" | "updated_at"> {
  return {
    id: id || "",
    type_key: config.typeKey,
    display_name: config.displayName,
    is_active: config.isActive,
    version: config.version,
    form_config: config.formConfig
  };
}

/**
 * Default section definitions
 * 
 * These are the standard sections used across slide types.
 * Individual slide type configs can override colors or add custom sections.
 */
export const DEFAULT_SECTIONS: FormSection[] = [
  {
    id: "identity",
    title: "Identity & Structure",
    description: "Basic slide identification and structure",
    order: 1,
    backgroundColor: "#e6f1f1",
    borderColor: "#b4d5d5"
  },
  {
    id: "content",
    title: "Core Content",
    description: "Main content shown to learners",
    order: 2,
    backgroundColor: "#e6f1f1",
    borderColor: "#b4d5d5"
  },
  {
    id: "language",
    title: "Language and Localization",
    description: "Language settings for the slide",
    order: 3,
    backgroundColor: "#e6f1f1",
    borderColor: "#b4d5d5"
  },
  {
    id: "media",
    title: "Media Reference",
    description: "Media assets referenced by this slide",
    order: 4,
    backgroundColor: "#e6f1f1",
    borderColor: "#b4d5d5"
  },
  {
    id: "speech",
    title: "Speech & Audio Interaction",
    description: "Speech and audio interaction content",
    order: 5,
    backgroundColor: "#e6f1f1",
    borderColor: "#b4d5d5"
  },
  {
    id: "interaction",
    title: "Interaction Flags",
    description: "Flags controlling slide interaction behavior",
    order: 6,
    backgroundColor: "#e6f1f1",
    borderColor: "#b4d5d5"
  },
  {
    id: "flow",
    title: "Interaction/Flow",
    description: "Attempt limits and skip behavior",
    order: 7,
    backgroundColor: "#e6f1f1",
    borderColor: "#b4d5d5"
  },
  {
    id: "metadata",
    title: "Authoring Metadata",
    description: "Metadata for CMS organization and tracking",
    order: 8,
    backgroundColor: "#e6f1f1",
    borderColor: "#b4d5d5"
  }
];

/**
 * Get section by ID from default sections
 */
export function getDefaultSection(sectionId: string): FormSection | undefined {
  return DEFAULT_SECTIONS.find(section => section.id === sectionId);
}

/**
 * Validate form configuration structure
 */
export function validateFormConfig(config: FormConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check sections
  if (!config.sections || !Array.isArray(config.sections) || config.sections.length === 0) {
    errors.push("Form config must have at least one section");
  }
  
  // Check fields
  if (!config.fields || !Array.isArray(config.fields)) {
    errors.push("Form config must have a fields array");
  }
  
  // Validate each field references a valid section
  if (config.fields && config.sections) {
    const sectionIds = new Set(config.sections.map(s => s.id));
    config.fields.forEach((field, index) => {
      if (!sectionIds.has(field.sectionId)) {
        errors.push(`Field at index ${index} (${field.fieldId}) references invalid section: ${field.sectionId}`);
      }
    });
  }
  
  // Validate field IDs are unique within the config
  if (config.fields) {
    const fieldIds = config.fields.map(f => f.fieldId);
    const duplicates = fieldIds.filter((id, index) => fieldIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate field IDs found: ${[...new Set(duplicates)].join(", ")}`);
    }
  }
  
  // Validate validation rules reference valid fields
  if (config.validationRules && config.fields) {
    const fieldIds = new Set(config.fields.map(f => f.fieldId));
    config.validationRules.forEach((rule, index) => {
      if (!fieldIds.has(rule.fieldId)) {
        errors.push(`Validation rule at index ${index} references invalid field: ${rule.fieldId}`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete slide type configuration
 */
export function validateSlideTypeConfig(config: SlideTypeConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.typeKey || config.typeKey.trim() === "") {
    errors.push("typeKey is required");
  }
  
  if (!config.displayName || config.displayName.trim() === "") {
    errors.push("displayName is required");
  }
  
  if (config.version < 1) {
    errors.push("version must be at least 1");
  }
  
  // Validate form config
  const formConfigValidation = validateFormConfig(config.formConfig);
  if (!formConfigValidation.valid) {
    errors.push(...formConfigValidation.errors);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

