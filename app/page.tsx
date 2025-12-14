"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

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

export default function CmsHome() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>({});
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
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

    load();
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

  return (
    <main style={{ padding: 24, width: "90vw" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>CMS Dashboard</h1>
        <div style={{ color: "#000000", fontSize: 13, marginTop: 6 }}>
          Grid view: CEFR → Modules → Lessons → Groups → Slides
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link href="/modules-browser">Modules Browser</Link>
          <Link href="/new-module">New Module</Link>
          <Link href="/new-lesson">New Lesson</Link>
          <Link href="/new-group">New Group</Link>
        </div>
      </header>

      {state.status === "loading" && <p>Loading…</p>}
      {state.status === "error" && <p style={{ color: "red" }}>{state.message}</p>}

      {state.status === "ready" && maps && (
        <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
          {LEVELS.map((lvl) => {
            const levelModules = maps.modulesByLevel.get(lvl) ?? [];
            const isOpen = !!openLevels[lvl];

            return (
              <React.Fragment key={lvl}>
                {/* Level Row */}
                <div
                  style={{
                    padding: 16,
                    borderBottom: "1px solid #eee",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    onClick={() => toggle(setOpenLevels, lvl)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 800,
                      fontSize: 24,
                      padding: 0,
                      textAlign: "left",
                      color: "#000000",
                    }}
                  >
                    {isOpen ? "▾" : "▸"} {lvl}
                  </button>
                  <span style={{ color: "#000000", fontSize: 14 }}>
                    {levelModules.length} modules
                  </span>
                </div>

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
                            backgroundColor: "#ffffff",
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
                              fontWeight: 700,
                              fontSize: 20,
                              padding: 0,
                              textAlign: "left",
                              color: "#000000",
                            }}
                          >
                            {moduleOpen ? "▾" : "▸"} {m.title}
                          </button>

                          <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                            <span style={{ color: "#000000" }}>
                              {moduleLessons.length} lessons
                            </span>
                            <Link href={`/edit-module/${mid}`} style={{ color: "#000000" }}>
                              edit
                            </Link>
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
                                    backgroundColor: "#ffffff",
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
                                      fontWeight: 600,
                                      fontSize: 18,
                                      padding: 0,
                                      textAlign: "left",
                                      color: "#000000",
                                    }}
                                  >
                                    {lessonOpen ? "▾" : "▸"} {l.title}
                                  </button>

                                  <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                                    <Link href={`/lesson-slides/${lid}`} style={{ color: "#000000" }}>
                                      manage
                                    </Link>
                                    <Link href={`/lesson-preview/${lid}`} style={{ color: "#000000" }}>
                                      preview
                                    </Link>
                                    <a
                                      href={`http://localhost:3000/lecons/db/${lid}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ color: "#000000" }}
                                    >
                                      player
                                    </a>
                                    <Link href={`/edit-lesson/${lid}`} style={{ color: "#000000" }}>
                                      edit
                                    </Link>
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
                                                backgroundColor: "#ffffff",
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
                                                  fontWeight: 600,
                                                  fontSize: 16,
                                                  padding: 0,
                                                  textAlign: "left",
                                                  color: "#000000",
                                                }}
                                              >
                                                {groupOpen ? "▾" : "▸"} {g.title}
                                              </button>

                                              <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                                                <span style={{ color: "#000000" }}>
                                                  {groupSlides.length} slides
                                                </span>
                                                <Link href={`/edit-group/${gid}`} style={{ color: "#000000" }}>
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
                                                      backgroundColor: "#ffffff",
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "space-between",
                                                    }}
                                                  >
                                                    <div style={{ flex: 1 }}>
                                                      <span
                                                        style={{
                                                          fontWeight: 600,
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
                                                      style={{ color: "#000000", fontSize: 12 }}
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
                                                  backgroundColor: "#ffffff",
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
                                          backgroundColor: "#ffffff",
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
                                            backgroundColor: "#ffffff",
                                            fontWeight: 700,
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
                                                backgroundColor: "#ffffff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                              }}
                                            >
                                              <div style={{ flex: 1 }}>
                                                <span
                                                  style={{
                                                    fontWeight: 600,
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
                                                style={{ color: "#000000", fontSize: 12 }}
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
                              backgroundColor: "#ffffff",
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
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      fontSize: 16,
                    }}
                  >
                    No modules yet.
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </main>
  );
}
