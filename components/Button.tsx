"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { primary, primaryHover, danger, dangerHover, secondary, secondaryHover } from "../lib/uiTokens";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({ variant = "primary", children, className = "", disabled, style, ...props }: ButtonProps) {
  const getVariantStyles = () => {
    if (disabled) {
      return {
        backgroundColor: primary,
        borderColor: primary,
        color: "#222326",
        opacity: 0.7,
      };
    }
    
    switch (variant) {
      case "danger":
        return {
          backgroundColor: danger,
          borderColor: danger,
          color: "#222326",
        };
      case "secondary":
        return {
          backgroundColor: secondary,
          borderColor: secondary,
          color: "#222326",
        };
      case "primary":
      default:
        return {
          backgroundColor: primary,
          borderColor: primary,
          color: "#222326",
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 400,
    borderRadius: 6,
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
        e.currentTarget.style.backgroundColor = dangerHover;
      } else if (variant === "secondary") {
        e.currentTarget.style.backgroundColor = secondaryHover;
      } else {
        e.currentTarget.style.backgroundColor = primaryHover;
      }
    }
    props.onMouseOver?.(e);
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      if (variant === "danger") {
        e.currentTarget.style.backgroundColor = danger;
      } else if (variant === "secondary") {
        e.currentTarget.style.backgroundColor = secondary;
      } else {
        e.currentTarget.style.backgroundColor = primary;
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

