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
import { buildInitialMetadataState, buildMetaJson } from "../../lib/slide-editor-registry/metadataHelpers";
import { hasUnsavedChanges as checkUnsavedChanges } from "../../lib/slide-editor-registry/useUnsavedChanges";

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
  const [metadata, setMetadata] = useState<AuthoringMetadataState>(() => buildInitialMetadataState(row));
  
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
    
    const initialMetadata = buildInitialMetadataState(row);
    initialDataRef.current = {
      jsonText: initialJson,
      metadata: initialMetadata,
    };
    setJsonText(initialJson);
    setMetadata(initialMetadata);
  }, [row.id, JSON.stringify(row.propsJson), JSON.stringify(row.metaJson), row.code, row.isActivity, row.scoreType, row.passingScoreValue, row.maxScoreValue, row.passRequiredForNext]); // Reset when slide data changes
  
  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current) return false;
    const initial = initialDataRef.current;
    return checkUnsavedChanges(
      {},
      {},
      initial.metadata,
      metadata,
      [{ initial: initial.jsonText, current: jsonText }]
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
      const metaJson = buildMetaJson(metadata);

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
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
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
          <FormField label="props_json (raw JSON)" required borderColor="#b4d5d5">
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
    </>
  );
}
