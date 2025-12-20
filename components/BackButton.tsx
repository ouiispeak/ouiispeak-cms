"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";

interface BackButtonProps {
  title?: string;
}

export function BackButton({ title = "Back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
      <span>{title}</span>
    </Button>
  );
}

