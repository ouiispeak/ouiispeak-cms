"use client";

import { uiTokens } from "../../lib/uiTokens";

interface StandardsContextBarProps {
  level: string;
}

export default function StandardsContextBar({ level }: StandardsContextBarProps) {
  const levelLabel = level.toUpperCase();
  return (
    <div
      style={{
        position: "sticky",
        top: 48,
        zIndex: 99,
        padding: `${uiTokens.space.sm}px ${uiTokens.space.lg}px`,
        borderBottom: "1px solid #595852",
        backgroundColor: "#f6f5f3",
        display: "flex",
        alignItems: "center",
        gap: uiTokens.space.md,
        marginBottom: "2.5%",
        borderLeft: "1px solid #595852",
        borderRight: "1px solid #595852",
        borderRadius: `0 0 ${uiTokens.radius.md}px ${uiTokens.radius.md}px`,
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: uiTokens.color.textMuted,
        }}
      >
        {levelLabel} Level Aspects &amp; Goals:
      </span>
      <span
        style={{
          fontSize: 15,
          fontWeight: 400,
          color: uiTokens.color.textMuted,
        }}
      >
        View the CEFR-aligned targets for {levelLabel}.
      </span>
    </div>
  );
}
