"use client";

import React from "react";
import CmsSection from "../ui/CmsSection";
import LinkButton from "../ui/LinkButton";
import { Button } from "../Button";
import { uiTokens } from "../../lib/uiTokens";
import type { CmsHierarchyMaps } from "../../lib/data/buildHierarchy";
import { isDebugEnabled } from "../../lib/utils/debugGate";

const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

interface CmsDashboardTreeProps {
  maps: CmsHierarchyMaps;
  openLevels: Record<string, boolean>;
  openModules: Record<string, boolean>;
  openLessons: Record<string, boolean>;
  openGroups: Record<string, boolean>;
  onToggleLevel: (level: string) => void;
  onToggleModule: (moduleId: string) => void;
  onToggleLesson: (lessonId: string) => void;
  onToggleGroup: (groupId: string) => void;
  onDeleteModule: (id: string, title: string) => void;
  onDeleteLesson: (id: string, title: string) => void;
  onDeleteGroup?: (id: string, title: string) => void;
  onDeleteSlide?: (id: string) => void;
}

export default function CmsDashboardTree({
  maps,
  openLevels,
  openModules,
  openLessons,
  openGroups,
  onToggleLevel,
  onToggleModule,
  onToggleLesson,
  onToggleGroup,
  onDeleteModule,
  onDeleteLesson,
  onDeleteGroup,
  onDeleteSlide,
}: CmsDashboardTreeProps) {
  return (
    <>
      {LEVELS.map((lvl) => {
        const levelModules = maps.modulesByLevel.get(lvl) ?? [];
        const isOpen = !!openLevels[lvl];

        return (
          <CmsSection
            key={lvl}
            backgroundColor="#d9aea1"
          >
            {/* CEFR Level Row */}
            <div
              style={{
                padding: `${uiTokens.space.sm}px ${uiTokens.space.lg}px`,
                paddingLeft: uiTokens.space.lg,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: isOpen && levelModules.length > 0 ? uiTokens.space.md : 0,
              }}
            >
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLevel(lvl);
                }}
                style={{
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: uiTokens.space.xs,
                  fontSize: uiTokens.font.sectionTitle.size,
                  fontWeight: 500,
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  color: "#192026",
                }}
                onMouseOver={(e) => {
                  e.stopPropagation();
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#a95f43";
                }}
                onMouseOut={(e) => {
                  e.stopPropagation();
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#192026";
                }}
              >
                <span style={{ fontSize: uiTokens.font.sectionTitle.size }}>
                  {isOpen ? "▾" : "▸"}
                </span>
                <span>{lvl}</span>
              </Button>

              <div style={{ display: "flex", gap: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, alignItems: "center" }}>
                <span style={{ color: uiTokens.color.textMuted }}>
                  {levelModules.length} modules
                </span>
                <LinkButton href={`/manage-modules/${lvl}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                  </svg>
                </LinkButton>
                <LinkButton href={`/edit-level/${lvl}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </LinkButton>
                <LinkButton
                  href={lvl === "A0" ? "/cefr/a0/standards" : `/level-aspects/${lvl}`}
                  size="sm"
                  style={{
                    padding: "6px 12px",
                    fontSize: 13,
                    fontWeight: 400,
                    borderRadius: uiTokens.radius.md,
                    border: `1px solid ${uiTokens.color.primary}`,
                    backgroundColor: uiTokens.color.primary,
                    color: "#f8f0ed",
                  }}
                  title="View level standards"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                  </svg>
                </LinkButton>
              </div>
            </div>
            <div>
              {isOpen && levelModules.length > 0 ? (
                levelModules.map((m, moduleIndex) => {
                  const mid = m.id;
                  const moduleOpen = !!openModules[mid];
                  const moduleLessons = maps.lessonsByModule.get(mid) ?? [];

                  return (
                    <div
                      key={mid}
                      style={{
                        borderRadius: uiTokens.radius.lg,
                        marginBottom: uiTokens.space.xs,
                        backgroundColor: "#e3c3b9",
                        overflow: "hidden",
                      }}
                    >
                      {/* Module Row */}
                      <div
                        style={{
                          padding: `${uiTokens.space.sm}px ${uiTokens.space.lg}px`,
                          paddingLeft: uiTokens.space.lg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => onToggleModule(mid)}
                          style={{
                            padding: 0,
                            fontWeight: 400,
                            fontSize: uiTokens.font.label.size,
                            textAlign: "left",
                            border: "none",
                            background: "transparent",
                            color: "#192026",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#a95f43";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#192026";
                          }}
                        >
                          {moduleOpen ? "▾" : "▸"} <span style={{ fontWeight: 600 }}>Module {moduleIndex + 1}:</span> {m.title}
                        </Button>

                        <div style={{ display: "flex", gap: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, alignItems: "center" }}>
                          <span style={{ color: uiTokens.color.textMuted }}>
                            {moduleLessons.length} lessons
                          </span>
                          <LinkButton href={`/module-lessons/${mid}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                            </svg>
                          </LinkButton>
                          <LinkButton href={`/edit-module/${mid}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </LinkButton>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDeleteModule(mid, m.title)}
                            title={moduleLessons.length > 0 ? `Delete module (will also delete ${moduleLessons.length} lesson${moduleLessons.length !== 1 ? "s" : ""})` : "Delete module"}
                            style={{ color: "#f8f0ed" }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </Button>
                        </div>
                      </div>

                      {moduleOpen && moduleLessons.length > 0 ? (
                        moduleLessons.map((l, lessonIndex) => {
                          const lid = l.id;
                          const lessonOpen = !!openLessons[lid];
                          const lessonGroups = maps.groupsByLesson.get(lid) ?? [];
                          const ungroupedSlides = maps.ungroupedSlidesByLesson.get(lid) ?? [];

                          return (
                            <div
                              key={lid}
                              style={{
                                borderRadius: uiTokens.radius.lg,
                                marginBottom: uiTokens.space.xs,
                                marginLeft: uiTokens.space.md,
                                backgroundColor: "#ecd7cf",
                                overflow: "hidden",
                              }}
                            >
                              {/* Lesson Row */}
                              <div
                                style={{
                                  padding: `${uiTokens.space.xs}px ${uiTokens.space.lg}px`,
                                  paddingLeft: uiTokens.space.lg * 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Button
                                  variant="ghost"
                                  onClick={() => onToggleLesson(lid)}
                                  style={{
                                    padding: 0,
                                    fontWeight: 400,
                                    fontSize: uiTokens.font.meta.size,
                                    textAlign: "left",
                                    border: "none",
                                    background: "transparent",
                                    color: "#192026",
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#a95f43";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#192026";
                                  }}
                                >
                                  {lessonOpen ? "▾" : "▸"} <span style={{ fontWeight: 600 }}>Lesson {lessonIndex + 1}:</span> {l.title}
                                </Button>

                                <div style={{ display: "flex", gap: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, alignItems: "center" }}>
                                  <LinkButton href={`/lesson-slides/${lid}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                                    </svg>
                                  </LinkButton>
                                  <LinkButton href={`/edit-lesson/${lid}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                  </LinkButton>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => onDeleteLesson(lid, l.title)}
                                    title={(lessonGroups.length > 0 || ungroupedSlides.length > 0) ? `Delete lesson (will also delete ${lessonGroups.length} group${lessonGroups.length !== 1 ? "s" : ""} and ${ungroupedSlides.length} slide${ungroupedSlides.length !== 1 ? "s" : ""})` : "Delete lesson"}
                                    style={{ color: "#f8f0ed", border: "none" }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>

                              {lessonOpen && (
                                <div style={{ marginLeft: uiTokens.space.md }}>
                                  {lessonGroups.length > 0 ? (
                                    lessonGroups.map((g, groupIndex) => {
                                      const gid = g.id;
                                      const groupOpen = !!openGroups[gid];
                                      const groupSlides = maps.slidesByGroup.get(gid) ?? [];

                                      return (
                                        <div
                                          key={gid}
                                          style={{
                                            borderRadius: uiTokens.radius.lg,
                                            marginBottom: uiTokens.space.xs,
                                            marginLeft: uiTokens.space.md,
                                            backgroundColor: "#f2e4de",
                                            overflow: "hidden",
                                          }}
                                        >
                                          {/* Group Row */}
                                          <div
                                            style={{
                                              padding: `${uiTokens.space.xs}px ${uiTokens.space.lg}px`,
                                              paddingLeft: uiTokens.space.lg * 3,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <Button
                                              variant="ghost"
                                              onClick={() => onToggleGroup(gid)}
                                              style={{
                                                padding: 0,
                                                fontWeight: 400,
                                                fontSize: uiTokens.font.meta.size,
                                                textAlign: "left",
                                                border: "none",
                                                background: "transparent",
                                                color: "#192026",
                                              }}
                                              onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                                e.currentTarget.style.color = "#a95f43";
                                              }}
                                              onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                                e.currentTarget.style.color = "#192026";
                                              }}
                                            >
                                              {groupOpen ? "▾" : "▸"} <span style={{ fontWeight: 600 }}>Group {groupIndex + 1}:</span> {g.title}
                                            </Button>

                                            <div style={{ display: "flex", gap: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, alignItems: "center" }}>
                                              <span style={{ color: uiTokens.color.textMuted }}>
                                                {groupSlides.length} slides
                                              </span>
                                              <LinkButton href={`/group-slides/${gid}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                                                </svg>
                                              </LinkButton>
                                              <LinkButton href={`/edit-group/${gid}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                              </LinkButton>
                                              <Button
                                                variant="danger"
                                                size="sm"
                                                disabled={groupSlides.length > 0 || !onDeleteGroup}
                                                onClick={() => onDeleteGroup?.(gid, g.title)}
                                                title={groupSlides.length > 0 ? `Cannot delete: group contains ${groupSlides.length} slide${groupSlides.length !== 1 ? "s" : ""}` : !onDeleteGroup ? "Delete not available" : "Delete group"}
                                                style={{ 
                                                  color: groupSlides.length > 0 || !onDeleteGroup ? "#dededc" : "#f8f0ed",
                                                  backgroundColor: groupSlides.length > 0 || !onDeleteGroup ? "#cdcdcb" : undefined,
                                                  border: "none"
                                                }}
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={groupSlides.length > 0 || !onDeleteGroup ? "#8b8a86" : "#f8f0ed"} style={{ width: 16, height: 16 }}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                              </Button>
                                            </div>
                                          </div>

                                          {groupOpen && groupSlides.length > 0 ? (
                                            <div style={{ marginLeft: uiTokens.space.md }}>
                                            {groupSlides.map((s, slideIndex) => {
                                              const title =
                                                s?.propsJson && typeof s.propsJson === "object"
                                                  ? (s.propsJson as any).title
                                                  : undefined;

                                              return (
                                                <div
                                                  key={s.id}
                                                  style={{
                                                    borderRadius: uiTokens.radius.lg,
                                                    marginBottom: uiTokens.space.xs,
                                                    marginLeft: uiTokens.space.md,
                                                    padding: `${uiTokens.space.xs}px ${uiTokens.space.lg}px`,
                                                    paddingLeft: uiTokens.space.lg * 4,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    backgroundColor: "#f8f0ed",
                                                    overflow: "hidden",
                                                  }}
                                                >
                                                  <div style={{ flex: 1 }}>
                                                    <span
                                                      style={{
                                                        fontWeight: 600,
                                                        fontSize: uiTokens.font.meta.size,
                                                        color: uiTokens.color.text,
                                                      }}
                                                    >
                                                      Slide {slideIndex + 1}:
                                                    </span>
                                                    <span
                                                      style={{
                                                        fontWeight: 400,
                                                        fontSize: uiTokens.font.meta.size,
                                                        color: uiTokens.color.text,
                                                        marginLeft: uiTokens.space.xs,
                                                      }}
                                                    >
                                                      {s.type}
                                                    </span>
                                                    {title && (
                                                      <span
                                                        style={{
                                                          color: uiTokens.color.textMuted,
                                                          marginLeft: 8,
                                                          fontSize: uiTokens.font.meta.size,
                                                        }}
                                                      >
                                                        — {title}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center" }}>
                                                    <LinkButton href={`/edit-slide/${s.id}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                      </svg>
                                                    </LinkButton>
                                                    <Button
                                                      variant="danger"
                                                      size="sm"
                                                      disabled={!onDeleteSlide}
                                                      onClick={() => onDeleteSlide?.(s.id)}
                                                      title={onDeleteSlide ? "Delete slide" : "Delete not available"}
                                                      style={{ 
                                                        color: !onDeleteSlide ? "#dededc" : "#f8f0ed",
                                                        backgroundColor: !onDeleteSlide ? "#cdcdcb" : undefined,
                                                        border: "none"
                                                      }}
                                                    >
                                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={!onDeleteSlide ? "#8b8a86" : "#f8f0ed"} style={{ width: 16, height: 16 }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                      </svg>
                                                    </Button>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                            </div>
                                          ) : groupOpen ? (
                                            <div
                                              style={{
                                                padding: `${uiTokens.space.xs}px ${uiTokens.space.lg}px`,
                                                paddingLeft: uiTokens.space.lg * 4,
                                                color: uiTokens.color.textMuted,
                                                fontSize: uiTokens.font.meta.size,
                                              }}
                                            >
                                              No slides in this group yet.
                                            </div>
                                          ) : null}
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div
                                      style={{
                                        padding: `${uiTokens.space.xs}px ${uiTokens.space.lg}px`,
                                        paddingLeft: uiTokens.space.lg * 3,
                                        color: uiTokens.color.textMuted,
                                        fontSize: uiTokens.font.meta.size,
                                      }}
                                    >
                                      No groups yet.
                                    </div>
                                  )}

                                  {ungroupedSlides.length > 0 && (
                                    <>
                                      <div
                                        style={{
                                          padding: `${uiTokens.space.xs}px ${uiTokens.space.lg}px`,
                                          paddingLeft: uiTokens.space.lg * 3,
                                          fontWeight: 400,
                                          fontSize: uiTokens.font.meta.size,
                                          color: uiTokens.color.textMuted,
                                        }}
                                      >
                                        Ungrouped slides
                                      </div>
                                      {ungroupedSlides.map((s, slideIndex) => {
                                        const title =
                                          s?.propsJson && typeof s.propsJson === "object"
                                            ? (s.propsJson as any).title
                                            : undefined;

                                        return (
                                          <div
                                            key={s.id}
                                            style={{
                                              borderRadius: uiTokens.radius.lg,
                                              marginBottom: uiTokens.space.xs,
                                              marginLeft: uiTokens.space.md,
                                              padding: `${uiTokens.space.xs}px ${uiTokens.space.lg}px`,
                                              paddingLeft: uiTokens.space.lg * 4,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                              backgroundColor: "#f8f0ed",
                                              overflow: "hidden",
                                            }}
                                          >
                                            <div style={{ flex: 1 }}>
                                              <span
                                                style={{
                                                  fontWeight: 600,
                                                  fontSize: uiTokens.font.meta.size,
                                                  color: uiTokens.color.text,
                                                }}
                                              >
                                                Slide {slideIndex + 1}:
                                              </span>
                                              <span
                                                style={{
                                                  fontWeight: 400,
                                                  fontSize: uiTokens.font.meta.size,
                                                  color: uiTokens.color.text,
                                                  marginLeft: uiTokens.space.xs,
                                                }}
                                              >
                                                {s.type}
                                              </span>
                                              {title && (
                                                <span
                                                  style={{
                                                    color: uiTokens.color.textMuted,
                                                    marginLeft: 8,
                                                    fontSize: uiTokens.font.meta.size,
                                                  }}
                                                >
                                                  — {title}
                                                </span>
                                              )}
                                            </div>
                                            <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center" }}>
                                              <LinkButton href={`/edit-slide/${s.id}`} size="sm" style={{ color: "#f8f0ed", border: "none" }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f8f0ed" style={{ width: 16, height: 16 }}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                              </LinkButton>
                                              <Button
                                                variant="danger"
                                                size="sm"
                                                disabled={!onDeleteSlide}
                                                onClick={() => onDeleteSlide?.(s.id)}
                                                title={onDeleteSlide ? "Delete slide" : "Delete not available"}
                                                style={{ 
                                                  color: !onDeleteSlide ? "#dededc" : "#f8f0ed",
                                                  backgroundColor: !onDeleteSlide ? "#cdcdcb" : undefined,
                                                  border: "none"
                                                }}
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={!onDeleteSlide ? "#8b8a86" : "#f8f0ed"} style={{ width: 16, height: 16 }}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : moduleOpen ? (
                        <div
                          style={{
                            padding: `${uiTokens.space.xs}px ${uiTokens.space.lg}px`,
                            paddingLeft: uiTokens.space.lg * 2,
                            color: uiTokens.color.textMuted,
                            fontSize: uiTokens.font.meta.size,
                          }}
                        >
                          No lessons yet.
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : isOpen ? (
                <div
                  style={{
                    padding: uiTokens.space.md,
                    paddingLeft: uiTokens.space.lg,
                    borderBottom: `1px solid ${uiTokens.color.border}`,
                    color: uiTokens.color.textMuted,
                    fontSize: uiTokens.font.meta.size,
                  }}
                >
                  No modules yet.
                </div>
              ) : null}
            </div>
          </CmsSection>
        );
      })}
    </>
  );
}
