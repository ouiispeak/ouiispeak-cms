"use client";

import { useState, useMemo } from "react";
import CmsPageShell from "../../../../components/cms/CmsPageShell";
import CmsSection from "../../../../components/ui/CmsSection";
import { uiTokens } from "../../../../lib/uiTokens";
import { CANONICAL_FIELDS, REQUIRED_FIELD_KEY, type CanonicalField } from "../../../../lib/slide-editor-registry-v2/canonicalFields";
import type { DefaultFieldAvailability } from "../../../../lib/slide-editor-registry-v2/types";
import { getDefaultAvailability } from "../../../../lib/slide-editor-registry-v2/defaultAvailability";
import { Button } from "../../../../components/Button";

/**
 * Default Slide Type Editor
 * 
 * Controls which fields are "Available" (can be used by child slide types).
 * Uses an opt-in model: fields start as Unavailable, users move them to Available.
 * 
 * Only "label" is always Available (required field).
 */
export default function DefaultSlideTypeEditor() {
  // State: which fields are Available
  // Always start with code defaults (opt-in model: only "label" available)
  const [availability, setAvailability] = useState<DefaultFieldAvailability>(() => getDefaultAvailability());

  // Separate fields into Available and Unavailable
  const { availableFields, unavailableFields } = useMemo(() => {
    const available: CanonicalField[] = [];
    const unavailable: CanonicalField[] = [];

    CANONICAL_FIELDS.forEach((field) => {
      if (availability.availableFieldKeys.has(field.key)) {
        available.push(field);
      } else {
        unavailable.push(field);
      }
    });

    return { availableFields: available, unavailableFields: unavailable };
  }, [availability]);

  // Toggle field availability
  const toggleAvailability = (fieldKey: string) => {
    setAvailability((prev) => {
      const newAvailable = new Set(prev.availableFieldKeys);
      
      if (newAvailable.has(fieldKey)) {
        // Moving to Unavailable (unless it's the required field)
        if (fieldKey === REQUIRED_FIELD_KEY) {
          return prev; // Can't make label unavailable
        }
        newAvailable.delete(fieldKey);
      } else {
        // Moving to Available
        newAvailable.add(fieldKey);
      }

      return { availableFieldKeys: newAvailable };
    });
  };

  // Group fields by category for display
  const groupFieldsByCategory = (fields: CanonicalField[]) => {
    const grouped = new Map<string, CanonicalField[]>();
    fields.forEach((field) => {
      const category = field.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(field);
    });
    return Array.from(grouped.entries()).map(([category, fields]) => ({
      category,
      fields,
    }));
  };

  const availableGroups = groupFieldsByCategory(availableFields);
  const unavailableGroups = groupFieldsByCategory(unavailableFields);

  const categoryLabels: Record<string, string> = {
    system: "System fields",
    "core-content": "Core content",
    language: "Language & localization",
    media: "Media references",
    timing: "Timing & flow",
    interaction: "Interaction flags",
    buttons: "Buttons & affordances",
    "authoring-metadata": "Authoring metadata",
    speech: "Speech & audio interaction",
    choice: "Choice & selection",
    sequencing: "Sequencing & grouping",
    matching: "Matching / mapping",
    scoring: "Scoring hints",
    ai: "AI / agent behavior hints",
    visual: "Visual behavior hints",
    analytics: "Analytics & observation",
    freeform: "Freeform / escape hatch",
  };

  return (
    <CmsPageShell title="Default Slide Type Editor">
      <CmsSection
        title="Field Availability"
        description="Control which fields are available to child slide types. Fields in 'Available' can be used by child types (title-slide, text-slide, ai-speak-repeat, etc.). Fields in 'Unavailable' cannot be accessed by any child type. Only 'label' is always Available (required field)."
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: uiTokens.space.lg,
            marginTop: uiTokens.space.md,
          }}
        >
          {/* Available Fields Column */}
          <div>
            <h3 style={{ marginBottom: uiTokens.space.md, fontSize: uiTokens.font.sectionTitle.size }}>
              Available Fields ({availableFields.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: uiTokens.space.md }}>
              {availableGroups.map(({ category, fields }) => (
                <div
                  key={category}
                  style={{
                    border: `1px solid ${uiTokens.color.border}`,
                    borderRadius: uiTokens.radius.md,
                    padding: uiTokens.space.sm,
                    backgroundColor: uiTokens.color.bg,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
                    {categoryLabels[category] || category}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {fields.map((field) => (
                      <li
                        key={field.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: `${uiTokens.space.xs}px 0`,
                          borderBottom: `1px solid ${uiTokens.color.border}`,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500 }}>{field.label}</div>
                          {field.helpText && (
                            <div className="metaText" style={{ fontSize: uiTokens.font.meta.size, marginTop: 2 }}>
                              {field.helpText}
                            </div>
                          )}
                          {field.key === REQUIRED_FIELD_KEY && (
                            <div className="metaText" style={{ fontSize: 11, color: "#856404", marginTop: 4 }}>
                              Required field (always available)
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => toggleAvailability(field.key)}
                          disabled={field.key === REQUIRED_FIELD_KEY}
                          size="sm"
                          style={{ minWidth: "auto", padding: `${uiTokens.space.xs}px ${uiTokens.space.sm}px` }}
                          aria-label={`Move ${field.label} to Unavailable`}
                        >
                          Move to Unavailable
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {availableFields.length === 0 && (
                <div className="metaText" style={{ padding: uiTokens.space.md, textAlign: "center" }}>
                  No available fields.
                </div>
              )}
            </div>
          </div>

          {/* Unavailable Fields Column */}
          <div>
            <h3 style={{ marginBottom: uiTokens.space.md, fontSize: uiTokens.font.sectionTitle.size }}>
              Unavailable Fields ({unavailableFields.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: uiTokens.space.md }}>
              {unavailableGroups.map(({ category, fields }) => (
                <div
                  key={category}
                  style={{
                    border: `1px solid ${uiTokens.color.border}`,
                    borderRadius: uiTokens.radius.md,
                    padding: uiTokens.space.sm,
                    backgroundColor: uiTokens.color.bg,
                    opacity: 0.7,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
                    {categoryLabels[category] || category}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {fields.map((field) => (
                      <li
                        key={field.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: `${uiTokens.space.xs}px 0`,
                          borderBottom: `1px solid ${uiTokens.color.border}`,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500 }}>{field.label}</div>
                          {field.helpText && (
                            <div className="metaText" style={{ fontSize: uiTokens.font.meta.size, marginTop: 2 }}>
                              {field.helpText}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => toggleAvailability(field.key)}
                          size="sm"
                          style={{ minWidth: "auto", padding: `${uiTokens.space.xs}px ${uiTokens.space.sm}px` }}
                          aria-label={`Move ${field.label} to Available`}
                        >
                          Move to Available
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {unavailableFields.length === 0 && (
                <div className="metaText" style={{ padding: uiTokens.space.md, textAlign: "center" }}>
                  No unavailable fields.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: uiTokens.space.md,
            marginTop: uiTokens.space.lg,
            paddingTop: uiTokens.space.lg,
            borderTop: `1px solid ${uiTokens.color.border}`,
          }}
        >
          <Button
            type="button"
            onClick={() => {
              // Reset to code defaults
              setAvailability(getDefaultAvailability());
            }}
            variant="secondary"
            size="md"
          >
            Reset to Defaults
          </Button>
          <div className="metaText" style={{ alignSelf: "center", color: uiTokens.color.textMuted }}>
            {availableFields.length} field{availableFields.length !== 1 ? "s" : ""} available,{" "}
            {unavailableFields.length} unavailable
          </div>
        </div>
      </CmsSection>
    </CmsPageShell>
  );
}

