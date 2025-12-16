"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  title?: string;
}

export function BackButton({ title = "Back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: 14,
        color: "#222326",
        fontWeight: 400,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.opacity = "0.7";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
      <span>{title}</span>
    </button>
  );
}

