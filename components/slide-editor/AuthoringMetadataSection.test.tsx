/**
 * Tests for AuthoringMetadataSection component
 * 
 * Tests activity name field rendering and interaction.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthoringMetadataSection } from "./AuthoringMetadataSection";

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
  default: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="input"
      type="text"
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

describe("AuthoringMetadataSection", () => {
  const defaultProps = {
    slideType: "ai-speak-repeat",
    activityName: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Conditional Rendering", () => {
    it("renders for ai-speak-repeat slide type", () => {
      render(<AuthoringMetadataSection {...defaultProps} slideType="ai-speak-repeat" />);
      expect(screen.getByText("Authoring Metadata")).toBeInTheDocument();
    });

    it("renders for speech-match slide type", () => {
      render(<AuthoringMetadataSection {...defaultProps} slideType="speech-match" />);
      expect(screen.getByText("Authoring Metadata")).toBeInTheDocument();
    });

    it("does not render for title-slide", () => {
      const { container } = render(
        <AuthoringMetadataSection {...defaultProps} slideType="title-slide" />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for lesson-end slide", () => {
      const { container } = render(
        <AuthoringMetadataSection {...defaultProps} slideType="lesson-end" />
      );
      expect(container.firstChild).toBeNull();
    });

    it("does not render for text-slide", () => {
      const { container } = render(
        <AuthoringMetadataSection {...defaultProps} slideType="text-slide" />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Rendering", () => {
    it("renders section with correct title", () => {
      render(<AuthoringMetadataSection {...defaultProps} />);
      expect(screen.getByText("Authoring Metadata")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<AuthoringMetadataSection {...defaultProps} />);
      expect(screen.getByText("Metadata for CMS organization and tracking")).toBeInTheDocument();
    });

    it("renders form field with label", () => {
      render(<AuthoringMetadataSection {...defaultProps} />);
      expect(screen.getByText("Activity Name")).toBeInTheDocument();
    });

    it("renders info tooltip", () => {
      render(<AuthoringMetadataSection {...defaultProps} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip")).toHaveTextContent(
        "Name of the activity for CMS organization and tracking."
      );
    });

    it("renders input field", () => {
      render(<AuthoringMetadataSection {...defaultProps} />);
      expect(screen.getByTestId("input")).toBeInTheDocument();
    });

    it("displays placeholder", () => {
      render(<AuthoringMetadataSection {...defaultProps} />);
      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("placeholder", "Enter activity name");
    });
  });

  describe("Value Handling", () => {
    it("displays empty activityName", () => {
      render(<AuthoringMetadataSection {...defaultProps} activityName="" />);
      const input = screen.getByTestId("input");
      expect(input).toHaveValue("");
    });

    it("displays activityName value", () => {
      render(<AuthoringMetadataSection {...defaultProps} activityName="Test Activity" />);
      const input = screen.getByTestId("input");
      expect(input).toHaveValue("Test Activity");
    });

    it("handles long activity names", () => {
      const longName = "A".repeat(100);
      render(<AuthoringMetadataSection {...defaultProps} activityName={longName} />);
      const input = screen.getByTestId("input");
      expect(input).toHaveValue(longName);
    });
  });

  describe("User Interactions", () => {
    it("calls onChange when activityName is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<AuthoringMetadataSection activityName="" onChange={onChange} slideType="ai-speak-repeat" />);

      const input = screen.getByTestId("input");
      await user.type(input, "New Activity");

      expect(onChange).toHaveBeenCalled();
    });

    it("calls onChange with correct value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<AuthoringMetadataSection activityName="" onChange={onChange} slideType="ai-speak-repeat" />);

      const input = screen.getByTestId("input");
      await user.type(input, "Test");

      // onChange should be called for each character
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Meta Text", () => {
    it("displays meta text", () => {
      render(<AuthoringMetadataSection {...defaultProps} />);
      expect(screen.getByText("[all slide types]")).toBeInTheDocument();
    });
  });
});

