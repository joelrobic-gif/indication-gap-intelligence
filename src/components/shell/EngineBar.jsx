"use client";
// ═══ ENGINE BAR ═══
// Sticky control strip for the autonomous swarm. Shows it's alive, lets a human
// pause / step / change speed — but the swarm runs with or without them.

const SPEEDS = [
  { ms: 2400, label: "Slow" },
  { ms: 1200, label: "Normal" },
  { ms: 600,  label: "Fast" },
  { ms: 250,  label: "Turbo" },
];

function fmtDuration(ms) {
  if (!ms || ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

export function EngineBar({
  running, speedMs, cycles, processedCount, universe, startedAt,
  onToggleRun, onStep, onSetSpeed, onReset, now,
}) {
  const total = universe.gaps.length;
  const scanned = total ? (cycles > 0 && processedCount % total === 0 ? total : processedCount % total) : 0;
  const uptime = startedAt ? fmtDuration((now || startedAt) - startedAt) : "—";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "var(--space-4)",
      padding: "8px var(--space-5)", background: "var(--surface-base)",
      borderBottom: "1px solid var(--surface-border)", flexWrap: "wrap",
      position: "sticky", top: 52, zIndex: 90,
    }}>
      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: running ? "var(--viability-excellent)" : "var(--text-tertiary)",
          boxShadow: running ? "0 0 8px var(--viability-excellent)" : "none",
          animation: running ? "pulse 1.6s var(--ease-standard) infinite" : "none",
        }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.5, color: running ? "var(--viability-excellent)" : "var(--text-secondary)", textTransform: "uppercase" }}>
          {running ? "Swarm running" : "Paused"}
        </span>
      </div>

      <Divider />

      {/* Live counters */}
      <Counter label="Scanned" value={processedCount.toLocaleString()} />
      <Counter label="Cycle" value={cycles + 1} />
      <Counter label="In universe" value={total.toLocaleString()} />
      <Counter label="Uptime" value={uptime} mono />

      {/* Scan progress */}
      <div style={{ flex: 1, minWidth: 120, maxWidth: 320 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", letterSpacing: 1 }}>THIS CYCLE</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)" }}>{scanned}/{total}</span>
        </div>
        <div style={{ height: 4, background: "var(--surface-border)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${total ? (scanned / total) * 100 : 0}%`, height: "100%", background: "var(--brand-gold)", transition: "width var(--duration-standard) var(--ease-out)" }} />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={onToggleRun} style={btn(running)} title={running ? "Pause swarm" : "Resume swarm"}>
          {running ? "⏸ Pause" : "▶ Resume"}
        </button>
        <button onClick={onStep} style={btn(false)} title="Process one molecule" disabled={running}>⏭ Step</button>
        <select value={speedMs} onChange={e => onSetSpeed(Number(e.target.value))} style={selectStyle} aria-label="Swarm speed">
          {SPEEDS.map(s => <option key={s.ms} value={s.ms}>{s.label}</option>)}
        </select>
        <button onClick={onReset} style={btn(false)} title="Reset scan counters (keeps your reviews)">↺ Reset</button>
      </div>
    </div>
  );
}

function Counter({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function Divider() { return <div style={{ width: 1, height: 20, background: "var(--surface-border)" }} />; }

const btn = (active) => ({
  background: active ? "var(--brand-gold-dim)" : "transparent",
  border: `1px solid ${active ? "var(--brand-gold)" : "var(--surface-border)"}`,
  borderRadius: "var(--radius-sm)", padding: "4px 9px",
  color: active ? "var(--brand-gold)" : "var(--text-secondary)",
  fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.5, cursor: "pointer",
  transition: "all var(--duration-fast)",
});

const selectStyle = {
  background: "var(--surface-base)", border: "1px solid var(--surface-border)",
  borderRadius: "var(--radius-sm)", padding: "4px 6px", color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)", fontSize: 10, outline: "none", cursor: "pointer",
};
