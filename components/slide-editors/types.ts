import type { Slide } from "../../lib/domain/slide";

/**
 * Shared metadata state used by all slide editors
 */
export type AuthoringMetadataState = {
  code: string;
  slideGoal: string;
  activityName: string;
  requiresExternalTTS: boolean;
  buttons: string[];
  isActivity: boolean;
  scoreType: string;
  passingScoreValue: number | null;
  maxScoreValue: number | null;
  passRequiredForNext: boolean;
};

/**
 * Props shared by all slide editor components
 */
export interface SlideEditorProps {
  row: Slide;
  orderIndex: number;
  groupId: string | null;
  slideType: string;
  onSaveSuccess: () => void;
  saveSlide: (input: import("../../lib/data/slides").UpdateSlideInput) => Promise<{ success: boolean; error?: string }>;
}

