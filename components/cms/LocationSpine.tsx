"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCmsContextBarData } from "./useCmsContextBarData";
import { uiTokens } from "../../lib/uiTokens";

interface LocationSpineProps {
  moduleId?: string;
  lessonId?: string;
  groupId?: string;
  slideId?: string;
  level?: string;
}

export default function LocationSpine({
  moduleId,
  lessonId,
  groupId,
  slideId,
  level,
}: LocationSpineProps) {
  const pathname = usePathname();
  const { ancestors } = useCmsContextBarData({
    moduleId,
    lessonId,
    groupId,
    slideId,
  });

  // Handle level-based pages
  if (level) {
    const levelUpper = level.toUpperCase();
    let pageType = "";
    let showLevelAtEnd = true;
    if (pathname?.includes("/manage-modules/")) {
      pageType = "Manage CEFR";
      showLevelAtEnd = false;
    } else if (pathname?.includes("/edit-level/")) {
      pageType = "Edit Level";
    } else if (pathname?.includes("/level-aspects/")) {
      pageType = "Level Aspects";
      showLevelAtEnd = false;
    }

    if (pageType) {
      return (
        <div
          style={{
            position: "sticky",
            top: 48,
            zIndex: 99,
            padding: `${uiTokens.space.sm}px ${uiTokens.space.lg}px`,
            borderBottom: `1px solid #595852`,
            backgroundColor: uiTokens.color.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 400, color: uiTokens.color.textMuted }}>
            {levelUpper}
          </span>
          <span style={{ color: uiTokens.color.textMuted, margin: `0 ${uiTokens.space.xs}px`, fontSize: 15 }}>/</span>
          <span style={{ fontSize: 15, fontWeight: showLevelAtEnd ? 400 : 600, color: uiTokens.color.textMuted }}>
            {pageType}
          </span>
          {showLevelAtEnd && (
            <>
              <span style={{ color: uiTokens.color.textMuted, margin: `0 ${uiTokens.space.xs}px`, fontSize: 15 }}>/</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: uiTokens.color.textMuted }}>
                {levelUpper}
              </span>
            </>
          )}
        </div>
      );
    }
  }

  // On home page (no context), show simple anchor label
  if (!moduleId && !lessonId && !groupId && !slideId && !level) {
    return (
          <div
            style={{
              position: "sticky",
              top: 48,
              zIndex: 99,
              padding: `${uiTokens.space.sm}px ${uiTokens.space.lg}px`,
              borderBottom: `1px solid #595852`,
              backgroundColor: uiTokens.color.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: uiTokens.space.md,
            }}
          >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: uiTokens.color.textMuted,
          }}
        >
          Curriculum Map (A0–C2):
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 400,
            color: uiTokens.color.textMuted,
          }}
        >
          Organize your curriculum from CEFR levels down to individual slides.
        </span>
      </div>
    );
  }

  // Build hierarchy trail from ancestors
  const trail: Array<{ label: string; href: string; isCurrent: boolean }> = [];

  if (ancestors.type === "loading" || ancestors.type === "error") {
    // Still loading or error - show minimal
    return null;
  }

  if (ancestors.type === "module") {
    // Level / Edit Module or Manage Module / Title
    const level = ancestors.module.level?.toUpperCase() || "Unknown";
    const isManageLessons = pathname?.includes("/module-lessons/");
    trail.push({
      label: level,
      href: "/",
      isCurrent: false,
    });
    trail.push({
      label: isManageLessons ? "Manage Module" : "Edit Module",
      href: "",
      isCurrent: false,
    });
    trail.push({
      label: ancestors.module.title,
      href: isManageLessons ? `/module-lessons/${ancestors.module.id}` : `/edit-module/${ancestors.module.id}`,
      isCurrent: true,
    });
  } else if (ancestors.type === "lesson") {
    // Level / Manage Lesson / Title
    const level = ancestors.ancestors.module.level?.toUpperCase() || "Unknown";
    trail.push({
      label: level,
      href: "/",
      isCurrent: false,
    });
    trail.push({
      label: "Manage Lesson",
      href: "",
      isCurrent: false,
    });
    trail.push({
      label: ancestors.ancestors.lesson.title,
      href: `/lesson-slides/${ancestors.ancestors.lesson.id}`,
      isCurrent: true,
    });
  } else if (ancestors.type === "group") {
    // Level / Edit Group or Manage Group / Title
    const level = ancestors.ancestors.module.level?.toUpperCase() || "Unknown";
    const isManageSlides = pathname?.includes("/group-slides/");
    trail.push({
      label: level,
      href: "/",
      isCurrent: false,
    });
    trail.push({
      label: isManageSlides ? "Manage Group" : "Edit Group",
      href: "",
      isCurrent: false,
    });
    trail.push({
      label: ancestors.ancestors.group.title,
      href: isManageSlides ? `/group-slides/${ancestors.ancestors.group.id}` : `/edit-group/${ancestors.ancestors.group.id}`,
      isCurrent: true,
    });
  } else if (ancestors.type === "slide") {
    // Level / Edit Slide / Slide Type / Slide Title
    const level = ancestors.ancestors.module.level?.toUpperCase() || "Unknown";
    const slide = ancestors.ancestors.slide;
    const slideTitle = slide?.propsJson && typeof slide.propsJson === "object"
      ? (slide.propsJson as any).title
      : undefined;
    
    trail.push({
      label: level,
      href: "/",
      isCurrent: false,
    });
    trail.push({
      label: "Edit Slide",
      href: "",
      isCurrent: false,
    });
    trail.push({
      label: slide.type || "Slide",
      href: `/edit-slide/${slide.id}`,
      isCurrent: false,
    });
    if (slideTitle) {
      trail.push({
        label: slideTitle,
        href: `/edit-slide/${slide.id}`,
        isCurrent: true,
      });
    } else {
      // If no title, make the slide type the current item
      trail[trail.length - 1].isCurrent = true;
    }
  }

  if (trail.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 48,
        zIndex: 99,
        padding: `${uiTokens.space.sm}px ${uiTokens.space.lg}px`,
        borderBottom: `1px solid #595852`,
        backgroundColor: uiTokens.color.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 0,
      }}
    >
      {trail.map((item, index) => (
        <span key={index} style={{ display: "flex", alignItems: "center" }}>
          {index > 0 && (
            <span
              style={{
                color: uiTokens.color.textMuted,
                margin: `0 ${uiTokens.space.xs}px`,
                fontSize: 15,
              }}
            >
              /
            </span>
          )}
          {item.href === "" ? (
            <span
              style={{
                fontSize: 15,
                fontWeight: 400,
                color: uiTokens.color.textMuted,
              }}
            >
              {item.label}
            </span>
          ) : item.isCurrent ? (
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: uiTokens.color.textMuted,
              }}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              style={{
                fontSize: 15,
                fontWeight: 400,
                color: uiTokens.color.textMuted,
                textDecoration: "none",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#a95f43";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = uiTokens.color.textMuted;
              }}
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}


