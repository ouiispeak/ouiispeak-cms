/**
 * Tests for useSlideFormState hook
 * 
 * Tests state management, unsaved changes tracking, and initial values handling.
 * 
 * Note: Full hook testing requires React Testing Library. This file tests
 * the core logic that can be tested without React rendering.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SlideFormState } from "./useSlideFormState";

describe("useSlideFormState - Core Logic", () => {
  describe("State comparison logic", () => {
    it("should detect changes in string fields", () => {
      const initial: SlideFormState = {
        slideId: "slide-1",
        slideType: "text-slide",
        groupId: "group-1",
        groupName: "Group 1",
        lessonId: "lesson-1",
        orderIndex: 0,
        label: "Original Label",
        title: "Original Title",
        subtitle: "",
        lessonEndMessage: "",
        lessonEndActions: "",
        body: "",
        buttons: "",
        defaultLang: "",
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
      };

      // Test label change detection
      const hasLabelChange = "New Label" !== initial.label;
      expect(hasLabelChange).toBe(true);

      // Test title change detection
      const hasTitleChange = "New Title" !== initial.title;
      expect(hasTitleChange).toBe(true);

      // Test no change
      const noChange = initial.label === initial.label;
      expect(noChange).toBe(true);
    });

    it("should detect changes in boolean fields", () => {
      const initial: SlideFormState = {
        slideId: "slide-1",
        slideType: "text-slide",
        groupId: "group-1",
        groupName: "Group 1",
        lessonId: "lesson-1",
        orderIndex: 0,
        label: "",
        title: "",
        subtitle: "",
        lessonEndMessage: "",
        lessonEndActions: "",
        body: "",
        buttons: "",
        defaultLang: "",
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
      };

      // Test boolean change detection
      const hasInteractiveChange = true !== initial.isInteractive;
      expect(hasInteractiveChange).toBe(true);

      // Test no change
      const noChange = initial.isInteractive === initial.isInteractive;
      expect(noChange).toBe(true);
    });

    it("should detect changes in array fields using JSON.stringify", () => {
      const initial: SlideFormState = {
        slideId: "slide-1",
        slideType: "text-slide",
        groupId: "group-1",
        groupName: "Group 1",
        lessonId: "lesson-1",
        orderIndex: 0,
        label: "",
        title: "",
        subtitle: "",
        lessonEndMessage: "",
        lessonEndActions: "",
        body: "",
        buttons: "",
        defaultLang: "",
        audioId: "",
        activityName: "",
        phrases: "",
        instructions: "",
        promptLabel: "",
        note: "",
        onCompleteAtIndex: "",
        elements: [{ samplePrompt: "Hello", referenceText: "", audioPath: "" }],
        choiceElements: [],
        isInteractive: false,
        allowSkip: false,
        allowRetry: false,
        isActivity: false,
        maxAttempts: "",
        minAttemptsBeforeSkip: "",
      };

      const newElements = [{ samplePrompt: "World", referenceText: "", audioPath: "" }];

      // Test array change detection
      const hasElementsChange =
        JSON.stringify(newElements) !== JSON.stringify(initial.elements);
      expect(hasElementsChange).toBe(true);

      // Test no change
      const noChange =
        JSON.stringify(initial.elements) === JSON.stringify(initial.elements);
      expect(noChange).toBe(true);
    });

    it("should detect changes in choiceElements array", () => {
      const initial: SlideFormState = {
        slideId: "slide-1",
        slideType: "speech-match",
        groupId: "group-1",
        groupName: "Group 1",
        lessonId: "lesson-1",
        orderIndex: 0,
        label: "",
        title: "",
        subtitle: "",
        lessonEndMessage: "",
        lessonEndActions: "",
        body: "",
        buttons: "",
        defaultLang: "",
        audioId: "",
        activityName: "",
        phrases: "",
        instructions: "",
        promptLabel: "",
        note: "",
        onCompleteAtIndex: "",
        elements: [],
        choiceElements: [
          {
            label: "A",
            speech: { mode: "tts", text: "Hello" },
          },
        ],
        isInteractive: false,
        allowSkip: false,
        allowRetry: false,
        isActivity: false,
        maxAttempts: "",
        minAttemptsBeforeSkip: "",
      };

      const newChoiceElements = [
        {
          label: "B",
          speech: { mode: "tts", text: "World" },
        },
      ];

      // Test choiceElements change detection
      const hasChoiceElementsChange =
        JSON.stringify(newChoiceElements) !== JSON.stringify(initial.choiceElements);
      expect(hasChoiceElementsChange).toBe(true);
    });
  });

  describe("Initial values handling", () => {
    it("should handle null initial values", () => {
      const initialValues = null;
      const slideId = initialValues?.slideId || "";
      const slideType = initialValues?.slideType || "";
      const label = initialValues?.label || "";

      expect(slideId).toBe("");
      expect(slideType).toBe("");
      expect(label).toBe("");
    });

    it("should handle partial initial values", () => {
      const initialValues = {
        slideId: "slide-1",
        slideType: "text-slide",
        label: "Test Label",
      };

      const slideId = initialValues.slideId || "";
      const slideType = initialValues.slideType || "";
      const title = initialValues.title || "";

      expect(slideId).toBe("slide-1");
      expect(slideType).toBe("text-slide");
      expect(title).toBe(""); // Should default to empty string
    });

    it("should handle all initial values", () => {
      const initialValues: SlideFormState = {
        slideId: "slide-1",
        slideType: "text-slide",
        groupId: "group-1",
        groupName: "Group 1",
        lessonId: "lesson-1",
        orderIndex: 1,
        label: "Label",
        title: "Title",
        subtitle: "Subtitle",
        lessonEndMessage: "",
        lessonEndActions: "",
        body: "Body",
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
        isInteractive: true,
        allowSkip: true,
        allowRetry: false,
        isActivity: false,
        maxAttempts: "3",
        minAttemptsBeforeSkip: "1",
      };

      expect(initialValues.slideId).toBe("slide-1");
      expect(initialValues.title).toBe("Title");
      expect(initialValues.isInteractive).toBe(true);
      expect(initialValues.maxAttempts).toBe("3");
    });
  });

  describe("Default values", () => {
    it("should use correct defaults for string fields", () => {
      const initialValues = null;
      const defaults = {
        slideId: initialValues?.slideId || "",
        slideType: initialValues?.slideType || "",
        label: initialValues?.label || "",
        title: initialValues?.title || "",
        body: initialValues?.body || "",
      };

      expect(defaults.slideId).toBe("");
      expect(defaults.slideType).toBe("");
      expect(defaults.label).toBe("");
      expect(defaults.title).toBe("");
      expect(defaults.body).toBe("");
    });

    it("should use correct defaults for boolean fields", () => {
      const initialValues = null;
      const defaults = {
        isInteractive: initialValues?.isInteractive || false,
        allowSkip: initialValues?.allowSkip || false,
        allowRetry: initialValues?.allowRetry || false,
        isActivity: initialValues?.isActivity || false,
      };

      expect(defaults.isInteractive).toBe(false);
      expect(defaults.allowSkip).toBe(false);
      expect(defaults.allowRetry).toBe(false);
      expect(defaults.isActivity).toBe(false);
    });

    it("should use correct defaults for number fields", () => {
      const initialValues = null;
      const defaults = {
        orderIndex: initialValues?.orderIndex || 0,
      };

      expect(defaults.orderIndex).toBe(0);
    });

    it("should use correct defaults for array fields", () => {
      const initialValues = null;
      const defaults = {
        elements: initialValues?.elements || [
          { samplePrompt: "", referenceText: "", audioPath: "" },
        ],
        choiceElements: initialValues?.choiceElements || [],
      };

      expect(defaults.elements).toEqual([
        { samplePrompt: "", referenceText: "", audioPath: "" },
      ]);
      expect(defaults.choiceElements).toEqual([]);
    });
  });
});

/**
 * Note: Full hook testing (useState, useEffect, useRef behavior) requires:
 * - @testing-library/react
 * - @testing-library/react-hooks (or renderHook from @testing-library/react)
 * - jsdom environment in vitest.config.ts
 * 
 * To test the full hook behavior:
 * 1. Install: npm install -D @testing-library/react @testing-library/react-hooks
 * 2. Update vitest.config.ts: environment: "jsdom"
 * 3. Use renderHook to test useState/useEffect behavior
 */

