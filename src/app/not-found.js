// 404 (Next App Router).

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#08080d", color: "#e8e8f0", fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24,
    }}>
      <div style={{ maxWidth: 460, textAlign: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, color: "#d4a853", textTransform: "uppercase", marginBottom: 12 }}>
          404
        </div>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Page not found.
        </h1>
        <p style={{ color: "#9090b0", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          That route doesn&apos;t exist. Head back to ExpandRx.
        </p>
        <a href="/" style={{
          display: "inline-block", background: "#d4a853", borderRadius: 8, padding: "11px 22px",
          color: "#08080d", fontWeight: 700, fontSize: 14, textDecoration: "none",
        }}>
          ← Back to ExpandRx
        </a>
      </div>
    </div>
  );
}
