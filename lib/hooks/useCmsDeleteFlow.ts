import { useState } from "react";
import { deleteModule } from "../data/modules";
import { deleteLesson } from "../data/lessons";
import {
  getModuleDeleteImpact,
  getLessonDeleteImpact,
  type ModuleDeleteImpact,
  type LessonDeleteImpact,
} from "../data/deleteImpact";

export type DeleteState =
  | { type: null }
  | { type: "module"; id: string; title: string }
  | { type: "lesson"; id: string; title: string };

export interface UseCmsDeleteFlowReturn {
  deleteState: DeleteState;
  deleteImpact: ModuleDeleteImpact | LessonDeleteImpact | null;
  impactLoading: boolean;
  handleDeleteClick: (type: "module" | "lesson", id: string, title: string) => Promise<void>;
  handleDeleteCancel: () => void;
  handleDeleteConfirm: () => Promise<void>;
}

export function useCmsDeleteFlow(onDeleteSuccess: () => void | Promise<void>): UseCmsDeleteFlowReturn {
  const [deleteState, setDeleteState] = useState<DeleteState>({ type: null });
  const [deleteImpact, setDeleteImpact] = useState<ModuleDeleteImpact | LessonDeleteImpact | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);

  async function handleDeleteClick(type: "module" | "lesson", id: string, title: string) {
    setDeleteState({ type, id, title });
    setDeleteImpact(null);
    setImpactLoading(true);

    try {
      if (type === "module") {
        const { data, error } = await getModuleDeleteImpact(id);
        if (!error && data) {
          setDeleteImpact(data);
        }
      } else if (type === "lesson") {
        const { data, error } = await getLessonDeleteImpact(id);
        if (!error && data) {
          setDeleteImpact(data);
        }
      }
    } catch {
      // Ignore errors - don't block deletion
    } finally {
      setImpactLoading(false);
    }
  }

  function handleDeleteCancel() {
    setDeleteState({ type: null });
    setDeleteImpact(null);
    setImpactLoading(false);
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (!deleteState.type || deleteState.type === null) return;

    if (deleteState.type === "module") {
      const { error } = await deleteModule(deleteState.id);
      if (error) throw new Error(error);
    } else if (deleteState.type === "lesson") {
      const { error } = await deleteLesson(deleteState.id);
      if (error) throw new Error(error);
    }

    // Call success callback to reload data
    await onDeleteSuccess();
    handleDeleteCancel();
  }

  return {
    deleteState,
    deleteImpact,
    impactLoading,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
  };
}

