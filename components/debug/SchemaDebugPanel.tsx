"use client";

import { useMemo } from "react";
import { uiTokens } from "../../lib/uiTokens";
import {
  resolveSlideTypeVisibility,
  getDefaultPresetsConfig,
} from "../../lib/slide-editor-registry/resolver";
import { getPresetsConfigForEditor } from "../../lib/slide-editor-registry/presets";
import { DEFAULT_SLIDE_FIELDS } from "../../lib/slide-editor-registry/defaultFields";
import { getVisibleSchemaForType } from "../../lib/slide-editor-registry";
import { getSlideEditorDefinition } from "../../lib/slide-editor-registry";

type SchemaDebugPanelProps = {
  typeKey: string;
  schemaSource: "visibleSchema" | "editorDefinition.schema" | "other";
  actualSchema: { fields: Array<{ key: string }> };
};

export function SchemaDebugPanel({
  typeKey,
  schemaSource,
  actualSchema,
}: SchemaDebugPanelProps) {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const visibility = useMemo(() => {
    const config = getPresetsConfigForEditor();
    return resolveSlideTypeVisibility(typeKey, DEFAULT_SLIDE_FIELDS, config);
  }, [typeKey]);

  const visibleSchema = useMemo(() => {
    return getVisibleSchemaForType(typeKey);
  }, [typeKey]);

  const editorDefinition = useMemo(() => {
    return getSlideEditorDefinition(typeKey);
  }, [typeKey]);

  const visibleKeysArray = Array.from(visibility.visibleKeys).slice(0, 50);
  const schemaFieldKeys = actualSchema.fields.map((f) => f.key);
  const leakedFields = schemaFieldKeys.filter((key) => !visibility.visibleKeys.has(key));

  return (
    <details
      style={{
        marginTop: uiTokens.space.lg,
        padding: uiTokens.space.md,
        backgroundColor: "#f8f0ed",
        border: `1px solid ${uiTokens.color.border}`,
        borderRadius: uiTokens.radius.md,
        fontSize: 12,
        fontFamily: "monospace",
      }}
    >
      <summary style={{ cursor: "pointer", fontWeight: 600, marginBottom: uiTokens.space.sm }}>
        [DEV] Schema Debug Panel
      </summary>
      <div style={{ display: "grid", gap: uiTokens.space.sm, marginTop: uiTokens.space.sm }}>
        <div>
          <strong>typeKey:</strong> {typeKey}
        </div>
        <div>
          <strong>schemaSource:</strong> {schemaSource}
        </div>
        <div>
          <strong>defaultHiddenKeys ({visibility.defaultHiddenKeys.size}):</strong>{" "}
          {Array.from(visibility.defaultHiddenKeys).slice(0, 20).join(", ")}
          {visibility.defaultHiddenKeys.size > 20 && " ..."}
        </div>
        <div>
          <strong>typeHiddenKeys ({visibility.typeHiddenKeys.size}):</strong>{" "}
          {Array.from(visibility.typeHiddenKeys).slice(0, 20).join(", ")}
          {visibility.typeHiddenKeys.size > 20 && " ..."}
        </div>
        <div>
          <strong>resolved visibleKeys ({visibility.visibleKeys.size}):</strong>{" "}
          {visibleKeysArray.join(", ")}
          {visibility.visibleKeys.size > 50 && " ..."}
        </div>
        <div>
          <strong>visibleSchema.fields ({visibleSchema.fields.length}):</strong>{" "}
          {visibleSchema.fields.map((f) => f.key).join(", ")}
        </div>
        <div>
          <strong>editorDefinition.schema.fields ({editorDefinition.schema.fields.length}):</strong>{" "}
          {editorDefinition.schema.fields.map((f) => f.key).join(", ")}
        </div>
        <div>
          <strong>actualSchema.fields passed to DefaultSlideEditor ({actualSchema.fields.length}):</strong>{" "}
          {schemaFieldKeys.join(", ")}
        </div>
        {leakedFields.length > 0 && (
          <div style={{ color: uiTokens.color.danger, fontWeight: 600 }}>
            <strong>⚠️ LEAKED FIELDS ({leakedFields.length}):</strong> {leakedFields.join(", ")}
          </div>
        )}
        {leakedFields.length === 0 && (
          <div style={{ color: "#0a7c3a", fontWeight: 600 }}>✅ No leaked fields detected</div>
        )}
      </div>
    </details>
  );
}

