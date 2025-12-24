"use client";

import { uiTokens } from "../../lib/uiTokens";

type PreviewInPlayerButtonProps = {
  href?: string;
  disabled?: boolean;
  label?: string; // aria label only
};

export default function PreviewInPlayerButton({
  href,
  disabled = false,
  label = "Preview in player",
}: PreviewInPlayerButtonProps) {
  const content = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#ffffff"
      style={{ width: 18, height: 18 }}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
      />
    </svg>
  );

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: uiTokens.radius.md,
    border: `1px solid ${uiTokens.color.primary}`,
    color: uiTokens.color.textOnDark,
    background: uiTokens.color.primary,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    transition: "none",
  };

  if (!href || disabled) {
    return (
      <span style={baseStyle} aria-disabled="true" aria-label={label}>
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={baseStyle}
      aria-label={label}
    >
      {content}
    </a>
  );
}
