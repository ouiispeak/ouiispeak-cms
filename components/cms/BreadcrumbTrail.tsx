"use client";

import { uiTokens } from "../../lib/uiTokens";
import { useCmsContextBarData } from "./useCmsContextBarData";
import { getModuleDisplayName } from "../../lib/utils/displayName";

type BreadcrumbTrailProps = {
  moduleId?: string | null;
  lessonId?: string | null;
  groupId?: string | null;
  slideId?: string | null;
};

export default function BreadcrumbTrail({ moduleId, lessonId, groupId, slideId }: BreadcrumbTrailProps) {
  const { ancestors, loadingAncestors } = useCmsContextBarData({
    moduleId: moduleId || undefined,
    lessonId: lessonId || undefined,
    groupId: groupId || undefined,
    slideId: slideId || undefined,
  });

  const segments: string[] = [];

  const addSegment = (label?: string | null) => {
    if (label) {
      segments.push(label);
    }
  };

  if (!loadingAncestors) {
    if (ancestors.type === "module") {
      addSegment(`Level ${ancestors.module.level?.toUpperCase() || "?"}`);
      addSegment(`Module ${ancestors.module.orderIndex ?? ""}: ${getModuleDisplayName(ancestors.module)}`);
    } else if (ancestors.type === "lesson") {
      addSegment(`Level ${ancestors.ancestors.module.level?.toUpperCase() || "?"}`);
      addSegment(`Module ${ancestors.ancestors.module.orderIndex ?? ""}: ${getModuleDisplayName(ancestors.ancestors.module)}`);
      addSegment(`Lesson ${ancestors.ancestors.lesson.orderIndex ?? ancestors.ancestors.lesson.title}`);
    } else if (ancestors.type === "group") {
      addSegment(`Level ${ancestors.ancestors.module.level?.toUpperCase() || "?"}`);
      addSegment(`Module ${ancestors.ancestors.module.orderIndex ?? ""}: ${getModuleDisplayName(ancestors.ancestors.module)}`);
      addSegment(`Lesson ${ancestors.ancestors.lesson.orderIndex ?? ancestors.ancestors.lesson.title}`);
      addSegment(`Group ${ancestors.ancestors.group.orderIndex ?? ancestors.ancestors.group.title}`);
    } else if (ancestors.type === "slide") {
      addSegment(`Level ${ancestors.ancestors.module.level?.toUpperCase() || "?"}`);
      addSegment(`Module ${ancestors.ancestors.module.orderIndex ?? ""}: ${getModuleDisplayName(ancestors.ancestors.module)}`);
      addSegment(`Lesson ${ancestors.ancestors.lesson.orderIndex ?? ancestors.ancestors.lesson.title}`);
      if (ancestors.ancestors.group) {
        addSegment(`Group ${ancestors.ancestors.group.orderIndex ?? ancestors.ancestors.group.title}`);
      }
      addSegment(`Slide ${ancestors.ancestors.slide.orderIndex ?? ancestors.ancestors.slide.id}`);
    }
  }

  return (
    <div
      style={{
        marginBottom: uiTokens.space.md,
        fontSize: uiTokens.font.meta.size,
        color: uiTokens.color.textMuted,
      }}
    >
      {loadingAncestors && <span>Loading context…</span>}
      {!loadingAncestors && ancestors.type === "error" && (
        <span style={{ color: uiTokens.color.danger }}>Failed to load context</span>
      )}
      {!loadingAncestors && ancestors.type !== "error" && segments.length > 0 && (
        <span>{segments.join(" / ")}</span>
      )}
    </div>
  );
}
