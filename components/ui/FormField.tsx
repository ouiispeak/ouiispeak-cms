import { ReactNode } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface FormFieldProps {
  label: string | ReactNode;
  children: ReactNode;
  helper?: ReactNode;
  required?: boolean;
}

export default function FormField({ label, children, helper, required }: FormFieldProps) {
  return (
    <div style={{ marginBottom: uiTokens.space.md }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontSize: uiTokens.font.label.size,
          fontWeight: uiTokens.font.label.weight,
          color: uiTokens.color.text,
        }}
      >
        {label}
        {required && <span style={{ color: uiTokens.color.danger }}> *</span>}
      </label>
      {children}
      {helper && (
        <p
          style={{
            marginTop: 4,
            marginBottom: 0,
            fontSize: uiTokens.font.meta.size,
            fontWeight: uiTokens.font.meta.weight,
            color: uiTokens.color.mutedText,
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

