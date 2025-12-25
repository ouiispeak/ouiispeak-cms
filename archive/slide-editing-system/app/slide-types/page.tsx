"use client";

import { useState, useEffect } from "react";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsSection from "../../../components/ui/CmsSection";
import { uiTokens } from "../../../lib/uiTokens";
import {
  getSlideEditorDefinition,
  listSlideEditorDefinitions,
  getVisibleSchemaForType,
} from "../../../lib/slide-editor-registry";
import type { EditorField, EditorSchema } from "../../../lib/slide-editor-registry/types";
import LinkButton from "../../../components/ui/LinkButton";

const fieldList = (fields: EditorField[]) => (
  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
    {fields.map((field) => (
      <li key={field.key} style={{ marginBottom: uiTokens.space.xs }}>
        <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
          <strong>{field.label}</strong>
          <span style={{ color: uiTokens.color.textMuted, fontSize: uiTokens.font.meta.size }}>
            {field.uiType}
            {field.required ? " • required" : ""}
          </span>
        </div>
        {field.helpText && (
          <div className="metaText" style={{ marginTop: 2 }}>
            {field.helpText}
          </div>
        )}
      </li>
    ))}
  </ul>
);

export default function SlideTypesPage() {
  const editors = listSlideEditorDefinitions();
  const fallbackEditor = getSlideEditorDefinition(null);
  const [fallbackSchema, setFallbackSchema] = useState<EditorSchema | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load schema after hydration to avoid SSR/client mismatch
  useEffect(() => {
    setIsHydrated(true);
    setFallbackSchema(getVisibleSchemaForType(null));
  }, []);

  return (
    <CmsPageShell title="Slide type registry">
      <CmsSection
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
        title="Registry overview"
        description="Registered slide types and the editors that handle them. Add new types to the registry to plug in custom authoring experiences without touching this page."
      >
        <p
          style={{
            marginBottom: uiTokens.space.sm,
            fontSize: uiTokens.font.meta.size,
            fontWeight: uiTokens.font.meta.weight,
            color: uiTokens.color.mutedText,
          }}
        >
          {editors.length} slide types are currently registered. Unknown types fall back to the default raw JSON editor so existing content stays editable.
        </p>
      </CmsSection>

      <CmsSection
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
        title="Registered slide types"
        description="Each entry resolves to an editor component and a simple field schema for UI metadata."
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {editors.map((editor) => (
            <li
              key={editor.type}
              style={{
                padding: uiTokens.space.md,
                border: `1px solid ${uiTokens.color.border}`,
                borderRadius: uiTokens.radius.md,
                marginBottom: uiTokens.space.md,
                backgroundColor: uiTokens.color.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: uiTokens.space.md,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{editor.label}</div>
                <div className="metaText" style={{ color: uiTokens.color.textMuted }}>
                  {editor.type}
                </div>
              </div>
              <LinkButton
                href={`/cms/slide-types/${editor.type}/edit`}
                size="sm"
                style={{
                  color: "#e6f1f1",
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
                aria-label={`Edit preset for ${editor.label}`}
                title="Edit preset"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#e6f1f1"
                  style={{ width: 16, height: 16 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#e6f1f1"
                  style={{ width: 16, height: 16 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </LinkButton>
            </li>
          ))}
        </ul>
      </CmsSection>

      <CmsSection
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
        title="Fallback editor"
        description="Used when a slide type is not yet registered. Mirrors the current raw JSON workflow."
      >
        <div
          style={{
            border: `1px solid ${uiTokens.color.border}`,
            borderRadius: uiTokens.radius.lg,
            padding: uiTokens.space.md,
            backgroundColor: uiTokens.color.bg,
            maxWidth: 520,
          }}
        >
          <div style={{ fontWeight: 600 }}>{fallbackEditor.label}</div>
          <div className="metaText" style={{ color: uiTokens.color.textMuted }}>
            type id: <code className="codeText">{fallbackEditor.type}</code>
          </div>
          {isHydrated && fallbackSchema ? (
            <div style={{ marginTop: uiTokens.space.sm }}>
              {fieldList(fallbackSchema.fields)}
            </div>
          ) : (
            <div style={{ marginTop: uiTokens.space.sm, color: uiTokens.color.textMuted }}>
              Loading fields...
            </div>
          )}
        </div>
      </CmsSection>
    </CmsPageShell>
  );
}
