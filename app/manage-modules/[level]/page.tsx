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
import LinkButton from "../../../components/ui/LinkButton";
import { uiTokens } from "../../../lib/uiTokens";
import { loadModules, createModule } from "../../../lib/data/modules";
import { createModuleSchema } from "../../../lib/schemas/moduleSchema";
import { getModuleDisplayName } from "../../../lib/utils/displayName";
import type { Module } from "../../../lib/domain/module";

export default function ManageModulesPage() {
  const params = useParams<{ level: string }>();
  const levelParam = (params?.level || "").toUpperCase();

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState("");
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
      label,
      title: title || null,
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
      label: validation.data.label,
      title: validation.data.title ?? undefined,
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
    setLabel("");
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
        <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #398f8f", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentLevel={levelParam} />
        </div>
        
        {/* Right column - content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: uiTokens.space.md }}>
          <CmsSection
            title="Add module"
            backgroundColor="#83b9b9"
            borderColor="#398f8f"
            description="Create a module for this CEFR level."
          >
            <form ref={formRef} onSubmit={handleCreate}>
              <FormField 
                label="Label" 
                required
                infoTooltip="Internal name for this module used in the CMS and navigation. Not shown to learners."
              >
                <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
              </FormField>

              <FormField 
                label="Title (optional - for student-facing content)" 
                infoTooltip="Student-facing title. Only shown to learners if provided. Leave empty if not needed."
              >
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

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: uiTokens.space.md }}>
                <SaveChangesButton
                  onClick={handleSaveButtonClick}
                  hasUnsavedChanges={hasUnsavedChanges}
                  saving={saving}
                  label="Create module"
                />
              </div>
            </form>
            {message && (
              <StatusMessage variant={message.toLowerCase().includes("error") ? "error" : "success"}>
                {message}
              </StatusMessage>
            )}
          </CmsSection>

          <CmsSection
            title="Modules"
            backgroundColor="#83b9b9"
            borderColor="#398f8f"
            description={levelParam ? `Showing modules for level ${levelParam}` : undefined}
          >
            {loading && <p>Loading modules…</p>}
            {error && <p style={{ color: uiTokens.color.danger }}>{error}</p>}

            {!loading && modulesForPageLevel.length === 0 && <p>No modules yet.</p>}

            {!loading && modulesForPageLevel.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: `1px solid ${uiTokens.color.border}` }}>
                    <th style={{ padding: uiTokens.space.xs }}>Label</th>
                    <th style={{ padding: uiTokens.space.xs }}>Slug</th>
                    <th style={{ padding: uiTokens.space.xs }}>Level</th>
                    <th style={{ padding: uiTokens.space.xs }}>Order</th>
                    <th style={{ padding: uiTokens.space.xs }}>Status</th>
                    <th style={{ padding: uiTokens.space.xs }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modulesForPageLevel.map((mod) => (
                    <tr key={mod.id} style={{ borderBottom: `1px solid ${uiTokens.color.border}` }}>
                      <td style={{ padding: uiTokens.space.xs }}>{getModuleDisplayName(mod)}</td>
                      <td style={{ padding: uiTokens.space.xs }}><code className="codeText">{mod.slug}</code></td>
                      <td style={{ padding: uiTokens.space.xs }}>{mod.level || "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>{mod.orderIndex ?? "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>{mod.status || "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>
                        <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center" }}>
                          <LinkButton href={`/module-lessons/${mod.id}`} size="sm" style={{ color: "#83b9b9", border: "1px solid #398f8f" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ffffff" style={{ width: 16, height: 16 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                            </svg>
                          </LinkButton>
                          <LinkButton href={`/edit-module/${mod.id}`} size="sm" style={{ color: "#83b9b9", border: "1px solid #398f8f" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ffffff" style={{ width: 16, height: 16 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </LinkButton>
                        </div>
                      </td>
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
