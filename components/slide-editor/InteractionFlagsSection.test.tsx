/**
 * Tests for InteractionFlagsSection component
 * 
 * Tests interaction flags rendering and conditional display.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InteractionFlagsSection } from "./InteractionFlagsSection";
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
  default: ({ value, onChange, type, min, max, step, placeholder }: any) => (
    <input
      data-testid="input"
      type={type || "text"}
      value={value || ""}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
    />
  ),
}));

describe("InteractionFlagsSection", () => {
  const defaultProps = {
    slideType: "ai-speak-repeat",
    isInteractive: false,
    allowSkip: false,
    allowRetry: false,
    isActivity: false,
    maxAttempts: "",
    minAttemptsBeforeSkip: "",
    onIsInteractiveChange: vi.fn(),
    onAllowSkipChange: vi.fn(),
    onAllowRetryChange: vi.fn(),
    onIsActivityChange: vi.fn(),
    onMaxAttemptsChange: vi.fn(),
    onMinAttemptsBeforeSkipChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Conditional Rendering", () => {
    it("renders for ai-speak-repeat slide type", () => {
      render(<InteractionFlagsSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.getByText("Interaction Flags")).toBeInTheDocument();
    });

    it("renders for speech-match slide type", () => {
      render(<InteractionFlagsSection {...defaultProps} slideType="speech-match" />);
      expect(screen.getByText("Interaction Flags")).toBeInTheDocument();
    });

    it("does not render for title-slide", () => {
      const { container } = render(
        <InteractionFlagsSection {...defaultProps} slideType={SLIDE_TYPES.TITLE} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for text-slide", () => {
      const { container } = render(
        <InteractionFlagsSection {...defaultProps} slideType={SLIDE_TYPES.TEXT} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Rendering", () => {
    it("renders section with correct title", () => {
      render(<InteractionFlagsSection {...defaultProps} />);
      expect(screen.getByText("Interaction Flags")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<InteractionFlagsSection {...defaultProps} />);
      expect(screen.getByText("Flags controlling slide interaction behavior")).toBeInTheDocument();
    });

    it("renders all interaction flags", () => {
      render(<InteractionFlagsSection {...defaultProps} />);
      expect(screen.getByText("Is interactive")).toBeInTheDocument();
      expect(screen.getByText("Allow skip")).toBeInTheDocument();
      expect(screen.getByText("Allow retry")).toBeInTheDocument();
      expect(screen.getByText("Max attempts")).toBeInTheDocument();
      expect(screen.getByText("Min attempts before skip")).toBeInTheDocument();
    });

    it("renders Is activity for ai-speak-student-repeat slide type", () => {
      render(<InteractionFlagsSection {...defaultProps} slideType="ai-speak-student-repeat" />);
      expect(screen.getByText("Is activity")).toBeInTheDocument();
    });

    it("does not render Is activity for other slide types", () => {
      render(<InteractionFlagsSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.queryByText("Is activity")).not.toBeInTheDocument();
    });
  });

  describe("Checkbox Fields", () => {
    describe("Is Interactive", () => {
      it("renders unchecked when false", () => {
        render(<InteractionFlagsSection {...defaultProps} isInteractive={false} />);
        const checkbox = screen.getByLabelText("Enable interactive mode");
        expect(checkbox).not.toBeChecked();
      });

      it("renders checked when true", () => {
        render(<InteractionFlagsSection {...defaultProps} isInteractive={true} />);
        const checkbox = screen.getByLabelText("Enable interactive mode");
        expect(checkbox).toBeChecked();
      });

      it("calls onIsInteractiveChange when toggled", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<InteractionFlagsSection {...defaultProps} isInteractive={false} onIsInteractiveChange={onChange} />);

        const checkbox = screen.getByLabelText("Enable interactive mode");
        await user.click(checkbox);

        expect(onChange).toHaveBeenCalledWith(true);
      });
    });

    describe("Allow Skip", () => {
      it("renders unchecked when false", () => {
        render(<InteractionFlagsSection {...defaultProps} allowSkip={false} />);
        const checkbox = screen.getByLabelText("Allow users to skip this slide");
        expect(checkbox).not.toBeChecked();
      });

      it("renders checked when true", () => {
        render(<InteractionFlagsSection {...defaultProps} allowSkip={true} />);
        const checkbox = screen.getByLabelText("Allow users to skip this slide");
        expect(checkbox).toBeChecked();
      });

      it("calls onAllowSkipChange when toggled", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<InteractionFlagsSection {...defaultProps} allowSkip={false} onAllowSkipChange={onChange} />);

        const checkbox = screen.getByLabelText("Allow users to skip this slide");
        await user.click(checkbox);

        expect(onChange).toHaveBeenCalledWith(true);
      });
    });

    describe("Allow Retry", () => {
      it("renders unchecked when false", () => {
        render(<InteractionFlagsSection {...defaultProps} allowRetry={false} />);
        const checkbox = screen.getByLabelText("Allow users to retry this slide");
        expect(checkbox).not.toBeChecked();
      });

      it("renders checked when true", () => {
        render(<InteractionFlagsSection {...defaultProps} allowRetry={true} />);
        const checkbox = screen.getByLabelText("Allow users to retry this slide");
        expect(checkbox).toBeChecked();
      });

      it("calls onAllowRetryChange when toggled", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<InteractionFlagsSection {...defaultProps} allowRetry={false} onAllowRetryChange={onChange} />);

        const checkbox = screen.getByLabelText("Allow users to retry this slide");
        await user.click(checkbox);

        expect(onChange).toHaveBeenCalledWith(true);
      });
    });

    describe("Is Activity", () => {
      it("renders unchecked when false", () => {
        render(
          <InteractionFlagsSection {...defaultProps} slideType="ai-speak-student-repeat" isActivity={false} />
        );
        const checkbox = screen.getByLabelText("Count as activity");
        expect(checkbox).not.toBeChecked();
      });

      it("renders checked when true", () => {
        render(
          <InteractionFlagsSection {...defaultProps} slideType="ai-speak-student-repeat" isActivity={true} />
        );
        const checkbox = screen.getByLabelText("Count as activity");
        expect(checkbox).toBeChecked();
      });

      it("calls onIsActivityChange when toggled", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          <InteractionFlagsSection
            {...defaultProps}
            slideType="ai-speak-student-repeat"
            isActivity={false}
            onIsActivityChange={onChange}
          />
        );

        const checkbox = screen.getByLabelText("Count as activity");
        await user.click(checkbox);

        expect(onChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe("Number Fields", () => {
    describe("Max Attempts", () => {
      it("renders max attempts field", () => {
        render(<InteractionFlagsSection {...defaultProps} maxAttempts="" />);
        expect(screen.getByText("Max attempts")).toBeInTheDocument();
      });

      it("renders number input for max attempts", () => {
        render(<InteractionFlagsSection {...defaultProps} maxAttempts="5" />);
        const inputs = screen.getAllByTestId("input");
        const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
        expect(numberInputs.length).toBeGreaterThan(0);
      });

      it("calls onMaxAttemptsChange when value changes", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<InteractionFlagsSection {...defaultProps} maxAttempts="" onMaxAttemptsChange={onChange} />);

        const inputs = screen.getAllByTestId("input");
        const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
        if (numberInputs.length > 0) {
          await user.type(numberInputs[0], "3");
          expect(onChange).toHaveBeenCalled();
        }
      });
    });

    describe("Min Attempts Before Skip", () => {
      it("renders min attempts before skip field", () => {
        render(<InteractionFlagsSection {...defaultProps} minAttemptsBeforeSkip="" />);
        expect(screen.getByText("Min attempts before skip")).toBeInTheDocument();
      });

      it("renders number input for min attempts", () => {
        render(<InteractionFlagsSection {...defaultProps} minAttemptsBeforeSkip="2" />);
        const inputs = screen.getAllByTestId("input");
        const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
        expect(numberInputs.length).toBeGreaterThanOrEqual(2);
      });

      it("calls onMinAttemptsBeforeSkipChange when value changes", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          <InteractionFlagsSection
            {...defaultProps}
            minAttemptsBeforeSkip=""
            onMinAttemptsBeforeSkipChange={onChange}
          />
        );

        const inputs = screen.getAllByTestId("input");
        const numberInputs = inputs.filter(input => input.getAttribute("type") === "number");
        if (numberInputs.length > 1) {
          await user.type(numberInputs[1], "1");
          expect(onChange).toHaveBeenCalled();
        }
      });
    });
  });

  describe("Info Tooltips", () => {
    it("displays tooltip for Is interactive", () => {
      render(<InteractionFlagsSection {...defaultProps} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("can accept user interaction"))).toBe(true);
    });

    it("displays tooltip for Allow skip", () => {
      render(<InteractionFlagsSection {...defaultProps} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("can skip this slide"))).toBe(true);
    });

    it("displays tooltip for Max attempts", () => {
      render(<InteractionFlagsSection {...defaultProps} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Maximum number of attempts"))).toBe(true);
    });
  });
});

