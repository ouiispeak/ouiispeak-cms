import type { Slide } from "../domain/slide";
import type { AuthoringMetadataState } from "../../components/slide-editors/types";

/**
 * Builds initial AuthoringMetadataState from a Slide row.
 * Handles null/undefined metaJson gracefully and provides safe defaults.
 */
export function buildInitialMetadataState(row: Slide): AuthoringMetadataState {
  const metaJson = (row.metaJson as any) || {};

  return {
    code: row.code || "",
    slideGoal: metaJson.slideGoal || "",
    activityName: metaJson.activityName || "",
    requiresExternalTTS: metaJson.requires?.externalTTS || false,
    buttons: Array.isArray(metaJson.buttons) ? metaJson.buttons : [],
    tags: Array.isArray(metaJson.tags) ? metaJson.tags : [],
    difficultyHint: metaJson.difficultyHint || "",
    reviewWeight: metaJson.reviewWeight ?? null,
    showScoreToLearner: metaJson.showScoreToLearner || false,
    isActivity: row.isActivity || false,
    scoreType: row.scoreType || "none",
    passingScoreValue: row.passingScoreValue ?? null,
    maxScoreValue: row.maxScoreValue ?? null,
    passRequiredForNext: row.passRequiredForNext || false,
  };
}

/**
 * Serializes AuthoringMetadataState into meta_json format for saving.
 * Only includes keys when they have meaningful values (avoids empty strings/arrays unless previously set).
 * Maintains the exact meta_json shape used by the save handlers.
 */
export function buildMetaJson(metadata: AuthoringMetadataState): Record<string, any> {
  const metaJson: Record<string, any> = {};

  // Only include slideGoal if it has a value
  if (metadata.slideGoal) {
    metaJson.slideGoal = metadata.slideGoal;
  }

  // Only include activityName if it has a value
  if (metadata.activityName) {
    metaJson.activityName = metadata.activityName;
  }

  // Build requires object if externalTTS is needed or buttons are present
  if (metadata.requiresExternalTTS || metadata.buttons.length > 0) {
    metaJson.requires = {};
    if (metadata.requiresExternalTTS) {
      metaJson.requires.externalTTS = true;
    }
  }

  // Only include buttons if array is non-empty
  if (metadata.buttons.length > 0) {
    metaJson.buttons = metadata.buttons;
  }

  // Only include tags if array is non-empty
  if (metadata.tags.length > 0) {
    metaJson.tags = metadata.tags;
  }

  // Only include difficultyHint if it has a value
  if (metadata.difficultyHint) {
    metaJson.difficultyHint = metadata.difficultyHint;
  }

  // Include reviewWeight if it's not null/undefined
  if (metadata.reviewWeight !== null && metadata.reviewWeight !== undefined) {
    metaJson.reviewWeight = metadata.reviewWeight;
  }

  // Include showScoreToLearner if true
  if (metadata.showScoreToLearner) {
    metaJson.showScoreToLearner = true;
  }

  return metaJson;
}

