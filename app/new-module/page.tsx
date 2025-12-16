"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";
import PageContainer from "../../components/ui/PageContainer";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function NewModuleForm() {
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get("level");
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [level, setLevel] = useState(levelParam || "A1");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (levelParam) {
      setLevel(levelParam);
    }
  }, [levelParam]);

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
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>Create module</h1>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <BackButton title="Back to Dashboard" />
      </div>
      <PageContainer maxWidth="md">
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
          {saving ? "Creating…" : "Create module"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 16, color: message.includes("error") ? "red" : "green" }}>
          {message}
        </p>
      )}
      </PageContainer>
    </>
  );
}

export default function NewModulePage() {
  return (
    <Suspense fallback={<><div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}><h1 style={{ margin: 0 }}>Create module</h1></div><PageContainer maxWidth="md"><p>Loading...</p></PageContainer></>}>
      <NewModuleForm />
    </Suspense>
  );
}
