"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import PageShell from "../components/ui/PageShell";
import CmsSection from "../components/ui/CmsSection";
import LinkButton from "../components/ui/LinkButton";
import Input from "../components/ui/Input";
import { Button } from "../components/Button";
import { uiTokens } from "../lib/uiTokens";

type ModuleRow = {
  id: string;
  title: string;
  slug: string;
  level: string;
  order_index: number | null;
};

type LessonRow = {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  order_index: number | null;
};

type GroupRow = {
  id: string;
  lesson_id: string;
  title: string;
  order_index: number | null;
};

type SlideRow = {
  id: string;
  lesson_id: string;
  group_id: string | null;
  type: string;
  props_json: any;
  order_index: number | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      modules: ModuleRow[];
      lessons: LessonRow[];
      groups: GroupRow[];
      slides: SlideRow[];
    };

const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

type DeleteState =
  | { type: null }
  | { type: "module"; id: string; title: string }
  | { type: "lesson"; id: string; title: string };

export default function CmsHome() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>({});
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [deleteState, setDeleteState] = useState<DeleteState>({ type: null });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);

  useEffect(() => {
    loadData();
  }, []);

  const maps = useMemo(() => {
    if (state.status !== "ready") return null;

    const lessonsByModule = new Map<string, LessonRow[]>();
    for (const lesson of state.lessons) {
      const arr = lessonsByModule.get(lesson.module_id) ?? [];
      arr.push(lesson);
      lessonsByModule.set(lesson.module_id, arr);
    }
    for (const [mid, arr] of lessonsByModule.entries()) {
      arr.sort(
        (a, b) =>
          (a.order_index ?? 0) - (b.order_index ?? 0) ||
          a.id.localeCompare(b.id)
      );
      lessonsByModule.set(mid, arr);
    }

    const groupsByLesson = new Map<string, GroupRow[]>();
    for (const group of state.groups) {
      const arr = groupsByLesson.get(group.lesson_id) ?? [];
      arr.push(group);
      groupsByLesson.set(group.lesson_id, arr);
    }
    for (const [lid, arr] of groupsByLesson.entries()) {
      arr.sort(
        (a, b) =>
          (a.order_index ?? 0) - (b.order_index ?? 0) ||
          a.id.localeCompare(b.id)
      );
      groupsByLesson.set(lid, arr);
    }

    const slidesByGroup = new Map<string, SlideRow[]>();
    const ungroupedSlidesByLesson = new Map<string, SlideRow[]>();

    for (const slide of state.slides) {
      if (slide.group_id) {
        const arr = slidesByGroup.get(slide.group_id) ?? [];
        arr.push(slide);
        slidesByGroup.set(slide.group_id, arr);
      } else {
        const arr = ungroupedSlidesByLesson.get(slide.lesson_id) ?? [];
        arr.push(slide);
        ungroupedSlidesByLesson.set(slide.lesson_id, arr);
      }
    }

    for (const [gid, arr] of slidesByGroup.entries()) {
      arr.sort(
        (a, b) =>
          (a.order_index ?? 0) - (b.order_index ?? 0) ||
          a.id.localeCompare(b.id)
      );
      slidesByGroup.set(gid, arr);
    }

    for (const [lid, arr] of ungroupedSlidesByLesson.entries()) {
      arr.sort(
        (a, b) =>
          (a.order_index ?? 0) - (b.order_index ?? 0) ||
          a.id.localeCompare(b.id)
      );
      ungroupedSlidesByLesson.set(lid, arr);
    }

    const modulesByLevel = new Map<string, ModuleRow[]>();
    for (const mod of state.modules) {
      const lvl = (mod.level ?? "").toUpperCase();
      const arr = modulesByLevel.get(lvl) ?? [];
      arr.push(mod);
      modulesByLevel.set(lvl, arr);
    }
    for (const [lvl, arr] of modulesByLevel.entries()) {
      arr.sort(
        (a, b) =>
          (a.order_index ?? 0) - (b.order_index ?? 0) ||
          a.id.localeCompare(b.id)
      );
      modulesByLevel.set(lvl, arr);
    }

    return {
      lessonsByModule,
      groupsByLesson,
      slidesByGroup,
      ungroupedSlidesByLesson,
      modulesByLevel,
    };
  }, [state]);

  function toggle(
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    key: string
  ) {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function loadData() {
    setState({ status: "loading" });

    const [
      { data: modules, error: modErr },
      { data: lessons, error: lesErr },
      { data: groups, error: grpErr },
      { data: slides, error: sldErr },
    ] = await Promise.all([
      supabase
        .from("modules")
        .select("id, title, slug, level, order_index")
        .order("order_index", { ascending: true }),
      supabase
        .from("lessons")
        .select("id, module_id, title, slug, order_index")
        .order("order_index", { ascending: true }),
      supabase
        .from("lesson_groups")
        .select("id, lesson_id, title, order_index")
        .order("order_index", { ascending: true }),
      supabase
        .from("slides")
        .select("id, lesson_id, group_id, type, props_json, order_index")
        .order("order_index", { ascending: true }),
    ]);

    if (modErr)
      return setState({
        status: "error",
        message: `Modules error: ${modErr.message}`,
      });
    if (lesErr)
      return setState({
        status: "error",
        message: `Lessons error: ${lesErr.message}`,
      });
    if (grpErr)
      return setState({
        status: "error",
        message: `Groups error: ${grpErr.message}`,
      });
    if (sldErr)
      return setState({
        status: "error",
        message: `Slides error: ${sldErr.message}`,
      });

    setState({
      status: "ready",
      modules: (modules ?? []) as ModuleRow[],
      lessons: (lessons ?? []) as LessonRow[],
      groups: (groups ?? []) as GroupRow[],
      slides: (slides ?? []) as SlideRow[],
    });
  }

  function handleDeleteClick(type: "module" | "lesson", id: string, title: string) {
    setDeleteState({ type, id, title });
    setDeleteConfirmText("");
    setDeleteStep(1);
  }

  function handleDeleteCancel() {
    setDeleteState({ type: null });
    setDeleteConfirmText("");
    setDeleteStep(1);
  }

  async function handleDeleteConfirm() {
    if (!deleteState.type || deleteState.type === null) return;

    if (deleteStep === 1) {
      if (deleteConfirmText.toLowerCase() === "delete") {
        setDeleteStep(2);
        setDeleteConfirmText("");
      }
      return;
    }

    if (deleteStep === 2) {
      if (deleteConfirmText.toLowerCase() !== "delete") {
        return;
      }

      try {
        if (deleteState.type === "module") {
          // First, get all lessons for this module
          const { data: lessons } = await supabase
            .from("lessons")
            .select("id")
            .eq("module_id", deleteState.id);

          const lessonIds = lessons?.map((l) => l.id) ?? [];

          // Delete all slides for these lessons
          if (lessonIds.length > 0) {
            await supabase.from("slides").delete().in("lesson_id", lessonIds);
          }

          // Delete all groups for these lessons
          if (lessonIds.length > 0) {
            await supabase.from("lesson_groups").delete().in("lesson_id", lessonIds);
          }

          // Delete all lessons for this module
          await supabase.from("lessons").delete().eq("module_id", deleteState.id);

          // Finally, delete the module
          const { error } = await supabase.from("modules").delete().eq("id", deleteState.id);

          if (error) throw error;
        } else if (deleteState.type === "lesson") {
          // Delete all slides for this lesson
          await supabase.from("slides").delete().eq("lesson_id", deleteState.id);

          // Delete all groups for this lesson
          await supabase.from("lesson_groups").delete().eq("lesson_id", deleteState.id);

          // Finally, delete the lesson
          const { error } = await supabase.from("lessons").delete().eq("id", deleteState.id);

          if (error) throw error;
        }

        // Reload data
        await loadData();
        handleDeleteCancel();
      } catch (error: any) {
        setState({
          status: "error",
          message: `Delete error: ${error.message}`,
        });
        handleDeleteCancel();
      }
    }
  }

  return (
    <>
      <PageShell
        title="CMS Dashboard"
        showBack={false}
        meta="Grid view: CEFR → Modules → Lessons → Groups → Slides"
        maxWidth={undefined}
      >
        <div style={{ width: "90vw", maxWidth: "none", margin: "0 auto" }}>

          {state.status === "loading" && <p>Loading…</p>}
          {state.status === "error" && <p style={{ color: uiTokens.color.danger }}>{state.message}</p>}

      {deleteState.type && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleDeleteCancel}
        >
            <div
              style={{
                backgroundColor: uiTokens.color.bgAlt,
                padding: uiTokens.space.lg,
                borderRadius: uiTokens.radius.lg,
                maxWidth: 500,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0, marginBottom: uiTokens.space.md, fontSize: uiTokens.font.sectionTitle.size }}>
                Delete {deleteState.type === "module" ? "Module" : "Lesson"}
              </h2>
              <p style={{ marginBottom: uiTokens.space.md }}>
                Are you sure you want to delete "{deleteState.title}"?
              </p>
              {deleteState.type === "module" && (
                <p style={{ marginBottom: uiTokens.space.md, color: uiTokens.color.mutedText, fontSize: uiTokens.font.meta.size }}>
                  This will also delete all lessons, groups, and slides in this module.
                </p>
              )}
              {deleteState.type === "lesson" && (
                <p style={{ marginBottom: uiTokens.space.md, color: uiTokens.color.mutedText, fontSize: uiTokens.font.meta.size }}>
                  This will also delete all groups and slides in this lesson.
                </p>
              )}
              <p style={{ marginBottom: uiTokens.space.xs, fontWeight: uiTokens.font.label.weight }}>
                Step {deleteStep} of 2: Type "delete" to confirm
              </p>
              <Input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleDeleteConfirm();
                  } else if (e.key === "Escape") {
                    handleDeleteCancel();
                  }
                }}
                style={{ marginBottom: uiTokens.space.md }}
                placeholder="Type 'delete' to confirm"
                autoFocus
              />
              <div style={{ display: "flex", gap: uiTokens.space.xs, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={handleDeleteCancel}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmText.toLowerCase() !== "delete"}
                >
                  {deleteStep === 1 ? "Continue" : "Delete"}
                </Button>
              </div>
            </div>
        </div>
      )}

      {state.status === "ready" && maps && (
        <>
          {LEVELS.map((lvl) => {
            const levelModules = maps.modulesByLevel.get(lvl) ?? [];
            const isOpen = !!openLevels[lvl];

            return (
              <CmsSection
                key={lvl}
                title={lvl}
                actions={
                  <div style={{ display: "flex", gap: uiTokens.space.sm, alignItems: "center" }}>
                    <span style={{ color: uiTokens.color.text, fontSize: uiTokens.font.meta.size }}>
                      {levelModules.length} modules
                    </span>
                    <LinkButton href={`/new-module?level=${lvl}`} size="sm">
                      + Add Module
                    </LinkButton>
                  </div>
                }
              >
                <div>
                  <button
                    onClick={() => toggle(setOpenLevels, lvl)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 400,
                      fontSize: 16,
                      padding: 0,
                      textAlign: "left",
                      color: "#000000",
                      marginBottom: isOpen ? 16 : 0,
                    }}
                  >
                    {isOpen ? "▾" : "▸"} {isOpen ? "Collapse" : "Expand"}
                  </button>

                {isOpen && levelModules.length > 0 ? (
                  levelModules.map((m) => {
                    const mid = m.id;
                    const moduleOpen = !!openModules[mid];
                    const moduleLessons = maps.lessonsByModule.get(mid) ?? [];

                    return (
                      <React.Fragment key={mid}>
                        {/* Module Row */}
                        <div
                          style={{
                            padding: "14px 16px",
                            paddingLeft: 32,
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <button
                            onClick={() => toggle(setOpenModules, mid)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 400,
                              fontSize: 20,
                              padding: 0,
                              textAlign: "left",
                              color: "#000000",
                            }}
                          >
                            {moduleOpen ? "▾" : "▸"} {m.title}
                          </button>

                          <div style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "center" }}>
                            <span style={{ color: "#000000" }}>
                              {moduleLessons.length} lessons
                            </span>
                            <LinkButton href={`/new-lesson?module_id=${mid}`} size="sm">
                              + Add Lesson
                            </LinkButton>
                            <LinkButton href={`/edit-module/${mid}`} size="sm">
                              edit
                            </LinkButton>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick("module", mid, m.title)}
                              title="Delete module"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </Button>
                          </div>
                        </div>

                        {moduleOpen && moduleLessons.length > 0 ? (
                          moduleLessons.map((l) => {
                            const lid = l.id;
                            const lessonOpen = !!openLessons[lid];
                            const lessonGroups = maps.groupsByLesson.get(lid) ?? [];
                            const ungroupedSlides = maps.ungroupedSlidesByLesson.get(lid) ?? [];

                            return (
                              <React.Fragment key={lid}>
                                {/* Lesson Row */}
                                <div
                                  style={{
                                    padding: "12px 16px",
                                    paddingLeft: 48,
                                    borderBottom: "1px solid #eee",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <button
                                    onClick={() => toggle(setOpenLessons, lid)}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      cursor: "pointer",
                                      fontWeight: 400,
                                      fontSize: 18,
                                      padding: 0,
                                      textAlign: "left",
                                      color: "#000000",
                                    }}
                                  >
                                    {lessonOpen ? "▾" : "▸"} {l.title}
                                  </button>

                                  <div style={{ display: "flex", gap: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, alignItems: "center" }}>
                                    <LinkButton href={`/lesson-slides/${lid}`} size="sm">
                                      manage
                                    </LinkButton>
                                    <LinkButton href={`/lesson-preview/${lid}`} variant="secondary" size="sm">
                                      JSON
                                    </LinkButton>
                                    <a
                                      href={`${process.env.NEXT_PUBLIC_PLAYER_BASE_URL}/lecons/db/${lid}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: uiTokens.radius.md,
                                        border: `1px solid ${uiTokens.color.secondary}`,
                                        backgroundColor: uiTokens.color.secondary,
                                        color: uiTokens.color.secondaryText,
                                        textDecoration: "none",
                                        fontSize: uiTokens.font.meta.size,
                                        fontWeight: 400,
                                        display: "inline-block",
                                      }}
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = uiTokens.color.secondaryHover;
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = uiTokens.color.secondary;
                                      }}
                                    >
                                      player
                                    </a>
                                    <LinkButton href={`/edit-lesson/${lid}`} size="sm" style={{ marginLeft: uiTokens.space.md }}>
                                      edit
                                    </LinkButton>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleDeleteClick("lesson", lid, l.title)}
                                      title="Delete lesson"
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                      </svg>
                                    </Button>
                                  </div>
                                </div>

                                {lessonOpen && (
                                  <>
                                    {lessonGroups.length > 0 ? (
                                      lessonGroups.map((g) => {
                                        const gid = g.id;
                                        const groupOpen = !!openGroups[gid];
                                        const groupSlides = maps.slidesByGroup.get(gid) ?? [];

                                        return (
                                          <React.Fragment key={gid}>
                                            {/* Group Row */}
                                            <div
                                              style={{
                                                padding: "10px 16px",
                                                paddingLeft: 64,
                                                borderBottom: "1px solid #eee",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                              }}
                                            >
                                              <button
                                                onClick={() => toggle(setOpenGroups, gid)}
                                                style={{
                                                  background: "transparent",
                                                  border: "none",
                                                  cursor: "pointer",
                                                  fontWeight: 400,
                                                  fontSize: 16,
                                                  padding: 0,
                                                  textAlign: "left",
                                                  color: "#000000",
                                                }}
                                              >
                                                {groupOpen ? "▾" : "▸"} {g.title}
                                              </button>

                                              <div style={{ display: "flex", gap: 8, fontSize: 12, alignItems: "center" }}>
                                                <span style={{ color: "#000000" }}>
                                                  {groupSlides.length} slides
                                                </span>
                                                <LinkButton href={`/edit-group/${gid}`} size="sm">
                                                  edit
                                                </LinkButton>
                                              </div>
                                            </div>

                                            {groupOpen && groupSlides.length > 0 ? (
                                              groupSlides.map((s) => {
                                                const title =
                                                  s?.props_json && typeof s.props_json === "object"
                                                    ? (s.props_json as any).title
                                                    : undefined;

                                                return (
                                                  <div
                                                    key={s.id}
                                                    style={{
                                                      padding: "8px 16px",
                                                      paddingLeft: 80,
                                                      borderBottom: "1px solid #eee",
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "space-between",
                                                    }}
                                                  >
                                                    <div style={{ flex: 1 }}>
                                                      <span
                                                        style={{
                                                          fontWeight: 400,
                                                          fontSize: 12,
                                                          color: "#000000",
                                                        }}
                                                      >
                                                        {s.type}
                                                      </span>
                                                      {title && (
                                                        <span
                                                          style={{
                                                            color: "#000000",
                                                            marginLeft: 8,
                                                            fontSize: 12,
                                                          }}
                                                        >
                                                          — {title}
                                                        </span>
                                                      )}
                                                    </div>
                                                    <LinkButton href={`/edit-slide/${s.id}`} size="sm">
                                                      edit
                                                    </LinkButton>
                                                  </div>
                                                );
                                              })
                                            ) : groupOpen ? (
                                              <div
                                                style={{
                                                  padding: "10px 16px",
                                                  paddingLeft: 80,
                                                  borderBottom: "1px solid #eee",
                                                  color: "#000000",
                                                  fontSize: 12,
                                                }}
                                              >
                                                No slides in this group yet.
                                              </div>
                                            ) : null}
                                          </React.Fragment>
                                        );
                                      })
                                    ) : (
                                      <div
                                        style={{
                                          padding: "12px 16px",
                                          paddingLeft: 64,
                                          borderBottom: "1px solid #eee",
                                          color: "#000000",
                                          fontSize: 13,
                                        }}
                                      >
                                        No groups yet.
                                      </div>
                                    )}

                                    {ungroupedSlides.length > 0 && (
                                      <>
                                        <div
                                          style={{
                                            padding: "12px 16px",
                                            paddingLeft: 64,
                                            borderBottom: "1px solid #eee",
                                            fontWeight: 400,
                                            fontSize: 14,
                                            color: "#000000",
                                          }}
                                        >
                                          Ungrouped slides
                                        </div>
                                        {ungroupedSlides.map((s) => {
                                          const title =
                                            s?.props_json && typeof s.props_json === "object"
                                              ? (s.props_json as any).title
                                              : undefined;

                                          return (
                                            <div
                                              key={s.id}
                                              style={{
                                                padding: "8px 16px",
                                                paddingLeft: 80,
                                                borderBottom: "1px solid #eee",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                              }}
                                            >
                                              <div style={{ flex: 1 }}>
                                                <span
                                                  style={{
                                                    fontWeight: 400,
                                                    fontSize: 12,
                                                    color: "#000000",
                                                  }}
                                                >
                                                  {s.type}
                                                </span>
                                                {title && (
                                                  <span
                                                    style={{
                                                      color: "#000000",
                                                      marginLeft: 8,
                                                      fontSize: 12,
                                                    }}
                                                  >
                                                    — {title}
                                                  </span>
                                                )}
                                              </div>
                                              <LinkButton href={`/edit-slide/${s.id}`} size="sm">
                                                edit
                                              </LinkButton>
                                            </div>
                                          );
                                        })}
                                      </>
                                    )}
                                  </>
                                )}
                              </React.Fragment>
                            );
                          })
                        ) : moduleOpen ? (
                          <div
                            style={{
                              padding: "14px 16px",
                              paddingLeft: 48,
                              borderBottom: "1px solid #eee",
                              color: "#000000",
                              fontSize: 14,
                            }}
                          >
                            No lessons yet.
                          </div>
                        ) : null}
                      </React.Fragment>
                    );
                  })
                ) : isOpen ? (
                  <div
                    style={{
                      padding: 16,
                      paddingLeft: 32,
                      borderBottom: "1px solid #eee",
                      color: "#000000",
                      fontSize: 16,
                    }}
                  >
                    No modules yet.
                  </div>
                ) : null}
                </div>
              </CmsSection>
            );
          })}
        </>
      )}
        </div>
      </PageShell>
    </>
  );
}
