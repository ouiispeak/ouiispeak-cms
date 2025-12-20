"use client";

import { useState, FormEvent, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import CmsSection from "../../../components/ui/CmsSection";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import { Button } from "../../../components/Button";
import { uiTokens } from "../../../lib/uiTokens";
import StatusMessage from "../../../components/ui/StatusMessage";
import { loadModuleById, updateModule } from "../../../lib/data/modules";
import type { Module } from "../../../lib/domain/module";
import { updateModuleSchema } from "../../../lib/schemas/moduleSchema";
import { useUnsavedChangesWarning } from "../../../lib/hooks/useUnsavedChangesWarning";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      module: Module;
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
  const initialDataRef = useRef<{
    title: string;
    slug: string;
    level: string;
    orderIndex: number;
    description: string;
    status: "draft" | "published" | "archived";
    visibility: "private" | "beta" | "public";
    moduleGoal: string;
    coreTopics: string;
    authorNotes: string;
  } | null>(null);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!initialDataRef.current) return false;
    const initial = initialDataRef.current;
    return (
      title !== initial.title ||
      slug !== initial.slug ||
      level !== initial.level ||
      orderIndex !== initial.orderIndex ||
      description !== initial.description ||
      status !== initial.status ||
      visibility !== initial.visibility ||
      moduleGoal !== initial.moduleGoal ||
      coreTopics !== initial.coreTopics ||
      authorNotes !== initial.authorNotes
    );
  }, [title, slug, level, orderIndex, description, status, visibility, moduleGoal, coreTopics, authorNotes]);

  // Warn before navigation
  useUnsavedChangesWarning(hasUnsavedChanges);

  useEffect(() => {
    if (!moduleId) {
      setLoadState({ status: "error", message: "No moduleId provided in URL." });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data, error } = await loadModuleById(moduleId);

      if (error) {
        setLoadState({ status: "error", message: error });
        return;
      }

      if (!data) {
        setLoadState({ status: "error", message: `No module found with id "${moduleId}"` });
        return;
      }

      setTitle(data.title);
      setSlug(data.slug);
      setLevel(data.level || "");
      setOrderIndex(data.orderIndex ?? 1);
      setDescription(data.description || "");
      setStatus((data.status as "draft" | "published" | "archived") || "draft");
      setVisibility((data.visibility as "private" | "beta" | "public") || "private");
      setModuleGoal(data.moduleGoal || "");
      setCoreTopics(data.coreTopics || "");
      setAuthorNotes(data.authorNotes || "");

      // Store initial values for comparison
      initialDataRef.current = {
        title: data.title,
        slug: data.slug,
        level: data.level || "",
        orderIndex: data.orderIndex ?? 1,
        description: data.description || "",
        status: (data.status as "draft" | "published" | "archived") || "draft",
        visibility: (data.visibility as "private" | "beta" | "public") || "private",
        moduleGoal: data.moduleGoal || "",
        coreTopics: data.coreTopics || "",
        authorNotes: data.authorNotes || "",
      };

      setLoadState({ status: "ready", module: data });
    }

    load();
  }, [moduleId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    // Validate using schema
    const result = updateModuleSchema.safeParse({
      title,
      slug,
      level,
      order_index: orderIndex,
      description: description || null,
      status: status || null,
      visibility: visibility || null,
      module_goal: moduleGoal || null,
      core_topics: coreTopics || null,
      author_notes: authorNotes || null,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      setMessage(firstError.message);
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateModule(moduleId, result.data);

      if (error) {
        setMessage(error);
        return;
      }

      setMessage("Module updated successfully!");
      
      // Update initial data ref after successful save
      if (initialDataRef.current) {
        initialDataRef.current = {
          title,
          slug,
          level,
          orderIndex,
          description,
          status,
          visibility,
          moduleGoal,
          coreTopics,
          authorNotes,
        };
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <CmsPageShell
      title="Edit module"
    >
      {loadState.status === "loading" && <p>Loading module…</p>}

      {loadState.status === "error" && (
        <CmsSection title="Error" description={loadState.message}>
          <p style={{ color: uiTokens.color.danger }}>{loadState.message}</p>
        </CmsSection>
      )}

      {loadState.status === "ready" && (
        <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
          {/* Left column - outline view */}
          <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #d7a592", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
            <CmsOutlineView currentModuleId={moduleId} hasUnsavedChanges={hasUnsavedChanges} />
          </div>
          
          {/* Right column - form */}
          <div style={{ flex: 1 }}>
            {hasUnsavedChanges && (
              <div style={{ 
                padding: uiTokens.space.sm, 
                marginBottom: uiTokens.space.md, 
                backgroundColor: "#fff3cd", 
                border: "1px solid #ffc107",
                borderRadius: uiTokens.radius.md,
                color: uiTokens.color.text
              }}>
                ⚠️ You have unsaved changes
              </div>
            )}
            <CmsSection title="Module Details" backgroundColor="#e3c3b9" borderColor="#d7a592">
              <form onSubmit={handleSave}>
            <FormField label="Module ID" borderColor="#d7a592">
              <Input value={moduleId || ""} disabled readOnly />
            </FormField>

            <FormField label="Title" required borderColor="#d7a592">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>

            <FormField label="Slug" required borderColor="#d7a592">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </FormField>

            <FormField label="Level" required borderColor="#d7a592">
              <Input value={level} onChange={(e) => setLevel(e.target.value)} />
            </FormField>

            <FormField label="Order index" required borderColor="#d7a592">
              <Input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
              />
            </FormField>

            <FormField label="Description (optional)" borderColor="#d7a592">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </FormField>

            <FormField label="Status" required borderColor="#d7a592">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published" | "archived")}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </Select>
            </FormField>

            <FormField label="Visibility" required borderColor="#d7a592">
              <Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "private" | "beta" | "public")}
              >
                <option value="private">private</option>
                <option value="beta">beta</option>
                <option value="public">public</option>
              </Select>
            </FormField>

            <FormField label="Module goal (optional)" borderColor="#d7a592">
              <Textarea
                value={moduleGoal}
                onChange={(e) => setModuleGoal(e.target.value)}
                rows={4}
              />
            </FormField>

            <FormField label="Core topics (optional)" helper="Comma-separated list of topics" borderColor="#d7a592">
              <Input
                value={coreTopics}
                onChange={(e) => setCoreTopics(e.target.value)}
                placeholder="e.g., grammar, vocabulary, pronunciation"
              />
            </FormField>

            <FormField label="Author notes (optional)" borderColor="#d7a592">
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
          </div>
        </div>
      )}

      {message && (
        <StatusMessage variant={message.includes("error") ? "error" : "success"}>
          {message}
        </StatusMessage>
      )}
    </CmsPageShell>
  );
}

