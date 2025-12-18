"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import { Button } from "../../components/Button";
import { uiTokens } from "../../lib/uiTokens";

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
    <PageShell
      title="Edit ai-speak-repeat slide"
      maxWidth="sm"
      meta={
        <>
          Editing slide with id: <code className="codeText">slide-ai-001</code> from Supabase.
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
          <CmsSection title="Slide Title">
            <form onSubmit={handleSubmit}>
              <FormField label="Slide title" required>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </FormField>

              <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save title"}
                </Button>
              </div>
            </form>
          </CmsSection>

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

          <CmsSection title="Current slide data">
            <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
              {JSON.stringify(loadState.slide, null, 2)}
            </pre>
          </CmsSection>
        </>
      )}
    </PageShell>
  );
}
