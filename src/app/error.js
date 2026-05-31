"use client";
// Root error boundary (Next App Router). Catches render/runtime errors so the
// app degrades gracefully instead of white-screening.

export default function Error({ error, reset }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#08080d", color: "#e8e8f0", fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24,
    }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, color: "#d4a853", textTransform: "uppercase", marginBottom: 12 }}>
          Something went wrong
        </div>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          The platform hit an unexpected error.
        </h1>
        <p style={{ color: "#9090b0", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          {error?.message ? error.message : "An error occurred while rendering this view."} You can retry, or reload the page.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: "#d4a853", border: "none", borderRadius: 8, padding: "11px 22px",
            color: "#08080d", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
