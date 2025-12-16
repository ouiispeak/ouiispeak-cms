"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import { BackButton } from "../../components/BackButton";
import PageContainer from "../../components/ui/PageContainer";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; slide: RealAiSpeakRepeatSlide };

export default function EditSlideAiPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "idle" });
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load the slide once on mount
  useEffect(() => {
    async function loadSlide() {
      setLoadState({ status: "loading" });
      setSaveMessage(null);

      const { data, error } = await supabase
        .from("slides_authoring")
        .select("id, group_id, type, props_json, aid_hook")
        .eq("id", "slide-ai-001")
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
          message: 'No slide found with id "slide-ai-001"',
        });
        return;
      }

      const rawSlide = {
        id: data.id,
        groupId: data.group_id ?? undefined,
        type: data.type,
        props: data.props_json,
        aidHook: data.aid_hook ?? null,
      };

      const result = aiSpeakRepeatSlideSchema.safeParse(rawSlide);

      if (!result.success) {
        setLoadState({
          status: "error",
          message: "Validation failed when loading slide.",
        });
        console.error(result.error.format());
        return;
      }

      const slide = result.data;
      setTitle(slide.props.title);
      setLoadState({ status: "ready", slide });
    }

    loadSlide();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);

    if (loadState.status !== "ready") return;

    setSaving(true);

    try {
      const existingSlide = loadState.slide;

      const newProps = {
        ...existingSlide.props,
        title,
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
        setSaveMessage("Validation failed when saving. Check console for details.");
        console.error(parsed.error.format());
        setSaving(false);
        return;
      }

      const validatedSlide: RealAiSpeakRepeatSlide = parsed.data;

      const { error: updateError } = await supabase
        .from("slides_authoring")
        .update({ props_json: validatedSlide.props })
        .eq("id", validatedSlide.id);

      if (updateError) {
        setSaveMessage(`Supabase update error: ${updateError.message}`);
        setSaving(false);
        return;
      }

      setLoadState({ status: "ready", slide: validatedSlide });
      setSaveMessage("Title saved successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>Edit ai-speak-repeat slide</h1>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <BackButton title="Back to Dashboard" />
      </div>
      <PageContainer maxWidth="sm">
      <p>
        Editing slide with id: <code>slide-ai-001</code> from Supabase.
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
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="title"
                style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
              >
                Slide title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  fontSize: 14,
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
                fontSize: 16,
                fontWeight: 500,
                borderRadius: 6,
                border: "1px solid #2563eb",
                backgroundColor: saving ? "#9bbfb2" : "#9bbfb2",
                border: "1px solid #9bbfb2",
                fontWeight: 400,
                color: "#222326",
                cursor: saving ? "not-allowed" : "pointer",
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
              {saving ? "Saving..." : "Save title"}
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

          <h2 style={{ marginTop: 32 }}>Current slide data</h2>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(loadState.slide, null, 2)}
          </pre>
        </>
      )}
      </PageContainer>
    </>
  );
}
