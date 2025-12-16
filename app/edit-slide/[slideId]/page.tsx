"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../../lib/realSlideSchema";
import { Button } from "../../../components/Button";
import { BackButton } from "../../../components/BackButton";
import SectionCard from "../../../components/ui/SectionCard";
import PageContainer from "../../../components/ui/PageContainer";

type SlideRow = {
  id: string;
  lesson_id: string;
  group_id: string | null;
  order_index: number | null;
  type: string;
  props_json: unknown;
  aid_hook: string | null;
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
        .select("id, lesson_id, group_id, order_index, type, props_json, aid_hook")
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
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>Edit slide</h1>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <BackButton title="Back to Dashboard" />
      </div>
      <PageContainer maxWidth={720}>
      <p>
        URL slide id: <code>{slideId}</code>
      </p>

      {loadState.status === "loading" && <p>Loading slide…</p>}

      {loadState.status === "error" && (
        <>
          <h2 style={{ color: "red" }}>Error</h2>
          <p>{loadState.message}</p>
        </>
      )}

      {loadState.status === "ready" && (
        <>
          {/* Slide type input */}
          <SectionCard title="Slide Type">
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                Slide type
              </label>
              <input
                type="text"
                value={slideType}
                onChange={(e) => setSlideType(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
              />
            </div>
          </SectionCard>

          {/* Order and Group controls */}
          <SectionCard title="Placement">
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Group
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 14,
                  }}
                >
                  <option value="">(no group)</option>
                  {loadState.groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Order index
                </label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  min={1}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </SectionCard>

          {(() => {
            const type = (loadState.row.type ?? "").trim();
            // Capture groups for reload callback
            const currentGroups = loadState.groups;

            const reloadSlide = async () => {
              if (!slideId) return;
              
              const { data: slideData, error: slideError } = await supabase
                .from("slides")
                .select("id, lesson_id, group_id, order_index, type, props_json, aid_hook")
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
      </PageContainer>
    </>
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

        const { error: updateError } = await supabase
          .from("slides")
          .update({
            props_json: validated.props,
            type: trimmedType,
            order_index: orderIndex,
            group_id: groupId,
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
        <>
          <h2 style={{ color: "red" }}>ai-speak-repeat editor error</h2>
          <p>{innerState.message}</p>
        </>
      );
    }
  
    const slide = innerState.slide;
  
    return (
      <>
        <h2>ai-speak-repeat editor</h2>
        <p>
          Editing slide <code>{slide.id}</code> in group{" "}
          <code>{slide.groupId ?? "none"}</code>
        </p>
  
        <form onSubmit={handleSave} style={{ marginTop: 24 }}>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              Slide title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          </div>
  
          {/* Subtitle */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          </div>
  
          {/* Note */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          </div>
  
          {/* Default language */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              Default language
            </label>
            <input
              type="text"
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          </div>
  
          {/* Phrases */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              Phrases (one per line)
            </label>
            <textarea
              value={phrasesText}
              onChange={(e) => setPhrasesText(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontFamily: "monospace",
              }}
            />
          </div>
  
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
  
        {saveMessage && (
          <p
            style={{
              marginTop: 16,
              color: saveMessage.includes("error") ? "red" : "green",
            }}
          >
            {saveMessage}
          </p>
        )}

        <div style={{ marginTop: 32, borderTop: "1px solid #ddd", paddingTop: 16 }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setRawJsonExpanded(!rawJsonExpanded)}
            className="text-xs py-1.5 px-3"
          >
            {rawJsonExpanded ? "▼" : "▶"} Raw props_json (advanced)
          </Button>

          {rawJsonExpanded && (
            <div style={{ marginTop: 16 }}>
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
              <button
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

                    const { error: updateError } = await supabase
                      .from("slides")
                      .update({
                        props_json: parsedJson,
                        type: trimmedType,
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
                className="mt-2"
              >
                {rawJsonSaving ? "Saving…" : "Save JSON"}
              </button>
              {rawJsonSaveMessage && (
                <p
                  style={{
                    marginTop: 8,
                    color: rawJsonSaveMessage.includes("error") ? "red" : "green",
                    fontSize: 13,
                  }}
                >
                  {rawJsonSaveMessage}
                </p>
              )}
            </div>
          )}
        </div>
  
        <h3 style={{ marginTop: 32 }}>Current slide data</h3>
        <pre style={{ fontSize: 12 }}>
          {JSON.stringify(slide, null, 2)}
        </pre>
      </>
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

      const { error: updateError } = await supabase
        .from("slides")
        .update({
          props_json: newProps,
          type: trimmedType,
          order_index: orderIndex,
          group_id: groupId,
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
      <SectionCard title="title-slide editor">
        <div style={{ marginBottom: 8, fontSize: 13, color: "#666" }}>
          UUID: <code>{row.id}</code>
        </div>
        <div style={{ marginBottom: 16, fontSize: 13, color: "#666" }}>
          Group UUID: <code>{row.group_id ?? "none"}</code>
        </div>

        <form onSubmit={handleSave} style={{ marginTop: 24 }}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            Title <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Subtitle */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            Subtitle (optional)
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "8px 16px",
            fontSize: 14,
            borderRadius: 4,
            border: "none",
            backgroundColor: "#9bbfb2",
            color: "#222326",
            fontWeight: 400,
            border: "1px solid #9bbfb2",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
          onMouseOver={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = "#8aaea1";
            }
          }}
          onMouseOut={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = "#9bbfb2";
            }
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        </form>

        {saveMessage && (
          <p
            style={{
              marginTop: 16,
              color: saveMessage.includes("error") ? "red" : "green",
            }}
          >
            {saveMessage}
          </p>
        )}
      </SectionCard>

      <SectionCard>
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
            <button
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

                  const { error: updateError } = await supabase
                    .from("slides")
                    .update({
                      props_json: parsedJson,
                      type: trimmedType,
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
              style={{
                marginTop: 8,
                padding: "6px 12px",
                fontSize: 14,
                borderRadius: 4,
                border: "none",
                backgroundColor: "#9bbfb2",
                color: "#222326",
                fontWeight: 400,
                border: "1px solid #9bbfb2",
                cursor: rawJsonSaving ? "default" : "pointer",
                opacity: rawJsonSaving ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!rawJsonSaving) {
                  e.currentTarget.style.backgroundColor = "#8aaea1";
                }
              }}
              onMouseOut={(e) => {
                if (!rawJsonSaving) {
                  e.currentTarget.style.backgroundColor = "#9bbfb2";
                }
              }}
            >
              {rawJsonSaving ? "Saving…" : "Save JSON"}
            </button>
            {rawJsonSaveMessage && (
              <p
                style={{
                  marginTop: 8,
                  color: rawJsonSaveMessage.includes("error") ? "red" : "green",
                  fontSize: 13,
                }}
              >
                {rawJsonSaveMessage}
              </p>
            )}
          </div>
        )}
      </SectionCard>

      <h3 style={{ marginTop: 32 }}>Raw DB row (debug)</h3>
      <pre style={{ fontSize: 12 }}>
        {JSON.stringify(row, null, 2)}
      </pre>
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
  const [body, setBody] = useState(props.body || "");
  const [bodiesText, setBodiesText] = useState(
    props.bodies && Array.isArray(props.bodies) ? props.bodies.join("\n") : ""
  );
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

      // If bodies textarea has content, use bodies array and remove body
      // Otherwise, use body and remove bodies
      const bodiesLines = bodiesText
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);

      if (bodiesLines.length > 0) {
        newProps.bodies = bodiesLines;
        // Don't include body if bodies exists
      } else {
        if (body.trim()) {
          newProps.body = body.trim();
        }
        // Don't include bodies if body exists
      }

      const trimmedType = slideType.trim();

      const { error: updateError } = await supabase
        .from("slides")
        .update({
          props_json: newProps,
          type: trimmedType,
          order_index: orderIndex,
          group_id: groupId,
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
      <h2>text-slide editor</h2>
      <p>
        Editing slide <code>{row.id}</code> in group{" "}
        <code>{row.group_id ?? "none"}</code>
      </p>

      <form onSubmit={handleSave} style={{ marginTop: 24 }}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Subtitle */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            Subtitle (optional)
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            Body {bodiesText.trim().length > 0 && <span style={{ color: "#999", fontWeight: 400 }}>(ignored if Bodies is non-empty)</span>}
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Bodies */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            Bodies (one per line; empty lines ignored) {bodiesText.trim().length > 0 && <span style={{ color: "green", fontWeight: 400 }}>(will be saved)</span>}
          </label>
          <textarea
            value={bodiesText}
            onChange={(e) => setBodiesText(e.target.value)}
            rows={6}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              fontFamily: "monospace",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "8px 16px",
            fontSize: 14,
            borderRadius: 4,
            border: "none",
            backgroundColor: "#9bbfb2",
            color: "#222326",
            fontWeight: 400,
            border: "1px solid #9bbfb2",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
          onMouseOver={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = "#8aaea1";
            }
          }}
          onMouseOut={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = "#9bbfb2";
            }
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      {saveMessage && (
        <p
          style={{
            marginTop: 16,
            color: saveMessage.includes("error") ? "red" : "green",
          }}
        >
          {saveMessage}
        </p>
      )}

      <div style={{ marginTop: 32, borderTop: "1px solid #ddd", paddingTop: 16 }}>
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
          }}
        >
          {rawJsonExpanded ? "▼" : "▶"} Raw props_json (advanced)
        </button>

        {rawJsonExpanded && (
          <div style={{ marginTop: 16 }}>
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
            <button
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

                  const { error: updateError } = await supabase
                    .from("slides")
                    .update({
                      props_json: parsedJson,
                      type: trimmedType,
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
              style={{
                marginTop: 8,
                padding: "6px 12px",
                fontSize: 14,
                borderRadius: 4,
                border: "none",
                backgroundColor: "#9bbfb2",
                color: "#222326",
                fontWeight: 400,
                border: "1px solid #9bbfb2",
                cursor: rawJsonSaving ? "default" : "pointer",
                opacity: rawJsonSaving ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!rawJsonSaving) {
                  e.currentTarget.style.backgroundColor = "#8aaea1";
                }
              }}
              onMouseOut={(e) => {
                if (!rawJsonSaving) {
                  e.currentTarget.style.backgroundColor = "#9bbfb2";
                }
              }}
            >
              {rawJsonSaving ? "Saving…" : "Save JSON"}
            </button>
            {rawJsonSaveMessage && (
              <p
                style={{
                  marginTop: 8,
                  color: rawJsonSaveMessage.includes("error") ? "red" : "green",
                  fontSize: 13,
                }}
              >
                {rawJsonSaveMessage}
              </p>
            )}
          </div>
        )}
      </div>

      <h3 style={{ marginTop: 32 }}>Raw DB row (debug)</h3>
      <pre style={{ fontSize: 12 }}>
        {JSON.stringify(row, null, 2)}
      </pre>
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

      const trimmedType = slideType.trim();

      const { error: updateError } = await supabase
        .from("slides")
        .update({
          props_json: parsedJson,
          type: trimmedType,
          order_index: orderIndex,
          group_id: groupId,
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
      <h2>Raw JSON editor</h2>
      <p>
        Editing slide <code>{row.id}</code> (type: <code>{row.type}</code>) in group{" "}
        <code>{row.group_id ?? "none"}</code>
      </p>
      <p style={{ opacity: 0.7, fontSize: 13 }}>
        No custom editor available for this slide type. Edit the raw JSON below.
      </p>

      <form onSubmit={handleSave} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            props_json (raw JSON)
          </label>
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setParseError(null);
            }}
            rows={20}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              fontFamily: "monospace",
              fontSize: 13,
            }}
          />
        </div>

        {parseError && (
          <p style={{ color: "red", marginBottom: 16 }}>
            {parseError}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "8px 16px",
            fontSize: 14,
            borderRadius: 4,
            border: "none",
            backgroundColor: "#9bbfb2",
            color: "#222326",
            fontWeight: 400,
            border: "1px solid #9bbfb2",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
          onMouseOver={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = "#8aaea1";
            }
          }}
          onMouseOut={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = "#9bbfb2";
            }
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      {saveMessage && (
        <p
          style={{
            marginTop: 16,
            color: saveMessage.includes("error") ? "red" : "green",
          }}
        >
          {saveMessage}
        </p>
      )}

      <div style={{ marginTop: 32, borderTop: "1px solid #ddd", paddingTop: 16 }}>
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
          }}
        >
          {rawJsonExpanded ? "▼" : "▶"} Raw props_json (advanced)
        </button>

        {rawJsonExpanded && (
          <div style={{ marginTop: 16 }}>
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
            <button
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

                  const { error: updateError } = await supabase
                    .from("slides")
                    .update({
                      props_json: parsedJson,
                      type: trimmedType,
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
              style={{
                marginTop: 8,
                padding: "6px 12px",
                fontSize: 14,
                borderRadius: 4,
                border: "none",
                backgroundColor: "#9bbfb2",
                color: "#222326",
                fontWeight: 400,
                border: "1px solid #9bbfb2",
                cursor: rawJsonSaving ? "default" : "pointer",
                opacity: rawJsonSaving ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!rawJsonSaving) {
                  e.currentTarget.style.backgroundColor = "#8aaea1";
                }
              }}
              onMouseOut={(e) => {
                if (!rawJsonSaving) {
                  e.currentTarget.style.backgroundColor = "#9bbfb2";
                }
              }}
            >
              {rawJsonSaving ? "Saving…" : "Save JSON"}
            </button>
            {rawJsonSaveMessage && (
              <p
                style={{
                  marginTop: 8,
                  color: rawJsonSaveMessage.includes("error") ? "red" : "green",
                  fontSize: 13,
                }}
              >
                {rawJsonSaveMessage}
              </p>
            )}
          </div>
        )}
      </div>

      <h3 style={{ marginTop: 32 }}>Raw DB row (debug)</h3>
      <pre style={{ fontSize: 12 }}>
        {JSON.stringify(row, null, 2)}
      </pre>
    </>
  );
}
  