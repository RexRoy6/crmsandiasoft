"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return (
    <html>
      <body
        style={{
          fontFamily: "sans-serif",
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f6fb",
        }}
      >
        <div
          style={{
            background: "white",
            padding: 40,
            borderRadius: 10,
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <h1>Something went wrong</h1>

          <p style={{ marginTop: 10, color: "#666" }}>
            {error.message || "Unexpected error"}
          </p>

          <button
            onClick={() => reset()}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              borderRadius: 6,
              border: "none",
              background: "#2f4f78",
              color: "white",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}