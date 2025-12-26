/**
 * Language and Localization Section Component
 * 
 * Displays language selection for the slide
 */

import React from "react";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Select from "../ui/Select";
import { uiTokens } from "../../lib/uiTokens";

interface LanguageSectionProps {
  defaultLang: string;
  onChange: (value: string) => void;
}

export function LanguageSection({ defaultLang, onChange }: LanguageSectionProps) {
  return (
    <CmsSection
      title="Language and Localization"
      backgroundColor="#e6f1f1"
      borderColor="#b4d5d5"
      description="Language settings for the slide"
    >
      <FormField
        label="Default Language"
        infoTooltip="Default language for text-to-speech and content display. Choose English, French, or Both."
      >
        <Select value={defaultLang} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select language...</option>
          <option value="english">English</option>
          <option value="french">French</option>
          <option value="both">Both</option>
        </Select>
        <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
          [ai-speak]
        </div>
      </FormField>
    </CmsSection>
  );
}

