/**
 * Component for slide form action buttons (Save, Preview, etc.)
 */

import React from "react";
import { uiTokens } from "../../lib/uiTokens";
import SaveChangesButton from "../ui/SaveChangesButton";
import PreviewInPlayerButton from "../ui/PreviewInPlayerButton";
import StatusMessage from "../ui/StatusMessage";

interface SlideFormActionsProps {
  message: string | null;
  playerHref?: string;
  hasUnsavedChanges: boolean;
  saving: boolean;
  onSave: () => void;
}

export function SlideFormActions({
  message,
  playerHref,
  hasUnsavedChanges,
  saving,
  onSave,
}: SlideFormActionsProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: uiTokens.space.md,
        marginBottom: uiTokens.space.sm,
      }}
    >
      {message && (
        <StatusMessage variant={message.includes("error") || message.includes("Error") ? "error" : "success"}>
          {message}
        </StatusMessage>
      )}
      <PreviewInPlayerButton
        href={playerHref}
        disabled={!playerHref}
        label="Preview in lesson player"
      />
      <SaveChangesButton
        onClick={onSave}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        label="Save Changes"
      />
    </div>
  );
}

