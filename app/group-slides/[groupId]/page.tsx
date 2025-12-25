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
import { loadGroupById } from "../../../lib/data/groups";
import { loadSlidesByGroup, createSlide } from "../../../lib/data/slides";
import type { Group } from "../../../lib/domain/group";
import { supabase } from "../../../lib/supabase";

type SlideForDisplay = {
  id: string;
  lessonId: string | null;
  groupId: string | null;
  orderIndex: number | null;
  type: string;
  propsJson?: unknown;
};

export default function GroupSlidesPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params?.groupId;

  const [group, setGroup] = useState<Group | null>(null);
  const [slides, setSlides] = useState<SlideForDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [slideType, setSlideType] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const sortedSlides = useMemo(() => {
    return [...slides].sort((a, b) => {
      const orderA = a.orderIndex ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.orderIndex ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [slides]);

  const nextOrderIndex = useMemo(() => {
    return (
      sortedSlides.reduce((max, s) => {
        const value = s.orderIndex ?? 0;
        return value > max ? value : max;
      }, 0) + 1
    );
  }, [sortedSlides]);

  const hasUnsavedChanges = useMemo(
    () =>
      Boolean(
        slideType ||
        orderIndex !== (nextOrderIndex || 0)
      ),
    [slideType, orderIndex, nextOrderIndex]
  );

  useEffect(() => {
    if (!groupId) {
      setError("No groupId provided in URL.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      // Load group to get lesson_id
      const { data: groupData, error: groupError } = await loadGroupById(groupId);
      if (groupError) {
        setError(groupError);
        setLoading(false);
        return;
      }

      if (!groupData) {
        setError("Group not found");
        setLoading(false);
        return;
      }

      setGroup(groupData);

      // Load slides with props_json for display
      const { data: slidesData, error: slidesError } = await supabase
        .from("slides")
        .select("id, lesson_id, group_id, order_index, type, props_json")
        .eq("group_id", groupId)
        .order("order_index", { ascending: true });

      if (slidesError) {
        setError(slidesError.message);
        setLoading(false);
        return;
      }

      setSlides((slidesData ?? []).map((s: any) => ({
        id: s.id,
        lessonId: s.lesson_id,
        groupId: s.group_id,
        orderIndex: s.order_index,
        type: s.type,
        propsJson: s.props_json,
      })));
      setLoading(false);
    }

    load();
  }, [groupId]);

  useEffect(() => {
    setOrderIndex(nextOrderIndex);
  }, [nextOrderIndex]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!groupId || !group) {
      setMessage("No group selected.");
      return;
    }

    if (!slideType) {
      setMessage("Please select a slide type.");
      return;
    }

    if (!group.lessonId) {
      setMessage("Group must have a lesson ID.");
      return;
    }

    const parsedOrderIndex = Number(orderIndex);

    setSaving(true);
    const { error: insertError } = await createSlide({
      lesson_id: group.lessonId,
      group_id: groupId,
      type: slideType,
      order_index: parsedOrderIndex,
    });
    setSaving(false);

    if (insertError) {
      setMessage(insertError);
      return;
    }

    setMessage("Slide created!");
    setSlideType("");
    
    // Reload slides to include new record
    const { data: slidesData, error: slidesError } = await supabase
      .from("slides")
      .select("id, lesson_id, group_id, order_index, type, props_json")
      .eq("group_id", groupId)
      .order("order_index", { ascending: true });

    if (slidesError) {
      setError(slidesError.message);
    } else {
      setSlides((slidesData ?? []).map((s: any) => ({
        id: s.id,
        lessonId: s.lesson_id,
        groupId: s.group_id,
        orderIndex: s.order_index,
        type: s.type,
        propsJson: s.props_json,
      })));
    }
  };

  const handleSaveButtonClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  // Simple slide type options (can be expanded later)
  const slideTypeOptions = [
    { value: "text-slide", label: "Text Slide" },
    { value: "title-slide", label: "Title Slide" },
    { value: "ai-speak-repeat", label: "AI Speak Repeat" },
  ];

  return (
    <CmsPageShell title="Manage Group">
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
        <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #9cc7c7", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentGroupId={groupId} />
        </div>
        
        {/* Right column - content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: uiTokens.space.md }}>
          <CmsSection
            title="Add slide"
            backgroundColor="#cde3e3"
            borderColor="#9cc7c7"
            description="Create a slide for this group."
          >
            <form ref={formRef} onSubmit={handleCreate}>
              <FormField label="Slide type" required>
                <Select value={slideType} onChange={(e) => setSlideType(e.target.value)}>
                  <option value="">Select a slide type…</option>
                  {slideTypeOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
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

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: uiTokens.space.md }}>
                <SaveChangesButton
                  onClick={handleSaveButtonClick}
                  hasUnsavedChanges={hasUnsavedChanges}
                  saving={saving}
                  label="Create slide"
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
            title="Slides"
            backgroundColor="#cde3e3"
            borderColor="#9cc7c7"
            description={groupId ? `Showing slides for this group` : undefined}
          >
            {loading && <p>Loading slides…</p>}
            {error && <p style={{ color: uiTokens.color.danger }}>{error}</p>}

            {!loading && sortedSlides.length === 0 && <p>No slides yet.</p>}

            {!loading && sortedSlides.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: `1px solid ${uiTokens.color.border}` }}>
                    <th style={{ padding: uiTokens.space.xs }}>Label</th>
                    <th style={{ padding: uiTokens.space.xs }}>Type</th>
                    <th style={{ padding: uiTokens.space.xs }}>Order</th>
                    <th style={{ padding: uiTokens.space.xs }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSlides.map((slide) => (
                    <tr key={slide.id} style={{ borderBottom: `1px solid ${uiTokens.color.border}` }}>
                      <td style={{ padding: uiTokens.space.xs }}>
                        {(slide.propsJson as { label?: string })?.label || slide.id.slice(0, 8)}
                      </td>
                      <td style={{ padding: uiTokens.space.xs }}><code className="codeText">{slide.type}</code></td>
                      <td style={{ padding: uiTokens.space.xs }}>{slide.orderIndex ?? "—"}</td>
                      <td style={{ padding: uiTokens.space.xs }}>
                        <span className="metaText">Edit functionality coming soon</span>
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
