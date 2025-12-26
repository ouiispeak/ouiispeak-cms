/**
 * Test Page for Dynamic Form Components
 * 
 * DEBUG ONLY - This page is for testing the dynamic form system components.
 * Access at: http://localhost:3001/debug/test-dynamic-form
 * 
 * This page is in the /debug route group and should not be used in production.
 * It's kept for development/testing purposes only.
 * 
 * Tests:
 * 1. useSlideTypeConfig hook
 * 2. DynamicSlideForm component
 * 3. Field rendering
 * 4. Form value changes
 */

"use client";

import { useState } from "react";
import { useSlideTypeConfig } from "../../../lib/hooks/slides/useSlideTypeConfig";
import { DynamicSlideForm } from "../../../components/slide-editor/DynamicSlideForm";
import { shouldUseDynamicForm, getFeatureFlagStatus } from "../../../lib/config/featureFlags";
import { uiTokens } from "../../../lib/uiTokens";
import CmsPageShell from "../../../components/cms/CmsPageShell";

export default function TestDynamicFormPage() {
  const [slideType, setSlideType] = useState("text-slide");
  const [formValues, setFormValues] = useState<Record<string, any>>({
    slideId: "test-slide-id",
    slideType: "text-slide",
    groupId: "test-group-id",
    groupName: "Test Group",
    orderIndex: 1,
    label: "Test Slide Label",
    title: "Test Title",
    subtitle: "Test Subtitle",
    body: "Test body content goes here",
    buttons: '[{"label": "Next", "action": "next"}]'
  });

  const { config, loading, error } = useSlideTypeConfig(slideType);
  const featureFlags = getFeatureFlagStatus();

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log(`Field changed: ${fieldId} =`, value);
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  return (
    <CmsPageShell>
      <div style={{ padding: uiTokens.space.lg }}>
        <h1 style={{ fontSize: uiTokens.font.pageTitle.size, marginBottom: uiTokens.space.lg }}>
          Dynamic Form Test Page
        </h1>

        {/* Feature Flag Status */}
        <div style={{ 
          padding: uiTokens.space.md, 
          backgroundColor: "#e6f1f1",
          borderRadius: uiTokens.radius.sm,
          marginBottom: uiTokens.space.lg
        }}>
          <h2 style={{ fontSize: uiTokens.font.sectionTitle.size, marginTop: 0 }}>
            Feature Flag Status
          </h2>
          <pre style={{ fontSize: uiTokens.font.meta.size, overflow: "auto" }}>
            {JSON.stringify(featureFlags, null, 2)}
          </pre>
          <p style={{ fontSize: uiTokens.font.meta.size, color: uiTokens.color.mutedText }}>
            Should use dynamic form for "{slideType}": {shouldUseDynamicForm(slideType) ? "✅ Yes" : "❌ No"}
          </p>
        </div>

        {/* Slide Type Selector */}
        <div style={{ marginBottom: uiTokens.space.lg }}>
          <label style={{ display: "block", marginBottom: uiTokens.space.xs, fontSize: uiTokens.font.label.size }}>
            Slide Type:
          </label>
          <select
            value={slideType}
            onChange={(e) => setSlideType(e.target.value)}
            style={{
              padding: uiTokens.space.xs,
              fontSize: uiTokens.font.label.size,
              borderRadius: uiTokens.radius.sm,
              border: `1px solid ${uiTokens.color.inputBorder}`,
              minWidth: "200px"
            }}
          >
            <option value="text-slide">text-slide</option>
            <option value="title-slide">title-slide</option>
            <option value="ai-speak-repeat">ai-speak-repeat</option>
            <option value="ai-speak-student-repeat">ai-speak-student-repeat</option>
            <option value="speech-match">speech-match</option>
          </select>
        </div>

        {/* Hook Test Results */}
        <div style={{ 
          padding: uiTokens.space.md, 
          backgroundColor: loading ? "#fff3cd" : error ? "#f8d7da" : "#d1e7dd",
          borderRadius: uiTokens.radius.sm,
          marginBottom: uiTokens.space.lg
        }}>
          <h2 style={{ fontSize: uiTokens.font.sectionTitle.size, marginTop: 0 }}>
            Hook Test: useSlideTypeConfig
          </h2>
          {loading && <p>⏳ Loading configuration...</p>}
          {error && (
            <div>
              <p style={{ color: uiTokens.color.danger }}>❌ Error: {error}</p>
            </div>
          )}
          {config && (
            <div>
              <p style={{ color: "#155724" }}>✅ Configuration loaded successfully!</p>
              <details style={{ marginTop: uiTokens.space.md }}>
                <summary style={{ cursor: "pointer", fontSize: uiTokens.font.label.size }}>
                  View Configuration (click to expand)
                </summary>
                <pre style={{ 
                  fontSize: uiTokens.font.meta.size, 
                  overflow: "auto",
                  backgroundColor: "#fff",
                  padding: uiTokens.space.md,
                  borderRadius: uiTokens.radius.sm,
                  marginTop: uiTokens.space.xs
                }}>
                  {JSON.stringify(config, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Form Values Display */}
        <div style={{ 
          padding: uiTokens.space.md, 
          backgroundColor: "#f8f9fa",
          borderRadius: uiTokens.radius.sm,
          marginBottom: uiTokens.space.lg
        }}>
          <h2 style={{ fontSize: uiTokens.font.sectionTitle.size, marginTop: 0 }}>
            Current Form Values
          </h2>
          <details>
            <summary style={{ cursor: "pointer", fontSize: uiTokens.font.label.size }}>
              View Values (click to expand)
            </summary>
            <pre style={{ 
              fontSize: uiTokens.font.meta.size, 
              overflow: "auto",
              backgroundColor: "#fff",
              padding: uiTokens.space.md,
              borderRadius: uiTokens.radius.sm,
              marginTop: uiTokens.space.xs
            }}>
              {JSON.stringify(formValues, null, 2)}
            </pre>
          </details>
        </div>

        {/* Dynamic Form Test */}
        <div style={{ marginBottom: uiTokens.space.lg }}>
          <h2 style={{ fontSize: uiTokens.font.sectionTitle.size }}>
            Dynamic Form Component Test
          </h2>
          {shouldUseDynamicForm(slideType) ? (
            <div style={{ 
              padding: uiTokens.space.md,
              backgroundColor: "#d1e7dd",
              borderRadius: uiTokens.radius.sm,
              marginBottom: uiTokens.space.md
            }}>
              ✅ Dynamic form enabled for this slide type
            </div>
          ) : (
            <div style={{ 
              padding: uiTokens.space.md,
              backgroundColor: "#fff3cd",
              borderRadius: uiTokens.radius.sm,
              marginBottom: uiTokens.space.md
            }}>
              ⚠️ Dynamic form disabled. Enable in .env.local:
              <pre style={{ marginTop: uiTokens.space.xs, fontSize: uiTokens.font.meta.size }}>
                NEXT_PUBLIC_USE_DYNAMIC_FORM=true{'\n'}
                NEXT_PUBLIC_DYNAMIC_FORM_TYPES=text-slide
              </pre>
            </div>
          )}

          <div style={{ 
            border: `2px dashed ${uiTokens.color.inputBorder}`,
            padding: uiTokens.space.md,
            borderRadius: uiTokens.radius.sm
          }}>
            <DynamicSlideForm
              slideType={slideType}
              values={formValues}
              onChange={handleFieldChange}
            />
          </div>
        </div>

        {/* Instructions */}
        <div style={{ 
          padding: uiTokens.space.md, 
          backgroundColor: "#e7f3ff",
          borderRadius: uiTokens.radius.sm
        }}>
          <h3 style={{ fontSize: uiTokens.font.sectionTitle.size, marginTop: 0 }}>
            Testing Instructions
          </h3>
          <ol style={{ fontSize: uiTokens.font.label.size, lineHeight: 1.6 }}>
            <li>Check that the hook loads the configuration without errors</li>
            <li>Verify the configuration structure matches what's in the database</li>
            <li>Test changing form values - check console for change events</li>
            <li>Verify fields render correctly for text-slide</li>
            <li>Try switching to different slide types (may not have configs yet)</li>
            <li>Check browser console for any errors or warnings</li>
          </ol>
        </div>
      </div>
    </CmsPageShell>
  );
}

