"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import PageContainer from "../components/ui/PageContainer";
import SectionCard from "../components/ui/SectionCard";

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
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>CMS Dashboard</h1>
      </div>
      <PageContainer style={{ width: "90vw" }}>
        <div style={{ color: "#000000", fontSize: 13, marginTop: 16, marginBottom: 24 }}>
          Grid view: CEFR → Modules → Lessons → Groups → Slides
        </div>

      {state.status === "loading" && <p>Loading…</p>}
      {state.status === "error" && <p style={{ color: "red" }}>{state.message}</p>}

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
              backgroundColor: "#ffffff",
              padding: 24,
              borderRadius: 8,
              maxWidth: 500,
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>
              Delete {deleteState.type === "module" ? "Module" : "Lesson"}
            </h2>
            <p style={{ marginBottom: 16 }}>
              Are you sure you want to delete "{deleteState.title}"?
            </p>
            {deleteState.type === "module" && (
              <p style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
                This will also delete all lessons, groups, and slides in this module.
              </p>
            )}
            {deleteState.type === "lesson" && (
              <p style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
                This will also delete all groups and slides in this lesson.
              </p>
            )}
            <p style={{ marginBottom: 8, fontWeight: 600 }}>
              Step {deleteStep} of 2: Type "delete" to confirm
            </p>
            <input
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
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14,
                marginBottom: 16,
              }}
              placeholder="Type 'delete' to confirm"
              autoFocus
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={handleDeleteCancel}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  background: "#ffffff",
                  cursor: "pointer",
                  fontSize: 14,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText.toLowerCase() !== "delete"}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 4,
                  background:
                    deleteConfirmText.toLowerCase() === "delete"
                      ? "#d32f2f"
                      : "#ccc",
                  color: "#ffffff",
                  cursor:
                    deleteConfirmText.toLowerCase() === "delete"
                      ? "pointer"
                      : "not-allowed",
                  fontSize: 14,
                }}
                onMouseOver={(e) => {
                  if (deleteConfirmText.toLowerCase() === "delete") {
                    e.currentTarget.style.backgroundColor = "#b82727";
                  }
                }}
                onMouseOut={(e) => {
                  if (deleteConfirmText.toLowerCase() === "delete") {
                    e.currentTarget.style.backgroundColor = "#d32f2f";
                  }
                }}
              >
                {deleteStep === 1 ? "Continue" : "Delete"}
              </button>
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
              <SectionCard
                key={lvl}
                title={lvl}
                actions={
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ color: "#000000", fontSize: 14 }}>
                      {levelModules.length} modules
                    </span>
                    <Link
                      href={`/new-module?level=${lvl}`}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #9bbfb2",
                        backgroundColor: "#9bbfb2",
                        color: "#222326",
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 400,
                        display: "inline-block",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#8aaea1";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#9bbfb2";
                      }}
                    >
                      + Add Module
                    </Link>
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
                            <Link
                              href={`/new-lesson?module_id=${mid}`}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "1px solid #9bbfb2",
                                backgroundColor: "#9bbfb2",
                                color: "#222326",
                                textDecoration: "none",
                                fontSize: 13,
                                fontWeight: 400,
                                display: "inline-block",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "#8aaea1";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#9bbfb2";
                              }}
                            >
                              + Add Lesson
                            </Link>
                            <Link
                              href={`/edit-module/${mid}`}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "1px solid #9bbfb2",
                                backgroundColor: "#9bbfb2",
                                color: "#222326",
                                textDecoration: "none",
                                fontSize: 13,
                                fontWeight: 400,
                                display: "inline-block",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "#8aaea1";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#9bbfb2";
                              }}
                            >
                              edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick("module", mid, m.title)}
                              style={{
                                fontSize: 14,
                                fontWeight: 400,
                                padding: "8px 12px",
                                borderRadius: 6,
                                border: "1px solid #bf6f6f",
                                backgroundColor: "#bf6f6f",
                                color: "#222326",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Delete module"
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "#ad5f5f";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#bf6f6f";
                              }}
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
                            </button>
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

                                  <div style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "center" }}>
                                    <Link
                                      href={`/lesson-slides/${lid}`}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #9bbfb2",
                                        backgroundColor: "#9bbfb2",
                                        color: "#222326",
                                        textDecoration: "none",
                                        fontSize: 13,
                                        fontWeight: 400,
                                        display: "inline-block",
                                      }}
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = "#8aaea1";
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = "#9bbfb2";
                                      }}
                                    >
                                      manage
                                    </Link>
                                    <Link
                                      href={`/lesson-preview/${lid}`}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #a6a198",
                                        backgroundColor: "#a6a198",
                                        color: "#222326",
                                        textDecoration: "none",
                                        fontSize: 13,
                                        fontWeight: 400,
                                        display: "inline-block",
                                      }}
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = "#959088";
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = "#a6a198";
                                      }}
                                    >
                                      JSON
                                    </Link>
                                    <a
                                      href={`${process.env.NEXT_PUBLIC_PLAYER_BASE_URL}/lecons/db/${lid}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #a6a198",
                                        backgroundColor: "#a6a198",
                                        color: "#222326",
                                        textDecoration: "none",
                                        fontSize: 13,
                                        fontWeight: 400,
                                        display: "inline-block",
                                      }}
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = "#959088";
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = "#a6a198";
                                      }}
                                    >
                                      player
                                    </a>
                                    <Link
                                      href={`/edit-lesson/${lid}`}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #9bbfb2",
                                        backgroundColor: "#9bbfb2",
                                        color: "#222326",
                                        textDecoration: "none",
                                        fontSize: 13,
                                        fontWeight: 400,
                                        display: "inline-block",
                                        marginLeft: 16,
                                      }}
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = "#8aaea1";
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = "#9bbfb2";
                                      }}
                                    >
                                      edit
                                    </Link>
                                    <button
                                      onClick={() => handleDeleteClick("lesson", lid, l.title)}
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 400,
                                        padding: "8px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #bf6f6f",
                                        backgroundColor: "#bf6f6f",
                                        color: "#222326",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                      title="Delete lesson"
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = "#ad5f5f";
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = "#bf6f6f";
                                      }}
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
                                    </button>
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
                                                <Link
                                                  href={`/edit-group/${gid}`}
                                                  style={{
                                                    padding: "6px 12px",
                                                    borderRadius: 6,
                                                    border: "1px solid #9bbfb2",
                                                    backgroundColor: "#9bbfb2",
                                                    color: "#222326",
                                                    textDecoration: "none",
                                                    fontSize: 12,
                                                    fontWeight: 400,
                                                    display: "inline-block",
                                                  }}
                                                  onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#8aaea1";
                                                  }}
                                                  onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#9bbfb2";
                                                  }}
                                                >
                                                  edit
                                                </Link>
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
                                                    <Link
                                                      href={`/edit-slide/${s.id}`}
                                                      style={{
                                                        padding: "6px 12px",
                                                        borderRadius: 6,
                                                        border: "1px solid #9bbfb2",
                                                        backgroundColor: "#9bbfb2",
                                                        color: "#222326",
                                                        textDecoration: "none",
                                                        fontSize: 12,
                                                        fontWeight: 400,
                                                        display: "inline-block",
                                                      }}
                                                      onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#8aaea1";
                                                      }}
                                                      onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#9bbfb2";
                                                      }}
                                                    >
                                                      edit
                                                    </Link>
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
                                              <Link
                                                href={`/edit-slide/${s.id}`}
                                                style={{
                                                  padding: "6px 12px",
                                                  borderRadius: 6,
                                                  border: "1px solid #9bbfb2",
                                                  backgroundColor: "#9bbfb2",
                                                  color: "#222326",
                                                  textDecoration: "none",
                                                  fontSize: 12,
                                                  fontWeight: 400,
                                                  display: "inline-block",
                                                }}
                                                onMouseOver={(e) => {
                                                  e.currentTarget.style.backgroundColor = "#8aaea1";
                                                }}
                                                onMouseOut={(e) => {
                                                  e.currentTarget.style.backgroundColor = "#9bbfb2";
                                                }}
                                              >
                                                edit
                                              </Link>
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
              </SectionCard>
            );
          })}
        </>
      )}
      </PageContainer>
    </>
  );
}
