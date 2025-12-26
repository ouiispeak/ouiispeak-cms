/**
 * Dynamic Slide Form Wrapper
 * 
 * Wrapper component that bridges the gap between the existing edit-slide page
 * state management and the dynamic form component.
 * 
 * This component maps individual state variables to/from a values object
 * that the DynamicSlideForm expects.
 */

"use client";

import { DynamicSlideForm } from "./DynamicSlideForm";
import type { Slide } from "../../lib/domain/slide";

interface DynamicSlideFormWrapperProps {
  slideType: string;
  slide: Slide;
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  defaultLang?: string;
  bucketName?: string;
}

/**
 * Wrapper that adapts existing state to dynamic form format
 */
export function DynamicSlideFormWrapper({
  slideType,
  slide,
  values,
  onChange,
  defaultLang,
  bucketName
}: DynamicSlideFormWrapperProps) {
  // The DynamicSlideForm expects values to be keyed by fieldId
  // The wrapper already receives values in this format, so we can pass them through
  
  return (
    <DynamicSlideForm
      slideType={slideType}
      values={values}
      onChange={onChange}
      defaultLang={defaultLang}
      bucketName={bucketName}
    />
  );
}

/**
 * Helper function to convert slide data and state to values object
 * This maps the existing state structure to field IDs
 */
export function buildFormValues(
  slide: Slide,
  state: {
    label: string;
    title: string;
    subtitle: string;
    body: string;
    lessonEndMessage?: string;
    lessonEndActions?: string;
    buttons: string;
    defaultLang: string;
    audioId: string;
    phrases: string;
    instructions: string;
    promptLabel: string;
    note: string;
    elements: any[];
    choiceElements: any[];
    isInteractive: boolean;
    allowSkip: boolean;
    allowRetry: boolean;
    isActivity: boolean;
    onCompleteAtIndex: string;
    maxAttempts: string;
    minAttemptsBeforeSkip: string;
    activityName: string;
  }
): Record<string, any> {
  return {
    // Identity fields
    slideId: slide.id,
    slideType: slide.type,
    groupId: slide.groupId || "",
    groupName: "", // Will be set separately
    orderIndex: slide.orderIndex || 0,
    label: state.label,
    
    // Content fields
    title: state.title,
    subtitle: state.subtitle,
    body: state.body,
    lessonEndMessage: state.lessonEndMessage || "",
    lessonEndActions: state.lessonEndActions || "",
    buttons: state.buttons,
    
    // Language
    defaultLang: state.defaultLang,
    
    // Media
    audioId: state.audioId,
    
    // Speech & Audio
    phrases: state.phrases,
    instructions: state.instructions,
    promptLabel: state.promptLabel,
    note: state.note,
    elements: state.elements,
    choiceElements: state.choiceElements,
    
    // Interaction flags
    isInteractive: state.isInteractive,
    allowSkip: state.allowSkip,
    allowRetry: state.allowRetry,
    isActivity: state.isActivity,
    
    // Flow
    onCompleteAtIndex: state.onCompleteAtIndex,
    maxAttempts: state.maxAttempts,
    minAttemptsBeforeSkip: state.minAttemptsBeforeSkip,
    
    // Metadata
    activityName: state.activityName
  };
}

/**
 * Helper function to update state from form values
 */
export function updateStateFromValues(
  values: Record<string, any>,
  setters: {
    setLabel: (v: string) => void;
    setTitle: (v: string) => void;
    setSubtitle: (v: string) => void;
    setBody: (v: string) => void;
    setLessonEndMessage?: (v: string) => void;
    setLessonEndActions?: (v: string) => void;
    setButtons: (v: string) => void;
    setDefaultLang: (v: string) => void;
    setAudioId: (v: string) => void;
    setPhrases: (v: string) => void;
    setInstructions: (v: string) => void;
    setPromptLabel: (v: string) => void;
    setNote: (v: string) => void;
    setElements: (v: any[]) => void;
    setChoiceElements: (v: any[]) => void;
    setIsInteractive: (v: boolean) => void;
    setAllowSkip: (v: boolean) => void;
    setAllowRetry: (v: boolean) => void;
    setIsActivity: (v: boolean) => void;
    setOnCompleteAtIndex: (v: string) => void;
    setMaxAttempts: (v: string) => void;
    setMinAttemptsBeforeSkip: (v: string) => void;
    setActivityName: (v: string) => void;
  }
) {
  if (values.label !== undefined) setters.setLabel(values.label);
  if (values.title !== undefined) setters.setTitle(values.title);
  if (values.subtitle !== undefined) setters.setSubtitle(values.subtitle);
  if (values.body !== undefined) setters.setBody(values.body);
  if (values.lessonEndMessage !== undefined && setters.setLessonEndMessage) setters.setLessonEndMessage(values.lessonEndMessage);
  if (values.lessonEndActions !== undefined && setters.setLessonEndActions) setters.setLessonEndActions(values.lessonEndActions);
  if (values.buttons !== undefined) setters.setButtons(values.buttons);
  if (values.defaultLang !== undefined) setters.setDefaultLang(values.defaultLang);
  if (values.audioId !== undefined) setters.setAudioId(values.audioId);
  if (values.phrases !== undefined) setters.setPhrases(values.phrases);
  if (values.instructions !== undefined) setters.setInstructions(values.instructions);
  if (values.promptLabel !== undefined) setters.setPromptLabel(values.promptLabel);
  if (values.note !== undefined) setters.setNote(values.note);
  if (values.elements !== undefined) setters.setElements(values.elements);
  if (values.choiceElements !== undefined) setters.setChoiceElements(values.choiceElements);
  if (values.isInteractive !== undefined) setters.setIsInteractive(values.isInteractive);
  if (values.allowSkip !== undefined) setters.setAllowSkip(values.allowSkip);
  if (values.allowRetry !== undefined) setters.setAllowRetry(values.allowRetry);
  if (values.isActivity !== undefined) setters.setIsActivity(values.isActivity);
  if (values.onCompleteAtIndex !== undefined) setters.setOnCompleteAtIndex(values.onCompleteAtIndex);
  if (values.maxAttempts !== undefined) setters.setMaxAttempts(values.maxAttempts);
  if (values.minAttemptsBeforeSkip !== undefined) setters.setMinAttemptsBeforeSkip(values.minAttemptsBeforeSkip);
  if (values.activityName !== undefined) setters.setActivityName(values.activityName);
}

