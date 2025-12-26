"use client";

import { useState } from "react";
import { uiTokens } from "../../lib/uiTokens";
import { logger } from "../../lib/utils/logger";

interface CopyButtonProps {
  text: string;
  label?: string; // Used in confirmation message, e.g., "Slide UUID copied!"
  className?: string;
  iconColor?: string; // Optional icon color, defaults to "#b4d5d5"
  title?: string; // Optional button title/tooltip
}

/**
 * Copy-to-clipboard button component with "Copied!" feedback.
 * Standardizes copy functionality across the CMS.
 */
export default function CopyButton({
  text,
  label = "Value",
  className,
  iconColor = "#b4d5d5",
  title,
}: CopyButtonProps) {
  const [showCopied, setShowCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setError(null);
      setTimeout(() => {
        setShowCopied(false);
      }, 1200);
    } catch (err) {
      logger.error("Failed to copy text:", err);
      setError("Copy failed");
      setShowCopied(false);
      setTimeout(() => {
        setError(null);
      }, 2000);
    }
  };

  const displayMessage = error || (showCopied ? `${label} copied!` : null);

  return (
    <>
      {displayMessage && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            right: "8px",
            marginBottom: "4px",
            padding: `${uiTokens.space.xs}px ${uiTokens.space.sm}px`,
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: uiTokens.radius.sm,
            fontSize: uiTokens.font.meta.size,
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            animation: "fadeIn 0.2s ease-in",
            whiteSpace: "nowrap",
          }}
        >
          {displayMessage}
        </div>
      )}
      <button
        type="button"
        onClick={handleCopy}
        title={title || `Copy ${label}`}
        className={className}
        style={{
          position: "absolute",
          right: "8px",
          background: "none",
          border: "none",
          padding: "4px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          color: iconColor,
          opacity: 0.7,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.7";
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke={iconColor}
          style={{
            width: 16,
            height: 16,
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
          />
        </svg>
      </button>
    </>
  );
}

