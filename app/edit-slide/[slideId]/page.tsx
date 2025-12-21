"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import CmsSection from "../../../components/ui/CmsSection";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { uiTokens } from "../../../lib/uiTokens";
import { useSlideEditor } from "../../../lib/hooks/useSlideEditor";
import { useUnsavedChangesWarning } from "../../../lib/hooks/useUnsavedChangesWarning";
import { getSlideEditorDefinition } from "../../../lib/slide-editor-registry";

export default function EditSlidePage() {
  const params = useParams<{ slideId: string }>();
  const slideId = params?.slideId;
  const [editorHasUnsavedChanges, setEditorHasUnsavedChanges] = useState(false);
  const [copyConfirmation, setCopyConfirmation] = useState<{ message: string; buttonId: string } | null>(null);
  
  const copyToClipboard = async (text: string, label: string, buttonId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyConfirmation({ message: `${label} copied!`, buttonId });
      setTimeout(() => {
        setCopyConfirmation(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const {
    loadState,
    orderIndex,
    selectedGroupId,
    slideType,
    setOrderIndex,
    setSelectedGroupId,
    setSlideType,
    reloadSlide,
    saveSlide,
    hasUnsavedChanges: topLevelHasUnsavedChanges,
  } = useSlideEditor(slideId);
  
  // Combine top-level and editor unsaved changes
  const hasUnsavedChanges = topLevelHasUnsavedChanges || editorHasUnsavedChanges;

  // Warn before navigation
  useUnsavedChangesWarning(hasUnsavedChanges);

  return (
    <CmsPageShell
      title="Edit slide"
    >
      {loadState.status === "loading" && <p>Loading slide…</p>}

      {loadState.status === "error" && (
        <CmsSection title="Error" description={loadState.message}>
          <p style={{ color: uiTokens.color.danger }}>{loadState.message}</p>
        </CmsSection>
      )}

      {loadState.status === "ready" && (
        <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
          {/* Left column - outline view */}
          <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #f2e1db", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
            <CmsOutlineView currentSlideId={slideId} hasUnsavedChanges={hasUnsavedChanges} />
          </div>
          
          {/* Right column - form */}
          <div style={{ flex: 1 }}>
            {/* Save button at top right */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: uiTokens.space.md }}>
              <button
                type="button"
                onClick={() => {
                  const form = document.querySelector('form') as HTMLFormElement;
                  if (form) {
                    form.requestSubmit();
                  }
                }}
                style={{
                  padding: `${uiTokens.space.xs}px ${uiTokens.space.md}px`,
                  fontSize: uiTokens.font.label.size,
                  fontWeight: 500,
                  borderRadius: uiTokens.radius.sm,
                  border: `1px solid ${hasUnsavedChanges ? "#ffc107" : "#d7a592"}`,
                  backgroundColor: hasUnsavedChanges ? "#fff3cd" : "#d7a592",
                  color: hasUnsavedChanges ? uiTokens.color.text : "#f6f5f3",
                  cursor: "pointer",
                  fontFamily: "'Atkinson Hyperlegible', Arial, sans-serif",
                  transition: "background-color 0.2s, border-color 0.2s, color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: uiTokens.space.xs,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hasUnsavedChanges ? "#ffe69c" : "#c59582";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = hasUnsavedChanges ? "#fff3cd" : "#d7a592";
                }}
              >
                {hasUnsavedChanges && (
                  <span style={{ fontSize: "16px" }}>⚠️</span>
                )}
                <span style={{ color: hasUnsavedChanges ? uiTokens.color.text : "#f6f5f3" }}>Save changes</span>
              </button>
            </div>
            {/* Slide type input */}
            <CmsSection title="Slide Type" backgroundColor="#f8f0ed" borderColor="#f2e1db">
            <FormField 
              label="Slide UUID" 
              borderColor="#f2e1db"
              infoTooltip="Unique identifier for this slide. Used internally by the system for saving progress, notes, scoring, and debugging. Not shown to students."
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Input value={slideId || ""} disabled readOnly style={{ paddingRight: "32px" }} />
                {copyConfirmation && copyConfirmation.buttonId === "slide-uuid" && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      right: "8px",
                      marginBottom: "4px",
                      padding: `${uiTokens.space.xs}px ${uiTokens.space.sm}px`,
                      backgroundColor: "#333",
                      color: "#fff",
                      borderRadius: uiTokens.radius.sm,
                      fontSize: uiTokens.font.meta.size,
                      zIndex: 1000,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      animation: "fadeIn 0.2s ease-in",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {copyConfirmation.message}
                  </div>
                )}
                <button
                  type="button"
                  id="slide-uuid"
                  onClick={() => copyToClipboard(slideId || "", "Slide UUID", "slide-uuid")}
                  style={{
                    position: "absolute",
                    right: "8px",
                    background: "none",
                    border: "none",
                    padding: "4px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    color: "#d7a592",
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.7";
                  }}
                  title="Copy UUID"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#d7a592"
                    style={{
                      width: 16,
                      height: 16,
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                    />
                  </svg>
                </button>
              </div>
            </FormField>

            <FormField 
              label="Slide type" 
              required 
              borderColor="#f2e1db"
              infoTooltip="Determines which slide component/template is used. Controls what fields, behaviors, and interactions this slide supports (e.g. text, AI speak, quiz, choice). This field can only be changed from the manage group page."
            >
              <Input
                type="text"
                value={slideType}
                onChange={(e) => setSlideType(e.target.value)}
                disabled
                readOnly
              />
            </FormField>
          </CmsSection>

          {/* Order and Group controls */}
          <CmsSection title="Placement" backgroundColor="#f8f0ed" borderColor="#f2e1db">
            <FormField 
              label="Group" 
              borderColor="#f2e1db"
              infoTooltip="The group this slide belongs to. Groups define the pedagogical phase (intro, practice, test, wrap-up) and scoring logic."
            >
              <Select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                <option value="">(no group)</option>
                {loadState.groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField 
              label="Group UUID" 
              borderColor="#f2e1db"
              infoTooltip="Unique identifier for the group this slide belongs to. Used internally by the system."
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Input value={selectedGroupId || ""} disabled readOnly style={{ paddingRight: "32px" }} />
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedGroupId || "", "Group UUID", "group-uuid")}
                  style={{
                    position: "absolute",
                    right: "8px",
                    background: "none",
                    border: "none",
                    padding: "4px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    color: "#d7a592",
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.7";
                  }}
                  title="Copy UUID"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#d7a592"
                    style={{
                      width: 16,
                      height: 16,
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                    />
                  </svg>
                </button>
              </div>
            </FormField>
            <FormField 
              label="Order index" 
              required 
              borderColor="#f2e1db"
              infoTooltip="The position of this slide within its group. Lower numbers appear first. Used to build the slide sequence."
            >
              <Input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                min={1}
              />
            </FormField>
          </CmsSection>

          {(() => {
            const editorDefinition = getSlideEditorDefinition(loadState.row.type);
            const EditorComponent = editorDefinition.editorComponent;
            const editorProps = {
              row: loadState.row,
              orderIndex,
              groupId: selectedGroupId || null,
              slideType,
              schema: editorDefinition.schema,
              onSaveSuccess: reloadSlide,
              saveSlide,
              onUnsavedChangesChange: setEditorHasUnsavedChanges,
            };

            return <EditorComponent {...editorProps} />;
          })()}
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}
