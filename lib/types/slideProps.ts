/**
 * Slide Props Type Definitions
 * 
 * Comprehensive TypeScript interfaces for all slide types' props_json.
 * This is the foundation for type-safe slide editing and refactoring.
 * 
 * Last updated: [Current Date]
 */

// Import constants and types from centralized location
import {
  SLIDE_TYPES,
  CMS_LANGUAGES,
  PLAYER_LANGUAGES,
  SPEECH_MODES,
  mapCmsLanguageToPlayer,
  type SlideType,
  type CmsLanguage,
  type PlayerLanguage,
  type SpeechMode,
} from "../constants/slideConstants";

// Re-export types for backward compatibility
export type { SlideType, CmsLanguage, PlayerLanguage, SpeechMode };

// Re-export constants for backward compatibility
export { SLIDE_TYPES, CMS_LANGUAGES, PLAYER_LANGUAGES, SPEECH_MODES };

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Speech configuration for elements
 */
export interface SpeechConfig {
  mode: SpeechMode;
  lang?: PlayerLanguage;
  text?: string; // Required for TTS mode
  fileUrl?: string; // Required for file mode
}

/**
 * Button configuration
 */
export interface ButtonConfig {
  label: string;
  action?: string;
  type?: string;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Lesson end action configuration
 */
export interface LessonEndAction {
  type: string;
  label: string;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Student repeat element (for ai-speak-student-repeat)
 */
export interface StudentRepeatElement {
  samplePrompt: string;
  referenceText: string;
  speech?: SpeechConfig;
}

/**
 * Choice element (for speech-match)
 */
export interface ChoiceElement {
  label: string;
  speech: SpeechConfig;
}

/**
 * Line cell for ai-speak-repeat (lines structure)
 */
export interface LineCell {
  label: string;
  speech: SpeechConfig;
}

// ============================================================================
// Base Interface
// ============================================================================

/**
 * Base properties shared by all slide types
 */
export interface BaseSlideProps {
  /** Internal name for CMS organization (required) */
  label?: string;
  
  /** Primary heading shown to learners */
  title?: string;
  
  /** Default language for TTS and content */
  defaultLang?: CmsLanguage;
  
  /** Reference ID or path for audio media */
  audioId?: string;
  
  /** Whether the slide accepts user interaction */
  isInteractive?: boolean;
  
  /** Whether users can skip this slide */
  allowSkip?: boolean;
  
  /** Whether users can retry this slide */
  allowRetry?: boolean;
  
  /** Maximum number of attempts allowed */
  maxAttempts?: number;
  
  /** Minimum attempts before skip is allowed */
  minAttemptsBeforeSkip?: number;
}

// ============================================================================
// Type-Specific Interfaces
// ============================================================================

/**
 * Text Slide Props
 * Simple text content slide
 */
export interface TextSlideProps extends BaseSlideProps {
  /** Secondary heading */
  subtitle?: string;
  
  /** Main slide copy shown to learners */
  body?: string;
  
  /** Interactive buttons displayed on the slide */
  buttons?: ButtonConfig[];
}

/**
 * Title Slide Props
 * Title/intro slide
 */
export interface TitleSlideProps extends BaseSlideProps {
  /** Secondary heading */
  subtitle?: string;
  
  /** Optional note displayed below subtitle */
  note?: string;
  
  /** Interactive buttons */
  buttons?: ButtonConfig[];
}

/**
 * Lesson End Slide Props
 * Final slide shown at end of lesson
 */
export interface LessonEndSlideProps extends BaseSlideProps {
  /** Message text shown below title (replaces subtitle) */
  message?: string;
  
  /** Action buttons displayed at bottom */
  actions?: LessonEndAction[];
}

/**
 * AI Speak Repeat Slide Props
 * Slide where AI speaks phrases and student repeats
 */
export interface AISpeakRepeatSlideProps extends BaseSlideProps {
  /** Secondary heading */
  subtitle?: string;
  
  /** Phrases organized as lines array (lines[][]) */
  lines?: LineCell[][];
  
  /** Legacy: phrases as string (converted to lines on save) */
  phrases?: string;
}

/**
 * AI Speak Student Repeat Slide Props
 * Slide where student hears and repeats practice elements
 */
export interface AISpeakStudentRepeatSlideProps extends BaseSlideProps {
  /** Secondary heading */
  subtitle?: string;
  
  /** Practice elements that students will hear and repeat */
  elements: StudentRepeatElement[];
  
  /** Optional instructions shown before practice */
  instructions?: string;
  
  /** Label displayed above the practice prompt */
  promptLabel?: string;
  
  /** Trigger completion callback at this element index (0-based) */
  onCompleteAtIndex?: number;
}

/**
 * Speech Match Slide Props
 * Slide where students match audio to text choices
 */
export interface SpeechMatchSlideProps extends BaseSlideProps {
  /** Secondary heading */
  subtitle?: string;
  
  /** Optional note displayed below subtitle */
  note?: string;
  
  /** Choice elements that students can select */
  elements: ChoiceElement[];
}

// ============================================================================
// Union Type
// ============================================================================

/**
 * Union type of all possible slide props
 * Use type guards to narrow to specific types
 */
export type SlideProps =
  | TextSlideProps
  | TitleSlideProps
  | LessonEndSlideProps
  | AISpeakRepeatSlideProps
  | AISpeakStudentRepeatSlideProps
  | SpeechMatchSlideProps;

// ============================================================================
// Slide Type Constants
// ============================================================================
// Constants are now imported from ../constants/slideConstants.ts
// Re-exported above for backward compatibility

// ============================================================================
// Type Guard Functions
// ============================================================================

/**
 * Type guard: Check if props are for a text slide
 */
export function isTextSlideProps(props: unknown): props is TextSlideProps {
  if (!props || typeof props !== "object") return false;
  const p = props as Record<string, unknown>;
  // Text slides have body, and don't have type-specific fields
  return (
    typeof p.body === "string" ||
    (p.body === undefined && 
     !("lines" in p) && 
     !("elements" in p) && 
     !("message" in p) &&
     !("note" in p))
  );
}

/**
 * Type guard: Check if props are for a title slide
 */
export function isTitleSlideProps(props: unknown): props is TitleSlideProps {
  if (!props || typeof props !== "object") return false;
  const p = props as Record<string, unknown>;
  // Title slides are identified by slide type, not by props structure
  // They can have title, subtitle, note, but don't have body, lines, elements, or message
  return (
    !("body" in p) &&
    !("lines" in p) &&
    !("elements" in p) &&
    !("message" in p) &&
    !("phrases" in p)
  );
}

/**
 * Type guard: Check if props are for a lesson-end slide
 */
export function isLessonEndSlideProps(props: unknown): props is LessonEndSlideProps {
  if (!props || typeof props !== "object") return false;
  const p = props as Record<string, unknown>;
  // Lesson-end slides have message and/or actions, no subtitle
  return ("message" in p || "actions" in p) && !("subtitle" in p);
}

/**
 * Type guard: Check if props are for an ai-speak-repeat slide
 */
export function isAISpeakRepeatSlideProps(props: unknown): props is AISpeakRepeatSlideProps {
  if (!props || typeof props !== "object") return false;
  const p = props as Record<string, unknown>;
  // AI-speak-repeat slides have lines array
  return Array.isArray(p.lines) || typeof p.phrases === "string";
}

/**
 * Type guard: Check if props are for an ai-speak-student-repeat slide
 */
export function isAISpeakStudentRepeatSlideProps(props: unknown): props is AISpeakStudentRepeatSlideProps {
  if (!props || typeof props !== "object") return false;
  const p = props as Record<string, unknown>;
  // AI-speak-student-repeat slides have elements array with samplePrompt
  if (!Array.isArray(p.elements)) return false;
  if (p.elements.length === 0) return false;
  const firstElement = p.elements[0] as Record<string, unknown>;
  return "samplePrompt" in firstElement;
}

/**
 * Type guard: Check if props are for a speech-match slide
 */
export function isSpeechMatchSlideProps(props: unknown): props is SpeechMatchSlideProps {
  if (!props || typeof props !== "object") return false;
  const p = props as Record<string, unknown>;
  // Speech-match slides have elements array with label and speech
  if (!Array.isArray(p.elements)) return false;
  if (p.elements.length === 0) return false;
  const firstElement = p.elements[0] as Record<string, unknown>;
  return "label" in firstElement && "speech" in firstElement && !("samplePrompt" in firstElement);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get slide props with type safety based on slide type
 */
export function getTypedSlideProps(
  slideType: SlideType,
  propsJson: unknown
): SlideProps | null {
  if (!propsJson || typeof propsJson !== "object") {
    return null;
  }

  switch (slideType) {
    case SLIDE_TYPES.TEXT:
      return isTextSlideProps(propsJson) ? propsJson : (propsJson as TextSlideProps);
    case SLIDE_TYPES.TITLE:
      // Trust the slide type - title slides may not have note field
      // The type guard is too strict and can fail for valid title slides
      return propsJson as TitleSlideProps;
    case SLIDE_TYPES.LESSON_END:
      return isLessonEndSlideProps(propsJson) ? propsJson : (propsJson as LessonEndSlideProps);
    case SLIDE_TYPES.AI_SPEAK_REPEAT:
      return isAISpeakRepeatSlideProps(propsJson) ? propsJson : (propsJson as AISpeakRepeatSlideProps);
    case SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT:
      return isAISpeakStudentRepeatSlideProps(propsJson) ? propsJson : (propsJson as AISpeakStudentRepeatSlideProps);
    case SLIDE_TYPES.SPEECH_MATCH:
      return isSpeechMatchSlideProps(propsJson) ? propsJson : (propsJson as SpeechMatchSlideProps);
    default:
      // Log unknown slide type (development only to avoid noise)
      if (process.env.NODE_ENV === "development") {
        console.warn(`Unknown slide type: ${slideType}`);
      }
      return null;
  }
}

/**
 * Map CMS language format to player format
 * @deprecated Use mapCmsLanguageToPlayer from ../constants/slideConstants instead
 */
export function mapLanguageToPlayerFormat(cmsLang: CmsLanguage): PlayerLanguage {
  return mapCmsLanguageToPlayer(cmsLang);
}

/**
 * Validate slide props structure (basic validation)
 */
export function validateSlideProps(
  slideType: SlideType,
  props: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!props || typeof props !== "object") {
    return { valid: false, errors: ["Props must be an object"] };
  }

  const p = props as Record<string, unknown>;

  // Common validations
  if (p.label !== undefined && typeof p.label !== "string") {
    errors.push("label must be a string");
  }

  // Type-specific validations
  switch (slideType) {
    case SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT:
      if (!Array.isArray(p.elements)) {
        errors.push("elements must be an array");
      } else if (p.elements.length === 0) {
        errors.push("elements array must contain at least one element");
      } else {
        p.elements.forEach((el, idx) => {
          if (!el || typeof el !== "object") {
            errors.push(`elements[${idx}] must be an object`);
          } else {
            const elem = el as Record<string, unknown>;
            if (!elem.samplePrompt || typeof elem.samplePrompt !== "string") {
              errors.push(`elements[${idx}].samplePrompt is required and must be a string`);
            }
          }
        });
      }
      break;

    case SLIDE_TYPES.SPEECH_MATCH:
      if (!Array.isArray(p.elements)) {
        errors.push("elements must be an array");
      } else if (p.elements.length === 0) {
        errors.push("elements array must contain at least one element");
      } else {
        p.elements.forEach((el, idx) => {
          if (!el || typeof el !== "object") {
            errors.push(`elements[${idx}] must be an object`);
          } else {
            const elem = el as Record<string, unknown>;
            if (!elem.label || typeof elem.label !== "string") {
              errors.push(`elements[${idx}].label is required and must be a string`);
            }
            if (!elem.speech || typeof elem.speech !== "object") {
              errors.push(`elements[${idx}].speech is required and must be an object`);
            } else {
              const speech = elem.speech as Record<string, unknown>;
              if (speech.mode === "file" && !speech.fileUrl) {
                errors.push(`elements[${idx}].speech.fileUrl is required when mode is "file"`);
              }
              if (speech.mode === "tts" && !speech.text) {
                errors.push(`elements[${idx}].speech.text is required when mode is "tts"`);
              }
            }
          }
        });
      }
      break;

    case SLIDE_TYPES.AI_SPEAK_REPEAT:
      if (!p.lines && !p.phrases) {
        errors.push("lines or phrases is required");
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

