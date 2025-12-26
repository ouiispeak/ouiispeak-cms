/**
 * Utility functions for element mapper components
 * Extracted to improve separation of concerns and testability
 */

import { PLAYER_LANGUAGES, CMS_LANGUAGES, type CmsLanguage, type PlayerLanguage } from "../constants/slideConstants";

/**
 * Normalizes language values from CMS format to player format.
 * 
 * Handles various input formats for flexibility:
 * - "en" or "english" → "en"
 * - "fr" or "french" → "fr"
 * - Falls back to defaultLang if provided
 * - Defaults to English if no valid language found
 * 
 * @param lang - Language value to normalize (can be "en", "english", "fr", "french", etc.)
 * @param defaultLang - Optional fallback language if lang is not provided or invalid
 * 
 * @returns Normalized player language format ("en" or "fr")
 * 
 * @example
 * ```tsx
 * normalizeLanguageToPlayer("english") // Returns "en"
 * normalizeLanguageToPlayer("fr") // Returns "fr"
 * normalizeLanguageToPlayer(null, "french") // Returns "fr"
 * normalizeLanguageToPlayer("invalid") // Returns "en" (default)
 * ```
 */
export function normalizeLanguageToPlayer(
  lang: string | undefined | null,
  defaultLang?: string
): PlayerLanguage {
  // If lang is provided, normalize it
  if (lang) {
    const normalized = lang.toLowerCase().trim();
    if (normalized === "en" || normalized === "english") {
      return PLAYER_LANGUAGES.ENGLISH;
    }
    if (normalized === "fr" || normalized === "french") {
      return PLAYER_LANGUAGES.FRENCH;
    }
  }

  // Fall back to defaultLang if provided
  if (defaultLang) {
    const normalized = defaultLang.toLowerCase().trim();
    if (normalized === "en" || normalized === "english") {
      return PLAYER_LANGUAGES.ENGLISH;
    }
    if (normalized === "fr" || normalized === "french") {
      return PLAYER_LANGUAGES.FRENCH;
    }
  }

  // Default to English
  return PLAYER_LANGUAGES.ENGLISH;
}

/**
 * Validates a student repeat element to ensure it has required fields.
 * 
 * Used by StudentRepeatElementMapper to validate elements before saving.
 * 
 * @param element - The element to validate
 * @param element.samplePrompt - The sample prompt text (required)
 * @param element.referenceText - Optional reference text
 * @param element.audioPath - Optional audio file path
 * 
 * @returns Validation result with `valid` boolean and optional `error` message
 * 
 * @example
 * ```tsx
 * const result = validateStudentRepeatElement({
 *   samplePrompt: "Hello",
 *   referenceText: "Hello",
 * });
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateStudentRepeatElement(element: {
  samplePrompt: string;
  referenceText?: string;
  audioPath?: string;
}): { valid: boolean; error?: string } {
  if (!element.samplePrompt || element.samplePrompt.trim() === "") {
    return { valid: false, error: "Sample prompt is required" };
  }
  return { valid: true };
}

/**
 * Validates a choice element (for speech-match slides) to ensure it has required fields.
 * 
 * Validates based on the speech mode:
 * - TTS mode: Requires label and text
 * - File mode: Requires label and fileUrl
 * 
 * @param element - The choice element to validate
 * @param element.label - The choice label (required)
 * @param element.speech - Speech configuration object
 * @param element.speech.mode - Either "tts" or "file"
 * @param element.speech.text - Required if mode is "tts"
 * @param element.speech.fileUrl - Required if mode is "file"
 * 
 * @returns Validation result with `valid` boolean and optional `error` message
 * 
 * @example
 * ```tsx
 * const result = validateChoiceElement({
 *   label: "Apple",
 *   speech: { mode: "tts", text: "Apple" },
 * });
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateChoiceElement(element: {
  label: string;
  speech: {
    mode: "tts" | "file";
    lang?: string;
    text?: string;
    fileUrl?: string;
  };
}): { valid: boolean; error?: string } {
  if (!element.label || element.label.trim() === "") {
    return { valid: false, error: "Label is required" };
  }

  if (element.speech.mode === "tts") {
    if (!element.speech.text || element.speech.text.trim() === "") {
      return { valid: false, error: "TTS text is required when using TTS mode" };
    }
  } else if (element.speech.mode === "file") {
    if (!element.speech.fileUrl || element.speech.fileUrl.trim() === "") {
      return { valid: false, error: "Audio file is required when using file mode" };
    }
  }

  return { valid: true };
}

