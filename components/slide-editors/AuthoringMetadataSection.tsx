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
  visibleFieldKeys?: Set<string>;
  variant?: "section" | "inline";
}

export default function AuthoringMetadataSection({
  row,
  slideType,
  onMetadataChange,
  visibleFieldKeys,
  variant = "section",
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
  const [tagsText, setTagsText] = useState(
    Array.isArray(metaJson.tags) ? metaJson.tags.join(", ") : ""
  );
  const [difficultyHint, setDifficultyHint] = useState(metaJson.difficultyHint || "");
  const [reviewWeight, setReviewWeight] = useState<number | null>(
    metaJson.reviewWeight ?? null
  );
  const [showScoreToLearner, setShowScoreToLearner] = useState(
    metaJson.showScoreToLearner || false
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
  const isVisible = (key: string) => !visibleFieldKeys || visibleFieldKeys.has(key);
  const isPassThresholdVisible = isVisible("passThreshold") || isVisible("passingScoreValue");

  // Notify parent of changes
  useEffect(() => {
    const buttons = buttonsText
      .split(",")
      .map((b: string) => b.trim())
      .filter((b: string) => b.length > 0);
    const tags = tagsText
      .split(",")
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    onMetadataChange({
      code,
      slideGoal,
      activityName,
      requiresExternalTTS,
      buttons,
      tags,
      difficultyHint,
      reviewWeight,
      showScoreToLearner,
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
    tagsText,
    difficultyHint,
    reviewWeight,
    showScoreToLearner,
    isActivity,
    scoreType,
    passingScoreValue,
    maxScoreValue,
    passRequiredForNext,
    onMetadataChange,
  ]);

  const content = (
    <>
      {isVisible("code") && (
        <FormField 
          label="Code" 
          borderColor="#b4d5d5"
          infoTooltip="Internal shorthand name for the slide. Used by authors and developers to quickly identify the slide's purpose. Not shown to students."
        >
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </FormField>
      )}

      {isVisible("slideGoal") && (
        <FormField 
          label="Slide goal" 
          borderColor="#b4d5d5"
          infoTooltip="What the learner should achieve by completing this slide. Write in outcome-focused language (understand, practice, notice, produce)."
        >
          <Textarea
            value={slideGoal}
            onChange={(e) => setSlideGoal(e.target.value)}
            rows={3}
          />
        </FormField>
      )}

      {isVisible("activityName") && (
        <FormField 
          label="Activity name" 
          borderColor="#b4d5d5"
          infoTooltip='Human-readable name of the activity pattern. Used for analytics, reuse, and reporting (e.g. "Listen & Repeat", "Choose the Correct Form").'
        >
          <Input
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
          />
        </FormField>
      )}

      {isVisible("requiresExternalTTS") && (
        <FormField 
          label="Requires external TTS" 
          borderColor="#b4d5d5"
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
      )}

      {isVisible("buttons") && (
        <FormField 
          label="Buttons (comma-separated)" 
          borderColor="#b4d5d5"
          infoTooltip="Defines which action buttons appear on this slide. Example: next, replay, hint. Controls UI only, not logic."
        >
          <Input
            type="text"
            value={buttonsText}
            onChange={(e) => setButtonsText(e.target.value)}
            placeholder="e.g., next, replay, hint"
          />
        </FormField>
      )}

      {isVisible("tags") && (
        <FormField 
          label="Tags (comma-separated)" 
          borderColor="#b4d5d5"
          infoTooltip="Internal tags for search, filtering, or batch operations."
        >
          <Input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="e.g., listening, pronunciation"
          />
        </FormField>
      )}

      {isVisible("difficultyHint") && (
        <FormField 
          label="Difficulty hint" 
          borderColor="#b4d5d5"
          infoTooltip="Internal difficulty signal for planning or sequencing."
        >
          <Input
            type="text"
            value={difficultyHint}
            onChange={(e) => setDifficultyHint(e.target.value)}
          />
        </FormField>
      )}

      {isVisible("reviewWeight") && (
        <FormField 
          label="Review weight" 
          borderColor="#b4d5d5"
          infoTooltip="Optional weight for review scheduling."
        >
          <Input
            type="number"
            value={reviewWeight ?? ""}
            onChange={(e) => setReviewWeight(e.target.value === "" ? null : Number(e.target.value))}
            placeholder="Optional"
          />
        </FormField>
      )}

      {isVisible("isActivity") && (
        <FormField 
          label="Is activity" 
          borderColor="#b4d5d5"
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
      )}

      {!isTitleSlide && (
        <>
          {isVisible("scoreType") && (
            <FormField label="Score type" borderColor="#b4d5d5">
              <Select value={scoreType} onChange={(e) => setScoreType(e.target.value)}>
                <option value="none">None</option>
                <option value="confidence">Confidence</option>
                <option value="accuracy">Accuracy</option>
                <option value="percent">Percent (legacy)</option>
                <option value="raw">Raw (legacy)</option>
              </Select>
            </FormField>
          )}

          {isPassThresholdVisible && (
            <FormField label="Pass threshold" borderColor="#b4d5d5">
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
          )}

          {isVisible("maxScoreValue") && (
            <FormField label="Max score" borderColor="#b4d5d5">
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
          )}

          {isVisible("passRequiredForNext") && (
            <FormField label="Pass required for next" borderColor="#b4d5d5">
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
          )}

          {isVisible("showScoreToLearner") && (
            <FormField label="Show score to learner" borderColor="#b4d5d5">
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
                  checked={showScoreToLearner}
                  onChange={(e) => setShowScoreToLearner(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: "pointer",
                  }}
                />
                <span>Expose score results in UI</span>
              </label>
            </FormField>
          )}
        </>
      )}
    </>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <CmsSection title="Authoring metadata" backgroundColor="#e6f1f1" borderColor="#b4d5d5">
      {content}
    </CmsSection>
  );
}
