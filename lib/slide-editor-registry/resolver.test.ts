import { describe, it, expect } from "vitest";
import {
  resolveSlideTypeVisibility,
  getDefaultPresetsConfig,
  type SlideTypePresetsConfig,
} from "./resolver";
import type { EditorField } from "./types";

const mockFields: EditorField[] = [
  { key: "field1", label: "Field 1", uiType: "text" },
  { key: "field2", label: "Field 2", uiType: "text" },
  { key: "field3", label: "Field 3", uiType: "text" },
  { key: "field4", label: "Field 4", uiType: "text" },
];

describe("resolveSlideTypeVisibility", () => {
  it("returns all fields visible when no presets hide anything", () => {
    const config: SlideTypePresetsConfig = {
      version: 1,
      presets: {
        default: { hiddenFieldKeys: [] },
      },
    };

    const result = resolveSlideTypeVisibility("default", mockFields, config);

    expect(result.visibleKeys.size).toBe(4);
    expect(result.hiddenKeys.size).toBe(0);
    expect(result.defaultHiddenKeys.size).toBe(0);
    expect(result.typeHiddenKeys.size).toBe(0);
  });

  it("default hidden applies to all non-default types", () => {
    const config: SlideTypePresetsConfig = {
      version: 1,
      presets: {
        default: { hiddenFieldKeys: ["field1", "field2"] },
        "custom-type": { hiddenFieldKeys: [] },
      },
    };

    const result = resolveSlideTypeVisibility("custom-type", mockFields, config);

    expect(result.visibleKeys.has("field1")).toBe(false);
    expect(result.visibleKeys.has("field2")).toBe(false);
    expect(result.visibleKeys.has("field3")).toBe(true);
    expect(result.visibleKeys.has("field4")).toBe(true);
    expect(result.defaultHiddenKeys.has("field1")).toBe(true);
    expect(result.defaultHiddenKeys.has("field2")).toBe(true);
    expect(result.hiddenKeys.size).toBe(2);
  });

  it("non-default cannot unhide default-hidden fields", () => {
    const config: SlideTypePresetsConfig = {
      version: 1,
      presets: {
        default: { hiddenFieldKeys: ["field1"] },
        "custom-type": { hiddenFieldKeys: [] }, // Trying to unhide field1
      },
    };

    const result = resolveSlideTypeVisibility("custom-type", mockFields, config);

    // field1 should still be hidden because it's in default
    expect(result.visibleKeys.has("field1")).toBe(false);
    expect(result.hiddenKeys.has("field1")).toBe(true);
  });

  it("non-default can hide additional fields", () => {
    const config: SlideTypePresetsConfig = {
      version: 1,
      presets: {
        default: { hiddenFieldKeys: ["field1"] },
        "custom-type": { hiddenFieldKeys: ["field2"] },
      },
    };

    const result = resolveSlideTypeVisibility("custom-type", mockFields, config);

    // Both field1 (default) and field2 (type-specific) should be hidden
    expect(result.visibleKeys.has("field1")).toBe(false);
    expect(result.visibleKeys.has("field2")).toBe(false);
    expect(result.visibleKeys.has("field3")).toBe(true);
    expect(result.visibleKeys.has("field4")).toBe(true);
    expect(result.hiddenKeys.size).toBe(2);
    expect(result.typeHiddenKeys.has("field2")).toBe(true);
  });

  it("default type only uses default preset", () => {
    const config: SlideTypePresetsConfig = {
      version: 1,
      presets: {
        default: { hiddenFieldKeys: ["field1"] },
        "custom-type": { hiddenFieldKeys: ["field2"] },
      },
    };

    const result = resolveSlideTypeVisibility("default", mockFields, config);

    // Only field1 should be hidden (field2 is ignored for default type)
    expect(result.visibleKeys.has("field1")).toBe(false);
    expect(result.visibleKeys.has("field2")).toBe(true);
    expect(result.hiddenKeys.size).toBe(1);
    expect(result.typeHiddenKeys.size).toBe(0);
  });

  it("ignores unknown field keys safely", () => {
    const config: SlideTypePresetsConfig = {
      version: 1,
      presets: {
        default: { hiddenFieldKeys: ["unknownField", "field1"] },
      },
    };

    // Should not throw
    const result = resolveSlideTypeVisibility("default", mockFields, config);

    expect(result.visibleKeys.has("field1")).toBe(false);
    expect(result.visibleKeys.has("unknownField")).toBe(false); // Not in fields, so not visible
    expect(result.hiddenKeys.has("unknownField")).toBe(true); // But tracked in hidden set
  });

  it("handles missing default preset gracefully", () => {
    const config: SlideTypePresetsConfig = {
      version: 1,
      presets: {
        "custom-type": { hiddenFieldKeys: ["field1"] },
      },
    };

    const result = resolveSlideTypeVisibility("custom-type", mockFields, config);

    // Should treat missing default as empty
    expect(result.defaultHiddenKeys.size).toBe(0);
    expect(result.visibleKeys.has("field1")).toBe(false);
    expect(result.typeHiddenKeys.has("field1")).toBe(true);
  });
});

describe("getDefaultPresetsConfig", () => {
  it("returns valid default config", () => {
    const config = getDefaultPresetsConfig();

    expect(config.version).toBe(1);
    expect(config.presets).toBeDefined();
    expect(config.presets.default).toBeDefined();
    expect(Array.isArray(config.presets.default.hiddenFieldKeys)).toBe(true);
  });
});

