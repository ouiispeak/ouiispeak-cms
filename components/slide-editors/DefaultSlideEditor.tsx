"use client";

import { useEffect, useMemo, useRef, useState, FormEvent, useCallback } from "react";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import { uiTokens } from "../../lib/uiTokens";
import { Button } from "../Button";
import AuthoringMetadataSection from "./AuthoringMetadataSection";
import type { SlideEditorProps } from "./types";
import type { AuthoringMetadataState } from "./types";
import { DEFAULT_SLIDE_FIELDS } from "../../lib/slide-editor-registry/defaultFields";

type FieldValueMap = Record<string, any>;

function buildInitialValues(row: any): FieldValueMap {
  const props = (row.propsJson as any) || {};
  return {
    title: props.title || "",
    subtitle: props.subtitle || "",
    body: props.body || (props.bodies && Array.isArray(props.bodies) ? props.bodies.join("\n") : ""),
    note: props.note || "",
    defaultLang: props.defaultLang || "",
    phrases: props.phrases || "",
  };
}

export default function DefaultSlideEditor({
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
  const [values, setValues] = useState<FieldValueMap>(() => buildInitialValues(row));
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
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const handleMetadataChange = useCallback((m: AuthoringMetadataState) => setMetadata(m), []);

  const initialDataRef = useRef<{ values: FieldValueMap; metadata: AuthoringMetadataState } | null>(null);

  // Reset when row changes
  useEffect(() => {
    const initialValues = buildInitialValues(row);
    initialDataRef.current = {
      values: initialValues,
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
    setValues(initialValues);
    setMetadata(initialDataRef.current.metadata);
  }, [row.id, JSON.stringify(row.propsJson), JSON.stringify(row.metaJson), row.code, row.isActivity, row.scoreType, row.passingScoreValue, row.maxScoreValue, row.passRequiredForNext]);

  const visibleFieldKeys = useMemo(() => new Set(schema.fields.map((f) => f.key)), [schema.fields]);
  const hiddenFields = useMemo(
    () => DEFAULT_SLIDE_FIELDS.filter((f) => !visibleFieldKeys.has(f.key)),
    [visibleFieldKeys]
  );
  const renderedFields = useMemo(() => {
    if (showHidden) {
      return [...schema.fields, ...hiddenFields];
    }
    return schema.fields;
  }, [schema.fields, hiddenFields, showHidden]);

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
      metadata.isActivity !== init.metadata.isActivity ||
      metadata.scoreType !== init.metadata.scoreType ||
      metadata.passingScoreValue !== init.metadata.passingScoreValue ||
      metadata.maxScoreValue !== init.metadata.maxScoreValue ||
      metadata.passRequiredForNext !== init.metadata.passRequiredForNext;
    return valueChanged || metaChanged;
  }, [values, metadata]);

  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  const updateField = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);
    setSaving(true);
    onSavingChange?.(true);

    try {
      const currentProps = { ...(row.propsJson as any) };
      renderedFields.forEach((field) => {
        if (field.key === "metadata") return;
        const rawVal = values[field.key];
        const trimmedVal = typeof rawVal === "string" ? rawVal.trim() : rawVal;
        if (trimmedVal === "" || trimmedVal === undefined) {
          delete currentProps[field.key];
        } else {
          currentProps[field.key] = trimmedVal;
        }
      });

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
        props_json: currentProps,
        type: slideType.trim(),
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

      // Update initial ref
      initialDataRef.current = {
        values: { ...values },
        metadata: { ...metadata },
      };
      onUnsavedChangesChange?.(false);
      onSaveSuccess();
    } finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  }

  const renderFieldInput = (fieldKey: string, uiType: string) => {
    const val = (values as any)[fieldKey] ?? "";
    switch (uiType) {
      case "text":
        return <Input type="text" value={val} onChange={(e) => updateField(fieldKey, e.target.value)} />;
      case "textarea":
        return <Textarea value={val} onChange={(e) => updateField(fieldKey, e.target.value)} rows={4} />;
      case "number":
        return (
          <Input
            type="number"
            value={val ?? ""}
            onChange={(e) => updateField(fieldKey, e.target.value === "" ? "" : Number(e.target.value))}
          />
        );
      case "boolean":
      case "toggle":
        return (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={!!val}
              onChange={(e) => updateField(fieldKey, e.target.checked)}
            />
            <span>Enabled</span>
          </label>
        );
      case "metadata":
        return (
          <AuthoringMetadataSection row={row} slideType={slideType} onMetadataChange={handleMetadataChange} />
        );
      default:
        return <Input type="text" value={val} onChange={(e) => updateField(fieldKey, e.target.value)} />;
    }
  };

  const hasMetadataField = renderedFields.some((f) => f.key === "metadata");
  const visibleFieldItems = renderedFields.filter((f) => f.key !== "metadata");

  return (
    <form onSubmit={handleSave}>
      <CmsSection title="Default slide fields" backgroundColor="#f8f0ed" borderColor="#f2e1db">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: uiTokens.space.sm }}>
          {hiddenFields.length > 0 && (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowHidden((v) => !v)}
            >
              {showHidden ? "Hide hidden fields" : "Show hidden fields"}
            </Button>
          )}
        </div>

        <div style={{ display: "grid", gap: uiTokens.space.sm }}>
          {visibleFieldItems.map((field) => (
            <FormField key={field.key} label={field.label} required={field.required} borderColor="#f2e1db" infoTooltip={field.helpText}>
              {renderFieldInput(field.key, field.uiType)}
            </FormField>
          ))}
          {hasMetadataField && (
            <div style={{ marginTop: uiTokens.space.sm }}>
              <AuthoringMetadataSection row={row} slideType={slideType} onMetadataChange={handleMetadataChange} />
            </div>
          )}
        </div>

        {showHidden && hiddenFields.length > 0 && (
          <div style={{ marginTop: uiTokens.space.md, opacity: 0.8 }}>
            <div style={{ fontWeight: 600, marginBottom: uiTokens.space.sm }}>Hidden fields</div>
            <div style={{ display: "grid", gap: uiTokens.space.sm }}>
              {hiddenFields
                .filter((field) => field.key !== "metadata")
                .map((field) => (
                  <FormField key={field.key} label={field.label} required={field.required} borderColor="#f2e1db" infoTooltip={field.helpText}>
                    <div style={{ opacity: 0.7 }}>{renderFieldInput(field.key, field.uiType)}</div>
                  </FormField>
                ))}
            </div>
          </div>
        )}

        {saveMessage && (
          <div style={{ marginTop: uiTokens.space.sm, color: saveMessage.includes("error") ? uiTokens.color.danger : uiTokens.color.text }}>
            {saveMessage}
          </div>
        )}
      </CmsSection>
    </form>
  );
}
