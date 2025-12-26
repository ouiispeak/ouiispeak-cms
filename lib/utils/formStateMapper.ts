/**
 * Form State Mapper Utilities
 * 
 * Helper functions to map between form field IDs and state setters.
 * Used to bridge dynamic form onChange events with existing state management.
 */

import { logger } from "./logger";

/**
 * Type for student repeat elements in form state
 */
type StudentRepeatFormElement = {
  samplePrompt: string;
  referenceText: string;
  audioPath: string;
};

/**
 * Type for choice elements in form state
 */
type ChoiceFormElement = {
  label: string;
  speech: { mode: "tts" | "file"; lang?: "en" | "fr"; text?: string; fileUrl?: string };
};

/**
 * Creates a handler that maps fieldId changes to appropriate state setters
 */
export function createFormChangeHandler(setters: {
  setLabel?: (v: string) => void;
  setTitle?: (v: string) => void;
  setSubtitle?: (v: string) => void;
  setBody?: (v: string) => void;
  setLessonEndMessage?: (v: string) => void;
  setLessonEndActions?: (v: string) => void;
  setButtons?: (v: string) => void;
  setDefaultLang?: (v: string) => void;
  setAudioId?: (v: string) => void;
  setPhrases?: (v: string) => void;
  setInstructions?: (v: string) => void;
  setPromptLabel?: (v: string) => void;
  setNote?: (v: string) => void;
  setElements?: (v: StudentRepeatFormElement[]) => void;
  setChoiceElements?: (v: ChoiceFormElement[]) => void;
  setIsInteractive?: (v: boolean) => void;
  setAllowSkip?: (v: boolean) => void;
  setAllowRetry?: (v: boolean) => void;
  setIsActivity?: (v: boolean) => void;
  setOnCompleteAtIndex?: (v: string) => void;
  setMaxAttempts?: (v: string) => void;
  setMinAttemptsBeforeSkip?: (v: string) => void;
  setActivityName?: (v: string) => void;
}): (fieldId: string, value: unknown) => void {
  return (fieldId: string, value: unknown) => {
    // Debug logging
    logger.debug(`[FormChangeHandler] fieldId: "${fieldId}", value:`, value);
    
    // Map fieldId to appropriate setter with type safety
    switch (fieldId) {
      case "label":
        setters.setLabel?.(typeof value === "string" ? value : "");
        break;
      case "title":
        setters.setTitle?.(typeof value === "string" ? value : "");
        break;
      case "subtitle":
        setters.setSubtitle?.(typeof value === "string" ? value : "");
        break;
      case "body":
        setters.setBody?.(typeof value === "string" ? value : "");
        break;
      case "lessonEndMessage":
        setters.setLessonEndMessage?.(typeof value === "string" ? value : "");
        break;
      case "lessonEndActions":
        setters.setLessonEndActions?.(typeof value === "string" ? value : "");
        break;
      case "buttons":
        setters.setButtons?.(typeof value === "string" ? value : "");
        break;
      case "defaultLang":
        setters.setDefaultLang?.(typeof value === "string" ? value : "");
        break;
      case "audioId":
        setters.setAudioId?.(typeof value === "string" ? value : "");
        break;
      case "phrases":
        setters.setPhrases?.(typeof value === "string" ? value : "");
        break;
      case "instructions":
        setters.setInstructions?.(typeof value === "string" ? value : "");
        break;
      case "promptLabel":
        setters.setPromptLabel?.(typeof value === "string" ? value : "");
        break;
      case "note":
        setters.setNote?.(typeof value === "string" ? value : "");
        break;
      case "elements":
        setters.setElements?.(
          Array.isArray(value) ? (value as StudentRepeatFormElement[]) : []
        );
        break;
      case "choiceElements":
        setters.setChoiceElements?.(
          Array.isArray(value) ? (value as ChoiceFormElement[]) : []
        );
        break;
      case "isInteractive":
        setters.setIsInteractive?.(typeof value === "boolean" ? value : false);
        break;
      case "allowSkip":
        setters.setAllowSkip?.(typeof value === "boolean" ? value : false);
        break;
      case "allowRetry":
        setters.setAllowRetry?.(typeof value === "boolean" ? value : false);
        break;
      case "isActivity":
        setters.setIsActivity?.(typeof value === "boolean" ? value : false);
        break;
      case "onCompleteAtIndex":
        setters.setOnCompleteAtIndex?.(typeof value === "string" ? value : "");
        break;
      case "maxAttempts":
        setters.setMaxAttempts?.(typeof value === "string" ? value : "");
        break;
      case "minAttemptsBeforeSkip":
        setters.setMinAttemptsBeforeSkip?.(typeof value === "string" ? value : "");
        break;
      case "activityName":
        setters.setActivityName?.(typeof value === "string" ? value : "");
        break;
      default:
        logger.warn(`[FormChangeHandler] No setter found for fieldId: ${fieldId}`);
        logger.debug(`Available setters:`, Object.keys(setters).filter(k => k.startsWith('set')));
    }
  };
}

