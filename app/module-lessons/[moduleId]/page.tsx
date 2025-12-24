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
import { loadModuleById } from "../../../lib/data/modules";
import { loadLessonsByModule, createLesson } from "../../../lib/data/lessons";
import type { Lesson } from "../../../lib/domain/lesson";
import type { Module } from "../../../lib/domain/module";
import { toLesson } from "../../../lib/mappers/lessonMapper";
import { createLessonSchema } from "../../../lib/schemas/lessonSchema";
import { slugify } from "../../../lib/utils/string";
import { getLessonDisplayName } from "../../../lib/utils/displayName";

export default function ModuleLessonsPage() {
  const params = useParams<{ moduleId: string }>();
  const moduleId = params?.moduleId;

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);
  const [requiredScore, setRequiredScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success");
  const formRef = useRef<HTMLFormElement | null>(null);

  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const orderA = a.orderIndex ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.orderIndex ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [lessons]);

  const nextOrderIndex = useMemo(() => {
    const maxOrder = sortedLessons.reduce((max, lesson) => {
      const value = lesson.orderIndex ?? 0;
      return value > max ? value : max;
    }, 0);
    return maxOrder + 1 || 0;
  }, [sortedLessons]);

  const hasUnsavedChanges = useMemo(
    () =>
      Boolean(
        title ||
        slug ||
        estimatedMinutes !== null ||
        requiredScore !== null ||
        orderIndex !== (nextOrderIndex || 0)
      ),
    [title, slug, estimatedMinutes, requiredScore, orderIndex, nextOrderIndex]
  );

  useEffect(() => {
    if (!moduleId) return;

    async function load() {
      setLoading(true);
      setError(null);

      const [{ data: moduleData, error: moduleError }, { data: lessonData, error: lessonsError }] =
        await Promise.all([loadModuleById(moduleId), loadLessonsByModule(moduleId)]);

      if (moduleError) {
        setError(moduleError);
        setLoading(false);
        return;
      }

      if (lessonsError) {
        setError(lessonsError);
        setLoading(false);
        return;
      }

      setModule(moduleData ?? null);
      setLessons((lessonData ?? []).map(toLesson));
      setLoading(false);
    }

    load();
  }, [moduleId]);

  useEffect(() => {
    setOrderIndex(nextOrderIndex);
  }, [nextOrderIndex]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setMessageVariant("success");
    setError(null);

    if (!moduleId) {
      setMessage("No module selected.");
      return;
    }

    const sanitizedSlug = slugify(slug || title);
    const validation = createLessonSchema.safeParse({
      module_id: moduleId,
      slug: sanitizedSlug,
      label,
      title: title || null,
      order_index: Number(orderIndex),
      estimated_minutes: estimatedMinutes || null,
      required_score: requiredScore ?? null,
    });

    if (!validation.success) {
      setMessage(validation.error.issues[0]?.message || "Validation error");
      setMessageVariant("error");
      return;
    }

    setSaving(true);
    const { error: insertError } = await createLesson({
      module_id: validation.data.module_id,
      slug: validation.data.slug,
      label: validation.data.label,
      title: validation.data.title ?? undefined,
      order_index: validation.data.order_index,
      estimated_minutes: validation.data.estimated_minutes ?? undefined,
      required_score: validation.data.required_score ?? undefined,
    });
    setSaving(false);

    if (insertError) {
      setMessage(insertError);
      setMessageVariant("error");
      return;
    }

    setMessage("Lesson created!");
    setMessageVariant("success");
    setLabel("");
    setTitle("");
    setSlug("");
    setEstimatedMinutes(null);
    setRequiredScore(null);

    const { data: lessonData, error: refreshError } = await loadLessonsByModule(moduleId);
    if (refreshError) {
      setError(refreshError);
    } else {
      setLessons((lessonData ?? []).map(toLesson));
    }
  };

  const handleSaveButtonClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const pageTitle = module ? `${module.title} - Manage Module` : "Manage Module";

  return (
    <CmsPageShell title={pageTitle}>
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
        <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #6aabab", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentModuleId={moduleId} />
        </div>
        
        {/* Right column - content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: uiTokens.space.md }}>
          <CmsSection
            title="Add lesson"
            backgroundColor="#9cc7c7"
            borderColor="#6aabab"
            description="Create a lesson in this module."
          >
            <form ref={formRef} onSubmit={handleSubmit}>
              <FormField 
                label="Label" 
                required
                infoTooltip="Internal name for this lesson used in the CMS and navigation. Not shown to learners."
              >
                <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
              </FormField>

              <FormField 
                label="Title (optional - for student-facing content)" 
                infoTooltip="Student-facing title. Only shown to learners if provided. Leave empty if not needed."
              >
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </FormField>

              <FormField
                label="Lesson slug"
                required
                helper={<span className="metaText">Lesson-only slug; we will slugify input.</span>}
              >
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </FormField>

              <FormField label="Order index" required>
                <Input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                />
              </FormField>

              <FormField label="Estimated minutes (optional)">
                <Input
                  type="number"
                  value={estimatedMinutes ?? ""}
                  onChange={(e) => setEstimatedMinutes(e.target.value === "" ? null : Number(e.target.value))}
                />
              </FormField>

              <FormField label="Required score (optional)">
                <Input
                  type="number"
                  value={requiredScore ?? ""}
                  onChange={(e) => setRequiredScore(e.target.value === "" ? null : Number(e.target.value))}
                />
              </FormField>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: uiTokens.space.md }}>
                <SaveChangesButton
                  onClick={handleSaveButtonClick}
                  hasUnsavedChanges={hasUnsavedChanges}
                  saving={saving}
                  label="Create lesson"
                />
              </div>
            </form>

            {message && (
              <StatusMessage variant={messageVariant}>
                {message}
              </StatusMessage>
            )}
          </CmsSection>

          <CmsSection
            title="Lessons"
            backgroundColor="#9cc7c7"
            borderColor="#6aabab"
            description="Lessons in this module."
          >
            {loading && <p>Loading lessons…</p>}
            {error && <p style={{ color: uiTokens.color.danger }}>{error}</p>}

            {!loading && sortedLessons.length === 0 && <p>No lessons yet.</p>}

            {!loading && sortedLessons.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: `1px solid ${uiTokens.color.border}` }}>
                    <th style={{ padding: uiTokens.space.xs }}>Label</th>
                    <th style={{ padding: uiTokens.space.xs }}>Slug</th>
                    <th style={{ padding: uiTokens.space.xs }}>Order</th>
                    <th style={{ padding: uiTokens.space.xs }}>Estimated minutes</th>
                    <th style={{ padding: uiTokens.space.xs }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLessons.map((lesson) => (
                    <tr key={lesson.id} style={{ borderBottom: `1px solid ${uiTokens.color.border}` }}>
                      <td style={{ padding: uiTokens.space.xs }}>{getLessonDisplayName(lesson)}</td>
                      <td style={{ padding: uiTokens.space.xs }}><code className="codeText">{lesson.slug}</code></td>
                      <td style={{ padding: uiTokens.space.xs }}>{lesson.orderIndex ?? "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>{lesson.estimatedMinutes ?? "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>
                        <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center" }}>
                          <LinkButton href={`/lesson-slides/${lesson.id}`} size="sm" style={{ color: "#9cc7c7", border: "1px solid #6aabab" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ffffff" style={{ width: 16, height: 16 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                            </svg>
                          </LinkButton>
                          <LinkButton href={`/edit-lesson/${lesson.id}`} size="sm" style={{ color: "#9cc7c7", border: "1px solid #6aabab" }}>
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
