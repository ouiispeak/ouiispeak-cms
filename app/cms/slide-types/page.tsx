"use client";

import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsSection from "../../../components/ui/CmsSection";
import { uiTokens } from "../../../lib/uiTokens";
import {
  getSlideEditorDefinition,
  listSlideEditorDefinitions,
} from "../../../lib/slide-editor-registry";
import type { EditorField } from "../../../lib/slide-editor-registry/types";

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

  return (
    <CmsPageShell title="Slide type registry">
      <CmsSection
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
        title="Registry overview"
        description="Registered slide types and the editors that handle them. Add new types to the registry to plug in custom authoring experiences without touching this page."
      >
        <p style={{ marginBottom: uiTokens.space.sm }}>
          {editors.length} slide types are currently registered. Unknown types fall back to the default raw JSON editor so existing content stays editable.
        </p>
      </CmsSection>

      <CmsSection
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
        title="Registered slide types"
        description="Each entry resolves to an editor component and a simple field schema for UI metadata."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: uiTokens.space.md,
          }}
        >
          {editors.map((editor) => (
            <div
              key={editor.type}
              style={{
                border: `1px solid ${uiTokens.color.border}`,
                borderRadius: uiTokens.radius.lg,
                padding: uiTokens.space.md,
                backgroundColor: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{editor.label}</div>
                  <div className="metaText" style={{ color: uiTokens.color.textMuted }}>
                    type id: <code className="codeText">{editor.type}</code>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: uiTokens.space.sm }}>
                <div style={{ fontWeight: 500, marginBottom: uiTokens.space.xs }}>Schema fields</div>
                {fieldList(editor.schema.fields)}
              </div>
            </div>
          ))}
        </div>
      </CmsSection>

      <CmsSection
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
        title="Fallback editor"
        description="Used when a slide type is not yet registered. Mirrors the current raw JSON workflow."
      >
        <div
          style={{
            border: `1px solid ${uiTokens.color.border}`,
            borderRadius: uiTokens.radius.lg,
            padding: uiTokens.space.md,
            backgroundColor: "#fff",
            maxWidth: 520,
          }}
        >
          <div style={{ fontWeight: 600 }}>{fallbackEditor.label}</div>
          <div className="metaText" style={{ color: uiTokens.color.textMuted }}>
            type id: <code className="codeText">{fallbackEditor.type}</code>
          </div>
          <div style={{ marginTop: uiTokens.space.sm }}>
            {fieldList(fallbackEditor.schema.fields)}
          </div>
        </div>
      </CmsSection>
    </CmsPageShell>
  );
}
