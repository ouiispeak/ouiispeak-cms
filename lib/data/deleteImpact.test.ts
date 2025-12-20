import { describe, it, expect, vi, beforeEach } from "vitest";
import { getModuleDeleteImpact, getLessonDeleteImpact } from "./deleteImpact";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("deleteImpact", () => {
  let mockClient: SupabaseClient;

  beforeEach(() => {
    mockClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;
  });

  describe("getModuleDeleteImpact", () => {
    it("aggregates counts correctly for module deletion", async () => {
      const mockLessons = {
        data: [{ id: "lesson-1" }, { id: "lesson-2" }],
        error: null,
      };

      const mockGroupsCount = {
        count: 5,
        error: null,
      };

      const mockSlidesCount = {
        count: 12,
        error: null,
      };

      const mockUserLessonsCount = {
        count: 3,
        error: null,
      };

      vi.mocked(mockClient.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockLessons),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue(mockGroupsCount),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue(mockSlidesCount),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue(mockUserLessonsCount),
          }),
        } as any);

      const result = await getModuleDeleteImpact("module-1", mockClient);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        lessons: 2,
        groups: 5,
        slides: 12,
        user_lessons: 3,
      });
    });

    it("handles empty lesson list gracefully", async () => {
      const mockLessons = {
        data: [],
        error: null,
      };

      vi.mocked(mockClient.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockLessons),
        }),
      } as any);

      const result = await getModuleDeleteImpact("module-1", mockClient);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        lessons: 0,
        groups: 0,
        slides: 0,
        user_lessons: 0,
      });
    });

    it("handles errors from lessons query", async () => {
      const mockLessons = {
        data: null,
        error: { message: "Database error" },
      };

      vi.mocked(mockClient.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockLessons),
        }),
      } as any);

      const result = await getModuleDeleteImpact("module-1", mockClient);

      expect(result.data).toBeNull();
      expect(result.error).toBe("Database error");
    });
  });

  describe("getLessonDeleteImpact", () => {
    it("aggregates counts correctly for lesson deletion", async () => {
      const mockGroupsCount = {
        count: 3,
        error: null,
      };

      const mockSlidesCount = {
        count: 8,
        error: null,
      };

      const mockUserLessonsCount = {
        count: 2,
        error: null,
      };

      vi.mocked(mockClient.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockGroupsCount),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockSlidesCount),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockUserLessonsCount),
          }),
        } as any);

      const result = await getLessonDeleteImpact("lesson-1", mockClient);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        groups: 3,
        slides: 8,
        user_lessons: 2,
      });
    });

    it("handles null counts as zero", async () => {
      const mockGroupsCount = {
        count: null,
        error: null,
      };

      const mockSlidesCount = {
        count: null,
        error: null,
      };

      const mockUserLessonsCount = {
        count: null,
        error: null,
      };

      vi.mocked(mockClient.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockGroupsCount),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockSlidesCount),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockUserLessonsCount),
          }),
        } as any);

      const result = await getLessonDeleteImpact("lesson-1", mockClient);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        groups: 0,
        slides: 0,
        user_lessons: 0,
      });
    });

    it("handles errors from groups query", async () => {
      const mockGroupsCount = {
        count: null,
        error: { message: "Groups query failed" },
      };

      vi.mocked(mockClient.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockGroupsCount),
        }),
      } as any);

      const result = await getLessonDeleteImpact("lesson-1", mockClient);

      expect(result.data).toBeNull();
      expect(result.error).toBe("Groups query failed");
    });
  });
});

