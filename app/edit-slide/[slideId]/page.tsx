"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import { uiTokens } from "../../../lib/uiTokens";
import { shouldUseDynamicForm } from "../../../lib/config/featureFlags";
import { DynamicSlideForm } from "../../../components/slide-editor/DynamicSlideForm";
import { createFormChangeHandler } from "../../../lib/utils/formStateMapper";
import { SLIDE_TYPES, type ChoiceElement, isSpeechMatchSlideProps } from "../../../lib/types/slideProps";
import { getSlideDisplayName } from "../../../lib/utils/displayName";
import { useSlideFormData, extractInitialFormValues } from "../../../lib/hooks/slides/useSlideFormData";
import { useSlideFormState } from "../../../lib/hooks/slides/useSlideFormState";
import { useSlideFormValidation } from "../../../lib/hooks/slides/useSlideFormValidation";
import { useSlideFormSave } from "../../../lib/hooks/slides/useSlideFormSave";
import { SlideFormLoader } from "../../../components/slide-editor/SlideFormLoader";
import { SlideFormActions } from "../../../components/slide-editor/SlideFormActions";
import { IdentitySection } from "../../../components/slide-editor/IdentitySection";
import { CoreContentSection } from "../../../components/slide-editor/CoreContentSection";
import { SlideTypeSpecificContentSection } from "../../../components/slide-editor/SlideTypeSpecificContentSection";
import { LanguageSection } from "../../../components/slide-editor/LanguageSection";
import { MediaSection } from "../../../components/slide-editor/MediaSection";
import { SpeechAudioInteractionSection } from "../../../components/slide-editor/SpeechAudioInteractionSection";
import { InteractionFlagsSection } from "../../../components/slide-editor/InteractionFlagsSection";
import { InteractionFlowSection } from "../../../components/slide-editor/InteractionFlowSection";
import { AuthoringMetadataSection } from "../../../components/slide-editor/AuthoringMetadataSection";
import { logger } from "../../../lib/utils/logger";

/**
 * Edit Slide Page
 * 
 * Refactored to use custom hooks for data loading, state management, validation, and saving.
 * This significantly reduces the page size and improves maintainability.
 */
export default function EditSlidePage() {
  const params = useParams<{ slideId: string }>();
  const slideId = params?.slideId as string | undefined;

  // Load slide data
  const { loadState, data, reload } = useSlideFormData(slideId);

  // Extract initial values when data loads (memoized to prevent infinite loops)
  const initialValues = useMemo(() => {
    if (!data) return null;
    return extractInitialFormValues(data.slide, data.props, data.meta);
  }, [data?.slide.id, data?.slide.propsJson, data?.slide.metaJson, data?.group?.id]);

  // Manage form state
  const {
    state,
    setters,
    originalSpeechMatchElementsRef,
    speechMatchElementsTouchedRef,
    hasUnsavedChanges,
    updateInitialValues,
  } = useSlideFormState(initialValues);

  // Validation hook
  const { validate } = useSlideFormValidation();

  // Save hook
  const { save, saving, message, setMessage } = useSlideFormSave();

  // Player preview URL
  const playerBaseUrl = process.env.NEXT_PUBLIC_PLAYER_BASE_URL || "";
  const playerHref =
    playerBaseUrl && state.lessonId
      ? `${playerBaseUrl}/lecons/db/${state.lessonId}`
      : undefined;

  // Store original speech-match elements when data loads
  useEffect(() => {
    if (
      data &&
      data.slide.type === SLIDE_TYPES.SPEECH_MATCH &&
      isSpeechMatchSlideProps(data.props) &&
      data.props.elements &&
      Array.isArray(data.props.elements)
    ) {
      originalSpeechMatchElementsRef.current = data.props.elements as ChoiceElement[];
      speechMatchElementsTouchedRef.current = false;
    } else {
      originalSpeechMatchElementsRef.current = null;
    }
  }, [data, originalSpeechMatchElementsRef, speechMatchElementsTouchedRef]);

  // Track when data reloads after save to update initial values
  const prevDataRef = useRef(data);
  useEffect(() => {
    // If data changed and we're not in a loading state, update initial values
    // This handles the case where reload() completes and new data is loaded
    if (
      data &&
      prevDataRef.current !== data &&
      loadState.status === "ready" &&
      data.slide.id === slideId
    ) {
      // Update initial values after reload completes to reset unsaved changes flag
      updateInitialValues();
      prevDataRef.current = data;
    }
  }, [data, loadState.status, slideId, updateInitialValues]);

  // Handle save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideId || !data) return;

    // Debug: Log state before save
    logger.debug("[handleSave] State before save:", {
      title: state.title,
      label: state.label,
      subtitle: state.subtitle,
      body: state.body,
    });

    // Validate first
    const validationResult = validate(
      data.slide.type,
      {
        phrases: state.phrases,
        elements: state.elements,
        choiceElements: state.choiceElements,
      },
      originalSpeechMatchElementsRef.current,
      speechMatchElementsTouchedRef.current
    );

    if (!validationResult.valid) {
      setMessage(validationResult.error);
      return;
    }

    // Save
    const result = await save(
      slideId,
      data.slide.type,
      state,
      state.isActivity,
      originalSpeechMatchElementsRef.current,
      speechMatchElementsTouchedRef.current,
      validationResult
    );

    if (result.success) {
      // Reload data from database to get the latest saved data
      // This ensures we have the exact data that was saved
      // The useEffect watching for data changes will call updateInitialValues() when reload completes
      reload();
    }
  };

  // Get slide display name for title
  const slideDisplayName =
    loadState.status === "ready" && state.slideId
      ? getSlideDisplayName({ propsJson: { label: state.label } })
      : "";

  return (
    <CmsPageShell title={slideDisplayName ? `Edit Slide: ${slideDisplayName}` : "Edit Slide"}>
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
        <div
          style={{
            flex: "0 0 25%",
            backgroundColor: "transparent",
            border: "1px solid #9cc7c7",
            borderRadius: uiTokens.radius.lg,
            overflow: "auto",
          }}
        >
          <CmsOutlineView currentSlideId={slideId} />
        </div>

        {/* Right column - content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: uiTokens.space.md }}>
          {/* Top actions bar */}
          <SlideFormActions
            message={message}
            playerHref={playerHref}
            hasUnsavedChanges={hasUnsavedChanges}
            saving={saving}
            onSave={() => {
              const form = document.querySelector("form");
              if (form) {
                form.requestSubmit();
              }
            }}
          />

          {/* Loading and error states */}
          <SlideFormLoader loadState={loadState} />

          {loadState.status === "ready" && data && (
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: uiTokens.space.lg }}>
              {/* Debug info (remove in production) */}
              {process.env.NODE_ENV === "development" && (
                <div style={{ 
                  padding: uiTokens.space.sm, 
                  backgroundColor: "#f0f0f0", 
                  fontSize: uiTokens.font.meta.size,
                  marginBottom: uiTokens.space.sm,
                  borderRadius: uiTokens.radius.sm
                }}>
                  <strong>Debug:</strong> slideType="{data.slide.type}", state.slideType="{state.slideType}", shouldUseDynamicForm={shouldUseDynamicForm(data.slide.type) ? "true" : "false"}
                </div>
              )}
              {/* Dynamic Form (if feature flag enabled) */}
              {shouldUseDynamicForm(data.slide.type) ? (
                <DynamicSlideForm
                  slideType={data.slide.type}
                  values={state}
                  onChange={createFormChangeHandler(setters)}
                  defaultLang={state.defaultLang}
                />
        ) : (
          <>
            {/* Legacy Form (hardcoded) */}
            {/* Identity & Structure Section */}
            <IdentitySection
              slideId={state.slideId}
              slideType={state.slideType}
              groupId={state.groupId}
              groupName={state.groupName}
              orderIndex={state.orderIndex}
              label={state.label}
              onLabelChange={setters.setLabel}
            />

            {/* Core Content Section */}
            <CoreContentSection
              slideType={state.slideType}
              title={state.title}
              subtitle={state.subtitle}
              body={state.body}
              lessonEndMessage={state.lessonEndMessage}
              lessonEndActions={state.lessonEndActions}
              buttons={state.buttons}
              instructions={state.instructions}
              promptLabel={state.promptLabel}
              note={state.note}
              onTitleChange={setters.setTitle}
              onSubtitleChange={setters.setSubtitle}
              onBodyChange={setters.setBody}
              onLessonEndMessageChange={setters.setLessonEndMessage}
              onLessonEndActionsChange={setters.setLessonEndActions}
              onButtonsChange={setters.setButtons}
              onInstructionsChange={setters.setInstructions}
              onPromptLabelChange={setters.setPromptLabel}
              onNoteChange={setters.setNote}
            />

            {/* Slide Type Specific Content Section */}
            <SlideTypeSpecificContentSection
              slideType={state.slideType}
              instructions={state.instructions}
              promptLabel={state.promptLabel}
              title={state.title}
              subtitle={state.subtitle}
              note={state.note}
              phrases={state.phrases}
              elements={state.elements}
              choiceElements={state.choiceElements}
              defaultLang={state.defaultLang}
              onInstructionsChange={setters.setInstructions}
              onPromptLabelChange={setters.setPromptLabel}
              onTitleChange={setters.setTitle}
              onSubtitleChange={setters.setSubtitle}
              onNoteChange={setters.setNote}
              onPhrasesChange={setters.setPhrases}
              onElementsChange={setters.setElements}
              onChoiceElementsChange={setters.setChoiceElements}
            />

            {/* Language and Localization Section */}
            <LanguageSection defaultLang={state.defaultLang} onChange={setters.setDefaultLang} />

            {/* Media Reference Section */}
            {state.slideType !== SLIDE_TYPES.TITLE && state.slideType !== SLIDE_TYPES.TEXT && (
              <MediaSection audioId={state.audioId} onChange={setters.setAudioId} />
            )}

            {/* Speech & Audio Interaction Section */}
            <SpeechAudioInteractionSection
              slideType={state.slideType}
              phrases={state.phrases}
              elements={state.elements}
              choiceElements={state.choiceElements}
              defaultLang={state.defaultLang}
              onPhrasesChange={setters.setPhrases}
              onElementsChange={setters.setElements}
              onChoiceElementsChange={setters.setChoiceElements}
            />

            {/* Interaction Flags Section */}
            <InteractionFlagsSection
              slideType={state.slideType}
              isInteractive={state.isInteractive}
              allowSkip={state.allowSkip}
              allowRetry={state.allowRetry}
              isActivity={state.isActivity}
              maxAttempts={state.maxAttempts}
              minAttemptsBeforeSkip={state.minAttemptsBeforeSkip}
              onIsInteractiveChange={setters.setIsInteractive}
              onAllowSkipChange={setters.setAllowSkip}
              onAllowRetryChange={setters.setAllowRetry}
              onIsActivityChange={setters.setIsActivity}
              onMaxAttemptsChange={setters.setMaxAttempts}
              onMinAttemptsBeforeSkipChange={setters.setMinAttemptsBeforeSkip}
            />

            {/* Interaction/Flow Section */}
            <InteractionFlowSection
              slideType={state.slideType}
              maxAttempts={state.maxAttempts}
              minAttemptsBeforeSkip={state.minAttemptsBeforeSkip}
              onCompleteAtIndex={state.onCompleteAtIndex}
              onMaxAttemptsChange={(value) => {
                setters.setMaxAttempts(value);
                // Auto-adjust minAttemptsBeforeSkip if it exceeds maxAttempts
                if (value !== "" && state.minAttemptsBeforeSkip !== "" && Number(state.minAttemptsBeforeSkip) > Number(value)) {
                  setters.setMinAttemptsBeforeSkip(value);
                }
              }}
              onMinAttemptsBeforeSkipChange={setters.setMinAttemptsBeforeSkip}
              onOnCompleteAtIndexChange={setters.setOnCompleteAtIndex}
            />

            {/* Authoring Metadata Section */}
            <AuthoringMetadataSection
              slideType={state.slideType}
              activityName={state.activityName}
              onChange={setters.setActivityName}
            />
          </>
        )}
      </form>
          )}
        </div>
      </div>
    </CmsPageShell>
  );
}
