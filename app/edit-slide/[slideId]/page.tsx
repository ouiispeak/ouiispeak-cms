"use client";

import { useParams } from "next/navigation";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import CmsSection from "../../../components/ui/CmsSection";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { uiTokens } from "../../../lib/uiTokens";
import { useSlideEditor } from "../../../lib/hooks/useSlideEditor";
import { useUnsavedChangesWarning } from "../../../lib/hooks/useUnsavedChangesWarning";
import AiSpeakRepeatEditor from "../../../components/slide-editors/AiSpeakRepeatEditor";
import TitleSlideEditor from "../../../components/slide-editors/TitleSlideEditor";
import TextSlideEditor from "../../../components/slide-editors/TextSlideEditor";
import RawJsonEditor from "../../../components/slide-editors/RawJsonEditor";

export default function EditSlidePage() {
  const params = useParams<{ slideId: string }>();
  const slideId = params?.slideId;

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
    hasUnsavedChanges,
  } = useSlideEditor(slideId);

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
            {hasUnsavedChanges && (
              <div style={{ 
                padding: uiTokens.space.sm, 
                marginBottom: uiTokens.space.md, 
                backgroundColor: "#fff3cd", 
                border: "1px solid #ffc107",
                borderRadius: uiTokens.radius.md,
                color: uiTokens.color.text
              }}>
                ⚠️ You have unsaved changes
              </div>
            )}
            {/* Slide type input */}
            <CmsSection title="Slide Type" backgroundColor="#f8f0ed" borderColor="#f2e1db">
            <FormField label="Slide ID" borderColor="#f2e1db">
              <Input value={slideId || ""} disabled readOnly />
            </FormField>

            <FormField label="Slide type" required borderColor="#f2e1db">
              <Input
                type="text"
                value={slideType}
                onChange={(e) => setSlideType(e.target.value)}
              />
            </FormField>
          </CmsSection>

          {/* Order and Group controls */}
          <CmsSection title="Placement" backgroundColor="#f8f0ed" borderColor="#f2e1db">
            <div style={{ display: "flex", gap: uiTokens.space.md, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px" }}>
                <FormField label="Group" borderColor="#f2e1db">
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
              </div>
              <div style={{ flex: "1 1 200px" }}>
                <FormField label="Order index" required borderColor="#f2e1db">
                  <Input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    min={1}
                  />
                </FormField>
              </div>
            </div>
          </CmsSection>

          {(() => {
            const type = (loadState.row.type ?? "").trim();
            const editorProps = {
              row: loadState.row,
              orderIndex,
              groupId: selectedGroupId || null,
              slideType,
              onSaveSuccess: reloadSlide,
              saveSlide,
            };

            if (type === "ai-speak-repeat") {
              return <AiSpeakRepeatEditor {...editorProps} />;
            } else if (type === "title-slide") {
              return <TitleSlideEditor {...editorProps} />;
            } else if (type === "text-slide") {
              return <TextSlideEditor {...editorProps} />;
            } else {
              return <RawJsonEditor {...editorProps} />;
            }
          })()}
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}
