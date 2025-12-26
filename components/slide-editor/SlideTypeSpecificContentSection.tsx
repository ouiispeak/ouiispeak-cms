/**
 * Slide Type Specific Content Section Component
 * 
 * Displays content fields specific to certain slide types
 */

import React from "react";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import StudentRepeatElementMapper from "../ui/StudentRepeatElementMapper";
import ChoiceElementMapper from "../ui/ChoiceElementMapper";
import { uiTokens } from "../../lib/uiTokens";
import { SLIDE_TYPES, type ChoiceElement } from "../../lib/types/slideProps";
import type { StudentRepeatFormElement } from "../../components/ui/StudentRepeatElementMapper";

interface SlideTypeSpecificContentSectionProps {
  slideType: string;
  instructions: string;
  promptLabel: string;
  title: string;
  subtitle: string;
  note: string;
  phrases: string;
  elements: StudentRepeatFormElement[];
  choiceElements: ChoiceElement[];
  defaultLang: string;
  onInstructionsChange: (value: string) => void;
  onPromptLabelChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onPhrasesChange: (value: string) => void;
  onElementsChange: (elements: StudentRepeatFormElement[]) => void;
  onChoiceElementsChange: (elements: ChoiceElement[]) => void;
}

export function SlideTypeSpecificContentSection({
  slideType,
  instructions,
  promptLabel,
  title,
  subtitle,
  note,
  phrases,
  elements,
  choiceElements,
  defaultLang,
  onInstructionsChange,
  onPromptLabelChange,
  onTitleChange,
  onSubtitleChange,
  onNoteChange,
  onPhrasesChange,
  onElementsChange,
  onChoiceElementsChange,
}: SlideTypeSpecificContentSectionProps) {
  // AI_SPEAK_STUDENT_REPEAT specific fields
  if (slideType === SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT) {
    return (
      <CmsSection
        title="Core Content"
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
        description="Main content shown to learners"
      >
        <FormField
          label="Instructions"
          infoTooltip="Optional instructions shown to learners before they practice."
        >
          <Textarea
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder="Enter instructions for learners"
            rows={3}
          />
          <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
            [ai-speak-student-repeat]
          </div>
        </FormField>

        <FormField
          label="Prompt Label"
          infoTooltip="Label displayed above the practice prompt. Defaults to 'Phrase à prononcer' if not set."
        >
          <Input
            type="text"
            value={promptLabel}
            onChange={(e) => onPromptLabelChange(e.target.value)}
            placeholder="Phrase à prononcer"
          />
          <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
            [ai-speak-student-repeat]
          </div>
        </FormField>
      </CmsSection>
    );
  }

  // SPEECH_MATCH specific fields
  if (slideType === SLIDE_TYPES.SPEECH_MATCH) {
    return (
      <CmsSection
        title="Core Content"
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
        description="Main content shown to learners"
      >
        <FormField label="Title" infoTooltip="Primary heading for the slide.">
          <Input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter slide title"
          />
          <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
            [speech-match]
          </div>
        </FormField>

        <FormField
          label="Subtitle"
          infoTooltip="Instructions shown to learners (e.g., 'Écoute et clique sur la lettre que tu entends')."
        >
          <Input
            type="text"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="Écoute et clique sur la lettre que tu entends"
          />
          <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
            [speech-match]
          </div>
        </FormField>

        <FormField label="Note" infoTooltip="Optional note displayed below subtitle.">
          <Input
            type="text"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Optional note"
          />
          <div className="metaText" style={{ marginTop: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: "#999" }}>
            [speech-match]
          </div>
        </FormField>
      </CmsSection>
    );
  }

  // Don't render for other types (handled by CoreContentSection)
  return null;
}

