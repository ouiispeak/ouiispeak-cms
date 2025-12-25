"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import CmsSection from "../../../components/ui/CmsSection";
import { uiTokens } from "../../../lib/uiTokens";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import Select from "../../../components/ui/Select";
import AudioFileSelector from "../../../components/ui/AudioFileSelector";
import SaveChangesButton from "../../../components/ui/SaveChangesButton";
import StatusMessage from "../../../components/ui/StatusMessage";
import PreviewInPlayerButton from "../../../components/ui/PreviewInPlayerButton";
import { loadSlideById, updateSlide } from "../../../lib/data/slides";
import { loadGroupById } from "../../../lib/data/groups";
import { useUnsavedChangesWarning } from "../../../lib/hooks/useUnsavedChangesWarning";
import { getSlideDisplayName, getGroupDisplayName } from "../../../lib/utils/displayName";
import { getAudioFileUrl } from "../../../lib/storage/audioFiles";
import StudentRepeatElementMapper from "../../../components/ui/StudentRepeatElementMapper";
import ChoiceElementMapper from "../../../components/ui/ChoiceElementMapper";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready" };

/**
 * Edit Slide Page
 * 
 * This page uses the manage-slides form layout as the default layout.
 * Edits individual slides by loading slide data and allowing updates to props_json fields.
 */
export default function EditSlidePage() {
  const params = useParams<{ slideId: string }>();
  const slideId = params?.slideId as string | undefined;

  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [slideIdValue, setSlideIdValue] = useState("");
  const [slideType, setSlideType] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [label, setLabel] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [lessonEndMessage, setLessonEndMessage] = useState(""); // For lesson-end slides
  const [lessonEndActions, setLessonEndActions] = useState(""); // For lesson-end slides (JSON string)
  const [body, setBody] = useState("");
  const [buttons, setButtons] = useState("");
  const [defaultLang, setDefaultLang] = useState("");
  const [audioId, setAudioId] = useState("");
  const [activityName, setActivityName] = useState("");
  const [phrases, setPhrases] = useState("");
  // ai-speak-student-repeat specific fields
  const [instructions, setInstructions] = useState("");
  const [promptLabel, setPromptLabel] = useState("");
  const [onCompleteAtIndex, setOnCompleteAtIndex] = useState<string>("");
  const [elements, setElements] = useState<Array<{samplePrompt: string; referenceText: string; audioPath: string}>>([]);
  // speech-match specific fields
  const [choiceElements, setChoiceElements] = useState<Array<{label: string; speech: {mode: "tts" | "file"; lang?: "en" | "fr"; text?: string; fileUrl?: string}}>>([]);
  const [note, setNote] = useState("");
  const [isInteractive, setIsInteractive] = useState(false);
  const [allowSkip, setAllowSkip] = useState(false);
  const [allowRetry, setAllowRetry] = useState(false);
  const [isActivity, setIsActivity] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState<string>("");
  const [minAttemptsBeforeSkip, setMinAttemptsBeforeSkip] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const playerBaseUrl = process.env.NEXT_PUBLIC_PLAYER_BASE_URL || "";
  const playerHref = playerBaseUrl && lessonId ? `${playerBaseUrl}/lecons/db/${lessonId}` : undefined;

  // Helper function to extract path from Supabase Storage URL
  function extractPathFromUrl(url: string): string {
    if (url.includes("/storage/v1/object/public/")) {
      const parts = url.split("/storage/v1/object/public/");
      if (parts[1]) {
        const pathParts = parts[1].split("/");
        return pathParts.slice(1).join("/"); // Skip bucket name
      }
    }
    return url;
  }

  // Helper function to map CMS language values to player format
  // CMS uses: "english", "french", "both"
  // Player expects: "en", "fr" (SupportedLang type)
  function mapLanguageToPlayerFormat(cmsLang: string): string {
    const langMap: Record<string, string> = {
      'english': 'en',
      'french': 'fr',
      'both': 'en', // Default to 'en' for 'both', player will handle TTS accordingly
    };
    return langMap[cmsLang.toLowerCase()] || cmsLang || 'en';
  }

  // Track initial values to detect unsaved changes
  const initialValuesRef = useRef<{
    label: string;
    title: string;
    subtitle: string;
    body: string;
    buttons: string;
    defaultLang: string;
    audioId: string;
    activityName: string;
    phrases: string;
    instructions: string;
    promptLabel: string;
    onCompleteAtIndex: string;
    elements: Array<{samplePrompt: string; referenceText: string; audioPath: string}>;
    isInteractive: boolean;
    allowSkip: boolean;
    allowRetry: boolean;
    isActivity: boolean;
    maxAttempts: string;
    minAttemptsBeforeSkip: string;
  } | null>(null);

  // Warn before navigating away with unsaved changes
  useUnsavedChangesWarning(hasUnsavedChanges);

  // Load slide data
  useEffect(() => {
    if (!slideId) {
      setLoadState({ status: "error", message: "No slideId provided in URL." });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data: slide, error } = await loadSlideById(slideId!);

      if (error) {
        setLoadState({ status: "error", message: error });
        return;
      }

      if (!slide) {
        setLoadState({ status: "error", message: `No slide found with id "${slideId}"` });
        return;
      }

      // Extract props from propsJson
      const props = (slide.propsJson as any) || {};
      // Extract metaJson for activityName
      const meta = (slide.metaJson as any) || {};
      
      // Set form values
      setSlideIdValue(slide.id);
      setSlideType(slide.type || "");
      setGroupId(slide.groupId || "");
      setLessonId(slide.lessonId);
      setOrderIndex(slide.orderIndex ?? 0);
      setLabel(props.label || "");
      setTitle(props.title || "");
      // For lesson-end slides, use message instead of subtitle
      if (slide.type === "lesson-end") {
        setLessonEndMessage(props.message || "");
        setSubtitle(""); // Clear subtitle for lesson-end
        setLessonEndActions(props.actions ? JSON.stringify(props.actions, null, 2) : "");
      } else {
        setSubtitle(props.subtitle || "");
        setLessonEndMessage(""); // Clear message for non-lesson-end slides
        setLessonEndActions("");
      }
      setBody(props.body || "");
      setButtons(props.buttons ? JSON.stringify(props.buttons, null, 2) : "");
      setDefaultLang(props.defaultLang || "");
      setAudioId(props.audioId || "");
      setActivityName(meta.activityName || "");
      setIsInteractive(props.isInteractive || false);
      setAllowSkip(props.allowSkip || false);
      setAllowRetry(props.allowRetry || false);
      setIsActivity(slide.isActivity || false);
      setMaxAttempts(props.maxAttempts !== undefined && props.maxAttempts !== null ? String(props.maxAttempts) : "");
      setMinAttemptsBeforeSkip(props.minAttemptsBeforeSkip !== undefined && props.minAttemptsBeforeSkip !== null ? String(props.minAttemptsBeforeSkip) : "");
      // Load ai-speak-student-repeat specific fields
      setInstructions(props.instructions || "");
      setPromptLabel(props.promptLabel || "");
      setOnCompleteAtIndex(props.onCompleteAtIndex !== undefined && props.onCompleteAtIndex !== null ? String(props.onCompleteAtIndex) : "");
      // Load elements array for ai-speak-student-repeat
      if (props.elements && Array.isArray(props.elements)) {
        const loadedElements = props.elements.map((el: any) => ({
          samplePrompt: el.samplePrompt || "",
          referenceText: el.referenceText || "",
          audioPath: el.speech?.fileUrl ? extractPathFromUrl(el.speech.fileUrl) : "",
        }));
        setElements(loadedElements);
      } else {
        setElements([]);
      }
      // Load speech-match specific fields
      setNote(props.note || "");
      // Load choiceElements array for speech-match
      if (slideType === "speech-match") {
        if (props.elements && Array.isArray(props.elements)) {
          const loadedChoiceElements = props.elements.map((el: any) => ({
            label: el.label || "",
            speech: {
              mode: el.speech?.mode || "tts",
              lang: el.speech?.lang || (defaultLang === "english" || defaultLang === "en" ? "en" : defaultLang === "french" || defaultLang === "fr" ? "fr" : "en"),
              text: el.speech?.text || el.label || "",
              fileUrl: el.speech?.fileUrl || "",
            },
          }));
          setChoiceElements(loadedChoiceElements);
        } else {
          setChoiceElements([]);
        }
      }
      // Handle phrases - if it's lines array, flatten it; otherwise use as string
      if (props.lines && Array.isArray(props.lines)) {
        const flatPhrases = props.lines.flat().map((cell: any) => cell.label || cell).join("\n");
        setPhrases(flatPhrases);
      } else if (props.phrases) {
        setPhrases(typeof props.phrases === "string" ? props.phrases : JSON.stringify(props.phrases));
      } else {
        setPhrases("");
      }

      // Load group to get group name
      if (slide.groupId) {
        const { data: groupData, error: groupError } = await loadGroupById(slide.groupId);
        if (groupData) {
          // Use title if available, otherwise fall back to label
          setGroupName(groupData.title || groupData.label || "Untitled group");
        } else if (groupError) {
          console.error("Error loading group:", groupError);
          setGroupName("Error loading group name");
        }
      }

      // Store initial values
      const initialPhrases = props.lines && Array.isArray(props.lines)
        ? props.lines.flat().map((cell: any) => cell.label || cell).join("\n")
        : (props.phrases || "");
      initialValuesRef.current = {
        label: props.label || "",
        title: props.title || "",
        subtitle: slide.type === "lesson-end" ? "" : (props.subtitle || ""),
        lessonEndMessage: slide.type === "lesson-end" ? (props.message || "") : "",
        lessonEndActions: slide.type === "lesson-end" ? (props.actions ? JSON.stringify(props.actions, null, 2) : "") : "",
        body: props.body || "",
        buttons: props.buttons ? JSON.stringify(props.buttons, null, 2) : "",
        defaultLang: props.defaultLang || "",
        audioId: props.audioId || "",
        activityName: meta.activityName || "",
        phrases: typeof initialPhrases === "string" ? initialPhrases : JSON.stringify(initialPhrases),
        instructions: props.instructions || "",
        promptLabel: props.promptLabel || "",
        onCompleteAtIndex: props.onCompleteAtIndex !== undefined && props.onCompleteAtIndex !== null ? String(props.onCompleteAtIndex) : "",
        elements: props.elements && Array.isArray(props.elements)
          ? props.elements.map((el: any) => ({
              samplePrompt: el.samplePrompt || "",
              referenceText: el.referenceText || "",
              audioPath: el.speech?.fileUrl ? extractPathFromUrl(el.speech.fileUrl) : "",
            }))
          : [],
        isInteractive: props.isInteractive || false,
        allowSkip: props.allowSkip || false,
        allowRetry: props.allowRetry || false,
        isActivity: slide.isActivity || false,
        maxAttempts: props.maxAttempts !== undefined && props.maxAttempts !== null ? String(props.maxAttempts) : "",
        minAttemptsBeforeSkip: props.minAttemptsBeforeSkip !== undefined && props.minAttemptsBeforeSkip !== null ? String(props.minAttemptsBeforeSkip) : "",
      };

      setLoadState({ status: "ready" });
    }

    load();
  }, [slideId]);

  // Check for unsaved changes
  useEffect(() => {
    if (loadState.status !== "ready" || !initialValuesRef.current) {
      setHasUnsavedChanges(false);
      return;
    }

    const hasChanges =
      label !== initialValuesRef.current.label ||
      title !== initialValuesRef.current.title ||
      subtitle !== initialValuesRef.current.subtitle ||
      lessonEndMessage !== initialValuesRef.current.lessonEndMessage ||
      lessonEndActions !== initialValuesRef.current.lessonEndActions ||
      body !== initialValuesRef.current.body ||
      buttons !== initialValuesRef.current.buttons ||
      defaultLang !== initialValuesRef.current.defaultLang ||
      audioId !== initialValuesRef.current.audioId ||
      activityName !== initialValuesRef.current.activityName ||
      phrases !== initialValuesRef.current.phrases ||
      isInteractive !== initialValuesRef.current.isInteractive ||
      allowSkip !== initialValuesRef.current.allowSkip ||
      allowRetry !== initialValuesRef.current.allowRetry ||
      isActivity !== initialValuesRef.current.isActivity ||
      maxAttempts !== initialValuesRef.current.maxAttempts ||
      minAttemptsBeforeSkip !== initialValuesRef.current.minAttemptsBeforeSkip ||
      instructions !== initialValuesRef.current.instructions ||
      promptLabel !== initialValuesRef.current.promptLabel ||
      onCompleteAtIndex !== initialValuesRef.current.onCompleteAtIndex ||
      JSON.stringify(elements) !== JSON.stringify(initialValuesRef.current.elements);

      setHasUnsavedChanges(hasChanges);
  }, [label, title, subtitle, lessonEndMessage, lessonEndActions, body, buttons, defaultLang, audioId, activityName, phrases, instructions, promptLabel, onCompleteAtIndex, elements, isInteractive, allowSkip, allowRetry, isActivity, maxAttempts, minAttemptsBeforeSkip, loadState]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideId) return;

    setSaving(true);
    setMessage(null);

    try {
      // Parse buttons if provided
      let buttonsValue: unknown = null;
      if (buttons.trim()) {
        try {
          buttonsValue = JSON.parse(buttons);
        } catch (parseError) {
          setMessage("Error: Invalid JSON in Buttons field");
          setSaving(false);
          return;
        }
      }

      // Parse actions if provided (for lesson-end slides)
      let actionsValue: unknown = null;
      if (slideType === "lesson-end" && lessonEndActions.trim()) {
        try {
          actionsValue = JSON.parse(lessonEndActions);
        } catch (parseError) {
          setMessage("Error: Invalid JSON in Actions field");
          setSaving(false);
          return;
        }
      }

      // Build updated props_json
      const updatedProps: any = {
        label: label.trim() || undefined,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        buttons: buttonsValue || undefined,
        defaultLang: defaultLang.trim() || undefined,
        audioId: audioId.trim() || undefined,
      };

      // For lesson-end slides, use message instead of subtitle
      if (slideType === "lesson-end") {
        updatedProps.message = lessonEndMessage.trim() || undefined;
        updatedProps.actions = actionsValue || undefined;
      } else {
        updatedProps.subtitle = subtitle.trim() || undefined;
      }

      // Add boolean flags (always include them, even if false)
      updatedProps.isInteractive = isInteractive;
      updatedProps.allowSkip = allowSkip;
      updatedProps.allowRetry = allowRetry;

      // Add numeric attempt fields (only if set)
      if (maxAttempts.trim() !== "") {
        const maxAttemptsValue = Math.max(0, Math.floor(Number(maxAttempts)));
        updatedProps.maxAttempts = maxAttemptsValue;
      }
      if (minAttemptsBeforeSkip.trim() !== "") {
        const minAttemptsValue = Math.max(0, Math.floor(Number(minAttemptsBeforeSkip)));
        // Auto-adjust if it exceeds maxAttempts
        if (maxAttempts.trim() !== "" && minAttemptsValue > Number(maxAttempts)) {
          updatedProps.minAttemptsBeforeSkip = Math.max(0, Math.floor(Number(maxAttempts)));
        } else {
          updatedProps.minAttemptsBeforeSkip = minAttemptsValue;
        }
      }

      // Handle slide type-specific data structures
      if (slideType === "ai-speak-student-repeat") {
        // For ai-speak-student-repeat: save elements array
        if (elements.length > 0) {
          updatedProps.elements = elements
            .filter((el) => el.samplePrompt.trim() !== "") // Only include elements with samplePrompt
            .map((el) => {
              const samplePrompt = el.samplePrompt.trim();
              const referenceText = el.referenceText.trim() || samplePrompt; // Default to samplePrompt if not provided
              
              const element: any = {
                samplePrompt,
                referenceText, // Always include referenceText for pronunciation assessment
              };
              
              // Add speech if audio is provided
              if (el.audioPath.trim()) {
                const audioUrl = getAudioFileUrl("lesson-audio", el.audioPath.trim());
                element.speech = {
                  mode: "file" as const,
                  fileUrl: audioUrl,
                };
              } else if (referenceText || samplePrompt) {
                // Use TTS if no audio file but we have text
                // Map CMS language format to player format
                const mappedLang = mapLanguageToPlayerFormat(defaultLang || "en");
                element.speech = {
                  mode: "tts" as const,
                  lang: mappedLang,
                  text: referenceText || samplePrompt,
                };
              }
              
              return element;
            });
        }
        
        // Add ai-speak-student-repeat specific fields
        if (instructions.trim()) {
          updatedProps.instructions = instructions.trim();
        }
        if (promptLabel.trim()) {
          updatedProps.promptLabel = promptLabel.trim();
        }
        if (onCompleteAtIndex.trim() !== "") {
          const indexValue = Math.max(0, Math.floor(Number(onCompleteAtIndex)));
          updatedProps.onCompleteAtIndex = indexValue;
        }
      } else if (slideType === "speech-match") {
        // For speech-match: save choiceElements as elements array
        if (choiceElements.length > 0) {
          updatedProps.elements = choiceElements
            .filter((el) => {
              // Only include elements with label
              if (!el.label.trim()) return false;
              // If file mode, must have fileUrl
              if (el.speech.mode === "file" && !el.speech.fileUrl?.trim()) return false;
              // If TTS mode, must have text or label
              if (el.speech.mode === "tts" && !el.speech.text?.trim() && !el.label.trim()) return false;
              return true;
            })
            .map((el) => {
              const element: any = {
                label: el.label.trim(),
                speech: {
                  mode: el.speech.mode,
                },
              };
              
              if (el.speech.mode === "file") {
                // Convert storage path to public URL if it's not already a URL
                const filePath = el.speech.fileUrl!.trim();
                if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
                  // Already a full URL, use as-is
                  element.speech.fileUrl = filePath;
                } else {
                  // Storage path, convert to public URL
                  element.speech.fileUrl = getAudioFileUrl("lesson-audio", filePath);
                }
              } else {
                // TTS mode
                const mappedLang = mapLanguageToPlayerFormat(defaultLang || "en");
                element.speech.lang = el.speech.lang || mappedLang;
                element.speech.text = el.speech.text?.trim() || el.label.trim();
              }
              
              return element;
            });
        }
        
        // Add speech-match specific fields
        if (note.trim()) {
          updatedProps.note = note.trim();
        }
      } else {
        // For ai-speak-repeat: convert textarea text to lines array
        // Use TTS mode for all phrases
        if (phrases.trim()) {
          const phraseList = phrases
            .split("\n")
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
          
          if (phraseList.length > 0) {
            // Convert to lines[][] structure for ai-speak-repeat slides
            // Map CMS language format to player format
            const mappedLang = mapLanguageToPlayerFormat(defaultLang || "en");
            updatedProps.lines = [
              phraseList.map((label) => ({
                label,
                speech: {
                  mode: "tts" as const,
                  lang: mappedLang,
                  text: label,
                },
              })),
            ];
          }
        }
      }

      // Remove undefined values (but keep false values for booleans)
      Object.keys(updatedProps).forEach((key) => {
        if (updatedProps[key] === undefined) {
          delete updatedProps[key];
        }
      });

      // Build updated meta_json
      const updatedMeta: any = {};
      if (activityName.trim()) {
        updatedMeta.activityName = activityName.trim();
      }

      const { error } = await updateSlide(slideId, {
        props_json: updatedProps,
        meta_json: Object.keys(updatedMeta).length > 0 ? updatedMeta : undefined,
        is_activity: isActivity,
      });

      if (error) {
        setMessage(`Error: ${error}`);
      } else {
    setMessage("Changes saved successfully!");
        // Update initial values to reflect saved state
        if (initialValuesRef.current) {
          initialValuesRef.current = {
            label,
            title,
            subtitle: slideType === "lesson-end" ? "" : subtitle,
            lessonEndMessage: slideType === "lesson-end" ? lessonEndMessage : "",
            lessonEndActions: slideType === "lesson-end" ? lessonEndActions : "",
            body,
            buttons,
            defaultLang,
            audioId,
            activityName,
            phrases,
            instructions,
            promptLabel,
            onCompleteAtIndex,
            elements,
            isInteractive,
            allowSkip,
            allowRetry,
            isActivity,
            maxAttempts,
            minAttemptsBeforeSkip,
          };
        }
    setHasUnsavedChanges(false);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "Failed to save changes"}`);
    } finally {
      setSaving(false);
    }
  };

  // Get slide display name for title
  const slideDisplayName = loadState.status === "ready" && slideIdValue
    ? getSlideDisplayName({ propsJson: { label } })
    : "";

  return (
    <CmsPageShell title={slideDisplayName ? `Edit Slide: ${slideDisplayName}` : "Edit Slide"}>
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
        <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #9cc7c7", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentSlideId={slideId} />
        </div>
        
        {/* Right column - content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: uiTokens.space.md }}>
          {/* Top actions bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: uiTokens.space.md,
              marginBottom: uiTokens.space.sm,
            }}
          >
            {message && (
              <StatusMessage variant={message.includes("error") || message.includes("Error") ? "error" : "success"}>
                {message}
              </StatusMessage>
            )}
            <PreviewInPlayerButton
              href={playerHref}
              disabled={!lessonId || !playerBaseUrl}
              label="Preview in lesson player"
            />
            <SaveChangesButton
              onClick={() => {
                const form = document.querySelector("form");
                if (form) {
                  form.requestSubmit();
                }
              }}
              hasUnsavedChanges={hasUnsavedChanges}
              saving={saving}
              label="Save Changes"
            />
          </div>

          {loadState.status === "loading" && (
            <p style={{ padding: uiTokens.space.md }}>Loading slide data...</p>
          )}

          {loadState.status === "error" && (
            <p style={{ padding: uiTokens.space.md, color: uiTokens.color.danger }}>
              {loadState.message}
            </p>
          )}

          {loadState.status === "ready" && (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: uiTokens.space.lg }}>
        {/* Identity & Structure Section */}
        <CmsSection
          title="Identity & Structure"
          backgroundColor="#e6f1f1"
          borderColor="#b4d5d5"
          description="Basic slide identification and structure"
        >
          <FormField 
            label="Slide ID"
            infoTooltip="System UUID for the slide (read-only). Used internally by the CMS to identify this slide."
          >
            <Input
              type="text"
              value={slideIdValue}
              readOnly
              style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
            />
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
              [title, text, ai-speak]
            </div>
          </FormField>

          <FormField 
            label="Slide Type"
            infoTooltip="Type key used to select the editor (read-only). Determines which editor component is used to edit this slide."
          >
            <Input
              type="text"
              value={slideType}
              readOnly
              style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
            />
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
              [title, text, ai-speak]
            </div>
          </FormField>

          <FormField 
            label="Group ID"
            infoTooltip="Owning group UUID (read-only). This slide belongs to this group in the lesson hierarchy."
          >
            <Input
              type="text"
              value={groupId}
              readOnly
              style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
            />
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
              [title, text, ai-speak]
            </div>
          </FormField>

                <FormField 
                  label="Group Name"
                  infoTooltip="Name of the group this slide belongs to (read-only). Displayed for reference."
                >
                  <Input
                    type="text"
                    value={groupName}
                    readOnly
                    style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
                  />
                  <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                    [title, text, ai-speak]
                  </div>
                </FormField>

          <FormField 
            label="Order Index"
            infoTooltip="Sequence position in the group (read-only). Determines the order this slide appears within its group."
          >
            <Input
              type="number"
              value={orderIndex}
              readOnly
              style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
            />
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
              [title, text, ai-speak]
            </div>
          </FormField>

          <FormField 
            label="Label"
            infoTooltip="Internal name for this slide used in the CMS and navigation. Not shown to learners. Required for CMS organization."
            required
          >
            <Input
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
              }}
              placeholder="Enter slide label"
            />
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
              [title, text, ai-speak]
            </div>
          </FormField>
        </CmsSection>

        {/* Core Content Section */}
        <CmsSection
          title="Core Content"
          backgroundColor="#e6f1f1"
          borderColor="#b4d5d5"
          description="Main content shown to learners"
        >
                {slideType !== "ai-speak-repeat" && slideType !== "ai-speak-student-repeat" && slideType !== "speech-match" && (
                  <>
          <FormField 
            label="Title"
            infoTooltip="Primary heading for the slide. This is shown to learners as the main title of the slide."
          >
            <Input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              placeholder="Enter slide title"
            />
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
[title]
            </div>
          </FormField>

          {slideType === "lesson-end" ? (
            <>
              <FormField 
                label="Message"
                infoTooltip="Message text shown to learners below the title. This is the main content for lesson-end slides."
              >
                <Textarea
                  value={lessonEndMessage}
                  onChange={(e) => {
                    setLessonEndMessage(e.target.value);
                  }}
                  placeholder="Enter lesson end message"
                  rows={4}
                />
                <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                  [lesson-end]
                </div>
              </FormField>

              <FormField 
                label="Actions"
                infoTooltip="Action buttons displayed at the bottom of the slide. Enter as JSON array, e.g., [{&quot;type&quot;: &quot;restart&quot;, &quot;label&quot;: &quot;Recommencer la leçon&quot;}, {&quot;type&quot;: &quot;progress&quot;, &quot;label&quot;: &quot;Voir ma progression&quot;}]"
              >
                <Textarea
                  value={lessonEndActions}
                  onChange={(e) => {
                    setLessonEndActions(e.target.value);
                  }}
                  placeholder='[{"type": "restart", "label": "Recommencer la leçon"}, {"type": "progress", "label": "Voir ma progression"}]'
                  rows={4}
                />
                <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                  [lesson-end] Enter as JSON array
                </div>
              </FormField>
            </>
          ) : (
            <FormField 
              label="Subtitle"
              infoTooltip="Secondary heading or subtopic. Shown to learners below the main title."
            >
              <Input
                type="text"
                value={subtitle}
                onChange={(e) => {
                  setSubtitle(e.target.value);
                }}
                placeholder="Enter slide subtitle"
              />
              <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                [title]
              </div>
            </FormField>
          )}

                    {slideType !== "title-slide" && slideType !== "lesson-end" && (
          <FormField 
            label="Body"
            infoTooltip="Main slide copy shown to learners. This is the primary content text displayed on the slide. For finale slides, uses the same font style as text slides and appears below the subtitle (or title if no subtitle)."
          >
            <Textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
              }}
              placeholder="Enter slide body text"
              rows={6}
            />
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
[text]
            </div>
          </FormField>
                    )}
                  </>
                )}

                {slideType === "ai-speak-student-repeat" && (
                  <>
                    <FormField 
                      label="Instructions"
                      infoTooltip="Optional instructions shown to learners before they practice."
                    >
                      <Textarea
                        value={instructions}
                        onChange={(e) => {
                          setInstructions(e.target.value);
                        }}
                        placeholder="Enter instructions for learners"
                        rows={3}
                      />
                      <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                        [ai-speak-student-repeat]
                      </div>
                    </FormField>

                    <FormField 
                      label="Prompt Label"
                      infoTooltip="Label displayed above the practice prompt. Defaults to 'Phrase à prononcer' if not set."
                    >
                      <Input
                        type="text"
                        value={promptLabel}
                        onChange={(e) => {
                          setPromptLabel(e.target.value);
                        }}
                        placeholder="Phrase à prononcer"
                      />
                      <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                        [ai-speak-student-repeat]
                      </div>
                    </FormField>
                  </>
                )}

                {slideType === "speech-match" && (
                  <>
                    <FormField 
                      label="Title"
                      infoTooltip="Primary heading for the slide."
                    >
                      <Input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                        }}
                        placeholder="Enter slide title"
                      />
                      <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                        [speech-match]
                      </div>
                    </FormField>

                    <FormField 
                      label="Subtitle"
                      infoTooltip="Instructions shown to learners (e.g., 'Écoute et clique sur la lettre que tu entends')."
                    >
                      <Input
                        type="text"
                        value={subtitle}
                        onChange={(e) => {
                          setSubtitle(e.target.value);
                        }}
                        placeholder="Écoute et clique sur la lettre que tu entends"
                      />
                      <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                        [speech-match]
                      </div>
                    </FormField>

                    <FormField 
                      label="Note"
                      infoTooltip="Optional note displayed below subtitle."
                    >
                      <Input
                        type="text"
                        value={note}
                        onChange={(e) => {
                          setNote(e.target.value);
                        }}
                        placeholder="Optional note"
                      />
                      <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                        [speech-match]
                      </div>
                    </FormField>
                  </>
                )}

          <FormField 
            label="Buttons"
                  infoTooltip="Interactive buttons displayed on the slide. Used for navigation, actions, or choices. Enter as JSON."
          >
            <Textarea
              value={buttons}
              onChange={(e) => {
                setButtons(e.target.value);
              }}
                    placeholder='Enter button configuration as JSON, e.g., [{"label": "Next", "action": "next"}]'
              rows={4}
            />
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
              [title, text, ai-speak]
            </div>
          </FormField>
        </CmsSection>

              {/* Language and Localization Section */}
              <CmsSection
                title="Language and Localization"
                backgroundColor="#e6f1f1"
                borderColor="#b4d5d5"
                description="Language settings for the slide"
              >
                <FormField 
                  label="Default Language"
                  infoTooltip="Default language for text-to-speech and content display. Choose English, French, or Both."
                >
                  <Select
                    value={defaultLang}
                    onChange={(e) => {
                      setDefaultLang(e.target.value);
                    }}
                  >
                    <option value="">Select language...</option>
                    <option value="english">English</option>
                    <option value="french">French</option>
                    <option value="both">Both</option>
                  </Select>
                  <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                    [ai-speak]
                  </div>
                </FormField>
              </CmsSection>

              {/* Media Reference Section */}
              {slideType !== "title-slide" && slideType !== "text-slide" && (
                <CmsSection
                  title="Media Reference"
                  backgroundColor="#e6f1f1"
                  borderColor="#b4d5d5"
                  description="Media assets referenced by this slide"
                >
                  <FormField 
                    label="Audio ID"
                    infoTooltip="Reference ID or path for audio media used in this slide. Select from uploaded files using Browse or enter a path manually."
                  >
                    <AudioFileSelector
                      bucketName="lesson-audio"
                      value={audioId}
                      onChange={setAudioId}
                    />
                    <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                      [unused]
                    </div>
                  </FormField>
                </CmsSection>
              )}

              {/* Speech & Audio Interaction Section */}
              {slideType !== "title-slide" && slideType !== "text-slide" && (
                <>
                  {slideType === "ai-speak-student-repeat" ? (
                    <CmsSection
                      title="Practice Elements"
                      backgroundColor="#e6f1f1"
                      borderColor="#b4d5d5"
                      description="Practice elements for student pronunciation drills"
                    >
                      <FormField 
                        label="Elements"
                        infoTooltip="Practice elements that students will hear and repeat. Each element has a sample prompt (display text), optional reference text (for pronunciation matching), and optional audio file."
                      >
                        <StudentRepeatElementMapper
                          elements={elements}
                          onElementsChange={setElements}
                          bucketName="lesson-audio"
                          defaultLang={defaultLang || "en"}
                        />
                        <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                          [ai-speak-student-repeat] Each element represents a practice item. Students hear the sample prompt and repeat it.
                        </div>
                      </FormField>
                    </CmsSection>
                  ) : slideType === "speech-match" ? (
                    <CmsSection
                      title="Choice Elements"
                      backgroundColor="#e6f1f1"
                      borderColor="#b4d5d5"
                      description="Choice options for student selection"
                    >
                      <FormField 
                        label="Elements"
                        infoTooltip="Choice elements that students can select. Each element has a label (display text) and speech (audio to play). Students hear the audio and click on the matching label."
                      >
                        <ChoiceElementMapper
                          elements={choiceElements}
                          onElementsChange={setChoiceElements}
                          bucketName="lesson-audio"
                          defaultLang={defaultLang || "en"}
                        />
                        <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                          [speech-match] Each element represents a choice option. Students hear the audio and click on the matching label.
                        </div>
                      </FormField>
                    </CmsSection>
                  ) : (
                    <CmsSection
                      title="Speech & Audio Interaction"
                      backgroundColor="#e6f1f1"
                      borderColor="#b4d5d5"
                      description="Speech and audio interaction content"
                    >
                      <FormField 
                        label="Phrases"
                        infoTooltip="Phrases for speech recognition and audio interaction. Enter one phrase per line."
                      >
                        <Textarea
                          value={phrases}
                          onChange={(e) => {
                            setPhrases(e.target.value);
                          }}
                          placeholder="Enter phrases, one per line"
                          rows={6}
                        />
                        <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                          [ai-speak]
                        </div>
                      </FormField>
                    </CmsSection>
                  )}
                </>
              )}

              {/* Interaction Flags Section */}
              {slideType !== "title-slide" && slideType !== "text-slide" && (
                <CmsSection
                  title="Interaction Flags"
                  backgroundColor="#e6f1f1"
                  borderColor="#b4d5d5"
                  description="Flags controlling slide interaction behavior"
                >
                <FormField 
                  label="Is interactive"
                  infoTooltip="The slide can accept user interaction/input"
                >
                  <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.xs, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isInteractive}
                      onChange={(e) => {
                        setIsInteractive(e.target.checked);
                      }}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: uiTokens.font.label.size }}>Enable interactive mode</span>
                  </label>
                </FormField>

                <FormField 
                  label="Allow skip"
                  infoTooltip="Whether users can skip this slide"
                >
                  <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.xs, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={allowSkip}
                      onChange={(e) => {
                        setAllowSkip(e.target.checked);
                      }}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: uiTokens.font.label.size }}>Allow users to skip this slide</span>
                  </label>
                </FormField>

                <FormField 
                  label="Allow retry"
                  infoTooltip="Whether users can retry this slide"
                >
                  <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.xs, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={allowRetry}
                      onChange={(e) => {
                        setAllowRetry(e.target.checked);
                      }}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: uiTokens.font.label.size }}>Allow users to retry this slide</span>
                  </label>
                </FormField>

                <FormField 
                  label="Is activity"
                  infoTooltip="The slide counts as an activity for scoring/tracking purposes"
                >
                  <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.xs, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isActivity}
                      onChange={(e) => {
                        setIsActivity(e.target.checked);
                      }}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: uiTokens.font.label.size }}>Mark this slide as an activity</span>
                  </label>
                </FormField>
              </CmsSection>
              )}

              {/* Interaction/Flow Section */}
              {slideType !== "title-slide" && slideType !== "text-slide" && (
                <CmsSection
                  title="Interaction/Flow"
                  backgroundColor="#e6f1f1"
                  borderColor="#b4d5d5"
                  description="Attempt limits and skip behavior"
                >
                {slideType === "ai-speak-student-repeat" && (
                  <FormField 
                    label="On Complete At Index"
                    infoTooltip="Trigger completion callback at this element index (0-based). Leave empty if not needed."
                  >
                    <Input
                      type="number"
                      value={onCompleteAtIndex}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                          setOnCompleteAtIndex(value);
                        }
                      }}
                      placeholder="Leave empty if not needed"
                      min="0"
                      step="1"
                    />
                    <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                      [ai-speak-student-repeat]
                    </div>
                  </FormField>
                )}

                <FormField 
                  label="Max attempts"
                  infoTooltip="Maximum number of attempts allowed for this slide. Leave empty for unlimited."
                >
                  <Input
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                        setMaxAttempts(value);
                        // Auto-adjust minAttemptsBeforeSkip if it exceeds maxAttempts
                        if (value !== "" && minAttemptsBeforeSkip !== "" && Number(minAttemptsBeforeSkip) > Number(value)) {
                          setMinAttemptsBeforeSkip(value);
                        }
                      }
                    }}
                    placeholder="Leave empty for unlimited"
                    min="0"
                    step="1"
                  />
                  {maxAttempts !== "" && minAttemptsBeforeSkip !== "" && Number(minAttemptsBeforeSkip) > Number(maxAttempts) && (
                    <div style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: uiTokens.color.danger }}>
                      Min attempts before skip cannot exceed max attempts. Auto-adjusted.
                    </div>
                  )}
                </FormField>

                <FormField 
                  label="Min attempts before skip"
                  infoTooltip="Minimum number of attempts required before skip is allowed. Leave empty if skip is always allowed (when allow skip is enabled)."
                >
                  <Input
                    type="number"
                    value={minAttemptsBeforeSkip}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                        setMinAttemptsBeforeSkip(value);
                      }
                    }}
                    placeholder="Leave empty if no minimum"
                    min="0"
                    step="1"
                  />
                  {minAttemptsBeforeSkip !== "" && maxAttempts !== "" && Number(minAttemptsBeforeSkip) > Number(maxAttempts) && (
                    <div style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: uiTokens.color.danger }}>
                      Min attempts before skip cannot exceed max attempts.
                    </div>
                  )}
                </FormField>
              </CmsSection>
              )}

              {/* Authoring Metadata Section */}
              <CmsSection
                title="Authoring Metadata"
                backgroundColor="#e6f1f1"
                borderColor="#b4d5d5"
                description="Metadata for CMS organization and tracking"
              >
                {slideType !== "title-slide" && slideType !== "lesson-end" && slideType !== "text-slide" && (
                  <FormField 
                    label="Activity Name"
                    infoTooltip="Name of the activity for CMS organization and tracking."
                  >
                    <Input
                      type="text"
                      value={activityName}
                      onChange={(e) => {
                        setActivityName(e.target.value);
                      }}
                      placeholder="Enter activity name"
                    />
                    <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                      [all slide types]
                    </div>
                  </FormField>
                )}
              </CmsSection>
      </form>
          )}
        </div>
      </div>
    </CmsPageShell>
  );
}
