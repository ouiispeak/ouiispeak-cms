"use client";

import { useState, FormEvent, useEffect, useRef, useMemo } from "react";
import { Button } from "../Button";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import { uiTokens } from "../../lib/uiTokens";
import AuthoringMetadataSection from "./AuthoringMetadataSection";
import type { SlideEditorProps } from "./types";
import type { AuthoringMetadataState } from "./types";

export default function TitleSlideEditor({
  row,
  orderIndex,
  groupId,
  slideType,
  schema,
  onSaveSuccess,
  saveSlide,
  onUnsavedChangesChange,
  onSavingChange,
}: SlideEditorProps) {
  // Respect visibility presets: only render fields that are in the schema
  const visibleFieldKeys = new Set(schema.fields.map((f) => f.key));
  const shouldShowLabel = visibleFieldKeys.has("label");
  const shouldShowTitle = visibleFieldKeys.has("title");
  const shouldShowSubtitle = visibleFieldKeys.has("subtitle");
  const props = (row.propsJson as any) || {};
  const [label, setLabel] = useState(props.label || "");
  const [title, setTitle] = useState(props.title || "");
  const [subtitle, setSubtitle] = useState(props.subtitle || "");
  const [metadata, setMetadata] = useState<AuthoringMetadataState>({
    code: row.code || "",
    slideGoal: ((row.metaJson as any) || {}).slideGoal || "",
    activityName: ((row.metaJson as any) || {}).activityName || "",
    requiresExternalTTS: ((row.metaJson as any) || {}).requires?.externalTTS || false,
    buttons: Array.isArray(((row.metaJson as any) || {}).buttons) ? ((row.metaJson as any) || {}).buttons : [],
    tags: Array.isArray(((row.metaJson as any) || {}).tags) ? ((row.metaJson as any) || {}).tags : [],
    difficultyHint: ((row.metaJson as any) || {}).difficultyHint || "",
    reviewWeight: ((row.metaJson as any) || {}).reviewWeight ?? null,
    showScoreToLearner: ((row.metaJson as any) || {}).showScoreToLearner || false,
    isActivity: row.isActivity || false,
    scoreType: row.scoreType || "none",
    passingScoreValue: row.passingScoreValue ?? null,
    maxScoreValue: row.maxScoreValue ?? null,
    passRequiredForNext: row.passRequiredForNext || false,
  });
  
  const initialDataRef = useRef<{
    label: string;
    title: string;
    subtitle: string;
    metadata: AuthoringMetadataState;
  } | null>(null);
  
  // Initialize initial data when row changes
  useEffect(() => {
    initialDataRef.current = {
      label: props.label || "",
      title: props.title || "",
      subtitle: props.subtitle || "",
      metadata: {
        code: row.code || "",
        slideGoal: ((row.metaJson as any) || {}).slideGoal || "",
        activityName: ((row.metaJson as any) || {}).activityName || "",
        requiresExternalTTS: ((row.metaJson as any) || {}).requires?.externalTTS || false,
        buttons: Array.isArray(((row.metaJson as any) || {}).buttons) ? ((row.metaJson as any) || {}).buttons : [],
        tags: Array.isArray(((row.metaJson as any) || {}).tags) ? ((row.metaJson as any) || {}).tags : [],
        difficultyHint: ((row.metaJson as any) || {}).difficultyHint || "",
        reviewWeight: ((row.metaJson as any) || {}).reviewWeight ?? null,
        showScoreToLearner: ((row.metaJson as any) || {}).showScoreToLearner || false,
        isActivity: row.isActivity || false,
        scoreType: row.scoreType || "none",
        passingScoreValue: row.passingScoreValue ?? null,
        maxScoreValue: row.maxScoreValue ?? null,
        passRequiredForNext: row.passRequiredForNext || false,
      },
    };
    // Reset form state when row changes
    setLabel(props.label || "");
    setTitle(props.title || "");
    setSubtitle(props.subtitle || "");
      setMetadata({
        code: row.code || "",
        slideGoal: ((row.metaJson as any) || {}).slideGoal || "",
        activityName: ((row.metaJson as any) || {}).activityName || "",
        requiresExternalTTS: ((row.metaJson as any) || {}).requires?.externalTTS || false,
        buttons: Array.isArray(((row.metaJson as any) || {}).buttons) ? ((row.metaJson as any) || {}).buttons : [],
        tags: Array.isArray(((row.metaJson as any) || {}).tags) ? ((row.metaJson as any) || {}).tags : [],
        difficultyHint: ((row.metaJson as any) || {}).difficultyHint || "",
        reviewWeight: ((row.metaJson as any) || {}).reviewWeight ?? null,
        showScoreToLearner: ((row.metaJson as any) || {}).showScoreToLearner || false,
        isActivity: row.isActivity || false,
        scoreType: row.scoreType || "none",
        passingScoreValue: row.passingScoreValue ?? null,
        maxScoreValue: row.maxScoreValue ?? null,
        passRequiredForNext: row.passRequiredForNext || false,
      });
  }, [row.id, JSON.stringify(row.propsJson), JSON.stringify(row.metaJson), row.code, row.isActivity, row.scoreType, row.passingScoreValue, row.maxScoreValue, row.passRequiredForNext]); // Reset when slide data changes
  
  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current) return false;
    const initial = initialDataRef.current;
    return (
      label !== initial.label ||
      title !== initial.title ||
      subtitle !== initial.subtitle ||
      metadata.code !== initial.metadata.code ||
      metadata.slideGoal !== initial.metadata.slideGoal ||
      metadata.activityName !== initial.metadata.activityName ||
      metadata.requiresExternalTTS !== initial.metadata.requiresExternalTTS ||
      JSON.stringify(metadata.buttons) !== JSON.stringify(initial.metadata.buttons) ||
      JSON.stringify(metadata.tags) !== JSON.stringify(initial.metadata.tags) ||
      metadata.difficultyHint !== initial.metadata.difficultyHint ||
      metadata.reviewWeight !== initial.metadata.reviewWeight ||
      metadata.showScoreToLearner !== initial.metadata.showScoreToLearner ||
      metadata.isActivity !== initial.metadata.isActivity ||
      metadata.scoreType !== initial.metadata.scoreType ||
      metadata.passingScoreValue !== initial.metadata.passingScoreValue ||
      metadata.maxScoreValue !== initial.metadata.maxScoreValue ||
      metadata.passRequiredForNext !== initial.metadata.passRequiredForNext
    );
  }, [label, title, subtitle, metadata]);
  
  // Notify parent of unsaved changes
  useEffect(() => {
    if (onUnsavedChangesChange) {
      onUnsavedChangesChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChangesChange]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [rawJsonExpanded, setRawJsonExpanded] = useState(false);
  const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(row.propsJson ?? {}, null, 2));
  const [rawJsonParseError, setRawJsonParseError] = useState<string | null>(null);
  const [rawJsonSaving, setRawJsonSaving] = useState(false);
  const [rawJsonSaveMessage, setRawJsonSaveMessage] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);
    setSaving(true);
    onSavingChange?.(true);

    try {
      // Validate required fields (label is required for new slides)
      const isNewSlide = !row.id;
      if (isNewSlide && !label.trim()) {
        setSaveMessage("Slide label is required for CMS navigation.");
        setSaving(false);
        onSavingChange?.(false);
        return;
      }

      const newProps: any = {};
      if (label.trim()) {
        newProps.label = label.trim();
      }
      if (title.trim()) {
        newProps.title = title.trim();
      }
      if (subtitle.trim()) {
        newProps.subtitle = subtitle.trim();
      }

      const trimmedType = slideType.trim();

      // Build meta_json from metadata state
      const metaJson: any = {};
      if (metadata.slideGoal) metaJson.slideGoal = metadata.slideGoal;
      if (metadata.activityName) metaJson.activityName = metadata.activityName;
      if (metadata.requiresExternalTTS || metadata.buttons.length > 0) {
        metaJson.requires = {};
        if (metadata.requiresExternalTTS) {
          metaJson.requires.externalTTS = true;
        }
      }
      if (metadata.buttons.length > 0) {
        metaJson.buttons = metadata.buttons;
      }
      if (metadata.tags.length > 0) {
        metaJson.tags = metadata.tags;
      }
      if (metadata.difficultyHint) {
        metaJson.difficultyHint = metadata.difficultyHint;
      }
      if (metadata.reviewWeight !== null && metadata.reviewWeight !== undefined) {
        metaJson.reviewWeight = metadata.reviewWeight;
      }
      if (metadata.showScoreToLearner) {
        metaJson.showScoreToLearner = true;
      }

      const result = await saveSlide({
        props_json: newProps,
        type: trimmedType,
        order_index: orderIndex,
        group_id: groupId ?? undefined,
        code: metadata.code || null,
        meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
        is_activity: metadata.isActivity,
        score_type: "none",
        passing_score_value: null,
        max_score_value: null,
        pass_required_for_next: false,
      });

      if (!result.success) {
        setSaveMessage("Update error: " + (result.error || "Unknown error"));
        return;
      }

      setSaveMessage("Saved successfully!");
      
      // Update initial data ref after successful save
      initialDataRef.current = {
        label,
        title,
        subtitle,
        metadata: { ...metadata },
      };
      
      // Explicitly notify parent that there are no unsaved changes
      if (onUnsavedChangesChange) {
        onUnsavedChangesChange(false);
      }
      
      onSaveSuccess();
    } finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  }

  return (
    <>
      <CmsSection
        title="title-slide editor"
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
      >

        <form onSubmit={handleSave}>
          {shouldShowLabel && (
            <FormField 
              label="Label" 
              required
              borderColor="#f2e1db"
              infoTooltip="Internal name for this slide used in the CMS and navigation. Not shown to learners."
            >
              <Input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </FormField>
          )}

          {shouldShowTitle && (
            <FormField 
              label="Title" 
              required 
              borderColor="#f2e1db"
              infoTooltip="Main heading shown to the student. Should clearly state what the learner is about to do or focus on."
            >
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </FormField>
          )}

          {shouldShowSubtitle && (
            <FormField 
              label="Subtitle (optional)" 
              borderColor="#f2e1db"
              infoTooltip="Supporting or clarifying text shown under the title. Used for instructions, context, or tone. Leave empty if unnecessary."
            >
              <Input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </FormField>
          )}

        </form>

        {row.id && !label.trim() && (
          <div
            style={{
              padding: uiTokens.space.md,
              backgroundColor: "#fff3cd",
              border: `1px solid #ffc107`,
              borderRadius: uiTokens.radius.md,
              color: "#856404",
              marginTop: uiTokens.space.md,
            }}
          >
            <strong>Missing label:</strong> This slide is missing a label. Please add one for proper CMS navigation.
          </div>
        )}

        {saveMessage && (
          <p
            style={{
              marginTop: uiTokens.space.md,
              color: saveMessage.includes("error") ? uiTokens.color.danger : "green",
            }}
          >
            {saveMessage}
          </p>
        )}
      </CmsSection>

      <AuthoringMetadataSection
        row={row}
        slideType={slideType}
        onMetadataChange={setMetadata}
        visibleFieldKeys={visibleFieldKeys}
      />

      <CmsSection backgroundColor="#f8f0ed" borderColor="#f2e1db">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setRawJsonExpanded(!rawJsonExpanded)}
          style={{
            marginBottom: rawJsonExpanded ? 16 : 0,
          }}
        >
          {rawJsonExpanded ? "▼" : "▶"} Raw props_json (advanced)
        </Button>

        {rawJsonExpanded && (
          <div>
            <textarea
              value={rawJsonText}
              onChange={(e) => {
                setRawJsonText(e.target.value);
                setRawJsonParseError(null);
              }}
              rows={15}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontFamily: "monospace",
                fontSize: 13,
              }}
            />
            {rawJsonParseError && (
              <p style={{ color: "red", marginTop: 8, fontSize: 13 }}>
                {rawJsonParseError}
              </p>
            )}
            <div style={{ marginTop: uiTokens.space.xs, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="button"
                onClick={async () => {
                  setRawJsonParseError(null);
                  setRawJsonSaveMessage(null);
                  setRawJsonSaving(true);
                  onSavingChange?.(true);

                  try {
                    let parsedJson: unknown;
                    try {
                      parsedJson = JSON.parse(rawJsonText);
                    } catch (parseErr) {
                      setRawJsonParseError("Invalid JSON: " + (parseErr instanceof Error ? parseErr.message : String(parseErr)));
                      return;
                    }

                    const trimmedType = slideType.trim();

                    // Build meta_json from current metadata state
                    const metaJson: any = {};
                    if (metadata.slideGoal) metaJson.slideGoal = metadata.slideGoal;
                    if (metadata.activityName) metaJson.activityName = metadata.activityName;
                    if (metadata.requiresExternalTTS || metadata.buttons.length > 0) {
                      metaJson.requires = {};
                      if (metadata.requiresExternalTTS) {
                        metaJson.requires.externalTTS = true;
                      }
                    }
                    if (metadata.buttons.length > 0) {
                      metaJson.buttons = metadata.buttons;
                    }
                    if (metadata.tags.length > 0) {
                      metaJson.tags = metadata.tags;
                    }
                    if (metadata.difficultyHint) {
                      metaJson.difficultyHint = metadata.difficultyHint;
                    }
                    if (metadata.reviewWeight !== null && metadata.reviewWeight !== undefined) {
                      metaJson.reviewWeight = metadata.reviewWeight;
                    }
                    if (metadata.showScoreToLearner) {
                      metaJson.showScoreToLearner = true;
                    }

                    const result = await saveSlide({
                      props_json: parsedJson,
                      type: trimmedType,
                      code: metadata.code || null,
                      meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
                      is_activity: metadata.isActivity,
                      score_type: metadata.scoreType || "none",
                      passing_score_value: metadata.passingScoreValue,
                      max_score_value: metadata.maxScoreValue,
                      pass_required_for_next: metadata.passRequiredForNext,
                    });

                    if (!result.success) {
                      setRawJsonSaveMessage("Update error: " + (result.error || "Unknown error"));
                      return;
                    }

                    setRawJsonSaveMessage("Saved successfully!");
                    // Update the textarea to reflect the saved value (in case it was normalized)
                    setRawJsonText(JSON.stringify(parsedJson, null, 2));
                  } finally {
                    setRawJsonSaving(false);
                    onSavingChange?.(false);
                  }
                }}
                disabled={rawJsonSaving}
              >
                {rawJsonSaving ? "Saving…" : "Save JSON"}
              </Button>
            </div>
            {rawJsonSaveMessage && (
              <p
                style={{
                  marginTop: uiTokens.space.xs,
                  color: rawJsonSaveMessage.includes("error") ? uiTokens.color.danger : "green",
                  fontSize: uiTokens.font.meta.size,
                }}
              >
                {rawJsonSaveMessage}
              </p>
            )}
          </div>
        )}
      </CmsSection>

      <CmsSection title="Raw DB row (debug)" backgroundColor="#f8f0ed" borderColor="#f2e1db">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(row, null, 2)}
        </pre>
      </CmsSection>
    </>
  );
}
