"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import { Button } from "../../components/Button";
import { uiTokens } from "../../lib/uiTokens";

type ModuleRow = {
  id: string;
  slug: string;
  title: string;
  order_index: number | null;
};

type CreatedLesson = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  order_index: number;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function NewLessonForm() {
  const searchParams = useSearchParams();
  const moduleIdParam = searchParams?.get("module_id");
  
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [moduleId, setModuleId] = useState(moduleIdParam || "");
  const [lessonSlugPart, setLessonSlugPart] = useState(""); // e.g. "lesson-1"
  const [title, setTitle] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);
  const [shortSummaryStudent, setShortSummaryStudent] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [notesForTeacherOrAI, setNotesForTeacherOrAI] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdLesson, setCreatedLesson] = useState<CreatedLesson | null>(null);

  useEffect(() => {
    async function loadModules() {
      setLoadError(null);

      const { data, error } = await supabase
        .from("modules")
        .select("id, slug, title, order_index")
        .order("order_index", { ascending: true });

      if (error) {
        setLoadError(`Supabase error loading modules: ${error.message}`);
        return;
      }

      setModules((data ?? []) as ModuleRow[]);
    }

    loadModules();
  }, []);

  useEffect(() => {
    if (moduleIdParam) {
      setModuleId(moduleIdParam);
    }
  }, [moduleIdParam]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedLesson(null);

    if (!moduleId || !lessonSlugPart || !title) {
      setMessage("Module, lesson slug, and title are required.");
      return;
    }

    const selectedModule = modules.find((m) => m.id === moduleId);
    if (!selectedModule) {
      setMessage("Selected module not found. Refresh and try again.");
      return;
    }

    const fullSlug = `${selectedModule.slug}/${slugify(lessonSlugPart)}`;

    // Helper function to convert empty string to null
    const nullIfEmpty = (s: string) => (s.trim() === "" ? null : s.trim());

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("lessons")
        .insert({
          module_id: moduleId,
          slug: fullSlug,
          title: title.trim(),
          order_index: orderIndex,
          estimated_minutes: estimatedMinutes,
          required_score: null,
          content: null,
          short_summary_student: nullIfEmpty(shortSummaryStudent),
          learning_objectives: nullIfEmpty(learningObjectives),
          notes_for_teacher_or_ai: nullIfEmpty(notesForTeacherOrAI),
          // Set all other new fields to null
          short_summary_admin: null,
          course_organization_group: null,
          slide_contents: null,
          grouping_strategy_summary: null,
          activity_types: null,
          activity_description: null,
          signature_metaphors: null,
          main_grammar_topics: null,
          pronunciation_focus: null,
          vocabulary_theme: null,
          l1_l2_issues: null,
          prerequisites: null,
        })
        .select("id, module_id, slug, title, order_index")
        .maybeSingle();

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      if (!data) {
        setMessage("Insert succeeded but no data returned.");
        return;
      }

      setCreatedLesson(data as CreatedLesson);
      setMessage("Lesson created successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="Create new lesson" maxWidth="md">
      {loadError && (
        <p style={{ color: "red", marginTop: uiTokens.space.sm }}>
          {loadError}
        </p>
      )}

      <CmsSection>
        <form onSubmit={handleSubmit}>
          <FormField label="Module" required>
            <Select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
              <option value="">Select a module…</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.slug})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Lesson slug (just the lesson part)"
            required
            helper={
              <>
                Full slug will become:{" "}
                <code className="codeText">
                  {moduleId
                    ? `${modules.find((m) => m.id === moduleId)?.slug ?? "module"}/${slugify(lessonSlugPart || "lesson-1")}`
                    : `module/lesson-1`}
                </code>
              </>
            }
          >
            <Input
              value={lessonSlugPart}
              onChange={(e) => setLessonSlugPart(e.target.value)}
              placeholder="lesson-1"
            />
          </FormField>

          <FormField label="Lesson title" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>

          <FormField label="Order index" required>
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />
          </FormField>

          <FormField label="Estimated Minutes">
            <Input
              type="number"
              value={estimatedMinutes ?? ""}
              onChange={(e) => setEstimatedMinutes(e.target.value ? Number(e.target.value) : null)}
              placeholder="Optional"
            />
          </FormField>

          <FormField label="Short Summary (Student)">
            <Textarea
              value={shortSummaryStudent}
              onChange={(e) => setShortSummaryStudent(e.target.value)}
              rows={3}
            />
          </FormField>

          <FormField label="Learning Objectives">
            <Textarea
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              rows={3}
            />
          </FormField>

          <FormField label="Notes for Teacher or AI">
            <Textarea
              value={notesForTeacherOrAI}
              onChange={(e) => setNotesForTeacherOrAI(e.target.value)}
              rows={4}
            />
          </FormField>

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create lesson"}
            </Button>
          </div>
        </form>
      </CmsSection>

      {message && (
        <p
          style={{
            marginTop: uiTokens.space.md,
            color: message.toLowerCase().includes("error") ? uiTokens.color.danger : "green",
          }}
        >
          {message}
        </p>
      )}

      {createdLesson && (
        <CmsSection title="Created lesson">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(createdLesson, null, 2)}
          </pre>
        </CmsSection>
      )}
    </PageShell>
  );
}

export default function NewLessonPage() {
  return (
    <Suspense fallback={<PageShell title="Create new lesson" maxWidth="md"><p>Loading...</p></PageShell>}>
      <NewLessonForm />
    </Suspense>
  );
}
