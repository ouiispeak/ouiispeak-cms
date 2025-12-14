"use client";

import { useState, FormEvent, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type ModuleRow = {
  id: string;
  slug: string;
  title: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; lesson: { id: string; module_id: string; title: string; slug: string; order_index: number | null } };

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditLessonPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId;

  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [lessonSlugPart, setLessonSlugPart] = useState("");
  const [title, setTitle] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadModules() {
      const { data, error } = await supabase
        .from("modules")
        .select("id, slug, title, order_index")
        .order("order_index", { ascending: true });

      if (error) {
        setLoadState({ status: "error", message: `Supabase error loading modules: ${error.message}` });
        return;
      }

      setModules((data ?? []) as ModuleRow[]);
    }

    loadModules();
  }, []);

  useEffect(() => {
    if (!lessonId) {
      setLoadState({ status: "error", message: "No lessonId provided in URL." });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data, error } = await supabase
        .from("lessons")
        .select("id, module_id, title, slug, order_index")
        .eq("id", lessonId)
        .maybeSingle();

      if (error) {
        setLoadState({ status: "error", message: `Supabase error: ${error.message}` });
        return;
      }

      if (!data) {
        setLoadState({ status: "error", message: `No lesson found with id "${lessonId}"` });
        return;
      }

      setModuleId(data.module_id);
      const selectedModule = modules.find((m) => m.id === data.module_id);
      if (selectedModule) {
        const slugPart = data.slug.replace(`${selectedModule.slug}/`, "");
        setLessonSlugPart(slugPart);
      } else {
        setLessonSlugPart(data.slug);
      }
      setTitle(data.title);
      setOrderIndex(data.order_index ?? 1);

      setLoadState({ status: "ready", lesson: data });
    }

    if (modules.length > 0) {
      load();
    }
  }, [lessonId, modules]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!moduleId || !lessonSlugPart || !title) {
      setMessage("Module, lesson slug, and title are required.");
      return;
    }

    const selectedModule = modules.find((m) => m.id === moduleId);
    if (!selectedModule) {
      setMessage("Selected module not found.");
      return;
    }

    const fullSlug = `${selectedModule.slug}/${slugify(lessonSlugPart)}`;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("lessons")
        .update({
          module_id: moduleId,
          slug: fullSlug,
          title: title.trim(),
          order_index: orderIndex,
        })
        .eq("id", lessonId);

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      setMessage("Lesson updated successfully!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Edit lesson</h1>
      <p>
        Lesson id: <code>{lessonId}</code>
      </p>

      {loadState.status === "loading" && <p>Loading lesson…</p>}

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

