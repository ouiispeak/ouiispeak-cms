"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import CmsSection from "../../../components/ui/CmsSection";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import SaveChangesButton from "../../../components/ui/SaveChangesButton";
import StatusMessage from "../../../components/ui/StatusMessage";
import { uiTokens } from "../../../lib/uiTokens";
import { loadModules, createModule } from "../../../lib/data/modules";
import { createModuleSchema } from "../../../lib/schemas/moduleSchema";
import type { Module } from "../../../lib/domain/module";

export default function ManageModulesPage() {
  const params = useParams<{ level: string }>();
  const levelParam = (params?.level || "").toUpperCase();

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [level, setLevel] = useState(levelParam || "A0");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const sortedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      const levelA = (a.level || "").toUpperCase();
      const levelB = (b.level || "").toUpperCase();
      if (levelA !== levelB) {
        return levelA.localeCompare(levelB);
      }
      const orderA = a.orderIndex ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.orderIndex ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [modules]);

  const selectedLevelUpper = (level || "").toUpperCase();

  const modulesForPageLevel = useMemo(
    () => sortedModules.filter((m) => (levelParam ? (m.level || "").toUpperCase() === levelParam : true)),
    [sortedModules, levelParam]
  );

  const modulesForSelectedLevel = useMemo(
    () => sortedModules.filter((m) => (m.level || "").toUpperCase() === selectedLevelUpper),
    [sortedModules, selectedLevelUpper]
  );

  const nextOrderIndex = useMemo(() => {
    return (
      modulesForSelectedLevel.reduce((max, m) => {
        const value = m.orderIndex ?? 0;
        return value > max ? value : max;
      }, 0) + 1
    );
  }, [modulesForSelectedLevel]);

  const hasUnsavedChanges = useMemo(
    () =>
      Boolean(
        title ||
        slug ||
        description ||
        status !== "draft" ||
        level !== (levelParam || "A0") ||
        orderIndex !== (nextOrderIndex || 0)
      ),
    [title, slug, description, status, level, levelParam, orderIndex, nextOrderIndex]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: loadError } = await loadModules();
      if (loadError) {
        setError(loadError);
        setLoading(false);
        return;
      }

      setModules(data ?? []);
      setLoading(false);
    }

    load();
  }, []);

  useEffect(() => {
    setOrderIndex(nextOrderIndex || 0);
  }, [nextOrderIndex]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const parsedOrderIndex = Number(orderIndex);

    const validation = createModuleSchema.safeParse({
      title,
      slug,
      level,
      order_index: parsedOrderIndex,
      description: description || null,
      status,
    });

    if (!validation.success) {
      setMessage(validation.error.issues[0]?.message || "Validation error");
      return;
    }

    setSaving(true);
    const { error: insertError } = await createModule({
      title: validation.data.title,
      slug: validation.data.slug,
      level: validation.data.level,
      order_index: validation.data.order_index,
      description: validation.data.description ?? undefined,
      status: validation.data.status ?? undefined,
    });
    setSaving(false);

    if (insertError) {
      setMessage(insertError);
      return;
    }

    setMessage("Module created!");
    setTitle("");
    setSlug("");
    setDescription("");
    setStatus("draft");
    // reload modules to include new record
    const { data: refreshed, error: refreshError } = await loadModules();
    if (refreshError) {
      setError(refreshError);
    } else {
      setModules(refreshed ?? []);
    }
  };

  const handleSaveButtonClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <CmsPageShell title={`${levelParam || "A0"} - Manage CEFR`}>
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
        <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #d09680", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentLevel={levelParam} />
        </div>
        
        {/* Right column - content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: uiTokens.space.md }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveChangesButton
              onClick={handleSaveButtonClick}
              hasUnsavedChanges={hasUnsavedChanges}
              saving={saving}
              label="Create module"
            />
          </div>
          <CmsSection
            title="Add module"
            backgroundColor="#f8f0ed"
            borderColor="#f2e1db"
            description="Create a module for this CEFR level."
          >
            <form ref={formRef} onSubmit={handleCreate}>
              <FormField label="Title" required>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </FormField>

              <FormField label="Slug" required helper={<span className="metaText">Manual entry allowed (e.g., <code className="codeText">alphabet-basics</code>).</span>}>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: uiTokens.space.sm }}>
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

                <FormField label="Status" required>
                  <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="archived">archived</option>
                  </Select>
                </FormField>
              </div>

              <FormField label="Description (optional)">
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormField>
            </form>
            {message && (
              <StatusMessage variant={message.toLowerCase().includes("error") ? "error" : "success"}>
                {message}
              </StatusMessage>
            )}
          </CmsSection>

          <CmsSection
            title="Modules"
            backgroundColor="#f8f0ed"
            borderColor="#f2e1db"
            description={levelParam ? `Showing modules for level ${levelParam}` : undefined}
          >
            {loading && <p>Loading modules…</p>}
            {error && <p style={{ color: uiTokens.color.danger }}>{error}</p>}

            {!loading && modulesForPageLevel.length === 0 && <p>No modules yet.</p>}

            {!loading && modulesForPageLevel.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: `1px solid ${uiTokens.color.border}` }}>
                    <th style={{ padding: uiTokens.space.xs }}>Title</th>
                    <th style={{ padding: uiTokens.space.xs }}>Slug</th>
                    <th style={{ padding: uiTokens.space.xs }}>Level</th>
                    <th style={{ padding: uiTokens.space.xs }}>Order</th>
                    <th style={{ padding: uiTokens.space.xs }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modulesForPageLevel.map((mod) => (
                    <tr key={mod.id} style={{ borderBottom: `1px solid ${uiTokens.color.border}` }}>
                      <td style={{ padding: uiTokens.space.xs }}>{mod.title}</td>
                      <td style={{ padding: uiTokens.space.xs }}><code className="codeText">{mod.slug}</code></td>
                      <td style={{ padding: uiTokens.space.xs }}>{mod.level || "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>{mod.orderIndex ?? "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>{mod.status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CmsSection>
        </div>
      </div>
    </CmsPageShell>
  );
}
