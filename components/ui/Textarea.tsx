import { TextareaHTMLAttributes } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  borderColor?: string;
}

export default function Textarea({ style, borderColor, ...props }: TextareaProps) {
  const isLocked = Boolean(props.disabled || props.readOnly);

  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: uiTokens.space.xs,
        borderRadius: uiTokens.radius.sm,
        border: `1px solid ${borderColor || uiTokens.color.inputBorder}`,
        fontSize: uiTokens.font.label.size,
        fontFamily: "'Atkinson Hyperlegible', Arial, sans-serif",
        backgroundColor: isLocked ? "#f0ede9" : uiTokens.color.bg,
        color: uiTokens.color.text,
        outline: "none",
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.outline = `2px solid #9cc7c7`;
        e.target.style.outlineOffset = "2px";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.outline = "none";
        e.target.style.outlineOffset = "";
        props.onBlur?.(e);
      }}
    />
  );
}
