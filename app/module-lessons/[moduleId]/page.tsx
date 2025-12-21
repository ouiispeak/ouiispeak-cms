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
import { loadModuleById } from "../../../lib/data/modules";
import { loadLessonsByModule, createLesson } from "../../../lib/data/lessons";
import type { Lesson } from "../../../lib/domain/lesson";
import type { Module } from "../../../lib/domain/module";
import { toLesson } from "../../../lib/mappers/lessonMapper";
import { createLessonSchema } from "../../../lib/schemas/lessonSchema";
import { slugify } from "../../../lib/utils/string";

export default function ModuleLessonsPage() {
  const params = useParams<{ moduleId: string }>();
  const moduleId = params?.moduleId;

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      title,
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
      title: validation.data.title,
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
        <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #deb4a5", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentModuleId={moduleId} />
        </div>
        
        {/* Right column - content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: uiTokens.space.md }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveChangesButton
              onClick={handleSaveButtonClick}
              hasUnsavedChanges={hasUnsavedChanges}
              saving={saving}
              label="Create lesson"
            />
          </div>
          <CmsSection
            title="Add lesson"
            backgroundColor="#f8f0ed"
            borderColor="#f2e1db"
            description="Create a lesson in this module."
          >
            <form ref={formRef} onSubmit={handleSubmit}>
              <FormField label="Lesson title" required>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </FormField>

              <FormField
                label="Lesson slug"
                required
                helper={<span className="metaText">Lesson-only slug; we will slugify input.</span>}
              >
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: uiTokens.space.sm }}>
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
            backgroundColor="#f8f0ed"
            borderColor="#f2e1db"
            description="Lessons in this module."
          >
            {loading && <p>Loading lessons…</p>}
            {error && <p style={{ color: uiTokens.color.danger }}>{error}</p>}

            {!loading && sortedLessons.length === 0 && <p>No lessons yet.</p>}

            {!loading && sortedLessons.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: `1px solid ${uiTokens.color.border}` }}>
                    <th style={{ padding: uiTokens.space.xs }}>Title</th>
                    <th style={{ padding: uiTokens.space.xs }}>Slug</th>
                    <th style={{ padding: uiTokens.space.xs }}>Order</th>
                    <th style={{ padding: uiTokens.space.xs }}>Estimated minutes</th>
                    <th style={{ padding: uiTokens.space.xs }}>Lesson ID</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLessons.map((lesson) => (
                    <tr key={lesson.id} style={{ borderBottom: `1px solid ${uiTokens.color.border}` }}>
                      <td style={{ padding: uiTokens.space.xs }}>{lesson.title}</td>
                      <td style={{ padding: uiTokens.space.xs }}><code className="codeText">{lesson.slug}</code></td>
                      <td style={{ padding: uiTokens.space.xs }}>{lesson.orderIndex ?? "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>{lesson.estimatedMinutes ?? "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>
                        <code className="codeText">{lesson.id}</code>
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
