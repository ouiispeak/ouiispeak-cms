/**
 * Field Selector Component
 * 
 * Visual interface for selecting and configuring fields for a slide type.
 * Shows checkboxes for available fields and allows configuring their properties.
 */

"use client";

import { useState, useMemo } from "react";
import type { SlideTypeConfig, FormFieldConfig } from "../../lib/schemas/slideTypeConfig";
import type { FieldDefinition } from "../../lib/schemas/slideFieldRegistry";
import { DEFAULT_SECTIONS } from "../../lib/schemas/slideTypeConfig";
import CmsSection from "../ui/CmsSection";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { uiTokens } from "../../lib/uiTokens";

interface FieldSelectorProps {
  availableFields: Array<FieldDefinition & { isSelected: boolean; fieldConfig?: FormFieldConfig }>;
  config: SlideTypeConfig;
  onFieldToggle: (fieldId: string, selected: boolean) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormFieldConfig>) => void;
}

export function FieldSelector({
  availableFields,
  config,
  onFieldToggle,
  onFieldUpdate
}: FieldSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState<string>("all");

  // Filter fields
  const filteredFields = useMemo(() => {
    let filtered = availableFields;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(field =>
        field.displayName.toLowerCase().includes(term) ||
        field.id.toLowerCase().includes(term)
      );
    }

    // Filter by section
    if (filterSection !== "all") {
      filtered = filtered.filter(field => {
        const fieldConfig = config.formConfig.fields.find(f => f.fieldId === field.id);
        return fieldConfig?.sectionId === filterSection;
      });
    }

    return filtered;
  }, [availableFields, searchTerm, filterSection, config]);

  // Group selected fields by section
  const selectedFieldsBySection = useMemo(() => {
    const grouped: Record<string, Array<typeof availableFields[0] & { fieldConfig: FormFieldConfig }>> = {};
    
    config.formConfig.fields.forEach(fieldConfig => {
      const field = availableFields.find(f => f.id === fieldConfig.fieldId);
      if (field) {
        if (!grouped[fieldConfig.sectionId]) {
          grouped[fieldConfig.sectionId] = [];
        }
        grouped[fieldConfig.sectionId].push({
          ...field,
          fieldConfig
        });
      }
    });

    // Sort by order within each section
    Object.keys(grouped).forEach(sectionId => {
      grouped[sectionId].sort((a, b) => {
        return (a.fieldConfig?.order || 0) - (b.fieldConfig?.order || 0);
      });
    });

    return grouped;
  }, [config, availableFields]);

  return (
    <div style={{ display: "flex", gap: uiTokens.space.lg, flexDirection: "column" }}>
      {/* Search and Filter */}
      <div style={{ display: "flex", gap: uiTokens.space.md, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={{ 
            display: "block", 
            marginBottom: uiTokens.space.sm, 
            fontSize: uiTokens.font.label.size 
          }}>
            Search Fields:
          </label>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or ID..."
          />
        </div>
        <div style={{ minWidth: "200px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: uiTokens.space.sm, 
            fontSize: uiTokens.font.label.size 
          }}>
            Filter by Section:
          </label>
          <Select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
          >
            <option value="all">All Sections</option>
            {config.formConfig.sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Selected Fields (by Section) */}
      {Object.keys(selectedFieldsBySection).length > 0 && (
        <CmsSection
          title="Selected Fields"
          description="Fields currently included in this configuration, organized by section"
        >
          {config.formConfig.sections
            .filter(section => selectedFieldsBySection[section.id])
            .map(section => (
              <div key={section.id} style={{ marginBottom: uiTokens.space.lg }}>
                <h3 style={{ 
                  fontSize: uiTokens.font.sectionTitle.size, 
                  marginBottom: uiTokens.space.md,
                  color: uiTokens.color.text
                }}>
                  {section.title}
                </h3>
                {selectedFieldsBySection[section.id].map((field) => {
                  const fieldConfig = field.fieldConfig!;
                  return (
                    <div
                      key={field.id}
                      style={{
                        padding: uiTokens.space.md,
                        border: `1px solid ${uiTokens.color.border}`,
                        borderRadius: uiTokens.radius.sm,
                        marginBottom: uiTokens.space.sm,
                        backgroundColor: uiTokens.color.bg
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: uiTokens.space.sm }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.sm, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => onFieldToggle(field.id, false)}
                              style={{ width: 18, height: 18, cursor: "pointer" }}
                            />
                            <span style={{ fontSize: uiTokens.font.label.size, fontWeight: 600 }}>
                              {field.displayName}
                            </span>
                            <span style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.mutedText }}>
                              ({field.id})
                            </span>
                          </label>
                          {field.infoTooltip && (
                            <p style={{ 
                              fontSize: uiTokens.font.meta.size, 
                              color: uiTokens.color.mutedText,
                              marginTop: uiTokens.space.sm,
                              marginLeft: 26
                            }}>
                              {field.infoTooltip}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Field Configuration */}
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: uiTokens.space.md,
                        marginTop: uiTokens.space.md,
                        paddingTop: uiTokens.space.md,
                        borderTop: `1px solid ${uiTokens.color.border}`
                      }}>
                        <div>
                          <label style={{ 
                            display: "block", 
                            marginBottom: uiTokens.space.sm, 
                            fontSize: uiTokens.font.meta.size 
                          }}>
                            Section:
                          </label>
                          <Select
                            value={fieldConfig.sectionId}
                            onChange={(e) => onFieldUpdate(field.id, { sectionId: e.target.value })}
                          >
                            {config.formConfig.sections.map(section => (
                              <option key={section.id} value={section.id}>
                                {section.title}
                              </option>
                            ))}
                          </Select>
                        </div>

                        <div>
                          <label style={{ 
                            display: "block", 
                            marginBottom: uiTokens.space.sm, 
                            fontSize: uiTokens.font.meta.size 
                          }}>
                            Order:
                          </label>
                          <Input
                            type="number"
                            value={fieldConfig.order}
                            onChange={(e) => onFieldUpdate(field.id, { order: parseInt(e.target.value) || 0 })}
                            min="0"
                          />
                        </div>

                        <div>
                          <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.sm, cursor: "pointer", marginTop: 20 }}>
                            <input
                              type="checkbox"
                              checked={fieldConfig.required}
                              onChange={(e) => onFieldUpdate(field.id, { required: e.target.checked })}
                              style={{ width: 18, height: 18, cursor: "pointer" }}
                            />
                            <span style={{ fontSize: uiTokens.font.meta.size }}>Required</span>
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.sm, cursor: "pointer", marginTop: uiTokens.space.xs }}>
                            <input
                              type="checkbox"
                              checked={fieldConfig.visible}
                              onChange={(e) => onFieldUpdate(field.id, { visible: e.target.checked })}
                              style={{ width: 18, height: 18, cursor: "pointer" }}
                            />
                            <span style={{ fontSize: uiTokens.font.meta.size }}>Visible</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </CmsSection>
      )}

      {/* Available Fields */}
      <CmsSection
        title="Available Fields"
        description="Select fields to include in this configuration"
      >
        {filteredFields.filter(f => !f.isSelected).length === 0 ? (
          <p style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.mutedText }}>
            {searchTerm || filterSection !== "all" 
              ? "No fields match your search/filter criteria."
              : "All available fields are already selected."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: uiTokens.space.sm }}>
            {filteredFields
              .filter(f => !f.isSelected)
              .map(field => (
                <div
                  key={field.id}
                  style={{
                    padding: uiTokens.space.md,
                    border: `1px solid ${uiTokens.color.border}`,
                    borderRadius: uiTokens.radius.sm,
                    backgroundColor: uiTokens.color.bg
                  }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.sm, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => onFieldToggle(field.id, true)}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: uiTokens.font.label.size, fontWeight: 600 }}>
                        {field.displayName}
                      </span>
                      <span style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.mutedText, marginLeft: uiTokens.space.sm }}>
                        ({field.id}) - {field.type}
                      </span>
                      {field.infoTooltip && (
                        <p style={{ 
                          fontSize: uiTokens.font.meta.size, 
                          color: uiTokens.color.mutedText,
                          marginTop: uiTokens.space.sm,
                          marginLeft: 26
                        }}>
                          {field.infoTooltip}
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              ))}
          </div>
        )}
      </CmsSection>
    </div>
  );
}

