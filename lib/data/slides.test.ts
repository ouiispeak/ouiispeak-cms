import { describe, it, expect, vi, beforeEach } from "vitest";
import { defaultIsActivity } from "./slides";

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
