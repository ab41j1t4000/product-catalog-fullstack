import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading backend message...");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const response = await fetch("http://localhost:4000/health");

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as { message: string };
        setMessage(data.message);
      } catch (loadError) {
        const nextError =
          loadError instanceof Error ? loadError.message : "Unknown error";
        setError(nextError);
      }
    };

    void loadMessage();
  }, []);

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Frontend</p>
        <h1>React + Vite starter</h1>
        <p>
          This page is intentionally small so you can trace how the app boots:
          <code> main.tsx </code>
          renders
          <code> App.tsx </code>
          into the DOM.
        </p>
      </section>

      <section className="card">
        <p className="eyebrow">Backend</p>
        <h2>Fastify health route</h2>
        <p>{error || message}</p>
        <p className="hint">
          Start the API on port 4000, then refresh this page to see the backend
          response.
        </p>
      </section>
    </main>
  );
}

export default App;
