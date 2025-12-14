"use client";

import { useState, FormEvent, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type LessonRow = {
  id: string;
  slug: string;
  title: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; group: { id: string; lesson_id: string; title: string; order_index: number | null } };

export default function EditGroupPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params?.groupId;

  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [lessonId, setLessonId] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [title, setTitle] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLessons() {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, slug, title")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setLoadState({ status: "error", message: `Supabase error loading lessons: ${error.message}` });
        return;
      }

      setLessons((data ?? []) as LessonRow[]);
    }

    loadLessons();
  }, []);

  useEffect(() => {
    if (!groupId) {
      setLoadState({ status: "error", message: "No groupId provided in URL." });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data, error } = await supabase
        .from("lesson_groups")
        .select("id, lesson_id, title, order_index")
        .eq("id", groupId)
        .maybeSingle();

      if (error) {
        setLoadState({ status: "error", message: `Supabase error: ${error.message}` });
        return;
      }

      if (!data) {
        setLoadState({ status: "error", message: `No group found with id "${groupId}"` });
        return;
      }

      setLessonId(data.lesson_id);
      setOrderIndex(data.order_index ?? 1);
      setTitle(data.title);

      setLoadState({ status: "ready", group: data });
    }

    if (lessons.length > 0) {
      load();
    }
  }, [groupId, lessons]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!lessonId || !title) {
      setMessage("Lesson and title are required.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("lesson_groups")
        .update({
          lesson_id: lessonId,
          order_index: orderIndex,
          title: title.trim(),
        })
        .eq("id", groupId);

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      setMessage("Group updated successfully!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Edit group</h1>
      <p>
        Group id: <code>{groupId}</code>
      </p>

      {loadState.status === "loading" && <p>Loading group…</p>}

      {loadState.status === "error" && (
        <>
          <h2 style={{ color: "red" }}>Error</h2>
          <p>{loadState.message}</p>
        </>
      )}

      {loadState.status === "ready" && (
        <form onSubmit={handleSave} style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Lesson
            </label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
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
              Order index
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Group title
            </label>
            <input
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
    </main>
  );
}

