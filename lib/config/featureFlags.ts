/**
 * Feature Flag System
 * 
 * Controls gradual rollout of the dynamic form system.
 * Allows instant rollback if issues are detected.
 * 
 * Environment Variables:
 *   NEXT_PUBLIC_USE_DYNAMIC_FORM=true|false
 *   NEXT_PUBLIC_DYNAMIC_FORM_TYPES=text-slide,ai-speak-repeat (comma-separated list)
 * 
 * Usage:
 *   if (shouldUseDynamicForm(slideType)) {
 *     return <DynamicSlideForm ... />;
 *   } else {
 *     return <LegacySlideForm ... />;
 *   }
 */

/**
 * Feature flags configuration
 */
export const FEATURE_FLAGS = {
  /**
   * Master switch for dynamic form system
   * Set to true to enable dynamic forms (when types are specified)
   */
  USE_DYNAMIC_SLIDE_FORM: process.env.NEXT_PUBLIC_USE_DYNAMIC_FORM === "true",

  /**
   * List of slide types to use dynamic form for
   * Empty array means all types (if USE_DYNAMIC_SLIDE_FORM is true)
   * Comma-separated list: "text-slide,ai-speak-repeat"
   */
  DYNAMIC_FORM_TYPES: (process.env.NEXT_PUBLIC_DYNAMIC_FORM_TYPES || "")
    .split(",")
    .map(type => type.trim())
    .filter(Boolean)
};

/**
 * Determines if dynamic form should be used for a given slide type
 * 
 * @param slideType - The slide type to check
 * @returns true if dynamic form should be used, false otherwise
 */
export function shouldUseDynamicForm(slideType: string | null | undefined): boolean {
  // Don't use dynamic form if master switch is off
  if (!FEATURE_FLAGS.USE_DYNAMIC_SLIDE_FORM) {
    return false;
  }

  // If no slide type provided, don't use dynamic form
  if (!slideType) {
    return false;
  }

  // If no specific types listed, use dynamic form for all types
  if (FEATURE_FLAGS.DYNAMIC_FORM_TYPES.length === 0) {
    return true;
  }

  // Use dynamic form only if slide type is in the list
  return FEATURE_FLAGS.DYNAMIC_FORM_TYPES.includes(slideType);
}

/**
 * Gets the current feature flag status (for debugging)
 */
export function getFeatureFlagStatus() {
  return {
    useDynamicForm: FEATURE_FLAGS.USE_DYNAMIC_SLIDE_FORM,
    dynamicFormTypes: FEATURE_FLAGS.DYNAMIC_FORM_TYPES,
    allTypesEnabled: FEATURE_FLAGS.DYNAMIC_FORM_TYPES.length === 0
  };
}

