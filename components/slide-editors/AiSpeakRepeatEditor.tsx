"use client";

import { useState, useEffect, FormEvent, useMemo, useRef } from "react";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { uiTokens } from "../../lib/uiTokens";
import AuthoringMetadataSection from "./AuthoringMetadataSection";
import MissingLabelWarning from "./shared/MissingLabelWarning";
import type { SlideEditorProps } from "./types";
import type { AuthoringMetadataState } from "./types";
import { buildInitialMetadataState, buildMetaJson } from "../../lib/slide-editor-registry/metadataHelpers";
import { hasUnsavedChanges as checkUnsavedChanges } from "../../lib/slide-editor-registry/useUnsavedChanges";
import { SELECT_OPTIONS_BY_KEY } from "../../lib/slide-editor-registry/selectOptions";

export default function AiSpeakRepeatEditor({
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
  // Use schema.fields as the ONLY source of truth - no hardcoded checks
  const schemaFieldKeys = new Set(schema.fields.map((f) => f.key));
  const [innerState, setInnerState] = useState<
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; slide: RealAiSpeakRepeatSlide }
  >({ status: "loading" });

  const props = (row.propsJson as any) || {};
  // Use values map for all fields except phrases (which has special handling)
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    schema.fields.forEach((field) => {
      if (field.key !== "phrases") {
        initial[field.key] = props[field.key] || "";
      }
    });
    return initial;
  });
  // Special handling for phrases: convert lines[][] to textarea text
  const [phrasesText, setPhrasesText] = useState("");
  const [metadata, setMetadata] = useState<AuthoringMetadataState>(() => buildInitialMetadataState(row));

  const initialDataRef = useRef<{
    values: Record<string, any>;
    phrasesText: string;
    metadata: AuthoringMetadataState;
  } | null>(null);
  
  const updateField = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Parse and validate slide, populate fields
  useEffect(() => {
    const rawSlide = {
      id: row.id || "new-slide",
      groupId: row.groupId ?? undefined,
      type: row.type,
      props: row.propsJson || {},
      aidHook: row.aidHook ?? null,
    };

    const result = aiSpeakRepeatSlideSchema.safeParse(rawSlide);

    if (!result.success) {
      // Handle validation errors more gracefully
      let errorMessage = "Validation failed when parsing ai-speak-repeat slide.";
      try {
        if (result.error && typeof result.error.format === 'function') {
          const formatted = result.error.format();
          console.error("Validation error:", formatted);
          // Extract a more helpful error message
          const issues = result.error.issues || [];
          if (issues.length > 0) {
            const firstIssue = issues[0];
            errorMessage = `Validation error: ${firstIssue.path.join('.')} - ${firstIssue.message}`;
          }
        } else {
          console.error("Validation error:", result.error);
          errorMessage = "Invalid slide data. Please check that all required fields are present.";
        }
      } catch (e) {
        console.error("Error formatting validation error:", e, result.error);
        errorMessage = "Invalid slide data. Please check that all required fields are present.";
      }
      
      // For new/incomplete slides, don't show error - just initialize with defaults
      const props = (row.propsJson as any) || {};
      const hasMinimalData = props.title || props.lines;
      
      if (!hasMinimalData) {
        // New slide - initialize with defaults instead of showing error
        const newValues: Record<string, any> = {};
        schema.fields.forEach((field) => {
          if (field.key !== "phrases") {
            newValues[field.key] = props[field.key] ?? "";
          }
        });
        setValues(newValues);
        setPhrasesText("");
        setInnerState({ status: "ready", slide: {
          id: row.id || "new-slide",
          groupId: row.groupId ?? undefined,
          type: "ai-speak-repeat" as const,
          props: {
            title: props.title ?? "",
            subtitle: props.subtitle,
            note: props.note,
            defaultLang: props.defaultLang,
            lines: props.lines || [],
          },
          aidHook: row.aidHook ?? null,
        }});
        return;
      }
      
      setInnerState({
        status: "error",
        message: errorMessage,
      });
      return;
    }

    const slide = result.data;
    const props = (row.propsJson as any) || {};

    // Update values map from slide props (except phrases)
    const newValues: Record<string, any> = {};
    schema.fields.forEach((field) => {
      if (field.key !== "phrases") {
        newValues[field.key] = slide.props[field.key] ?? props[field.key] ?? "";
      }
    });
    setValues(newValues);

    // Flatten lines[][] → textarea (special handling for phrases)
    const flatPhrases = slide.props.lines
      .flat()
      .map((cell) => cell.label)
      .join("\n");
    setPhrasesText(flatPhrases);
    
    // Store initial values for comparison
    const initialMetadata = buildInitialMetadataState(row);
    initialDataRef.current = {
      values: { ...newValues },
      phrasesText: flatPhrases,
      metadata: initialMetadata,
    };

    setInnerState({ status: "ready", slide });
  }, [row.id, JSON.stringify(row.propsJson), JSON.stringify(row.metaJson), row.code, row.isActivity, row.scoreType, row.passingScoreValue, row.maxScoreValue, row.passRequiredForNext, JSON.stringify(schema.fields.map(f => f.key))]); // Reset when slide data changes
  
  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current || innerState.status !== "ready") return false;
    const initial = initialDataRef.current;
    return checkUnsavedChanges(
      initial.values,
      values,
      initial.metadata,
      metadata,
      [{ initial: initial.phrasesText, current: phrasesText }]
    );
  }, [values, phrasesText, metadata, innerState.status]);
  
  // Notify parent of unsaved changes
  useEffect(() => {
    if (onUnsavedChangesChange) {
      onUnsavedChangesChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);

    if (innerState.status !== "ready") return;
    const existingSlide = innerState.slide;

    setSaving(true);
    onSavingChange?.(true);

    try {
      // Validate required fields (label is required for new slides)
      const labelField = schema.fields.find((f) => f.key === "label");
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

      // Turn textarea back into lines[][] (special handling for phrases)
      const phraseList = phrasesText
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const defaultLangValue = values["defaultLang"] || "en";
      const newLines = [
        phraseList.map((label) => ({
          label,
          speech: {
            mode: "tts" as const,
            lang: defaultLangValue,
            text: label,
          },
        })),
      ];

      // Build props from values map (iterate over schema.fields)
      const newProps: any = {
        ...existingSlide.props,
        lines: newLines,
      };
      
      // Add all visible fields from values map
      for (const field of schema.fields) {
        if (field.key !== "phrases") {
          const rawVal = values[field.key];
          const trimmedVal = typeof rawVal === "string" ? rawVal.trim() : rawVal;
          if (trimmedVal === "" || trimmedVal === undefined) {
            continue;
          }
          newProps[field.key] = trimmedVal;
        }
      }

      const rawSlide = {
        id: existingSlide.id,
        groupId: existingSlide.groupId,
        type: existingSlide.type,
        props: newProps,
        aidHook: existingSlide.aidHook ?? null,
      };

      const parsed = aiSpeakRepeatSlideSchema.safeParse(rawSlide);

      if (!parsed.success) {
        console.error(parsed.error.format());
        setSaveMessage("Validation failed — check console.");
        return;
      }

      const validated = parsed.data;

      const trimmedType = slideType.trim();

      // Build meta_json from metadata state
      const metaJson = buildMetaJson(metadata);

      const result = await saveSlide({
        props_json: validated.props,
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

      setInnerState({ status: "ready", slide: validated });
      setSaveMessage("Saved successfully!");
      
      // Update initial data ref after successful save
      initialDataRef.current = {
        values: { ...values },
        phrasesText,
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

  if (innerState.status === "loading") {
    return <p>Validating slide…</p>;
  }

  if (innerState.status === "error") {
    return (
      <CmsSection title="ai-speak-repeat editor error" description={innerState.message} backgroundColor="#e6f1f1" borderColor="#b4d5d5">
        <p style={{ color: uiTokens.color.danger }}>{innerState.message}</p>
      </CmsSection>
    );
  }

  const slide = innerState.slide;

  return (
    <>
      <CmsSection
        title="ai-speak-repeat editor"
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
        description={
          <>
            Editing slide <code className="codeText">{slide.id}</code> in group{" "}
            <code className="codeText">{slide.groupId ?? "none"}</code>
          </>
        }
      >
        <form onSubmit={handleSave}>
          {/* Render ONLY fields from schema.fields - no hardcoded checks, no duplicate rendering */}
          {schema.fields.map((field) => {
            // Special handling for "phrases" field (synthetic field representing lines[][])
            if (field.key === "phrases") {
              return (
                <FormField
                  key={field.key}
                  label={field.label || "Phrases (one per line)"}
                  required={field.required}
                  borderColor="#b4d5d5"
                  infoTooltip={field.helpText}
                >
                  <Textarea
                    value={phrasesText}
                    onChange={(e) => setPhrasesText(e.target.value)}
                    rows={6}
                    style={{ fontFamily: "monospace" }}
                  />
                </FormField>
              );
            }
            
            // Regular field rendering
            const val = (values as any)[field.key] ?? "";
            return (
              <FormField
                key={field.key}
                label={field.label}
                required={field.required}
                borderColor="#b4d5d5"
                infoTooltip={field.helpText}
              >
                {field.uiType === "select" ? (
                  (() => {
                    const options = SELECT_OPTIONS_BY_KEY[field.key];
                    if (!options) {
                      return (
                        <Select value={val} onChange={(e) => updateField(field.key, e.target.value)}>
                          <option value="">(not set)</option>
                        </Select>
                      );
                    }
                    return (
                      <Select value={val} onChange={(e) => updateField(field.key, e.target.value)}>
                        <option value="">(not set)</option>
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    );
                  })()
                ) : field.uiType === "textarea" ? (
                  <Textarea
                    value={val}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    rows={6}
                  />
                ) : (
                  <Input
                    type="text"
                    value={val}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    required={field.required}
                  />
                )}
              </FormField>
            );
          })}
        </form>

        <MissingLabelWarning
          show={row.id && !((values as any)["label"] && typeof (values as any)["label"] === "string" && (values as any)["label"].trim().length > 0)}
          style={{ marginTop: uiTokens.space.md }}
        />

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
