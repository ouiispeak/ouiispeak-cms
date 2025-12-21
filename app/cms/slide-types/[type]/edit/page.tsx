"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CmsPageShell from "../../../../../components/cms/CmsPageShell";
import CmsSection from "../../../../../components/ui/CmsSection";
import { uiTokens } from "../../../../../lib/uiTokens";
import { DEFAULT_SLIDE_FIELDS } from "../../../../../lib/slide-editor-registry/defaultFields";
import { getPresetForType, serializePreset, type SlideTypePreset } from "../../../../../lib/slide-editor-registry/presets";
import { getSlideEditorDefinition } from "../../../../../lib/slide-editor-registry";
import SlideTypesBackLink from "./backlink";
import DefaultSlideEditor from "../../../../../components/slide-editors/DefaultSlideEditor";
import type { Slide } from "../../../../../lib/domain/slide";
import { getVisibleSchemaForType } from "../../../../../lib/slide-editor-registry";

export default function EditSlideTypePresetPage() {
  const params = useParams<{ type: string }>();
  const slideType = params?.type ?? "default";
  const preset = getPresetForType(slideType);

  const [hiddenKeys, setHiddenKeys] = useState<string[]>(preset.hiddenFieldKeys);
  const [previewSlide] = useState<Slide>(() => ({
    id: "preview-slide",
    lessonId: null,
    groupId: null,
    orderIndex: 1,
    type: slideType,
    propsJson: {},
    aidHook: null,
    code: null,
    metaJson: {},
    isActivity: false,
    scoreType: "none",
    passingScoreValue: null,
    maxScoreValue: null,
    passRequiredForNext: false,
  }));
  const [previewProps, setPreviewProps] = useState<Record<string, any>>({});

  const visibleFields = useMemo(
    () => DEFAULT_SLIDE_FIELDS.filter((f) => !hiddenKeys.includes(f.key)),
    [hiddenKeys]
  );
  const hiddenFields = useMemo(
    () => DEFAULT_SLIDE_FIELDS.filter((f) => hiddenKeys.includes(f.key)),
    [hiddenKeys]
  );

  const toggleHide = (key: string, hide: boolean) => {
    setHiddenKeys((prev) => {
      if (hide) {
        if (prev.includes(key)) return prev;
        return [...prev, key];
      }
      return prev.filter((k) => k !== key);
    });
  };

  const exportJson = useMemo((): string => {
    const nextPreset: SlideTypePreset = { hiddenFieldKeys: hiddenKeys };
    return serializePreset(slideType, nextPreset);
  }, [hiddenKeys, slideType]);

  const typeLabel =
    getSlideEditorDefinition(slideType)?.label || slideType;

  const previewSchema = useMemo(() => ({ fields: visibleFields }), [visibleFields]);

  return (
    <CmsPageShell title={`Slide type preset: ${typeLabel}`}>
      <div style={{ fontSize: 13, color: uiTokens.color.textMuted, marginBottom: uiTokens.space.sm, display: "flex", alignItems: "center", gap: uiTokens.space.xs }}>
        <Link href="/cms/slide-types" style={{ color: uiTokens.color.focus, textDecoration: "underline" }}>
          Slide Types
        </Link>
        <span style={{ color: uiTokens.color.textMuted }}>/</span>
        <span>{typeLabel}</span>
      </div>
      <div style={{ marginBottom: uiTokens.space.sm }}>
        <SlideTypesBackLink />
      </div>
      <CmsSection
        title="Field visibility"
        description="Hide fields to declutter the editor. Hidden fields stay saved; they are just not shown in the UI."
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: uiTokens.space.lg }}>
          <div>
            <h3 style={{ marginBottom: uiTokens.space.sm }}>Visible fields</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: uiTokens.space.sm }}>
              {visibleFields.map((field) => (
                <li
                  key={field.key}
                  style={{
                    padding: uiTokens.space.sm,
                    border: `1px solid ${uiTokens.color.border}`,
                    borderRadius: uiTokens.radius.md,
                    backgroundColor: uiTokens.color.bgAlt,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{field.label}</div>
                    {field.helpText && (
                      <div className="metaText" style={{ color: uiTokens.color.textMuted }}>
                        {field.helpText}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleHide(field.key, true)}
                    style={{
                      border: "1px solid #bf1736",
                      background: "#bf1736",
                      color: uiTokens.color.textOnDark,
                      borderRadius: uiTokens.radius.sm,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    Hide
                  </button>
                </li>
              ))}
              {visibleFields.length === 0 && (
                <li className="metaText" style={{ color: uiTokens.color.textMuted }}>
                  No visible fields.
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 style={{ marginBottom: uiTokens.space.sm }}>Hidden fields</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: uiTokens.space.sm }}>
              {hiddenFields.map((field) => (
                <li
                  key={field.key}
                  style={{
                    padding: uiTokens.space.sm,
                    border: `1px dashed ${uiTokens.color.border}`,
                    borderRadius: uiTokens.radius.md,
                    backgroundColor: uiTokens.color.surface,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: 0.8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{field.label}</div>
                    {field.helpText && (
                      <div className="metaText" style={{ color: uiTokens.color.textMuted }}>
                        {field.helpText}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleHide(field.key, false)}
                    style={{
                      border: `1px solid ${uiTokens.color.primary}`,
                      background: uiTokens.color.primary,
                      color: uiTokens.color.textOnDark,
                      borderRadius: uiTokens.radius.sm,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    Show
                  </button>
                </li>
              ))}
              {hiddenFields.length === 0 && (
                <li className="metaText" style={{ color: uiTokens.color.textMuted }}>
                  No hidden fields.
                </li>
              )}
            </ul>
          </div>
        </div>
      </CmsSection>

      <CmsSection
        title="Preset JSON (copy/paste back into code)"
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
        description="Copy this snippet into lib/slide-editor-registry/presets.ts to persist."
      >
        <textarea
          value={exportJson}
          readOnly
          style={{
            width: "100%",
            minHeight: 180,
            padding: uiTokens.space.sm,
            borderRadius: uiTokens.radius.md,
            border: `1px solid ${uiTokens.color.border}`,
            fontFamily: "monospace",
            fontSize: 13,
            backgroundColor: uiTokens.color.surface,
          }}
        />
      </CmsSection>

      <CmsSection
        title="Live preview"
        description="Preview only — does not save to Supabase."
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
      >
        <DefaultSlideEditor
          row={{ ...previewSlide, propsJson: previewProps }}
          orderIndex={1}
          groupId={null}
          slideType={slideType}
          schema={previewSchema}
          onSaveSuccess={() => {}}
          saveSlide={async () => ({ success: true })}
          onUnsavedChangesChange={() => {}}
          onSavingChange={() => {}}
        />
      </CmsSection>
    </CmsPageShell>
  );
}
