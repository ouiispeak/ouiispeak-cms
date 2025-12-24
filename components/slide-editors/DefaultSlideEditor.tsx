"use client";

import { useEffect, useMemo, useRef, useState, FormEvent, useCallback, CSSProperties } from "react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { uiTokens } from "../../lib/uiTokens";
import { Button } from "../Button";
import AuthoringMetadataSection from "./AuthoringMetadataSection";
import MissingLabelWarning from "./shared/MissingLabelWarning";
import type { SlideEditorProps, AuthoringMetadataState, EditorField } from "./types";
// Removed DEFAULT_SLIDE_FIELDS import - editors must ONLY use schema.fields
import {
  categoriesGrid,
  categoryContainer,
  categoryTitle,
} from "../../lib/styles/slideTypeEditStyles";
import { buildInitialMetadataState, buildMetaJson } from "../../lib/slide-editor-registry/metadataHelpers";
import {
  isSystemFieldKey,
  isMetadataFieldKey,
  isAuthoringMetadataFieldKey,
  isSpecialMetadataFieldKey,
  COPYABLE_SYSTEM_FIELDS,
} from "../../lib/slide-editor-registry/fieldKeys";
import { SELECT_OPTIONS_BY_KEY } from "../../lib/slide-editor-registry/selectOptions";
import { hasUnsavedChanges as checkUnsavedChanges } from "../../lib/slide-editor-registry/useUnsavedChanges";
import { validateRequiredLabel } from "../../lib/slide-editor-registry/validationHelpers";

type FieldValueMap = Record<string, any>;

const isSystemField = (key: string) => isSystemFieldKey(key);
const isMetadataField = (key: string) => isMetadataFieldKey(key);
const isAuthoringMetadataField = (key: string) => isAuthoringMetadataFieldKey(key);
const isSpecialMetadataField = (key: string) => isSpecialMetadataFieldKey(key);

const FIELD_GROUPS = [
  {
    id: "layer1-identity",
    title: "Identity & structure",
    keys: ["slideId", "slideType", "groupId", "orderIndex", "label"],
  },
  {
    id: "layer1-core",
    title: "Core content",
    keys: ["title", "subtitle", "body", "note"],
  },
  {
    id: "layer1-language",
    title: "Language & localization",
    keys: ["defaultLang", "secondaryLang", "translation", "phoneticHint"],
  },
  {
    id: "layer1-media",
    title: "Media references",
    keys: ["imageId", "imageUrl", "audioId", "videoId", "lottieId", "waveformId"],
  },
  {
    id: "layer1-timing",
    title: "Timing & flow",
    keys: ["delayMs", "autoAdvance", "minDuration", "maxDuration"],
  },
  {
    id: "layer1-interaction",
    title: "Interaction flags",
    keys: ["isInteractive", "requiresInput", "allowSkip", "allowRetry", "isActivity"],
  },
  {
    id: "layer1-buttons",
    title: "Buttons & affordances",
    keys: ["buttons"],
  },
  {
    id: "layer1-metadata",
    title: "Authoring metadata",
    keys: [
      "code",
      "slideGoal",
      "activityName",
      "requiresExternalTTS",
      "tags",
      "difficultyHint",
      "reviewWeight",
    ],
  },
  {
    id: "layer1-freeform",
    title: "Freeform / escape hatch",
    keys: ["customProps"],
  },
  {
    id: "layer2-speech",
    title: "Speech & audio interaction",
    keys: ["expectedSpeech", "speechMode", "minConfidence", "showPronunciationHelp", "phrases"],
  },
  {
    id: "layer2-choice",
    title: "Choice & selection",
    keys: ["choices", "correctChoiceIds", "allowMultiple", "shuffleChoices"],
  },
  {
    id: "layer2-sequencing",
    title: "Sequencing & grouping",
    keys: ["items", "groups", "chunks"],
  },
  {
    id: "layer2-matching",
    title: "Matching / mapping",
    keys: ["pairs", "dragTargets", "dropZones"],
  },
  {
    id: "layer2-scoring",
    title: "Scoring hints",
    keys: ["scoreType", "passThreshold", "maxScoreValue", "passRequiredForNext", "showScoreToLearner"],
  },
  {
    id: "layer3-ai",
    title: "AI / agent behavior hints",
    keys: ["aiPrompt", "aiPersona", "aiResponseMode", "aiMemoryKey"],
  },
  {
    id: "layer3-visual",
    title: "Visual behavior hints",
    keys: ["layoutVariant", "emphasisTarget", "highlightMode", "animationPreset"],
  },
  {
    id: "layer3-analytics",
    title: "Analytics & observation",
    keys: ["trackEvents", "eventLabels", "debugNotes"],
  },
] as const;

const groupFieldsForDisplay = (fields: EditorField[]) => {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const used = new Set<string>();

  const grouped = FIELD_GROUPS.map((group) => {
    const groupFields = group.keys
      .map((key) => {
        const field = byKey.get(key);
        if (field) used.add(key);
        return field;
      })
      .filter(Boolean) as EditorField[];
    return { ...group, fields: groupFields };
  }).filter((group) => group.fields.length > 0);

  const remaining = fields.filter((field) => !used.has(field.key));
  if (remaining.length > 0) {
    // Type assertion needed because "layer1-other" is not in the FIELD_GROUPS const array
    grouped.push({ id: "layer1-other" as any, title: "Other" as any, keys: [] as any, fields: remaining });
  }

  return grouped;
};

function buildInitialValues(row: any, fields: EditorField[]): FieldValueMap {
  const props = (row.propsJson as any) || {};

  return fields.reduce((acc, field) => {
    if (isSystemField(field.key) || isMetadataField(field.key)) {
      return acc;
    }
    if (field.key === "body") {
      const bodyValue =
        props.body || (props.bodies && Array.isArray(props.bodies) ? props.bodies.join("\n") : "");
      acc.body = bodyValue || "";
      return acc;
    }
    const rawValue = props[field.key];
    if (field.uiType === "json") {
      acc[field.key] =
        rawValue === undefined || rawValue === null ? "" : JSON.stringify(rawValue, null, 2);
      return acc;
    }
    if (rawValue === undefined || rawValue === null) {
      acc[field.key] = "";
      return acc;
    }
    acc[field.key] = rawValue;
    return acc;
  }, {} as FieldValueMap);
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
  // Use schema.fields as the ONLY source of truth - no DEFAULT_SLIDE_FIELDS
  const [values, setValues] = useState<FieldValueMap>(() => buildInitialValues(row, schema.fields));
  const [metadata, setMetadata] = useState<AuthoringMetadataState>(() => buildInitialMetadataState(row));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copyConfirmation, setCopyConfirmation] = useState<{ message: string; buttonId: string } | null>(null);
  const handleMetadataChange = useCallback((m: AuthoringMetadataState) => setMetadata(m), []);
  const handleAuthoringMetadataChange = useCallback((m: AuthoringMetadataState) => {
    setMetadata((prev) => {
      const next = { ...prev };
      // Update only authoring metadata fields (not special metadata)
      if ("code" in m) next.code = m.code;
      if ("slideGoal" in m) next.slideGoal = m.slideGoal;
      if ("activityName" in m) next.activityName = m.activityName;
      if ("requiresExternalTTS" in m) next.requiresExternalTTS = m.requiresExternalTTS;
      if ("tags" in m) next.tags = m.tags;
      if ("difficultyHint" in m) next.difficultyHint = m.difficultyHint;
      if ("reviewWeight" in m) next.reviewWeight = m.reviewWeight;
      return next;
    });
  }, []);

  const initialDataRef = useRef<{ values: FieldValueMap; metadata: AuthoringMetadataState } | null>(null);

  // Reset when row changes - use schema.fields ONLY
  useEffect(() => {
    const initialValues = buildInitialValues(row, schema.fields);
    const initialMetadata = buildInitialMetadataState(row);
    initialDataRef.current = {
      values: initialValues,
      metadata: initialMetadata,
    };
    setValues(initialValues);
    setMetadata(initialMetadata);
  }, [
    row.id,
    JSON.stringify(row.propsJson),
    JSON.stringify(row.metaJson),
    row.code,
    row.isActivity,
    row.scoreType,
    row.passingScoreValue,
    row.maxScoreValue,
    row.passRequiredForNext,
  ]);

  // Use schema.fields as the ONLY source of truth - no DEFAULT_SLIDE_FIELDS
  const schemaFieldKeys = useMemo(() => new Set(schema.fields.map((f) => f.key)), [schema.fields]);
  // Render ONLY fields from schema.fields - no DEFAULT_SLIDE_FIELDS, no hidden fields list
  const renderedFields = useMemo(() => {
    return schema.fields; // Schema already contains only visible fields (hidden fields filtered by resolver)
  }, [schema.fields]);
  const metadataFields = useMemo(
    () => renderedFields.filter((field) => isMetadataField(field.key)),
    [renderedFields]
  );
  const editableFields = useMemo(
    () => renderedFields.filter((field) => !isMetadataField(field.key) && !isSystemField(field.key)),
    [renderedFields]
  );
  const metadataFieldKeySet = useMemo(
    () => new Set(metadataFields.map((field) => field.key)),
    [metadataFields]
  );
  const authoringMetadataFieldKeySet = useMemo(() => {
    const keys = new Set<string>();
    metadataFields.forEach((field) => {
      if (isAuthoringMetadataField(field.key)) {
        keys.add(field.key);
      }
    });
    return keys;
  }, [metadataFields]);
  const systemFieldValues = useMemo(
    () => ({
      slideId: row.id || "",
      slideType: slideType || row.type || "",
      groupId: groupId ?? row.groupId ?? "",
      orderIndex: orderIndex ?? row.orderIndex ?? "",
    }),
    [groupId, orderIndex, row.groupId, row.id, row.orderIndex, row.type, slideType]
  );
  const isDefaultType = slideType.trim() === "default";
  const groupedRenderedFields = useMemo(
    () => groupFieldsForDisplay(renderedFields),
    [renderedFields]
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current) return false;
    const init = initialDataRef.current;
    return checkUnsavedChanges(init.values, values, init.metadata, metadata);
  }, [values, metadata]);

  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  const updateField = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };
  const updateMetadata = (next: Partial<AuthoringMetadataState>) => {
    setMetadata((prev) => ({ ...prev, ...next }));
  };
  const copyToClipboard = async (text: string, label: string, buttonId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyConfirmation({ message: `${label} copied!`, buttonId });
      setTimeout(() => setCopyConfirmation(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };
  const parseCommaList = (input: string) =>
    input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);
    setSaving(true);
    onSavingChange?.(true);

    try {
      // Validate required fields (label is required for new slides)
      const isNewSlide = !row.id; // New slides don't have an id yet
      const labelError = validateRequiredLabel({
        isNewSlide,
        schemaFields: editableFields,
        values,
      });
      if (labelError) {
        setSaveMessage(labelError);
        setSaving(false);
        onSavingChange?.(false);
        return;
      }

      const currentProps = { ...(row.propsJson as any) };
      let jsonError: string | null = null;
      for (const field of editableFields) {
        const rawVal = values[field.key];
        const trimmedVal = typeof rawVal === "string" ? rawVal.trim() : rawVal;

        // Don't delete required fields, but allow empty for backward compatibility on existing slides
        if (field.required && field.key === "label") {
          // label is required - already validated above, so ensure it's set
          if (trimmedVal) {
            currentProps[field.key] = trimmedVal;
          }
          continue;
        }

        if (trimmedVal === "" || trimmedVal === undefined) {
          delete currentProps[field.key];
          continue;
        }

        if (field.uiType === "json") {
          try {
            currentProps[field.key] = JSON.parse(trimmedVal);
          } catch (err) {
            jsonError = `Invalid JSON in ${field.label}`;
            break;
          }
          continue;
        }

        currentProps[field.key] = trimmedVal;
      }

      if (jsonError) {
        setSaveMessage(jsonError);
        return;
      }

      // Build meta_json from metadata state
      const metaJson = buildMetaJson(metadata);

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

  const renderFieldInput = (fieldKey: string, uiType: string, inputStyle?: CSSProperties) => {
    const val = (values as any)[fieldKey] ?? "";
    switch (uiType) {
      case "text":
        return <Input type="text" value={val} onChange={(e) => updateField(fieldKey, e.target.value)} style={inputStyle} />;
      case "textarea":
        return <Textarea value={val} onChange={(e) => updateField(fieldKey, e.target.value)} rows={4} style={inputStyle} />;
      case "json":
        return (
          <Textarea
            value={val}
            onChange={(e) => updateField(fieldKey, e.target.value)}
            rows={6}
            style={{ fontFamily: "monospace", fontSize: uiTokens.font.code.size, ...inputStyle }}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={val ?? ""}
            onChange={(e) => updateField(fieldKey, e.target.value === "" ? "" : Number(e.target.value))}
            style={inputStyle}
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
      case "select": {
        const options = SELECT_OPTIONS_BY_KEY[fieldKey];
        if (!options) {
          return <Input type="text" value={val} onChange={(e) => updateField(fieldKey, e.target.value)} style={inputStyle} />;
        }
        return (
          <Select value={val ?? ""} onChange={(e) => updateField(fieldKey, e.target.value)} style={inputStyle}>
            <option value="">(not set)</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      }
      case "metadata":
        return (
          <AuthoringMetadataSection row={row} slideType={slideType} onMetadataChange={handleMetadataChange} />
        );
      default:
        return <Input type="text" value={val} onChange={(e) => updateField(fieldKey, e.target.value)} style={inputStyle} />;
    }
  };

  const renderSpecialMetadataField = (field: EditorField) => {
    switch (field.key) {
      case "buttons":
        return (
          <Input
            type="text"
            value={metadata.buttons.join(", ")}
            onChange={(e) => updateMetadata({ buttons: parseCommaList(e.target.value) })}
            placeholder="e.g., next, replay, hint"
          />
        );
      case "isActivity":
        return (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={metadata.isActivity}
              onChange={(e) => updateMetadata({ isActivity: e.target.checked })}
            />
            <span>Enabled</span>
          </label>
        );
      case "scoreType":
        return (
          <Select value={metadata.scoreType} onChange={(e) => updateMetadata({ scoreType: e.target.value })}>
            {SELECT_OPTIONS_BY_KEY.scoreType.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      case "passThreshold":
        return (
          <Input
            type="number"
            value={metadata.passingScoreValue ?? ""}
            onChange={(e) =>
              updateMetadata({
                passingScoreValue: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="Optional"
          />
        );
      case "maxScoreValue":
        return (
          <Input
            type="number"
            value={metadata.maxScoreValue ?? ""}
            onChange={(e) =>
              updateMetadata({
                maxScoreValue: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="Optional"
          />
        );
      case "passRequiredForNext":
        return (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={metadata.passRequiredForNext}
              onChange={(e) => updateMetadata({ passRequiredForNext: e.target.checked })}
            />
            <span>Enabled</span>
          </label>
        );
      case "showScoreToLearner":
        return (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={metadata.showScoreToLearner}
              onChange={(e) => updateMetadata({ showScoreToLearner: e.target.checked })}
            />
            <span>Enabled</span>
          </label>
        );
      default:
        return null;
    }
  };

  const renderSystemField = (field: EditorField) => {
    const rawValue = (systemFieldValues as Record<string, any>)[field.key];
    const value = rawValue === null || rawValue === undefined ? "" : String(rawValue);
    const canCopy = COPYABLE_SYSTEM_FIELDS.has(field.key) && value;
    const buttonId = `copy-${field.key}`;
    const labelText = typeof field.label === "string" ? field.label : "Value";
    const inputType = field.key === "orderIndex" ? "number" : "text";

    return (
      <FormField
        key={field.key}
        label={field.label}
        required={field.required}
        borderColor="#b4d5d5"
        infoTooltip={field.helpText}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Input
            type={inputType}
            value={value}
            disabled
            readOnly
            borderColor="#b4d5d5"
            style={canCopy ? { paddingRight: "32px" } : undefined}
          />
          {canCopy && (
            <>
              {copyConfirmation && copyConfirmation.buttonId === buttonId && (
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
                id={buttonId}
                title={`Copy ${labelText}`}
                onClick={() => copyToClipboard(value, labelText, buttonId)}
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
            </>
          )}
        </div>
      </FormField>
    );
  };

  const hasMetadataFields = metadataFields.length > 0;
  const visibleFieldItems = editableFields;

  // Check if label is missing (for backward compatibility warning)
  const labelValue = values["label"];
  const hasLabel = labelValue && typeof labelValue === "string" && labelValue.trim().length > 0;
  const isExistingSlide = !!row.id;

  return (
    <form onSubmit={handleSave} style={{ display: "grid", gap: uiTokens.space.lg }}>
      <MissingLabelWarning show={isExistingSlide && !hasLabel} />
      {/* Always use grouped/categorized view for consistency across all slide types */}
      <div style={categoriesGrid}>
        {groupedRenderedFields.map((group) => {
          const groupSystemFields = group.fields.filter((field) => isSystemField(field.key));
          const groupEditableFields = group.fields.filter(
            (field) => !isMetadataField(field.key) && !isSystemField(field.key)
          );
          const groupSpecialFields = group.fields.filter((field) => isSpecialMetadataField(field.key));
          const groupHasMetadataSection = group.fields.some((field) => isAuthoringMetadataField(field.key));

          if (
            groupSystemFields.length === 0 &&
            groupEditableFields.length === 0 &&
            groupSpecialFields.length === 0 &&
            !groupHasMetadataSection
          ) {
            return null;
          }

          return (
            <div
              key={group.id}
              style={{
                ...categoryContainer,
                padding: uiTokens.space.sm,
                border: `1px solid ${uiTokens.color.border}`,
                borderRadius: uiTokens.radius.md,
                backgroundColor: "#e6f1f1",
              }}
            >
              {(groupSystemFields.length > 0 ||
                groupEditableFields.length > 0 ||
                groupSpecialFields.length > 0 ||
                groupHasMetadataSection) && (
                <div style={categoryTitle}>{group.title}</div>
              )}
              <div style={{ display: "grid", gap: uiTokens.space.sm }}>
                {groupSystemFields.map((field) => renderSystemField(field))}
                {groupEditableFields.map((field) => (
                  <FormField key={field.key} label={field.label} required={field.required} borderColor="#b4d5d5" infoTooltip={field.helpText}>
                    {renderFieldInput(field.key, field.uiType)}
                  </FormField>
                ))}
                {groupSpecialFields.map((field) => (
                  <FormField key={field.key} label={field.label} required={field.required} borderColor="#b4d5d5" infoTooltip={field.helpText}>
                    {renderSpecialMetadataField(field)}
                  </FormField>
                ))}
                {groupHasMetadataSection && authoringMetadataFieldKeySet.size > 0 && (
                  <AuthoringMetadataSection
                    row={row}
                    slideType={slideType}
                    onMetadataChange={handleAuthoringMetadataChange}
                    visibleFieldKeys={authoringMetadataFieldKeySet}
                    variant="inline"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Removed hidden fields section - schema.fields already contains only visible fields (filtered by resolver) */}

      {saveMessage && (
        <p style={{ margin: 0, color: saveMessage.includes("error") ? uiTokens.color.danger : uiTokens.color.text }}>
          {saveMessage}
        </p>
      )}
    </form>
  );
}
