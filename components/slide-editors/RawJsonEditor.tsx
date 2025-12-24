"use client";

import { useState, FormEvent, useEffect, useRef, useMemo } from "react";
import { Button } from "../Button";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Textarea from "../ui/Textarea";
import { uiTokens } from "../../lib/uiTokens";
import AuthoringMetadataSection from "./AuthoringMetadataSection";
import type { SlideEditorProps } from "./types";
import type { AuthoringMetadataState } from "./types";

export default function RawJsonEditor({
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
  const [jsonText, setJsonText] = useState(() => {
    try {
      return JSON.stringify(row.propsJson, null, 2);
    } catch {
      return String(row.propsJson ?? "");
    }
  });
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
    jsonText: string;
    metadata: AuthoringMetadataState;
  } | null>(null);
  
  // Initialize initial data when row changes
  useEffect(() => {
    const initialJson = (() => {
      try {
        return JSON.stringify(row.propsJson, null, 2);
      } catch {
        return String(row.propsJson ?? "");
      }
    })();
    
    initialDataRef.current = {
      jsonText: initialJson,
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
    setJsonText(initialJson);
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
      jsonText !== initial.jsonText ||
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
  }, [jsonText, metadata]);
  
  // Notify parent of unsaved changes
  useEffect(() => {
    if (onUnsavedChangesChange) {
      onUnsavedChangesChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChangesChange]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rawJsonExpanded, setRawJsonExpanded] = useState(false);
  const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(row.propsJson ?? {}, null, 2));
  const [rawJsonParseError, setRawJsonParseError] = useState<string | null>(null);
  const [rawJsonSaving, setRawJsonSaving] = useState(false);
  const [rawJsonSaveMessage, setRawJsonSaveMessage] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);
    setParseError(null);
    setSaving(true);
    onSavingChange?.(true);

    try {
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(jsonText);
      } catch (parseErr) {
        setParseError("Invalid JSON: " + (parseErr instanceof Error ? parseErr.message : String(parseErr)));
        return;
      }

      // Remove bodies if present (legacy support - we only use body)
      if (parsedJson && typeof parsedJson === 'object' && 'bodies' in parsedJson) {
        const { bodies, ...rest } = parsedJson as any;
        parsedJson = rest;
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
        props_json: parsedJson,
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
        jsonText,
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
        title="Raw JSON editor"
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
        description={
          <>
            Editing slide <code className="codeText">{row.id}</code> (type: <code className="codeText">{row.type}</code>) in group{" "}
            <code className="codeText">{row.groupId ?? "none"}</code>
            <br />
            <span className="metaText">No custom editor available for this slide type. Edit the raw JSON below.</span>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <FormField label="props_json (raw JSON)" required borderColor="#f2e1db">
            <Textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setParseError(null);
              }}
              rows={20}
              style={{ fontFamily: "monospace", fontSize: uiTokens.font.code.size }}
            />
          </FormField>

          {parseError && (
            <p style={{ color: uiTokens.color.danger, marginBottom: uiTokens.space.md }}>
              {parseError}
            </p>
          )}

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
