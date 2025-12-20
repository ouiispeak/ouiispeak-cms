"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { uiTokens } from "../../lib/uiTokens";

export default function TopNav() {
  const pathname = usePathname();
  
  const isDashboardActive = pathname === "/";
  const isCefrActive = pathname.startsWith("/manage-modules/") || 
                       pathname.startsWith("/edit-level/") || 
                       pathname.startsWith("/level-aspects/");
  const isModuleActive = pathname.startsWith("/edit-module/") || 
                         pathname.startsWith("/module-lessons/");
  const isLessonActive = pathname.startsWith("/edit-lesson/") || 
                         pathname.startsWith("/lesson-slides/");
  const isGroupActive = pathname.startsWith("/edit-group/") || 
                        pathname.startsWith("/group-slides/");
  const isSlideActive = pathname.startsWith("/edit-slide/");

  // Level colors: background and border/underline
  const levelColors = {
    cefr: { bg: "#d9aea1", border: "#d09680" },
    module: { bg: "#e3c3b9", border: "#d7a592" },
    lesson: { bg: "#ecd7cf", border: "#deb4a5" },
    group: { bg: "#f2e4de", border: "#e4c3b7" },
    slide: { bg: "#f8f0ed", border: "#ebd2c9" },
  };

  const navLinkStyle = (
    isActive: boolean,
    isLast: boolean = false,
    levelType?: keyof typeof levelColors
  ): React.CSSProperties => {
    const colors = levelType && isActive ? levelColors[levelType] : null;
    return {
      fontSize: 14,
      fontWeight: isActive ? 500 : 400,
      textDecoration: "none",
      color: isActive ? uiTokens.color.text : uiTokens.color.textMuted,
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      flex: 1,
      transition: "background-color 0.2s, color 0.2s",
      borderBottom: isActive && colors ? `2px solid ${colors.border}` : isActive ? `2px solid #195149` : "2px solid transparent",
      borderRight: isLast ? "none" : "1px solid #595852",
      backgroundColor: isActive && colors ? colors.bg : isActive ? "#d3e3e1" : "transparent",
    };
  };

  const hoverStyle = {
    backgroundColor: "#d3e3e1",
    color: uiTokens.color.text,
  };

  return (
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            borderBottom: `1px solid #595852`,
            backgroundColor: "#f0ede9",
            display: "flex",
            alignItems: "stretch",
            height: 48,
          }}
        >
      <Link
        href="/"
        style={{
          ...navLinkStyle(isDashboardActive),
          borderRight: "3px solid #595852",
          flex: 2,
        }}
        onMouseEnter={(e) => {
          if (!isDashboardActive) {
            Object.assign(e.currentTarget.style, hoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          if (!isDashboardActive) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = uiTokens.color.textMuted;
          }
        }}
      >
        CMS Dashboard
      </Link>
      <span style={navLinkStyle(isCefrActive, false, "cefr")}>
        CEFR
      </span>
      <span style={navLinkStyle(isModuleActive, false, "module")}>
        Module
      </span>
      <span style={navLinkStyle(isLessonActive, false, "lesson")}>
        Lesson
      </span>
      <span style={navLinkStyle(isGroupActive, false, "group")}>
        Group
      </span>
      <span style={navLinkStyle(isSlideActive, true, "slide")}>
        Slide
      </span>
    </nav>
  );
}

