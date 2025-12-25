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
import PhraseAudioMapper from "../../../components/ui/PhraseAudioMapper";

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
  const [body, setBody] = useState("");
  const [buttons, setButtons] = useState("");
  const [defaultLang, setDefaultLang] = useState("");
  const [audioId, setAudioId] = useState("");
  const [activityName, setActivityName] = useState("");
  const [phrases, setPhrases] = useState("");
  const [audioPaths, setAudioPaths] = useState(""); // Newline-separated audio paths matching phrases order
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const playerBaseUrl = process.env.NEXT_PUBLIC_PLAYER_BASE_URL || "";
  const playerHref = playerBaseUrl && lessonId ? `${playerBaseUrl}/lecons/db/${lessonId}` : undefined;

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
    audioPaths: string;
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
      setSubtitle(props.subtitle || "");
      setBody(props.body || "");
      setButtons(props.buttons ? JSON.stringify(props.buttons, null, 2) : "");
      setDefaultLang(props.defaultLang || "");
      setAudioId(props.audioId || "");
      setActivityName(meta.activityName || "");
      // Handle phrases - if it's lines array, flatten it; otherwise use as string
      if (props.lines && Array.isArray(props.lines)) {
        const flatPhrases = props.lines.flat().map((cell: any) => cell.label || cell).join("\n");
        setPhrases(flatPhrases);
        // Extract audio file paths from speech.fileUrl
        const flatAudioPaths = props.lines.flat().map((cell: any) => {
          if (cell.speech?.mode === "file" && cell.speech?.fileUrl) {
            // Extract path from full URL if needed
            const url = cell.speech.fileUrl;
            if (url.includes("/storage/v1/object/public/")) {
              // Extract path after bucket name
              const parts = url.split("/storage/v1/object/public/");
              if (parts[1]) {
                const pathParts = parts[1].split("/");
                return pathParts.slice(1).join("/"); // Skip bucket name
              }
            }
            return url;
          }
          return "";
        }).join("\n");
        setAudioPaths(flatAudioPaths);
      } else if (props.phrases) {
        setPhrases(typeof props.phrases === "string" ? props.phrases : JSON.stringify(props.phrases));
        setAudioPaths("");
      } else {
        setPhrases("");
        setAudioPaths("");
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
      const initialAudioPaths = props.lines && Array.isArray(props.lines)
        ? props.lines.flat().map((cell: any) => {
            if (cell.speech?.mode === "file" && cell.speech?.fileUrl) {
              const url = cell.speech.fileUrl;
              if (url.includes("/storage/v1/object/public/")) {
                const parts = url.split("/storage/v1/object/public/");
                if (parts[1]) {
                  const pathParts = parts[1].split("/");
                  return pathParts.slice(1).join("/");
                }
              }
              return url;
            }
            return "";
          }).join("\n")
        : "";
      initialValuesRef.current = {
        label: props.label || "",
        title: props.title || "",
        subtitle: props.subtitle || "",
        body: props.body || "",
        buttons: props.buttons ? JSON.stringify(props.buttons, null, 2) : "",
        defaultLang: props.defaultLang || "",
        audioId: props.audioId || "",
        activityName: meta.activityName || "",
        phrases: typeof initialPhrases === "string" ? initialPhrases : JSON.stringify(initialPhrases),
        audioPaths: initialAudioPaths || "",
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
      body !== initialValuesRef.current.body ||
      buttons !== initialValuesRef.current.buttons ||
      defaultLang !== initialValuesRef.current.defaultLang ||
      audioId !== initialValuesRef.current.audioId ||
      activityName !== initialValuesRef.current.activityName ||
      phrases !== initialValuesRef.current.phrases ||
      audioPaths !== initialValuesRef.current.audioPaths;

      setHasUnsavedChanges(hasChanges);
  }, [label, title, subtitle, body, buttons, defaultLang, audioId, activityName, phrases, audioPaths, loadState]);

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

      // Build updated props_json
      const updatedProps: any = {
        label: label.trim() || undefined,
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        body: body.trim() || undefined,
        buttons: buttonsValue || undefined,
        defaultLang: defaultLang.trim() || undefined,
        audioId: audioId.trim() || undefined,
      };

      // Handle phrases - convert textarea text to lines array
      // If audioPaths are provided, use file mode; otherwise use TTS mode
      if (phrases.trim()) {
        const phraseList = phrases
          .split("\n")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        
        const audioPathList = audioPaths
          .split("\n")
          .map((a) => a.trim())
          .filter((a) => a.length > 0);
        
        if (phraseList.length > 0) {
          // Convert to lines[][] structure for ai-speak-repeat slides
          updatedProps.lines = [
            phraseList.map((label, index) => {
              const audioPath = audioPathList[index];
              
              // If audio file is provided, use file mode
              if (audioPath) {
                const audioUrl = getAudioFileUrl("lesson-audio", audioPath);
                return {
                  label,
                  speech: {
                    mode: "file" as const,
                    fileUrl: audioUrl,
                  },
                };
              } else {
                // Otherwise use TTS mode
                return {
                  label,
                  speech: {
                    mode: "tts" as const,
                    lang: defaultLang || "en",
                    text: label,
                  },
                };
              }
            }),
          ];
        }
      }

      // Remove undefined values
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
            subtitle,
            body,
            buttons,
            defaultLang,
            audioId,
            activityName,
            phrases,
            audioPaths,
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

                <FormField 
                  label="Body"
                  infoTooltip="Main slide copy shown to learners. This is the primary content text displayed on the slide."
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
                    [ai-speak]
                  </div>
                </FormField>
              </CmsSection>

              {/* Speech & Audio Interaction Section */}
              <CmsSection
                title="Speech & Audio Interaction"
                backgroundColor="#e6f1f1"
                borderColor="#b4d5d5"
                description="Speech and audio interaction content"
              >
                <FormField 
                  label="Phrases"
                  infoTooltip="Phrases for speech recognition and audio interaction. Enter one phrase per line. Use the mapper below to assign audio files to each phrase."
                >
                  <Textarea
                    value={phrases}
                    onChange={(e) => {
                      setPhrases(e.target.value);
                    }}
                    placeholder="Enter phrases, one per line"
                    rows={6}
                  />
                  <PhraseAudioMapper
                    phrases={phrases}
                    audioPaths={audioPaths}
                    onPhrasesChange={setPhrases}
                    onAudioPathsChange={setAudioPaths}
                    bucketName="lesson-audio"
                  />
                  <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                    [ai-speak] Phrases map to audio files in the same order. If an audio file is provided, it will be used instead of TTS.
                  </div>
                </FormField>
              </CmsSection>

              {/* Authoring Metadata Section */}
              <CmsSection
                title="Authoring Metadata"
                backgroundColor="#e6f1f1"
                borderColor="#b4d5d5"
                description="Metadata for CMS organization and tracking"
              >
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
              </CmsSection>
            </form>
          )}
        </div>
      </div>
    </CmsPageShell>
  );
}
