"use client";

import CmsPageShell from "../../components/cms/CmsPageShell";
import CmsOutlineView from "../../components/cms/CmsOutlineView";
import CmsSection from "../../components/ui/CmsSection";
import { uiTokens } from "../../lib/uiTokens";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import AudioFileSelector from "../../components/ui/AudioFileSelector";
import SaveChangesButton from "../../components/ui/SaveChangesButton";
import StatusMessage from "../../components/ui/StatusMessage";
import PreviewInPlayerButton from "../../components/ui/PreviewInPlayerButton";
import StudentRepeatElementMapper from "../../components/ui/StudentRepeatElementMapper";
import ChoiceElementMapper from "../../components/ui/ChoiceElementMapper";
import { useState } from "react";
import { getGroupDisplayName } from "../../lib/utils/displayName";

/**
 * Manage Slides Page
 * 
 * This is the defining page layout for all slide editors.
 * Edits made to this form will be applied to all individual slide editors.
 * This page serves as the template/master form for slide editing.
 */
export default function ManageSlidesPage() {
  // Mock state - will be replaced with real data loading
  const [slideIdValue, setSlideIdValue] = useState("");
  const [slideType, setSlideType] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Mock save - will be replaced with real save logic
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSaving(false);
    setMessage("Changes saved successfully!");
    setHasUnsavedChanges(false);
  };

  return (
    <CmsPageShell title="Manage Slides">
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
        <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #9cc7c7", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView />
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
              <StatusMessage variant={message.includes("error") ? "error" : "success"}>
                {message}
              </StatusMessage>
            )}
            <PreviewInPlayerButton
              href={undefined}
              disabled={true}
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
            infoTooltip="Type key used to select the editor. Determines which editor component is used to edit this slide."
          >
            <Select
              value={slideType}
              onChange={(e) => {
                setSlideType(e.target.value);
                setHasUnsavedChanges(true);
              }}
            >
              <option value="">Select slide type...</option>
              <option value="default-slide">Default Slide (Show All Fields)</option>
              <option value="title-slide">Title Slide</option>
              <option value="lesson-end">Lesson End</option>
              <option value="text-slide">Text Slide</option>
              <option value="ai-speak-repeat">AI Speak Repeat</option>
              <option value="ai-speak-student-repeat">AI Speak Student Repeat</option>
              <option value="speech-match">Speech Match</option>
            </Select>
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
                setHasUnsavedChanges(true);
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
                setHasUnsavedChanges(true);
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
                    setHasUnsavedChanges(true);
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
                    setHasUnsavedChanges(true);
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
                  setHasUnsavedChanges(true);
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
                setHasUnsavedChanges(true);
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

          {(slideType === "ai-speak-student-repeat" || slideType === "speech-match" || slideType === "default-slide") && (
            <>
              {(slideType === "ai-speak-student-repeat" || slideType === "default-slide") && (
                <>
                  <FormField 
                    label="Instructions"
                    infoTooltip="Optional instructions shown to learners before they practice."
                  >
                    <Textarea
                      value={instructions}
                      onChange={(e) => {
                        setInstructions(e.target.value);
                        setHasUnsavedChanges(true);
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
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Phrase à prononcer"
                    />
                    <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                      [ai-speak-student-repeat]
                    </div>
                  </FormField>
                </>
              )}
              {(slideType === "speech-match" || slideType === "default-slide") && (
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
                        setHasUnsavedChanges(true);
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
                        setHasUnsavedChanges(true);
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
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Optional note"
                    />
                    <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                      [speech-match]
                    </div>
                  </FormField>
                </>
              )}
            </>
          )}

          <FormField 
            label="Buttons"
            infoTooltip="Interactive buttons displayed on the slide. Used for navigation, actions, or choices."
          >
            <Textarea
              value={buttons}
              onChange={(e) => {
                setButtons(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Enter button configuration"
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
                setHasUnsavedChanges(true);
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
        {slideType !== "title-slide" && slideType !== "lesson-end" && slideType !== "text-slide" && (
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
                onChange={(value) => {
                  setAudioId(value);
                  setHasUnsavedChanges(true);
                }}
              />
              <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                [unused]
              </div>
            </FormField>
          </CmsSection>
        )}

        {/* Speech & Audio Interaction Section */}
        {slideType !== "title-slide" && slideType !== "lesson-end" && slideType !== "text-slide" && (
          <>
            {slideType === "ai-speak-student-repeat" || slideType === "default-slide" ? (
              <>
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
                      onElementsChange={(newElements) => {
                        setElements(newElements);
                        setHasUnsavedChanges(true);
                      }}
                      bucketName="lesson-audio"
                      defaultLang={defaultLang || "en"}
                    />
                    <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
                      [ai-speak-student-repeat] Each element represents a practice item. Students hear the sample prompt and repeat it.
                    </div>
                  </FormField>
                </CmsSection>
                {slideType === "default-slide" && (
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
                          setHasUnsavedChanges(true);
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
                    onElementsChange={(newElements) => {
                      setChoiceElements(newElements);
                      setHasUnsavedChanges(true);
                    }}
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
                      setHasUnsavedChanges(true);
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
        {slideType !== "title-slide" && slideType !== "lesson-end" && slideType !== "text-slide" && (
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
                  setHasUnsavedChanges(true);
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
                  setHasUnsavedChanges(true);
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
                  setHasUnsavedChanges(true);
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
                  setHasUnsavedChanges(true);
                }}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <span style={{ fontSize: uiTokens.font.label.size }}>Mark this slide as an activity</span>
            </label>
          </FormField>
        </CmsSection>
        )}

        {/* Interaction/Flow Section */}
        {slideType !== "title-slide" && slideType !== "lesson-end" && slideType !== "text-slide" && (
          <CmsSection
          title="Interaction/Flow"
          backgroundColor="#e6f1f1"
          borderColor="#b4d5d5"
          description="Attempt limits and skip behavior"
        >
          {(slideType === "ai-speak-student-repeat" || slideType === "default-slide") && (
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
                    setHasUnsavedChanges(true);
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
                  setHasUnsavedChanges(true);
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
                  const numValue = value === "" ? null : Number(value);
                  // Validate against maxAttempts if both are set
                  if (numValue !== null && maxAttempts !== "" && numValue > Number(maxAttempts)) {
                    // Show error but don't prevent input
                    setMinAttemptsBeforeSkip(value);
                  } else {
                    setMinAttemptsBeforeSkip(value);
                  }
                  setHasUnsavedChanges(true);
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
                  setHasUnsavedChanges(true);
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
        </div>
      </div>
    </CmsPageShell>
  );
}

