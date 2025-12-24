import type { AuthoringMetadataState } from "../../components/slide-editors/types";

/**
 * Compares two metadata states to detect changes.
 * Handles arrays (buttons/tags) via JSON.stringify for stable comparison.
 * Handles null/undefined consistently for nullable fields.
 */
function compareMetadata(
  initial: AuthoringMetadataState,
  current: AuthoringMetadataState
): boolean {
  return (
    current.code !== initial.code ||
    current.slideGoal !== initial.slideGoal ||
    current.activityName !== initial.activityName ||
    current.requiresExternalTTS !== initial.requiresExternalTTS ||
    JSON.stringify(current.buttons) !== JSON.stringify(initial.buttons) ||
    JSON.stringify(current.tags) !== JSON.stringify(initial.tags) ||
    current.difficultyHint !== initial.difficultyHint ||
    current.reviewWeight !== initial.reviewWeight ||
    current.showScoreToLearner !== initial.showScoreToLearner ||
    current.isActivity !== initial.isActivity ||
    current.scoreType !== initial.scoreType ||
    current.passingScoreValue !== initial.passingScoreValue ||
    current.maxScoreValue !== initial.maxScoreValue ||
    current.passRequiredForNext !== initial.passRequiredForNext
  );
}

/**
 * Compares two value maps to detect changes.
 * Uses shallow comparison (Object.keys().some()).
 */
function compareValues(
  initial: Record<string, any>,
  current: Record<string, any>
): boolean {
  return Object.keys(current).some((k) => current[k] !== initial[k]);
}

/**
 * Detects unsaved changes by comparing initial and current state.
 * 
 * @param initialValues - Initial editable field values
 * @param currentValues - Current editable field values
 * @param initialMetadata - Initial metadata state
 * @param currentMetadata - Current metadata state
 * @param additionalComparisons - Optional additional comparisons (e.g., phrasesText, jsonText)
 * @returns true if there are unsaved changes, false otherwise
 */
export function hasUnsavedChanges(
  initialValues: Record<string, any>,
  currentValues: Record<string, any>,
  initialMetadata: AuthoringMetadataState,
  currentMetadata: AuthoringMetadataState,
  additionalComparisons?: Array<{ initial: any; current: any }>
): boolean {
  const valuesChanged = compareValues(initialValues, currentValues);
  const metadataChanged = compareMetadata(initialMetadata, currentMetadata);
  
  const additionalChanged = additionalComparisons
    ? additionalComparisons.some(({ initial, current }) => initial !== current)
    : false;

  return valuesChanged || metadataChanged || additionalChanged;
}

