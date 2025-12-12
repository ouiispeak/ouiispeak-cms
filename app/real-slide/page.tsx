import realSlideRaw from "../../mock-data/real-ai-speak-repeat.json";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";

export const dynamic = "force-dynamic";

export default function RealSlidePage() {
  const result = aiSpeakRepeatSlideSchema.safeParse(realSlideRaw);

  if (!result.success) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Real Slide (ai-speak-repeat)</h1>
        <h2 style={{ color: "red" }}>Validation failed</h2>
        <pre>{JSON.stringify(result.error.format(), null, 2)}</pre>
      </main>
    );
  }

  const slide: RealAiSpeakRepeatSlide = result.data;

  return (
    <main style={{ padding: 24 }}>
      <h1>Real Slide (ai-speak-repeat)</h1>

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
    </main>
  );
}
