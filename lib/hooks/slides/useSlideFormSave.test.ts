/**
 * Tests for useSlideFormSave hook
 * 
 * Tests save functionality, props building, and error handling.
 * Mocks updateSlide and getAudioFileUrl functions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SlideFormState } from "./useSlideFormState";
import { SLIDE_TYPES } from "../../types/slideProps";
import type { Slide } from "../../domain/slide";
import type { SlideResult } from "../../data/slides";

// Mock dependencies
vi.mock("../../data/slides", () => ({
  updateSlide: vi.fn(),
}));

vi.mock("../../storage/audioFiles", () => ({
  getAudioFileUrl: vi.fn((bucket: string, path: string) => `https://example.com/${bucket}/${path}`),
}));

vi.mock("../../utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import { updateSlide } from "../../data/slides";
import { getAudioFileUrl } from "../../storage/audioFiles";
import { useSlideFormSave, type SaveResult } from "./useSlideFormSave";

describe("useSlideFormSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  const createMockState = (overrides: Partial<SlideFormState> = {}): SlideFormState => ({
    slideId: "slide-1",
    slideType: "text-slide",
    groupId: "group-1",
    groupName: "Group 1",
    lessonId: "lesson-1",
    orderIndex: 0,
    label: "Test Label",
    title: "Test Title",
    subtitle: "Test Subtitle",
    lessonEndMessage: "",
    lessonEndActions: "",
    body: "Test Body",
    buttons: "",
    defaultLang: "english",
    audioId: "",
    activityName: "",
    phrases: "",
    instructions: "",
    promptLabel: "",
    note: "",
    onCompleteAtIndex: "",
    elements: [],
    choiceElements: [],
    isInteractive: false,
    allowSkip: false,
    allowRetry: false,
    isActivity: false,
    maxAttempts: "",
    minAttemptsBeforeSkip: "",
    ...overrides,
  });

  describe("Validation", () => {
    it("should return error if validation fails", async () => {
      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({ slideType: SLIDE_TYPES.AI_SPEAK_REPEAT, phrases: "" });

      let saveResult: SaveResult | null = null;
      await act(async () => {
        saveResult = await result.current.save(
          "slide-1",
          SLIDE_TYPES.AI_SPEAK_REPEAT,
          state,
          false,
          null,
          false,
          { valid: false, error: "Validation failed" }
        );
      });

      expect(saveResult).not.toBeNull();
      expect(saveResult!.success).toBe(false);
      expect(saveResult!.error).toBe("Validation failed");
      expect(updateSlide).not.toHaveBeenCalled();
    });

    it("should proceed if validation passes", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState();

      let saveResult: SaveResult | null = null;
      await act(async () => {
        saveResult = await result.current.save(
          "slide-1",
          SLIDE_TYPES.TEXT,
          state,
          false,
          null,
          false,
          { valid: true, error: null }
        );
      });

      expect(saveResult).not.toBeNull();
      expect(saveResult!.success).toBe(true);
      expect(updateSlide).toHaveBeenCalled();
    });
  });

  describe("JSON Parsing", () => {
    it("should parse valid buttons JSON", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        buttons: '[{"label": "Next", "action": "next"}]',
      });

      let saveResult: SaveResult | null = null;
      await act(async () => {
        saveResult = await result.current.save(
          "slide-1",
          SLIDE_TYPES.TEXT,
          state,
          false,
          null,
          false,
          { valid: true, error: null }
        );
      });

      expect(saveResult).not.toBeNull();
      expect(saveResult!.success).toBe(true);
      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as { buttons?: unknown };
      expect(Array.isArray(propsJson.buttons)).toBe(true);
    });

    it("should return error for invalid buttons JSON", async () => {
      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        buttons: '{"invalid": json}',
      });

      let saveResult: SaveResult | null = null;
      await act(async () => {
        saveResult = await result.current.save(
          "slide-1",
          SLIDE_TYPES.TEXT,
          state,
          false,
          null,
          false,
          { valid: true, error: null }
        );
      });

      expect(saveResult).not.toBeNull();
      expect(saveResult!.success).toBe(false);
      expect(saveResult!.error).toBe("Invalid JSON in Buttons field");
      expect(updateSlide).not.toHaveBeenCalled();
    });

    it("should parse valid actions JSON for lesson-end slides", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.LESSON_END,
        lessonEndActions: '[{"type": "restart", "label": "Restart"}]',
      });

      let saveResult: SaveResult | null = null;
      await act(async () => {
        saveResult = await result.current.save(
          "slide-1",
          SLIDE_TYPES.LESSON_END,
          state,
          false,
          null,
          false,
          { valid: true, error: null }
        );
      });

      expect(saveResult).not.toBeNull();
      expect(saveResult!.success).toBe(true);
      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as { actions?: unknown };
      expect(Array.isArray(propsJson.actions)).toBe(true);
    });

    it("should return error for invalid actions JSON", async () => {
      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.LESSON_END,
        lessonEndActions: '{"invalid": json}',
      });

      let saveResult: SaveResult | null = null;
      await act(async () => {
        saveResult = await result.current.save(
          "slide-1",
          SLIDE_TYPES.LESSON_END,
          state,
          false,
          null,
          false,
          { valid: true, error: null }
        );
      });

      expect(saveResult).not.toBeNull();
      expect(saveResult!.success).toBe(false);
      expect(saveResult!.error).toBe("Invalid JSON in Actions field");
      expect(updateSlide).not.toHaveBeenCalled();
    });
  });

  describe("Props Building - Text Slide", () => {
    it("should build correct props for text-slide", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.TEXT,
        label: "Label",
        title: "Title",
        subtitle: "Subtitle",
        body: "Body",
        defaultLang: "english",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as Record<string, unknown>;

      expect(propsJson.label).toBe("Label");
      expect(propsJson.title).toBe("Title");
      expect(propsJson.subtitle).toBe("Subtitle");
      expect(propsJson.body).toBe("Body");
      expect(propsJson.defaultLang).toBe("english");
    });

    it("should exclude undefined values from props", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.TEXT,
        label: "",
        title: "",
        body: "",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as Record<string, unknown>;

      expect(propsJson.label).toBeUndefined();
      expect(propsJson.title).toBeUndefined();
      expect(propsJson.body).toBeUndefined();
    });
  });

  describe("Props Building - Lesson End Slide", () => {
    it("should use message instead of subtitle for lesson-end", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.LESSON_END,
        title: "Title",
        lessonEndMessage: "Message",
        subtitle: "Should be ignored",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.LESSON_END, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as Record<string, unknown>;

      expect(propsJson.message).toBe("Message");
      expect(propsJson.subtitle).toBeUndefined();
    });
  });

  describe("Props Building - AI Speak Repeat", () => {
    it("should convert phrases to lines array", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.AI_SPEAK_REPEAT,
        phrases: "Hello\nWorld\nTest",
        defaultLang: "english",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.AI_SPEAK_REPEAT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as { lines?: unknown };

      expect(Array.isArray(propsJson.lines)).toBe(true);
      if (Array.isArray(propsJson.lines) && propsJson.lines.length > 0) {
        const firstLine = propsJson.lines[0] as Array<{ label: string }>;
        expect(firstLine.length).toBe(3);
        expect(firstLine[0].label).toBe("Hello");
        expect(firstLine[1].label).toBe("World");
        expect(firstLine[2].label).toBe("Test");
      }
    });

    it("should filter empty phrases", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.AI_SPEAK_REPEAT,
        phrases: "Hello\n\nWorld\n  \nTest",
        defaultLang: "english",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.AI_SPEAK_REPEAT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as { lines?: unknown };

      if (Array.isArray(propsJson.lines) && propsJson.lines.length > 0) {
        const firstLine = propsJson.lines[0] as Array<{ label: string }>;
        expect(firstLine.length).toBe(3); // Should filter out empty lines
      }
    });
  });

  describe("Props Building - AI Speak Student Repeat", () => {
    it("should convert elements array correctly", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
        elements: [
          {
            samplePrompt: "Hello",
            referenceText: "Hello",
            audioPath: "",
          },
        ],
        defaultLang: "english",
      });

      await act(async () => {
        await result.current.save(
          "slide-1",
          SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
          state,
          false,
          null,
          false,
          { valid: true, error: null }
        );
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as { elements?: unknown };

      expect(Array.isArray(propsJson.elements)).toBe(true);
      if (Array.isArray(propsJson.elements) && propsJson.elements.length > 0) {
        const element = propsJson.elements[0] as { samplePrompt: string };
        expect(element.samplePrompt).toBe("Hello");
      }
    });

    it("should filter elements without samplePrompt", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
        elements: [
          {
            samplePrompt: "",
            referenceText: "",
            audioPath: "",
          },
          {
            samplePrompt: "Hello",
            referenceText: "",
            audioPath: "",
          },
        ],
        defaultLang: "english",
      });

      await act(async () => {
        await result.current.save(
          "slide-1",
          SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
          state,
          false,
          null,
          false,
          { valid: true, error: null }
        );
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as { elements?: unknown };

      if (Array.isArray(propsJson.elements)) {
        expect(propsJson.elements.length).toBe(1); // Should filter out empty element
      }
    });

    it("should add audio file URL when audioPath is provided", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
        elements: [
          {
            samplePrompt: "Hello",
            referenceText: "",
            audioPath: "audio/test.mp3",
          },
        ],
        defaultLang: "english",
      });

      await act(async () => {
        await result.current.save(
          "slide-1",
          SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
          state,
          false,
          null,
          false,
          { valid: true, error: null }
        );
      });

      expect(getAudioFileUrl).toHaveBeenCalledWith("lesson-audio", "audio/test.mp3");
      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as {
        elements?: Array<{ speech?: { fileUrl?: string } }>;
      };

      if (Array.isArray(propsJson.elements) && propsJson.elements.length > 0) {
        expect(propsJson.elements[0].speech?.fileUrl).toBeDefined();
      }
    });
  });

  describe("Props Building - Speech Match", () => {
    it("should convert choiceElements to elements array", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.SPEECH_MATCH,
        choiceElements: [
          {
            label: "A",
            speech: {
              mode: "tts",
              text: "Hello",
            },
          },
        ],
        defaultLang: "english",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.SPEECH_MATCH, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as { elements?: unknown };

      expect(Array.isArray(propsJson.elements)).toBe(true);
      if (Array.isArray(propsJson.elements) && propsJson.elements.length > 0) {
        const element = propsJson.elements[0] as { label: string };
        expect(element.label).toBe("A");
      }
    });

    it("should preserve original elements if empty and not touched", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.SPEECH_MATCH,
        choiceElements: [],
      });

      const originalElements = [
        {
          label: "A",
          speech: {
            mode: "tts" as const,
            lang: "en" as const,
            text: "Hello",
          },
        },
      ];

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.SPEECH_MATCH, state, false, originalElements, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as { elements?: unknown };

      expect(Array.isArray(propsJson.elements)).toBe(true);
      if (Array.isArray(propsJson.elements)) {
        expect(propsJson.elements.length).toBe(1);
        expect(propsJson.elements[0]).toEqual(originalElements[0]);
      }
    });

    it("should not preserve originals if touched", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        slideType: SLIDE_TYPES.SPEECH_MATCH,
        choiceElements: [],
      });

      const originalElements = [
        {
          label: "A",
          speech: {
            mode: "tts" as const,
            lang: "en" as const,
            text: "Hello",
          },
        },
      ];

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.SPEECH_MATCH, state, false, originalElements, true, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as { elements?: unknown };

      // Should not preserve originals when touched
      expect(propsJson.elements).toBeUndefined();
    });
  });

  describe("Boolean Flags", () => {
    it("should always include boolean flags even if false", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        isInteractive: false,
        allowSkip: false,
        allowRetry: false,
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as Record<string, unknown>;

      expect(propsJson.isInteractive).toBe(false);
      expect(propsJson.allowSkip).toBe(false);
      expect(propsJson.allowRetry).toBe(false);
    });

    it("should include true boolean flags", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        isInteractive: true,
        allowSkip: true,
        allowRetry: true,
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as Record<string, unknown>;

      expect(propsJson.isInteractive).toBe(true);
      expect(propsJson.allowSkip).toBe(true);
      expect(propsJson.allowRetry).toBe(true);
    });
  });

  describe("Numeric Fields", () => {
    it("should include maxAttempts if set", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        maxAttempts: "5",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as Record<string, unknown>;

      expect(propsJson.maxAttempts).toBe(5);
    });

    it("should exclude maxAttempts if empty", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        maxAttempts: "",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as Record<string, unknown>;

      expect(propsJson.maxAttempts).toBeUndefined();
    });

    it("should auto-adjust minAttemptsBeforeSkip if it exceeds maxAttempts", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        maxAttempts: "3",
        minAttemptsBeforeSkip: "5", // Exceeds maxAttempts
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const propsJson = callArgs[1]?.props_json as Record<string, unknown>;

      expect(propsJson.maxAttempts).toBe(3);
      expect(propsJson.minAttemptsBeforeSkip).toBe(3); // Should be auto-adjusted
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: null,
        error: "Database error",
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState();

      let saveResult: SaveResult | null = null;
      await act(async () => {
        saveResult = await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      expect(saveResult).not.toBeNull();
      expect(saveResult!.success).toBe(false);
      expect(saveResult!.error).toBe("Database error");
    });

    it("should return success when save succeeds", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState();

      let saveResult: SaveResult | null = null;
      await act(async () => {
        saveResult = await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      expect(saveResult).not.toBeNull();
      expect(saveResult!.success).toBe(true);
      expect(saveResult!.error).toBeNull();
    });
  });

  describe("Meta JSON", () => {
    it("should include activityName in meta_json if provided", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        activityName: "Test Activity",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];
      const metaJson = callArgs[1]?.meta_json as { activityName?: string };

      expect(metaJson?.activityName).toBe("Test Activity");
    });

    it("should exclude meta_json if activityName is empty", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState({
        activityName: "",
      });

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, false, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];

      expect(callArgs[1]?.meta_json).toBeUndefined();
    });
  });

  describe("is_activity flag", () => {
    it("should pass is_activity to updateSlide", async () => {
      vi.mocked(updateSlide).mockResolvedValue({
        data: createMockSlide(),
        error: null,
      } as SlideResult<Slide>);

      const { result } = renderHook(() => useSlideFormSave());
      const state = createMockState();

      await act(async () => {
        await result.current.save("slide-1", SLIDE_TYPES.TEXT, state, true, null, false, {
          valid: true,
          error: null,
        });
      });

      const callArgs = vi.mocked(updateSlide).mock.calls[0];

      expect(callArgs[1]?.is_activity).toBe(true);
    });
  });
});
