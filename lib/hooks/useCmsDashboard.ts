import { useEffect, useState } from "react";
import { loadDashboardData } from "../data/dashboard";
import { buildCmsHierarchy, type CmsHierarchyMaps } from "../data/buildHierarchy";

export type DashboardLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; maps: CmsHierarchyMaps };

export function useCmsDashboard() {
  const [loadState, setLoadState] = useState<DashboardLoadState>({ status: "loading" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadState({ status: "loading" });

    const result = await loadDashboardData();

    if (result.error || !result.data) {
      setLoadState({
        status: "error",
        message: result.error || "Failed to load dashboard data",
      });
      return;
    }

    // Build hierarchy
    const maps = buildCmsHierarchy(
      result.data.modules,
      result.data.lessons,
      result.data.groups,
      result.data.slides
    );

    setLoadState({ status: "ready", maps });
  }

  return {
    loadState,
    reload: loadData,
  };
}

