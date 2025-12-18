import { SelectHTMLAttributes } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export default function Select({ style, ...props }: SelectProps) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: uiTokens.space.xs,
        borderRadius: uiTokens.radius.sm,
        border: `1px solid ${uiTokens.color.inputBorder}`,
        fontSize: uiTokens.font.label.size,
        fontFamily: "'Atkinson Hyperlegible', Arial, sans-serif",
        backgroundColor: uiTokens.color.bgAlt,
        color: uiTokens.color.text,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}

