/**
 * Identity & Structure Section Component
 * 
 * Displays read-only slide identification fields
 */

import React from "react";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import { uiTokens } from "../../lib/uiTokens";

interface IdentitySectionProps {
  slideId: string;
  slideType: string;
  groupId: string;
  groupName: string;
  orderIndex: number;
  label: string;
  onLabelChange: (value: string) => void;
}

export function IdentitySection({
  slideId,
  slideType,
  groupId,
  groupName,
  orderIndex,
  label,
  onLabelChange,
}: IdentitySectionProps) {
  return (
    <CmsSection
      title="Identity & Structure"
      backgroundColor="#e6f1f1"
      borderColor="#b4d5d5"
      description="Basic slide identification and structure"
    >
      <FormField
        label="Slide ID"
        infoTooltip="System UUID for the slide (read-only). Used internally by the CMS to identify this slide."
      >
        <Input
          type="text"
          value={slideId}
          readOnly
          style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
        />
        <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
          [title, text, ai-speak]
        </div>
      </FormField>

      <FormField
        label="Slide Type"
        infoTooltip="Type key used to select the editor (read-only). Determines which editor component is used to edit this slide."
      >
        <Input
          type="text"
          value={slideType}
          readOnly
          style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
        />
        <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
          [title, text, ai-speak]
        </div>
      </FormField>

      <FormField
        label="Group ID"
        infoTooltip="Owning group UUID (read-only). This slide belongs to this group in the lesson hierarchy."
      >
        <Input
          type="text"
          value={groupId}
          readOnly
          style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
        />
        <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
          [title, text, ai-speak]
        </div>
      </FormField>

      <FormField
        label="Group Name"
        infoTooltip="Name of the group this slide belongs to (read-only). Displayed for reference."
      >
        <Input
          type="text"
          value={groupName}
          readOnly
          style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
        />
        <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
          [title, text, ai-speak]
        </div>
      </FormField>

      <FormField
        label="Order Index"
        infoTooltip="Sequence position in the group (read-only). Determines the order this slide appears within its group."
      >
        <Input
          type="number"
          value={orderIndex}
          readOnly
          style={{ backgroundColor: uiTokens.color.surface, cursor: "not-allowed" }}
        />
        <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
          [title, text, ai-speak]
        </div>
      </FormField>

      <FormField
        label="Label"
        infoTooltip="Internal name for this slide used in the CMS and navigation. Not shown to learners. Required for CMS organization."
        required
      >
        <Input
          type="text"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="Enter slide label"
        />
        <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
          [title, text, ai-speak]
        </div>
      </FormField>
    </CmsSection>
  );
}

