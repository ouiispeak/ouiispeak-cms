import { SelectHTMLAttributes } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  borderColor?: string;
}

export default function Select({ style, borderColor, ...props }: SelectProps) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: uiTokens.space.xs,
        borderRadius: uiTokens.radius.sm,
        border: `1px solid ${borderColor || uiTokens.color.inputBorder}`,
        fontSize: uiTokens.font.label.size,
        fontFamily: "'Atkinson Hyperlegible', Arial, sans-serif",
        backgroundColor: uiTokens.color.bg,
        color: uiTokens.color.text,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}

