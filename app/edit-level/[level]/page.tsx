"use client";

import { useState, FormEvent, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import CmsSection from "../../../components/ui/CmsSection";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import SaveChangesButton from "../../../components/ui/SaveChangesButton";
import StatusMessage from "../../../components/ui/StatusMessage";
import { uiTokens } from "../../../lib/uiTokens";
import { loadCefrLevelByLevel, upsertCefrLevel } from "../../../lib/data/cefrLevels";
import type { CefrLevel } from "../../../lib/domain/cefrLevel";
import { updateCefrLevelSchema } from "../../../lib/schemas/cefrLevelSchema";
import { useUnsavedChangesWarning } from "../../../lib/hooks/cms/useUnsavedChangesWarning";
import Link from "next/link";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; level: CefrLevel | null }
  | { status: "empty" }; // Level doesn't exist yet

export default function EditLevelPage() {
  const params = useParams<{ level: string }>();
  const router = useRouter();
  const levelParam = params?.level?.toUpperCase() || "";

  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [status, setStatus] = useState<"draft" | "published" | "archived" | "">("");
  const [visibility, setVisibility] = useState<"private" | "beta" | "public" | "">("");
  const [description, setDescription] = useState("");
  const [authorNotes, setAuthorNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const initialDataRef = useRef<{
    status: "draft" | "published" | "archived" | "";
    visibility: "private" | "beta" | "public" | "";
    description: string;
    authorNotes: string;
  } | null>(null);

  // Check if form has unsaved changes
  const hasUnsavedChanges = (() => {
    if (!initialDataRef.current) return false;
    const initial = initialDataRef.current;
    return (
      status !== initial.status ||
      visibility !== initial.visibility ||
      description !== initial.description ||
      authorNotes !== initial.authorNotes
    );
  })();

  // Warn before navigation
  useUnsavedChangesWarning(hasUnsavedChanges);

  useEffect(() => {
    if (!levelParam) {
      setLoadState({ status: "error", message: "No level provided in URL." });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data, error } = await loadCefrLevelByLevel(levelParam);

      if (error) {
        setLoadState({ status: "error", message: error });
        return;
      }

      if (!data) {
        // Level doesn't exist yet - show empty state
        setStatus("");
        setVisibility("");
        setDescription("");
        setAuthorNotes("");
        initialDataRef.current = {
          status: "",
          visibility: "",
          description: "",
          authorNotes: "",
        };
        setLoadState({ status: "empty" });
        return;
      }

      // Level exists - populate form
      setStatus(data.status || "");
      setVisibility(data.visibility || "");
      setDescription(data.description || "");
      setAuthorNotes(data.authorNotes || "");

      initialDataRef.current = {
        status: data.status || "",
        visibility: data.visibility || "",
        description: data.description || "",
        authorNotes: data.authorNotes || "",
      };

      setLoadState({ status: "ready", level: data });
    }

    load();
  }, [levelParam]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    // Validate using schema
    const result = updateCefrLevelSchema.safeParse({
      level: levelParam,
      status: status || null,
      visibility: visibility || null,
      description: description.trim() || null,
      author_notes: authorNotes.trim() || null,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      setMessage(firstError.message);
      return;
    }

    setSaving(true);
    try {
      const { data: savedData, error } = await upsertCefrLevel({
        level: levelParam,
        status: result.data.status ?? null,
        visibility: result.data.visibility ?? null,
        description: result.data.description ?? null,
        author_notes: result.data.author_notes ?? null,
      });

      if (error) {
        setMessage(`Error: ${error}`);
        return;
      }

      setMessage("Level metadata saved successfully!");

      // Reload data from server
      const { data: reloadedData, error: reloadError } = await loadCefrLevelByLevel(levelParam);

      if (reloadError || !reloadedData) {
        // If reload fails, use saved data
        if (savedData) {
          setStatus(savedData.status || "");
          setVisibility(savedData.visibility || "");
          setDescription(savedData.description || "");
          setAuthorNotes(savedData.authorNotes || "");
        }
      } else {
        // Use reloaded data
        setStatus(reloadedData.status || "");
        setVisibility(reloadedData.visibility || "");
        setDescription(reloadedData.description || "");
        setAuthorNotes(reloadedData.authorNotes || "");
      }

      // Update initial data ref
      if (initialDataRef.current) {
        initialDataRef.current = {
          status: status || "",
          visibility: visibility || "",
          description: description || "",
          authorNotes: authorNotes || "",
        };
      }

      // Update load state
      setLoadState({ status: "ready", level: reloadedData || savedData || null });
    } finally {
      setSaving(false);
    }
  }

  const handleSaveButtonClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <CmsPageShell title={`Edit Level: ${levelParam}`}>
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
        <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #398f8f", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentLevel={levelParam} />
        </div>

        {/* Right column - content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: uiTokens.space.md }}>
            <Link
              href={`/manage-modules/${levelParam}`}
              style={{
                color: uiTokens.color.text,
                textDecoration: "none",
                fontSize: uiTokens.font.meta.size,
                display: "flex",
                alignItems: "center",
                gap: uiTokens.space.xs,
              }}
            >
              ← Back to Manage
            </Link>
            <SaveChangesButton
              onClick={handleSaveButtonClick}
              hasUnsavedChanges={hasUnsavedChanges}
              saving={saving}
            />
          </div>

          {loadState.status === "loading" && <p>Loading level metadata…</p>}

          {loadState.status === "error" && (
            <CmsSection title="Error" description={loadState.message} backgroundColor="#83b9b9" borderColor="#398f8f">
              <p style={{ color: uiTokens.color.danger }}>{loadState.message}</p>
            </CmsSection>
          )}

          {(loadState.status === "ready" || loadState.status === "empty") && (
            <form ref={formRef} onSubmit={handleSave}>
              <CmsSection
                title={`Level: ${levelParam}`}
                backgroundColor="#83b9b9"
                borderColor="#398f8f"
                description={loadState.status === "empty" ? "Create metadata for this CEFR level." : "Edit metadata for this CEFR level."}
              >
                <FormField label="Level" borderColor="#398f8f">
                  <Input value={levelParam} disabled readOnly />
                </FormField>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: uiTokens.space.sm }}>
                  <FormField label="Status" borderColor="#398f8f">
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "draft" | "published" | "archived" | "")}
                    >
                      <option value="">—</option>
                      <option value="draft">draft</option>
                      <option value="published">published</option>
                      <option value="archived">archived</option>
                    </Select>
                  </FormField>

                  <FormField label="Visibility" borderColor="#398f8f">
                    <Select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as "private" | "beta" | "public" | "")}
                    >
                      <option value="">—</option>
                      <option value="private">private</option>
                      <option value="beta">beta</option>
                      <option value="public">public</option>
                    </Select>
                  </FormField>
                </div>

                <FormField label="Description" borderColor="#398f8f">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Description of this CEFR level..."
                  />
                </FormField>

                <FormField label="Author notes (optional)" borderColor="#398f8f">
                  <Textarea
                    value={authorNotes}
                    onChange={(e) => setAuthorNotes(e.target.value)}
                    rows={4}
                    placeholder="Internal notes for authors..."
                  />
                </FormField>
              </CmsSection>
            </form>
          )}

          {message && (
            <StatusMessage variant={message.toLowerCase().includes("error") ? "error" : "success"}>
              {message}
            </StatusMessage>
          )}
        </div>
      </div>
    </CmsPageShell>
  );
}
