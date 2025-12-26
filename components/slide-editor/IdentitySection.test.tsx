/**
 * Tests for IdentitySection component
 * 
 * Tests rendering of identity fields and label editing.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IdentitySection } from "./IdentitySection";

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
  default: ({ label, infoTooltip, required, children }: any) => (
    <div data-testid="form-field">
      <label>
        {label}
        {required && <span data-testid="required-indicator">*</span>}
        {infoTooltip && <span data-testid="tooltip">{infoTooltip}</span>}
      </label>
      {children}
    </div>
  ),
}));

vi.mock("../ui/Input", () => ({
  default: ({ value, onChange, readOnly, placeholder, type, style }: any) => (
    <input
      data-testid="input"
      type={type || "text"}
      value={value || ""}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      style={style}
    />
  ),
}));

describe("IdentitySection", () => {
  const defaultProps = {
    slideId: "slide-123",
    slideType: "text-slide",
    groupId: "group-456",
    groupName: "Test Group",
    orderIndex: 1,
    label: "Test Label",
    onLabelChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders section with correct title", () => {
      render(<IdentitySection {...defaultProps} />);
      expect(screen.getByText("Identity & Structure")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<IdentitySection {...defaultProps} />);
      expect(screen.getByText("Basic slide identification and structure")).toBeInTheDocument();
    });

    it("renders all identity fields", () => {
      render(<IdentitySection {...defaultProps} />);
      expect(screen.getByText("Slide ID")).toBeInTheDocument();
      expect(screen.getByText("Slide Type")).toBeInTheDocument();
      expect(screen.getByText("Group ID")).toBeInTheDocument();
      expect(screen.getByText("Group Name")).toBeInTheDocument();
      expect(screen.getByText("Order Index")).toBeInTheDocument();
      expect(screen.getByText("Label")).toBeInTheDocument();
    });

    it("renders all field values", () => {
      render(<IdentitySection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[0]).toHaveValue("slide-123"); // Slide ID
      expect(inputs[1]).toHaveValue("text-slide"); // Slide Type
      expect(inputs[2]).toHaveValue("group-456"); // Group ID
      expect(inputs[3]).toHaveValue("Test Group"); // Group Name
      expect(inputs[4]).toHaveValue(1); // Order Index
      expect(inputs[5]).toHaveValue("Test Label"); // Label
    });
  });

  describe("Read-Only Fields", () => {
    it("marks Slide ID as read-only", () => {
      render(<IdentitySection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[0]).toHaveAttribute("readOnly");
    });

    it("marks Slide Type as read-only", () => {
      render(<IdentitySection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[1]).toHaveAttribute("readOnly");
    });

    it("marks Group ID as read-only", () => {
      render(<IdentitySection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[2]).toHaveAttribute("readOnly");
    });

    it("marks Group Name as read-only", () => {
      render(<IdentitySection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[3]).toHaveAttribute("readOnly");
    });

    it("marks Order Index as read-only", () => {
      render(<IdentitySection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[4]).toHaveAttribute("readOnly");
    });

    it("uses number type for Order Index", () => {
      render(<IdentitySection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[4]).toHaveAttribute("type", "number");
    });
  });

  describe("Label Field", () => {
    it("renders label field as editable", () => {
      render(<IdentitySection {...defaultProps} />);
      const inputs = screen.getAllByTestId("input");
      const labelInput = inputs[5];
      expect(labelInput).not.toHaveAttribute("readOnly");
    });

    it("shows required indicator for label field", () => {
      render(<IdentitySection {...defaultProps} />);
      const requiredIndicators = screen.getAllByTestId("required-indicator");
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });

    it("displays placeholder for label field", () => {
      render(<IdentitySection {...defaultProps} label="" />);
      const inputs = screen.getAllByTestId("input");
      const labelInput = inputs[5];
      expect(labelInput).toHaveAttribute("placeholder", "Enter slide label");
    });

    it("calls onLabelChange when label is edited", async () => {
      const user = userEvent.setup();
      const onLabelChange = vi.fn();
      render(<IdentitySection {...defaultProps} onLabelChange={onLabelChange} />);

      const inputs = screen.getAllByTestId("input");
      const labelInput = inputs[5];
      await user.clear(labelInput);
      await user.type(labelInput, "New Label");

      expect(onLabelChange).toHaveBeenCalled();
    });

    it("displays current label value", () => {
      render(<IdentitySection {...defaultProps} label="Current Label" />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[5]).toHaveValue("Current Label");
    });
  });

  describe("Info Tooltips", () => {
    it("displays tooltip for Slide ID", () => {
      render(<IdentitySection {...defaultProps} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("System UUID"))).toBe(true);
    });

    it("displays tooltip for Slide Type", () => {
      render(<IdentitySection {...defaultProps} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Type key"))).toBe(true);
    });

    it("displays tooltip for Label", () => {
      render(<IdentitySection {...defaultProps} />);
      const tooltips = screen.getAllByTestId("tooltip");
      expect(tooltips.some(t => t.textContent?.includes("Internal name"))).toBe(true);
    });
  });

  describe("Meta Text", () => {
    it("displays meta text for all fields", () => {
      render(<IdentitySection {...defaultProps} />);
      const metaTexts = screen.getAllByText("[title, text, ai-speak]");
      expect(metaTexts.length).toBe(6); // All 6 fields have meta text
    });
  });

  describe("Edge Cases", () => {
    it("handles empty label", () => {
      render(<IdentitySection {...defaultProps} label="" />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[5]).toHaveValue("");
    });

    it("handles empty group name", () => {
      render(<IdentitySection {...defaultProps} groupName="" />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[3]).toHaveValue("");
    });

    it("handles zero order index", () => {
      render(<IdentitySection {...defaultProps} orderIndex={0} />);
      const inputs = screen.getAllByTestId("input");
      // Number inputs may render 0 as empty string or "0", so check both
      const orderIndexInput = inputs[4];
      expect(orderIndexInput.value === "0" || orderIndexInput.value === "").toBe(true);
    });

    it("handles long label text", () => {
      const longLabel = "A".repeat(100);
      render(<IdentitySection {...defaultProps} label={longLabel} />);
      const inputs = screen.getAllByTestId("input");
      expect(inputs[5]).toHaveValue(longLabel);
    });
  });
});

