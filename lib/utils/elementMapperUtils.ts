/**
 * Utility functions for element mapper components
 * Extracted to improve separation of concerns and testability
 */

import { PLAYER_LANGUAGES, CMS_LANGUAGES, type CmsLanguage, type PlayerLanguage } from "../constants/slideConstants";

/**
 * Map CMS language format to player language format
 * Handles various input formats for flexibility
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
 * Validate that an element has required fields
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
 * Validate that a choice element has required fields
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

