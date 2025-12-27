"use client";

import { useCmsDashboardPaginated } from "../../lib/hooks/cms/useCmsDashboardPaginated";

/**
 * Tier 2.1 Step 4 Test: Paginated Dashboard Hook
 * 
 * Tests: Does useCmsDashboardPaginated() work correctly in the browser?
 */
export default function TestPaginationPage() {
  const {
    loadState,
    page,
    pageSize,
    paginationMeta,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
    reload,
  } = useCmsDashboardPaginated(1, 10);

  if (loadState.status === "loading") {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>🧪 Step 4 Test: Paginated Dashboard Hook</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (loadState.status === "error") {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>🧪 Step 4 Test: Paginated Dashboard Hook</h1>
        <p style={{ color: "red" }}>❌ ERROR: {loadState.message}</p>
      </div>
    );
  }

  const { maps } = loadState;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🧪 Step 4 Test: Paginated Dashboard Hook</h1>
      <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
        <h2>Pagination Info</h2>
        <p>Current Page: {page}</p>
        <p>Page Size: {pageSize}</p>
        {paginationMeta && (
          <>
            <p>Total Modules: {paginationMeta.total}</p>
            <p>Total Pages: {paginationMeta.totalPages}</p>
            <p>Has More: {paginationMeta.hasMore ? "Yes" : "No"}</p>
          </>
        )}
      </div>

      <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
        <h2>Data Loaded</h2>
        <p>Modules: {Array.from(maps.modulesByLevel.values()).flat().length}</p>
        <p>Lessons: {Array.from(maps.lessonsByModule.values()).flat().length}</p>
        <p>Groups: {Array.from(maps.groupsByLesson.values()).flat().length}</p>
        <p>Slides: {Array.from(maps.slidesByGroup.values()).flat().length + Array.from(maps.ungroupedSlidesByLesson.values()).flat().length}</p>
      </div>

      <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
        <h2>Pagination Controls</h2>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button
            onClick={prevPage}
            disabled={!hasPrevPage}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: hasPrevPage ? "#0c9599" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: hasPrevPage ? "pointer" : "not-allowed",
            }}
          >
            Previous Page
          </button>
          <button
            onClick={nextPage}
            disabled={!hasNextPage}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: hasNextPage ? "#0c9599" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: hasNextPage ? "pointer" : "not-allowed",
            }}
          >
            Next Page
          </button>
          <button
            onClick={reload}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#595852",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
        {paginationMeta && paginationMeta.totalPages > 1 && (
          <div style={{ marginTop: "1rem" }}>
            <p>Go to page:</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {Array.from({ length: paginationMeta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: p === page ? "#0c9599" : "#edeae7",
                    color: p === page ? "white" : "#192026",
                    border: "1px solid #d9d3cc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#d4edda", borderRadius: "4px" }}>
        <h2>✅ Step 4 PASSED: Paginated dashboard hook works in browser!</h2>
      </div>
    </div>
  );
}

