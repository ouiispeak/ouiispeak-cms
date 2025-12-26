/**
 * Tests for CoreContentSection component
 * 
 * Tests core content fields rendering and conditional display based on slide type.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoreContentSection } from "./CoreContentSection";
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

describe("CoreContentSection", () => {
  const defaultProps = {
    slideType: "text-slide",
    title: "",
    subtitle: "",
    body: "",
    lessonEndMessage: "",
    lessonEndActions: "",
    buttons: "",
    instructions: "",
    promptLabel: "",
    note: "",
    onTitleChange: vi.fn(),
    onSubtitleChange: vi.fn(),
    onBodyChange: vi.fn(),
    onLessonEndMessageChange: vi.fn(),
    onLessonEndActionsChange: vi.fn(),
    onButtonsChange: vi.fn(),
    onInstructionsChange: vi.fn(),
    onPromptLabelChange: vi.fn(),
    onNoteChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Conditional Rendering", () => {
    it("renders for text-slide", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" />);
      expect(screen.getByText("Core Content")).toBeInTheDocument();
    });

    it("renders for title-slide", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.TITLE} />);
      expect(screen.getByText("Core Content")).toBeInTheDocument();
    });

    it("renders for lesson-end slide", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />);
      expect(screen.getByText("Core Content")).toBeInTheDocument();
    });

    it("does not render for ai-speak-repeat", () => {
      const { container } = render(
        <CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_REPEAT} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for ai-speak-student-repeat", () => {
      const { container } = render(
        <CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for speech-match", () => {
      const { container } = render(
        <CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.SPEECH_MATCH} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Rendering", () => {
    it("renders section with correct title", () => {
      render(<CoreContentSection {...defaultProps} />);
      expect(screen.getByText("Core Content")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<CoreContentSection {...defaultProps} />);
      expect(screen.getByText("Main content shown to learners")).toBeInTheDocument();
    });

    it("always renders title field", () => {
      render(<CoreContentSection {...defaultProps} />);
      expect(screen.getByText("Title")).toBeInTheDocument();
    });
  });

  describe("Title Field", () => {
    it("displays empty title", () => {
      render(<CoreContentSection {...defaultProps} title="" />);
      const input = screen.getByPlaceholderText("Enter slide title");
      expect(input).toHaveValue("");
    });

    it("displays title value", () => {
      render(<CoreContentSection {...defaultProps} title="Test Title" />);
      const input = screen.getByPlaceholderText("Enter slide title");
      expect(input).toHaveValue("Test Title");
    });

    it("calls onTitleChange when title is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CoreContentSection {...defaultProps} title="" onTitleChange={onChange} />);

      const input = screen.getByPlaceholderText("Enter slide title");
      await user.type(input, "New Title");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Lesson End Slide Fields", () => {
    it("renders message field for lesson-end slide", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />);
      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("renders actions field for lesson-end slide", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />);
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("does not render subtitle for lesson-end slide", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />);
      expect(screen.queryByText("Subtitle")).not.toBeInTheDocument();
    });

    it("displays empty lessonEndMessage", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} lessonEndMessage="" />);
      const textarea = screen.getByPlaceholderText("Enter lesson end message");
      expect(textarea).toHaveValue("");
    });

    it("displays lessonEndMessage value", () => {
      render(
        <CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} lessonEndMessage="End message" />
      );
      const textarea = screen.getByPlaceholderText("Enter lesson end message");
      expect(textarea).toHaveValue("End message");
    });

    it("calls onLessonEndMessageChange when message is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CoreContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.LESSON_END}
          lessonEndMessage=""
          onLessonEndMessageChange={onChange}
        />
      );

      const textarea = screen.getByPlaceholderText("Enter lesson end message");
      await user.type(textarea, "New message");

      expect(onChange).toHaveBeenCalled();
    });

    it("displays empty lessonEndActions", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} lessonEndActions="" />);
      const textarea = screen.getByPlaceholderText(/\[{"type": "restart"/);
      expect(textarea).toHaveValue("");
    });

    it("calls onLessonEndActionsChange when actions are changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CoreContentSection
          {...defaultProps}
          slideType={SLIDE_TYPES.LESSON_END}
          lessonEndActions=""
          onLessonEndActionsChange={onChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/\[{"type": "restart"/);
      await user.clear(textarea);
      await user.type(textarea, "test");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Non-Lesson-End Slide Fields", () => {
    it("renders subtitle field for non-lesson-end slides", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" />);
      expect(screen.getByText("Subtitle")).toBeInTheDocument();
    });

    it("displays empty subtitle", () => {
      render(<CoreContentSection {...defaultProps} subtitle="" />);
      const input = screen.getByPlaceholderText("Enter slide subtitle");
      expect(input).toHaveValue("");
    });

    it("displays subtitle value", () => {
      render(<CoreContentSection {...defaultProps} subtitle="Test Subtitle" />);
      const input = screen.getByPlaceholderText("Enter slide subtitle");
      expect(input).toHaveValue("Test Subtitle");
    });

    it("calls onSubtitleChange when subtitle is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CoreContentSection {...defaultProps} subtitle="" onSubtitleChange={onChange} />);

      const input = screen.getByPlaceholderText("Enter slide subtitle");
      await user.type(input, "New Subtitle");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Body Field", () => {
    it("renders body field for non-title, non-lesson-end slides", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" />);
      expect(screen.getByText("Body")).toBeInTheDocument();
    });

    it("does not render body for title-slide", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.TITLE} />);
      expect(screen.queryByText("Body")).not.toBeInTheDocument();
    });

    it("does not render body for lesson-end slide", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />);
      expect(screen.queryByText("Body")).not.toBeInTheDocument();
    });

    it("displays empty body", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" body="" />);
      const textarea = screen.getByPlaceholderText("Enter slide body text");
      expect(textarea).toHaveValue("");
    });

    it("displays body value", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" body="Body text" />);
      const textarea = screen.getByPlaceholderText("Enter slide body text");
      expect(textarea).toHaveValue("Body text");
    });

    it("calls onBodyChange when body is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CoreContentSection {...defaultProps} slideType="text-slide" body="" onBodyChange={onChange} />);

      const textarea = screen.getByPlaceholderText("Enter slide body text");
      await user.type(textarea, "New body");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Buttons Field", () => {
    it("renders buttons field for all slide types", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" />);
      expect(screen.getByText("Buttons")).toBeInTheDocument();
    });

    it("renders buttons field for title-slide", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.TITLE} />);
      expect(screen.getByText("Buttons")).toBeInTheDocument();
    });

    it("renders buttons field for lesson-end slide", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />);
      expect(screen.getByText("Buttons")).toBeInTheDocument();
    });

    it("displays empty buttons", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" buttons="" />);
      const textarea = screen.getByPlaceholderText(/Enter button configuration/);
      expect(textarea).toHaveValue("");
    });

    it("displays buttons value", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" buttons='[{"type":"next"}]' />);
      const textarea = screen.getByPlaceholderText(/Enter button configuration/);
      expect(textarea).toHaveValue('[{"type":"next"}]');
    });

    it("calls onButtonsChange when buttons are changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CoreContentSection {...defaultProps} slideType="text-slide" buttons="" onButtonsChange={onChange} />);

      const textarea = screen.getByPlaceholderText(/Enter button configuration/);
      await user.type(textarea, "test");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Info Tooltips", () => {
    it("displays tooltip for Title", () => {
      render(<CoreContentSection {...defaultProps} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Primary heading"))).toBe(true);
    });

    it("displays tooltip for Subtitle", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Secondary heading"))).toBe(true);
    });

    it("displays tooltip for Body", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Main slide copy"))).toBe(true);
    });

    it("displays tooltip for Message (lesson-end)", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Message text"))).toBe(true);
    });
  });

  describe("Meta Text", () => {
    it("displays meta text for title field", () => {
      render(<CoreContentSection {...defaultProps} />);
      const metaTexts = screen.getAllByText("[title]");
      expect(metaTexts.length).toBeGreaterThan(0);
    });

    it("displays meta text for lesson-end message", () => {
      render(<CoreContentSection {...defaultProps} slideType={SLIDE_TYPES.LESSON_END} />);
      expect(screen.getByText("[lesson-end]")).toBeInTheDocument();
    });

    it("displays meta text for body field", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" />);
      expect(screen.getByText("[text]")).toBeInTheDocument();
    });

    it("displays meta text for buttons field", () => {
      render(<CoreContentSection {...defaultProps} slideType="text-slide" />);
      expect(screen.getByText("[title, text, ai-speak]")).toBeInTheDocument();
    });
  });
});

