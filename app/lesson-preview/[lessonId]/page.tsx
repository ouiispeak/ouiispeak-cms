"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadLessonById } from "../../../lib/loadLesson";
import PageShell from "../../../components/ui/PageShell";
import CmsSection from "../../../components/ui/CmsSection";
import { uiTokens } from "../../../lib/uiTokens";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; lesson: any };

export default function LessonPreviewPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId;

  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!lessonId) {
      setState({ status: "error", message: "No lessonId in URL." });
      return;
    }

    async function run() {
      setState({ status: "loading" });
      try {
        const lesson = await loadLessonById(lessonId);
        setState({ status: "ready", lesson });
      } catch (e: any) {
        setState({
          status: "error",
          message: e?.message ?? "Failed to load lesson.",
        });
      }
    }

    run();
  }, [lessonId]);

  return (
    <PageShell
      title="Lesson Preview"
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
            {JSON.stringify(state.lesson, null, 2)}
          </pre>
        </CmsSection>
      )}
    </PageShell>
  );
}
