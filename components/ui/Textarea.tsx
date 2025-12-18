import { TextareaHTMLAttributes } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea({ style, ...props }: TextareaProps) {
  return (
    <textarea
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

