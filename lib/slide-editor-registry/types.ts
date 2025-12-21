import type { ComponentType } from "react";
import type { Slide } from "../domain/slide";
import type { UpdateSlideInput } from "../data/slides";

export type EditorFieldUiType = "text" | "textarea" | "json" | "number" | "boolean" | "select" | "metadata";

export type EditorField = {
  key: string;
  label: string;
  helpText?: string;
  required?: boolean;
  uiType: EditorFieldUiType;
};

export type EditorSchema = {
  fields: EditorField[];
};

export interface SlideEditorProps {
  row: Slide;
  orderIndex: number;
  groupId: string | null;
  slideType: string;
  schema: EditorSchema;
  onSaveSuccess: () => void;
  saveSlide: (input: UpdateSlideInput) => Promise<{ success: boolean; error?: string }>;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}

export type SlideEditorComponent = ComponentType<SlideEditorProps>;

export type SlideEditorDefinition = {
  type: string;
  label: string;
  editorComponent: SlideEditorComponent;
  schema: EditorSchema;
};
