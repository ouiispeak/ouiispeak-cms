import { TextareaHTMLAttributes } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  borderColor?: string;
}

export default function Textarea({ style, borderColor, ...props }: TextareaProps) {
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
        backgroundColor: uiTokens.color.bg,
        color: uiTokens.color.text,
        ...style,
      }}
    />
  );
}

