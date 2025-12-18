"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import { Button } from "../../components/Button";
import { uiTokens } from "../../lib/uiTokens";

type LessonRow = {
  id: string;
  slug: string;
  title: string;
};

type CreatedGroup = {
  id: string;
  lesson_id: string;
  order_index: number;
  title: string;
};

export default function NewGroupPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [lessonId, setLessonId] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
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

  useEffect(() => {
    async function loadLessons() {
      setLoadError(null);

      const { data, error } = await supabase
        .from("lessons")
        .select("id, slug, title")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setLoadError(`Supabase error loading lessons: ${error.message}`);
        return;
      }

      setLessons((data ?? []) as LessonRow[]);
    }

    loadLessons();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedGroup(null);

    if (!lessonId || !title) {
      setMessage("Lesson and title are required.");
      return;
    }

    // Validate group_type
    const validGroupTypes = ["title", "intro", "practice", "test", "wrap-up", "finale"];
    if (groupType && !validGroupTypes.includes(groupType)) {
      setMessage(`Invalid group type. Must be one of: ${validGroupTypes.join(", ")}`);
      return;
    }

    // Validate passing_score_type
    const validPassingScoreTypes = ["percent", "raw", "none"];
    if (passingScoreType && !validPassingScoreTypes.includes(passingScoreType)) {
      setMessage(`Invalid passing score type. Must be one of: ${validPassingScoreTypes.join(", ")}`);
      return;
    }

    // Helper function to convert empty string to null
    const nullIfEmpty = (s: string) => (s.trim() === "" ? null : s.trim());

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("lesson_groups")
        .insert({
          lesson_id: lessonId,
          order_index: orderIndex,
          title: title.trim(),
          group_code: nullIfEmpty(groupCode),
          short_summary: nullIfEmpty(shortSummary),
          group_type: nullIfEmpty(groupType),
          group_summary: null,
          group_slides: null,
          group_goal: null,
          prerequisites: null,
          is_required_to_pass: isRequiredToPass,
          passing_score_type: nullIfEmpty(passingScoreType),
          passing_score_value: passingScoreValue,
          max_score_value: maxScoreValue,
          extra_practice_notes: null,
          l1_l2: null,
          media_used_ids: null,
        })
        .select("id, lesson_id, order_index, title")
        .maybeSingle();

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      if (!data) {
        setMessage("Insert succeeded but no data returned.");
        return;
      }

      setCreatedGroup(data as CreatedGroup);
      setMessage("Group created successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="Create new group" maxWidth="md">
      {loadError && <p style={{ color: uiTokens.color.danger }}>{loadError}</p>}

      <CmsSection>
        <form onSubmit={handleSubmit}>
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

          <FormField label="Order index" required>
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />
          </FormField>

          <FormField label="Group title" required>
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
        <p
          style={{
            marginTop: uiTokens.space.md,
            color: message.toLowerCase().includes("error") ? uiTokens.color.danger : "green",
          }}
        >
          {message}
        </p>
      )}

      {createdGroup && (
        <CmsSection title="Created group">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(createdGroup, null, 2)}
          </pre>
        </CmsSection>
      )}
    </PageShell>
  );
}
