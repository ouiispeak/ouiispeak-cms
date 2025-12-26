"use client";

import { useState } from "react";
import { uiTokens } from "../../lib/uiTokens";
import FormField from "./FormField";
import Input from "./Input";
import Select from "./Select";
import AudioFileSelector from "./AudioFileSelector";
import { Button } from "../Button";

type ChoiceElement = {
  label: string;
  speech: {
    mode: "tts" | "file";
    lang?: "en" | "fr";
    text?: string;
    fileUrl?: string;
  };
};

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

  const handleAddElement = () => {
    onElementsChange([
      ...elements,
      {
        label: "",
        speech: {
          mode: "tts",
          lang: defaultLang === "english" || defaultLang === "en" ? "en" : defaultLang === "french" || defaultLang === "fr" ? "fr" : "en",
          text: "",
        },
      },
    ]);
  };

  const handleRemoveElement = (index: number) => {
    onElementsChange(elements.filter((_, i) => i !== index));
  };

  const handleElementChange = (index: number, field: keyof ChoiceElement, value: any) => {
    const updated = [...elements];
    if (field === "speech") {
      updated[index] = { ...updated[index], speech: { ...updated[index].speech, ...value } };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onElementsChange(updated);
  };

  const handleSpeechModeChange = (index: number, mode: "tts" | "file") => {
    const element = elements[index];
    const updatedSpeech: ChoiceElement["speech"] = {
      mode,
      lang: element.speech.lang || (defaultLang === "english" || defaultLang === "en" ? "en" : defaultLang === "french" || defaultLang === "fr" ? "fr" : "en"),
    };
    if (mode === "tts") {
      updatedSpeech.text = element.speech.text || element.label;
    } else {
      updatedSpeech.fileUrl = element.speech.fileUrl || "";
    }
    handleElementChange(index, "speech", updatedSpeech);
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
                    onChange={(e) => handleElementChange(index, "label", e.target.value)}
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
                        value={element.speech.lang || defaultLang === "english" || defaultLang === "en" ? "en" : defaultLang === "french" || defaultLang === "fr" ? "fr" : "en"}
                        onChange={(e) => handleElementChange(index, "speech", { ...element.speech, lang: e.target.value as "en" | "fr" })}
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                      </Select>
                    </FormField>
                    <FormField label="Text for TTS">
                      <Input
                        value={element.speech.text || ""}
                        onChange={(e) => handleElementChange(index, "speech", { ...element.speech, text: e.target.value })}
                        placeholder={element.label || "Text to speak"}
                      />
                    </FormField>
                  </>
                ) : (
                  <FormField label="Audio File">
                    <AudioFileSelector
                      bucketName={bucketName}
                      value={element.speech.fileUrl || ""}
                      onChange={(fileUrl) => handleElementChange(index, "speech", { ...element.speech, fileUrl, mode: "file" })}
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

