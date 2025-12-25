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
  const [body, setBody] = useState("");
  const [buttons, setButtons] = useState("");
  const [defaultLang, setDefaultLang] = useState("");
  const [audioId, setAudioId] = useState("");
  const [activityName, setActivityName] = useState("");
  const [phrases, setPhrases] = useState("");
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

          <FormField 
            label="Body"
            infoTooltip="Main slide copy shown to learners. This is the primary content text displayed on the slide."
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
                setHasUnsavedChanges(true);
              }}
              placeholder="Enter activity name"
            />
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: "#999" }}>
              [all slide types]
            </div>
          </FormField>
        </CmsSection>
      </form>
        </div>
      </div>
    </CmsPageShell>
  );
}

