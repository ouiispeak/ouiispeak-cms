"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "../../../components/Button";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import CmsSection from "../../../components/ui/CmsSection";
import LinkButton from "../../../components/ui/LinkButton";
import Select from "../../../components/ui/Select";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { uiTokens } from "../../../lib/uiTokens";
import type { GroupMinimal } from "../../../lib/domain/group";
import type { LessonManagementSlide } from "../../../lib/data/lessonManagement";
import { useLessonManager } from "../../../lib/hooks/useLessonManager";
import { loadLessonManagement } from "../../../lib/data/lessonManagement";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; slides: LessonManagementSlide[]; groups: GroupMinimal[]; slideTypes: string[]; lessonTitle: string };

export default function LessonSlidesPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId;

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [busySlideId, setBusySlideId] = useState<string | null>(null);
  const [deleteSlideId, setDeleteSlideId] = useState<string | null>(null);

  const manager = useLessonManager(lessonId);

  async function load() {
    if (!lessonId) {
      setState({ status: "error", message: "No lessonId provided in URL." });
      return;
    }

    setState({ status: "loading" });

    const { data, error } = await loadLessonManagement(lessonId);

    if (error) {
      setState({ status: "error", message: error });
      return;
    }

    if (!data) {
      setState({ status: "error", message: "No data returned" });
      return;
    }

    setState({
      status: "ready",
      slides: data.slides,
      groups: data.groups,
      slideTypes: data.slideTypes,
      lessonTitle: data.lesson.title,
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

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

    const result = await manager.addSlide({
      lessonId: lid,
      groupId,
      type,
    });

    if (!result.success) {
      alert(result.error ?? "Failed to create slide");
      return;
    }

    // Reload data after successful creation (navigation happens in hook)
    await load();
  }

  async function addGroup() {
    if (!lessonId) return;
    if (state.status !== "ready") return;

    const result = await manager.addGroup();

    if (!result.success) {
      alert(result.error ?? "Failed to create group");
      return;
    }

    // Reload data
    await load();
  }

  async function renameGroup(groupId: string, currentTitle: string) {
    const newTitle = window.prompt("Rename group:", currentTitle);
    
    if (newTitle === null) return; // User cancelled

    const result = await manager.renameGroup(groupId, newTitle);

    if (!result.success) {
      alert(result.error ?? "Failed to rename group");
      return;
    }

    // Reload data
    await load();
  }

  function handleDeleteClick(slideId: string) {
    if (busySlideId) return;
    setDeleteSlideId(slideId);
  }

  async function handleDeleteConfirm() {
    if (!deleteSlideId) return;

    setBusySlideId(deleteSlideId);
    try {
      const result = await manager.deleteSlide(deleteSlideId);

      if (!result.success) {
        alert(result.error ?? "Failed to delete slide");
        return;
      }

      // refresh the list
      await load();
      setDeleteSlideId(null);
    } finally {
      setBusySlideId(null);
    }
  }

  function handleDeleteCancel() {
    setDeleteSlideId(null);
  }

  const grouped = useMemo(() => {
    if (state.status !== "ready") return null;

    const groupOrder = new Map<string, number>();
    state.groups.forEach((g, idx) => groupOrder.set(g.id, idx));

    const byGroup = new Map<string, LessonManagementSlide[]>();
    const ungrouped: LessonManagementSlide[] = [];

    for (const s of state.slides) {
      if (s.groupId) {
        const arr = byGroup.get(s.groupId) ?? [];
        arr.push(s);
        byGroup.set(s.groupId, arr);
      } else {
        ungrouped.push(s);
      }
    }

    for (const [gid, arr] of byGroup.entries()) {
      arr.sort((a, b) => {
        const ao = a.orderIndex ?? 0;
        const bo = b.orderIndex ?? 0;
        if (ao !== bo) return ao - bo;
        return a.id.localeCompare(b.id);
      });
      byGroup.set(gid, arr);
    }

    ungrouped.sort((a, b) => {
      const ao = a.orderIndex ?? 0;
      const bo = b.orderIndex ?? 0;
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
      group: { id: gid, title: "Unknown group", orderIndex: null, lessonId: null } as GroupMinimal,
      slides: byGroup.get(gid) ?? [],
    }));

    return { orderedGroups, extraGroups, ungrouped };
  }, [state]);

  return (
    <>
      <ConfirmDialog
        open={deleteSlideId !== null}
        title="Delete Slide"
        description={
          deleteSlideId ? (
            <>
              Are you sure you want to delete this slide?
              <br />
              <code className="codeText" style={{ fontSize: uiTokens.font.meta.size }}>
                slide_id: {deleteSlideId}
              </code>
            </>
          ) : null
        }
        danger={true}
        requireText="DELETE SLIDE"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      <CmsPageShell
        title="Lesson Slides"
        meta={
          state.status === "ready" ? (
            <>
              {state.lessonTitle}
              <br />
              <span className="metaText">
                Lesson id: <code className="codeText">{lessonId}</code>
              </span>
            </>
          ) : undefined
        }
        actions={
        <>
          <Button size="sm" onClick={addGroup}>
            + Add group
          </Button>
          {lessonId && (
            <LinkButton
              href={`${process.env.NEXT_PUBLIC_PLAYER_BASE_URL}/lecons/db/${lessonId}`}
              variant="secondary"
              size="sm"
              target="_blank"
              rel="noreferrer"
            >
              Open in Lesson Player
            </LinkButton>
          )}
        </>
      }
    >
      {state.status === "loading" && <p>Loading…</p>}
      {state.status === "error" && <p style={{ color: uiTokens.color.danger }}>Error: {state.message}</p>}

      {state.status === "ready" && grouped && (
        <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
          {/* Left column - outline view */}
          <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #deb4a5", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
            <CmsOutlineView currentLessonId={lessonId} />
          </div>
          
          {/* Right column - content */}
          <div style={{ flex: 1 }}>
            {grouped.orderedGroups.map(({ group, slides }) => (
            <CmsSection
              key={group.id}
              backgroundColor="#ecd7cf"
              title={
                <>
                  {group.title}{" "}
                  <span style={{ opacity: 0.6, fontWeight: 400, fontSize: uiTokens.font.meta.size }}>(group)</span>
                </>
              }
              actions={
                <>
                  <Button variant="secondary" size="sm" onClick={() => renameGroup(group.id, group.title)}>
                    Rename
                  </Button>
                  <Select
                    onChange={(e) => {
                      const slideType = e.target.value;
                      if (slideType) {
                        insertSlide({ lessonId: lessonId!, groupId: group.id, type: slideType });
                        e.target.value = ""; // Reset dropdown
                      }
                    }}
                    style={{ fontSize: uiTokens.font.meta.size, padding: "4px 8px" }}
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
                  </Select>
                </>
              }
            >

              {slides.length === 0 ? (
                <div style={{ opacity: 0.6, fontSize: 13 }}>No slides in this group yet.</div>
              ) : (
                <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                  {slides.map((s) => {
                    const title =
                      s?.propsJson && typeof s.propsJson === "object"
                        ? (s.propsJson as any).title
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

                        <div style={{ display: "flex", gap: uiTokens.space.sm, alignItems: "center" }}>
                          <LinkButton href={`/edit-slide/${s.id}`} size="sm" variant="ghost" style={{ border: "none" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#192026" style={{ width: 16, height: 16 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </LinkButton>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(s.id)}
                            disabled={!!busySlideId}
                            title={isBusy ? "Deleting…" : "Delete"}
                            style={{ border: "none" }}
                          >
                            {isBusy ? (
                              "Deleting…"
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            )}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CmsSection>
          ))}

          {grouped.extraGroups.length > 0 && (
            <CmsSection title="Unknown groups" backgroundColor="#ecd7cf">
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

                          <div style={{ display: "flex", gap: uiTokens.space.sm, alignItems: "center" }}>
                            <LinkButton href={`/edit-slide/${s.id}`} size="sm" variant="ghost">
                              Edit
                            </LinkButton>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(s.id)}
                              disabled={!!busySlideId}
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
                </div>
              ))}
            </CmsSection>
          )}

          {grouped.ungrouped.length > 0 && (
            <CmsSection title="Ungrouped slides" backgroundColor="#ecd7cf">
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

                      <div style={{ display: "flex", gap: uiTokens.space.sm, alignItems: "center" }}>
                        <LinkButton href={`/edit-slide/${s.id}`} size="sm" variant="ghost">
                          Edit
                        </LinkButton>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(s.id)}
                          disabled={!!busySlideId}
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
            </CmsSection>
          )}
          </div>
        </div>
      )}
    </CmsPageShell>
    </>
  );
}
