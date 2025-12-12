"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";

type LessonRow = {
  id: string;
  lesson_slug: string;
  title: string;
};

type GroupRow = {
  id: string;
  lesson_id: string;
  order_index: number;
  title: string;
};

type CreatedSlideRow = {
  id: string;
  lesson_id: string;
  group_id: string;
  order_index: number;
  type: string;
  props_json: unknown;
};

export default function NewSlideAiPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const [orderIndex, setOrderIndex] = useState("1");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [note, setNote] = useState("");
  const [defaultLang, setDefaultLang] = useState("en");
  const [phrasesText, setPhrasesText] = useState(
    "Let's go\nCome here\nSit down"
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdSlide, setCreatedSlide] = useState<CreatedSlideRow | null>(
    null
  );

  // Compute groups for the selected lesson
  const filteredGroups = useMemo(
    () => groups.filter((g) => g.lesson_id === selectedLessonId),
    [groups, selectedLessonId]
  );

  // Load lessons and groups once
  useEffect(() => {
    async function loadMeta() {
      setLoadingMeta(true);
      setMetaError(null);

      const [{ data: lessonsData, error: lessonsError }, { data: groupsData, error: groupsError }] =
        await Promise.all([
          supabase
            .from("lessons_authoring")
            .select("id, lesson_slug, title")
            .order("lesson_slug", { ascending: true }),
          supabase
            .from("lesson_groups_authoring")
            .select("id, lesson_id, order_index, title")
            .order("lesson_id", { ascending: true })
            .order("order_index", { ascending: true }),
        ]);

      if (lessonsError || groupsError) {
        setMetaError(
          (lessonsError?.message ?? "") +
            (groupsError ? " | " + groupsError.message : "")
        );
        setLoadingMeta(false);
        return;
      }

      setLessons((lessonsData ?? []) as LessonRow[]);
      setGroups((groupsData ?? []) as GroupRow[]);
      setLoadingMeta(false);
    }

    loadMeta();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedSlide(null);

    if (!selectedLessonId) {
      setMessage("Please select a lesson.");
      return;
    }
    if (!selectedGroupId) {
      setMessage("Please select a group.");
      return;
    }
    if (!title.trim()) {
      setMessage("Slide title is required.");
      return;
    }

    const parsedOrder = parseInt(orderIndex, 10);
    if (Number.isNaN(parsedOrder) || parsedOrder < 1) {
      setMessage("Order index must be a positive integer.");
      return;
    }

    const phrases = phrasesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (phrases.length === 0) {
      setMessage("Please enter at least one phrase.");
      return;
    }

    setSaving(true);

    try {
      // Build lines[][] for ai-speak-repeat:
      // For now, everything in a single row.
      const lines = [
        phrases.map((label) => ({
          label,
          speech: {
            mode: "tts" as const,
            lang: (defaultLang || "en") as any,
            text: label,
          },
        })),
      ];

      const newId = `slide-${Date.now()}`;

      // Build raw slide for Zod validation
      const rawSlide = {
        id: newId,
        groupId: selectedGroupId,
        type: "ai-speak-repeat" as const,
        props: {
          title,
          subtitle: subtitle || undefined,
          note: note || undefined,
          defaultLang: defaultLang || undefined,
          lines,
          gapClass: "gap-4",
          hideTitle: false,
          onCompleteAtIndex: 0,
        },
        aidHook: null,
      };

      const parsed = aiSpeakRepeatSlideSchema.safeParse(rawSlide);

      if (!parsed.success) {
        console.error(parsed.error.format());
        setMessage(
          "Validation failed when building slide. Check console for details."
        );
        return;
      }

      const validated: RealAiSpeakRepeatSlide = parsed.data;

      const { data, error } = await supabase
        .from("slides_authoring")
        .insert({
          id: validated.id,
          lesson_id: selectedLessonId,
          group_id: selectedGroupId,
          order_index: parsedOrder,
          type: validated.type,
          props_json: validated.props,
          aid_hook: validated.aidHook ?? null,
          status: "draft",
          version: 1,
          updated_by: "raychel",
        })
        .select("*")
        .maybeSingle();

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      if (!data) {
        setMessage("Insert succeeded but no data returned.");
        return;
      }

      setCreatedSlide(data as CreatedSlideRow);
      setMessage("Slide created successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Create ai-speak-repeat slide</h1>
      <p>
        This will create a new <code>ai-speak-repeat</code> slide in{" "}
        <code>slides_authoring</code>, attached to a lesson group.
      </p>

      {loadingMeta && <p>Loading lessons and groups…</p>}

      {metaError && (
        <p style={{ color: "red" }}>Error loading metadata: {metaError}</p>
      )}

      {!loadingMeta && !metaError && lessons.length === 0 && (
        <p>No lessons found. Create a lesson first at /new-lesson.</p>
      )}

      {!loadingMeta && !metaError && lessons.length > 0 && (
        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <fieldset
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <legend>Where does this slide go?</legend>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="lesson"
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Lesson
              </label>
              <select
                id="lesson"
                value={selectedLessonId}
                onChange={(e) => {
                  setSelectedLessonId(e.target.value);
                  setSelectedGroupId("");
                }}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">-- Select a lesson --</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} ({lesson.lesson_slug})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="group"
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Group
              </label>
              <select
                id="group"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
                disabled={!selectedLessonId || filteredGroups.length === 0}
              >
                <option value="">
                  {filteredGroups.length === 0
                    ? "-- No groups for this lesson --"
                    : "-- Select a group --"}
                </option>
                {filteredGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    Group {group.order_index}: {group.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="orderIndex"
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Slide order index
              </label>
              <input
                id="orderIndex"
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </fieldset>

          <fieldset
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <legend>Slide content</legend>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="title"
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
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
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="subtitle"
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Subtitle (optional)
              </label>
              <input
                id="subtitle"
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

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="note"
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Note (optional)
              </label>
              <input
                id="note"
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

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="defaultLang"
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Default language (e.g. en, fr)
              </label>
              <input
                id="defaultLang"
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

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="phrases"
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Phrases (one per line)
              </label>
              <textarea
                id="phrases"
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
              <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                Each line becomes a button/cell. For now, all phrases are in a
                single row.
              </p>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "8px 16px",
              fontSize: 16,
              borderRadius: 4,
              border: "none",
              backgroundColor: "#0ea5e9",
              color: "#fff",
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Creating..." : "Create slide"}
          </button>
        </form>
      )}

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
          <h2 style={{ marginTop: 24 }}>Created slide (DB row)</h2>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(createdSlide, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
