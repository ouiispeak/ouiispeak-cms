/**
 * Tier 3.2 Step 1: Runtime Validation Utilities for Slide Props
 * 
 * Provides runtime validation for props_json when slides are loaded from the database.
 * This catches invalid data early and provides helpful error messages.
 */

import { validateSlideProps as validateSlidePropsType, type SlideType, SLIDE_TYPES } from "../types/slideProps";
import { logger } from "./logger";

/**
 * Validation result with detailed information
 */
export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Tier 3.2 Step 1: Validate slide props_json at runtime
 * 
 * Validates that props_json matches the expected structure for the slide type.
 * Returns validation result with errors and warnings.
 * 
 * @param slideType - The type of slide (e.g., "text-slide", "title-slide")
 * @param propsJson - The props_json value from the database (unknown type)
 * @param slideId - Optional slide ID for error messages
 * @returns ValidationResult with validation status and any errors/warnings
 * 
 * @example
 * ```ts
 * const result = validateSlidePropsRuntime("text-slide", propsJson, slideId);
 * if (!result.valid) {
 *   console.error("Invalid props:", result.errors);
 * }
 * ```
 */
export function validateSlidePropsRuntime(
  slideType: SlideType | string,
  propsJson: unknown,
  slideId?: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic type check
  if (propsJson === null || propsJson === undefined) {
    // Empty props_json is valid (defaults to {})
    return { valid: true, errors: [], warnings: [] };
  }

  if (typeof propsJson !== "object") {
    errors.push(
      `props_json must be an object, got ${typeof propsJson}${slideId ? ` (slide ${slideId})` : ""}`
    );
    return { valid: false, errors, warnings };
  }

  // Use existing validation function
  const validation = validateSlidePropsType(slideType as SlideType, propsJson);

  if (!validation.valid) {
    errors.push(
      ...validation.errors.map(
        (err) => `${err}${slideId ? ` (slide ${slideId})` : ""}`
      )
    );
  }

  // Additional runtime checks
  const props = propsJson as Record<string, unknown>;

  // Check for common issues
  if (Array.isArray(props.elements)) {
    if (props.elements.length === 0) {
      warnings.push(
        `elements array is empty${slideId ? ` (slide ${slideId})` : ""}`
      );
    }
  }

  // Log validation issues in development
  if (process.env.NODE_ENV === "development" && errors.length > 0) {
    logger.warn("[Slide Props Validation]", {
      slideId,
      slideType,
      errors,
      propsJson,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and sanitize props_json
 * Returns sanitized props_json or null if invalid
 * 
 * @param slideType - The type of slide
 * @param propsJson - The props_json value from the database
 * @param slideId - Optional slide ID for error messages
 * @returns Sanitized props_json or null if invalid
 */
export function validateAndSanitizeSlideProps(
  slideType: SlideType | string,
  propsJson: unknown,
  slideId?: string
): unknown | null {
  const validation = validateSlidePropsRuntime(slideType, propsJson, slideId);

  if (!validation.valid) {
    // Log but don't throw - return null to indicate invalid props
    if (process.env.NODE_ENV === "development") {
      logger.error("[Slide Props Validation Failed]", {
        slideId,
        slideType,
        errors: validation.errors,
      });
    }
    return null;
  }

  // Return props_json as-is (sanitization can be added later if needed)
  return propsJson;
}

