"use client";

import { useState, useEffect, FormEvent, useMemo, useRef } from "react";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import { Button } from "../Button";
import CmsSection from "../ui/CmsSection";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import { uiTokens } from "../../lib/uiTokens";
import AuthoringMetadataSection from "./AuthoringMetadataSection";
import type { SlideEditorProps } from "./types";
import type { AuthoringMetadataState } from "./types";

export default function AiSpeakRepeatEditor({
  row,
  orderIndex,
  groupId,
  slideType,
  onSaveSuccess,
  saveSlide,
  onUnsavedChangesChange,
}: SlideEditorProps) {
  const [innerState, setInnerState] = useState<
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; slide: RealAiSpeakRepeatSlide }
  >({ status: "loading" });

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [note, setNote] = useState("");
  const [defaultLang, setDefaultLang] = useState("en");
  const [phrasesText, setPhrasesText] = useState("");
  const [metadata, setMetadata] = useState<AuthoringMetadataState>({
    code: row.code || "",
    slideGoal: ((row.metaJson as any) || {}).slideGoal || "",
    activityName: ((row.metaJson as any) || {}).activityName || "",
    requiresExternalTTS: ((row.metaJson as any) || {}).requires?.externalTTS || false,
    buttons: Array.isArray(((row.metaJson as any) || {}).buttons) ? ((row.metaJson as any) || {}).buttons : [],
    isActivity: row.isActivity || false,
    scoreType: row.scoreType || "none",
    passingScoreValue: row.passingScoreValue ?? null,
    maxScoreValue: row.maxScoreValue ?? null,
    passRequiredForNext: row.passRequiredForNext || false,
  });

  const initialDataRef = useRef<{
    title: string;
    subtitle: string;
    note: string;
    defaultLang: string;
    phrasesText: string;
    metadata: AuthoringMetadataState;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [rawJsonExpanded, setRawJsonExpanded] = useState(false);
  const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(row.propsJson ?? {}, null, 2));
  const [rawJsonParseError, setRawJsonParseError] = useState<string | null>(null);
  const [rawJsonSaving, setRawJsonSaving] = useState(false);
  const [rawJsonSaveMessage, setRawJsonSaveMessage] = useState<string | null>(null);

  // Parse and validate slide, populate fields
  useEffect(() => {
    const rawSlide = {
      id: row.id,
      groupId: row.groupId ?? undefined,
      type: row.type,
      props: row.propsJson,
      aidHook: row.aidHook ?? null,
    };

    const result = aiSpeakRepeatSlideSchema.safeParse(rawSlide);

    if (!result.success) {
      console.error(result.error.format());
      setInnerState({
        status: "error",
        message:
          "Validation failed when parsing ai-speak-repeat slide. See console for details.",
      });
      return;
    }

    const slide = result.data;

    setTitle(slide.props.title);
    setSubtitle(slide.props.subtitle ?? "");
    setNote(slide.props.note ?? "");
    setDefaultLang(slide.props.defaultLang ?? "en");

    // Flatten lines[][] → textarea
    const flatPhrases = slide.props.lines
      .flat()
      .map((cell) => cell.label)
      .join("\n");
    setPhrasesText(flatPhrases);
    
    // Store initial values for comparison
    initialDataRef.current = {
      title: slide.props.title,
      subtitle: slide.props.subtitle ?? "",
      note: slide.props.note ?? "",
      defaultLang: slide.props.defaultLang ?? "en",
      phrasesText: flatPhrases,
      metadata: {
        code: row.code || "",
        slideGoal: ((row.metaJson as any) || {}).slideGoal || "",
        activityName: ((row.metaJson as any) || {}).activityName || "",
        requiresExternalTTS: ((row.metaJson as any) || {}).requires?.externalTTS || false,
        buttons: Array.isArray(((row.metaJson as any) || {}).buttons) ? ((row.metaJson as any) || {}).buttons : [],
        isActivity: row.isActivity || false,
        scoreType: row.scoreType || "none",
        passingScoreValue: row.passingScoreValue ?? null,
        maxScoreValue: row.maxScoreValue ?? null,
        passRequiredForNext: row.passRequiredForNext || false,
      },
    };

    setInnerState({ status: "ready", slide });
  }, [row.id, JSON.stringify(row.propsJson), JSON.stringify(row.metaJson), row.code, row.isActivity, row.scoreType, row.passingScoreValue, row.maxScoreValue, row.passRequiredForNext]); // Reset when slide data changes
  
  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current || innerState.status !== "ready") return false;
    const initial = initialDataRef.current;
    return (
      title !== initial.title ||
      subtitle !== initial.subtitle ||
      note !== initial.note ||
      defaultLang !== initial.defaultLang ||
      phrasesText !== initial.phrasesText ||
      metadata.code !== initial.metadata.code ||
      metadata.slideGoal !== initial.metadata.slideGoal ||
      metadata.activityName !== initial.metadata.activityName ||
      metadata.requiresExternalTTS !== initial.metadata.requiresExternalTTS ||
      JSON.stringify(metadata.buttons) !== JSON.stringify(initial.metadata.buttons) ||
      metadata.isActivity !== initial.metadata.isActivity ||
      metadata.scoreType !== initial.metadata.scoreType ||
      metadata.passingScoreValue !== initial.metadata.passingScoreValue ||
      metadata.maxScoreValue !== initial.metadata.maxScoreValue ||
      metadata.passRequiredForNext !== initial.metadata.passRequiredForNext
    );
  }, [title, subtitle, note, defaultLang, phrasesText, metadata, innerState.status]);
  
  // Notify parent of unsaved changes
  useEffect(() => {
    if (onUnsavedChangesChange) {
      onUnsavedChangesChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);

    if (innerState.status !== "ready") return;
    const existingSlide = innerState.slide;

    setSaving(true);

    try {
      // Turn textarea back into lines[][]
      const phraseList = phrasesText
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const newLines = [
        phraseList.map((label) => ({
          label,
          speech: {
            mode: "tts" as const,
            lang: defaultLang || "en",
            text: label,
          },
        })),
      ];

      const newProps = {
        ...existingSlide.props,
        title,
        subtitle: subtitle || undefined,
        note: note || undefined,
        defaultLang,
        lines: newLines,
      };

      const rawSlide = {
        id: existingSlide.id,
        groupId: existingSlide.groupId,
        type: existingSlide.type,
        props: newProps,
        aidHook: existingSlide.aidHook ?? null,
      };

      const parsed = aiSpeakRepeatSlideSchema.safeParse(rawSlide);

      if (!parsed.success) {
        console.error(parsed.error.format());
        setSaveMessage("Validation failed — check console.");
        return;
      }

      const validated = parsed.data;

      const trimmedType = slideType.trim();

      // Build meta_json from metadata state
      const metaJson: any = {};
      if (metadata.slideGoal) metaJson.slideGoal = metadata.slideGoal;
      if (metadata.activityName) metaJson.activityName = metadata.activityName;
      if (metadata.requiresExternalTTS || metadata.buttons.length > 0) {
        metaJson.requires = {};
        if (metadata.requiresExternalTTS) {
          metaJson.requires.externalTTS = true;
        }
      }
      if (metadata.buttons.length > 0) {
        metaJson.buttons = metadata.buttons;
      }

      const result = await saveSlide({
        props_json: validated.props,
        type: trimmedType,
        order_index: orderIndex,
        group_id: groupId ?? undefined,
        code: metadata.code || null,
        meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
        is_activity: metadata.isActivity,
        score_type: metadata.scoreType || "none",
        passing_score_value: metadata.passingScoreValue,
        max_score_value: metadata.maxScoreValue,
        pass_required_for_next: metadata.passRequiredForNext,
      });

      if (!result.success) {
        setSaveMessage("Update error: " + (result.error || "Unknown error"));
        return;
      }

      setInnerState({ status: "ready", slide: validated });
      setSaveMessage("Saved successfully!");
      
      // Update initial data ref after successful save
      initialDataRef.current = {
        title,
        subtitle,
        note,
        defaultLang,
        phrasesText,
        metadata: { ...metadata },
      };
      
      // Explicitly notify parent that there are no unsaved changes
      if (onUnsavedChangesChange) {
        onUnsavedChangesChange(false);
      }
      
      onSaveSuccess();
    } finally {
      setSaving(false);
    }
  }

  if (innerState.status === "loading") {
    return <p>Validating slide…</p>;
  }

  if (innerState.status === "error") {
    return (
      <CmsSection title="ai-speak-repeat editor error" description={innerState.message} backgroundColor="#f8f0ed" borderColor="#f2e1db">
        <p style={{ color: uiTokens.color.danger }}>{innerState.message}</p>
      </CmsSection>
    );
  }

  const slide = innerState.slide;

  return (
    <>
      <CmsSection
        title="ai-speak-repeat editor"
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
        description={
          <>
            Editing slide <code className="codeText">{slide.id}</code> in group{" "}
            <code className="codeText">{slide.groupId ?? "none"}</code>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <FormField 
            label="Slide title" 
            required 
            borderColor="#f2e1db"
            infoTooltip="Main heading shown to the student. Should clearly state what the learner is about to do or focus on."
          >
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

          <FormField 
            label="Subtitle" 
            borderColor="#f2e1db"
            infoTooltip="Supporting or clarifying text shown under the title. Used for instructions, context, or tone. Leave empty if unnecessary."
          >
            <Input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </FormField>

          <FormField label="Note" borderColor="#f2e1db">
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </FormField>

          <FormField label="Default language" required borderColor="#f2e1db">
            <Input
              type="text"
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value)}
            />
          </FormField>

          <FormField label="Phrases (one per line)" required borderColor="#f2e1db">
            <Textarea
              value={phrasesText}
              onChange={(e) => setPhrasesText(e.target.value)}
              rows={6}
              style={{ fontFamily: "monospace" }}
            />
          </FormField>

        </form>

        {saveMessage && (
          <p
            style={{
              marginTop: uiTokens.space.md,
              color: saveMessage.includes("error") ? uiTokens.color.danger : "green",
            }}
          >
            {saveMessage}
          </p>
        )}
      </CmsSection>

      <AuthoringMetadataSection
        row={row}
        slideType={slideType}
        onMetadataChange={setMetadata}
      />

      <CmsSection
        title="Raw props_json (advanced)"
        backgroundColor="#f8f0ed"
        borderColor="#f2e1db"
        actions={
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => setRawJsonExpanded(!rawJsonExpanded)}
          >
            {rawJsonExpanded ? "▼" : "▶"} {rawJsonExpanded ? "Collapse" : "Expand"}
          </Button>
        }
      >
        {rawJsonExpanded && (
          <div>
            <Textarea
              value={rawJsonText}
              onChange={(e) => {
                setRawJsonText(e.target.value);
                setRawJsonParseError(null);
              }}
              rows={15}
              style={{ fontFamily: "monospace", fontSize: uiTokens.font.code.size }}
            />
            {rawJsonParseError && (
              <p style={{ color: uiTokens.color.danger, marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
                {rawJsonParseError}
              </p>
            )}
            <div style={{ marginTop: uiTokens.space.md, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="button"
                onClick={async () => {
                  setRawJsonParseError(null);
                  setRawJsonSaveMessage(null);
                  setRawJsonSaving(true);

                  try {
                    let parsedJson: unknown;
                    try {
                      parsedJson = JSON.parse(rawJsonText);
                    } catch (parseErr) {
                      setRawJsonParseError("Invalid JSON: " + (parseErr instanceof Error ? parseErr.message : String(parseErr)));
                      return;
                    }

                    // Remove bodies if present (legacy support - we only use body)
                    if (parsedJson && typeof parsedJson === 'object' && 'bodies' in parsedJson) {
                      const { bodies, ...rest } = parsedJson as any;
                      parsedJson = rest;
                    }

                    const trimmedType = slideType.trim();

                    // Build meta_json from current metadata state
                    const metaJson: any = {};
                    if (metadata.slideGoal) metaJson.slideGoal = metadata.slideGoal;
                    if (metadata.activityName) metaJson.activityName = metadata.activityName;
                    if (metadata.requiresExternalTTS || metadata.buttons.length > 0) {
                      metaJson.requires = {};
                      if (metadata.requiresExternalTTS) {
                        metaJson.requires.externalTTS = true;
                      }
                    }
                    if (metadata.buttons.length > 0) {
                      metaJson.buttons = metadata.buttons;
                    }

                    const result = await saveSlide({
                      props_json: parsedJson,
                      type: trimmedType,
                      code: metadata.code || null,
                      meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
                      is_activity: metadata.isActivity,
                      score_type: metadata.scoreType || "none",
                      passing_score_value: metadata.passingScoreValue,
                      max_score_value: metadata.maxScoreValue,
                      pass_required_for_next: metadata.passRequiredForNext,
                    });

                    if (!result.success) {
                      setRawJsonSaveMessage("Update error: " + (result.error || "Unknown error"));
                      return;
                    }

                    setRawJsonSaveMessage("Saved successfully!");
                    // Update the textarea to reflect the saved value (in case it was normalized)
                    setRawJsonText(JSON.stringify(parsedJson, null, 2));
                  } finally {
                    setRawJsonSaving(false);
                  }
                }}
                disabled={rawJsonSaving}
              >
                {rawJsonSaving ? "Saving…" : "Save JSON"}
              </Button>
            </div>
            {rawJsonSaveMessage && (
              <p
                style={{
                  marginTop: uiTokens.space.xs,
                  color: rawJsonSaveMessage.includes("error") ? uiTokens.color.danger : "green",
                  fontSize: uiTokens.font.meta.size,
                }}
              >
                {rawJsonSaveMessage}
              </p>
            )}
          </div>
        )}
      </CmsSection>

      <CmsSection title="Current slide data" backgroundColor="#f8f0ed" borderColor="#f2e1db">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(slide, null, 2)}
        </pre>
      </CmsSection>
    </>
  );
}
