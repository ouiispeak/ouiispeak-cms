import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function TestDbPage() {
  const { data, error } = await supabase
    .from("lessons_authoring")
    .select("id, lesson_slug")
    .limit(5);

  return (
    <main style={{ padding: 24 }}>
      <h1>Supabase Connection Test</h1>

      {error && (
        <>
          <h2 style={{ color: "red" }}>Error</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </>
      )}

      {data && (
        <>
          <h2>Connection Successful</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
    </main>
  );
}
