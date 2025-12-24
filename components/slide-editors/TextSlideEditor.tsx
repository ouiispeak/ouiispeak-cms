"use client";

import { useState, FormEvent, useEffect, useRef, useMemo } from "react";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { uiTokens } from "../../lib/uiTokens";
import AuthoringMetadataSection from "./AuthoringMetadataSection";
import type { SlideEditorProps, EditorField } from "./types";
import type { AuthoringMetadataState } from "./types";
import { buildInitialMetadataState, buildMetaJson } from "../../lib/slide-editor-registry/metadataHelpers";

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
    if (field.key === "body") {
      // Handle legacy bodies: if body is empty but bodies exists, join it into body for display
      const bodyValue = props.body || (props.bodies && Array.isArray(props.bodies) ? props.bodies.join("\n") : "");
      acc.body = bodyValue || "";
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

export default function TextSlideEditor({
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
  const [metadata, setMetadata] = useState<AuthoringMetadataState>(() => buildInitialMetadataState(row));
  
  // Filter schema fields: exclude system and metadata fields (handled separately)
  // ONLY render fields from schema.fields - no hardcoded lists, no DEFAULT_SLIDE_FIELDS
  const editableFields = useMemo(
    () => schema.fields.filter((field) => !isSystemField(field.key) && !isMetadataField(field.key)),
    [schema.fields]
  );
  // Metadata fields are handled by AuthoringMetadataSection, not in main editor loop
  const schemaFieldKeys = useMemo(() => new Set(schema.fields.map((f) => f.key)), [schema.fields]);
  
  const initialDataRef = useRef<{ values: FieldValueMap; metadata: AuthoringMetadataState } | null>(null);
  
  // Initialize initial data when row changes
  useEffect(() => {
    const initialValues = buildInitialValues(row, schema.fields);
    const initialMetadata = buildInitialMetadataState(row);
    initialDataRef.current = {
      values: initialValues,
      metadata: initialMetadata,
    };
    setValues(initialValues);
    setMetadata(initialMetadata);
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

  const renderFieldInput = (field: EditorField) => {
    const val = (values as any)[field.key] ?? "";
    switch (field.uiType) {
      case "text":
        return <Input type="text" value={val} onChange={(e) => updateField(field.key, e.target.value)} />;
      case "textarea":
        return <Textarea value={val} onChange={(e) => updateField(field.key, e.target.value)} rows={6} />;
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
        // Only write body (string), never bodies
        if (field.key === "body") {
          newProps.body = trimmedVal;
        } else {
          newProps[field.key] = trimmedVal;
        }
      }

      const trimmedType = slideType.trim();

      // Build meta_json from metadata state
      const metaJson = buildMetaJson(metadata);

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
        title="text-slide editor"
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
        description={
          <>
            Editing slide <code className="codeText">{row.id}</code> in group{" "}
            <code className="codeText">{row.groupId ?? "none"}</code>
          </>
        }
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
    </>
  );
}
