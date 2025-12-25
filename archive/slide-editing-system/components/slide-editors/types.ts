export type { SlideEditorProps, EditorField, EditorSchema } from "../../lib/slide-editor-registry/types";

/**
 * Shared metadata state used by all slide editors
 */
export type AuthoringMetadataState = {
  code: string;
  slideGoal: string;
  activityName: string;
  requiresExternalTTS: boolean;
  buttons: string[];
  tags: string[];
  difficultyHint: string;
  reviewWeight: number | null;
  showScoreToLearner: boolean;
  isActivity: boolean;
  scoreType: string;
  passingScoreValue: number | null;
  maxScoreValue: number | null;
  passRequiredForNext: boolean;
};
