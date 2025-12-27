"use client";

import { useState } from "react";
import CmsPageShell from "../components/cms/CmsPageShell";
import { uiTokens } from "../lib/uiTokens";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useCmsDashboardPaginated } from "../lib/hooks/cms/useCmsDashboardPaginated";
import { useCmsDeleteFlow } from "../lib/hooks/cms/useCmsDeleteFlow";
export const dynamic = "force-dynamic";

import CmsDashboardTree from "../components/cms/CmsDashboardTree";
import type { ModuleDeleteImpact, LessonDeleteImpact } from "../lib/data/deleteImpact";

export default function CmsHome() {
  const { 
    loadState, 
    reload,
    page,
    paginationMeta,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = useCmsDashboardPaginated(1, 50);
  const {
    deleteState,
    deleteImpact,
    impactLoading,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
  } = useCmsDeleteFlow(reload);

  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>({});
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggle(
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    key: string
  ) {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleDeleteConfirmWithErrorHandling() {
    try {
      setDeleteError(null);
      await handleDeleteConfirm();
    } catch (error: any) {
      setDeleteError(error.message || "Delete failed");
    }
  }

  const deleteTypeLabel =
    deleteState.type === "module"
      ? "Module"
      : deleteState.type === "lesson"
      ? "Lesson"
      : deleteState.type === "group"
      ? "Group"
      : deleteState.type === "slide"
      ? "Slide"
      : null;
  const requireDeleteText = deleteTypeLabel ? `DELETE ${deleteTypeLabel.toUpperCase()}` : undefined;

  return (
    <>
      <CmsPageShell
        showBack={false}
        maxWidth={undefined}
      >
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
          {loadState.status === "loading" && <p>Loading…</p>}
          {loadState.status === "error" && (
            <p style={{ color: uiTokens.color.danger }}>{loadState.message}</p>
          )}
          {deleteError && (
            <p style={{ color: uiTokens.color.danger, marginBottom: uiTokens.space.md }}>
              {deleteError}
            </p>
          )}

          <ConfirmDialog
            open={deleteState.type !== null}
            title={deleteTypeLabel ? `Delete ${deleteTypeLabel}` : "Delete"}
            description={
              <>
                Are you sure you want to delete "{deleteState.type !== null ? deleteState.title : ""}"?
                {deleteState.type === "module" && (
                  <p style={{ marginTop: uiTokens.space.xs, color: uiTokens.color.mutedText, fontSize: uiTokens.font.meta.size }}>
                    {impactLoading ? (
                      "Loading impact counts..."
                    ) : deleteImpact ? (
                      <>
                        This will also delete:
                        <br />
                        • {(deleteImpact as ModuleDeleteImpact).lessons} lesson{(deleteImpact as ModuleDeleteImpact).lessons !== 1 ? "s" : ""}
                        <br />
                        • {(deleteImpact as ModuleDeleteImpact).groups} group{(deleteImpact as ModuleDeleteImpact).groups !== 1 ? "s" : ""}
                        <br />
                        • {(deleteImpact as ModuleDeleteImpact).slides} slide{(deleteImpact as ModuleDeleteImpact).slides !== 1 ? "s" : ""}
                        {(deleteImpact as ModuleDeleteImpact).user_lessons > 0 && (
                          <>
                            <br />
                            • {(deleteImpact as ModuleDeleteImpact).user_lessons} user lesson record{(deleteImpact as ModuleDeleteImpact).user_lessons !== 1 ? "s" : ""}
                          </>
                        )}
                      </>
                    ) : (
                      "Impact unknown. This will also delete all lessons, groups, and slides in this module."
                    )}
                  </p>
                )}
                {deleteState.type === "lesson" && (
                  <p style={{ marginTop: uiTokens.space.xs, color: uiTokens.color.mutedText, fontSize: uiTokens.font.meta.size }}>
                    {impactLoading ? (
                      "Loading impact counts..."
                    ) : deleteImpact ? (
                      <>
                        This will also delete:
                        <br />
                        • {(deleteImpact as LessonDeleteImpact).groups} group{(deleteImpact as LessonDeleteImpact).groups !== 1 ? "s" : ""}
                        <br />
                        • {(deleteImpact as LessonDeleteImpact).slides} slide{(deleteImpact as LessonDeleteImpact).slides !== 1 ? "s" : ""}
                        {(deleteImpact as LessonDeleteImpact).user_lessons > 0 && (
                          <>
                            <br />
                            • {(deleteImpact as LessonDeleteImpact).user_lessons} user lesson record{(deleteImpact as LessonDeleteImpact).user_lessons !== 1 ? "s" : ""}
                          </>
                        )}
                      </>
                    ) : (
                      "Impact unknown. This will also delete all groups and slides in this lesson."
                    )}
                  </p>
                )}
              </>
            }
            danger={true}
            requireText={requireDeleteText}
            onConfirm={handleDeleteConfirmWithErrorHandling}
            onCancel={handleDeleteCancel}
          />

          {loadState.status === "ready" && (
            <>
              <CmsDashboardTree
                maps={loadState.maps}
                openLevels={openLevels}
                openModules={openModules}
                openLessons={openLessons}
                openGroups={openGroups}
                onToggleLevel={(level) => toggle(setOpenLevels, level)}
                onToggleModule={(moduleId) => toggle(setOpenModules, moduleId)}
                onToggleLesson={(lessonId) => toggle(setOpenLessons, lessonId)}
                onToggleGroup={(groupId) => toggle(setOpenGroups, groupId)}
                onDeleteModule={(id, title) => handleDeleteClick("module", id, title)}
                onDeleteLesson={(id, title) => handleDeleteClick("lesson", id, title)}
                onDeleteGroup={(id, title) => handleDeleteClick("group", id, title)}
                onDeleteSlide={(id, title) => handleDeleteClick("slide", id, title)}
              />
              
              {/* Pagination Controls */}
              {paginationMeta && paginationMeta.totalPages > 1 && (
                <div
                  style={{
                    marginTop: uiTokens.space.lg,
                    padding: uiTokens.space.md,
                    borderTop: `1px solid ${uiTokens.color.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: uiTokens.space.sm,
                  }}
                >
                  <div style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
                    Page {page} of {paginationMeta.totalPages} ({paginationMeta.total} module{paginationMeta.total !== 1 ? "s" : ""})
                  </div>
                  <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center" }}>
                    <button
                      onClick={prevPage}
                      disabled={!hasPrevPage}
                      style={{
                        padding: `${uiTokens.space.xs} ${uiTokens.space.sm}`,
                        backgroundColor: hasPrevPage ? uiTokens.color.primary : uiTokens.color.border,
                        color: hasPrevPage ? "white" : uiTokens.color.textMuted,
                        border: "none",
                        borderRadius: "4px",
                        cursor: hasPrevPage ? "pointer" : "not-allowed",
                        fontSize: uiTokens.font.meta.size,
                      }}
                    >
                      Previous
                    </button>
                    {paginationMeta.totalPages <= 10 && (
                      <div style={{ display: "flex", gap: uiTokens.space.xs }}>
                        {Array.from({ length: paginationMeta.totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => goToPage(p)}
                            style={{
                              padding: `${uiTokens.space.xs} ${uiTokens.space.sm}`,
                              backgroundColor: p === page ? uiTokens.color.primary : "transparent",
                              color: p === page ? "white" : uiTokens.color.text,
                              border: `1px solid ${p === page ? uiTokens.color.primary : uiTokens.color.border}`,
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: uiTokens.font.meta.size,
                              minWidth: "32px",
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={nextPage}
                      disabled={!hasNextPage}
                      style={{
                        padding: `${uiTokens.space.xs} ${uiTokens.space.sm}`,
                        backgroundColor: hasNextPage ? uiTokens.color.primary : uiTokens.color.border,
                        color: hasNextPage ? "white" : uiTokens.color.textMuted,
                        border: "none",
                        borderRadius: "4px",
                        cursor: hasNextPage ? "pointer" : "not-allowed",
                        fontSize: uiTokens.font.meta.size,
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CmsPageShell>
    </>
  );
}
