import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadLessonManagement } from "./lessonManagement";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("loadLessonManagement", () => {
  let mockClient: SupabaseClient;

  beforeEach(() => {
    mockClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      not: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;
  });

  it("returns ordered groups and slides with unique slide types", async () => {
    const mockLesson = {
      data: { id: "lesson-1", title: "Test Lesson" },
      error: null,
    };

    const mockSlides = {
      data: [
        { id: "slide-2", type: "ai-speak-repeat", props_json: {}, order_index: 1, group_id: "group-1", lesson_id: "lesson-1" },
        { id: "slide-1", type: "text-slide", props_json: {}, order_index: 2, group_id: "group-1", lesson_id: "lesson-1" },
        { id: "slide-3", type: "text-slide", props_json: {}, order_index: 1, group_id: null, lesson_id: "lesson-1" },
      ],
      error: null,
    };

    const mockGroups = {
      data: [
        { id: "group-1", title: "Group 1", order_index: 1 },
        { id: "group-2", title: "Group 2", order_index: 2 },
      ],
      error: null,
    };

    const mockAllSlides = {
      data: [
        { type: "text-slide" },
        { type: "ai-speak-repeat" },
        { type: "title-slide" },
        { type: "text-slide" }, // duplicate
        { type: "  ai-speak-repeat  " }, // with whitespace
        { type: "" }, // empty string
      ],
      error: null,
    };

    vi.mocked(mockClient.from)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue(mockLesson),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockSlides),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockGroups),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          not: vi.fn().mockResolvedValue(mockAllSlides),
        }),
      } as any);

    const result = await loadLessonManagement("lesson-1", mockClient);

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();

    // Check lesson
    expect(result.data?.lesson).toEqual({ id: "lesson-1", title: "Test Lesson" });

    // Check groups are ordered by order_index
    expect(result.data?.groups).toHaveLength(2);
    expect(result.data?.groups.map(g => g.id)).toEqual(["group-1", "group-2"]);

    // Check slides are ordered by order_index
    expect(result.data?.slides).toHaveLength(3);
    expect(result.data?.slides.map(s => s.id)).toEqual(["slide-2", "slide-1", "slide-3"]);

    // Check slide types are unique, trimmed, and sorted
    expect(result.data?.slideTypes).toEqual(["ai-speak-repeat", "text-slide", "title-slide"]);
  });

  it("handles lesson not found", async () => {
    const mockLesson = {
      data: null,
      error: null,
    };

    vi.mocked(mockClient.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(mockLesson),
        }),
      }),
    } as any);

    const result = await loadLessonManagement("lesson-1", mockClient);

    expect(result.data).toBeNull();
    expect(result.error).toBe("Lesson not found");
  });

  it("handles errors from slides query", async () => {
    const mockLesson = {
      data: { id: "lesson-1", title: "Test Lesson" },
      error: null,
    };

    const mockSlides = {
      data: null,
      error: { message: "Slides query failed" },
    };

    vi.mocked(mockClient.from)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue(mockLesson),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockSlides),
          }),
        }),
      } as any);

    const result = await loadLessonManagement("lesson-1", mockClient);

    expect(result.data).toBeNull();
    expect(result.error).toBe("Slides query failed");
  });

  it("handles empty groups and slides", async () => {
    const mockLesson = {
      data: { id: "lesson-1", title: "Test Lesson" },
      error: null,
    };

    const mockSlides = {
      data: [],
      error: null,
    };

    const mockGroups = {
      data: [],
      error: null,
    };

    const mockAllSlides = {
      data: [{ type: "text-slide" }],
      error: null,
    };

    vi.mocked(mockClient.from)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue(mockLesson),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockSlides),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockGroups),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          not: vi.fn().mockResolvedValue(mockAllSlides),
        }),
      } as any);

    const result = await loadLessonManagement("lesson-1", mockClient);

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.groups).toEqual([]);
    expect(result.data?.slides).toEqual([]);
    expect(result.data?.slideTypes).toEqual(["text-slide"]);
  });
});

