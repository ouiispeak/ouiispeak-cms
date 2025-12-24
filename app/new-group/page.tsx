"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CmsPageShell from "../../components/cms/CmsPageShell";
import CmsSection from "../../components/ui/CmsSection";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import { Button } from "../../components/Button";
import { uiTokens } from "../../lib/uiTokens";
import { nullIfEmpty } from "../../lib/utils/string";
import StatusMessage from "../../components/ui/StatusMessage";
import { loadLessons } from "../../lib/data/lessons";
import type { LessonMinimal } from "../../lib/domain/lesson";
import { createGroup } from "../../lib/data/groups";
import { createGroupSchema } from "../../lib/schemas/groupSchema";

type CreatedGroup = {
  id: string;
  lesson_id: string;
  order_index: number;
  title: string | null;
};

function NewGroupForm() {
  const searchParams = useSearchParams();
  const lessonIdParam = searchParams?.get("lesson_id");

  const [lessons, setLessons] = useState<LessonMinimal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [lessonId, setLessonId] = useState(lessonIdParam || "");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [label, setLabel] = useState("");
  const [title, setTitle] = useState("");

  // New fields
  const [groupCode, setGroupCode] = useState("");
  const [shortSummary, setShortSummary] = useState("");
  const [groupType, setGroupType] = useState("");
  const [isRequiredToPass, setIsRequiredToPass] = useState(false);
  const [passingScoreType, setPassingScoreType] = useState("");
  const [passingScoreValue, setPassingScoreValue] = useState<number | null>(null);
  const [maxScoreValue, setMaxScoreValue] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<CreatedGroup | null>(null);

  // Determine if lesson is prefilled from query param
  const isLessonPrefilled = !!lessonIdParam;

  useEffect(() => {
    async function loadLessonsData() {
      setLoadError(null);

      const { data, error } = await loadLessons();

      if (error) {
        setLoadError(`Error loading lessons: ${error}`);
        return;
      }

      setLessons(data ?? []);

      // If lesson_id param is provided, ensure it's set
      if (lessonIdParam && !lessonId) {
        setLessonId(lessonIdParam);
      }
    }

    loadLessonsData();
  }, []);

  // Sync lessonId with param when param changes
  useEffect(() => {
    if (lessonIdParam && lessonIdParam !== lessonId) {
      setLessonId(lessonIdParam);
    }
  }, [lessonIdParam]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedGroup(null);

    // Validate using schema
    const result = createGroupSchema.safeParse({
      lesson_id: lessonId,
      label: label.trim(),
      title: title || null,
      order_index: orderIndex,
      group_code: groupCode || null,
      short_summary: shortSummary || null,
      group_type: groupType || null,
      group_summary: null,
      group_slides_plan: null,
      group_goal: null,
      prerequisites: null,
      is_required_to_pass: isRequiredToPass,
      passing_score_type: passingScoreType || null,
      passing_score_value: passingScoreValue,
      max_score_value: maxScoreValue,
      extra_practice_notes: null,
      l1_l2: null,
      media_used_ids: null,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      setMessage(firstError.message);
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await createGroup({
        lesson_id: result.data.lesson_id,
        order_index: result.data.order_index,
        label: result.data.label,
        title: result.data.title ?? undefined,
        group_code: result.data.group_code,
        short_summary: result.data.short_summary,
        group_type: result.data.group_type,
        group_summary: result.data.group_summary,
        group_slides_plan: result.data.group_slides_plan,
        group_goal: result.data.group_goal,
        prerequisites: result.data.prerequisites,
        is_required_to_pass: result.data.is_required_to_pass,
        passing_score_type: result.data.passing_score_type,
        passing_score_value: result.data.passing_score_value,
        max_score_value: result.data.max_score_value,
        extra_practice_notes: result.data.extra_practice_notes,
        l1_l2: result.data.l1_l2,
        media_used_ids: result.data.media_used_ids,
      });

      if (error) {
        setMessage(error);
        return;
      }

      if (!data) {
        setMessage("Insert succeeded but no data returned.");
        return;
      }

      // Map GroupMinimal to CreatedGroup
      setCreatedGroup({
        id: data.id,
        lesson_id: data.lessonId ?? "",
        order_index: data.orderIndex ?? 1,
        title: data.title ?? null,
      });
      setMessage("Group created successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <CmsPageShell title="Create new group" maxWidth="md">
      {loadError && <p style={{ color: uiTokens.color.danger }}>{loadError}</p>}

      <CmsSection>
        <form onSubmit={handleSubmit}>
          {isLessonPrefilled ? (
            <FormField label="Lesson" required>
              <div style={{ 
                padding: uiTokens.space.xs, 
                backgroundColor: uiTokens.color.bgAlt,
                borderRadius: uiTokens.radius.sm,
                border: `1px solid ${uiTokens.color.border}`,
                fontSize: uiTokens.font.label.size,
                color: uiTokens.color.text,
              }}>
                {lessons.find((l) => l.id === lessonId)?.title || lessonId || "Loading..."}
              </div>
              <input type="hidden" value={lessonId} />
            </FormField>
          ) : (
            <FormField label="Lesson" required>
              <Select value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
                <option value="">Select a lesson…</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.slug})
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Order index" required>
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />
          </FormField>

          <FormField 
            label="Label" 
            required
            infoTooltip="Internal name for this group used in the CMS and navigation. Not shown to learners."
          >
            <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
          </FormField>

          <FormField 
            label="Title (optional - for student-facing content)" 
            infoTooltip="Student-facing title. Only shown to learners if provided. Leave empty if not needed."
          >
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>

          <FormField label="Group code">
            <Input value={groupCode} onChange={(e) => setGroupCode(e.target.value)} />
          </FormField>

          <FormField label="Short summary">
            <Textarea
              value={shortSummary}
              onChange={(e) => setShortSummary(e.target.value)}
              rows={3}
            />
          </FormField>

          <FormField label="Group type">
            <Select value={groupType} onChange={(e) => setGroupType(e.target.value)}>
              <option value="">Select a type…</option>
              <option value="title">Title</option>
              <option value="intro">Intro</option>
              <option value="practice">Practice</option>
              <option value="test">Test</option>
              <option value="wrap-up">Wrap-up</option>
              <option value="finale">Finale</option>
            </Select>
          </FormField>

          <FormField label="Is required to pass">
            <label style={{ display: "flex", alignItems: "center", gap: uiTokens.space.xs }}>
              <input
                type="checkbox"
                checked={isRequiredToPass}
                onChange={(e) => setIsRequiredToPass(e.target.checked)}
                style={{ width: "auto" }}
              />
              <span>Required to pass</span>
            </label>
          </FormField>

          <FormField label="Passing score type">
            <Select value={passingScoreType} onChange={(e) => setPassingScoreType(e.target.value)}>
              <option value="">Select a type…</option>
              <option value="percent">percent</option>
              <option value="raw">raw</option>
              <option value="none">none</option>
            </Select>
          </FormField>

          <FormField label="Passing score value">
            <Input
              type="number"
              value={passingScoreValue ?? ""}
              onChange={(e) => setPassingScoreValue(e.target.value ? Number(e.target.value) : null)}
            />
          </FormField>

          <FormField label="Max score value">
            <Input
              type="number"
              value={maxScoreValue ?? ""}
              onChange={(e) => setMaxScoreValue(e.target.value ? Number(e.target.value) : null)}
            />
          </FormField>

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create group"}
            </Button>
          </div>
        </form>
      </CmsSection>

      {message && (
        <StatusMessage
          variant={message.toLowerCase().includes("error") ? "error" : "success"}
        >
          {message}
        </StatusMessage>
      )}

      {createdGroup && (
        <CmsSection title="Created group">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(createdGroup, null, 2)}
          </pre>
        </CmsSection>
      )}
    </CmsPageShell>
  );
}

export default function NewGroupPage() {
  return (
    <Suspense fallback={<CmsPageShell title="Create new group" maxWidth="md"><p>Loading...</p></CmsPageShell>}>
      <NewGroupForm />
    </Suspense>
  );
}
