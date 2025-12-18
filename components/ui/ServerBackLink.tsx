import Link from "next/link";
import { uiTokens } from "../../lib/uiTokens";

export default function ServerBackLink({ title = "Back to Dashboard" }: { title?: string }) {
  return (
    <Link
      href="/"
      style={{
        display: "flex",
        alignItems: "center",
        gap: uiTokens.space.xs,
        padding: "8px 12px",
        textDecoration: "none",
        color: uiTokens.color.text,
        fontSize: uiTokens.font.meta.size,
      }}
    >
      <span style={{ fontSize: 18 }}>←</span>
      <span>{title}</span>
    </Link>
  );
}

