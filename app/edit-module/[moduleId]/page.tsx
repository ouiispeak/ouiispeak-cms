"use client";

import { useState, FormEvent, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import PageShell from "../../../components/ui/PageShell";
import CmsSection from "../../../components/ui/CmsSection";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import { Button } from "../../../components/Button";
import { uiTokens } from "../../../lib/uiTokens";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      module: {
        id: string;
        title: string;
        slug: string;
        level: string;
        order_index: number | null;
        description: string | null;
        status: string | null;
        visibility: string | null;
        module_goal: string | null;
        core_topics: string | null;
        author_notes: string | null;
      };
    };

export default function EditModulePage() {
  const params = useParams<{ moduleId: string }>();
  const moduleId = params?.moduleId;

  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [level, setLevel] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [visibility, setVisibility] = useState<"private" | "beta" | "public">("private");
  const [moduleGoal, setModuleGoal] = useState("");
  const [coreTopics, setCoreTopics] = useState("");
  const [authorNotes, setAuthorNotes] = useState("");

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
        .select("id, title, slug, level, order_index, description, status, visibility, module_goal, core_topics, author_notes")
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
      setStatus((data.status as "draft" | "published" | "archived") || "draft");
      setVisibility((data.visibility as "private" | "beta" | "public") || "private");
      setModuleGoal(data.module_goal || "");
      setCoreTopics(data.core_topics || "");
      setAuthorNotes(data.author_notes || "");

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

    // Validate status
    if (!["draft", "published", "archived"].includes(status)) {
      setMessage("Status must be one of: draft, published, archived");
      return;
    }

    // Validate visibility
    if (!["private", "beta", "public"].includes(visibility)) {
      setMessage("Visibility must be one of: private, beta, public");
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
          status: status,
          visibility: visibility,
          module_goal: moduleGoal.trim() || null,
          core_topics: coreTopics.trim() || null,
          author_notes: authorNotes.trim() || null,
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
    <PageShell
      title="Edit module"
      maxWidth="md"
      meta={
        <>
          Module id: <code className="codeText">{moduleId}</code>
        </>
      }
    >
      {loadState.status === "loading" && <p>Loading module…</p>}

      {loadState.status === "error" && (
        <CmsSection title="Error" description={loadState.message}>
          <p style={{ color: uiTokens.color.danger }}>{loadState.message}</p>
        </CmsSection>
      )}

      {loadState.status === "ready" && (
        <CmsSection title="Module Details">
          <form onSubmit={handleSave}>
            <FormField label="Title" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>

            <FormField label="Slug" required>
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

            <FormField label="Status" required>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published" | "archived")}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </Select>
            </FormField>

            <FormField label="Visibility" required>
              <Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "private" | "beta" | "public")}
              >
                <option value="private">private</option>
                <option value="beta">beta</option>
                <option value="public">public</option>
              </Select>
            </FormField>

            <FormField label="Module goal (optional)">
              <Textarea
                value={moduleGoal}
                onChange={(e) => setModuleGoal(e.target.value)}
                rows={4}
              />
            </FormField>

            <FormField label="Core topics (optional)" helper="Comma-separated list of topics">
              <Input
                value={coreTopics}
                onChange={(e) => setCoreTopics(e.target.value)}
                placeholder="e.g., grammar, vocabulary, pronunciation"
              />
            </FormField>

            <FormField label="Author notes (optional)">
              <Textarea
                value={authorNotes}
                onChange={(e) => setAuthorNotes(e.target.value)}
                rows={4}
              />
            </FormField>

            <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CmsSection>
      )}

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

