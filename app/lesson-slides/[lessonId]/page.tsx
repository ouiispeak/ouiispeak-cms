"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

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
  | { status: "ready"; slides: SlideRow[]; groups: GroupRow[] };

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

    const [{ data: slides, error: slidesError }, { data: groups, error: groupsError }] =
      await Promise.all([
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
      ]);

    if (slidesError) {
      setState({ status: "error", message: slidesError.message });
      return;
    }
    if (groupsError) {
      setState({ status: "error", message: groupsError.message });
      return;
    }

    setState({
      status: "ready",
      slides: (slides ?? []) as SlideRow[],
      groups: (groups ?? []) as GroupRow[],
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

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

    let groupId = groupData?.id;

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

    // 3) Compute next slide order_index (whole-lesson)
    const maxOrder = state.slides.reduce((max, s) => {
      const v = typeof s.order_index === "number" ? s.order_index : 0;
      return v > max ? v : max;
    }, 0);

    const nextOrderIndex = maxOrder + 1;

    // 4) Insert slide
    const { data: slideData, error: slideInsertError } = await supabase
      .from("slides")
      .insert({
        lesson_id: lessonId,
        group_id: groupId,
        type: "ai-speak-repeat",
        order_index: nextOrderIndex,
        aid_hook: null,
        props_json: {
          title: "New ai-speak-repeat slide",
          lines: [
            [
              {
                label: "Hello",
                speech: { mode: "tts", lang: "en", text: "Hello" },
              },
            ],
          ],
        },
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

  async function addAiSpeakRepeatSlideToGroup(groupId: string) {
    if (!lessonId) return;
    if (state.status !== "ready") return;

    // next order_index (whole-lesson for now)
    const maxOrder = state.slides.reduce((max, s) => {
      const v = typeof s.order_index === "number" ? s.order_index : 0;
      return v > max ? v : max;
    }, 0);

    const nextOrderIndex = maxOrder + 1;

    const { data: slideData, error: slideInsertError } = await supabase
      .from("slides")
      .insert({
        lesson_id: lessonId,
        group_id: groupId,
        type: "ai-speak-repeat",
        order_index: nextOrderIndex,
        aid_hook: null,
        props_json: {
          title: "New ai-speak-repeat slide",
          lines: [
            [
              {
                label: "Hello",
                speech: { mode: "tts", lang: "en", text: "Hello" },
              },
            ],
          ],
        },
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
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>Lesson Slides</h1>
      <p style={{ opacity: 0.7, fontSize: 13 }}>
        Lesson id: <code>{lessonId}</code>
      </p>

      <div style={{ margin: "16px 0" }}>
        <button onClick={addAiSpeakRepeatSlide}>+ Add ai-speak-repeat slide</button>
      </div>

      {state.status === "loading" && <p>Loading…</p>}
      {state.status === "error" && <p style={{ color: "red" }}>Error: {state.message}</p>}

      {state.status === "ready" && grouped && (
        <div style={{ marginTop: 16 }}>
          {grouped.orderedGroups.map(({ group, slides }) => (
            <section key={group.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>
                  {group.title}{" "}
                  <span style={{ opacity: 0.6, fontWeight: 400, fontSize: 12 }}>(group)</span>
                </div>

                <button onClick={() => addAiSpeakRepeatSlideToGroup(group.id)} style={{ fontSize: 13 }}>
                  + Add slide to this group
                </button>
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
                          <button
                            onClick={() => deleteSlide(s.id)}
                            disabled={!!busySlideId}
                            style={{
                              fontSize: 13,
                              opacity: isBusy ? 0.6 : 1,
                              cursor: busySlideId ? "default" : "pointer",
                            }}
                          >
                            {isBusy ? "Deleting…" : "Delete"}
                          </button>
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
                                fontSize: 13,
                                opacity: isBusy ? 0.6 : 1,
                                cursor: busySlideId ? "default" : "pointer",
                              }}
                            >
                              {isBusy ? "Deleting…" : "Delete"}
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
                            fontSize: 13,
                            opacity: isBusy ? 0.6 : 1,
                            cursor: busySlideId ? "default" : "pointer",
                          }}
                        >
                          {isBusy ? "Deleting…" : "Delete"}
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
    </main>
  );
}
