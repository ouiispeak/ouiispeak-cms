"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../../lib/realSlideSchema";

type SlideRow = {
  id: string;
  lesson_id: string;
  group_id: string | null;
  type: string;
  props_json: unknown;
  aid_hook: string | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; row: SlideRow };

export default function EditSlidePage() {
  const params = useParams<{ slideId: string }>();
  const slideId = params?.slideId;

  const [loadState, setLoadState] = useState<LoadState>({
    status: "loading",
  });

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

      const { data, error } = await supabase
        .from("slides")
        .select("id, lesson_id, group_id, type, props_json, aid_hook")
        .eq("id", slideId)
        .maybeSingle();

      if (error) {
        setLoadState({
          status: "error",
          message: `Supabase error: ${error.message}`,
        });
        return;
      }

      if (!data) {
        setLoadState({
          status: "error",
          message: `No slide found with id "${slideId}"`,
        });
        return;
      }

      setLoadState({
        status: "ready",
        row: data as SlideRow,
      });
    }

    load();
  }, [slideId]);

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Edit slide</h1>
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
          <p>
            Slide type: <strong>{loadState.row.type}</strong>
          </p>

          {loadState.row.type === "ai-speak-repeat" ? (
            <AiSpeakRepeatEditor row={loadState.row} />
          ) : (
            <>
              <h2>Editor not implemented yet</h2>
              <p>
                This slide has type <code>{loadState.row.type}</code>. A custom
                editor for this type hasn&apos;t been built yet.
              </p>
              <h3>Raw DB row (debug)</h3>
              <pre style={{ fontSize: 12 }}>
                {JSON.stringify(loadState.row, null, 2)}
              </pre>
            </>
          )}
        </>
      )}
    </main>
  );
}

function AiSpeakRepeatEditor({ row }: { row: SlideRow }) {
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
  
        const { error: updateError } = await supabase
          .from("slides")
          .update({ props_json: validated.props })
          .eq("id", validated.id);
  
        if (updateError) {
          setSaveMessage("Supabase update error: " + updateError.message);
          return;
        }
  
        setInnerState({ status: "ready", slide: validated });
        setSaveMessage("Saved successfully!");
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
  
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "8px 16px",
              fontSize: 16,
              borderRadius: 4,
              border: "none",
              backgroundColor: "#2563eb",
              color: "#fff",
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
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
  
        <h3 style={{ marginTop: 32 }}>Current slide data</h3>
        <pre style={{ fontSize: 12 }}>
          {JSON.stringify(slide, null, 2)}
        </pre>
      </>
    );
  }
  