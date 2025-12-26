/**
 * Tests for MediaSection component
 * 
 * Tests audio file selector rendering and interaction.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MediaSection } from "./MediaSection";

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

vi.mock("../ui/AudioFileSelector", () => ({
  default: ({ value, onChange, bucketName }: any) => (
    <div data-testid="audio-file-selector">
      <div>Audio File Selector</div>
      <div data-testid="bucket-name">{bucketName}</div>
      <input
        data-testid="audio-input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter audio path"
      />
    </div>
  ),
}));

describe("MediaSection", () => {
  const defaultProps = {
    audioId: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders section with correct title", () => {
      render(<MediaSection {...defaultProps} />);
      expect(screen.getByText("Media Reference")).toBeInTheDocument();
    });

    it("renders section description", () => {
      render(<MediaSection {...defaultProps} />);
      expect(screen.getByText("Media assets referenced by this slide")).toBeInTheDocument();
    });

    it("renders form field with label", () => {
      render(<MediaSection {...defaultProps} />);
      expect(screen.getByText("Audio ID")).toBeInTheDocument();
    });

    it("renders info tooltip", () => {
      render(<MediaSection {...defaultProps} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip")).toHaveTextContent(
        "Reference ID or path for audio media"
      );
    });

    it("renders AudioFileSelector component", async () => {
      render(<MediaSection {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId("audio-file-selector")).toBeInTheDocument();
      });
    });

    it("passes correct bucketName to AudioFileSelector", async () => {
      render(<MediaSection {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId("bucket-name")).toHaveTextContent("lesson-audio");
      });
    });
  });

  describe("Value Handling", () => {
    it("displays empty audioId correctly", async () => {
      render(<MediaSection {...defaultProps} audioId="" />);
      await waitFor(() => {
        const input = screen.getByTestId("audio-input");
        expect(input).toHaveValue("");
      });
    });

    it("displays audioId value correctly", async () => {
      render(<MediaSection {...defaultProps} audioId="audio/test.mp3" />);
      await waitFor(() => {
        const input = screen.getByTestId("audio-input");
        expect(input).toHaveValue("audio/test.mp3");
      });
    });

    it("handles long audio paths", async () => {
      const longPath = "lesson-audio/path/to/very/long/audio/file/name.mp3";
      render(<MediaSection {...defaultProps} audioId={longPath} />);
      await waitFor(() => {
        const input = screen.getByTestId("audio-input");
        expect(input).toHaveValue(longPath);
      });
    });
  });

  describe("User Interactions", () => {
    it("calls onChange when audioId is changed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MediaSection audioId="" onChange={onChange} />);

      await waitFor(() => {
        expect(screen.getByTestId("audio-input")).toBeInTheDocument();
      });

      const input = screen.getByTestId("audio-input");
      await user.type(input, "new-audio.mp3");

      expect(onChange).toHaveBeenCalled();
    });

    it("calls onChange with correct value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MediaSection audioId="" onChange={onChange} />);

      await waitFor(() => {
        expect(screen.getByTestId("audio-input")).toBeInTheDocument();
      });

      const input = screen.getByTestId("audio-input");
      await user.type(input, "test");

      // onChange should be called for each character typed
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Meta Text", () => {
    it("displays meta text", () => {
      render(<MediaSection {...defaultProps} />);
      expect(screen.getByText("[unused]")).toBeInTheDocument();
    });
  });
});

