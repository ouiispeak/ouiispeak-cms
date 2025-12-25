"use client";

import { useState, useEffect } from "react";
import { listStorageItems, getAudioFileUrl, type StorageItem } from "../../lib/storage/audioFiles";
import Input from "./Input";
import { uiTokens } from "../../lib/uiTokens";
import { Button } from "../Button";

interface AudioFileSelectorProps {
  value: string;
  onChange: (value: string) => void;
  bucketName: string;
}

export default function AudioFileSelector({
  value,
  onChange,
  bucketName,
}: AudioFileSelectorProps) {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);

  useEffect(() => {
    if (showBrowser) {
      loadItems();
    }
  }, [showBrowser, bucketName, currentFolder]);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: listError } = await listStorageItems(bucketName, currentFolder);
      if (listError) {
        setError(listError);
        console.error("Storage list error:", listError);
      } else {
        console.log("Storage items loaded:", data?.length || 0, "items in folder:", currentFolder || "root");
        setItems(data || []);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to load items";
      setError(errorMsg);
      console.error("Error loading storage items:", err);
    }
    setLoading(false);
  }

  function handleSelectFile(filePath: string) {
    onChange(filePath);
    setShowBrowser(false);
  }

  function handleNavigateToFolder(folderPath: string) {
    setCurrentFolder(folderPath);
  }

  function handleNavigateUp() {
    if (!currentFolder) return;
    const parts = currentFolder.split("/").filter(Boolean);
    parts.pop();
    setCurrentFolder(parts.length > 0 ? parts.join("/") : "");
  }

  function getBreadcrumbs(): string[] {
    if (!currentFolder) return [];
    return currentFolder.split("/").filter(Boolean);
  }

  function getCurrentPathDisplay(): string {
    if (!currentFolder) return "Root";
    return currentFolder;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center" }}>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter audio file path or select from storage"
          style={{ flex: 1 }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowBrowser(!showBrowser);
            if (!showBrowser) {
              setCurrentFolder(""); // Reset to root when opening
            }
          }}
        >
          {showBrowser ? "Hide" : "Browse"}
        </Button>
      </div>

      {showBrowser && (
        <div
          style={{
            marginTop: uiTokens.space.sm,
            padding: uiTokens.space.md,
            border: `1px solid ${uiTokens.color.border}`,
            borderRadius: uiTokens.radius.md,
            backgroundColor: uiTokens.color.surface,
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {/* Breadcrumb navigation */}
          <div style={{ marginBottom: uiTokens.space.sm, display: "flex", gap: uiTokens.space.xs, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setCurrentFolder("")}
              style={{
                padding: `${uiTokens.space.xs} ${uiTokens.space.sm}`,
                fontSize: uiTokens.font.meta.size,
                color: currentFolder ? uiTokens.color.primary : uiTokens.color.text,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                textDecoration: currentFolder ? "underline" : "none",
                fontWeight: currentFolder ? "normal" : "600",
              }}
            >
              Root
            </button>
            {getBreadcrumbs().map((crumb, index) => {
              const pathParts = getBreadcrumbs().slice(0, index + 1);
              const path = pathParts.join("/");
              const isLast = index === getBreadcrumbs().length - 1;
              return (
                <span key={index} style={{ display: "flex", alignItems: "center", gap: uiTokens.space.xs }}>
                  <span style={{ color: uiTokens.color.textMuted }}>/</span>
                  <button
                    type="button"
                    onClick={() => setCurrentFolder(path)}
                    style={{
                      padding: `${uiTokens.space.xs} ${uiTokens.space.sm}`,
                      fontSize: uiTokens.font.meta.size,
                      color: isLast ? uiTokens.color.text : uiTokens.color.primary,
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: isLast ? "none" : "underline",
                      fontWeight: isLast ? "600" : "normal",
                    }}
                  >
                    {crumb}
                  </button>
                </span>
              );
            })}
            {currentFolder && (
              <button
                type="button"
                onClick={handleNavigateUp}
                style={{
                  marginLeft: uiTokens.space.sm,
                  padding: `${uiTokens.space.xs} ${uiTokens.space.sm}`,
                  fontSize: uiTokens.font.meta.size,
                  color: uiTokens.color.text,
                  backgroundColor: uiTokens.color.surface,
                  border: `1px solid ${uiTokens.color.border}`,
                  borderRadius: uiTokens.radius.sm,
                  cursor: "pointer",
                }}
              >
                ↑ Up
              </button>
            )}
          </div>

          {/* Current path display */}
          <div style={{ marginBottom: uiTokens.space.sm, fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
            Current: <code style={{ backgroundColor: uiTokens.color.surface, padding: `2px ${uiTokens.space.xs}`, borderRadius: uiTokens.radius.xs }}>{getCurrentPathDisplay()}</code>
          </div>

          {loading && <p style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>Loading...</p>}
          {error && (
            <div style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.danger }}>
              <p><strong>Error:</strong> {error}</p>
              <p style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size * 0.9 }}>
                Make sure the bucket "{bucketName}" has SELECT permissions on storage.objects for the anon role.
                Check the browser console for more details.
              </p>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
              <p>No items found in this folder.</p>
              <p style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size * 0.9 }}>
                Check browser console (F12) for debugging information.
              </p>
            </div>
          )}
          {!loading && !error && items.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: uiTokens.space.xs }}>
              {/* Show folders first */}
              {items
                .filter((item) => item.isFolder)
                .map((item) => (
                  <button
                    key={item.fullPath}
                    type="button"
                    onClick={() => handleNavigateToFolder(item.fullPath)}
                    style={{
                      padding: uiTokens.space.xs,
                      textAlign: "left",
                      border: `1px solid ${uiTokens.color.border}`,
                      borderRadius: uiTokens.radius.sm,
                      backgroundColor: "#f0f7f7",
                      cursor: "pointer",
                      fontSize: uiTokens.font.meta.size,
                      color: uiTokens.color.text,
                      display: "flex",
                      alignItems: "center",
                      gap: uiTokens.space.xs,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e0efef";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f7f7";
                    }}
                  >
                    <span>📁</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              {/* Then show audio files */}
              {items
                .filter((item) => !item.isFolder)
                .map((item) => {
                  const isSelected = value === item.fullPath;
                  return (
                    <button
                      key={item.fullPath}
                      type="button"
                      onClick={() => handleSelectFile(item.fullPath)}
                      style={{
                        padding: uiTokens.space.xs,
                        textAlign: "left",
                        border: `1px solid ${isSelected ? uiTokens.color.primary : uiTokens.color.border}`,
                        borderRadius: uiTokens.radius.sm,
                        backgroundColor: isSelected ? "#d3e3e1" : "transparent",
                        cursor: "pointer",
                        fontSize: uiTokens.font.meta.size,
                        color: uiTokens.color.text,
                        display: "flex",
                        alignItems: "center",
                        gap: uiTokens.space.xs,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = uiTokens.color.surface;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <span>🎵</span>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {value && (
        <div style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size, color: uiTokens.color.textMuted }}>
          Preview URL: <code style={{ backgroundColor: uiTokens.color.surface, padding: `2px ${uiTokens.space.xs}`, borderRadius: uiTokens.radius.xs }}>{getAudioFileUrl(bucketName, value)}</code>
        </div>
      )}
    </div>
  );
}

