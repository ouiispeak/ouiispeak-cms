/**
 * Section Editor Component
 * 
 * Interface for managing form sections.
 * Allows editing section properties like title, description, colors, and order.
 */

"use client";

import type { SlideTypeConfig, FormSection } from "../../lib/schemas/slideTypeConfig";
import CmsSection from "../ui/CmsSection";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import { uiTokens } from "../../lib/uiTokens";

interface SectionEditorProps {
  config: SlideTypeConfig;
  onSectionUpdate: (sectionId: string, updates: Partial<FormSection>) => void;
}

export function SectionEditor({
  config,
  onSectionUpdate
}: SectionEditorProps) {
  const sortedSections = [...config.formConfig.sections].sort((a, b) => a.order - b.order);

  return (
    <CmsSection
      title="Section Configuration"
      description="Configure form sections: titles, descriptions, colors, and display order"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: uiTokens.space.lg }}>
        {sortedSections.map((section) => (
          <div
            key={section.id}
            style={{
              padding: uiTokens.space.md,
              border: `1px solid ${uiTokens.color.border}`,
              borderRadius: uiTokens.radius.sm,
              backgroundColor: uiTokens.color.bg
            }}
          >
            <h3 style={{ 
              fontSize: uiTokens.font.sectionTitle.size, 
              marginTop: 0,
              marginBottom: uiTokens.space.md
            }}>
              {section.title}
            </h3>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr",
              gap: uiTokens.space.md
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: uiTokens.space.sm, 
                  fontSize: uiTokens.font.label.size 
                }}>
                  Title:
                </label>
                <Input
                  type="text"
                  value={section.title}
                  onChange={(e) => onSectionUpdate(section.id, { title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: uiTokens.space.sm, 
                  fontSize: uiTokens.font.label.size 
                }}>
                  Order:
                </label>
                <Input
                  type="number"
                  value={section.order}
                  onChange={(e) => onSectionUpdate(section.id, { order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div style={{ marginTop: uiTokens.space.md }}>
              <label style={{ 
                display: "block", 
                marginBottom: uiTokens.space.xs, 
                fontSize: uiTokens.font.label.size 
              }}>
                Description:
              </label>
              <Textarea
                value={section.description || ""}
                onChange={(e) => onSectionUpdate(section.id, { description: e.target.value })}
                rows={2}
              />
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr",
              gap: uiTokens.space.md,
              marginTop: uiTokens.space.md
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: uiTokens.space.sm, 
                  fontSize: uiTokens.font.label.size 
                }}>
                  Background Color:
                </label>
                <Input
                  type="color"
                  value={section.backgroundColor || "#e6f1f1"}
                  onChange={(e) => onSectionUpdate(section.id, { backgroundColor: e.target.value })}
                  style={{ width: "100%", height: 40 }}
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: uiTokens.space.sm, 
                  fontSize: uiTokens.font.label.size 
                }}>
                  Border Color:
                </label>
                <Input
                  type="color"
                  value={section.borderColor || "#b4d5d5"}
                  onChange={(e) => onSectionUpdate(section.id, { borderColor: e.target.value })}
                  style={{ width: "100%", height: 40 }}
                />
              </div>
            </div>

            {/* Preview */}
            <div style={{ 
              marginTop: uiTokens.space.md,
              padding: uiTokens.space.md,
              backgroundColor: section.backgroundColor || "#e6f1f1",
              border: `1px solid ${section.borderColor || "#b4d5d5"}`,
              borderRadius: uiTokens.radius.sm
            }}>
              <h4 style={{ 
                fontSize: uiTokens.font.sectionTitle.size, 
                marginTop: 0,
                marginBottom: uiTokens.space.xs
              }}>
                {section.title}
              </h4>
              {section.description && (
                <p style={{ 
                  fontSize: uiTokens.font.meta.size, 
                  color: uiTokens.color.mutedText,
                  margin: 0
                }}>
                  {section.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </CmsSection>
  );
}

