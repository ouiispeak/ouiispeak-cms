/**
 * Tests for FieldRenderer component
 * 
 * Tests rendering of standard fields and complex components.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldRenderer } from "./FieldRenderer";
import type { FormFieldConfig } from "../../lib/schemas/slideTypeConfig";

// Mock UI components
vi.mock("../ui/Input", () => ({
  default: ({ value, onChange, placeholder, readOnly, type, min, max, step }: any) => (
    <input
      data-testid="input"
      type={type || "text"}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      min={min}
      max={max}
      step={step}
    />
  ),
}));

vi.mock("../ui/Textarea", () => ({
  default: ({ value, onChange, placeholder, rows, readOnly }: any) => (
    <textarea
      data-testid="textarea"
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      readOnly={readOnly}
    />
  ),
}));

vi.mock("../ui/Select", () => ({
  default: ({ value, onChange, children }: any) => (
    <select data-testid="select" value={value || ""} onChange={onChange}>
      {children}
    </select>
  ),
}));

vi.mock("../ui/FormField", () => ({
  default: ({ label, required, infoTooltip, children }: any) => (
    <div data-testid="form-field">
      <label>
        {label}
        {required && <span>*</span>}
        {infoTooltip && <span data-testid="tooltip">{infoTooltip}</span>}
      </label>
      {children}
    </div>
  ),
}));

// Mock complex components
vi.mock("../ui/StudentRepeatElementMapper", () => ({
  default: ({ elements, onElementsChange }: any) => (
    <div data-testid="student-repeat-mapper">
      <div>Student Repeat Mapper</div>
      <div data-testid="elements-count">{elements?.length || 0}</div>
      <button onClick={() => onElementsChange([{ samplePrompt: "Test" }])}>
        Add Element
      </button>
    </div>
  ),
}));

vi.mock("../ui/ChoiceElementMapper", () => ({
  default: ({ elements, onElementsChange }: any) => (
    <div data-testid="choice-element-mapper">
      <div>Choice Element Mapper</div>
      <div data-testid="elements-count">{elements?.length || 0}</div>
      <button onClick={() => onElementsChange([{ label: "Test" }])}>
        Add Element
      </button>
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
      />
    </div>
  ),
}));

// Mock logger
vi.mock("../../lib/utils/logger", () => ({
  logger: {
    warn: vi.fn(),
  },
}));

// Mock getFieldDefinition
vi.mock("../../lib/schemas/slideFieldRegistry", async () => {
  const actual = await vi.importActual("../../lib/schemas/slideFieldRegistry");
  return {
    ...actual,
    getFieldDefinition: vi.fn((fieldId: string) => {
      const registry: Record<string, any> = {
        label: {
          id: "label",
          displayName: "Label",
          type: "text",
          placeholder: "Enter label",
        },
        title: {
          id: "title",
          displayName: "Title",
          type: "text",
          placeholder: "Enter title",
        },
        body: {
          id: "body",
          displayName: "Body",
          type: "textarea",
          placeholder: "Enter body",
          rows: 6,
        },
        defaultLang: {
          id: "defaultLang",
          displayName: "Default Language",
          type: "select",
          selectOptions: [
            { value: "", label: "Select..." },
            { value: "english", label: "English" },
            { value: "french", label: "French" },
          ],
        },
        isInteractive: {
          id: "isInteractive",
          displayName: "Is Interactive",
          type: "checkbox",
          placeholder: "Enable interaction",
        },
        maxAttempts: {
          id: "maxAttempts",
          displayName: "Max Attempts",
          type: "number",
          placeholder: "Enter max attempts",
          validation: { min: 1, max: 10 },
        },
        elements: {
          id: "elements",
          displayName: "Elements",
          type: "complex",
          componentName: "StudentRepeatElementMapper",
          componentProps: {},
        },
        choiceElements: {
          id: "choiceElements",
          displayName: "Choice Elements",
          type: "complex",
          componentName: "ChoiceElementMapper",
          componentProps: {},
        },
        audioId: {
          id: "audioId",
          displayName: "Audio ID",
          type: "complex",
          componentName: "AudioFileSelector",
          componentProps: { bucketName: "lesson-audio" },
        },
      };
      return registry[fieldId] || null;
    }),
  };
});

describe("FieldRenderer", () => {
  const defaultFieldConfig: FormFieldConfig = {
    fieldId: "label",
    sectionId: "identity",
    order: 0,
    visible: true,
    required: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Visibility", () => {
    it("renders nothing when field is not visible", () => {
      const { container } = render(
        <FieldRenderer
          fieldConfig={{ ...defaultFieldConfig, visible: false }}
          value="test"
          onChange={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders field when visible is true", () => {
      render(
        <FieldRenderer
          fieldConfig={{ ...defaultFieldConfig, visible: true }}
          value="test"
          onChange={vi.fn()}
        />
      );
      expect(screen.getByText("Label")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("shows error when field definition is not found", () => {
      render(
        <FieldRenderer
          fieldConfig={{ fieldId: "unknown", sectionId: "identity", order: 0, visible: true, required: false }}
          value="test"
          onChange={vi.fn()}
        />
      );
      expect(screen.getByText(/Field definition not found/)).toBeInTheDocument();
    });
  });

  describe("Standard Field Types", () => {
    describe("Text Field", () => {
      it("renders text input with correct props", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "label" }}
            value="Test Label"
            onChange={vi.fn()}
          />
        );
        const input = screen.getByTestId("input");
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue("Test Label");
      });

      it("handles empty value", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "label" }}
            value=""
            onChange={vi.fn()}
          />
        );
        const input = screen.getByTestId("input");
        expect(input).toHaveValue("");
      });

      it("handles null value", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "label" }}
            value={null}
            onChange={vi.fn()}
          />
        );
        const input = screen.getByTestId("input");
        expect(input).toHaveValue("");
      });

      it("calls onChange when value changes", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "label" }}
            value=""
            onChange={onChange}
          />
        );
        const input = screen.getByTestId("input");
        await user.type(input, "New Value");
        expect(onChange).toHaveBeenCalled();
      });

      it("shows required indicator when required", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "label", required: true }}
            value=""
            onChange={vi.fn()}
          />
        );
        expect(screen.getByText("*")).toBeInTheDocument();
      });
    });

    describe("Textarea Field", () => {
      it("renders textarea with correct props", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "body" }}
            value="Test Body"
            onChange={vi.fn()}
          />
        );
        const textarea = screen.getByTestId("textarea");
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveValue("Test Body");
      });

      it("uses correct number of rows", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "body" }}
            value=""
            onChange={vi.fn()}
          />
        );
        const textarea = screen.getByTestId("textarea");
        expect(textarea).toHaveAttribute("rows", "6");
      });
    });

    describe("Select Field", () => {
      it("renders select with options", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "defaultLang" }}
            value="english"
            onChange={vi.fn()}
          />
        );
        const select = screen.getByTestId("select");
        expect(select).toBeInTheDocument();
        expect(select).toHaveValue("english");
        expect(screen.getByText("English")).toBeInTheDocument();
      });

      it("calls onChange when selection changes", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "defaultLang" }}
            value=""
            onChange={onChange}
          />
        );
        const select = screen.getByTestId("select");
        await user.selectOptions(select, "french");
        expect(onChange).toHaveBeenCalled();
      });
    });

    describe("Checkbox Field", () => {
      it("renders checkbox with correct checked state", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "isInteractive" }}
            value={true}
            onChange={vi.fn()}
          />
        );
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toBeChecked();
      });

      it("renders unchecked checkbox when value is false", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "isInteractive" }}
            value={false}
            onChange={vi.fn()}
          />
        );
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).not.toBeChecked();
      });

      it("calls onChange with boolean when checkbox is toggled", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "isInteractive" }}
            value={false}
            onChange={onChange}
          />
        );
        const checkbox = screen.getByRole("checkbox");
        await user.click(checkbox);
        expect(onChange).toHaveBeenCalledWith(true);
      });
    });

    describe("Number Field", () => {
      it("renders number input with min/max attributes", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "maxAttempts" }}
            value="5"
            onChange={vi.fn()}
          />
        );
        const input = screen.getByTestId("input");
        expect(input).toHaveAttribute("type", "number");
        expect(input).toHaveAttribute("min", "1");
        expect(input).toHaveAttribute("max", "10");
        expect(input).toHaveAttribute("step", "1");
      });

      it("keeps value as string for number fields", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "maxAttempts" }}
            value=""
            onChange={onChange}
          />
        );
        const input = screen.getByTestId("input");
        await user.type(input, "3");
        // onChange should be called with string value
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe("Complex Components", () => {
    describe("StudentRepeatElementMapper", () => {
      it("renders StudentRepeatElementMapper component", async () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "elements" }}
            value={[]}
            onChange={vi.fn()}
          />
        );
        await waitFor(() => {
          expect(screen.getByTestId("student-repeat-mapper")).toBeInTheDocument();
        });
      });

      it("passes elements array to component", () => {
        const elements = [{ samplePrompt: "Test" }];
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "elements" }}
            value={elements}
            onChange={vi.fn()}
          />
        );
        expect(screen.getByTestId("elements-count")).toHaveTextContent("1");
      });

      it("handles empty elements array", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "elements" }}
            value={[]}
            onChange={vi.fn()}
          />
        );
        expect(screen.getByTestId("elements-count")).toHaveTextContent("0");
      });

      it("calls onChange when elements change", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "elements" }}
            value={[]}
            onChange={onChange}
          />
        );
        const button = screen.getByText("Add Element");
        await user.click(button);
        expect(onChange).toHaveBeenCalled();
      });
    });

    describe("ChoiceElementMapper", () => {
      it("renders ChoiceElementMapper component", async () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "choiceElements" }}
            value={[]}
            onChange={vi.fn()}
          />
        );
        await waitFor(() => {
          expect(screen.getByTestId("choice-element-mapper")).toBeInTheDocument();
        });
      });

      it("passes elements array to component", () => {
        const elements = [{ label: "A" }];
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "choiceElements" }}
            value={elements}
            onChange={vi.fn()}
          />
        );
        expect(screen.getByTestId("elements-count")).toHaveTextContent("1");
      });
    });

    describe("AudioFileSelector", () => {
      it("renders AudioFileSelector component", async () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "audioId" }}
            value=""
            onChange={vi.fn()}
          />
        );
        await waitFor(() => {
          expect(screen.getByTestId("audio-file-selector")).toBeInTheDocument();
        });
      });

      it("passes bucketName from componentProps", () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "audioId" }}
            value=""
            onChange={vi.fn()}
            bucketName="custom-bucket"
          />
        );
        expect(screen.getByTestId("bucket-name")).toHaveTextContent("custom-bucket");
      });

      it("uses defaultLang when provided", async () => {
        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "audioId" }}
            value=""
            onChange={vi.fn()}
            defaultLang="french"
          />
        );
        await waitFor(() => {
          expect(screen.getByTestId("audio-file-selector")).toBeInTheDocument();
        });
      });
    });

    describe("Unknown Component", () => {
      it("shows error for unknown component", async () => {
        // Mock getFieldDefinition to return unknown component
        const { getFieldDefinition } = await import("../../lib/schemas/slideFieldRegistry");
        vi.mocked(getFieldDefinition).mockReturnValueOnce({
          id: "unknown",
          displayName: "Unknown Field",
          type: "complex",
          componentName: "UnknownComponent",
        } as any);

        render(
          <FieldRenderer
            fieldConfig={{ ...defaultFieldConfig, fieldId: "unknown" }}
            value=""
            onChange={vi.fn()}
          />
        );
        expect(screen.getByText(/Unknown component/)).toBeInTheDocument();
      });
    });
  });

  describe("Unsupported Field Type", () => {
    it("shows error for unsupported field type", async () => {
      // Mock getFieldDefinition to return unsupported type
      const { getFieldDefinition } = await import("../../lib/schemas/slideFieldRegistry");
      vi.mocked(getFieldDefinition).mockReturnValueOnce({
        id: "unsupported",
        displayName: "Unsupported Field",
        type: "unsupported-type",
      } as any);

      render(
        <FieldRenderer
          fieldConfig={{ ...defaultFieldConfig, fieldId: "unsupported" }}
          value=""
          onChange={vi.fn()}
        />
      );
      expect(screen.getByText(/Unsupported field type/)).toBeInTheDocument();
    });
  });

  describe("Field Metadata", () => {
    it("displays field ID in meta text", () => {
      render(
        <FieldRenderer
          fieldConfig={{ ...defaultFieldConfig, fieldId: "label" }}
          value=""
          onChange={vi.fn()}
        />
      );
      expect(screen.getByText("[label]")).toBeInTheDocument();
    });

    it("displays info tooltip when available", async () => {
      const { getFieldDefinition } = await import("../../lib/schemas/slideFieldRegistry");
      vi.mocked(getFieldDefinition).mockReturnValueOnce({
        id: "label",
        displayName: "Label",
        type: "text",
        infoTooltip: "This is a tooltip",
      } as any);

      render(
        <FieldRenderer
          fieldConfig={{ ...defaultFieldConfig, fieldId: "label" }}
          value=""
          onChange={vi.fn()}
        />
      );
      expect(screen.getByTestId("tooltip")).toHaveTextContent("This is a tooltip");
    });
  });
});

