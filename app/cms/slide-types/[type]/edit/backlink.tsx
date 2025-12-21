"use client";

import Link from "next/link";
import { uiTokens } from "../../../../../lib/uiTokens";

export default function SlideTypesBackLink() {
  return (
    <Link
      href="/cms/slide-types"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: uiTokens.color.focus,
        textDecoration: "underline",
        fontSize: 13,
      }}
    >
      ← Back to Slide Types
    </Link>
  );
}
