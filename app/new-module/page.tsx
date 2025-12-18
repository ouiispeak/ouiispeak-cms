"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import { Button } from "../../components/Button";
import { uiTokens } from "../../lib/uiTokens";

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
    <PageShell title="Create module" maxWidth="md">
      <CmsSection>
        <form onSubmit={handleCreate}>
          <FormField label="Title" required>
            <Input value={title} onChange={(e) => autoSlugFromTitle(e.target.value)} />
          </FormField>

          <FormField
            label="Slug"
            required
            helper={
              <>
                Example: <code className="codeText">module-1</code> or <code className="codeText">alphabet-basics</code>
              </>
            }
          >
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </FormField>

          <FormField label="Level" required>
            <Input value={level} onChange={(e) => setLevel(e.target.value)} />
          </FormField>

          <FormField label="Order index" required>
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />
          </FormField>

          <FormField label="Description (optional)">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </FormField>

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create module"}
            </Button>
          </div>
        </form>
      </CmsSection>

      {message && (
        <p
          style={{
            marginTop: uiTokens.space.md,
            color: message.includes("error") ? uiTokens.color.danger : "green",
          }}
        >
          {message}
        </p>
      )}
    </PageShell>
  );
}

export default function NewModulePage() {
  return (
    <Suspense fallback={<PageShell title="Create module" maxWidth="md"><p>Loading...</p></PageShell>}>
      <NewModuleForm />
    </Suspense>
  );
}
