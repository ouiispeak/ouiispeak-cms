import { ReactNode } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface StatusMessageProps {
  variant: "success" | "error" | "info";
  title?: string;
  children: ReactNode;
}

export default function StatusMessage({
  variant,
  title,
  children,
}: StatusMessageProps) {
  const getColor = () => {
    switch (variant) {
      case "error":
        return uiTokens.color.danger;
      case "success":
        return "#22c55e"; // green-500, matching existing "green" usage
      case "info":
        return uiTokens.color.text;
      default:
        return uiTokens.color.text;
    }
  };

  return (
    <div
      style={{
        marginTop: uiTokens.space.md,
        color: getColor(),
      }}
    >
      {title && (
        <div
          style={{
            fontSize: uiTokens.font.label.size,
            fontWeight: uiTokens.font.label.weight,
            marginBottom: uiTokens.space.xs,
          }}
        >
          {title}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

