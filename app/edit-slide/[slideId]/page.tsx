"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../../lib/realSlideSchema";
import { Button } from "../../../components/Button";
import PageShell from "../../../components/ui/PageShell";
import CmsSection from "../../../components/ui/CmsSection";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import { uiTokens } from "../../../lib/uiTokens";

type SlideRow = {
  id: string;
  lesson_id: string;
  group_id: string | null;
  order_index: number | null;
  type: string;
  props_json: unknown;
  aid_hook: string | null;
  code: string | null;
  meta_json: unknown;
  is_activity: boolean | null;
  score_type: string | null;
  passing_score_value: number | null;
  max_score_value: number | null;
  pass_required_for_next: boolean | null;
};

type GroupRow = {
  id: string;
  title: string;
  order_index: number | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; row: SlideRow; groups: GroupRow[] };

export default function EditSlidePage() {
  const params = useParams<{ slideId: string }>();
  const slideId = params?.slideId;

  const [loadState, setLoadState] = useState<LoadState>({
    status: "loading",
  });
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [slideType, setSlideType] = useState<string>("");

  useEffect(() => {
    if (!slideId) {
      setLoadState({
        status: "error",
        message: "No slideId provided in URL.",
      });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data: slideData, error: slideError } = await supabase
        .from("slides")
        .select("id, lesson_id, group_id, order_index, type, props_json, aid_hook, code, meta_json, is_activity, score_type, passing_score_value, max_score_value, pass_required_for_next")
        .eq("id", slideId)
        .maybeSingle();

      if (slideError) {
        setLoadState({
          status: "error",
          message: `Supabase error: ${slideError.message}`,
        });
        return;
      }

      if (!slideData) {
        setLoadState({
          status: "error",
          message: `No slide found with id "${slideId}"`,
        });
        return;
      }

      const slide = slideData as SlideRow;

      // Load groups for the lesson
      const { data: groupsData, error: groupsError } = await supabase
        .from("lesson_groups")
        .select("id, title, order_index")
        .eq("lesson_id", slide.lesson_id)
        .order("order_index", { ascending: true });

      if (groupsError) {
        setLoadState({
          status: "error",
          message: `Error loading groups: ${groupsError.message}`,
        });
        return;
      }

      setOrderIndex(slide.order_index ?? 1);
      setSelectedGroupId(slide.group_id ?? "");
      setSlideType(slide.type ?? "");

      setLoadState({
        status: "ready",
        row: slide,
        groups: (groupsData ?? []) as GroupRow[],
      });
    }

    load();
  }, [slideId]);

  return (
    <PageShell
      title="Edit slide"
      maxWidth={720}
      meta={
        <>
          URL slide id: <code className="codeText">{slideId}</code>
        </>
      }
    >
      {loadState.status === "loading" && <p>Loading slide…</p>}

      {loadState.status === "error" && (
        <CmsSection title="Error" description={loadState.message}>
          <p style={{ color: uiTokens.color.danger }}>{loadState.message}</p>
        </CmsSection>
      )}

      {loadState.status === "ready" && (
        <>
          {/* Slide type input */}
          <CmsSection title="Slide Type">
            <FormField label="Slide type" required>
              <Input
                type="text"
                value={slideType}
                onChange={(e) => setSlideType(e.target.value)}
              />
            </FormField>
          </CmsSection>

          {/* Order and Group controls */}
          <CmsSection title="Placement">
            <div style={{ display: "flex", gap: uiTokens.space.md, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px" }}>
                <FormField label="Group">
                  <Select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                  >
                    <option value="">(no group)</option>
                    {loadState.groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
              <div style={{ flex: "1 1 200px" }}>
                <FormField label="Order index" required>
                  <Input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    min={1}
                  />
                </FormField>
              </div>
            </div>
          </CmsSection>

          {(() => {
            const type = (loadState.row.type ?? "").trim();
            // Capture groups for reload callback
            const currentGroups = loadState.groups;

            const reloadSlide = async () => {
              if (!slideId) return;
              
              const { data: slideData, error: slideError } = await supabase
                .from("slides")
                .select("id, lesson_id, group_id, order_index, type, props_json, aid_hook, code, meta_json, is_activity, score_type, passing_score_value, max_score_value, pass_required_for_next")
                .eq("id", slideId)
                .maybeSingle();

              if (!slideError && slideData) {
                const slide = slideData as SlideRow;
                setOrderIndex(slide.order_index ?? 1);
                setSelectedGroupId(slide.group_id ?? "");
                setSlideType(slide.type ?? "");
                setLoadState({
                  status: "ready",
                  row: slide,
                  groups: currentGroups,
                });
              }
            };

            if (type === "ai-speak-repeat") {
              return (
                <AiSpeakRepeatEditor
                  row={loadState.row}
                  orderIndex={orderIndex}
                  groupId={selectedGroupId || null}
                  slideType={slideType}
                  onSaveSuccess={reloadSlide}
                />
              );
            } else if (type === "title-slide") {
              return (
                <TitleSlideEditor
                  row={loadState.row}
                  orderIndex={orderIndex}
                  groupId={selectedGroupId || null}
                  slideType={slideType}
                  onSaveSuccess={reloadSlide}
                />
              );
            } else if (type === "text-slide") {
              return (
                <TextSlideEditor
                  row={loadState.row}
                  orderIndex={orderIndex}
                  groupId={selectedGroupId || null}
                  slideType={slideType}
                  onSaveSuccess={reloadSlide}
                />
              );
            } else {
              return (
                <RawJsonEditor
                  row={loadState.row}
                  orderIndex={orderIndex}
                  groupId={selectedGroupId || null}
                  slideType={slideType}
                  onSaveSuccess={reloadSlide}
                />
              );
            }
          })()}
        </>
      )}
    </PageShell>
  );
}

function AiSpeakRepeatEditor({
  row,
  orderIndex,
  groupId,
  slideType,
  onSaveSuccess,
}: {
  row: SlideRow;
  orderIndex: number;
  groupId: string | null;
  slideType: string;
  onSaveSuccess: () => void;
}) {
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
      slideGoal: ((row.meta_json as any) || {}).slideGoal || "",
      activityName: ((row.meta_json as any) || {}).activityName || "",
      requiresExternalTTS: ((row.meta_json as any) || {}).requires?.externalTTS || false,
      buttons: Array.isArray(((row.meta_json as any) || {}).buttons) ? ((row.meta_json as any) || {}).buttons : [],
      isActivity: row.is_activity || false,
      scoreType: row.score_type || "none",
      passingScoreValue: row.passing_score_value ?? null,
      maxScoreValue: row.max_score_value ?? null,
      passRequiredForNext: row.pass_required_for_next || false,
    });
  
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [rawJsonExpanded, setRawJsonExpanded] = useState(false);
    const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(row.props_json ?? {}, null, 2));
    const [rawJsonParseError, setRawJsonParseError] = useState<string | null>(null);
    const [rawJsonSaving, setRawJsonSaving] = useState(false);
    const [rawJsonSaveMessage, setRawJsonSaveMessage] = useState<string | null>(null);
  
    // Parse and validate slide, populate fields
    useEffect(() => {
      const rawSlide = {
        id: row.id,
        groupId: row.group_id ?? undefined,
        type: row.type,
        props: row.props_json,
        aidHook: row.aid_hook ?? null,
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
  
      setInnerState({ status: "ready", slide });
    }, [row]);
  
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

        const { error: updateError } = await supabase
          .from("slides")
          .update({
            props_json: validated.props,
            type: trimmedType,
            order_index: orderIndex,
            group_id: groupId,
            code: metadata.code || null,
            meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
            is_activity: metadata.isActivity,
            score_type: metadata.scoreType || "none",
            passing_score_value: metadata.passingScoreValue,
            max_score_value: metadata.maxScoreValue,
            pass_required_for_next: metadata.passRequiredForNext,
          })
          .eq("id", validated.id);

        if (updateError) {
          setSaveMessage("Supabase update error: " + updateError.message);
          return;
        }

        setInnerState({ status: "ready", slide: validated });
        setSaveMessage("Saved successfully!");
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
        <CmsSection title="ai-speak-repeat editor error" description={innerState.message}>
          <p style={{ color: uiTokens.color.danger }}>{innerState.message}</p>
        </CmsSection>
      );
    }
  
    const slide = innerState.slide;
  
    return (
      <>
        <CmsSection
          title="ai-speak-repeat editor"
          description={
            <>
              Editing slide <code className="codeText">{slide.id}</code> in group{" "}
              <code className="codeText">{slide.groupId ?? "none"}</code>
            </>
          }
        >
          <form onSubmit={handleSave}>
            <FormField label="Slide title" required>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormField>

            <FormField label="Subtitle">
              <Input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </FormField>

            <FormField label="Note">
              <Input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </FormField>

            <FormField label="Default language" required>
              <Input
                type="text"
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value)}
              />
            </FormField>

            <FormField label="Phrases (one per line)" required>
              <Textarea
                value={phrasesText}
                onChange={(e) => setPhrasesText(e.target.value)}
                rows={6}
                style={{ fontFamily: "monospace" }}
              />
            </FormField>

            <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
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

                      const { error: updateError } = await supabase
                        .from("slides")
                        .update({
                          props_json: parsedJson,
                          type: trimmedType,
                          code: metadata.code || null,
                          meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
                          is_activity: metadata.isActivity,
                          score_type: metadata.scoreType || "none",
                          passing_score_value: metadata.passingScoreValue,
                          max_score_value: metadata.maxScoreValue,
                          pass_required_for_next: metadata.passRequiredForNext,
                        })
                        .eq("id", row.id);

                      if (updateError) {
                        setRawJsonSaveMessage("Supabase update error: " + updateError.message);
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
  
        <CmsSection title="Current slide data">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(slide, null, 2)}
          </pre>
        </CmsSection>
      </>
    );
  }

type AuthoringMetadataState = {
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

function AuthoringMetadataSection({
  row,
  slideType,
  onMetadataChange,
}: {
  row: SlideRow;
  slideType: string;
  onMetadataChange: (metadata: AuthoringMetadataState) => void;
}) {
  // Initialize state from row data, handling backward compatibility
  const metaJson = (row.meta_json as any) || {};
  const [code, setCode] = useState(row.code || "");
  const [slideGoal, setSlideGoal] = useState(metaJson.slideGoal || "");
  const [activityName, setActivityName] = useState(metaJson.activityName || "");
  const [requiresExternalTTS, setRequiresExternalTTS] = useState(
    metaJson.requires?.externalTTS || false
  );
  const [buttonsText, setButtonsText] = useState(
    Array.isArray(metaJson.buttons) ? metaJson.buttons.join(", ") : ""
  );
  const [isActivity, setIsActivity] = useState(row.is_activity || false);
  const [scoreType, setScoreType] = useState(row.score_type || "none");
  const [passingScoreValue, setPassingScoreValue] = useState<number | null>(
    row.passing_score_value ?? null
  );
  const [maxScoreValue, setMaxScoreValue] = useState<number | null>(
    row.max_score_value ?? null
  );
  const [passRequiredForNext, setPassRequiredForNext] = useState(
    row.pass_required_for_next || false
  );

  const isTitleSlide = slideType === "title-slide";

  // Notify parent of changes
  useEffect(() => {
    const buttons = buttonsText
      .split(",")
      .map((b: string) => b.trim())
      .filter((b: string) => b.length > 0);

    onMetadataChange({
      code,
      slideGoal,
      activityName,
      requiresExternalTTS,
      buttons,
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
    isActivity,
    scoreType,
    passingScoreValue,
    maxScoreValue,
    passRequiredForNext,
    onMetadataChange,
  ]);

  return (
    <CmsSection title="Authoring metadata">
      <FormField label="Code">
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </FormField>

      <FormField label="Slide goal">
        <Textarea
          value={slideGoal}
          onChange={(e) => setSlideGoal(e.target.value)}
          rows={3}
        />
      </FormField>

      <FormField label="Activity name">
        <Input
          type="text"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
        />
      </FormField>

      <FormField label="Requires external TTS">
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

      <FormField label="Buttons (comma-separated)">
        <Input
          type="text"
          value={buttonsText}
          onChange={(e) => setButtonsText(e.target.value)}
          placeholder="e.g., Continue, Skip, Retry"
        />
      </FormField>

      <FormField label="Is activity">
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

      {!isTitleSlide && (
        <>
          <FormField label="Score type">
            <Select value={scoreType} onChange={(e) => setScoreType(e.target.value)}>
              <option value="none">None</option>
              <option value="percent">Percent</option>
              <option value="raw">Raw</option>
            </Select>
          </FormField>

          <FormField label="Passing score">
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

          <FormField label="Max score">
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

          <FormField label="Pass required for next">
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
        </>
      )}
    </CmsSection>
  );
}

function TitleSlideEditor({
  row,
  orderIndex,
  groupId,
  slideType,
  onSaveSuccess,
}: {
  row: SlideRow;
  orderIndex: number;
  groupId: string | null;
  slideType: string;
  onSaveSuccess: () => void;
}) {
  const props = (row.props_json as any) || {};
  const [title, setTitle] = useState(props.title || "");
  const [subtitle, setSubtitle] = useState(props.subtitle || "");
  const [metadata, setMetadata] = useState<AuthoringMetadataState>({
    code: row.code || "",
    slideGoal: ((row.meta_json as any) || {}).slideGoal || "",
    activityName: ((row.meta_json as any) || {}).activityName || "",
    requiresExternalTTS: ((row.meta_json as any) || {}).requires?.externalTTS || false,
    buttons: Array.isArray(((row.meta_json as any) || {}).buttons) ? ((row.meta_json as any) || {}).buttons : [],
    isActivity: row.is_activity || false,
    scoreType: row.score_type || "none",
    passingScoreValue: row.passing_score_value ?? null,
    maxScoreValue: row.max_score_value ?? null,
    passRequiredForNext: row.pass_required_for_next || false,
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [rawJsonExpanded, setRawJsonExpanded] = useState(false);
  const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(row.props_json ?? {}, null, 2));
  const [rawJsonParseError, setRawJsonParseError] = useState<string | null>(null);
  const [rawJsonSaving, setRawJsonSaving] = useState(false);
  const [rawJsonSaveMessage, setRawJsonSaveMessage] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);
    setSaving(true);

    try {
      const newProps: any = { title };
      if (subtitle.trim()) {
        newProps.subtitle = subtitle;
      }

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

      const { error: updateError } = await supabase
        .from("slides")
        .update({
          props_json: newProps,
          type: trimmedType,
          order_index: orderIndex,
          group_id: groupId,
          code: metadata.code || null,
          meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
          is_activity: metadata.isActivity,
          score_type: "none",
          passing_score_value: null,
          max_score_value: null,
          pass_required_for_next: false,
        })
        .eq("id", row.id);

      if (updateError) {
        setSaveMessage("Supabase update error: " + updateError.message);
        return;
      }

      setSaveMessage("Saved successfully!");
      onSaveSuccess();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <CmsSection
        title="title-slide editor"
        description={
          <>
            UUID: <code className="codeText">{row.id}</code>
            <br />
            Group UUID: <code className="codeText">{row.group_id ?? "none"}</code>
          </>
        }
      >

        <form onSubmit={handleSave}>
          <FormField label="Title" required>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Subtitle (optional)">
            <Input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </FormField>

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
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

      <CmsSection>
        <button
          type="button"
          onClick={() => setRawJsonExpanded(!rawJsonExpanded)}
          style={{
            padding: "4px 8px",
            fontSize: 13,
            borderRadius: 4,
            border: "1px solid #ccc",
            backgroundColor: rawJsonExpanded ? "#f0f0f0" : "#fff",
            cursor: "pointer",
            marginBottom: rawJsonExpanded ? 16 : 0,
          }}
        >
          {rawJsonExpanded ? "▼" : "▶"} Raw props_json (advanced)
        </button>

        {rawJsonExpanded && (
          <div>
            <textarea
              value={rawJsonText}
              onChange={(e) => {
                setRawJsonText(e.target.value);
                setRawJsonParseError(null);
              }}
              rows={15}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontFamily: "monospace",
                fontSize: 13,
              }}
            />
            {rawJsonParseError && (
              <p style={{ color: "red", marginTop: 8, fontSize: 13 }}>
                {rawJsonParseError}
              </p>
            )}
            <div style={{ marginTop: uiTokens.space.xs, display: "flex", justifyContent: "flex-end" }}>
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

                    const { error: updateError } = await supabase
                      .from("slides")
                      .update({
                        props_json: parsedJson,
                        type: trimmedType,
                        code: metadata.code || null,
                        meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
                        is_activity: metadata.isActivity,
                        score_type: metadata.scoreType || "none",
                        passing_score_value: metadata.passingScoreValue,
                        max_score_value: metadata.maxScoreValue,
                        pass_required_for_next: metadata.passRequiredForNext,
                      })
                      .eq("id", row.id);

                    if (updateError) {
                      setRawJsonSaveMessage("Supabase update error: " + updateError.message);
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

      <CmsSection title="Raw DB row (debug)">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(row, null, 2)}
        </pre>
      </CmsSection>
    </>
  );
}

function TextSlideEditor({
  row,
  orderIndex,
  groupId,
  slideType,
  onSaveSuccess,
}: {
  row: SlideRow;
  orderIndex: number;
  groupId: string | null;
  slideType: string;
  onSaveSuccess: () => void;
}) {
  const props = (row.props_json as any) || {};
  const [title, setTitle] = useState(props.title || "");
  const [subtitle, setSubtitle] = useState(props.subtitle || "");
  // Handle legacy bodies: if body is empty but bodies exists, join it into body for display
  // But do not persist bodies back - we only save body
  const initialBody = props.body || (props.bodies && Array.isArray(props.bodies) ? props.bodies.join("\n") : "");
  const [body, setBody] = useState(initialBody);
  const [metadata, setMetadata] = useState<AuthoringMetadataState>({
    code: row.code || "",
    slideGoal: ((row.meta_json as any) || {}).slideGoal || "",
    activityName: ((row.meta_json as any) || {}).activityName || "",
    requiresExternalTTS: ((row.meta_json as any) || {}).requires?.externalTTS || false,
    buttons: Array.isArray(((row.meta_json as any) || {}).buttons) ? ((row.meta_json as any) || {}).buttons : [],
    isActivity: row.is_activity || false,
    scoreType: row.score_type || "none",
    passingScoreValue: row.passing_score_value ?? null,
    maxScoreValue: row.max_score_value ?? null,
    passRequiredForNext: row.pass_required_for_next || false,
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [rawJsonExpanded, setRawJsonExpanded] = useState(false);
  const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(row.props_json ?? {}, null, 2));
  const [rawJsonParseError, setRawJsonParseError] = useState<string | null>(null);
  const [rawJsonSaving, setRawJsonSaving] = useState(false);
  const [rawJsonSaveMessage, setRawJsonSaveMessage] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);
    setSaving(true);

    try {
      const newProps: any = {};

      if (title.trim()) {
        newProps.title = title.trim();
      }
      if (subtitle.trim()) {
        newProps.subtitle = subtitle.trim();
      }

      // Only write body (string), never bodies
      if (body.trim()) {
        newProps.body = body.trim();
      }

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

      const { error: updateError } = await supabase
        .from("slides")
        .update({
          props_json: newProps,
          type: trimmedType,
          order_index: orderIndex,
          group_id: groupId,
          code: metadata.code || null,
          meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
          is_activity: metadata.isActivity,
          score_type: metadata.scoreType || "none",
          passing_score_value: metadata.passingScoreValue,
          max_score_value: metadata.maxScoreValue,
          pass_required_for_next: metadata.passRequiredForNext,
        })
        .eq("id", row.id);

      if (updateError) {
        setSaveMessage("Supabase update error: " + updateError.message);
        return;
      }

      setSaveMessage("Saved successfully!");
      onSaveSuccess();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <CmsSection
        title="text-slide editor"
        description={
          <>
            Editing slide <code className="codeText">{row.id}</code> in group{" "}
            <code className="codeText">{row.group_id ?? "none"}</code>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <FormField label="Title (optional)">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

          <FormField label="Subtitle (optional)">
            <Input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </FormField>

          <FormField label="Body">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
            />
          </FormField>

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
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
        actions={
          <Button
            variant="ghost"
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

                    const { error: updateError } = await supabase
                      .from("slides")
                      .update({
                        props_json: parsedJson,
                        type: trimmedType,
                        code: metadata.code || null,
                        meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
                        is_activity: metadata.isActivity,
                        score_type: metadata.scoreType || "none",
                        passing_score_value: metadata.passingScoreValue,
                        max_score_value: metadata.maxScoreValue,
                        pass_required_for_next: metadata.passRequiredForNext,
                      })
                      .eq("id", row.id);

                    if (updateError) {
                      setRawJsonSaveMessage("Supabase update error: " + updateError.message);
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

      <CmsSection title="Raw DB row (debug)">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(row, null, 2)}
        </pre>
      </CmsSection>
    </>
  );
}

function RawJsonEditor({
  row,
  orderIndex,
  groupId,
  slideType,
  onSaveSuccess,
}: {
  row: SlideRow;
  orderIndex: number;
  groupId: string | null;
  slideType: string;
  onSaveSuccess: () => void;
}) {
  const [jsonText, setJsonText] = useState(() => {
    try {
      return JSON.stringify(row.props_json, null, 2);
    } catch {
      return String(row.props_json ?? "");
    }
  });
  const [metadata, setMetadata] = useState<AuthoringMetadataState>({
    code: row.code || "",
    slideGoal: ((row.meta_json as any) || {}).slideGoal || "",
    activityName: ((row.meta_json as any) || {}).activityName || "",
    requiresExternalTTS: ((row.meta_json as any) || {}).requires?.externalTTS || false,
    buttons: Array.isArray(((row.meta_json as any) || {}).buttons) ? ((row.meta_json as any) || {}).buttons : [],
    isActivity: row.is_activity || false,
    scoreType: row.score_type || "none",
    passingScoreValue: row.passing_score_value ?? null,
    maxScoreValue: row.max_score_value ?? null,
    passRequiredForNext: row.pass_required_for_next || false,
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rawJsonExpanded, setRawJsonExpanded] = useState(false);
  const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(row.props_json ?? {}, null, 2));
  const [rawJsonParseError, setRawJsonParseError] = useState<string | null>(null);
  const [rawJsonSaving, setRawJsonSaving] = useState(false);
  const [rawJsonSaveMessage, setRawJsonSaveMessage] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);
    setParseError(null);
    setSaving(true);

    try {
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(jsonText);
      } catch (parseErr) {
        setParseError("Invalid JSON: " + (parseErr instanceof Error ? parseErr.message : String(parseErr)));
        return;
      }

      // Remove bodies if present (legacy support - we only use body)
      if (parsedJson && typeof parsedJson === 'object' && 'bodies' in parsedJson) {
        const { bodies, ...rest } = parsedJson as any;
        parsedJson = rest;
      }

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

      const { error: updateError } = await supabase
        .from("slides")
        .update({
          props_json: parsedJson,
          type: trimmedType,
          order_index: orderIndex,
          group_id: groupId,
          code: metadata.code || null,
          meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
          is_activity: metadata.isActivity,
          score_type: metadata.scoreType || "none",
          passing_score_value: metadata.passingScoreValue,
          max_score_value: metadata.maxScoreValue,
          pass_required_for_next: metadata.passRequiredForNext,
        })
        .eq("id", row.id);

      if (updateError) {
        setSaveMessage("Supabase update error: " + updateError.message);
        return;
      }

      setSaveMessage("Saved successfully!");
      onSaveSuccess();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <CmsSection
        title="Raw JSON editor"
        description={
          <>
            Editing slide <code className="codeText">{row.id}</code> (type: <code className="codeText">{row.type}</code>) in group{" "}
            <code className="codeText">{row.group_id ?? "none"}</code>
            <br />
            <span className="metaText">No custom editor available for this slide type. Edit the raw JSON below.</span>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <FormField label="props_json (raw JSON)" required>
            <Textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setParseError(null);
              }}
              rows={20}
              style={{ fontFamily: "monospace", fontSize: uiTokens.font.code.size }}
            />
          </FormField>

          {parseError && (
            <p style={{ color: uiTokens.color.danger, marginBottom: uiTokens.space.md }}>
              {parseError}
            </p>
          )}

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
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
        actions={
          <Button
            variant="ghost"
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

                    const { error: updateError } = await supabase
                      .from("slides")
                      .update({
                        props_json: parsedJson,
                        type: trimmedType,
                        code: metadata.code || null,
                        meta_json: Object.keys(metaJson).length > 0 ? metaJson : {},
                        is_activity: metadata.isActivity,
                        score_type: metadata.scoreType || "none",
                        passing_score_value: metadata.passingScoreValue,
                        max_score_value: metadata.maxScoreValue,
                        pass_required_for_next: metadata.passRequiredForNext,
                      })
                      .eq("id", row.id);

                    if (updateError) {
                      setRawJsonSaveMessage("Supabase update error: " + updateError.message);
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

      <CmsSection title="Raw DB row (debug)">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(row, null, 2)}
        </pre>
      </CmsSection>
    </>
  );
}
  