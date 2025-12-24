"use client";

import Link from "next/link";
import Select from "../ui/Select";
import LinkButton from "../ui/LinkButton";
import { uiTokens } from "../../lib/uiTokens";
import type {
  Breadcrumb,
  ContextAction,
} from "./useCmsContextBarData";
import type { Module } from "../../lib/domain/module";
import type { LessonMinimal } from "../../lib/domain/lesson";
import type { GroupMinimal } from "../../lib/domain/group";
import type { SlideMinimal } from "../../lib/domain/slide";
import { getModuleDisplayName } from "../../lib/utils/displayName";

export interface CmsContextBarViewProps {
  loadingAncestors: boolean;
  loadingSelectors: boolean;
  ancestors: import("./useCmsContextBarData").AncestorsState;
  modules: Module[];
  lessons: LessonMinimal[];
  groups: GroupMinimal[];
  slides: SlideMinimal[];
  currentModuleId?: string;
  currentLessonId?: string;
  currentGroupId?: string;
  currentSlideId?: string;
  breadcrumbs: Breadcrumb[];
  contextActions: ContextAction[];
  handleModuleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleLessonChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleGroupChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSlideChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function CmsContextBarView({
  loadingAncestors,
  loadingSelectors,
  breadcrumbs,
  modules,
  lessons,
  groups,
  slides,
  currentModuleId,
  currentLessonId,
  currentGroupId,
  currentSlideId,
  contextActions,
  handleModuleChange,
  handleLessonChange,
  handleGroupChange,
  handleSlideChange,
}: CmsContextBarViewProps) {
  return (
    <div
      style={{
        backgroundColor: uiTokens.color.bgAlt,
      }}
    >
      {/* Jump Selectors Row */}
      <div
        style={{
          padding: `${uiTokens.space.sm}px ${uiTokens.space.lg}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: uiTokens.space.md,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
        {/* Jump Selectors */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: uiTokens.space.sm,
            flexWrap: "wrap",
          }}
        >
          {loadingSelectors ? (
            <>
              <div
                style={{
                  width: 150,
                  height: 32,
                  backgroundColor: uiTokens.color.border,
                  borderRadius: uiTokens.radius.sm,
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  width: 150,
                  height: 32,
                  backgroundColor: uiTokens.color.border,
                  borderRadius: uiTokens.radius.sm,
                  opacity: 0.5,
                }}
              />
            </>
          ) : (
            <>
              {/* Module Selector */}
              {modules.length > 0 && (
                <Select
                  value={currentModuleId || ""}
                  onChange={handleModuleChange}
                  style={{ minWidth: 150, fontSize: uiTokens.font.meta.size }}
                >
                  <option value="">Jump to Module...</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {getModuleDisplayName(m)}
                      {!m.label && m.title && ` (${m.title})`}
                    </option>
                  ))}
                </Select>
              )}

              {/* Lesson Selector */}
              {lessons.length > 0 && (
                <Select
                  value={currentLessonId || ""}
                  onChange={handleLessonChange}
                  style={{ minWidth: 150, fontSize: uiTokens.font.meta.size }}
                >
                  <option value="">Jump to Lesson...</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </Select>
              )}

              {/* Group Selector */}
              {groups.length > 0 && (
                <Select
                  value={currentGroupId || ""}
                  onChange={handleGroupChange}
                  style={{ minWidth: 150, fontSize: uiTokens.font.meta.size }}
                >
                  <option value="">Jump to Group...</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </Select>
              )}

              {/* Slide Selector */}
              {slides.length > 0 && (
                <Select
                  value={currentSlideId || ""}
                  onChange={handleSlideChange}
                  style={{ minWidth: 150, fontSize: uiTokens.font.meta.size }}
                >
                  <option value="">Jump to Slide...</option>
                  {slides.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.type} {s.orderIndex !== null ? `(${s.orderIndex})` : ""}
                    </option>
                  ))}
                </Select>
              )}
            </>
          )}
        </div>
        </div>
      </div>

      {/* Context Actions Row */}
      {contextActions.length > 1 && (
        <div
          style={{
            padding: `${uiTokens.space.xs}px ${uiTokens.space.lg}px`,
            borderTop: `1px solid ${uiTokens.color.borderSubtle || uiTokens.color.border}`,
            display: "flex",
            alignItems: "center",
            gap: uiTokens.space.xs,
            flexWrap: "wrap",
          }}
        >
          {contextActions.map((action, index) => (
            <LinkButton
              key={index}
              href={action.href}
              variant="secondary"
              size="sm"
            >
              {action.label}
            </LinkButton>
          ))}
        </div>
      )}
    </div>
  );
}

