"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";
import PageContainer from "../../components/ui/PageContainer";

type LessonRow = {
  id: string;
  slug: string;
  title: string;
};

type CreatedGroup = {
  id: string;
  lesson_id: string;
  order_index: number;
  title: string;
};

export default function NewGroupPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [lessonId, setLessonId] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [title, setTitle] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<CreatedGroup | null>(null);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedGroup(null);

    if (!lessonId || !title) {
      setMessage("Lesson and title are required.");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("lesson_groups")
        .insert({
          lesson_id: lessonId,
          order_index: orderIndex,
          title: title.trim(),
        })
        .select("id, lesson_id, order_index, title")
        .maybeSingle();

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      if (!data) {
        setMessage("Insert succeeded but no data returned.");
        return;
      }

      setCreatedGroup(data as CreatedGroup);
      setMessage("Group created successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>Create new group</h1>
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
          {saving ? "Creating…" : "Create group"}
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

      {createdGroup && (
        <>
          <h2 style={{ marginTop: 24 }}>Created group</h2>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(createdGroup, null, 2)}
          </pre>
        </>
      )}
      </PageContainer>
    </>
  );
}
