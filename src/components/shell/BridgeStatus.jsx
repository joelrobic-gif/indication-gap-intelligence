"use client";
// ═══ ROBICIDIRECT BRIDGE STATUS ═══
// Slim banner shown when RobicDirect is online — communicates live data connection.
// Dismissed automatically when offline (shows nothing to avoid alarm for local dev).

export function BridgeStatus({ online, status }) {
  if (!online) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "var(--space-3)",
      padding: "4px var(--space-5)",
      background: "rgba(52, 211, 153, 0.06)",
      borderBottom: "1px solid rgba(52, 211, 153, 0.15)",
      fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 0.5,
      color: "var(--text-tertiary)",
    }}>
      {/* Pulse dot */}
      <span style={{ position: "relative", display: "inline-block", width: 6, height: 6 }}>
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "var(--viability-excellent)",
          animation: "pulse 2s ease-in-out infinite",
        }} />
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "var(--viability-excellent)", opacity: 0.4,
          transform: "scale(1.8)",
          animation: "pulse 2s ease-in-out infinite",
          animationDelay: "0.5s",
        }} />
      </span>
      <span style={{ color: "var(--viability-excellent)" }}>LIVE</span>
      <span>RobicDirect bridge active</span>
      {status && (
        <>
          <span style={{ color: "var(--surface-border)" }}>·</span>
          <span>{status.totalMolecules} molecules</span>
          <span style={{ color: "var(--surface-border)" }}>·</span>
          <span>{status.totalGaps} gaps</span>
          <span style={{ color: "var(--surface-border)" }}>·</span>
          <span>updated {formatUptime(status.uptime)}</span>
        </>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function formatUptime(seconds) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m ago`;
  return `${m}m ago`;
}
