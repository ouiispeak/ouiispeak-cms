/**
 * Form State Mapper Utilities
 * 
 * Helper functions to map between form field IDs and state setters.
 * Used to bridge dynamic form onChange events with existing state management.
 */

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
  setElements?: (v: any[]) => void;
  setChoiceElements?: (v: any[]) => void;
  setIsInteractive?: (v: boolean) => void;
  setAllowSkip?: (v: boolean) => void;
  setAllowRetry?: (v: boolean) => void;
  setIsActivity?: (v: boolean) => void;
  setOnCompleteAtIndex?: (v: string) => void;
  setMaxAttempts?: (v: string) => void;
  setMinAttemptsBeforeSkip?: (v: string) => void;
  setActivityName?: (v: string) => void;
}): (fieldId: string, value: any) => void {
  return (fieldId: string, value: any) => {
    // Map fieldId to appropriate setter
    switch (fieldId) {
      case "label":
        setters.setLabel?.(value);
        break;
      case "title":
        setters.setTitle?.(value);
        break;
      case "subtitle":
        setters.setSubtitle?.(value);
        break;
      case "body":
        setters.setBody?.(value);
        break;
      case "lessonEndMessage":
        setters.setLessonEndMessage?.(value);
        break;
      case "lessonEndActions":
        setters.setLessonEndActions?.(value);
        break;
      case "buttons":
        setters.setButtons?.(value);
        break;
      case "defaultLang":
        setters.setDefaultLang?.(value);
        break;
      case "audioId":
        setters.setAudioId?.(value);
        break;
      case "phrases":
        setters.setPhrases?.(value);
        break;
      case "instructions":
        setters.setInstructions?.(value);
        break;
      case "promptLabel":
        setters.setPromptLabel?.(value);
        break;
      case "note":
        setters.setNote?.(value);
        break;
      case "elements":
        setters.setElements?.(value);
        break;
      case "choiceElements":
        setters.setChoiceElements?.(value);
        break;
      case "isInteractive":
        setters.setIsInteractive?.(value);
        break;
      case "allowSkip":
        setters.setAllowSkip?.(value);
        break;
      case "allowRetry":
        setters.setAllowRetry?.(value);
        break;
      case "isActivity":
        setters.setIsActivity?.(value);
        break;
      case "onCompleteAtIndex":
        setters.setOnCompleteAtIndex?.(value);
        break;
      case "maxAttempts":
        setters.setMaxAttempts?.(value);
        break;
      case "minAttemptsBeforeSkip":
        setters.setMinAttemptsBeforeSkip?.(value);
        break;
      case "activityName":
        setters.setActivityName?.(value);
        break;
      default:
        console.warn(`No setter found for fieldId: ${fieldId}`);
    }
  };
}

