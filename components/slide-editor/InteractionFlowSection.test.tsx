/**
 * Tests for InteractionFlowSection component
 * 
 * Tests interaction flow fields rendering and conditional display.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InteractionFlowSection } from "./InteractionFlowSection";
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
  default: ({ value, onChange, type, placeholder, min, step }: any) => (
    <input
      data-testid="input"
      type={type || "text"}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      step={step}
    />
  ),
}));

describe("InteractionFlowSection", () => {
  const defaultProps = {
    slideType: "ai-speak-repeat",
    maxAttempts: "",
    minAttemptsBeforeSkip: "",
    onCompleteAtIndex: "",
    onMaxAttemptsChange: vi.fn(),
    onMinAttemptsBeforeSkipChange: vi.fn(),
    onOnCompleteAtIndexChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Conditional Rendering", () => {
    it("renders for ai-speak-repeat slide type", () => {
      render(<InteractionFlowSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.getByText("Interaction/Flow")).toBeInTheDocument();
    });

    it("renders for speech-match slide type", () => {
      render(<InteractionFlowSection {...defaultProps} slideType="speech-match" />);
      expect(screen.getByText("Interaction/Flow")).toBeInTheDocument();
    });

    it("does not render for title-slide", () => {
      const { container } = render(
        <InteractionFlowSection {...defaultProps} slideType={SLIDE_TYPES.TITLE} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for text-slide", () => {
      const { container } = render(
        <InteractionFlowSection {...defaultProps} slideType={SLIDE_TYPES.TEXT} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Rendering", () => {
    it("renders section with correct title", () => {
      render(<InteractionFlowSection {...defaultProps} />);
      expect(screen.getByText("Interaction/Flow")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<InteractionFlowSection {...defaultProps} />);
      expect(screen.getByText("Attempt limits and skip behavior")).toBeInTheDocument();
    });

    it("renders max attempts field", () => {
      render(<InteractionFlowSection {...defaultProps} />);
      expect(screen.getByText("Max attempts")).toBeInTheDocument();
    });

    it("renders min attempts before skip field", () => {
      render(<InteractionFlowSection {...defaultProps} />);
      expect(screen.getByText("Min attempts before skip")).toBeInTheDocument();
    });
  });

  describe("On Complete At Index Field", () => {
    it("renders for ai-speak-student-repeat slide type", () => {
      render(
        <InteractionFlowSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} />
      );
      expect(screen.getByText("On Complete At Index")).toBeInTheDocument();
    });

    it("does not render for other slide types", () => {
      render(<InteractionFlowSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.queryByText("On Complete At Index")).not.toBeInTheDocument();
    });

    it("displays empty value", () => {
      render(
        <InteractionFlowSection {...defaultProps} slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT} onCompleteAtIndex="" />
      );
      const inputs = screen.getAllByTestId("input");
      const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
      expect(numberInputs.length).toBeGreaterThan(0);
    });

    it("calls onOnCompleteAtIndexChange when value changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <InteractionFlowSection
          {...defaultProps}
          slideType={SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT}
          onCompleteAtIndex=""
          onOnCompleteAtIndexChange={onChange}
        />
      );

      const inputs = screen.getAllByTestId("input");
      const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
      if (numberInputs.length > 0) {
        await user.type(numberInputs[0], "2");
        expect(onChange).toHaveBeenCalled();
      }
    });
  });

  describe("Max Attempts Field", () => {
    it("renders number input", () => {
      render(<InteractionFlowSection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
      expect(numberInputs.length).toBeGreaterThan(0);
    });

    it("calls onMaxAttemptsChange when value changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<InteractionFlowSection {...defaultProps} maxAttempts="" onMaxAttemptsChange={onChange} />);

      const inputs = screen.getAllByTestId("input");
      const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
      // Find the max attempts input (usually the last one or second to last)
      const maxAttemptsInput = numberInputs[numberInputs.length - 2] || numberInputs[numberInputs.length - 1];
      if (maxAttemptsInput) {
        await user.type(maxAttemptsInput, "5");
        expect(onChange).toHaveBeenCalled();
      }
    });
  });

  describe("Min Attempts Before Skip Field", () => {
    it("renders number input", () => {
      render(<InteractionFlowSection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
      expect(numberInputs.length).toBeGreaterThan(0);
    });

    it("calls onMinAttemptsBeforeSkipChange when value changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <InteractionFlowSection
          {...defaultProps}
          minAttemptsBeforeSkip=""
          onMinAttemptsBeforeSkipChange={onChange}
        />
      );

      const inputs = screen.getAllByTestId("input");
      const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
      // Find the min attempts input (usually the last one)
      const minAttemptsInput = numberInputs[numberInputs.length - 1];
      if (minAttemptsInput) {
        await user.type(minAttemptsInput, "3");
        expect(onChange).toHaveBeenCalled();
      }
    });
  });

  describe("Validation", () => {
    it("displays error when min attempts exceeds max attempts", () => {
      render(
        <InteractionFlowSection
          {...defaultProps}
          maxAttempts="5"
          minAttemptsBeforeSkip="6"
        />
      );
      expect(
        screen.getByText("Min attempts before skip cannot exceed max attempts.")
      ).toBeInTheDocument();
    });

    it("does not display error when min attempts is less than max attempts", () => {
      render(
        <InteractionFlowSection
          {...defaultProps}
          maxAttempts="5"
          minAttemptsBeforeSkip="3"
        />
      );
      expect(
        screen.queryByText("Min attempts before skip cannot exceed max attempts.")
      ).not.toBeInTheDocument();
    });

    it("does not display error when max attempts is empty", () => {
      render(
        <InteractionFlowSection
          {...defaultProps}
          maxAttempts=""
          minAttemptsBeforeSkip="6"
        />
      );
      expect(
        screen.queryByText("Min attempts before skip cannot exceed max attempts.")
      ).not.toBeInTheDocument();
    });
  });

  describe("Info Tooltips", () => {
    it("displays tooltip for Max attempts", () => {
      render(<InteractionFlowSection {...defaultProps} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Maximum number of attempts"))).toBe(true);
    });

    it("displays tooltip for Min attempts before skip", () => {
      render(<InteractionFlowSection {...defaultProps} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Minimum number of attempts"))).toBe(true);
    });
  });
});

