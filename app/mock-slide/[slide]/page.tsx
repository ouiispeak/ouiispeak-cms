import slide1Raw from "../../../mock-data/slide1.json";
import slide2Raw from "../../../mock-data/slide2.json";
import { slideSchema, type Slide } from "../../../lib/slideSchema";
import PageShell from "../../../components/ui/PageShell";
import CmsSection from "../../../components/ui/CmsSection";
import { uiTokens } from "../../../lib/uiTokens";

export const dynamic = "force-dynamic";

export default async function MockSlidePage({
  params,
}: {
  params: Promise<{ slide: string }>;
}) {
  // Next 16: params is a Promise, so we have to await it
  const { slide } = await params;

  const slideParam = slide ?? "1";

  const raw = slideParam === "2" ? slide2Raw : slide1Raw;

  const result = slideSchema.safeParse(raw);

  if (!result.success) {
    return (
      <PageShell title="Mock Slide">
        <CmsSection title="Validation failed" description="Slide data does not match schema">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(result.error.format(), null, 2)}
          </pre>
        </CmsSection>
      </PageShell>
    );
  }

  const validatedSlide: Slide = result.data;

  return (
    <PageShell
      title="Mock Slide"
      meta={
        <>
          Currently showing: <strong>{slideParam === "2" ? "Slide 2" : "Slide 1"}</strong>
        </>
      }
    >
      <CmsSection title={validatedSlide.title}>
        <p>{validatedSlide.instructions}</p>

        {validatedSlide.slideType === "text" && (
          <>
            <h3 style={{ fontSize: uiTokens.font.label.size, fontWeight: uiTokens.font.label.weight, marginTop: uiTokens.space.md }}>Lines</h3>
            <ul style={{ paddingLeft: uiTokens.space.md }}>
              {validatedSlide.props.lines.map((line: string, index: number) => (
                <li key={index} style={{ marginBottom: uiTokens.space.xs }}>{line}</li>
              ))}
            </ul>
          </>
        )}

        {validatedSlide.slideType === "speak" && (
          <>
            <h3 style={{ fontSize: uiTokens.font.label.size, fontWeight: uiTokens.font.label.weight, marginTop: uiTokens.space.md }}>Transcript</h3>
            <p>{validatedSlide.props.transcript}</p>

            <h3 style={{ fontSize: uiTokens.font.label.size, fontWeight: uiTokens.font.label.weight, marginTop: uiTokens.space.md }}>Prompt audio ID</h3>
            <p>{validatedSlide.props.promptAudioId}</p>

            <h3 style={{ fontSize: uiTokens.font.label.size, fontWeight: uiTokens.font.label.weight, marginTop: uiTokens.space.md }}>Attempts allowed</h3>
            <p>{validatedSlide.props.attemptsAllowed}</p>
          </>
        )}
      </CmsSection>

      <CmsSection title="Raw JSON">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(validatedSlide, null, 2)}
        </pre>
      </CmsSection>
    </PageShell>
  );
}
