/**
 * Integration tests for slide form save/load flow
 * 
 * Tests the complete flow of loading slide data, managing form state,
 * validating, and saving changes.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSlideFormData } from "../useSlideFormData";
import { useSlideFormState } from "../useSlideFormState";
import { useSlideFormValidation } from "../useSlideFormValidation";
import { useSlideFormSave } from "../useSlideFormSave";
import { loadSlideById } from "../../../data/slides";
import { loadGroupById } from "../../../data/groups";
import { updateSlide } from "../../../data/slides";
import type { Slide } from "../../../domain/slide";
import type { Group } from "../../../domain/group";

// Mock data layer
vi.mock("../../../data/slides");
vi.mock("../../../data/groups");

describe("Slide Form Integration - Save/Load Flow", () => {
  const createMockSlide = (overrides: Partial<Slide> = {}): Slide => ({
    id: "slide-1",
    lessonId: "lesson-1",
    groupId: "group-1",
    orderIndex: 0,
    type: "text-slide",
    propsJson: {
      title: "Original Title",
      subtitle: "Original Subtitle",
      body: "Original Body",
      isInteractive: false,
      allowSkip: false,
      allowRetry: false,
    },
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

  const createMockGroup = (overrides: Partial<Group> = {}): Group => ({
    id: "group-1",
    lessonId: "lesson-1",
    orderIndex: 0,
    label: "Test Group",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Complete Save/Load Flow", () => {
    it("loads slide data, updates form state, validates, and saves successfully", async () => {
      const mockSlide = createMockSlide({
        type: "text-slide",
        propsJson: {
          title: "Test Title",
          subtitle: "Test Subtitle",
          body: "Test Body",
          isInteractive: false,
          allowSkip: false,
          allowRetry: false,
        },
      });

      const mockGroup = createMockGroup();

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      vi.mocked(loadGroupById).mockResolvedValue({
        data: mockGroup,
        error: null,
      });

      vi.mocked(updateSlide).mockResolvedValue({
        data: {
          ...mockSlide,
          propsJson: {
            ...mockSlide.propsJson,
            title: "Updated Title",
          },
        },
        error: null,
      });

      // Step 1: Load data
      const { result: dataResult } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(dataResult.current.loadState.status).toBe("ready");
      });

      expect(dataResult.current.data).not.toBeNull();
      expect(dataResult.current.data?.slide.id).toBe("slide-1");
      expect(dataResult.current.data?.props.title).toBe("Test Title");

      // Step 2: Initialize form state
      const initialValues = {
        slideId: dataResult.current.data!.slide.id,
        slideType: dataResult.current.data!.slide.type,
        groupId: dataResult.current.data!.slide.groupId || "",
        lessonId: dataResult.current.data!.slide.lessonId,
        orderIndex: dataResult.current.data!.slide.orderIndex ?? 0,
        label: "",
        title: dataResult.current.data!.props.title || "",
        subtitle: (dataResult.current.data!.props as { subtitle?: string }).subtitle || "",
        body: (dataResult.current.data!.props as { body?: string }).body || "",
        lessonEndMessage: "",
        lessonEndActions: "",
        buttons: "",
        defaultLang: "",
        audioId: "",
        activityName: "",
        phrases: "",
        instructions: "",
        promptLabel: "",
        onCompleteAtIndex: "",
        elements: [],
        choiceElements: [],
        note: "",
        isInteractive: false,
        allowSkip: false,
        allowRetry: false,
        isActivity: false,
        maxAttempts: "",
        minAttemptsBeforeSkip: "",
      };

      const { result: stateResult } = renderHook(() => useSlideFormState(initialValues));

      expect(stateResult.current.state.title).toBe("Test Title");
      expect(stateResult.current.state.subtitle).toBe("Test Subtitle");
      expect(stateResult.current.hasUnsavedChanges).toBe(false);

      // Step 3: Update form state
      stateResult.current.setters.setTitle("Updated Title");
      stateResult.current.setters.setSubtitle("Updated Subtitle");

      await waitFor(() => {
        expect(stateResult.current.state.title).toBe("Updated Title");
      });

      expect(stateResult.current.hasUnsavedChanges).toBe(true);

      // Step 4: Validate
      const { result: validationResult } = renderHook(() => useSlideFormValidation());

      const validation = validationResult.current.validate(
        stateResult.current.state.slideType,
        {
          phrases: stateResult.current.state.phrases,
          elements: stateResult.current.state.elements,
          choiceElements: stateResult.current.state.choiceElements,
        },
        null, // originalSpeechMatchElements
        false // speechMatchElementsTouched
      );
      expect(validation.valid).toBe(true);
      expect(validation.error).toBeNull();

      // Step 5: Save
      const { result: saveResult } = renderHook(() => useSlideFormSave());

      const saveResponse = await saveResult.current.save(
        stateResult.current.state.slideId,
        stateResult.current.state.slideType,
        stateResult.current.state,
        stateResult.current.state.isActivity,
        null, // originalSpeechMatchElements
        false, // speechMatchElementsTouched
        validation
      );

      expect(saveResponse.success).toBe(true);
      expect(saveResponse.error).toBeNull();
      expect(vi.mocked(updateSlide)).toHaveBeenCalledWith("slide-1", expect.objectContaining({
        props_json: expect.objectContaining({
          title: "Updated Title",
        }),
      }));
    });

    it("handles validation failure and prevents save", async () => {
      const mockSlide = createMockSlide({
        type: "ai-speak-repeat",
        propsJson: {
          lines: [],
          isInteractive: false,
          allowSkip: false,
          allowRetry: false,
        },
      });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      vi.mocked(loadGroupById).mockResolvedValue({
        data: createMockGroup(),
        error: null,
      });

      // Load data
      const { result: dataResult } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(dataResult.current.loadState.status).toBe("ready");
      });

      // Initialize form state with empty phrases (invalid)
      const initialValues = {
        slideId: dataResult.current.data!.slide.id,
        slideType: dataResult.current.data!.slide.type,
        groupId: dataResult.current.data!.slide.groupId || "",
        lessonId: dataResult.current.data!.slide.lessonId,
        orderIndex: dataResult.current.data!.slide.orderIndex ?? 0,
        label: "",
        title: "",
        subtitle: "",
        body: "",
        lessonEndMessage: "",
        lessonEndActions: "",
        buttons: "",
        defaultLang: "",
        audioId: "",
        activityName: "",
        phrases: "", // Empty phrases - invalid for ai-speak-repeat
        instructions: "",
        promptLabel: "",
        onCompleteAtIndex: "",
        elements: [],
        choiceElements: [],
        note: "",
        isInteractive: false,
        allowSkip: false,
        allowRetry: false,
        isActivity: false,
        maxAttempts: "",
        minAttemptsBeforeSkip: "",
      };

      const { result: stateResult } = renderHook(() => useSlideFormState(initialValues));

      // Validate - should fail
      const { result: validationResult } = renderHook(() => useSlideFormValidation());

      const validation = validationResult.current.validate(
        stateResult.current.state.slideType,
        {
          phrases: stateResult.current.state.phrases,
          elements: stateResult.current.state.elements,
          choiceElements: stateResult.current.state.choiceElements,
        },
        null, // originalSpeechMatchElements
        false // speechMatchElementsTouched
      );
      // For ai-speak-repeat, empty phrases should fail validation
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeTruthy();
      expect(validation.error).toContain("phrase");

      // Attempt save - should not call updateSlide
      const { result: saveResult } = renderHook(() => useSlideFormSave());

      const saveResponse = await saveResult.current.save(
        stateResult.current.state.slideId,
        stateResult.current.state.slideType,
        stateResult.current.state,
        stateResult.current.state.isActivity,
        null, // originalSpeechMatchElements
        false, // speechMatchElementsTouched
        validation
      );

      expect(saveResponse.success).toBe(false);
      expect(saveResponse.error).toContain("add at least 1 phrase");
      expect(vi.mocked(updateSlide)).not.toHaveBeenCalled();
    });

    it("tracks unsaved changes correctly through the flow", async () => {
      const mockSlide = createMockSlide({
        type: "text-slide",
        propsJson: {
          title: "Original Title",
          subtitle: "Original Subtitle",
          body: "Original Body",
          isInteractive: false,
          allowSkip: false,
          allowRetry: false,
        },
      });

      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      vi.mocked(loadGroupById).mockResolvedValue({
        data: createMockGroup(),
        error: null,
      });

      // Load data
      const { result: dataResult } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(dataResult.current.loadState.status).toBe("ready");
      });

      // Initialize form state
      const initialValues = {
        slideId: dataResult.current.data!.slide.id,
        slideType: dataResult.current.data!.slide.type,
        groupId: dataResult.current.data!.slide.groupId || "",
        lessonId: dataResult.current.data!.slide.lessonId,
        orderIndex: dataResult.current.data!.slide.orderIndex ?? 0,
        label: "",
        title: dataResult.current.data!.props.title || "",
        subtitle: (dataResult.current.data!.props as { subtitle?: string }).subtitle || "",
        body: (dataResult.current.data!.props as { body?: string }).body || "",
        lessonEndMessage: "",
        lessonEndActions: "",
        buttons: "",
        defaultLang: "",
        audioId: "",
        activityName: "",
        phrases: "",
        instructions: "",
        promptLabel: "",
        onCompleteAtIndex: "",
        elements: [],
        choiceElements: [],
        note: "",
        isInteractive: false,
        allowSkip: false,
        allowRetry: false,
        isActivity: false,
        maxAttempts: "",
        minAttemptsBeforeSkip: "",
      };

      const { result: stateResult } = renderHook(() => useSlideFormState(initialValues));

      // Initially no unsaved changes
      expect(stateResult.current.hasUnsavedChanges).toBe(false);

      // Make a change
      stateResult.current.setters.setTitle("Changed Title");

      await waitFor(() => {
        expect(stateResult.current.hasUnsavedChanges).toBe(true);
      });

      // Revert change
      stateResult.current.setters.setTitle("Original Title");

      await waitFor(() => {
        expect(stateResult.current.hasUnsavedChanges).toBe(false);
      });
    });

    it("provides reload function that can be called", async () => {
      const mockSlide = createMockSlide({
        type: "text-slide",
        propsJson: {
          title: "Test Title",
          subtitle: "Test Subtitle",
          body: "Test Body",
          isInteractive: false,
          allowSkip: false,
          allowRetry: false,
        },
      });

      const mockGroup = createMockGroup();

      // Set up mocks
      vi.mocked(loadSlideById).mockResolvedValue({
        data: mockSlide,
        error: null,
      });

      vi.mocked(loadGroupById).mockResolvedValue({
        data: mockGroup,
        error: null,
      });

      // Load data
      const { result: dataResult } = renderHook(() => useSlideFormData("slide-1"));

      await waitFor(() => {
        expect(dataResult.current.loadState.status).toBe("ready");
      });

      // Verify reload function exists and can be called without error
      expect(typeof dataResult.current.reload).toBe("function");
      
      // Call reload - should not throw
      expect(() => {
        dataResult.current.reload();
      }).not.toThrow();

      // Verify data is still accessible after reload call
      expect(dataResult.current.data).not.toBeNull();
    });
  });
});

