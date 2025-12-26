/**
 * Tests for SlideTypeSpecificContentSection component
 * 
 * Tests slide-type-specific content fields rendering and conditional display.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlideTypeSpecificContentSection } from "./SlideTypeSpecificContentSection";
import { SLIDE_TYPES } from "../../lib/types/slideProps";

// Mock UI components
vi.mock("../ui/CmsSection", () => ({
  default: ({ title, description, children }: any) => (
    <div data-testid="cms-section">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  ),
}));

vi.mock("../ui/FormField", () => ({
  default: ({ label, infoTooltip, children }: any) => (
    <div data-testid="form-field">
      <label>{label}</label>
      {infoTooltip && <span data-testid="tooltip">{infoTooltip}</span>}
      {children}
    </div>
  ),
}));

vi.mock("../ui/Input", () => ({
  default: ({ value, onChange, type, placeholder }: any) => (
    <input
      data-testid="input"
      type={type || "text"}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

vi.mock("../ui/Textarea", () => ({
  default: ({ value, onChange, placeholder, rows }: any) => (
    <textarea
      data-testid="textarea"
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
  ),
}));

vi.mock("../ui/StudentRepeatElementMapper", () => ({
  default: ({ elements, onElementsChange }: any) => (
    <div data-testid="student-repeat-mapper">
      <div>Student Repeat Element Mapper</div>
      <div data-testid="elements-count">{elements?.length || 0}</div>
    </div>
  ),
}));

vi.mock("../ui/ChoiceElementMapper", () => ({
  default: ({ elements, onElementsChange }: any) => (
    <div data-testid="choice-element-mapper">
      <div>Choice Element Mapper</div>
      <div data-testid="elements-count">{elements?.length || 0}</div>
    </div>
  ),
}));

describe("SlideTypeSpecificContentSection", () => {
  const defaultProps = {
    slideType: "ai-speak-student-repeat",
    instructions: "",
    promptLabel: "",
    title: "",
    subtitle: "",
    note: "",
    phrases: "",
    elements: [],
    choiceElements: [],
    defaultLang: "en",
    onInstructionsChange: vi.fn(),
    onPromptLabelChange: vi.fn(),
    onTitleChange: vi.fn(),
    onSubtitleChange: vi.fn(),
    onNoteChange: vi.fn(),
    onPhrasesChange: vi.fn(),
    onElementsChange: vi.fn(),
    onChoiceElementsChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Conditional Rendering", () => {
    it("renders for ai-speak-student-repeat slide type", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />);
      expect(screen.getByText("Core Content")).toBeInTheDocument();
    });

    it("renders for speech-match slide type", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      expect(screen.getByText("Core Content")).toBeInTheDocument();
    });

    it("does not render for text-slide", () => {
      const { container } = render(
        <SlideTypeSpecificContentSection {...defaultProps} slideType="text-slide" />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for title-slide", () => {
      const { container } = render(
        <SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.TITLE} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for lesson-end slide", () => {
      const { container } = render(
        <SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for ai-speak-repeat", () => {
      const { container } = render(
        <SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_REPEAT} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("AI Speak Student Repeat - Specific Fields", () => {
    it("renders section with correct title", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />);
      expect(screen.getByText("Core Content")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />);
      expect(screen.getByText("Main content shown to learners")).toBeInTheDocument();
    });

    it("renders instructions field", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />);
      expect(screen.getByText("Instructions")).toBeInTheDocument();
    });

    it("renders prompt label field", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />);
      expect(screen.getByText("Prompt Label")).toBeInTheDocument();
    });

    it("displays empty instructions", () => {
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT}
          instructions=""
        />
      );
      const textarea = screen.getByPlaceholderText("Enter instructions for learners");
      expect(textarea).toHaveValue("");
    });

    it("displays instructions value", () => {
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT}
          instructions="Test instructions"
        />
      );
      const textarea = screen.getByPlaceholderText("Enter instructions for learners");
      expect(textarea).toHaveValue("Test instructions");
    });

    it("calls onInstructionsChange when instructions are changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT}
          instructions=""
          onInstructionsChange={onChange}
        />
      );

      const textarea = screen.getByPlaceholderText("Enter instructions for learners");
      await user.type(textarea, "New instructions");

      expect(onChange).toHaveBeenCalled();
    });

    it("displays empty promptLabel", () => {
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT}
          promptLabel=""
        />
      );
      const input = screen.getByPlaceholderText("Phrase à prononcer");
      expect(input).toHaveValue("");
    });

    it("displays promptLabel value", () => {
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT}
          promptLabel="Test Label"
        />
      );
      const input = screen.getByPlaceholderText("Phrase à prononcer");
      expect(input).toHaveValue("Test Label");
    });

    it("calls onPromptLabelChange when promptLabel is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT}
          promptLabel=""
          onPromptLabelChange={onChange}
        />
      );

      const input = screen.getByPlaceholderText("Phrase à prononcer");
      await user.type(input, "New Label");

      expect(onChange).toHaveBeenCalled();
    });

    it("displays meta text for instructions", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />);
      // There should be 2 meta texts for instructions and promptLabel
      const metaTexts = screen.getAllByText("[ai-speak-student-repeat]");
      expect(metaTexts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Speech Match - Specific Fields", () => {
    it("renders section with correct title", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      expect(screen.getByText("Core Content")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      expect(screen.getByText("Main content shown to learners")).toBeInTheDocument();
    });

    it("renders title field", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("renders subtitle field", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      expect(screen.getByText("Subtitle")).toBeInTheDocument();
    });

    it("renders note field", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      expect(screen.getByText("Note")).toBeInTheDocument();
    });

    it("displays empty title", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} title="" />);
      const input = screen.getByPlaceholderText("Enter slide title");
      expect(input).toHaveValue("");
    });

    it("displays title value", () => {
      render(
        <SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} title="Test Title" />
      );
      const input = screen.getByPlaceholderText("Enter slide title");
      expect(input).toHaveValue("Test Title");
    });

    it("calls onTitleChange when title is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.SPEECH_MATCH}
          title=""
          onTitleChange={onChange}
        />
      );

      const input = screen.getByPlaceholderText("Enter slide title");
      await user.type(input, "New Title");

      expect(onChange).toHaveBeenCalled();
    });

    it("displays empty subtitle", () => {
      render(
        <SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} subtitle="" />
      );
      const input = screen.getByPlaceholderText("Écoute et clique sur la lettre que tu entends");
      expect(input).toHaveValue("");
    });

    it("displays subtitle value", () => {
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.SPEECH_MATCH}
          subtitle="Test Subtitle"
        />
      );
      const input = screen.getByPlaceholderText("Écoute et clique sur la lettre que tu entends");
      expect(input).toHaveValue("Test Subtitle");
    });

    it("calls onSubtitleChange when subtitle is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.SPEECH_MATCH}
          subtitle=""
          onSubtitleChange={onChange}
        />
      );

      const input = screen.getByPlaceholderText("Écoute et clique sur la lettre que tu entends");
      await user.type(input, "New Subtitle");

      expect(onChange).toHaveBeenCalled();
    });

    it("displays empty note", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} note="" />);
      const input = screen.getByPlaceholderText("Optional note");
      expect(input).toHaveValue("");
    });

    it("displays note value", () => {
      render(
        <SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} note="Test Note" />
      );
      const input = screen.getByPlaceholderText("Optional note");
      expect(input).toHaveValue("Test Note");
    });

    it("calls onNoteChange when note is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SlideTypeSpecificContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.SPEECH_MATCH}
          note=""
          onNoteChange={onChange}
        />
      );

      const input = screen.getByPlaceholderText("Optional note");
      await user.type(input, "New Note");

      expect(onChange).toHaveBeenCalled();
    });

    it("displays meta text for speech-match fields", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      // There should be 3 meta texts for title, subtitle, and note
      const metaTexts = screen.getAllByText("[speech-match]");
      expect(metaTexts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Info Tooltips", () => {
    it("displays tooltip for Instructions", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Optional instructions"))).toBe(true);
    });

    it("displays tooltip for Prompt Label", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Label displayed above"))).toBe(true);
    });

    it("displays tooltip for Title (speech-match)", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Primary heading"))).toBe(true);
    });

    it("displays tooltip for Subtitle (speech-match)", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Instructions shown"))).toBe(true);
    });

    it("displays tooltip for Note (speech-match)", () => {
      render(<SlideTypeSpecificContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Optional note"))).toBe(true);
    });
  });
});

