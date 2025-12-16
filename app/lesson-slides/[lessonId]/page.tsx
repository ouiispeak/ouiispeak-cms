"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Button } from "../../../components/Button";
import { BackButton } from "../../../components/BackButton";
import PageContainer from "../../../components/ui/PageContainer";

type SlideRow = {
  id: string;
  type: string;
  props_json: any;
  order_index: number | null;
  group_id: string | null;
};

type GroupRow = {
  id: string;
  title: string;
  order_index: number | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; slides: SlideRow[]; groups: GroupRow[]; slideTypes: string[]; lessonTitle: string };

export default function LessonSlidesPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId;
  const router = useRouter();

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [busySlideId, setBusySlideId] = useState<string | null>(null);

  async function load() {
    if (!lessonId) {
      setState({ status: "error", message: "No lessonId provided in URL." });
      return;
    }

    setState({ status: "loading" });

    const [
      { data: lesson, error: lessonError },
      { data: slides, error: slidesError },
      { data: groups, error: groupsError },
      { data: allSlides, error: allSlidesError },
    ] = await Promise.all([
      supabase
        .from("lessons")
        .select("title")
        .eq("id", lessonId)
        .maybeSingle(),
      supabase
        .from("slides")
        .select("id, type, props_json, order_index, group_id")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true }),
      supabase
        .from("lesson_groups")
        .select("id, title, order_index")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true }),
      // Get all distinct slide types from the entire database
      supabase
        .from("slides")
        .select("type")
        .not("type", "is", null),
    ]);

    if (lessonError) {
      setState({ status: "error", message: lessonError.message });
      return;
    }
    if (!lesson) {
      setState({ status: "error", message: "Lesson not found" });
      return;
    }
    if (slidesError) {
      setState({ status: "error", message: slidesError.message });
      return;
    }
    if (groupsError) {
      setState({ status: "error", message: groupsError.message });
      return;
    }
    if (allSlidesError) {
      setState({ status: "error", message: allSlidesError.message });
      return;
    }

    // Extract unique slide types, trim whitespace, and filter out empty strings
    const uniqueTypes = Array.from(
      new Set(
        (allSlides ?? [])
          .map((s: any) => (s.type || "").trim())
          .filter((t: string) => t.length > 0)
      )
    ).sort();

    setState({
      status: "ready",
      slides: (slides ?? []) as SlideRow[],
      groups: (groups ?? []) as GroupRow[],
      slideTypes: uniqueTypes,
      lessonTitle: lesson.title,
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  function defaultPropsForType(type: string): any {
    const trimmedType = type.trim();
    switch (trimmedType) {
      case "title-slide":
        return { title: "New title slide", subtitle: "" };
      case "text-slide":
        return { title: "New text", body: "…" };
      case "ai-speak-repeat":
        return {
          title: "New ai-speak-repeat slide",
          lines: [
            [
              {
                label: "Hello",
                speech: { mode: "tts", lang: "en", text: "Hello" },
              },
            ],
          ],
        };
      case "ai-speak-student-repeat":
        return {
          title: "New ai-speak-student-repeat slide",
          lines: [
            [
              {
                label: "Hello",
                speech: { mode: "tts", lang: "en", text: "Hello" },
              },
            ],
          ],
        };
      default:
        return { title: `New ${trimmedType} slide` };
    }
  }

  async function insertSlide({
    lessonId: lid,
    groupId,
    type,
  }: {
    lessonId: string;
    groupId: string | null;
    type: string;
  }) {
    if (!lid) return;
    if (state.status !== "ready") return;

    const trimmedType = type.trim();
    const normalizedType = trimmedType;
    const defaultProps = defaultPropsForType(trimmedType);

    // Compute next slide order_index (whole-lesson)
    const maxOrder = state.slides.reduce((max, s) => {
      const v = typeof s.order_index === "number" ? s.order_index : 0;
      return v > max ? v : max;
    }, 0);

    const nextOrderIndex = maxOrder + 1;

    // Insert slide
    const { data: slideData, error: slideInsertError } = await supabase
      .from("slides")
      .insert({
        lesson_id: lid,
        group_id: groupId,
        type: normalizedType,
        order_index: nextOrderIndex,
        aid_hook: null,
        props_json: defaultProps,
      })
      .select("id")
      .maybeSingle();

    if (slideInsertError) {
      alert("Slide insert error: " + slideInsertError.message);
      return;
    }

    if (!slideData?.id) {
      alert("Slide insert succeeded but no id returned.");
      return;
    }

    router.push(`/edit-slide/${slideData.id}`);
  }

  async function addAiSpeakRepeatSlide() {
    if (!lessonId) return;
    if (state.status !== "ready") return;

    // 1) Fetch earliest group for this lesson
    const { data: groupData, error: groupLookupError } = await supabase
      .from("lesson_groups")
      .select("id")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (groupLookupError) {
      alert("Group lookup error: " + groupLookupError.message);
      return;
    }

    let groupId = groupData?.id ?? null;

    // 2) If no group exists, create default Intro group
    if (!groupId) {
      const { data: newGroupData, error: groupInsertError } = await supabase
        .from("lesson_groups")
        .insert({
          lesson_id: lessonId,
          order_index: 1,
          title: "Intro",
        })
        .select("id")
        .maybeSingle();

      if (groupInsertError) {
        alert("Group insert error: " + groupInsertError.message);
        return;
      }

      if (!newGroupData?.id) {
        alert("Group insert succeeded but no id returned.");
        return;
      }

      groupId = newGroupData.id;
    }

    // 3) Insert slide using helper
    await insertSlide({
      lessonId,
      groupId,
      type: "ai-speak-repeat",
    });
  }

  async function addTextSlide() {
    if (!lessonId) return;
    if (state.status !== "ready") return;

    // 1) Fetch earliest group for this lesson
    const { data: groupData, error: groupLookupError } = await supabase
      .from("lesson_groups")
      .select("id")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (groupLookupError) {
      alert("Group lookup error: " + groupLookupError.message);
      return;
    }

    let groupId = groupData?.id ?? null;

    // 2) If no group exists, create default Intro group
    if (!groupId) {
      const { data: newGroupData, error: groupInsertError } = await supabase
        .from("lesson_groups")
        .insert({
          lesson_id: lessonId,
          order_index: 1,
          title: "Intro",
        })
        .select("id")
        .maybeSingle();

      if (groupInsertError) {
        alert("Group insert error: " + groupInsertError.message);
        return;
      }

      if (!newGroupData?.id) {
        alert("Group insert succeeded but no id returned.");
        return;
      }

      groupId = newGroupData.id;
    }

    // 3) Insert slide using helper
    await insertSlide({
      lessonId,
      groupId,
      type: "text-slide",
    });
  }

  async function addGroup() {
    if (!lessonId) return;
    if (state.status !== "ready") return;

    // Compute next order_index
    const maxOrder = state.groups.reduce((max, g) => {
      const v = typeof g.order_index === "number" ? g.order_index : 0;
      return v > max ? v : max;
    }, 0);

    const nextOrderIndex = maxOrder + 1;

    // Insert new group
    const { error: groupInsertError } = await supabase
      .from("lesson_groups")
      .insert({
        lesson_id: lessonId,
        title: "New group",
        order_index: nextOrderIndex,
      });

    if (groupInsertError) {
      alert("Group insert error: " + groupInsertError.message);
      return;
    }

    // Reload data
    await load();
  }

  async function renameGroup(groupId: string, currentTitle: string) {
    const newTitle = window.prompt("Rename group:", currentTitle);
    
    if (newTitle === null) return; // User cancelled
    if (newTitle.trim() === "") {
      alert("Group title cannot be empty.");
      return;
    }

    const { error: updateError } = await supabase
      .from("lesson_groups")
      .update({ title: newTitle.trim() })
      .eq("id", groupId);

    if (updateError) {
      alert("Update error: " + updateError.message);
      return;
    }

    // Reload data
    await load();
  }

  async function deleteSlide(slideId: string) {
    if (busySlideId) return;

    const confirmText = window.prompt(
      `Delete this slide?\n\nslide_id:\n${slideId}\n\nType DELETE to confirm.`
    );

    if (confirmText !== "DELETE") return;

    setBusySlideId(slideId);
    try {
      const { error } = await supabase.from("slides").delete().eq("id", slideId);

      if (error) {
        alert("Delete error: " + error.message);
        return;
      }

      // refresh the list
      await load();
    } finally {
      setBusySlideId(null);
    }
  }

  const grouped = useMemo(() => {
    if (state.status !== "ready") return null;

    const groupOrder = new Map<string, number>();
    state.groups.forEach((g, idx) => groupOrder.set(g.id, idx));

    const byGroup = new Map<string, SlideRow[]>();
    const ungrouped: SlideRow[] = [];

    for (const s of state.slides) {
      if (s.group_id) {
        const arr = byGroup.get(s.group_id) ?? [];
        arr.push(s);
        byGroup.set(s.group_id, arr);
      } else {
        ungrouped.push(s);
      }
    }

    for (const [gid, arr] of byGroup.entries()) {
      arr.sort((a, b) => {
        const ao = a.order_index ?? 0;
        const bo = b.order_index ?? 0;
        if (ao !== bo) return ao - bo;
        return a.id.localeCompare(b.id);
      });
      byGroup.set(gid, arr);
    }

    ungrouped.sort((a, b) => {
      const ao = a.order_index ?? 0;
      const bo = b.order_index ?? 0;
      if (ao !== bo) return ao - bo;
      return a.id.localeCompare(b.id);
    });

    const orderedGroups = state.groups.map((g) => ({
      group: g,
      slides: byGroup.get(g.id) ?? [],
    }));

    const extraGroupIds = [...byGroup.keys()].filter((gid) => !groupOrder.has(gid));
    extraGroupIds.sort();

    const extraGroups = extraGroupIds.map((gid) => ({
      group: { id: gid, title: "Unknown group", order_index: null } as GroupRow,
      slides: byGroup.get(gid) ?? [],
    }));

    return { orderedGroups, extraGroups, ungrouped };
  }, [state]);

  return (
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Lesson Slides</h1>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <BackButton title="Back to Dashboard" />
      </div>
      <PageContainer maxWidth="lg">
        <div style={{ marginBottom: 16 }}>
        {state.status === "ready" && (
          <>
            <div style={{ borderTop: "1px solid #ddd", marginTop: 12, marginBottom: 12 }}></div>
            <h2 style={{ margin: 0 }}>{state.lessonTitle}</h2>
            <p style={{ margin: 0, marginTop: 4, opacity: 0.7, fontSize: 13 }}>
              Lesson id: <code>{lessonId}</code>
            </p>
          </>
        )}
      </div>

      <div style={{ margin: "16px 0", display: "flex", gap: 8 }}>
        <Button onClick={addGroup}>+ Add group</Button>
        {lessonId && (
          <a
            href={`${process.env.NEXT_PUBLIC_PLAYER_BASE_URL}/lecons/db/${lessonId}`}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 400,
              borderRadius: 6,
              border: "1px solid #a6a198",
              backgroundColor: "#a6a198",
              color: "#222326",
              textDecoration: "none",
              cursor: "pointer",
              display: "inline-block",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#959088";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#a6a198";
            }}
          >
            Preview in Player
          </a>
        )}
      </div>

      {state.status === "loading" && <p>Loading…</p>}
      {state.status === "error" && <p style={{ color: "red" }}>Error: {state.message}</p>}

      {state.status === "ready" && grouped && (
        <div style={{ marginTop: 16 }}>
          {grouped.orderedGroups.map(({ group, slides }) => (
            <section key={group.id} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "2px solid #ddd" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>
                  {group.title}{" "}
                  <span style={{ opacity: 0.6, fontWeight: 400, fontSize: 12 }}>(group)</span>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Button
                    variant="secondary"
                    className="text-xs py-1.5 px-3"
                    onClick={() => renameGroup(group.id, group.title)}
                  >
                    Rename
                  </Button>
                  <select
                    onChange={(e) => {
                      const slideType = e.target.value;
                      if (slideType) {
                        insertSlide({ lessonId: lessonId!, groupId: group.id, type: slideType });
                        e.target.value = ""; // Reset dropdown
                      }
                    }}
                    style={{
                      fontSize: 13,
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      + Add slide
                    </option>
                    {state.slideTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {slides.length === 0 ? (
                <div style={{ opacity: 0.6, fontSize: 13 }}>No slides in this group yet.</div>
              ) : (
                <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                  {slides.map((s) => {
                    const title =
                      s?.props_json && typeof s.props_json === "object"
                        ? (s.props_json as any).title
                        : undefined;

                    const isBusy = busySlideId === s.id;

                    return (
                      <li
                        key={s.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 0",
                          borderBottom: "1px solid #eee",
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <strong>{s.type}</strong>
                          {title && <div style={{ fontSize: 13, opacity: 0.7 }}>{title}</div>}
                          <div style={{ fontSize: 12, opacity: 0.6 }}>
                            <code>{s.id}</code>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <Link href={`/edit-slide/${s.id}`}>Edit</Link>
                          <Button
                            variant="danger"
                            onClick={() => deleteSlide(s.id)}
                            disabled={!!busySlideId}
                            className="text-xs py-1.5 px-3"
                            title={isBusy ? "Deleting…" : "Delete"}
                          >
                            {isBusy ? (
                              "Deleting…"
                            ) : (
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
                            )}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}

          {grouped.extraGroups.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Unknown groups</div>
              {grouped.extraGroups.map(({ group, slides }) => (
                <div key={group.id} style={{ marginBottom: 14 }}>
                  <div style={{ opacity: 0.7, fontSize: 13, marginBottom: 6 }}>
                    group_id: <code>{group.id}</code>
                  </div>
                  <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                    {slides.map((s) => {
                      const isBusy = busySlideId === s.id;
                      return (
                        <li
                          key={s.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: "1px solid #eee",
                            gap: 12,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <strong>{s.type}</strong>
                            <div style={{ fontSize: 12, opacity: 0.6 }}>
                              <code>{s.id}</code>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <Link href={`/edit-slide/${s.id}`}>Edit</Link>
                            <button
                              onClick={() => deleteSlide(s.id)}
                              disabled={!!busySlideId}
                              style={{
                                fontSize: 14,
                                fontWeight: 400,
                                padding: "8px 12px",
                                borderRadius: 6,
                                border: "1px solid #bf6f6f",
                                backgroundColor: "#bf6f6f",
                                color: "#222326",
                                opacity: isBusy ? 0.6 : 1,
                                cursor: busySlideId ? "default" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseOver={(e) => {
                                if (!busySlideId) {
                                  e.currentTarget.style.backgroundColor = "#ad5f5f";
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!busySlideId) {
                                  e.currentTarget.style.backgroundColor = "#bf6f6f";
                                }
                              }}
                              title={isBusy ? "Deleting…" : "Delete"}
                            >
                              {isBusy ? (
                                "Deleting…"
                              ) : (
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
                              )}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {grouped.ungrouped.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Ungrouped slides</div>
              <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                {grouped.ungrouped.map((s) => {
                  const isBusy = busySlideId === s.id;
                  return (
                    <li
                      key={s.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: "1px solid #eee",
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <strong>{s.type}</strong>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>
                          <code>{s.id}</code>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Link href={`/edit-slide/${s.id}`}>Edit</Link>
                        <button
                          onClick={() => deleteSlide(s.id)}
                          disabled={!!busySlideId}
                          style={{
                            fontSize: 14,
                            fontWeight: 400,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #bf6f6f",
                            backgroundColor: "#bf6f6f",
                            color: "#222326",
                            opacity: isBusy ? 0.6 : 1,
                            cursor: busySlideId ? "default" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseOver={(e) => {
                            if (!busySlideId) {
                              e.currentTarget.style.backgroundColor = "#ad5f5f";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!busySlideId) {
                              e.currentTarget.style.backgroundColor = "#bf6f6f";
                            }
                          }}
                          title={isBusy ? "Deleting…" : "Delete"}
                        >
                          {isBusy ? (
                            "Deleting…"
                          ) : (
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
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
      </PageContainer>
    </>
  );
}
