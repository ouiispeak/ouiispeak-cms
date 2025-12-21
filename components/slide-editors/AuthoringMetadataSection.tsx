"use client";

import { useState, useEffect } from "react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import CmsSection from "../ui/CmsSection";
import { uiTokens } from "../../lib/uiTokens";
import type { Slide } from "../../lib/domain/slide";
import type { AuthoringMetadataState } from "./types";

interface AuthoringMetadataSectionProps {
  row: Slide;
  slideType: string;
  onMetadataChange: (metadata: AuthoringMetadataState) => void;
}

export default function AuthoringMetadataSection({
  row,
  slideType,
  onMetadataChange,
}: AuthoringMetadataSectionProps) {
  // Initialize state from row data, handling backward compatibility
  const metaJson = (row.metaJson as any) || {};
  const [code, setCode] = useState(row.code || "");
  const [slideGoal, setSlideGoal] = useState(metaJson.slideGoal || "");
  const [activityName, setActivityName] = useState(metaJson.activityName || "");
  const [requiresExternalTTS, setRequiresExternalTTS] = useState(
    metaJson.requires?.externalTTS || false
  );
  const [buttonsText, setButtonsText] = useState(
    Array.isArray(metaJson.buttons) ? metaJson.buttons.join(", ") : ""
  );
  const [isActivity, setIsActivity] = useState(row.isActivity || false);
  const [scoreType, setScoreType] = useState(row.scoreType || "none");
  const [passingScoreValue, setPassingScoreValue] = useState<number | null>(
    row.passingScoreValue ?? null
  );
  const [maxScoreValue, setMaxScoreValue] = useState<number | null>(
    row.maxScoreValue ?? null
  );
  const [passRequiredForNext, setPassRequiredForNext] = useState(
    row.passRequiredForNext || false
  );

  const isTitleSlide = slideType === "title-slide";

  // Notify parent of changes
  useEffect(() => {
    const buttons = buttonsText
      .split(",")
      .map((b: string) => b.trim())
      .filter((b: string) => b.length > 0);

    onMetadataChange({
      code,
      slideGoal,
      activityName,
      requiresExternalTTS,
      buttons,
      isActivity,
      scoreType,
      passingScoreValue,
      maxScoreValue,
      passRequiredForNext,
    });
  }, [
    code,
    slideGoal,
    activityName,
    requiresExternalTTS,
    buttonsText,
    isActivity,
    scoreType,
    passingScoreValue,
    maxScoreValue,
    passRequiredForNext,
    onMetadataChange,
  ]);

  return (
    <CmsSection title="Authoring metadata" backgroundColor="#f8f0ed" borderColor="#f2e1db">
      <FormField 
        label="Code" 
        borderColor="#f2e1db"
        infoTooltip="Internal shorthand name for the slide. Used by authors and developers to quickly identify the slide's purpose. Not shown to students."
      >
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </FormField>

      <FormField 
        label="Slide goal" 
        borderColor="#f2e1db"
        infoTooltip="What the learner should achieve by completing this slide. Write in outcome-focused language (understand, practice, notice, produce)."
      >
        <Textarea
          value={slideGoal}
          onChange={(e) => setSlideGoal(e.target.value)}
          rows={3}
        />
      </FormField>

      <FormField 
        label="Activity name" 
        borderColor="#f2e1db"
        infoTooltip='Human-readable name of the activity pattern. Used for analytics, reuse, and reporting (e.g. "Listen & Repeat", "Choose the Correct Form").'
      >
        <Input
          type="text"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
        />
      </FormField>

      <FormField 
        label="Requires external TTS" 
        borderColor="#f2e1db"
        infoTooltip="Indicates whether this slide depends on external text-to-speech generation. TRUE if audio is generated dynamically. FALSE if audio is pre-recorded or not needed."
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: uiTokens.space.xs,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={requiresExternalTTS}
            onChange={(e) => setRequiresExternalTTS(e.target.checked)}
            style={{
              width: 18,
              height: 18,
              cursor: "pointer",
            }}
          />
          <span>Enable external TTS requirement</span>
        </label>
      </FormField>

      <FormField 
        label="Buttons (comma-separated)" 
        borderColor="#f2e1db"
        infoTooltip="Defines which action buttons appear on this slide. Example: next, replay, hint. Controls UI only, not logic."
      >
        <Input
          type="text"
          value={buttonsText}
          onChange={(e) => setButtonsText(e.target.value)}
          placeholder="e.g., Continue, Skip, Retry"
        />
      </FormField>

      <FormField 
        label="Is activity" 
        borderColor="#f2e1db"
        infoTooltip="Marks whether this slide counts as an interactive activity. TRUE if the learner must perform an action to proceed. FALSE for passive or informational slides."
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: uiTokens.space.xs,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={isActivity}
            onChange={(e) => setIsActivity(e.target.checked)}
            style={{
              width: 18,
              height: 18,
              cursor: "pointer",
            }}
          />
          <span>Mark as activity</span>
        </label>
      </FormField>

      {!isTitleSlide && (
        <>
          <FormField label="Score type" borderColor="#f2e1db">
            <Select value={scoreType} onChange={(e) => setScoreType(e.target.value)}>
              <option value="none">None</option>
              <option value="percent">Percent</option>
              <option value="raw">Raw</option>
            </Select>
          </FormField>

          <FormField label="Passing score" borderColor="#f2e1db">
            <Input
              type="number"
              value={passingScoreValue ?? ""}
              onChange={(e) =>
                setPassingScoreValue(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              placeholder="Optional"
            />
          </FormField>

          <FormField label="Max score" borderColor="#f2e1db">
            <Input
              type="number"
              value={maxScoreValue ?? ""}
              onChange={(e) =>
                setMaxScoreValue(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              placeholder="Optional"
            />
          </FormField>

          <FormField label="Pass required for next" borderColor="#f2e1db">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: uiTokens.space.xs,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={passRequiredForNext}
                onChange={(e) => setPassRequiredForNext(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: "pointer",
                }}
              />
              <span>Require passing score to proceed</span>
            </label>
          </FormField>
        </>
      )}
    </CmsSection>
  );
}

