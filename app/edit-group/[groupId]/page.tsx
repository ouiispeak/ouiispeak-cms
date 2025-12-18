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

type LessonRow = {
  id: string;
  slug: string;
  title: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      group: {
        id: string;
        lesson_id: string;
        title: string;
        order_index: number | null;
        group_code: string | null;
        short_summary: string | null;
        group_type: string | null;
        group_summary: string | null;
        group_goal: string | null;
        prerequisites: string | null;
        is_required_to_pass: boolean | null;
        passing_score_type: string | null;
        passing_score_value: number | null;
        max_score_value: number | null;
        extra_practice_notes: string | null;
        l1_l2: string | null;
        media_used_ids: string | null;
        group_slides_plan: any | null;
      };
    };

export default function EditGroupPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params?.groupId;

  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [lessonId, setLessonId] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [title, setTitle] = useState("");

  // New fields
  const [groupCode, setGroupCode] = useState("");
  const [shortSummary, setShortSummary] = useState("");
  const [groupType, setGroupType] = useState("");
  const [groupSummary, setGroupSummary] = useState("");
  const [groupGoal, setGroupGoal] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [isRequiredToPass, setIsRequiredToPass] = useState(false);
  const [passingScoreType, setPassingScoreType] = useState("");
  const [passingScoreValue, setPassingScoreValue] = useState<number | null>(null);
  const [maxScoreValue, setMaxScoreValue] = useState<number | null>(null);
  const [extraPracticeNotes, setExtraPracticeNotes] = useState("");
  const [l1L2, setL1L2] = useState("");
  const [mediaUsedIds, setMediaUsedIds] = useState("");
  const [groupSlidesPlan, setGroupSlidesPlan] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLessons() {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, slug, title")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setLoadState({ status: "error", message: `Supabase error loading lessons: ${error.message}` });
        return;
      }

      setLessons((data ?? []) as LessonRow[]);
    }

    loadLessons();
  }, []);

  useEffect(() => {
    if (!groupId) {
      setLoadState({ status: "error", message: "No groupId provided in URL." });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data, error } = await supabase
        .from("lesson_groups")
        .select(
          "id, lesson_id, title, order_index, group_code, short_summary, group_type, group_summary, group_goal, prerequisites, is_required_to_pass, passing_score_type, passing_score_value, max_score_value, extra_practice_notes, l1_l2, media_used_ids, group_slides_plan"
        )
        .eq("id", groupId)
        .maybeSingle();

      if (error) {
        setLoadState({ status: "error", message: `Supabase error: ${error.message}` });
        return;
      }

      if (!data) {
        setLoadState({ status: "error", message: `No group found with id "${groupId}"` });
        return;
      }

      setLessonId(data.lesson_id);
      setOrderIndex(data.order_index ?? 1);
      setTitle(data.title);

      // New fields
      setGroupCode(data.group_code ?? "");
      setShortSummary(data.short_summary ?? "");
      setGroupType(data.group_type ?? "");
      setGroupSummary(data.group_summary ?? "");
      setGroupGoal(data.group_goal ?? "");
      setPrerequisites(data.prerequisites ?? "");
      setIsRequiredToPass(data.is_required_to_pass ?? false);
      setPassingScoreType(data.passing_score_type ?? "");
      setPassingScoreValue(data.passing_score_value ?? null);
      setMaxScoreValue(data.max_score_value ?? null);
      setExtraPracticeNotes(data.extra_practice_notes ?? "");
      setL1L2(data.l1_l2 ?? "");
      setMediaUsedIds(data.media_used_ids ?? "");
      setGroupSlidesPlan(
        data.group_slides_plan ? JSON.stringify(data.group_slides_plan, null, 2) : ""
      );

      setLoadState({ status: "ready", group: data });
    }

    if (lessons.length > 0) {
      load();
    }
  }, [groupId, lessons]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

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

    // Validate and parse group_slides_plan
    let parsedGroupSlidesPlan: any = null;
    if (groupSlidesPlan.trim() !== "") {
      try {
        parsedGroupSlidesPlan = JSON.parse(groupSlidesPlan.trim());
        // Validate it is an array of strings
        if (!Array.isArray(parsedGroupSlidesPlan)) {
          setMessage("Planned slide sequence must be a JSON array.");
          return;
        }
        if (!parsedGroupSlidesPlan.every((item) => typeof item === "string")) {
          setMessage("Planned slide sequence must be an array of strings.");
          return;
        }
      } catch (parseError) {
        setMessage("Invalid JSON in planned slide sequence. Please check the format.");
        return;
      }
    }

    // Helper function to convert empty string to null
    const nullIfEmpty = (s: string) => (s.trim() === "" ? null : s.trim());

    setSaving(true);
    try {
      const { error } = await supabase
        .from("lesson_groups")
        .update({
          lesson_id: lessonId,
          order_index: orderIndex,
          title: title.trim(),
          group_code: nullIfEmpty(groupCode),
          short_summary: nullIfEmpty(shortSummary),
          group_type: nullIfEmpty(groupType),
          group_summary: nullIfEmpty(groupSummary),
          group_goal: nullIfEmpty(groupGoal),
          prerequisites: nullIfEmpty(prerequisites),
          is_required_to_pass: isRequiredToPass,
          passing_score_type: nullIfEmpty(passingScoreType),
          passing_score_value: passingScoreValue,
          max_score_value: maxScoreValue,
          extra_practice_notes: nullIfEmpty(extraPracticeNotes),
          l1_l2: nullIfEmpty(l1L2),
          media_used_ids: nullIfEmpty(mediaUsedIds),
          group_slides_plan: parsedGroupSlidesPlan,
        })
        .eq("id", groupId);

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      setMessage("Group updated successfully!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      title="Edit group"
      maxWidth="md"
      meta={
        <>
          Group id: <code className="codeText">{groupId}</code>
        </>
      }
    >
      {loadState.status === "loading" && <p>Loading group…</p>}

      {loadState.status === "error" && (
        <CmsSection title="Error" description={loadState.message}>
          <p style={{ color: uiTokens.color.danger }}>{loadState.message}</p>
        </CmsSection>
      )}

      {loadState.status === "ready" && (
        <form onSubmit={handleSave}>
          <CmsSection title="Group Details">
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

            <FormField label="Group summary">
              <Textarea
                value={groupSummary}
                onChange={(e) => setGroupSummary(e.target.value)}
                rows={3}
              />
            </FormField>

            <FormField label="Group goal">
              <Textarea
                value={groupGoal}
                onChange={(e) => setGroupGoal(e.target.value)}
                rows={3}
              />
            </FormField>

            <FormField label="Prerequisites">
              <Textarea
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                rows={2}
              />
            </FormField>

            <h2
              style={{
                fontSize: uiTokens.font.sectionTitle.size,
                fontWeight: uiTokens.font.sectionTitle.weight,
                marginTop: uiTokens.space.lg,
                marginBottom: uiTokens.space.md,
                marginLeft: 0,
                marginRight: 0,
                color: uiTokens.color.text,
              }}
            >
              Group structure
            </h2>

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

            <FormField
              label="Planned slide sequence (structure only)"
              helper='This is the intended slide structure for this group. It is used for planning and validation. Actual slides are created separately. For example: ["title-slide", "text-slide", "ai-speak-repeat"]'
            >
              <Textarea
                value={groupSlidesPlan}
                onChange={(e) => setGroupSlidesPlan(e.target.value)}
                rows={4}
              />
            </FormField>

            <FormField label="Extra practice notes">
              <Textarea
                value={extraPracticeNotes}
                onChange={(e) => setExtraPracticeNotes(e.target.value)}
                rows={3}
              />
            </FormField>

            <FormField label="L1 > L2 issues">
              <Textarea
                value={l1L2}
                onChange={(e) => setL1L2(e.target.value)}
                rows={3}
              />
            </FormField>

            <FormField
              label="Media used ids"
              helper="Comma-separated IDs or paths"
            >
              <Input
                value={mediaUsedIds}
                onChange={(e) => setMediaUsedIds(e.target.value)}
              />
            </FormField>

            <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </CmsSection>
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

