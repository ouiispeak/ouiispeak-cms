import AiSpeakRepeatEditor from "../../components/slide-editors/AiSpeakRepeatEditor";
import DefaultSlideEditor from "../../components/slide-editors/DefaultSlideEditor";
import TextSlideEditor from "../../components/slide-editors/TextSlideEditor";
import TitleSlideEditor from "../../components/slide-editors/TitleSlideEditor";
import RawJsonEditor from "../../components/slide-editors/RawJsonEditor";
import { DEFAULT_SLIDE_FIELDS } from "./defaultFields";
import { getVisibleFieldsForType } from "./presets";
import type { EditorSchema, SlideEditorDefinition } from "./types";

export const defaultSlideEditorDefinition: SlideEditorDefinition = {
  type: "default",
  label: "Default",
  editorComponent: DefaultSlideEditor,
};

export const rawJsonEditorDefinition: SlideEditorDefinition = {
  type: "raw-json",
  label: "Raw JSON",
  editorComponent: RawJsonEditor,
};

const slideEditorRegistry: Record<string, SlideEditorDefinition> = {
  default: defaultSlideEditorDefinition,
  "ai-speak-repeat": {
    type: "ai-speak-repeat",
    label: "AI Speak Repeat",
    editorComponent: AiSpeakRepeatEditor,
  },
  "title-slide": {
    type: "title-slide",
    label: "Title slide",
    editorComponent: TitleSlideEditor,
  },
  "text-slide": {
    type: "text-slide",
    label: "Text slide",
    editorComponent: TextSlideEditor,
  },
};

const slideEditorAliases: Record<string, SlideEditorDefinition> = {
  title: slideEditorRegistry["title-slide"],
  text: defaultSlideEditorDefinition,
};

export function getSlideEditorDefinition(type?: string | null): SlideEditorDefinition {
  if (!type || !type.trim()) {
    return defaultSlideEditorDefinition;
  }

  const normalizedType = type.trim();

  // Check registry first (includes "text-slide" which has its own definition)
  if (slideEditorRegistry[normalizedType]) {
    return slideEditorRegistry[normalizedType];
  }

  // Check aliases (but NOT "text-slide" - that's already handled above)
  if (slideEditorAliases[normalizedType]) {
    return slideEditorAliases[normalizedType];
  }

  // Special case: "text" maps to default, but "text-slide" should use its own definition
  // (handled above by registry check)
  if (normalizedType === "text") {
    return defaultSlideEditorDefinition;
  }

  // Fallback to raw JSON editor for unknown types
  return rawJsonEditorDefinition;
}

export function listSlideEditorDefinitions(): SlideEditorDefinition[] {
  return Object.values(slideEditorRegistry);
}

export function getVisibleSchemaForType(type?: string | null): EditorSchema {
  return { fields: getVisibleFieldsForType(type) };
}

export { DEFAULT_SLIDE_FIELDS };
