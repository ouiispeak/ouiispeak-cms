"use client";

import { useState, useEffect } from "react";
import { getAudioFileUrl } from "../../lib/storage/audioFiles";
import Input from "./Input";
import AudioFileSelector from "./AudioFileSelector";
import { uiTokens } from "../../lib/uiTokens";
import { Button } from "../Button";

interface StudentRepeatElement {
  samplePrompt: string;
  referenceText: string;
  audioPath: string; // For mapping to speech.fileUrl
}

interface StudentRepeatElementMapperProps {
  elements: StudentRepeatElement[];
  onElementsChange: (elements: StudentRepeatElement[]) => void;
  bucketName: string;
  defaultLang: string;
}

export default function StudentRepeatElementMapper({
  elements,
  onElementsChange,
  bucketName,
  defaultLang,
}: StudentRepeatElementMapperProps) {
  const [showMapper, setShowMapper] = useState(false);

  function handleElementChange(index: number, field: keyof StudentRepeatElement, value: string) {
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], [field]: value };
    onElementsChange(newElements);
  }

  function handleAddElement() {
    onElementsChange([...elements, { samplePrompt: "", referenceText: "", audioPath: "" }]);
  }

  function handleRemoveElement(index: number) {
    const newElements = elements.filter((_, i) => i !== index);
    onElementsChange(newElements);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center", marginBottom: uiTokens.space.sm }}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowMapper(!showMapper)}
        >
          {showMapper ? "Hide Elements" : "Show Elements Mapper"}
        </Button>
        <span style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
          {elements.length > 0 && `${elements.length} element${elements.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {showMapper && (
        <div
          style={{
            marginTop: uiTokens.space.sm,
            padding: uiTokens.space.md,
            border: `1px solid ${uiTokens.color.border}`,
            borderRadius: uiTokens.radius.md,
            backgroundColor: uiTokens.color.surface,
          }}
        >
          <div style={{ marginBottom: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
            Each element represents a practice item. The student will hear the sample prompt and repeat it.
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: uiTokens.space.sm }}>
            {elements.length === 0 ? (
              <div style={{ textAlign: "center", padding: uiTokens.space.md, color: uiTokens.color.textMuted }}>
                <p>No elements yet. Click "Add Element" to create practice items.</p>
              </div>
            ) : (
              elements.map((element, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: uiTokens.space.sm,
                    padding: uiTokens.space.sm,
                    border: `1px solid ${uiTokens.color.border}`,
                    borderRadius: uiTokens.radius.sm,
                    backgroundColor: uiTokens.color.bg,
                  }}
                >
                  <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center" }}>
                    <span style={{ flex: "0 0 40px", textAlign: "center", fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: uiTokens.font.meta.size, marginBottom: uiTokens.space.xs, color: uiTokens.color.textMuted }}>
                        Sample Prompt (required):
                      </label>
                      <Input
                        type="text"
                        value={element.samplePrompt}
                        onChange={(e) => handleElementChange(index, "samplePrompt", e.target.value)}
                        placeholder={`Element ${index + 1} sample prompt`}
                      />
                    </div>
                    <div style={{ flex: "0 0 auto", paddingTop: uiTokens.space.md }}>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveElement(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: uiTokens.space.sm }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: uiTokens.font.meta.size, marginBottom: uiTokens.space.xs, color: uiTokens.color.textMuted }}>
                        Reference Text (optional):
                      </label>
                      <Input
                        type="text"
                        value={element.referenceText}
                        onChange={(e) => handleElementChange(index, "referenceText", e.target.value)}
                        placeholder="Text for pronunciation matching"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: uiTokens.font.meta.size, marginBottom: uiTokens.space.xs, color: uiTokens.color.textMuted }}>
                        Audio File (optional):
                      </label>
                      <AudioFileSelector
                        bucketName={bucketName}
                        folder="media-assets"
                        value={element.audioPath}
                        onChange={(value) => handleElementChange(index, "audioPath", value)}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddElement}
              style={{ alignSelf: "flex-start" }}
            >
              + Add Element
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

