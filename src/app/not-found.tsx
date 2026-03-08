export default function NotFound() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>404</h1>
        <p>Page not found</p>

        <a href="/" style={{ color: "#2f4f78" }}>
          Go back home
        </a>
      </div>
    </div>
  );
}