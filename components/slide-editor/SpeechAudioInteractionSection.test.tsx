/**
 * Tests for SpeechAudioInteractionSection component
 * 
 * Tests speech and audio interaction fields rendering and conditional display.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpeechAudioInteractionSection } from "./SpeechAudioInteractionSection";
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
      <button onClick={() => onElementsChange && onElementsChange([])}>Clear</button>
    </div>
  ),
}));

vi.mock("../ui/ChoiceElementMapper", () => ({
  default: ({ elements, onElementsChange }: any) => (
    <div data-testid="choice-element-mapper">
      <div>Choice Element Mapper</div>
      <div data-testid="elements-count">{elements?.length || 0}</div>
      <button onClick={() => onElementsChange && onElementsChange([])}>Clear</button>
    </div>
  ),
}));

describe("SpeechAudioInteractionSection", () => {
  const defaultProps = {
    slideType: "ai-speak-repeat",
    phrases: "",
    elements: [],
    choiceElements: [],
    defaultLang: "en",
    onPhrasesChange: vi.fn(),
    onElementsChange: vi.fn(),
    onChoiceElementsChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Conditional Rendering", () => {
    it("renders for ai-speak-repeat slide type", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.getByText("Speech & Audio Interaction")).toBeInTheDocument();
    });

    it("renders for ai-speak-student-repeat slide type", () => {
      render(
        <SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />
      );
      expect(screen.getByText("Practice Elements")).toBeInTheDocument();
    });

    it("renders for speech-match slide type", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="speech-match" />);
      expect(screen.getByText("Choice Elements")).toBeInTheDocument();
    });

    it("does not render for title-slide", () => {
      const { container } = render(
        <SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.TITLE} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for text-slide", () => {
      const { container } = render(
        <SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.TEXT} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders for lesson-end slide (falls through to default)", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />);
      // Lesson-end falls through to the default AI_SPEAK_REPEAT case
      expect(screen.getByText("Speech & Audio Interaction")).toBeInTheDocument();
    });
  });

  describe("AI Speak Repeat - Phrases", () => {
    it("renders section with correct title", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.getByText("Speech & Audio Interaction")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.getByText("Speech and audio interaction content")).toBeInTheDocument();
    });

    it("renders phrases field", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.getByText("Phrases")).toBeInTheDocument();
    });

    it("displays empty phrases value", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="ai-speak-repeat" phrases="" />);
      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveValue("");
    });

    it("displays phrases value", () => {
      const phrasesValue = "Hello\nWorld";
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="ai-speak-repeat" phrases={phrasesValue} />);
      const textarea = screen.getByTestId("textarea") as HTMLTextAreaElement;
      // Textarea values preserve newlines - check that both words are present
      expect(textarea.value).toContain("Hello");
      expect(textarea.value).toContain("World");
      expect(textarea.value.length).toBeGreaterThan("HelloWorld".length); // Should have newline
    });

    it("calls onPhrasesChange when phrases are changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SpeechAudioInteractionSection
          {...defaultProps}
          slideType="ai-speak-repeat"
          phrases=""
          onPhrasesChange={onChange}
        />
      );

      const textarea = screen.getByTestId("textarea");
      await user.type(textarea, "New phrase");

      expect(onChange).toHaveBeenCalled();
    });

    it("displays meta text", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.getByText("[ai-speak]")).toBeInTheDocument();
    });
  });

  describe("AI Speak Student Repeat - Practice Elements", () => {
    it("renders section with correct title", () => {
      render(
        <SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />
      );
      expect(screen.getByText("Practice Elements")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(
        <SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />
      );
      expect(screen.getByText("Practice elements for student pronunciation drills")).toBeInTheDocument();
    });

    it("renders elements field", () => {
      render(
        <SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />
      );
      expect(screen.getByText("Elements")).toBeInTheDocument();
    });

    it("renders StudentRepeatElementMapper", async () => {
      render(
        <SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />
      );
      await waitFor(() => {
        expect(screen.getByTestId("student-repeat-mapper")).toBeInTheDocument();
      });
    });

    it("displays elements count", async () => {
      render(
        <SpeechAudioInteractionSection
          {...defaultProps}
          slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT}
          elements={[{ samplePrompt: "Test", referenceText: "", audioPath: "" }]}
        />
      );
      await waitFor(() => {
        expect(screen.getByTestId("elements-count")).toHaveTextContent("1");
      });
    });

    it("displays meta text", () => {
      render(
        <SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />
      );
      expect(screen.getByText(/Each element represents a practice item/)).toBeInTheDocument();
    });
  });

  describe("Speech Match - Choice Elements", () => {
    it("renders section with correct title", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="speech-match" />);
      expect(screen.getByText("Choice Elements")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="speech-match" />);
      expect(screen.getByText("Choice options for student selection")).toBeInTheDocument();
    });

    it("renders elements field", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="speech-match" />);
      expect(screen.getByText("Elements")).toBeInTheDocument();
    });

    it("renders ChoiceElementMapper", async () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="speech-match" />);
      await waitFor(() => {
        expect(screen.getByTestId("choice-element-mapper")).toBeInTheDocument();
      });
    });

    it("displays elements count", async () => {
      render(
        <SpeechAudioInteractionSection
          {...defaultProps}
          slideType="speech-match"
          choiceElements={[{ label: "Test", speech: { mode: "tts", text: "Test" } }]}
        />
      );
      await waitFor(() => {
        expect(screen.getByTestId("elements-count")).toHaveTextContent("1");
      });
    });

    it("displays meta text", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="speech-match" />);
      expect(screen.getByText(/Each element represents a choice option/)).toBeInTheDocument();
    });
  });

  describe("Info Tooltips", () => {
    it("displays tooltip for Phrases", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="ai-speak-repeat" />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Phrases for speech recognition"))).toBe(true);
    });

    it("displays tooltip for Practice Elements", () => {
      render(
        <SpeechAudioInteractionSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />
      );
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Practice elements"))).toBe(true);
    });

    it("displays tooltip for Choice Elements", () => {
      render(<SpeechAudioInteractionSection {...defaultProps} slideType="speech-match" />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Choice elements"))).toBe(true);
    });
  });
});

