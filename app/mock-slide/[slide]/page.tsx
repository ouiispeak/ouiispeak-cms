import slide1Raw from "../../../mock-data/slide1.json";
import slide2Raw from "../../../mock-data/slide2.json";
import { slideSchema, type Slide } from "../../../lib/slideSchema";

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
      <main style={{ padding: 24 }}>
        <h1>Mock Slide</h1>
        <h2 style={{ color: "red" }}>Validation failed</h2>
        <pre>{JSON.stringify(result.error.format(), null, 2)}</pre>
      </main>
    );
  }

  const validatedSlide: Slide = result.data;

  return (
    <main style={{ padding: 24 }}>
      <h1>Mock Slide</h1>
      <p>
        Currently showing:{" "}
        <strong>{slideParam === "2" ? "Slide 2" : "Slide 1"}</strong>
      </p>

      <h2>{validatedSlide.title}</h2>
      <p>{validatedSlide.instructions}</p>

      {validatedSlide.slideType === "text" && (
        <>
          <h3>Lines</h3>
          <ul>
            {validatedSlide.props.lines.map((line: string, index: number) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </>
      )}

      {validatedSlide.slideType === "speak" && (
        <>
          <h3>Transcript</h3>
          <p>{validatedSlide.props.transcript}</p>

          <h3>Prompt audio ID</h3>
          <p>{validatedSlide.props.promptAudioId}</p>

          <h3>Attempts allowed</h3>
          <p>{validatedSlide.props.attemptsAllowed}</p>
        </>
      )}

      <h3>Raw JSON</h3>
      <pre>{JSON.stringify(validatedSlide, null, 2)}</pre>
    </main>
  );
}
