import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createGroup, deleteGroup as deleteGroupData, updateGroup, type CreateGroupInput } from "../../data/groups";
import { createSlide, deleteSlide as deleteSlideData, type CreateSlideInput } from "../../data/slides";
import { loadGroupsByLesson } from "../../data/groups";
import { loadSlidesByLesson } from "../../data/slides";
import { SLIDE_TYPES, SPEECH_MODES, PLAYER_LANGUAGES } from "../../constants/slideConstants";

/**
 * Default props for different slide types
 */
function defaultPropsForType(type: string): Record<string, unknown> {
  const trimmedType = type.trim();
  switch (trimmedType) {
    case "default":
    case SLIDE_TYPES.TITLE:
      return { title: "New title slide", subtitle: "" };
    case SLIDE_TYPES.LESSON_END:
      return { title: "New lesson end slide", message: "" };
    case SLIDE_TYPES.TEXT:
    case "text":
      return { title: "New text", subtitle: "", body: "…" };
    case SLIDE_TYPES.AI_SPEAK_REPEAT:
      return {
        title: "New ai-speak-repeat slide",
        lines: [
          [
            {
              label: "Hello",
              speech: { mode: SPEECH_MODES.TTS, lang: PLAYER_LANGUAGES.ENGLISH, text: "Hello" },
            },
          ],
        ],
      };
    case SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT:
      return {
        title: "New ai-speak-student-repeat slide",
        elements: [],
      };
    case SLIDE_TYPES.SPEECH_MATCH:
      return {
        title: "New speech-match slide",
        subtitle: "Écoute et clique sur la lettre que tu entends",
        elements: [],
      };
    default:
      return { title: `New ${trimmedType} slide` };
  }
}

/**
 * Hook for managing lesson groups and slides
 * Provides standardized create/delete operations with loading states
 */
export function useLessonManager(lessonId: string | undefined) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a new group to the lesson
   * Computes order_index automatically if not provided
   */
  const addGroup = useCallback(
    async (input?: Partial<CreateGroupInput>): Promise<{ success: boolean; groupId?: string; error?: string }> => {
      if (!lessonId) {
        return { success: false, error: "No lessonId provided" };
      }

      setIsWorking(true);
      setError(null);

      try {
        // Load existing groups to compute order_index
        const { data: existingGroups, error: loadError } = await loadGroupsByLesson(lessonId);
        if (loadError) {
          const err = `Failed to load groups: ${loadError}`;
          setError(err);
          return { success: false, error: err };
        }

        // Compute next order_index
        const maxOrder = (existingGroups ?? []).reduce((max, g) => {
          const v = typeof g.orderIndex === "number" ? g.orderIndex : 0;
          return v > max ? v : max;
        }, 0);
        const nextOrderIndex = maxOrder + 1;

        // Create group with defaults
        const groupInput: CreateGroupInput = {
          lesson_id: lessonId,
          label: input?.label ?? "New group",
          title: input?.title ?? null,
          order_index: input?.order_index ?? nextOrderIndex,
          ...input,
        };

        const { data, error: createError } = await createGroup(groupInput);

        if (createError) {
          const err = `Failed to create group: ${createError}`;
          setError(err);
          return { success: false, error: err };
        }

        if (!data) {
          const err = "Group created but no data returned";
          setError(err);
          return { success: false, error: err };
        }

        return { success: true, groupId: data.id };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsWorking(false);
      }
    },
    [lessonId]
  );

  /**
   * Add a new slide to the lesson
   * Computes order_index automatically if not provided
   * Creates default "Intro" group if no group exists and groupId is not provided
   */
  const addSlide = useCallback(
    async (args: {
      lessonId: string;
      groupId?: string | null;
      type: string;
      input?: Partial<CreateSlideInput>;
      navigateToEdit?: boolean;
    }): Promise<{ success: boolean; slideId?: string; error?: string }> => {
      const { lessonId: lid, groupId, type, input, navigateToEdit = true } = args;

      if (!lid) {
        return { success: false, error: "No lessonId provided" };
      }

      setIsWorking(true);
      setError(null);

      try {
        let finalGroupId = groupId;

        // If no groupId provided, find or create default group
        if (finalGroupId === undefined || finalGroupId === null) {
          const { data: existingGroups, error: groupsError } = await loadGroupsByLesson(lid);
          if (groupsError) {
            const err = `Failed to load groups: ${groupsError}`;
            setError(err);
            return { success: false, error: err };
          }

          // Find earliest group
          const earliestGroup = (existingGroups ?? []).sort((a, b) => {
            const ao = a.orderIndex ?? 0;
            const bo = b.orderIndex ?? 0;
            return ao - bo;
          })[0];

          if (earliestGroup) {
            finalGroupId = earliestGroup.id;
          } else {
            // Create default Intro group directly
            const { data: newGroup, error: groupCreateError } = await createGroup({
              lesson_id: lid,
              label: "Intro",
              title: null,
              order_index: 1,
            });
            if (groupCreateError || !newGroup) {
              const err = groupCreateError ?? "Failed to create default group";
              setError(err);
              return { success: false, error: err };
            }
            finalGroupId = newGroup.id;
          }
        }

        // Load existing slides to compute order_index
        const { data: existingSlides, error: slidesError } = await loadSlidesByLesson(lid);
        if (slidesError) {
          const err = `Failed to load slides: ${slidesError}`;
          setError(err);
          return { success: false, error: err };
        }

        // Compute next order_index
        const maxOrder = (existingSlides ?? []).reduce((max, s) => {
          const v = typeof s.orderIndex === "number" ? s.orderIndex : 0;
          return v > max ? v : max;
        }, 0);
        const nextOrderIndex = maxOrder + 1;

        // Prepare slide input with defaults
        const trimmedType = (type || "default").trim() || "default";
        const defaultProps = defaultPropsForType(trimmedType);

        // Ensure we have a group_id (should never be null at this point)
        if (!finalGroupId) {
          const err = "Failed to determine group_id. Cannot create slide without a group.";
          setError(err);
          return { success: false, error: err };
        }

        // Build slide input with required NOT NULL fields
        // createSlide will apply defaults for optional NOT NULL fields (props_json, meta_json, is_activity, score_type, pass_required_for_next)
        const slideInput: CreateSlideInput = {
          lesson_id: lid,
          group_id: finalGroupId, // Required NOT NULL - must be provided
          order_index: input?.order_index ?? nextOrderIndex, // Required NOT NULL - must be provided
          type: trimmedType, // Required NOT NULL - must be provided
          props_json: input?.props_json ?? defaultProps, // NOT NULL - default provided, createSlide will also default to {}
          aid_hook: input?.aid_hook ?? null,
          code: input?.code ?? null,
          meta_json: input?.meta_json, // createSlide will default to {} if undefined/null
          // Only include is_activity if explicitly provided (createSlide will compute default from type)
          ...(input?.is_activity !== null && input?.is_activity !== undefined
            ? { is_activity: input.is_activity }
            : {}),
          score_type: input?.score_type, // createSlide will default to 'none' if undefined/null
          passing_score_value: input?.passing_score_value ?? null,
          max_score_value: input?.max_score_value ?? null,
          pass_required_for_next: input?.pass_required_for_next, // createSlide will default to false if undefined/null
        };

        const { data, error: createError } = await createSlide(slideInput);

        if (createError) {
          const err = `Failed to create slide: ${createError}`;
          setError(err);
          return { success: false, error: err };
        }

        if (!data) {
          const err = "Slide created but no data returned";
          setError(err);
          return { success: false, error: err };
        }

        // Navigate to edit slide if requested (functionality archived - placeholder)
        // TODO: Re-implement slide editing
        if (navigateToEdit) {
          // router.push(`/edit-slide/${data.id}`);
        }

        return { success: true, slideId: data.id };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsWorking(false);
      }
    },
    [router]
  );

  /**
   * Delete a group by ID
   */
  const deleteGroup = useCallback(
    async (groupId: string): Promise<{ success: boolean; error?: string }> => {
      setIsWorking(true);
      setError(null);

      try {
        const { error: deleteError } = await deleteGroupData(groupId);

        if (deleteError) {
          const err = `Failed to delete group: ${deleteError}`;
          setError(err);
          return { success: false, error: err };
        }

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsWorking(false);
      }
    },
    []
  );

  /**
   * Delete a slide by ID
   */
  const deleteSlide = useCallback(
    async (slideId: string): Promise<{ success: boolean; error?: string }> => {
      setIsWorking(true);
      setError(null);

      try {
        const { error: deleteError } = await deleteSlideData(slideId);

        if (deleteError) {
          const err = `Failed to delete slide: ${deleteError}`;
          setError(err);
          return { success: false, error: err };
        }

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsWorking(false);
      }
    },
    []
  );

  /**
   * Rename a group by ID
   */
  const renameGroup = useCallback(
    async (groupId: string, newTitle: string): Promise<{ success: boolean; error?: string }> => {
      setIsWorking(true);
      setError(null);

      try {
        const trimmedTitle = newTitle.trim();
        if (trimmedTitle === "") {
          const err = "Group title cannot be empty";
          setError(err);
          return { success: false, error: err };
        }

        const { error: updateError } = await updateGroup(groupId, { title: trimmedTitle });

        if (updateError) {
          const err = `Failed to rename group: ${updateError}`;
          setError(err);
          return { success: false, error: err };
        }

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsWorking(false);
      }
    },
    []
  );

  return {
    addGroup,
    addSlide,
    deleteGroup,
    deleteSlide,
    renameGroup,
    isWorking,
    error,
  };
}
