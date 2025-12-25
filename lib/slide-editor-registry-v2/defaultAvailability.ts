/**
 * Default Field Availability Configuration
 * 
 * Code defaults for Default slide type availability.
 * These defaults always apply - no localStorage override.
 * 
 * Default state: Only "label" is available, all others are unavailable.
 * This enforces the opt-in model where users must explicitly enable fields.
 */

import { REQUIRED_FIELD_KEY } from "./canonicalFields";
import type { DefaultFieldAvailability } from "./types";

/**
 * Code default: Only "label" is available
 * All other fields start as unavailable (opt-in model)
 */
export const CODE_DEFAULT_AVAILABILITY: DefaultFieldAvailability = {
  availableFieldKeys: new Set([REQUIRED_FIELD_KEY]), // Only "label"
};

/**
 * Get default availability (always returns code default)
 * This ensures code defaults always apply, no storage override
 */
export function getDefaultAvailability(): DefaultFieldAvailability {
  return CODE_DEFAULT_AVAILABILITY;
}

