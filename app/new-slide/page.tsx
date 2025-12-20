"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { aiSpeakRepeatSlideSchema } from "../../lib/realSlideSchema";
import CmsPageShell from "../../components/cms/CmsPageShell";
import CmsSection from "../../components/ui/CmsSection";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Button } from "../../components/Button";
import { uiTokens } from "../../lib/uiTokens";
import StatusMessage from "../../components/ui/StatusMessage";
import { loadLessons } from "../../lib/data/lessons";
import type { LessonMinimal } from "../../lib/domain/lesson";
import { loadGroupsByLesson } from "../../lib/data/groups";
import type { GroupMinimal } from "../../lib/domain/group";
import { createSlide } from "../../lib/data/slides";

type CreatedSlide = {
  id: string;
  lessonId: string | null;
  groupId: string | null;
  orderIndex: number | null;
  type: string;
};

function NewSlideForm() {
  const searchParams = useSearchParams();
  const lessonIdParam = searchParams?.get("lesson_id");
  const groupIdParam = searchParams?.get("group_id");

  const [lessons, setLessons] = useState<LessonMinimal[]>([]);
  const [groups, setGroups] = useState<GroupMinimal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [lessonId, setLessonId] = useState(lessonIdParam || "");
  const [groupId, setGroupId] = useState(groupIdParam || "");
  const [orderIndex, setOrderIndex] = useState<number>(1);

  const [title, setTitle] = useState("Alphabet CMS test");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdSlide, setCreatedSlide] = useState<CreatedSlide | null>(null);

  // Determine if fields are prefilled from query params
  const isLessonPrefilled = !!lessonIdParam;
  const isGroupPrefilled = !!groupIdParam;

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

  // Load groups when lessonId changes or when lessonIdParam is provided
  useEffect(() => {
    async function loadGroupsData() {
      const currentLessonId = lessonIdParam || lessonId;
      
      if (!currentLessonId) {
        setGroups([]);
        if (!groupIdParam) {
          setGroupId("");
        }
        return;
      }

      const { data, error } = await loadGroupsByLesson(currentLessonId);

      if (error) {
        setLoadError(`Error loading groups: ${error}`);
        return;
      }

      const list = data ?? [];
      setGroups(list);

      // Only auto-select first group if groupId wasn't provided via param
      // and if we don't already have a groupId set
      if (!groupIdParam && !groupId && list.length > 0) {
        setGroupId(list[0].id ?? "");
      } else if (groupIdParam && list.some((g) => g.id === groupIdParam)) {
        // Ensure the param groupId is set if it exists in the loaded groups
        setGroupId(groupIdParam);
      }
    }

    loadGroupsData();
  }, [lessonId, lessonIdParam, groupIdParam, groupId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedSlide(null);

    if (!lessonId || !groupId) {
      setMessage("Lesson and group are required.");
      return;
    }

    setSaving(true);

    try {
      // Minimal valid ai-speak-repeat props (same shape your slide schema expects)
      const props = {
        title: title.trim(),
        subtitle: "Practice speaking with Raichel",
        note: "Focus on rhythm and intonation.",
        defaultLang: "en",
        lines: [
          [
            { label: "Let's go", speech: { mode: "tts", lang: "en", text: "Let's go" } },
            { label: "Come here", speech: { mode: "tts", lang: "en", text: "Come here" } },
          ],
          [{ label: "Sit down", speech: { mode: "tts", lang: "en", text: "Sit down" } }],
        ],
        gapClass: "gap-4",
        hideTitle: false,
        onCompleteAtIndex: 0,
      };

      // Validate before writing (professional safety)
      const parsed = aiSpeakRepeatSlideSchema.safeParse({
        id: "temp",
        groupId,
        type: "ai-speak-repeat",
        props,
        aidHook: null,
      });

      if (!parsed.success) {
        console.error(parsed.error.format());
        setMessage("Validation failed. Check console.");
        return;
      }

      const { data, error } = await createSlide({
        lesson_id: lessonId,
        group_id: groupId,
        order_index: orderIndex,
        type: "ai-speak-repeat",
        props_json: props,
        aid_hook: null,
      });

      if (error) {
        setMessage(`Error: ${error}`);
        return;
      }

      if (!data) {
        setMessage("Insert succeeded but no data returned.");
        return;
      }

      setCreatedSlide({
        id: data.id,
        lessonId: data.lessonId,
        groupId: data.groupId,
        orderIndex: data.orderIndex,
        type: data.type,
      });
      setMessage("Slide created successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <CmsPageShell title="Create new slide" maxWidth="md">
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

          {isGroupPrefilled ? (
            <FormField label="Group" required>
              <div style={{ 
                padding: uiTokens.space.xs, 
                backgroundColor: uiTokens.color.bgAlt,
                borderRadius: uiTokens.radius.sm,
                border: `1px solid ${uiTokens.color.border}`,
                fontSize: uiTokens.font.label.size,
                color: uiTokens.color.text,
              }}>
                {groups.find((g) => g.id === groupId)?.title || groupId || "Loading..."}
              </div>
              <input type="hidden" value={groupId} />
            </FormField>
          ) : (
            <FormField label="Group" required>
              <Select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                disabled={!lessonId}
              >
                <option value="">{lessonId ? "Select a group…" : "Select a lesson first…"}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    Group {g.orderIndex}: {g.title}
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

          <FormField label="Slide title (ai-speak-repeat)" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>

          <div style={{ marginTop: uiTokens.space.lg, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create slide"}
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

      {createdSlide && (
        <CmsSection title="Created slide">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(createdSlide, null, 2)}
          </pre>
        </CmsSection>
      )}
    </CmsPageShell>
  );
}

export default function NewSlidePage() {
  return (
    <Suspense fallback={<CmsPageShell title="Create new slide" maxWidth="md"><p>Loading...</p></CmsPageShell>}>
      <NewSlideForm />
    </Suspense>
  );
}
