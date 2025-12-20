import { ReactNode, cloneElement, isValidElement } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface FormFieldProps {
  label: string | ReactNode;
  children: ReactNode;
  helper?: ReactNode;
  required?: boolean;
  borderColor?: string;
}

export default function FormField({ label, children, helper, required, borderColor }: FormFieldProps) {
  // Clone children and pass borderColor prop only if it's a custom component (not a native DOM element)
  // Native DOM elements have a string type (e.g., 'div', 'label', 'input')
  // Custom components have a function or object type
  const childrenWithProps = borderColor && isValidElement(children) && typeof (children as React.ReactElement).type !== 'string'
    ? cloneElement(children as React.ReactElement<any>, { borderColor })
    : children;
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
      {childrenWithProps}
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

