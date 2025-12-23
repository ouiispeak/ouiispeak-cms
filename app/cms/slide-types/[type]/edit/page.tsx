"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CmsPageShell from "../../../../../components/cms/CmsPageShell";
import CmsSection from "../../../../../components/ui/CmsSection";
import { uiTokens } from "../../../../../lib/uiTokens";
import { DEFAULT_SLIDE_FIELDS } from "../../../../../lib/slide-editor-registry/defaultFields";
import type { EditorField } from "../../../../../lib/slide-editor-registry/types";
import {
  getPresetsConfigForEditor,
  serializePresetConfig,
  type SlideTypePreset,
} from "../../../../../lib/slide-editor-registry/presets";
import { getSlideEditorDefinition } from "../../../../../lib/slide-editor-registry";
import DefaultSlideEditor from "../../../../../components/slide-editors/DefaultSlideEditor";
import type { Slide } from "../../../../../lib/domain/slide";
import {
  resolveSlideTypeVisibility,
  type SlideTypePresetsConfig,
  getDefaultPresetsConfig,
} from "../../../../../lib/slide-editor-registry/resolver";
import {
  loadPresetsFromStorage,
  savePresetsToStorage,
  clearPresetsFromStorage,
} from "../../../../../lib/slide-editor-registry/presetStorage";
import { Button } from "../../../../../components/Button";
import {
  breadcrumbContainer,
  breadcrumbLink,
  breadcrumbSeparator,
  breadcrumbCurrent,
  fieldVisibilitySection,
  twoColumnGrid,
  columnContainer,
  columnTitle,
  categoriesGrid,
  categoryContainer,
  categoryTitle,
  fieldList,
  visibleFieldItem,
  hiddenFieldItem,
  fieldLabel,
  fieldHelpText,
  hideButton,
  showButton,
  buttonIcon,
  emptyState,
  presetJsonSection,
  presetTextarea,
  livePreviewSection,
} from "../../../../../lib/styles/slideTypeEditStyles";

const FIELD_GROUPS = [
  {
    id: "layer1-identity",
    title: "Identity & structure",
    keys: ["slideId", "slideType", "groupId", "orderIndex"],
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

  const grouped: Array<{ id: string; title: string; keys: readonly string[]; fields: EditorField[] }> = FIELD_GROUPS.map((group) => {
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
    grouped.push({ id: "other", title: "Other", keys: [], fields: remaining });
  }

  return grouped;
};

export default function EditSlideTypePresetPage() {
  const params = useParams<{ type: string }>();
  const slideType = params?.type ?? "default";
  const normalizedType = slideType.trim() || "default";
  const isDefaultType = normalizedType === "default";

  // Start with default config to avoid hydration mismatch
  // Load from localStorage after mount
  const [presetsConfig, setPresetsConfig] = useState<SlideTypePresetsConfig>(() =>
    getDefaultPresetsConfig()
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const stored = loadPresetsFromStorage();
    setPresetsConfig(stored);
    setIsHydrated(true);
  }, []);

  // Resolve visibility using the resolver
  const visibility = useMemo(
    () => resolveSlideTypeVisibility(normalizedType, DEFAULT_SLIDE_FIELDS, presetsConfig),
    [normalizedType, presetsConfig]
  );

  // Get current type-specific hidden keys (excluding default-hidden)
  const typeSpecificHiddenKeys = useMemo(() => {
    if (isDefaultType) {
      return Array.from(visibility.hiddenKeys);
    }
    return Array.from(visibility.typeHiddenKeys);
  }, [isDefaultType, visibility]);

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

  // Compute visible/hidden fields using resolver output
  const visibleFields = useMemo(
    () => DEFAULT_SLIDE_FIELDS.filter((f) => visibility.visibleKeys.has(f.key)),
    [visibility.visibleKeys]
  );
  const hiddenFields = useMemo(
    () => DEFAULT_SLIDE_FIELDS.filter((f) => visibility.hiddenKeys.has(f.key)),
    [visibility.hiddenKeys]
  );

  // Separate fields that are hidden by default vs type-specific
  const defaultHiddenFields = useMemo(
    () => DEFAULT_SLIDE_FIELDS.filter((f) => visibility.defaultHiddenKeys.has(f.key)),
    [visibility.defaultHiddenKeys]
  );
  const typeSpecificHiddenFields = useMemo(
    () => DEFAULT_SLIDE_FIELDS.filter((f) => visibility.typeHiddenKeys.has(f.key)),
    [visibility.typeHiddenKeys]
  );

  const visibleGroups = useMemo(() => groupFieldsForDisplay(visibleFields), [visibleFields]);
  const hiddenGroups = useMemo(() => groupFieldsForDisplay(hiddenFields), [hiddenFields]);
  const defaultHiddenGroups = useMemo(
    () => groupFieldsForDisplay(defaultHiddenFields),
    [defaultHiddenFields]
  );
  const typeSpecificHiddenGroups = useMemo(
    () => groupFieldsForDisplay(typeSpecificHiddenFields),
    [typeSpecificHiddenFields]
  );

  const toggleHide = (key: string, hide: boolean) => {
    setPresetsConfig((prev) => {
      const next = { ...prev, presets: { ...prev.presets } };

      if (isDefaultType) {
        // For default type, update default preset
        const defaultPreset = next.presets.default || { hiddenFieldKeys: [] };
        const hiddenSet = new Set(defaultPreset.hiddenFieldKeys);
        if (hide) {
          hiddenSet.add(key);
        } else {
          hiddenSet.delete(key);
        }
        next.presets.default = { hiddenFieldKeys: Array.from(hiddenSet) };
      } else {
        // For non-default types, update type-specific preset
        // But cannot unhide fields hidden by default
        if (!hide && visibility.defaultHiddenKeys.has(key)) {
          // Cannot unhide default-hidden fields
          return prev;
        }

        const typePreset = next.presets[normalizedType] || { hiddenFieldKeys: [] };
        const hiddenSet = new Set(typePreset.hiddenFieldKeys);
        if (hide) {
          hiddenSet.add(key);
        } else {
          hiddenSet.delete(key);
        }
        next.presets[normalizedType] = { hiddenFieldKeys: Array.from(hiddenSet) };
      }

      // Save to localStorage immediately
      savePresetsToStorage(next);
      return next;
    });
  };

  const handleReset = () => {
    clearPresetsFromStorage();
    setPresetsConfig(loadPresetsFromStorage());
  };

  const exportJson = useMemo((): string => {
    return serializePresetConfig(presetsConfig);
  }, [presetsConfig]);

  const typeLabel = getSlideEditorDefinition(slideType)?.label || slideType;

  const previewSchema = useMemo(() => ({ fields: visibleFields }), [visibleFields]);

  return (
    <CmsPageShell title={`Slide type preset: ${typeLabel}`}>
      <div style={breadcrumbContainer}>
        <Link href="/cms/slide-types" style={breadcrumbLink}>
          Slide Types
        </Link>
        <span style={breadcrumbSeparator}>/</span>
        <span style={breadcrumbCurrent}>{typeLabel}</span>
      </div>
      <CmsSection
        title="Field visibility"
        description={
          isDefaultType
            ? "Hide fields to declutter the editor. Hidden fields stay saved; they are just not shown in the UI."
            : "Hide fields to declutter the editor. Fields hidden in the default preset cannot be shown here. Hidden fields stay saved; they are just not shown in the UI."
        }
        backgroundColor={fieldVisibilitySection.backgroundColor}
        borderColor={fieldVisibilitySection.borderColor}
        headerSpacing={fieldVisibilitySection.headerSpacing}
        actions={
          <Button type="button" size="sm" onClick={handleReset}>
            Reset to code defaults
          </Button>
        }
      >
        <div style={twoColumnGrid}>
          <div style={columnContainer}>
            <h3 style={columnTitle}>Visible fields</h3>
            {isDefaultType ? (
              <div style={categoriesGrid}>
                {visibleGroups.map((group) => (
                  <div key={group.id} style={categoryContainer}>
                    <div style={categoryTitle}>{group.title}</div>
                    <ul style={fieldList}>
                      {group.fields.map((field) => (
                        <li key={field.key} style={visibleFieldItem}>
                          <div>
                            <div style={fieldLabel}>{field.label}</div>
                            {field.helpText && (
                              <div className="metaText" style={fieldHelpText}>
                                {field.helpText}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleHide(field.key, true)}
                            aria-label={`Hide ${field.label}`}
                            style={hideButton}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              style={buttonIcon}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {visibleFields.length === 0 && (
                  <div className="metaText" style={emptyState}>
                    No visible fields.
                  </div>
                )}
              </div>
            ) : (
              <ul style={fieldList}>
                {visibleFields.map((field) => (
                  <li key={field.key} style={visibleFieldItem}>
                    <div>
                      <div style={fieldLabel}>{field.label}</div>
                      {field.helpText && (
                        <div className="metaText" style={fieldHelpText}>
                          {field.helpText}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleHide(field.key, true)}
                      aria-label={`Hide ${field.label}`}
                      style={hideButton}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        style={buttonIcon}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                    </button>
                  </li>
                ))}
                {visibleFields.length === 0 && (
                  <li className="metaText" style={emptyState}>
                    No visible fields.
                  </li>
                )}
              </ul>
            )}
          </div>

          <div style={columnContainer}>
            <h3 style={columnTitle}>Hidden fields</h3>
            {isDefaultType ? (
              <div style={categoriesGrid}>
                {hiddenGroups.map((group) => (
                  <div key={group.id} style={categoryContainer}>
                    <div style={categoryTitle}>{group.title}</div>
                    <ul style={fieldList}>
                      {group.fields.map((field) => (
                        <li key={field.key} style={hiddenFieldItem}>
                          <div>
                            <div style={fieldLabel}>{field.label}</div>
                            {field.helpText && (
                              <div className="metaText" style={fieldHelpText}>
                                {field.helpText}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleHide(field.key, false)}
                            aria-label={`Show ${field.label}`}
                            style={showButton}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              style={buttonIcon}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {hiddenFields.length === 0 && (
                  <div className="metaText" style={emptyState}>
                    No hidden fields.
                  </div>
                )}
              </div>
            ) : (
              <div style={categoriesGrid}>
                {/* Default-hidden fields (disabled) */}
                {defaultHiddenGroups.length > 0 && (
                  <>
                    {defaultHiddenGroups.map((group) => (
                      <div key={group.id} style={categoryContainer}>
                        <div style={categoryTitle}>
                          {group.title}
                          <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 8, opacity: 0.7 }}>
                            (hidden by default)
                          </span>
                        </div>
                        <ul style={fieldList}>
                          {group.fields.map((field) => (
                            <li
                              key={field.key}
                              style={{
                                ...hiddenFieldItem,
                                opacity: 0.6,
                                cursor: "not-allowed",
                              }}
                            >
                              <div>
                                <div style={fieldLabel}>{field.label}</div>
                                {field.helpText && (
                                  <div className="metaText" style={fieldHelpText}>
                                    {field.helpText}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                disabled
                                aria-label={`Cannot show ${field.label} (hidden by default)`}
                                style={{
                                  ...showButton,
                                  opacity: 0.5,
                                  cursor: "not-allowed",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  style={buttonIcon}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </>
                )}
                {/* Type-specific hidden fields (can be shown) */}
                {typeSpecificHiddenGroups.map((group) => (
                  <div key={group.id} style={categoryContainer}>
                    <div style={categoryTitle}>{group.title}</div>
                    <ul style={fieldList}>
                      {group.fields.map((field) => (
                        <li key={field.key} style={hiddenFieldItem}>
                          <div>
                            <div style={fieldLabel}>{field.label}</div>
                            {field.helpText && (
                              <div className="metaText" style={fieldHelpText}>
                                {field.helpText}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleHide(field.key, false)}
                            aria-label={`Show ${field.label}`}
                            style={showButton}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              style={buttonIcon}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {hiddenFields.length === 0 && (
                  <div className="metaText" style={emptyState}>
                    No hidden fields.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CmsSection>

      <CmsSection
        title="Preset JSON (export for migration)"
        backgroundColor={presetJsonSection.backgroundColor}
        borderColor={presetJsonSection.borderColor}
        description="Current preset configuration. Persists automatically via localStorage."
      >
        <textarea value={exportJson} readOnly style={presetTextarea} />
      </CmsSection>

      <CmsSection
        title={isDefaultType ? "Live preview - Default slide fields" : "Live preview"}
        description="Preview only — does not save to Supabase."
        backgroundColor={livePreviewSection.backgroundColor}
        borderColor={livePreviewSection.borderColor}
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
