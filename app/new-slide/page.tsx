"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { aiSpeakRepeatSlideSchema } from "../../lib/realSlideSchema";
import { BackButton } from "../../components/BackButton";
import PageContainer from "../../components/ui/PageContainer";

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
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>Create new slide</h1>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <BackButton title="Back to Dashboard" />
      </div>
      <PageContainer maxWidth="md">

      {loadError && <p style={{ color: "red" }}>{loadError}</p>}

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Lesson
          </label>
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="">Select a lesson…</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title} ({l.slug})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Group
          </label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            disabled={!lessonId}
          >
            <option value="">{lessonId ? "Select a group…" : "Select a lesson first…"}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                Group {g.order_index}: {g.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Order index
          </label>
          <input
            type="number"
            value={orderIndex}
            onChange={(e) => setOrderIndex(Number(e.target.value))}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Slide title (ai-speak-repeat)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "8px 16px",
            fontSize: 14,
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
          {saving ? "Creating…" : "Create slide"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: 16,
            color: message.toLowerCase().includes("error") ? "red" : "green",
          }}
        >
          {message}
        </p>
      )}

      {createdSlide && (
        <>
          <h2 style={{ marginTop: 24 }}>Created slide</h2>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(createdSlide, null, 2)}
          </pre>
        </>
      )}
      </PageContainer>
    </>
  );
}
