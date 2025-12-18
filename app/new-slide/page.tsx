"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { aiSpeakRepeatSlideSchema } from "../../lib/realSlideSchema";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Button } from "../../components/Button";
import { uiTokens } from "../../lib/uiTokens";

type LessonRow = { id: string; slug: string; title: string };
type GroupRow = { id: string; lesson_id: string; order_index: number; title: string };

type CreatedSlide = {
  id: string;
  lesson_id: string;
  group_id: string;
  order_index: number;
  type: string;
};

export default function NewSlidePage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [lessonId, setLessonId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);

  const [title, setTitle] = useState("Alphabet CMS test");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdSlide, setCreatedSlide] = useState<CreatedSlide | null>(null);

  useEffect(() => {
    async function loadLessons() {
      setLoadError(null);

      const { data, error } = await supabase
        .from("lessons")
        .select("id, slug, title")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setLoadError(`Supabase error loading lessons: ${error.message}`);
        return;
      }

      setLessons((data ?? []) as LessonRow[]);
    }

    loadLessons();
  }, []);

  useEffect(() => {
    async function loadGroups() {
      if (!lessonId) {
        setGroups([]);
        setGroupId("");
        return;
      }

      const { data, error } = await supabase
        .from("lesson_groups")
        .select("id, lesson_id, order_index, title")
        .eq("lesson_id", lessonId)
        .order("order_index");

      if (error) {
        setLoadError(`Supabase error loading groups: ${error.message}`);
        return;
      }

      const list = (data ?? []) as GroupRow[];
      setGroups(list);
      setGroupId(list[0]?.id ?? "");
    }

    loadGroups();
  }, [lessonId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedSlide(null);

    if (!lessonId || !groupId) {
      setMessage("Lesson and group are required.");
      return;
    }

    setSaving(true);

    try {
      // Minimal valid ai-speak-repeat props (same shape your slide schema expects)
      const props = {
        title: title.trim(),
        subtitle: "Practice speaking with Raichel",
        note: "Focus on rhythm and intonation.",
        defaultLang: "en",
        lines: [
          [
            { label: "Let's go", speech: { mode: "tts", lang: "en", text: "Let's go" } },
            { label: "Come here", speech: { mode: "tts", lang: "en", text: "Come here" } },
          ],
          [{ label: "Sit down", speech: { mode: "tts", lang: "en", text: "Sit down" } }],
        ],
        gapClass: "gap-4",
        hideTitle: false,
        onCompleteAtIndex: 0,
      };

      // Validate before writing (professional safety)
      const parsed = aiSpeakRepeatSlideSchema.safeParse({
        id: "temp",
        groupId,
        type: "ai-speak-repeat",
        props,
        aidHook: null,
      });

      if (!parsed.success) {
        console.error(parsed.error.format());
        setMessage("Validation failed. Check console.");
        return;
      }

      const { data, error } = await supabase
        .from("slides")
        .insert({
          lesson_id: lessonId,
          group_id: groupId,
          order_index: orderIndex,
          type: "ai-speak-repeat",
          props_json: props,
          aid_hook: null,
        })
        .select("id, lesson_id, group_id, order_index, type")
        .maybeSingle();

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      if (!data) {
        setMessage("Insert succeeded but no data returned.");
        return;
      }

      setCreatedSlide(data as CreatedSlide);
      setMessage("Slide created successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="Create new slide" maxWidth="md">
      {loadError && <p style={{ color: uiTokens.color.danger }}>{loadError}</p>}

      <CmsSection>
        <form onSubmit={handleSubmit}>
          <FormField label="Lesson" required>
            <Select value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
              <option value="">Select a lesson…</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.slug})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Group" required>
            <Select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={!lessonId}
            >
              <option value="">{lessonId ? "Select a group…" : "Select a lesson first…"}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  Group {g.order_index}: {g.title}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Order index" required>
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />
          </FormField>

          <FormField label="Slide title (ai-speak-repeat)" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create slide"}
            </Button>
          </div>
        </form>
      </CmsSection>

      {message && (
        <p
          style={{
            marginTop: uiTokens.space.md,
            color: message.toLowerCase().includes("error") ? uiTokens.color.danger : "green",
          }}
        >
          {message}
        </p>
      )}

      {createdSlide && (
        <CmsSection title="Created slide">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(createdSlide, null, 2)}
          </pre>
        </CmsSection>
      )}
    </PageShell>
  );
}
