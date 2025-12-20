"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "../Button";
import Input from "./Input";
import { uiTokens } from "../../lib/uiTokens";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  requireText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  danger = true,
  requireText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [typedText, setTypedText] = useState("");

  // Reset confirming state and typed text when dialog closes
  useEffect(() => {
    if (!open) {
      setIsConfirming(false);
      setTypedText("");
    }
  }, [open]);

  // Handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isConfirming) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, isConfirming, onCancel]);

  // Handle Enter key in input field
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isConfirming && typedText === requireText) {
      handleConfirm();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  if (!open) return null;

  const isTypedTextValid = requireText ? typedText === requireText : true;

  async function handleConfirm() {
    if (!isTypedTextValid) return;
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: uiTokens.color.bgAlt,
          padding: uiTokens.space.lg,
          borderRadius: uiTokens.radius.lg,
          maxWidth: 500,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: uiTokens.space.md,
            fontSize: uiTokens.font.sectionTitle.size,
            fontWeight: uiTokens.font.sectionTitle.weight,
            color: uiTokens.color.text,
          }}
        >
          {title}
        </h2>
        {description && (
          <div
            style={{
              marginBottom: uiTokens.space.md,
              color: uiTokens.color.text,
              fontSize: uiTokens.font.label.size,
            }}
          >
            {description}
          </div>
        )}
        {requireText && (
          <div style={{ marginBottom: uiTokens.space.md }}>
            <Input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={`Type ${requireText} to confirm`}
              autoFocus
              disabled={isConfirming}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: uiTokens.space.xs,
            justifyContent: "flex-end",
          }}
        >
          <Button variant="ghost" onClick={onCancel} disabled={isConfirming}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={isConfirming || !isTypedTextValid}
          >
            {isConfirming ? "Confirming…" : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

