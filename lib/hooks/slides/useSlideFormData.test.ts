/**
 * Tests for useSlideFormData hook
 * 
 * Tests data loading, props extraction, and initial values extraction.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSlideFormData, extractInitialFormValues } from "./useSlideFormData";
import type { Slide } from "../../domain/slide";
import type { Group } from "../../domain/group";
import { SLIDE_TYPES } from "../../types/slideProps";

// Mock dependencies
vi.mock("../../data/slides", () => ({
  loadSlideById: vi.fn(),
}));

vi.mock("../../data/groups", () => ({
  loadGroupById: vi.fn(),
}));

vi.mock("../../utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import { loadSlideById } from "../../data/slides";
import { loadGroupById } from "../../data/groups";

describe("useSlideFormData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockSlide = (overrides: Partial<Slide> = {}): Slide => ({
    id: "slide-1",
    lessonId: "lesson-1",
    groupId: "group-1",
    orderIndex: 0,
    type: "text-slide",
    propsJson: { title: "Test Title", label: "Test Label" },
    metaJson: { activityName: "Test Activity" },
    isActivity: false,
    aidHook: null,
    code: null,
    scoreType: null,
    passingScoreValue: null,
    maxScoreValue: null,
    passRequiredForNext: null,
    ...overrides,
  });

  const createMockGroup = (overrides: Partial<Group> = {}): Group => ({
    id: "group-1",
    lessonId: "lesson-1",
    orderIndex: 0,
    title: "Test Group",
    ...overrides,
  });

  describe("Loading States", () => {
    it("starts in loading state", () => {
      vi.mocked(loadSlideById).mockResolvedValue({
        data: createMockSlide({ groupId: null }),
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      expect(result.current.loadState.status).toBe("loading");
    });

    it("transitions to ready state after successful load", async () => {
      const mockSlide = createMockSlide({ groupId: null }); // No group to avoid group loading
      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      expect(result.current.data).not.toBeNull();
      expect(result.current.error).toBeNull();
    });

    it("transitions to error state when slide not found", async () => {
      vi.mocked(loadSlideById).mockResolvedValue({
        data: null,
        error: "Slide not found",
      });

      const { result } = renderHook(() => useSlideFormData("non-existent"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("error");
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe("Slide not found");
    });

    it("handles missing slideId", async () => {
      const { result } = renderHook(() => useSlideFormData(undefined));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("error");
      });

      expect(result.current.error).toBe("No slideId provided in URL.");
    });
  });

  describe("Data Loading", () => {
    it("loads slide data successfully", async () => {
      const mockSlide = createMockSlide({
        title: "Test Title",
        propsJson: { title: "Test Title", label: "Test Label" },
      });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });
      vi.mocked(loadGroupById).mockResolvedValue({
        data: createMockGroup(),
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      expect(result.current.data).not.toBeNull();
      expect(result.current.data?.slide.id).toBe("slide-1");
      expect(result.current.data?.slide.type).toBe("text-slide");
    });

    it("loads group data when groupId is present", async () => {
      const mockSlide = createMockSlide({ groupId: "group-1" });
      const mockGroup = createMockGroup({ 
        id: "group-1",
        lessonId: "lesson-1",
        title: "Test Group",
        label: null,
        orderIndex: 0,
        groupCode: null,
        shortSummary: null,
        groupType: null,
        groupSummary: null,
        groupGoal: null,
        prerequisites: null,
        isRequiredToPass: null,
        passingScoreType: null,
        passingScoreValue: null,
        maxScoreValue: null,
        extraPracticeNotes: null,
        l1L2: null,
        mediaUsedIds: null,
        groupSlidesPlan: null,
      });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });
      vi.mocked(loadGroupById).mockResolvedValue({
        data: mockGroup,
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      expect(result.current.data?.group).not.toBeNull();
      expect(result.current.data?.group?.title).toBe("Test Group");
    });

    it("handles group loading failure gracefully", async () => {
      const mockSlide = createMockSlide({ groupId: "group-1" });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });
      vi.mocked(loadGroupById).mockResolvedValue({
        data: null,
        error: "Group not found",
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      // Should still succeed even if group fails
      expect(result.current.data).not.toBeNull();
      expect(result.current.data?.group).toBeNull();
    });

    it("does not load group when groupId is null", async () => {
      const mockSlide = createMockSlide({ groupId: null });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      expect(loadGroupById).not.toHaveBeenCalled();
      expect(result.current.data?.group).toBeNull();
    });
  });

  describe("Props Extraction", () => {
    it("extracts props for text-slide", async () => {
      const mockSlide = createMockSlide({
        type: "text-slide",
        propsJson: {
          title: "Text Slide Title",
          subtitle: "Subtitle",
          body: "Body text",
        },
      });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      expect(result.current.data?.props.title).toBe("Text Slide Title");
    });

    it("extracts props for title-slide", async () => {
      const mockSlide = createMockSlide({
        type: "title-slide",
        propsJson: {
          title: "Title Slide",
        },
      });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      expect(result.current.data?.props.title).toBe("Title Slide");
    });

    it("extracts metaJson correctly", async () => {
      const mockSlide = createMockSlide({
        metaJson: { activityName: "Test Activity" },
      });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      expect(result.current.data?.meta.activityName).toBe("Test Activity");
    });

    it("handles empty metaJson", async () => {
      const mockSlide = createMockSlide({
        metaJson: null,
      });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      expect(result.current.data?.meta).toEqual({});
    });
  });

  describe("Reload Functionality", () => {
    it("reloads data when reload is called", async () => {
      const mockSlide = createMockSlide({ groupId: null });
      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("ready");
      });

      // Clear mock to isolate reload call
      vi.mocked(loadSlideById).mockClear();

      // Ensure mock is set up for reload
      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      // Call reload
      result.current.reload();

      // Wait for reload to complete - reload should trigger a new load
      await waitFor(() => {
        const calls = vi.mocked(loadSlideById).mock.calls;
        return calls.length >= 1;
      }, { timeout: 3000 });

      // Should have been called at least once for the reload
      expect(vi.mocked(loadSlideById).mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Error Handling", () => {
    it("handles database errors", async () => {
      vi.mocked(loadSlideById).mockResolvedValue({
        data: null,
        error: "Database connection failed",
      });

      const { result } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("error");
      });

      expect(result.current.error).toBe("Database connection failed");
      expect(result.current.data).toBeNull();
    });

    it("handles slide not found error", async () => {
      vi.mocked(loadSlideById).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useSlideFormData("non-existent"));

      await waitFor(() => {
        expect(result.current.loadState.status).toBe("error");
      });

      expect(result.current.error).toContain("No slide found");
    });
  });
});

describe("extractInitialFormValues", () => {
  const createMockSlide = (overrides: Partial<Slide> = {}): Slide => ({
    id: "slide-1",
    lessonId: "lesson-1",
    groupId: "group-1",
    orderIndex: 0,
    type: "text-slide",
    propsJson: {},
    metaJson: {},
    isActivity: false,
    aidHook: null,
    code: null,
    scoreType: null,
    passingScoreValue: null,
    maxScoreValue: null,
    passRequiredForNext: null,
    ...overrides,
  });

  describe("Basic Field Extraction", () => {
    it("extracts basic fields from text-slide", () => {
      const slide = createMockSlide({
        type: "text-slide",
        propsJson: {
          label: "Label",
          title: "Title",
          subtitle: "Subtitle",
          body: "Body",
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.slideId).toBe("slide-1");
      expect(values.slideType).toBe("text-slide");
      expect(values.label).toBe("Label");
      expect(values.title).toBe("Title");
      expect(values.subtitle).toBe("Subtitle");
      expect(values.body).toBe("Body");
    });

    it("extracts boolean flags", () => {
      const slide = createMockSlide({
        propsJson: {
          isInteractive: true,
          allowSkip: true,
          allowRetry: false,
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.isInteractive).toBe(true);
      expect(values.allowSkip).toBe(true);
      expect(values.allowRetry).toBe(false);
    });

    it("extracts numeric fields", () => {
      const slide = createMockSlide({
        propsJson: {
          maxAttempts: 5,
          minAttemptsBeforeSkip: 3,
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.maxAttempts).toBe("5");
      expect(values.minAttemptsBeforeSkip).toBe("3");
    });

    it("handles missing numeric fields", () => {
      const slide = createMockSlide({
        propsJson: {},
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.maxAttempts).toBe("");
      expect(values.minAttemptsBeforeSkip).toBe("");
    });
  });

  describe("Lesson End Slide", () => {
    it("extracts message instead of subtitle", () => {
      const slide = createMockSlide({
        type: "lesson-end",
        propsJson: {
          title: "Title",
          message: "End Message",
          // Note: lesson-end slides don't have subtitle in props
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.lessonEndMessage).toBe("End Message");
      expect(values.subtitle).toBe("");
    });

    it("extracts actions as JSON string", () => {
      const slide = createMockSlide({
        type: "lesson-end",
        propsJson: {
          actions: [
            { type: "restart", label: "Restart" },
            { type: "next", label: "Next" },
          ],
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.lessonEndActions).toBeTruthy();
      const parsed = JSON.parse(values.lessonEndActions);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
    });
  });

  describe("AI Speak Repeat Slide", () => {
    it("extracts phrases from lines array", () => {
      const slide = createMockSlide({
        type: "ai-speak-repeat",
        propsJson: {
          lines: [
            [
              { label: "Hello", speech: { mode: "tts", lang: "en", text: "Hello" } },
              { label: "World", speech: { mode: "tts", lang: "en", text: "World" } },
            ],
          ],
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.phrases).toBe("Hello\nWorld");
    });

    it("handles empty lines array", () => {
      const slide = createMockSlide({
        type: "ai-speak-repeat",
        propsJson: {
          lines: [],
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.phrases).toBe("");
    });
  });

  describe("AI Speak Student Repeat Slide", () => {
    it("extracts elements array", () => {
      const slide = createMockSlide({
        type: "ai-speak-student-repeat",
        propsJson: {
          elements: [
            {
              samplePrompt: "Hello",
              referenceText: "Hello",
              speech: {
                mode: "file",
                fileUrl: "https://example.com/storage/v1/object/public/bucket/audio/test.mp3",
              },
            },
          ],
          instructions: "Repeat after me",
          promptLabel: "Prompt",
          onCompleteAtIndex: 2,
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.elements).toHaveLength(1);
      expect(values.elements[0].samplePrompt).toBe("Hello");
      expect(values.elements[0].referenceText).toBe("Hello");
      expect(values.elements[0].audioPath).toBe("audio/test.mp3");
      expect(values.instructions).toBe("Repeat after me");
      expect(values.promptLabel).toBe("Prompt");
      expect(values.onCompleteAtIndex).toBe("2");
    });

    it("extracts audio path from URL", () => {
      const slide = createMockSlide({
        type: "ai-speak-student-repeat",
        propsJson: {
          elements: [
            {
              samplePrompt: "Test",
              referenceText: "Test",
              speech: {
                mode: "file",
                fileUrl: "https://example.com/storage/v1/object/public/lesson-audio/path/to/file.mp3",
              },
            },
          ],
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.elements[0].audioPath).toBe("path/to/file.mp3");
    });

    it("handles elements without audio", () => {
      const slide = createMockSlide({
        type: "ai-speak-student-repeat",
        propsJson: {
          elements: [
            {
              samplePrompt: "Hello",
              referenceText: "Hello",
            },
          ],
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.elements[0].audioPath).toBe("");
    });
  });

  describe("Speech Match Slide", () => {
    it("extracts choiceElements array", () => {
      const slide = createMockSlide({
        type: "speech-match",
        propsJson: {
          elements: [
            {
              label: "A",
              speech: {
                mode: "tts",
                lang: "en",
                text: "Apple",
              },
            },
            {
              label: "B",
              speech: {
                mode: "file",
                fileUrl: "https://example.com/audio/b.mp3",
              },
            },
          ],
          note: "Match the words",
          defaultLang: "english",
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.choiceElements).toHaveLength(2);
      expect(values.choiceElements[0].label).toBe("A");
      expect(values.choiceElements[0].speech.mode).toBe("tts");
      expect(values.choiceElements[0].speech.text).toBe("Apple");
      expect(values.choiceElements[1].label).toBe("B");
      expect(values.choiceElements[1].speech.mode).toBe("file");
      expect(values.choiceElements[1].speech.fileUrl).toBe("https://example.com/audio/b.mp3");
      expect(values.note).toBe("Match the words");
    });

    it("defaults language from defaultLang", () => {
      const slide = createMockSlide({
        type: "speech-match",
        propsJson: {
          elements: [
            {
              label: "A",
              speech: {
                mode: "tts",
                text: "Test",
              },
            },
          ],
          defaultLang: "french",
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.choiceElements[0].speech.lang).toBe("fr");
    });

    it("handles empty elements array", () => {
      const slide = createMockSlide({
        type: "speech-match",
        propsJson: {
          elements: [],
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.choiceElements).toEqual([]);
    });
  });

  describe("Buttons Field", () => {
    it("extracts buttons as JSON string", () => {
      const slide = createMockSlide({
        propsJson: {
          buttons: [
            { label: "Next", action: "next" },
            { label: "Back", action: "back" },
          ],
        },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.buttons).toBeTruthy();
      const parsed = JSON.parse(values.buttons);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
    });

    it("handles missing buttons", () => {
      const slide = createMockSlide({
        propsJson: {},
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.buttons).toBe("");
    });
  });

  describe("Meta Data", () => {
    it("extracts activityName from meta", () => {
      const slide = createMockSlide({
        metaJson: { activityName: "Test Activity" },
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {
        activityName: "Test Activity",
      });

      expect(values.activityName).toBe("Test Activity");
    });

    it("handles missing activityName", () => {
      const slide = createMockSlide({
        metaJson: {},
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.activityName).toBe("");
    });
  });

  describe("Default Values", () => {
    it("provides defaults for missing fields", () => {
      const slide = createMockSlide({
        propsJson: {},
      });

      const values = extractInitialFormValues(slide, slide.propsJson as any, {});

      expect(values.label).toBe("");
      expect(values.title).toBe("");
      expect(values.subtitle).toBe("");
      expect(values.body).toBe("");
      expect(values.defaultLang).toBe("");
      expect(values.audioId).toBe("");
      expect(values.isInteractive).toBe(false);
      expect(values.allowSkip).toBe(false);
      expect(values.allowRetry).toBe(false);
    });
  });
});

