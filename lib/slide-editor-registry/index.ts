import AiSpeakRepeatEditor from "../../components/slide-editors/AiSpeakRepeatEditor";
import DefaultSlideEditor from "../../components/slide-editors/DefaultSlideEditor";
import TextSlideEditor from "../../components/slide-editors/TextSlideEditor";
import TitleSlideEditor from "../../components/slide-editors/TitleSlideEditor";
import type { EditorSchema, SlideEditorDefinition } from "./types";

const defaultEditorSchema: EditorSchema = {
  fields: [
    {
      key: "props_json",
      label: "Props JSON",
      helpText: "Raw JSON payload for slide props.",
      required: true,
      uiType: "json",
    },
    {
      key: "metadata",
      label: "Authoring metadata",
      helpText: "Code, goals, activity flags, buttons, and scoring settings.",
      required: false,
      uiType: "metadata",
    },
  ],
};

const aiSpeakRepeatSchema: EditorSchema = {
  fields: [
    { key: "title", label: "Title", required: true, uiType: "text" },
    { key: "subtitle", label: "Subtitle", required: false, uiType: "text" },
    { key: "note", label: "Note (internal)", required: false, uiType: "textarea" },
    { key: "defaultLang", label: "Default language", required: true, uiType: "text" },
    {
      key: "phrases",
      label: "Phrases",
      helpText: "One phrase per line, flattened into lines[][]",
      required: true,
      uiType: "textarea",
    },
    {
      key: "metadata",
      label: "Authoring metadata",
      helpText: "Code, goal, activity, and scoring fields.",
      required: false,
      uiType: "metadata",
    },
  ],
};

const titleSlideSchema: EditorSchema = {
  fields: [
    { key: "title", label: "Title", required: true, uiType: "text" },
    { key: "subtitle", label: "Subtitle", required: false, uiType: "text" },
    {
      key: "metadata",
      label: "Authoring metadata",
      helpText: "Code, goal, activity flags, and buttons.",
      required: false,
      uiType: "metadata",
    },
  ],
};

const textSlideSchema: EditorSchema = {
  fields: [
    { key: "title", label: "Title", required: false, uiType: "text" },
    { key: "subtitle", label: "Subtitle", required: false, uiType: "text" },
    {
      key: "body",
      label: "Body",
      helpText: "Main slide copy; saves as props_json.body.",
      required: false,
      uiType: "textarea",
    },
    {
      key: "metadata",
      label: "Authoring metadata",
      helpText: "Code, goal, activity, and scoring fields.",
      required: false,
      uiType: "metadata",
    },
  ],
};

const slideEditorRegistry: Record<string, SlideEditorDefinition> = {
  "ai-speak-repeat": {
    type: "ai-speak-repeat",
    label: "AI Speak Repeat",
    editorComponent: AiSpeakRepeatEditor,
    schema: aiSpeakRepeatSchema,
  },
  "title-slide": {
    type: "title-slide",
    label: "Title slide",
    editorComponent: TitleSlideEditor,
    schema: titleSlideSchema,
  },
  "text-slide": {
    type: "text-slide",
    label: "Text slide",
    editorComponent: TextSlideEditor,
    schema: textSlideSchema,
  },
};

const slideEditorAliases: Record<string, SlideEditorDefinition> = {
  title: slideEditorRegistry["title-slide"],
};

export const defaultSlideEditorDefinition: SlideEditorDefinition = {
  type: "default",
  label: "Default (raw JSON)",
  editorComponent: DefaultSlideEditor,
  schema: defaultEditorSchema,
};

export function getSlideEditorDefinition(type?: string | null): SlideEditorDefinition {
  if (!type) {
    return defaultSlideEditorDefinition;
  }

  const normalizedType = type.trim();

  return (
    slideEditorRegistry[normalizedType] ??
    slideEditorAliases[normalizedType] ??
    defaultSlideEditorDefinition
  );
}

export function listSlideEditorDefinitions(): SlideEditorDefinition[] {
  return Object.values(slideEditorRegistry);
}
