/**
 * String utility functions
 * Centralized helpers for string manipulation across the CMS
 */

/**
 * Converts a string to a URL-friendly slug.
 * - Trims whitespace
 * - Converts to lowercase
 * - Removes quotes (single and double)
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Converts empty or whitespace-only strings to null.
 * Trims the input and returns null if the result is empty, otherwise returns the trimmed string.
 */
export function nullIfEmpty(input: string | null | undefined): string | null {
  if (input == null) return null;
  const trimmed = input.trim();
  return trimmed === "" ? null : trimmed;
}

