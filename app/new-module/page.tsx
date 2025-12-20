"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CmsPageShell from "../../components/cms/CmsPageShell";
import CmsSection from "../../components/ui/CmsSection";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import { Button } from "../../components/Button";
import { uiTokens } from "../../lib/uiTokens";
import { slugify } from "../../lib/utils/string";
import StatusMessage from "../../components/ui/StatusMessage";
import { createModuleSchema } from "../../lib/schemas/moduleSchema";
import { createModule } from "../../lib/data/modules";

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
    
    // Validate using schema
    const result = createModuleSchema.safeParse({
      title,
      slug: finalSlug,
      level,
      order_index: orderIndex,
      description: description || null,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      setMessage(firstError.message);
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await createModule({
        title: result.data.title,
        slug: result.data.slug,
        level: result.data.level,
        order_index: result.data.order_index,
        description: result.data.description,
      });

      if (error) {
        setMessage("Error: " + error);
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
    <CmsPageShell title="Create module" maxWidth="md">
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
        <StatusMessage variant={message.includes("error") ? "error" : "success"}>
          {message}
        </StatusMessage>
      )}
    </CmsPageShell>
  );
}

export default function NewModulePage() {
  return (
    <Suspense fallback={<CmsPageShell title="Create module" maxWidth="md"><p>Loading...</p></CmsPageShell>}>
      <NewModuleForm />
    </Suspense>
  );
}
