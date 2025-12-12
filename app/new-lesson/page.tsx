"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type ModuleRow = {
  id: string;
  slug: string;
  title: string;
  order_index: number | null;
};

type CreatedLesson = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  order_index: number;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewLessonPage() {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [moduleId, setModuleId] = useState("");
  const [lessonSlugPart, setLessonSlugPart] = useState(""); // e.g. "lesson-1"
  const [title, setTitle] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdLesson, setCreatedLesson] = useState<CreatedLesson | null>(null);

  useEffect(() => {
    async function loadModules() {
      setLoadError(null);

      const { data, error } = await supabase
        .from("modules")
        .select("id, slug, title, order_index")
        .order("order_index", { ascending: true });

      if (error) {
        setLoadError(`Supabase error loading modules: ${error.message}`);
        return;
      }

      setModules((data ?? []) as ModuleRow[]);
    }

    loadModules();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedLesson(null);

    if (!moduleId || !lessonSlugPart || !title) {
      setMessage("Module, lesson slug, and title are required.");
      return;
    }

    const selectedModule = modules.find((m) => m.id === moduleId);
    if (!selectedModule) {
      setMessage("Selected module not found. Refresh and try again.");
      return;
    }

    const fullSlug = `${selectedModule.slug}/${slugify(lessonSlugPart)}`;

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("lessons")
        .insert({
          module_id: moduleId,
          slug: fullSlug,
          title: title.trim(),
          order_index: orderIndex,
          estimated_minutes: null,
          required_score: null,
          content: null,
        })
        .select("id, module_id, slug, title, order_index")
        .maybeSingle();

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      if (!data) {
        setMessage("Insert succeeded but no data returned.");
        return;
      }

      setCreatedLesson(data as CreatedLesson);
      setMessage("Lesson created successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Create new lesson</h1>

      {loadError && (
        <p style={{ color: "red", marginTop: 12 }}>
          {loadError}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Module
          </label>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="">Select a module…</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.slug})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Lesson slug (just the lesson part)
          </label>
          <input
            value={lessonSlugPart}
            onChange={(e) => setLessonSlugPart(e.target.value)}
            placeholder="lesson-1"
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            Full slug will become:{" "}
            <code>
              {moduleId
                ? `${modules.find((m) => m.id === moduleId)?.slug ?? "module"}/${slugify(lessonSlugPart || "lesson-1")}`
                : `module/lesson-1`}
            </code>
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Lesson title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
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

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "8px 16px",
            fontSize: 16,
            borderRadius: 4,
            border: "none",
            backgroundColor: "#16a34a",
            color: "#fff",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Creating…" : "Create lesson"}
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

      {createdLesson && (
        <>
          <h2 style={{ marginTop: 24 }}>Created lesson</h2>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(createdLesson, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
