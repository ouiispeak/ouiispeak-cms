"use client";

import { useState, FormEvent, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; module: { id: string; title: string; slug: string; level: string; order_index: number | null; description: string | null } };

export default function EditModulePage() {
  const params = useParams<{ moduleId: string }>();
  const moduleId = params?.moduleId;

  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [level, setLevel] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId) {
      setLoadState({ status: "error", message: "No moduleId provided in URL." });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data, error } = await supabase
        .from("modules")
        .select("id, title, slug, level, order_index, description")
        .eq("id", moduleId)
        .maybeSingle();

      if (error) {
        setLoadState({ status: "error", message: `Supabase error: ${error.message}` });
        return;
      }

      if (!data) {
        setLoadState({ status: "error", message: `No module found with id "${moduleId}"` });
        return;
      }

      setTitle(data.title);
      setSlug(data.slug);
      setLevel(data.level || "");
      setOrderIndex(data.order_index ?? 1);
      setDescription(data.description || "");

      setLoadState({ status: "ready", module: data });
    }

    load();
  }, [moduleId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!title.trim()) {
      setMessage("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("modules")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          level: level.trim(),
          order_index: orderIndex,
          description: description.trim() || null,
        })
        .eq("id", moduleId);

      if (error) {
        setMessage("Supabase error: " + error.message);
        return;
      }

      setMessage("Module updated successfully!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Edit module</h1>
      <p>
        Module id: <code>{moduleId}</code>
      </p>

      {loadState.status === "loading" && <p>Loading module…</p>}

      {loadState.status === "error" && (
        <>
          <h2 style={{ color: "red" }}>Error</h2>
          <p>{loadState.message}</p>
        </>
      )}

      {loadState.status === "ready" && (
        <form onSubmit={handleSave} style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Level
            </label>
            <input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Order index
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc" }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "8px 16px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 4,
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}

      {message && (
        <p style={{ marginTop: 16, color: message.includes("error") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </main>
  );
}

