/**
 * Media Reference Section Component
 * 
 * Displays audio file selector for the slide
 */

import React from "react";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import AudioFileSelector from "../ui/AudioFileSelector";
import { uiTokens } from "../../lib/uiTokens";

interface MediaSectionProps {
  audioId: string;
  onChange: (value: string) => void;
}

export function MediaSection({ audioId, onChange }: MediaSectionProps) {
  return (
    <CmsSection
      title="Media Reference"
      backgroundColor="#e6f1f1"
      borderColor="#b4d5d5"
      description="Media assets referenced by this slide"
    >
      <FormField
        label="Audio ID"
        infoTooltip="Reference ID or path for audio media used in this slide. Select from uploaded files using Browse or enter a path manually."
      >
        <AudioFileSelector bucketName="lesson-audio" value={audioId} onChange={onChange} />
        <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
          [unused]
        </div>
      </FormField>
    </CmsSection>
  );
}

