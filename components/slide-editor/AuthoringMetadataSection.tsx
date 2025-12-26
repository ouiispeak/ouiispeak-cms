/**
 * Authoring Metadata Section Component
 * 
 * Displays metadata fields for CMS organization
 */

import React from "react";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import { uiTokens } from "../../lib/uiTokens";
import { SLIDE_TYPES } from "../../lib/types/slideProps";

interface AuthoringMetadataSectionProps {
  slideType: string;
  activityName: string;
  onChange: (value: string) => void;
}

export function AuthoringMetadataSection({
  slideType,
  activityName,
  onChange,
}: AuthoringMetadataSectionProps) {
  // Don't render for title, lesson-end, or text slides
  if (
    slideType === SLIDE_TYPES.TITLE ||
    slideType === SLIDE_TYPES.LESSON_END ||
    slideType === SLIDE_TYPES.TEXT
  ) {
    return null;
  }

  return (
    <CmsSection
      title="Authoring Metadata"
      backgroundColor="#e6f1f1"
      borderColor="#b4d5d5"
      description="Metadata for CMS organization and tracking"
    >
      <FormField
        label="Activity Name"
        infoTooltip="Name of the activity for CMS organization and tracking."
      >
        <Input
          type="text"
          value={activityName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter activity name"
        />
        <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
          [all slide types]
        </div>
      </FormField>
    </CmsSection>
  );
}

