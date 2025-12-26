/**
 * Tests for useSlideFormValidation hook
 * 
 * Tests validation logic for all slide types
 */

import { describe, it, expect } from "vitest";
import { useSlideFormValidation } from "./useSlideFormValidation";
import { SLIDE_TYPES, type ChoiceElement } from "../../types/slideProps";

describe("useSlideFormValidation", () => {
  const { validate } = useSlideFormValidation();

  describe("AI Speak Repeat validation", () => {
    it("should pass validation with non-empty phrases", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_REPEAT,
        {
          phrases: "Hello\nWorld",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should fail validation with empty phrases", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_REPEAT,
        {
          phrases: "",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("AI Speak Repeat: add at least 1 phrase before saving.");
    });

    it("should fail validation with only whitespace phrases", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_REPEAT,
        {
          phrases: "   \n  \n  ",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("AI Speak Repeat: add at least 1 phrase before saving.");
    });

    it("should pass validation with single phrase", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_REPEAT,
        {
          phrases: "Hello",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should trim and filter empty lines from phrases", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_REPEAT,
        {
          phrases: "  Hello  \n\n  World  \n  ",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe("AI Speak Student Repeat validation", () => {
    it("should pass validation with at least one element with samplePrompt", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
        {
          phrases: "",
          elements: [
            {
              samplePrompt: "Hello",
              referenceText: "",
              audioPath: "",
            },
          ],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should fail validation with no elements", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
        {
          phrases: "",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Student Repeat: add at least 1 element before saving.");
    });

    it("should fail validation with empty samplePrompt", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
        {
          phrases: "",
          elements: [
            {
              samplePrompt: "",
              referenceText: "test",
              audioPath: "",
            },
          ],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Student Repeat: each element needs a sample prompt.");
    });

    it("should fail validation with whitespace-only samplePrompt", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
        {
          phrases: "",
          elements: [
            {
              samplePrompt: "   ",
              referenceText: "test",
              audioPath: "",
            },
          ],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Student Repeat: each element needs a sample prompt.");
    });

    it("should pass validation with multiple elements if at least one has samplePrompt", () => {
      const result = validate(
        SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
        {
          phrases: "",
          elements: [
            {
              samplePrompt: "",
              referenceText: "test",
              audioPath: "",
            },
            {
              samplePrompt: "Hello",
              referenceText: "",
              audioPath: "",
            },
          ],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe("Speech Match validation", () => {
    const mockChoiceElement: ChoiceElement = {
      label: "A",
      speech: {
        mode: "tts",
        lang: "en",
        text: "Hello",
      },
    };

    it("should pass validation with at least one valid choice element (TTS)", () => {
      const result = validate(
        SLIDE_TYPES.SPEECH_MATCH,
        {
          phrases: "",
          elements: [],
          choiceElements: [
            {
              label: "A",
              speech: {
                mode: "tts",
                lang: "en",
                text: "Hello",
              },
            },
          ],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should pass validation with at least one valid choice element (file)", () => {
      const result = validate(
        SLIDE_TYPES.SPEECH_MATCH,
        {
          phrases: "",
          elements: [],
          choiceElements: [
            {
              label: "A",
              speech: {
                mode: "file",
                fileUrl: "https://example.com/audio.mp3",
              },
            },
          ],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should fail validation with no choice elements and no originals", () => {
      const result = validate(
        SLIDE_TYPES.SPEECH_MATCH,
        {
          phrases: "",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Speech Match: add at least 1 choice with a label and TTS text or audio.");
    });

    it("should fail validation with empty choice elements when touched", () => {
      const result = validate(
        SLIDE_TYPES.SPEECH_MATCH,
        {
          phrases: "",
          elements: [],
          choiceElements: [],
        },
        [mockChoiceElement],
        true // touched = true means user intentionally cleared
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Speech Match: add at least 1 choice with a label and TTS text or audio.");
    });

    it("should pass validation with empty choice elements when not touched and originals exist", () => {
      const result = validate(
        SLIDE_TYPES.SPEECH_MATCH,
        {
          phrases: "",
          elements: [],
          choiceElements: [],
        },
        [mockChoiceElement],
        false // not touched = preserve originals
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should fail validation with choice element missing label", () => {
      const result = validate(
        SLIDE_TYPES.SPEECH_MATCH,
        {
          phrases: "",
          elements: [],
          choiceElements: [
            {
              label: "",
              speech: {
                mode: "tts",
                text: "Hello",
              },
            },
          ],
        },
        null,
        false
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Speech Match: add at least 1 choice with a label and TTS text or audio.");
    });

    it("should fail validation with TTS mode but no text", () => {
      const result = validate(
        SLIDE_TYPES.SPEECH_MATCH,
        {
          phrases: "",
          elements: [],
          choiceElements: [
            {
              label: "A",
              speech: {
                mode: "tts",
                text: "",
              },
            },
          ],
        },
        null,
        false
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Speech Match: add at least 1 choice with a label and TTS text or audio.");
    });

    it("should fail validation with file mode but no fileUrl", () => {
      const result = validate(
        SLIDE_TYPES.SPEECH_MATCH,
        {
          phrases: "",
          elements: [],
          choiceElements: [
            {
              label: "A",
              speech: {
                mode: "file",
                fileUrl: "",
              },
            },
          ],
        },
        null,
        false
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Speech Match: add at least 1 choice with a label and TTS text or audio.");
    });

    it("should pass validation with multiple choice elements if at least one is valid", () => {
      const result = validate(
        SLIDE_TYPES.SPEECH_MATCH,
        {
          phrases: "",
          elements: [],
          choiceElements: [
            {
              label: "",
              speech: {
                mode: "tts",
                text: "",
              },
            },
            {
              label: "B",
              speech: {
                mode: "tts",
                text: "World",
              },
            },
          ],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe("Other slide types", () => {
    it("should pass validation for text-slide", () => {
      const result = validate(
        SLIDE_TYPES.TEXT,
        {
          phrases: "",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should pass validation for title-slide", () => {
      const result = validate(
        SLIDE_TYPES.TITLE,
        {
          phrases: "",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should pass validation for lesson-end", () => {
      const result = validate(
        SLIDE_TYPES.LESSON_END,
        {
          phrases: "",
          elements: [],
          choiceElements: [],
        },
        null,
        false
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });
});

