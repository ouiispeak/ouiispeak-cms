import { InputHTMLAttributes } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ style, ...props }: InputProps) {
  return (
    <input
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
        ...style,
      }}
    />
  );
}

