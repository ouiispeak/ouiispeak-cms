"use client";

import { useState, FormEvent, useEffect, useRef, useMemo } from "react";
import { Button } from "../Button";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import { uiTokens } from "../../lib/uiTokens";
import AuthoringMetadataSection from "./AuthoringMetadataSection";
import type { SlideEditorProps } from "./types";
import type { AuthoringMetadataState } from "./types";

export default function TextSlideEditor({
  row,
  orderIndex,
  groupId,
  slideType,
  onSaveSuccess,
  saveSlide,
  onUnsavedChangesChange,
}: SlideEditorProps) {
  const props = (row.propsJson as any) || {};
  const [title, setTitle] = useState(props.title || "");
  const [subtitle, setSubtitle] = useState(props.subtitle || "");
  // Handle legacy bodies: if body is empty but bodies exists, join it into body for display
  // But do not persist bodies back - we only save body
  const initialBody = props.body || (props.bodies && Array.isArray(props.bodies) ? props.bodies.join("\n") : "");
  const [body, setBody] = useState(initialBody);
  const [metadata, setMetadata] = useState<AuthoringMetadataState>({
    code: row.code || "",
    slideGoal: ((row.metaJson as any) || {}).slideGoal || "",
    activityName: ((row.metaJson as any) || {}).activityName || "",
    requiresExternalTTS: ((row.metaJson as any) || {}).requires?.externalTTS || false,
    buttons: Array.isArray(((row.metaJson as any) || {}).buttons) ? ((row.metaJson as any) || {}).buttons : [],
    isActivity: row.isActivity || false,
    scoreType: row.scoreType || "none",
    passingScoreValue: row.passingScoreValue ?? null,
    maxScoreValue: row.maxScoreValue ?? null,
    passRequiredForNext: row.passRequiredForNext || false,
  });
  
  const initialDataRef = useRef<{
    title: string;
    subtitle: string;
    body: string;
    metadata: AuthoringMetadataState;
  } | null>(null);
  
  // Initialize initial data when row changes
  useEffect(() => {
    initialDataRef.current = {
      title: props.title || "",
      subtitle: props.subtitle || "",
      body: initialBody,
      metadata: {
        code: row.code || "",
        slideGoal: ((row.metaJson as any) || {}).slideGoal || "",
        activityName: ((row.metaJson as any) || {}).activityName || "",
        requiresExternalTTS: ((row.metaJson as any) || {}).requires?.externalTTS || false,
        buttons: Array.isArray(((row.metaJson as any) || {}).buttons) ? ((row.metaJson as any) || {}).buttons : [],
        isActivity: row.isActivity || false,
        scoreType: row.scoreType || "none",
        passingScoreValue: row.passingScoreValue ?? null,
        maxScoreValue: row.maxScoreValue ?? null,
        passRequiredForNext: row.passRequiredForNext || false,
      },
    };
    setTitle(props.title || "");
    setSubtitle(props.subtitle || "");
    setBody(initialBody);
    setMetadata({
      code: row.code || "",
      slideGoal: ((row.metaJson as any) || {}).slideGoal || "",
      activityName: ((row.metaJson as any) || {}).activityName || "",
      requiresExternalTTS: ((row.metaJson as any) || {}).requires?.externalTTS || false,
      buttons: Array.isArray(((row.metaJson as any) || {}).buttons) ? ((row.metaJson as any) || {}).buttons : [],
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
      title !== initial.title ||
      subtitle !== initial.subtitle ||
      body !== initial.body ||
      metadata.code !== initial.metadata.code ||
      metadata.slideGoal !== initial.metadata.slideGoal ||
      metadata.activityName !== initial.metadata.activityName ||
      metadata.requiresExternalTTS !== initial.metadata.requiresExternalTTS ||
      JSON.stringify(metadata.buttons) !== JSON.stringify(initial.metadata.buttons) ||
      metadata.isActivity !== initial.metadata.isActivity ||
      metadata.scoreType !== initial.metadata.scoreType ||
      metadata.passingScoreValue !== initial.metadata.passingScoreValue ||
      metadata.maxScoreValue !== initial.metadata.maxScoreValue ||
      metadata.passRequiredForNext !== initial.metadata.passRequiredForNext
    );
  }, [title, subtitle, body, metadata]);
  
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
      const newProps: any = {};

      if (title.trim()) {
        newProps.title = title.trim();
      }
      if (subtitle.trim()) {
        newProps.subtitle = subtitle.trim();
      }

      // Only write body (string), never bodies
      if (body.trim()) {
        newProps.body = body.trim();
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

      const result = await saveSlide({
        props_json: newProps,
        type: trimmedType,
        order_index: orderIndex,
        group_id: groupId ?? undefined,
        code: metadata.code || null,
        meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
        is_activity: metadata.isActivity,
        score_type: metadata.scoreType || "none",
        passing_score_value: metadata.passingScoreValue,
        max_score_value: metadata.maxScoreValue,
        pass_required_for_next: metadata.passRequiredForNext,
      });

      if (!result.success) {
        setSaveMessage("Update error: " + (result.error || "Unknown error"));
        return;
      }

      setSaveMessage("Saved successfully!");
      
      // Update initial data ref after successful save
      initialDataRef.current = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        body: body.trim(),
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
        title="text-slide editor"
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
        description={
          <>
            Editing slide <code className="codeText">{row.id}</code> in group{" "}
            <code className="codeText">{row.groupId ?? "none"}</code>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <FormField 
            label="Title (optional)" 
            borderColor="#f2e1db"
            infoTooltip="Main heading shown to the student. Should clearly state what the learner is about to do or focus on."
          >
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

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

          <FormField label="Body" borderColor="#f2e1db">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
            />
          </FormField>

        </form>

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
      />

      <CmsSection
        title="Raw props_json (advanced)"
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
        actions={
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setRawJsonExpanded(!rawJsonExpanded)}
          >
            {rawJsonExpanded ? "▼" : "▶"} {rawJsonExpanded ? "Collapse" : "Expand"}
          </Button>
        }
      >
        {rawJsonExpanded && (
          <div>
            <Textarea
              value={rawJsonText}
              onChange={(e) => {
                setRawJsonText(e.target.value);
                setRawJsonParseError(null);
              }}
              rows={15}
              style={{ fontFamily: "monospace", fontSize: uiTokens.font.code.size }}
            />
            {rawJsonParseError && (
              <p style={{ color: uiTokens.color.danger, marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
                {rawJsonParseError}
              </p>
            )}
            <div style={{ marginTop: uiTokens.space.md, display: "flex", justifyContent: "flex-end" }}>
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
