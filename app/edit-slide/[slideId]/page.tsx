"use client";

import { useParams } from "next/navigation";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import CmsSection from "../../../components/ui/CmsSection";
import { uiTokens } from "../../../lib/uiTokens";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import SaveChangesButton from "../../../components/ui/SaveChangesButton";
import StatusMessage from "../../../components/ui/StatusMessage";
import { useState } from "react";

/**
 * Default Mock Slide Editor Page
 * 
 * This is a template slide editor that will be customized and applied to all slide types.
 * Currently not connected to any data - just a mock UI structure.
 */
export default function EditSlidePage() {
  const params = useParams<{ slideId: string }>();
  const slideId = params?.slideId;

  // Mock state - will be replaced with real data loading
  const [slideIdValue, setSlideIdValue] = useState(slideId || "");
  const [slideType, setSlideType] = useState("");
  const [groupId, setGroupId] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [label, setLabel] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
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
    <CmsPageShell title={`Edit Slide ${slideId ? `(${slideId.slice(0, 8)})` : ""}`}>
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
              <StatusMessage variant={message.includes("error") ? "error" : "success"}>
                {message}
              </StatusMessage>
            )}
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
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
              Used by: [title, text, ai-speak]
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
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
              Used by: [title, text, ai-speak]
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
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
              Used by: [title, text, ai-speak]
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
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
              Used by: [title, text, ai-speak]
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
            <div className="metaText" style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
              Used by: [title, text, ai-speak]
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
          </FormField>
        </CmsSection>
      </form>
        </div>
      </div>
    </CmsPageShell>
  );
}

