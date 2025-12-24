"use client";

import { useState, FormEvent, useEffect, useRef, useMemo } from "react";
import { Button } from "../Button";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { uiTokens } from "../../lib/uiTokens";
import AuthoringMetadataSection from "./AuthoringMetadataSection";
import type { SlideEditorProps, EditorField } from "./types";
import type { AuthoringMetadataState } from "./types";

const SYSTEM_FIELD_KEYS = new Set(["slideId", "slideType", "groupId", "orderIndex"]);
const METADATA_FIELD_KEYS = new Set([
  "code", "slideGoal", "activityName", "requiresExternalTTS", "buttons", "tags",
  "difficultyHint", "reviewWeight", "isActivity", "scoreType", "passThreshold",
  "maxScoreValue", "passRequiredForNext", "showScoreToLearner",
]);

const SELECT_OPTIONS_BY_KEY: Record<string, { value: string; label: string }[]> = {
  defaultLang: [
    { value: "auto", label: "Auto" },
    { value: "en", label: "English (en)" },
    { value: "fr", label: "French (fr)" },
  ],
};

const isSystemField = (key: string) => SYSTEM_FIELD_KEYS.has(key);
const isMetadataField = (key: string) => METADATA_FIELD_KEYS.has(key);

type FieldValueMap = Record<string, any>;

function buildInitialValues(row: any, fields: EditorField[]): FieldValueMap {
  const props = (row.propsJson as any) || {};
  return fields.reduce((acc, field) => {
    if (isSystemField(field.key) || isMetadataField(field.key)) {
      return acc;
    }
    const rawValue = props[field.key];
    if (rawValue === undefined || rawValue === null) {
      acc[field.key] = "";
    } else {
      acc[field.key] = rawValue;
    }
    return acc;
  }, {} as FieldValueMap);
}

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
  // Iterate over schema.fields dynamically - no hardcoded checks
  const props = (row.propsJson as any) || {};
  const [values, setValues] = useState<FieldValueMap>(() => buildInitialValues(row, schema.fields));
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
  
  const initialDataRef = useRef<{ values: FieldValueMap; metadata: AuthoringMetadataState } | null>(null);
  
  // Filter schema fields: exclude system and metadata fields (handled separately)
  // ONLY render fields from schema.fields - no hardcoded lists, no DEFAULT_SLIDE_FIELDS
  const editableFields = useMemo(
    () => schema.fields.filter((field) => !isSystemField(field.key) && !isMetadataField(field.key)),
    [schema.fields]
  );
  // Metadata fields are handled by AuthoringMetadataSection, not in main editor loop
  const schemaFieldKeys = useMemo(() => new Set(schema.fields.map((f) => f.key)), [schema.fields]);
  
  // Initialize initial data when row changes
  useEffect(() => {
    const initialValues = buildInitialValues(row, schema.fields);
    initialDataRef.current = {
      values: initialValues,
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
    setValues(initialValues);
    setMetadata(initialDataRef.current.metadata);
  }, [row.id, JSON.stringify(row.propsJson), JSON.stringify(row.metaJson), row.code, row.isActivity, row.scoreType, row.passingScoreValue, row.maxScoreValue, row.passRequiredForNext, JSON.stringify(schema.fields.map(f => f.key))]); // Reset when slide data changes
  
  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current) return false;
    const init = initialDataRef.current;
    const valueChanged = Object.keys(values).some((k) => (values as any)[k] !== (init.values as any)[k]);
    const metaChanged =
      metadata.code !== init.metadata.code ||
      metadata.slideGoal !== init.metadata.slideGoal ||
      metadata.activityName !== init.metadata.activityName ||
      metadata.requiresExternalTTS !== init.metadata.requiresExternalTTS ||
      JSON.stringify(metadata.buttons) !== JSON.stringify(init.metadata.buttons) ||
      JSON.stringify(metadata.tags) !== JSON.stringify(init.metadata.tags) ||
      metadata.difficultyHint !== init.metadata.difficultyHint ||
      metadata.reviewWeight !== init.metadata.reviewWeight ||
      metadata.showScoreToLearner !== init.metadata.showScoreToLearner ||
      metadata.isActivity !== init.metadata.isActivity ||
      metadata.scoreType !== init.metadata.scoreType ||
      metadata.passingScoreValue !== init.metadata.passingScoreValue ||
      metadata.maxScoreValue !== init.metadata.maxScoreValue ||
      metadata.passRequiredForNext !== init.metadata.passRequiredForNext;
    return valueChanged || metaChanged;
  }, [values, metadata]);
  
  const updateField = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };
  
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

  const renderFieldInput = (field: EditorField) => {
    const val = (values as any)[field.key] ?? "";
    switch (field.uiType) {
      case "text":
        return <Input type="text" value={val} onChange={(e) => updateField(field.key, e.target.value)} />;
      case "textarea":
        return <Textarea value={val} onChange={(e) => updateField(field.key, e.target.value)} rows={4} />;
      case "select": {
        const options = SELECT_OPTIONS_BY_KEY[field.key];
        if (!options) {
          return <Input type="text" value={val} onChange={(e) => updateField(field.key, e.target.value)} />;
        }
        return (
          <Select value={val ?? ""} onChange={(e) => updateField(field.key, e.target.value)}>
            <option value="">(not set)</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      }
      default:
        return <Input type="text" value={val} onChange={(e) => updateField(field.key, e.target.value)} />;
    }
  };

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);
    setSaving(true);
    onSavingChange?.(true);

    try {
      // Validate required fields (label is required for new slides)
      const labelField = editableFields.find((f) => f.key === "label");
      const isNewSlide = !row.id;
      if (labelField && isNewSlide) {
        const labelValue = values["label"];
        const trimmedLabel = typeof labelValue === "string" ? labelValue.trim() : "";
        if (!trimmedLabel) {
          setSaveMessage("Slide label is required for CMS navigation.");
          setSaving(false);
          onSavingChange?.(false);
          return;
        }
      }

      // Build props from values map - iterate over editableFields
      const newProps: any = {};
      for (const field of editableFields) {
        const rawVal = values[field.key];
        const trimmedVal = typeof rawVal === "string" ? rawVal.trim() : rawVal;
        if (trimmedVal === "" || trimmedVal === undefined) {
          continue; // Skip empty values
        }
        newProps[field.key] = trimmedVal;
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
        values: { ...values },
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
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
      >

        <form onSubmit={handleSave}>
          {/* Iterate over schema.fields dynamically - no hardcoded checks */}
          {editableFields.map((field) => (
            <FormField
              key={field.key}
              label={field.label}
              required={field.required}
              borderColor="#b4d5d5"
              infoTooltip={field.helpText}
            >
              {renderFieldInput(field)}
            </FormField>
          ))}
        </form>

        {row.id && !((values as any)["label"] && typeof (values as any)["label"] === "string" && (values as any)["label"].trim().length > 0) && (
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
        visibleFieldKeys={schemaFieldKeys}
      />

      <CmsSection backgroundColor="#e6f1f1" borderColor="#b4d5d5">
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

      <CmsSection title="Raw DB row (debug)" backgroundColor="#e6f1f1" borderColor="#b4d5d5">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(row, null, 2)}
        </pre>
      </CmsSection>
    </>
  );
}
