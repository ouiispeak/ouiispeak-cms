"use client";

import { useState, FormEvent } from "react";
import { supabase } from "../../lib/supabase";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewModulePage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [level, setLevel] = useState("A1");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function autoSlugFromTitle(nextTitle: string) {
    setTitle(nextTitle);
    if (!slug) setSlug(slugify(nextTitle));
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    const finalSlug = slugify(slug || title);
    if (!title.trim()) return setMessage("Title is required.");
    if (!finalSlug) return setMessage("Slug is required.");

    setSaving(true);
    try {
        const { error } = await supabase.schema("public").from("modules").insert({
        title: title.trim(),
        slug: finalSlug,
        level: level.trim(),
        order_index: orderIndex,
        description: description.trim() || null,
      });

      if (error) {
        setMessage("Supabase error: " + error.message);
        return;
      }

      setMessage("Module created!");
      setTitle("");
      setSlug("");
      setDescription("");
      setOrderIndex(1);
      setLevel("A1");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Create module</h1>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
  SUPABASE URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
</p>


      <form onSubmit={handleCreate} style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => autoSlugFromTitle(e.target.value)}
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
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            Example: <code>module-1</code> or <code>alphabet-basics</code>
          </p>
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
          disabled={saving}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          {saving ? "Creating…" : "Create module"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 16, color: message.includes("error") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </main>
  );
}
