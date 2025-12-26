import { describe, it, expect, vi, beforeEach } from "vitest";
import { defaultIsActivity, loadSlidesByLesson, loadSlidesByGroup, loadSlideById, createSlide, updateSlide, deleteSlide } from "./slides";

// Mock Supabase client
vi.mock("../supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("../utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import { supabase } from "../supabase";

describe("defaultIsActivity", () => {
  it("returns provided value when explicitly set", () => {
    expect(defaultIsActivity("ai-speak-repeat", true)).toBe(true);
    expect(defaultIsActivity("ai-speak-repeat", false)).toBe(false);
  });

  it("defaults to true for activity slide types", () => {
    expect(defaultIsActivity("ai-speak-repeat", null)).toBe(true);
    expect(defaultIsActivity("ai-speak-repeat", undefined)).toBe(true);
    expect(defaultIsActivity("ai-speak-student-repeat", null)).toBe(true);
  });

  it("defaults to false for title-slide type", () => {
    expect(defaultIsActivity("title-slide", null)).toBe(false);
    expect(defaultIsActivity("title-slide", undefined)).toBe(false);
    expect(defaultIsActivity("title", null)).toBe(false);
  });

  it("defaults to false for text-slide type", () => {
    expect(defaultIsActivity("text-slide", null)).toBe(false);
    expect(defaultIsActivity("text-slide", undefined)).toBe(false);
    expect(defaultIsActivity("text", null)).toBe(false);
  });

  it("handles case-insensitive and trimmed slide types", () => {
    expect(defaultIsActivity("  TITLE-SLIDE  ", null)).toBe(false);
    expect(defaultIsActivity("TEXT-SLIDE", null)).toBe(false);
    expect(defaultIsActivity("  AI-SPEAK-REPEAT  ", null)).toBe(true);
  });
});

describe("createSlide insert payload", () => {
  // Note: Full integration test would require mocking Supabase client
  // This test verifies the helper function logic that ensures is_activity is never null
  it("ensures is_activity helper never returns null or undefined", () => {
    const testCases = [
      { type: "ai-speak-repeat", provided: null, expected: true },
      { type: "title-slide", provided: null, expected: false },
      { type: "text-slide", provided: null, expected: false },
      { type: "ai-speak-repeat", provided: undefined, expected: true },
      { type: "title-slide", provided: undefined, expected: false },
      { type: "ai-speak-repeat", provided: true, expected: true },
      { type: "title-slide", provided: false, expected: false },
    ];

    testCases.forEach(({ type, provided, expected }) => {
      const result = defaultIsActivity(type, provided);
      expect(result).toBe(expected);
      expect(typeof result).toBe("boolean");
      expect(result).not.toBeNull();
    });
  });
});

describe("loadSlidesByLesson", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns slides ordered by order_index", async () => {
    const mockSlides = {
      data: [
        { id: "slide-2", lesson_id: "lesson-1", group_id: "group-1", order_index: 1, type: "text-slide" },
        { id: "slide-1", lesson_id: "lesson-1", group_id: "group-1", order_index: 2, type: "text-slide" },
        { id: "slide-3", lesson_id: "lesson-1", group_id: "group-1", order_index: 0, type: "text-slide" },
      ],
      error: null,
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockSlides),
        }),
      }),
    } as any);

    const result = await loadSlidesByLesson("lesson-1");

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(3);
    expect(result.data?.map(s => s.id)).toEqual(["slide-2", "slide-1", "slide-3"]);
  });

  it("returns empty array when no slides found", async () => {
    const mockSlides = {
      data: [],
      error: null,
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockSlides),
        }),
      }),
    } as any);

    const result = await loadSlidesByLesson("lesson-1");

    expect(result.error).toBeNull();
    expect(result.data).toEqual([]);
  });

  it("handles database errors", async () => {
    const mockError = {
      data: null,
      error: { message: "Database connection failed" },
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockError),
        }),
      }),
    } as any);

    const result = await loadSlidesByLesson("lesson-1");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Database connection failed");
  });
});

describe("loadSlidesByGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns slides ordered by order_index", async () => {
    const mockSlides = {
      data: [
        { id: "slide-2", lesson_id: "lesson-1", group_id: "group-1", order_index: 1, type: "text-slide" },
        { id: "slide-1", lesson_id: "lesson-1", group_id: "group-1", order_index: 2, type: "text-slide" },
      ],
      error: null,
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockSlides),
        }),
      }),
    } as any);

    const result = await loadSlidesByGroup("group-1");

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(2);
    expect(result.data?.map(s => s.id)).toEqual(["slide-2", "slide-1"]);
  });

  it("handles database errors", async () => {
    const mockError = {
      data: null,
      error: { message: "Database error" },
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockError),
        }),
      }),
    } as any);

    const result = await loadSlidesByGroup("group-1");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Database error");
  });
});

describe("loadSlideById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns slide when found", async () => {
    const mockSlide = {
      data: {
        id: "slide-1",
        lesson_id: "lesson-1",
        group_id: "group-1",
        order_index: 0,
        type: "text-slide",
        props_json: { title: "Test" },
        aid_hook: null,
        code: null,
        meta_json: {},
        is_activity: false,
        score_type: "none",
        passing_score_value: null,
        max_score_value: null,
        pass_required_for_next: false,
      },
      error: null,
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(mockSlide),
        }),
      }),
    } as any);

    const result = await loadSlideById("slide-1");

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data?.id).toBe("slide-1");
    expect(result.data?.type).toBe("text-slide");
  });

  it("returns error when slide not found", async () => {
    const mockSlide = {
      data: null,
      error: null,
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(mockSlide),
        }),
      }),
    } as any);

    const result = await loadSlideById("non-existent");

    expect(result.data).toBeNull();
    expect(result.error).toBe('No slide found with id "non-existent"');
  });

  it("handles database errors", async () => {
    const mockError = {
      data: null,
      error: { message: "Database error" },
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(mockError),
        }),
      }),
    } as any);

    const result = await loadSlideById("slide-1");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Database error");
  });
});

describe("createSlide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates slide with all required fields", async () => {
    const mockSlide = {
      data: {
        id: "slide-1",
        lesson_id: "lesson-1",
        group_id: "group-1",
        order_index: 0,
        type: "text-slide",
      },
      error: null,
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(mockSlide),
        }),
      }),
    } as any);

    const result = await createSlide({
      lesson_id: "lesson-1",
      group_id: "group-1",
      order_index: 0,
      type: "text-slide",
    });

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data?.id).toBe("slide-1");
  });

  it("returns error when lesson_id is missing", async () => {
    const result = await createSlide({
      group_id: "group-1",
      order_index: 0,
      type: "text-slide",
    } as any);

    expect(result.data).toBeNull();
    expect(result.error).toBe("lesson_id is required (NOT NULL)");
  });

  it("returns error when group_id is missing", async () => {
    const result = await createSlide({
      lesson_id: "lesson-1",
      order_index: 0,
      type: "text-slide",
    } as any);

    expect(result.data).toBeNull();
    expect(result.error).toBe("group_id is required (NOT NULL). Every slide must belong to a group.");
  });

  it("returns error when order_index is missing", async () => {
    const result = await createSlide({
      lesson_id: "lesson-1",
      group_id: "group-1",
      type: "text-slide",
    } as any);

    expect(result.data).toBeNull();
    expect(result.error).toBe("order_index is required (NOT NULL)");
  });

  it("returns error when type is missing", async () => {
    const result = await createSlide({
      lesson_id: "lesson-1",
      group_id: "group-1",
      order_index: 0,
    } as any);

    expect(result.data).toBeNull();
    expect(result.error).toBe("type is required (NOT NULL)");
  });

  it("defaults props_json to empty object", async () => {
    const mockSlide = {
      data: {
        id: "slide-1",
        lesson_id: "lesson-1",
        group_id: "group-1",
        order_index: 0,
        type: "text-slide",
      },
      error: null,
    };

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue(mockSlide),
      }),
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    await createSlide({
      lesson_id: "lesson-1",
      group_id: "group-1",
      order_index: 0,
      type: "text-slide",
    });

    expect(mockInsert).toHaveBeenCalled();
    const insertPayload = mockInsert.mock.calls[0][0];
    expect(insertPayload.props_json).toEqual({});
  });

  it("computes is_activity from slide type when not provided", async () => {
    const mockSlide = {
      data: {
        id: "slide-1",
        lesson_id: "lesson-1",
        group_id: "group-1",
        order_index: 0,
        type: "ai-speak-repeat",
      },
      error: null,
    };

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue(mockSlide),
      }),
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    await createSlide({
      lesson_id: "lesson-1",
      group_id: "group-1",
      order_index: 0,
      type: "ai-speak-repeat",
    });

    const insertPayload = mockInsert.mock.calls[0][0];
    expect(insertPayload.is_activity).toBe(true);
  });

  it("handles database errors", async () => {
    const mockError = {
      data: null,
      error: { message: "Database error" },
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(mockError),
        }),
      }),
    } as any);

    const result = await createSlide({
      lesson_id: "lesson-1",
      group_id: "group-1",
      order_index: 0,
      type: "text-slide",
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe("Database error");
  });
});

describe("updateSlide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates slide with provided fields", async () => {
    const mockSlide = {
      data: {
        id: "slide-1",
        lesson_id: "lesson-1",
        group_id: "group-1",
        order_index: 0,
        type: "text-slide",
        props_json: { title: "Updated" },
        aid_hook: null,
        code: null,
        meta_json: {},
        is_activity: false,
        score_type: "none",
        passing_score_value: null,
        max_score_value: null,
        pass_required_for_next: false,
      },
      error: null,
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue(mockSlide),
          }),
        }),
      }),
    } as any);

    const result = await updateSlide("slide-1", {
      props_json: { title: "Updated" },
    });

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data?.id).toBe("slide-1");
  });

  it("only updates provided fields", async () => {
    const mockSlide = {
      data: {
        id: "slide-1",
        lesson_id: "lesson-1",
        group_id: "group-1",
        order_index: 0,
        type: "text-slide",
        props_json: { title: "Updated" },
        aid_hook: null,
        code: null,
        meta_json: {},
        is_activity: false,
        score_type: "none",
        passing_score_value: null,
        max_score_value: null,
        pass_required_for_next: false,
      },
      error: null,
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(mockSlide),
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      update: mockUpdate,
    } as any);

    await updateSlide("slide-1", {
      props_json: { title: "Updated" },
    });

    const updatePayload = mockUpdate.mock.calls[0][0];
    expect(updatePayload).toEqual({ props_json: { title: "Updated" } });
    expect(updatePayload.lesson_id).toBeUndefined();
  });

  it("returns error when slide not found", async () => {
    const mockSlide = {
      data: null,
      error: null,
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue(mockSlide),
          }),
        }),
      }),
    } as any);

    const result = await updateSlide("non-existent", {
      props_json: {},
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe('No slide found with id "non-existent"');
  });

  it("handles database errors", async () => {
    const mockError = {
      data: null,
      error: { message: "Database error" },
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue(mockError),
          }),
        }),
      }),
    } as any);

    const result = await updateSlide("slide-1", {
      props_json: {},
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe("Database error");
  });
});

describe("deleteSlide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes slide successfully", async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any);

    const result = await deleteSlide("slide-1");

    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  it("handles database errors", async () => {
    const mockError = {
      error: { message: "Database error" },
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockError),
      }),
    } as any);

    const result = await deleteSlide("slide-1");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Database error");
  });
});
