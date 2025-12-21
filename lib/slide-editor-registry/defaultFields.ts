import type { EditorField } from "./types";

// Canonical superset of fields that can appear on any slide editor.
export const DEFAULT_SLIDE_FIELDS: EditorField[] = [
  { key: "title", label: "Title", helpText: "Primary heading for the slide.", required: false, uiType: "text" },
  { key: "subtitle", label: "Subtitle", helpText: "Secondary heading or subtopic.", required: false, uiType: "text" },
  { key: "body", label: "Body", helpText: "Main slide copy shown to learners.", required: false, uiType: "textarea" },
  { key: "note", label: "Note (internal)", helpText: "Author-only notes; not shown to learners.", required: false, uiType: "textarea" },
  { key: "defaultLang", label: "Default language", helpText: "Language hint for TTS or prompts.", required: false, uiType: "text" },
  { key: "phrases", label: "Phrases", helpText: "Scripted phrases content (per type).", required: false, uiType: "textarea" },
  { key: "metadata", label: "Authoring metadata", helpText: "Code, goal, activity flags, scoring settings.", required: false, uiType: "metadata" },
];

