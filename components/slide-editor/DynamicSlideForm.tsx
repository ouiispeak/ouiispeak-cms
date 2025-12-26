/**
 * Dynamic Slide Form Component
 * 
 * Renders a form dynamically based on slide type configuration.
 * This is the main component that replaces hardcoded form logic.
 */

"use client";

import { useSlideTypeConfig } from "../../lib/hooks/slides/useSlideTypeConfig";
import { SectionRenderer } from "./SectionRenderer";
import { groupFieldsBySection } from "../../lib/utils/formUtils";
import { uiTokens } from "../../lib/uiTokens";

interface DynamicSlideFormProps {
  slideType: string;
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  defaultLang?: string;
  bucketName?: string;
}

/**
 * Main dynamic form component that renders based on configuration
 */
export function DynamicSlideForm({
  slideType,
  values,
  onChange,
  defaultLang,
  bucketName = "lesson-audio"
}: DynamicSlideFormProps) {
  const { config, loading, error } = useSlideTypeConfig(slideType);

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: uiTokens.space.lg, textAlign: "center" }}>
        <div style={{ fontSize: uiTokens.font.label.size, color: uiTokens.color.mutedText }}>
          Loading form configuration...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: uiTokens.space.lg }}>
        <div style={{ 
          padding: uiTokens.space.md, 
          backgroundColor: uiTokens.color.danger + "20",
          border: `1px solid ${uiTokens.color.danger}`,
          borderRadius: uiTokens.radius.sm,
          color: uiTokens.color.danger
        }}>
          <strong>Error loading form configuration:</strong> {error}
        </div>
        <div style={{ marginTop: uiTokens.space.md, fontSize: uiTokens.font.meta.size, color: uiTokens.color.mutedText }}>
          Falling back to legacy form...
        </div>
      </div>
    );
  }

  // No configuration found
  if (!config) {
    return (
      <div style={{ padding: uiTokens.space.lg }}>
        <div style={{ 
          padding: uiTokens.space.md, 
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: uiTokens.radius.sm,
          color: "#856404"
        }}>
          <strong>No configuration found</strong> for slide type: {slideType}
        </div>
        <div style={{ marginTop: uiTokens.space.md, fontSize: uiTokens.font.meta.size, color: uiTokens.color.mutedText }}>
          Falling back to legacy form...
        </div>
      </div>
    );
  }

  // Group fields by section
  const sectionsWithFields = groupFieldsBySection(config.formConfig);

  // Render form
  return (
    <>
      {sectionsWithFields.map(({ section, fields }) => (
        <SectionRenderer
          key={section.id}
          section={section}
          fields={fields}
          values={values}
          onChange={onChange}
          defaultLang={defaultLang}
          bucketName={bucketName}
        />
      ))}
    </>
  );
}

