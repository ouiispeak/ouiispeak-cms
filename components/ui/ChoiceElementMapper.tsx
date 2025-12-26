"use client";

import { useState } from "react";
import { uiTokens } from "../../lib/uiTokens";
import FormField from "./FormField";
import Input from "./Input";
import Select from "./Select";
import AudioFileSelector from "./AudioFileSelector";
import { Button } from "../Button";
import { useElementMapper } from "../../lib/hooks/utils/useElementMapper";
import { normalizeLanguageToPlayer } from "../../lib/utils/elementMapperUtils";
import type { ChoiceElement } from "../../lib/types/slideProps";
import { SPEECH_MODES, PLAYER_LANGUAGES } from "../../lib/constants/slideConstants";

type ChoiceElementMapperProps = {
  elements: ChoiceElement[];
  onElementsChange: (elements: ChoiceElement[]) => void;
  bucketName: string;
  defaultLang?: string;
};

export default function ChoiceElementMapper({
  elements,
  onElementsChange,
  bucketName,
  defaultLang = "en",
}: ChoiceElementMapperProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const createEmptyElement = (): ChoiceElement => {
    const normalizedLang = normalizeLanguageToPlayer(defaultLang);
    return {
      label: "",
      speech: {
        mode: SPEECH_MODES.TTS,
        lang: normalizedLang,
        text: "",
      },
    };
  };

  const { handleAddElement, handleRemoveElement, handleElementChange } = useElementMapper(
    elements,
    onElementsChange,
    createEmptyElement
  );

  const handleSpeechModeChange = (index: number, mode: "tts" | "file") => {
    const element = elements[index];
    const normalizedLang = normalizeLanguageToPlayer(element.speech.lang, defaultLang);
    
    const updatedSpeech: ChoiceElement["speech"] = {
      mode,
      lang: normalizedLang,
    };
    
    if (mode === SPEECH_MODES.TTS) {
      updatedSpeech.text = element.speech.text || element.label;
    } else {
      updatedSpeech.fileUrl = element.speech.fileUrl || "";
    }
    
    handleElementChange(index, { speech: updatedSpeech });
  };

  const handleLabelChange = (index: number, label: string) => {
    handleElementChange(index, { label });
  };

  const handleSpeechLangChange = (index: number, lang: "en" | "fr") => {
    const element = elements[index];
    handleElementChange(index, {
      speech: {
        ...element.speech,
        lang,
      },
    });
  };

  const handleSpeechTextChange = (index: number, text: string) => {
    const element = elements[index];
    handleElementChange(index, {
      speech: {
        ...element.speech,
        text,
      },
    });
  };

  const handleSpeechFileUrlChange = (index: number, fileUrl: string) => {
    const element = elements[index];
    handleElementChange(index, {
      speech: {
        ...element.speech,
        fileUrl,
        mode: SPEECH_MODES.FILE,
      },
    });
  };

  return (
    <div style={{ marginTop: uiTokens.space.sm }}>
      <Button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ marginBottom: uiTokens.space.xs }}
      >
        {isExpanded ? "Hide" : "Show"} Choice Elements Mapper
      </Button>

      {isExpanded && (
        <div style={{ marginTop: uiTokens.space.md, padding: uiTokens.space.md, backgroundColor: uiTokens.color.surface, borderRadius: uiTokens.radius.md, border: `1px solid ${uiTokens.color.border}` }}>
          <p style={{ marginBottom: uiTokens.space.md, fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
            Each element represents a choice option. Students hear the audio and click on the matching label.
          </p>

          {elements.length === 0 ? (
            <p style={{ marginBottom: uiTokens.space.md, fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
              No elements yet. Click "Add Element" to create choice options.
            </p>
          ) : (
            elements.map((element, index) => (
              <div
                key={index}
                style={{
                  marginBottom: uiTokens.space.lg,
                  padding: uiTokens.space.md,
                  backgroundColor: uiTokens.color.bg,
                  borderRadius: uiTokens.radius.md,
                  border: `1px solid ${uiTokens.color.border}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: uiTokens.space.sm }}>
                  <h4 style={{ fontSize: uiTokens.font.sectionTitle.size, fontWeight: 600 }}>Choice {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => handleRemoveElement(index)}
                    style={{ backgroundColor: uiTokens.color.danger, color: "white" }}
                  >
                    Remove
                  </Button>
                </div>

                <FormField label="Label" required>
                  <Input
                    value={element.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    placeholder="e.g., A, B, C"
                  />
                </FormField>

                <FormField label="Speech Mode" required>
                  <Select
                    value={element.speech.mode}
                    onChange={(e) => handleSpeechModeChange(index, e.target.value as "tts" | "file")}
                  >
                    <option value="tts">TTS (Text-to-Speech)</option>
                    <option value="file">Audio File</option>
                  </Select>
                </FormField>

                {element.speech.mode === "tts" ? (
                  <>
                    <FormField label="Language">
                      <Select
                        value={element.speech.lang || normalizeLanguageToPlayer(defaultLang)}
                        onChange={(e) => handleSpeechLangChange(index, e.target.value as "en" | "fr")}
                      >
                        <option value={PLAYER_LANGUAGES.ENGLISH}>English</option>
                        <option value={PLAYER_LANGUAGES.FRENCH}>French</option>
                      </Select>
                    </FormField>
                    <FormField label="Text for TTS">
                      <Input
                        value={element.speech.text || ""}
                        onChange={(e) => handleSpeechTextChange(index, e.target.value)}
                        placeholder={element.label || "Text to speak"}
                      />
                    </FormField>
                  </>
                ) : (
                  <FormField label="Audio File">
                    <AudioFileSelector
                      bucketName={bucketName}
                      value={element.speech.fileUrl || ""}
                      onChange={(fileUrl) => handleSpeechFileUrlChange(index, fileUrl)}
                    />
                  </FormField>
                )}
              </div>
            ))
          )}

          <Button type="button" onClick={handleAddElement} style={{ marginTop: uiTokens.space.md }}>
            + Add Element
          </Button>
        </div>
      )}
    </div>
  );
}

