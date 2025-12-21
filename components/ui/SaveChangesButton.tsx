"use client";

import { uiTokens } from "../../lib/uiTokens";

type SaveChangesButtonProps = {
  onClick: () => void;
  hasUnsavedChanges?: boolean;
  saving?: boolean;
  label?: string;
};

export default function SaveChangesButton({
  onClick,
  hasUnsavedChanges = false,
  saving = false,
  label = "Save changes",
}: SaveChangesButtonProps) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: uiTokens.space.sm }}>
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        aria-busy={saving}
        aria-live="polite"
        style={{
          padding: `${uiTokens.space.xs}px ${uiTokens.space.md}px`,
          fontSize: uiTokens.font.label.size,
          fontWeight: 500,
          borderRadius: uiTokens.radius.sm,
          border: `1px solid ${hasUnsavedChanges ? "#ffc107" : "#d7a592"}`,
          backgroundColor: hasUnsavedChanges ? "#fff3cd" : "#d7a592",
          color: hasUnsavedChanges ? uiTokens.color.text : "#f6f5f3",
          cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "'Atkinson Hyperlegible', Arial, sans-serif",
          transition: "background-color 0.2s, border-color 0.2s, color 0.2s",
          display: "inline-flex",
          alignItems: "center",
          gap: uiTokens.space.xs,
          opacity: saving ? 0.8 : 1,
        }}
        onMouseEnter={(e) => {
          if (saving) return;
          e.currentTarget.style.backgroundColor = hasUnsavedChanges ? "#ffe69c" : "#c59582";
        }}
        onMouseLeave={(e) => {
          if (saving) return;
          e.currentTarget.style.backgroundColor = hasUnsavedChanges ? "#fff3cd" : "#d7a592";
        }}
      >
        {saving ? (
          <span style={{ fontSize: 16 }}>⏳</span>
        ) : hasUnsavedChanges ? (
          <span style={{ fontSize: 16 }}>⚠️</span>
        ) : null}
        <span style={{ color: hasUnsavedChanges ? uiTokens.color.text : "#f6f5f3" }}>
          {saving ? "Saving…" : label}
        </span>
      </button>
      {saving && (
        <span
          aria-live="polite"
          style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}
        >
          Applying changes…
        </span>
      )}
    </div>
  );
}
