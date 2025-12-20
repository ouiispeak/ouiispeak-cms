"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadLessonManagement } from "../../../../lib/data/lessonManagement";
import PageShell from "../../../../components/ui/PageShell";
import CmsSection from "../../../../components/ui/CmsSection";
import { uiTokens } from "../../../../lib/uiTokens";
import { isDebugEnabled, DebugGate } from "../../../../lib/utils/debugGate";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: import("../../../../lib/data/lessonManagement").LessonManagementData };

export default function LessonPreviewPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId;

  const [state, setState] = useState<LoadState>({ status: "loading" });

  // Debug route gate - prevents access in production
  if (!isDebugEnabled()) {
    return <DebugGate />;
  }

  useEffect(() => {
    if (!lessonId) {
      setState({ status: "error", message: "No lessonId in URL." });
      return;
    }

    async function run() {
      setState({ status: "loading" });
      const { data, error } = await loadLessonManagement(lessonId);
      
      if (error) {
        setState({
          status: "error",
          message: error,
        });
        return;
      }

      if (!data) {
        setState({
          status: "error",
          message: "Failed to load lesson data.",
        });
        return;
      }

      setState({ status: "ready", data });
    }

    run();
  }, [lessonId]);

  return (
    <PageShell
      title="Lesson Preview (Debug)"
      maxWidth={980}
      meta={
        <>
          lessonId: <code className="codeText">{lessonId}</code>
        </>
      }
    >
      {state.status === "loading" && <p>Loading…</p>}
      {state.status === "error" && (
        <CmsSection title="Error" description={state.message}>
          <p style={{ color: uiTokens.color.danger }}>Error: {state.message}</p>
        </CmsSection>
      )}

      {state.status === "ready" && (
        <CmsSection title="Lesson JSON">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(state.data, null, 2)}
          </pre>
        </CmsSection>
      )}
    </PageShell>
  );
}

