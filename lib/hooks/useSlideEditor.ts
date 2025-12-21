import { useState, useEffect, useCallback, useRef } from "react";
import type { Slide } from "../domain/slide";
import type { GroupMinimal } from "../domain/group";
import { loadSlideById, updateSlide, type UpdateSlideInput } from "../data/slides";
import { loadGroupsByLesson } from "../data/groups";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; row: Slide; groups: GroupMinimal[] };

export function useSlideEditor(slideId: string | undefined) {
  const [loadState, setLoadState] = useState<LoadState>({
    status: "loading",
  });
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [slideType, setSlideType] = useState<string>("");
  const initialDataRef = useRef<{
    orderIndex: number;
    selectedGroupId: string;
    slideType: string;
    propsJson: string;
    metaJson: string;
    code: string | null;
    isActivity: boolean | null;
    scoreType: string | null;
    passingScoreValue: number | null;
    maxScoreValue: number | null;
    passRequiredForNext: boolean | null;
  } | null>(null);

  useEffect(() => {
    if (!slideId) {
      setLoadState({
        status: "error",
        message: "No slideId provided in URL.",
      });
      return;
    }

    async function load() {
      setLoadState({ status: "loading" });

      const { data: slide, error: slideError } = await loadSlideById(slideId!);

      if (slideError) {
        setLoadState({
          status: "error",
          message: slideError,
        });
        return;
      }

      if (!slide) {
        setLoadState({
          status: "error",
          message: `No slide found with id "${slideId}"`,
        });
        return;
      }

      // Load groups for the lesson
      if (!slide.lessonId) {
        setLoadState({
          status: "error",
          message: "Slide has no lesson_id",
        });
        return;
      }

      const { data: groups, error: groupsError } = await loadGroupsByLesson(slide.lessonId);

      if (groupsError) {
        setLoadState({
          status: "error",
          message: `Error loading groups: ${groupsError}`,
        });
        return;
      }

      setOrderIndex(slide.orderIndex ?? 1);
      setSelectedGroupId(slide.groupId ?? "");
      setSlideType(slide.type ?? "");

      // Store initial values for comparison
      initialDataRef.current = {
        orderIndex: slide.orderIndex ?? 1,
        selectedGroupId: slide.groupId ?? "",
        slideType: slide.type ?? "",
        propsJson: JSON.stringify(slide.propsJson || {}),
        metaJson: JSON.stringify(slide.metaJson || {}),
        code: slide.code,
        isActivity: slide.isActivity,
        scoreType: slide.scoreType,
        passingScoreValue: slide.passingScoreValue,
        maxScoreValue: slide.maxScoreValue,
        passRequiredForNext: slide.passRequiredForNext,
      };

      setLoadState({
        status: "ready",
        row: slide,
        groups: groups ?? [],
      });
    }

    load();
  }, [slideId]);

  const reloadSlide = async () => {
    if (!slideId) return;

    const { data: slide, error: slideError } = await loadSlideById(slideId);

    if (!slideError && slide) {
      const currentGroups = loadState.status === "ready" ? loadState.groups : [];
      
      setOrderIndex(slide.orderIndex ?? 1);
      setSelectedGroupId(slide.groupId ?? "");
      setSlideType(slide.type ?? "");
      
      // Update initial data ref after reload (which happens after save)
      if (initialDataRef.current) {
        initialDataRef.current = {
          orderIndex: slide.orderIndex ?? 1,
          selectedGroupId: slide.groupId ?? "",
          slideType: slide.type ?? "",
          propsJson: JSON.stringify(slide.propsJson || {}),
          metaJson: JSON.stringify(slide.metaJson || {}),
          code: slide.code,
          isActivity: slide.isActivity,
          scoreType: slide.scoreType,
          passingScoreValue: slide.passingScoreValue,
          maxScoreValue: slide.maxScoreValue,
          passRequiredForNext: slide.passRequiredForNext,
        };
      }
      
      setLoadState({
        status: "ready",
        row: slide,
        groups: currentGroups,
      });
    }
  };

  const saveSlide = useCallback(async (input: UpdateSlideInput): Promise<{ success: boolean; error?: string }> => {
    if (!slideId) {
      return { success: false, error: "No slideId provided" };
    }

    const { data, error } = await updateSlide(slideId, input);

    if (error) {
      return { success: false, error };
    }

    // Reload slide to get updated data
    await reloadSlide();

    return { success: true };
  }, [slideId]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = loadState.status === "ready" && initialDataRef.current
    ? (
        orderIndex !== initialDataRef.current.orderIndex ||
        selectedGroupId !== initialDataRef.current.selectedGroupId ||
        slideType !== initialDataRef.current.slideType ||
        JSON.stringify(loadState.row.propsJson || {}) !== initialDataRef.current.propsJson ||
        JSON.stringify(loadState.row.metaJson || {}) !== initialDataRef.current.metaJson ||
        loadState.row.code !== initialDataRef.current.code ||
        loadState.row.isActivity !== initialDataRef.current.isActivity ||
        loadState.row.scoreType !== initialDataRef.current.scoreType ||
        loadState.row.passingScoreValue !== initialDataRef.current.passingScoreValue ||
        loadState.row.maxScoreValue !== initialDataRef.current.maxScoreValue ||
        loadState.row.passRequiredForNext !== initialDataRef.current.passRequiredForNext
      )
    : false;

  return {
    loadState,
    orderIndex,
    selectedGroupId,
    slideType,
    setOrderIndex,
    setSelectedGroupId,
    setSlideType,
    reloadSlide,
    saveSlide,
    hasUnsavedChanges,
  };
}

