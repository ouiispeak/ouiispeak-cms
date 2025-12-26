/**
 * Tests for LanguageSection component
 * 
 * Tests language selection functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSection } from "./LanguageSection";

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

vi.mock("../ui/Select", () => ({
  default: ({ value, onChange, children }: any) => (
    <select 
      data-testid="select" 
      value={value} 
      onChange={onChange}
    >
      {children}
    </select>
  ),
}));

describe("LanguageSection", () => {
  const defaultProps = {
    defaultLang: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders section with correct title", () => {
      render(<LanguageSection {...defaultProps} />);
      expect(screen.getByText("Language and Localization")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<LanguageSection {...defaultProps} />);
      expect(screen.getByText("Language settings for the slide")).toBeInTheDocument();
    });

    it("renders form field with label", () => {
      render(<LanguageSection {...defaultProps} />);
      expect(screen.getByText("Default Language")).toBeInTheDocument();
    });

    it("renders info tooltip", () => {
      render(<LanguageSection {...defaultProps} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip")).toHaveTextContent(
        "Default language for text-to-speech and content display"
      );
    });

    it("renders select dropdown", () => {
      render(<LanguageSection {...defaultProps} />);
      expect(screen.getByTestId("select")).toBeInTheDocument();
    });

    it("renders all language options", () => {
      render(<LanguageSection {...defaultProps} />);
      expect(screen.getByText("Select language...")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("French")).toBeInTheDocument();
      expect(screen.getByText("Both")).toBeInTheDocument();
    });
  });

  describe("Value Handling", () => {
    it("displays empty value correctly", () => {
      render(<LanguageSection {...defaultProps} defaultLang="" />);
      const select = screen.getByTestId("select");
      expect(select).toHaveValue("");
    });

    it("displays english value correctly", () => {
      render(<LanguageSection {...defaultProps} defaultLang="english" />);
      const select = screen.getByTestId("select");
      expect(select).toHaveValue("english");
    });

    it("displays french value correctly", () => {
      render(<LanguageSection {...defaultProps} defaultLang="french" />);
      const select = screen.getByTestId("select");
      expect(select).toHaveValue("french");
    });

    it("displays both value correctly", () => {
      render(<LanguageSection {...defaultProps} defaultLang="both" />);
      const select = screen.getByTestId("select");
      expect(select).toHaveValue("both");
    });
  });

  describe("User Interactions", () => {
    it("calls onChange when language is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<LanguageSection defaultLang="" onChange={onChange} />);

      const select = screen.getByTestId("select");
      await user.selectOptions(select, "english");

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("english");
    });

    it("calls onChange when language changes from english to french", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<LanguageSection defaultLang="english" onChange={onChange} />);

      const select = screen.getByTestId("select");
      await user.selectOptions(select, "french");

      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith("french");
    });

    it("calls onChange when language is cleared", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<LanguageSection defaultLang="english" onChange={onChange} />);

      const select = screen.getByTestId("select");
      await user.selectOptions(select, "");

      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith("");
    });
  });

  describe("Meta Text", () => {
    it("displays meta text", () => {
      render(<LanguageSection {...defaultProps} />);
      expect(screen.getByText("[ai-speak]")).toBeInTheDocument();
    });
  });
});

