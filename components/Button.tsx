"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { uiTokens } from "../lib/uiTokens";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    if (disabled) {
      return {
        backgroundColor: uiTokens.color.primary,
        borderColor: uiTokens.color.primary,
        color: uiTokens.color.primaryText,
        opacity: 0.7,
      };
    }

    switch (variant) {
      case "danger":
        return {
          backgroundColor: uiTokens.color.danger,
          borderColor: uiTokens.color.danger,
          color: uiTokens.color.dangerText,
        };
      case "secondary":
        return {
          backgroundColor: uiTokens.color.secondary,
          borderColor: uiTokens.color.secondary,
          color: uiTokens.color.secondaryText,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: uiTokens.color.border,
          color: uiTokens.color.text,
        };
      case "primary":
      default:
        return {
          backgroundColor: uiTokens.color.primary,
          borderColor: uiTokens.color.primary,
          color: uiTokens.color.primaryText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          padding: "6px 12px",
          fontSize: uiTokens.font.meta.size,
        };
      case "md":
      default:
        return {
          padding: "8px 16px",
          fontSize: uiTokens.font.label.size,
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    ...getSizeStyles(),
    fontWeight: 400,
    borderRadius: uiTokens.radius.md,
    border: "1px solid",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Atkinson Hyperlegible', Arial, sans-serif",
    transition: "background-color 0.2s",
    ...getVariantStyles(),
    ...style,
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      if (variant === "danger") {
        e.currentTarget.style.backgroundColor = uiTokens.color.dangerHover;
      } else if (variant === "secondary") {
        e.currentTarget.style.backgroundColor = uiTokens.color.secondaryHover;
      } else if (variant === "ghost") {
        e.currentTarget.style.backgroundColor = uiTokens.color.bgAlt;
      } else {
        e.currentTarget.style.backgroundColor = uiTokens.color.primaryHover;
      }
    }
    props.onMouseOver?.(e);
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      if (variant === "danger") {
        e.currentTarget.style.backgroundColor = uiTokens.color.danger;
      } else if (variant === "secondary") {
        e.currentTarget.style.backgroundColor = uiTokens.color.secondary;
      } else if (variant === "ghost") {
        e.currentTarget.style.backgroundColor = "transparent";
      } else {
        e.currentTarget.style.backgroundColor = uiTokens.color.primary;
      }
    }
    props.onMouseOut?.(e);
  };

  return (
    <button
      className={className}
      style={baseStyle}
      disabled={disabled}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    >
      {children}
    </button>
  );
}

