/**
 * Configuration Preview Component
 * 
 * Live preview of how the form will look based on the current configuration.
 * Shows sections and fields as they would appear in the edit-slide page.
 */

"use client";

import { useMemo } from "react";
import type { SlideTypeConfig } from "../../lib/schemas/slideTypeConfig";
import { groupFieldsBySection } from "../../lib/utils/formUtils";
import { getFieldDefinition } from "../../lib/schemas/slideFieldRegistry";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import { uiTokens } from "../../lib/uiTokens";

interface ConfigPreviewProps {
  config: SlideTypeConfig;
}

export function ConfigPreview({ config }: ConfigPreviewProps) {
  // Group fields by section
  const sectionsWithFields = useMemo(() => {
    return groupFieldsBySection(config.formConfig);
  }, [config]);

  // Mock values for preview
  const mockValues: Record<string, any> = useMemo(() => {
    const values: Record<string, any> = {};
    config.formConfig.fields.forEach(field => {
      const fieldDef = getFieldDefinition(field.fieldId);
      if (fieldDef) {
        if (fieldDef.type === "checkbox") {
          values[field.fieldId] = false;
        } else if (fieldDef.type === "number") {
          values[field.fieldId] = "";
        } else if (fieldDef.type === "select") {
          values[field.fieldId] = "";
        } else if (fieldDef.type === "complex") {
          values[field.fieldId] = [];
        } else {
          values[field.fieldId] = fieldDef.placeholder || "";
        }
      }
    });
    return values;
  }, [config]);

  return (
    <div>
      <CmsSection
        title="Form Preview"
        description="Preview of how the form will appear in the edit-slide page"
        backgroundColor="#f8f9fa"
        borderColor={uiTokens.color.border}
      >
        <div style={{ 
          padding: uiTokens.space.md,
          backgroundColor: uiTokens.color.bg,
          borderRadius: uiTokens.radius.sm,
          border: `2px dashed ${uiTokens.color.border}`
        }}>
          <p style={{ 
            fontSize: uiTokens.font.meta.size, 
            color: uiTokens.color.mutedText,
            fontStyle: "italic",
            marginBottom: uiTokens.space.md
          }}>
            This is a preview. Fields are read-only and show example values.
          </p>

          {sectionsWithFields.map(({ section, fields }) => {
            const sortedFields = [...fields].sort((a, b) => a.order - b.order);
            
            return (
              <CmsSection
                key={section.id}
                title={section.title}
                description={section.description}
                backgroundColor={section.backgroundColor}
                borderColor={section.borderColor}
              >
                {sortedFields.map(fieldConfig => {
                  if (!fieldConfig.visible) return null;

                  const fieldDef = getFieldDefinition(fieldConfig.fieldId);
                  if (!fieldDef) return null;

                  const value = mockValues[fieldConfig.fieldId] || "";

                  // Render preview based on field type
                  let inputComponent: React.ReactNode = null;

                  if (fieldDef.readOnly) {
                    inputComponent = (
                      <Input
                        type="text"
                        value={value}
                        readOnly
                        style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
                      />
                    );
                  } else if (fieldDef.type === "textarea") {
                    inputComponent = (
                      <Textarea
                        value={value}
                        readOnly
                        rows={fieldDef.rows || 4}
                        style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
                      />
                    );
                  } else if (fieldDef.type === "select") {
                    inputComponent = (
                      <Select value={value} disabled>
                        {fieldDef.selectOptions?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    );
                  } else if (fieldDef.type === "checkbox") {
                    inputComponent = (
                      <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.sm, cursor: "not-allowed" }}>
                        <input
                          type="checkbox"
                          checked={value}
                          disabled
                          style={{ width: 18, height: 18 }}
                        />
                        <span style={{ fontSize: uiTokens.font.label.size }}>
                          {fieldDef.placeholder || `Enable ${fieldDef.displayName.toLowerCase()}`}
                        </span>
                      </label>
                    );
                  } else if (fieldDef.type === "complex") {
                    inputComponent = (
                      <div style={{ 
                        padding: uiTokens.space.md,
                        backgroundColor: uiTokens.color.surface,
                        borderRadius: uiTokens.radius.sm,
                        border: `1px solid ${uiTokens.color.border}`,
                        fontSize: uiTokens.font.meta.size,
                        color: uiTokens.color.mutedText,
                        fontStyle: "italic"
                      }}>
                        [{fieldDef.componentName || "Complex Component"}]
                        <br />
                        Preview not available for complex components
                      </div>
                    );
                  } else {
                    inputComponent = (
                      <Input
                        type={fieldDef.type === "number" ? "number" : "text"}
                        value={value}
                        readOnly
                        placeholder={fieldDef.placeholder}
                        style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
                      />
                    );
                  }

                  return (
                    <FormField
                      key={fieldConfig.fieldId}
                      label={fieldDef.displayName}
                      required={fieldConfig.required}
                      infoTooltip={fieldDef.infoTooltip}
                    >
                      {inputComponent}
                      <div className="metaText" style={{ 
                        marginTop: uiTokens.space.sm, 
                        fontSize: uiTokens.font.meta.size, 
                        color: "#999" 
                      }}>
                        [{fieldConfig.fieldId}]
                      </div>
                    </FormField>
                  );
                })}
              </CmsSection>
            );
          })}
        </div>
      </CmsSection>
    </div>
  );
}

