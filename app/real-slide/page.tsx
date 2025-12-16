import Link from "next/link";
import realSlideRaw from "../../mock-data/real-ai-speak-repeat.json";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import PageContainer from "../../components/ui/PageContainer";

export const dynamic = "force-dynamic";

const BackLink = () => (
  <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", textDecoration: "none", color: "#222326", fontSize: 14 }}>
    <span style={{ fontSize: 18 }}>←</span>
    <span>Back to Dashboard</span>
  </Link>
);

export default function RealSlidePage() {
  const result = aiSpeakRepeatSlideSchema.safeParse(realSlideRaw);

  if (!result.success) {
    return (
      <>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <h1 style={{ margin: 0 }}>Real Slide (ai-speak-repeat)</h1>
        </div>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <BackLink />
        </div>
        <PageContainer>
          <h2 style={{ color: "red" }}>Validation failed</h2>
          <pre>{JSON.stringify(result.error.format(), null, 2)}</pre>
        </PageContainer>
      </>
    );
  }

  const slide: RealAiSpeakRepeatSlide = result.data;

  return (
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>Real Slide (ai-speak-repeat)</h1>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <BackLink />
      </div>
      <PageContainer>

      <h2>{slide.props.title}</h2>
      {slide.props.subtitle && <p>{slide.props.subtitle}</p>}
      {slide.props.note && (
        <p>
          <em>{slide.props.note}</em>
        </p>
      )}

      <h3>Lines</h3>
      {slide.props.lines.map((row, rowIndex) => (
        <ul key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <li key={cellIndex}>
              <strong>{cell.label}</strong> –{" "}
              {cell.speech.text ?? "[no text, maybe file mode]"}
            </li>
          ))}
        </ul>
      ))}

      <h3>Raw JSON</h3>
      <pre>{JSON.stringify(slide, null, 2)}</pre>
      </PageContainer>
    </>
  );
}
