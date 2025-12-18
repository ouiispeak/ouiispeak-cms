"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import { Button } from "../../components/Button";
import { uiTokens } from "../../lib/uiTokens";

type LessonRow = {
  id: string;
  lesson_slug: string;
  title: string;
};

type GroupRow = {
  id: string;
  lesson_id: string;
  order_index: number;
  title: string;
};

type CreatedSlideRow = {
  id: string;
  lesson_id: string;
  group_id: string;
  order_index: number;
  type: string;
  props_json: unknown;
};

export default function NewSlideAiPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const [orderIndex, setOrderIndex] = useState("1");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [note, setNote] = useState("");
  const [defaultLang, setDefaultLang] = useState("en");
  const [phrasesText, setPhrasesText] = useState(
    "Let's go\nCome here\nSit down"
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdSlide, setCreatedSlide] = useState<CreatedSlideRow | null>(
    null
  );

  // Compute groups for the selected lesson
  const filteredGroups = useMemo(
    () => groups.filter((g) => g.lesson_id === selectedLessonId),
    [groups, selectedLessonId]
  );

  // Load lessons and groups once
  useEffect(() => {
    async function loadMeta() {
      setLoadingMeta(true);
      setMetaError(null);

      const [{ data: lessonsData, error: lessonsError }, { data: groupsData, error: groupsError }] =
        await Promise.all([
          supabase
            .from("lessons_authoring")
            .select("id, lesson_slug, title")
            .order("lesson_slug", { ascending: true }),
          supabase
            .from("lesson_groups_authoring")
            .select("id, lesson_id, order_index, title")
            .order("lesson_id", { ascending: true })
            .order("order_index", { ascending: true }),
        ]);

      if (lessonsError || groupsError) {
        setMetaError(
          (lessonsError?.message ?? "") +
            (groupsError ? " | " + groupsError.message : "")
        );
        setLoadingMeta(false);
        return;
      }

      setLessons((lessonsData ?? []) as LessonRow[]);
      setGroups((groupsData ?? []) as GroupRow[]);
      setLoadingMeta(false);
    }

    loadMeta();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedSlide(null);

    if (!selectedLessonId) {
      setMessage("Please select a lesson.");
      return;
    }
    if (!selectedGroupId) {
      setMessage("Please select a group.");
      return;
    }
    if (!title.trim()) {
      setMessage("Slide title is required.");
      return;
    }

    const parsedOrder = parseInt(orderIndex, 10);
    if (Number.isNaN(parsedOrder) || parsedOrder < 1) {
      setMessage("Order index must be a positive integer.");
      return;
    }

    const phrases = phrasesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (phrases.length === 0) {
      setMessage("Please enter at least one phrase.");
      return;
    }

    setSaving(true);

    try {
      // Build lines[][] for ai-speak-repeat:
      // For now, everything in a single row.
      const lines = [
        phrases.map((label) => ({
          label,
          speech: {
            mode: "tts" as const,
            lang: (defaultLang || "en") as any,
            text: label,
          },
        })),
      ];

      const newId = `slide-${Date.now()}`;

      // Build raw slide for Zod validation
      const rawSlide = {
        id: newId,
        groupId: selectedGroupId,
        type: "ai-speak-repeat" as const,
        props: {
          title,
          subtitle: subtitle || undefined,
          note: note || undefined,
          defaultLang: defaultLang || undefined,
          lines,
          gapClass: "gap-4",
          hideTitle: false,
          onCompleteAtIndex: 0,
        },
        aidHook: null,
      };

      const parsed = aiSpeakRepeatSlideSchema.safeParse(rawSlide);

      if (!parsed.success) {
        console.error(parsed.error.format());
        setMessage(
          "Validation failed when building slide. Check console for details."
        );
        return;
      }

      const validated: RealAiSpeakRepeatSlide = parsed.data;

      const { data, error } = await supabase
        .from("slides_authoring")
        .insert({
          id: validated.id,
          lesson_id: selectedLessonId,
          group_id: selectedGroupId,
          order_index: parsedOrder,
          type: validated.type,
          props_json: validated.props,
          aid_hook: validated.aidHook ?? null,
          status: "draft",
          version: 1,
          updated_by: "raychel",
        })
        .select("*")
        .maybeSingle();

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      if (!data) {
        setMessage("Insert succeeded but no data returned.");
        return;
      }

      setCreatedSlide(data as CreatedSlideRow);
      setMessage("Slide created successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      title="Create ai-speak-repeat slide"
      maxWidth="md"
      meta={
        <>
          This will create a new <code className="codeText">ai-speak-repeat</code> slide in{" "}
          <code className="codeText">slides_authoring</code>, attached to a lesson group.
        </>
      }
    >
      {loadingMeta && <p>Loading lessons and groups…</p>}

      {metaError && (
        <CmsSection title="Error" description="Failed to load metadata">
          <p style={{ color: uiTokens.color.danger }}>Error loading metadata: {metaError}</p>
        </CmsSection>
      )}

      {!loadingMeta && !metaError && lessons.length === 0 && (
        <CmsSection>
          <p>No lessons found. Create a lesson first at /new-lesson.</p>
        </CmsSection>
      )}

      {!loadingMeta && !metaError && lessons.length > 0 && (
        <form onSubmit={handleSubmit}>
          <CmsSection title="Where does this slide go?">

            <FormField label="Lesson" required>
              <Select
                value={selectedLessonId}
                onChange={(e) => {
                  setSelectedLessonId(e.target.value);
                  setSelectedGroupId("");
                }}
              >
                <option value="">-- Select a lesson --</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} ({lesson.lesson_slug})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Group" required>
              <Select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                disabled={!selectedLessonId || filteredGroups.length === 0}
              >
                <option value="">
                  {filteredGroups.length === 0
                    ? "-- No groups for this lesson --"
                    : "-- Select a group --"}
                </option>
                {filteredGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    Group {group.order_index}: {group.title}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Slide order index" required>
              <Input
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
              />
            </FormField>
          </CmsSection>

          <CmsSection title="Slide content">

            <FormField label="Slide title" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>

            <FormField label="Subtitle (optional)">
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </FormField>

            <FormField label="Note (optional)">
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </FormField>

            <FormField label="Default language (e.g. en, fr)" required>
              <Input value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)} />
            </FormField>

            <FormField
              label="Phrases (one per line)"
              required
              helper="Each line becomes a button/cell. For now, all phrases are in a single row."
            >
              <Textarea
                value={phrasesText}
                onChange={(e) => setPhrasesText(e.target.value)}
                rows={6}
                style={{ fontFamily: "monospace" }}
              />
            </FormField>
          </CmsSection>

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create slide"}
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

      {createdSlide && (
        <CmsSection title="Created slide (DB row)">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(createdSlide, null, 2)}
          </pre>
        </CmsSection>
      )}
    </PageShell>
  );
}
