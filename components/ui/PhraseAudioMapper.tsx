"use client";

import { useState, useEffect } from "react";
import { getAudioFileUrl } from "../../lib/storage/audioFiles";
import Input from "./Input";
import AudioFileSelector from "./AudioFileSelector";
import { uiTokens } from "../../lib/uiTokens";
import { Button } from "../Button";

interface PhraseAudioPair {
  phrase: string;
  audioPath: string;
}

interface PhraseAudioMapperProps {
  phrases: string; // Newline-separated phrases
  audioPaths: string; // Newline-separated audio paths (same order as phrases)
  onPhrasesChange: (phrases: string) => void;
  onAudioPathsChange: (audioPaths: string) => void;
  bucketName: string;
}

export default function PhraseAudioMapper({
  phrases,
  audioPaths,
  onPhrasesChange,
  onAudioPathsChange,
  bucketName,
}: PhraseAudioMapperProps) {
  const [pairs, setPairs] = useState<PhraseAudioPair[]>([]);
  const [showMapper, setShowMapper] = useState(false);

  // Parse phrases and audio paths into pairs
  useEffect(() => {
    const phraseList = phrases.split("\n").map((p) => p.trim()).filter((p) => p.length > 0);
    const audioList = audioPaths.split("\n").map((a) => a.trim()).filter((a) => a.length > 0);
    
    // Create pairs, ensuring we have entries for all phrases
    const newPairs: PhraseAudioPair[] = phraseList.map((phrase, index) => ({
      phrase,
      audioPath: audioList[index] || "",
    }));
    
    setPairs(newPairs);
  }, [phrases, audioPaths]);

  // Update phrases when pairs change
  function updatePairs(newPairs: PhraseAudioPair[]) {
    setPairs(newPairs);
    onPhrasesChange(newPairs.map((p) => p.phrase).join("\n"));
    onAudioPathsChange(newPairs.map((p) => p.audioPath).join("\n"));
  }

  function handlePhraseChange(index: number, value: string) {
    const newPairs = [...pairs];
    newPairs[index].phrase = value;
    updatePairs(newPairs);
  }

  function handleAudioChange(index: number, value: string) {
    const newPairs = [...pairs];
    newPairs[index].audioPath = value;
    updatePairs(newPairs);
  }

  function handleAddRow() {
    updatePairs([...pairs, { phrase: "", audioPath: "" }]);
  }

  function handleRemoveRow(index: number) {
    const newPairs = pairs.filter((_, i) => i !== index);
    updatePairs(newPairs);
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
          {showMapper ? "Hide Mapper" : "Show Phrase-Audio Mapper"}
        </Button>
        <span style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
          {pairs.length > 0 && `${pairs.length} phrase${pairs.length !== 1 ? "s" : ""} mapped`}
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
            Map each phrase to its corresponding audio file. The order matters - phrase 1 maps to audio 1, etc.
          </div>
          
          {pairs.length === 0 ? (
            <div style={{ textAlign: "center", padding: uiTokens.space.md, color: uiTokens.color.textMuted }}>
              <p>No phrases yet. Enter phrases in the textarea above, then click "Show Phrase-Audio Mapper".</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: uiTokens.space.sm }}>
              {pairs.map((pair, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: uiTokens.space.sm,
                    alignItems: "flex-start",
                    padding: uiTokens.space.sm,
                    border: `1px solid ${uiTokens.color.border}`,
                    borderRadius: uiTokens.radius.sm,
                    backgroundColor: uiTokens.color.bg,
                  }}
                >
                  <div style={{ flex: "0 0 40px", textAlign: "center", paddingTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: uiTokens.font.meta.size, marginBottom: uiTokens.space.xs, color: uiTokens.color.textMuted }}>
                      Phrase:
                    </label>
                    <Input
                      type="text"
                      value={pair.phrase}
                      onChange={(e) => handlePhraseChange(index, e.target.value)}
                      placeholder={`Phrase ${index + 1}`}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: uiTokens.font.meta.size, marginBottom: uiTokens.space.xs, color: uiTokens.color.textMuted }}>
                      Audio File:
                    </label>
                    <AudioFileSelector
                      bucketName={bucketName}
                      value={pair.audioPath}
                      onChange={(value) => handleAudioChange(index, value)}
                    />
                  </div>
                  <div style={{ flex: "0 0 auto", paddingTop: uiTokens.space.md }}>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveRow(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddRow}
                style={{ alignSelf: "flex-start" }}
              >
                + Add Row
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

