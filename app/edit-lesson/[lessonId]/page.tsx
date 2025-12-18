"use client";

import { useState, FormEvent, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import PageShell from "../../../components/ui/PageShell";
import CmsSection from "../../../components/ui/CmsSection";
import FormField from "../../../components/ui/FormField";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import Select from "../../../components/ui/Select";
import { Button } from "../../../components/Button";
import { uiTokens } from "../../../lib/uiTokens";

type ModuleRow = {
  id: string;
  slug: string;
  title: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      lesson: {
        id: string;
        module_id: string;
        title: string;
        slug: string;
        order_index: number | null;
        short_summary_admin: string | null;
        short_summary_student: string | null;
        course_organization_group: string | null;
        slide_contents: string | null;
        grouping_strategy_summary: string | null;
        activity_types: string[] | null;
        activity_description: string | null;
        signature_metaphors: string | null;
        main_grammar_topics: string | null;
        pronunciation_focus: string | null;
        vocabulary_theme: string | null;
        l1_l2_issues: string | null;
        prerequisites: string | null;
        learning_objectives: string | null;
        notes_for_teacher_or_ai: string | null;
      };
    };

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditLessonPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId;

  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [lessonSlugPart, setLessonSlugPart] = useState("");
  const [title, setTitle] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);

  // Summaries
  const [shortSummaryAdmin, setShortSummaryAdmin] = useState("");
  const [shortSummaryStudent, setShortSummaryStudent] = useState("");

  // Lesson structure
  const [courseOrganizationGroup, setCourseOrganizationGroup] = useState("");
  const [slideContents, setSlideContents] = useState("");
  const [groupingStrategySummary, setGroupingStrategySummary] = useState("");

  // Activities
  const [activityTypes, setActivityTypes] = useState("");
  const [activityDescription, setActivityDescription] = useState("");

  // Pedagogy
  const [signatureMetaphors, setSignatureMetaphors] = useState("");
  const [mainGrammarTopics, setMainGrammarTopics] = useState("");
  const [pronunciationFocus, setPronunciationFocus] = useState("");
  const [vocabularyTheme, setVocabularyTheme] = useState("");
  const [l1L2Issues, setL1L2Issues] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [notesForTeacherOrAI, setNotesForTeacherOrAI] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadModules() {
      const { data, error } = await supabase
        .from("modules")
        .select("id, slug, title, order_index")
        .order("order_index", { ascending: true });

      if (error) {
        setLoadState({ status: "error", message: `Supabase error loading modules: ${error.message}` });
        return;
      }

      setModules((data ?? []) as ModuleRow[]);
    }

    loadModules();
  }, []);

  useEffect(() => {
    if (!lessonId) {
      setLoadState({ status: "error", message: "No lessonId provided in URL." });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data, error } = await supabase
        .from("lessons")
        .select(
          "id, module_id, title, slug, order_index, short_summary_admin, short_summary_student, course_organization_group, slide_contents, grouping_strategy_summary, activity_types, activity_description, signature_metaphors, main_grammar_topics, pronunciation_focus, vocabulary_theme, l1_l2_issues, prerequisites, learning_objectives, notes_for_teacher_or_ai"
        )
        .eq("id", lessonId)
        .maybeSingle();

      if (error) {
        setLoadState({ status: "error", message: `Supabase error: ${error.message}` });
        return;
      }

      if (!data) {
        setLoadState({ status: "error", message: `No lesson found with id "${lessonId}"` });
        return;
      }

      setModuleId(data.module_id);
      const selectedModule = modules.find((m) => m.id === data.module_id);
      if (selectedModule) {
        const slugPart = data.slug.replace(`${selectedModule.slug}/`, "");
        setLessonSlugPart(slugPart);
      } else {
        setLessonSlugPart(data.slug);
      }
      setTitle(data.title);
      setOrderIndex(data.order_index ?? 1);

      // Summaries
      setShortSummaryAdmin(data.short_summary_admin ?? "");
      setShortSummaryStudent(data.short_summary_student ?? "");

      // Lesson structure
      setCourseOrganizationGroup(data.course_organization_group ?? "");
      setSlideContents(data.slide_contents ?? "");
      setGroupingStrategySummary(data.grouping_strategy_summary ?? "");

      // Activities
      setActivityTypes(data.activity_types ? data.activity_types.join(", ") : "");
      setActivityDescription(data.activity_description ?? "");

      // Pedagogy
      setSignatureMetaphors(data.signature_metaphors ?? "");
      setMainGrammarTopics(data.main_grammar_topics ?? "");
      setPronunciationFocus(data.pronunciation_focus ?? "");
      setVocabularyTheme(data.vocabulary_theme ?? "");
      setL1L2Issues(data.l1_l2_issues ?? "");
      setPrerequisites(data.prerequisites ?? "");
      setLearningObjectives(data.learning_objectives ?? "");
      setNotesForTeacherOrAI(data.notes_for_teacher_or_ai ?? "");

      setLoadState({ status: "ready", lesson: data });
    }

    if (modules.length > 0) {
      load();
    }
  }, [lessonId, modules]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!moduleId || !lessonSlugPart || !title) {
      setMessage("Module, lesson slug, and title are required.");
      return;
    }

    const selectedModule = modules.find((m) => m.id === moduleId);
    if (!selectedModule) {
      setMessage("Selected module not found.");
      return;
    }

    const fullSlug = `${selectedModule.slug}/${slugify(lessonSlugPart)}`;

    // Parse activity_types: split by comma, trim, remove empty items
    const activityTypesArray = activityTypes
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const finalActivityTypes = activityTypesArray.length > 0 ? activityTypesArray : null;

    // Helper function to convert empty string to null
    const nullIfEmpty = (s: string) => (s.trim() === "" ? null : s.trim());

    setSaving(true);
    try {
      const { error } = await supabase
        .from("lessons")
        .update({
          module_id: moduleId,
          slug: fullSlug,
          title: title.trim(),
          order_index: orderIndex,
          short_summary_admin: nullIfEmpty(shortSummaryAdmin),
          short_summary_student: nullIfEmpty(shortSummaryStudent),
          course_organization_group: nullIfEmpty(courseOrganizationGroup),
          slide_contents: nullIfEmpty(slideContents),
          grouping_strategy_summary: nullIfEmpty(groupingStrategySummary),
          activity_types: finalActivityTypes,
          activity_description: nullIfEmpty(activityDescription),
          signature_metaphors: nullIfEmpty(signatureMetaphors),
          main_grammar_topics: nullIfEmpty(mainGrammarTopics),
          pronunciation_focus: nullIfEmpty(pronunciationFocus),
          vocabulary_theme: nullIfEmpty(vocabularyTheme),
          l1_l2_issues: nullIfEmpty(l1L2Issues),
          prerequisites: nullIfEmpty(prerequisites),
          learning_objectives: nullIfEmpty(learningObjectives),
          notes_for_teacher_or_ai: nullIfEmpty(notesForTeacherOrAI),
        })
        .eq("id", lessonId);

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      setMessage("Lesson updated successfully!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      title="Edit lesson"
      maxWidth="md"
      meta={
        <>
          Lesson id: <code className="codeText">{lessonId}</code>
        </>
      }
    >
      {loadState.status === "loading" && <p>Loading lesson…</p>}

      {loadState.status === "error" && (
        <CmsSection title="Error" description={loadState.message}>
          <p style={{ color: uiTokens.color.danger }}>{loadState.message}</p>
        </CmsSection>
      )}

      {loadState.status === "ready" && (
        <form onSubmit={handleSave}>
          <CmsSection title="Lesson Details">
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
          </CmsSection>

          <CmsSection title="Summaries">
            <FormField label="Short Summary (Admin)">
              <Textarea
                value={shortSummaryAdmin}
                onChange={(e) => setShortSummaryAdmin(e.target.value)}
                rows={3}
              />
            </FormField>

            <FormField label="Short Summary (Student)">
              <Textarea
                value={shortSummaryStudent}
                onChange={(e) => setShortSummaryStudent(e.target.value)}
                rows={3}
              />
            </FormField>
          </CmsSection>

          <CmsSection title="Lesson Structure">
            <FormField label="Course Organization Group">
              <Input
                value={courseOrganizationGroup}
                onChange={(e) => setCourseOrganizationGroup(e.target.value)}
                placeholder="e.g. 6 Groups"
              />
            </FormField>

            <FormField
              label="Slide Contents"
              helper="Use semicolons. Example: Intro; 3 Text; …"
            >
              <Textarea
                value={slideContents}
                onChange={(e) => setSlideContents(e.target.value)}
                rows={2}
              />
            </FormField>

            <FormField label="Grouping Strategy Summary">
              <Textarea
                value={groupingStrategySummary}
                onChange={(e) => setGroupingStrategySummary(e.target.value)}
                rows={3}
              />
            </FormField>
          </CmsSection>

          <CmsSection title="Activities">
            <FormField
              label="Activity Types"
              helper="Example: AISpeak, AISpeakStudentRepeat, AISpeakStudentChoose"
            >
              <Input
                value={activityTypes}
                onChange={(e) => setActivityTypes(e.target.value)}
                placeholder="Comma-separated list"
              />
            </FormField>

            <FormField label="Activity Description">
              <Textarea
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                rows={3}
              />
            </FormField>
          </CmsSection>

          <CmsSection title="Pedagogy">
            <FormField label="Signature Metaphors">
              <Textarea
                value={signatureMetaphors}
                onChange={(e) => setSignatureMetaphors(e.target.value)}
                rows={3}
              />
            </FormField>

            <FormField label="Main Grammar Topics">
              <Textarea
                value={mainGrammarTopics}
                onChange={(e) => setMainGrammarTopics(e.target.value)}
                rows={2}
              />
            </FormField>

            <FormField label="Pronunciation Focus">
              <Textarea
                value={pronunciationFocus}
                onChange={(e) => setPronunciationFocus(e.target.value)}
                rows={2}
              />
            </FormField>

            <FormField label="Vocabulary Theme">
              <Input
                value={vocabularyTheme}
                onChange={(e) => setVocabularyTheme(e.target.value)}
              />
            </FormField>

            <FormField label="L1>L2 Issues">
              <Textarea
                value={l1L2Issues}
                onChange={(e) => setL1L2Issues(e.target.value)}
                rows={3}
              />
            </FormField>

            <FormField label="Prerequisites">
              <Textarea
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
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
          </CmsSection>

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      )}

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
    </PageShell>
  );
}

