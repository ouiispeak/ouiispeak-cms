import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { loadDashboardData } from "../../data/dashboard";
import { buildCmsHierarchy, type CmsHierarchyMaps } from "../../data/buildHierarchy";

export type DashboardLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; maps: CmsHierarchyMaps };

export function useCmsDashboard() {
  const [loadState, setLoadState] = useState<DashboardLoadState>({ status: "loading" });
  const pathname = usePathname();

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
    // Reload when pathname changes (user navigates back to dashboard)
  }, [pathname, loadData]);

  return {
    loadState,
    reload: loadData,
  };
}
