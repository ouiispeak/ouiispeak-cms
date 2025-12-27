import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { loadDashboardDataPaginated } from "../../data/dashboard";
import { buildCmsHierarchy, type CmsHierarchyMaps } from "../../data/buildHierarchy";
import type { PaginationMeta } from "../../data/modules";

export type DashboardLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; maps: CmsHierarchyMaps };

/**
 * Tier 2.1 Step 4: Paginated dashboard hook
 * 
 * Provides paginated dashboard data loading with navigation controls.
 * 
 * @param initialPage - Initial page number (default: 1)
 * @param pageSize - Number of modules per page (default: 50)
 */
export function useCmsDashboardPaginated(
  initialPage: number = 1,
  pageSize: number = 50
) {
  const [loadState, setLoadState] = useState<DashboardLoadState>({ status: "loading" });
  const [page, setPage] = useState(initialPage);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const pathname = usePathname();

  const loadData = useCallback(async (targetPage: number) => {
    setLoadState({ status: "loading" });

    const result = await loadDashboardDataPaginated(targetPage, pageSize);

    if (result.error || !result.data) {
      setLoadState({
        status: "error",
        message: result.error || "Failed to load dashboard data",
      });
      setPaginationMeta(null);
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
    setPaginationMeta(result.meta);
  }, [pageSize]);

  useEffect(() => {
    loadData(page);
    // Reload when pathname changes (user navigates back to dashboard)
  }, [pathname, page, loadData]);

  const nextPage = useCallback(() => {
    if (paginationMeta && paginationMeta.hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [paginationMeta]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((targetPage: number) => {
    if (targetPage >= 1 && paginationMeta && targetPage <= paginationMeta.totalPages) {
      setPage(targetPage);
    }
  }, [paginationMeta]);

  const reload = useCallback(() => {
    loadData(page);
  }, [loadData, page]);

  return {
    loadState,
    reload,
    // Pagination controls
    page,
    pageSize,
    paginationMeta,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: paginationMeta?.hasMore ?? false,
    hasPrevPage: page > 1,
  };
}

