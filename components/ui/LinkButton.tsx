import { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { uiTokens } from "../../lib/uiTokens";

type LinkButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type LinkButtonSize = "sm" | "md";

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  children: ReactNode;
}

export default function LinkButton({
  href,
  variant = "primary",
  size = "md",
  children,
  style,
  target,
  rel,
  ...props
}: LinkButtonProps) {
  const isExternal = href.startsWith("http://") || href.startsWith("https://") || target === "_blank";
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          backgroundColor: uiTokens.color.danger,
          borderColor: uiTokens.color.danger,
          color: uiTokens.color.textOnDark,
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
          color: uiTokens.color.textOnDark,
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
    cursor: "pointer",
    fontFamily: "'Atkinson Hyperlegible', Arial, sans-serif",
    textDecoration: "none",
    display: "inline-block",
    transition: "background-color 0.2s",
    ...getVariantStyles(),
    ...style,
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (variant === "danger") {
      e.currentTarget.style.backgroundColor = uiTokens.color.dangerHover;
    } else if (variant === "secondary") {
      e.currentTarget.style.backgroundColor = uiTokens.color.secondaryHover;
    } else if (variant === "ghost") {
      e.currentTarget.style.backgroundColor = uiTokens.color.bgAlt;
    } else {
      e.currentTarget.style.backgroundColor = uiTokens.color.primaryHover;
    }
    // Change text color to #a95f43 on hover for grid links
    if (variant === "secondary" || variant === "ghost") {
      e.currentTarget.style.color = "#a95f43";
    }
    props.onMouseOver?.(e);
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (variant === "danger") {
      e.currentTarget.style.backgroundColor = uiTokens.color.danger;
    } else if (variant === "secondary") {
      e.currentTarget.style.backgroundColor = uiTokens.color.secondary;
      e.currentTarget.style.color = uiTokens.color.secondaryText;
    } else if (variant === "ghost") {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = uiTokens.color.text;
    } else {
      e.currentTarget.style.backgroundColor = uiTokens.color.primary;
    }
    props.onMouseOut?.(e);
  };

  if (isExternal) {
    return (
      <a
        href={href}
        style={baseStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        target={target}
        rel={rel || (target === "_blank" ? "noreferrer" : undefined)}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      style={baseStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    >
      {children}
    </Link>
  );
}

