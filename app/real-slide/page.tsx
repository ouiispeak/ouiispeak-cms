import realSlideRaw from "../../mock-data/real-ai-speak-repeat.json";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import { uiTokens } from "../../lib/uiTokens";

export const dynamic = "force-dynamic";

export default function RealSlidePage() {
  const result = aiSpeakRepeatSlideSchema.safeParse(realSlideRaw);

  if (!result.success) {
    return (
      <PageShell title="Real Slide (ai-speak-repeat)">
        <CmsSection title="Validation failed" description="Slide data does not match schema">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(result.error.format(), null, 2)}
          </pre>
        </CmsSection>
      </PageShell>
    );
  }

  const slide: RealAiSpeakRepeatSlide = result.data;

  return (
    <PageShell title="Real Slide (ai-speak-repeat)">
      <CmsSection title={slide.props.title}>
        {slide.props.subtitle && <p>{slide.props.subtitle}</p>}
        {slide.props.note && (
          <p>
            <em>{slide.props.note}</em>
          </p>
        )}

        <h3 style={{ fontSize: uiTokens.font.label.size, fontWeight: uiTokens.font.label.weight, marginTop: uiTokens.space.md }}>Lines</h3>
        {slide.props.lines.map((row, rowIndex) => (
          <ul key={rowIndex} style={{ paddingLeft: uiTokens.space.md }}>
            {row.map((cell, cellIndex) => (
              <li key={cellIndex} style={{ marginBottom: uiTokens.space.xs }}>
                <strong>{cell.label}</strong> –{" "}
                {cell.speech.text ?? "[no text, maybe file mode]"}
              </li>
            ))}
          </ul>
        ))}
      </CmsSection>

      <CmsSection title="Raw JSON">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(slide, null, 2)}
        </pre>
      </CmsSection>
    </PageShell>
  );
}
