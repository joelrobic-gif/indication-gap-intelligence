"use client";
// ═══ MISSION CONTROL ═══
// Seven department lanes. Each shows, in plain language: what its agent does,
// the exact data it reads, and — live — the molecule it is examining right now
// and what it concluded. A shared activity feed shows the Strategist's verdicts
// streaming in. Click any feed row to open the full business case.

import { memo } from "react";
import { DEPARTMENTS } from "../../lib/engine/departments";

function timeAgo(ts, now) {
  const s = Math.max(0, Math.floor(((now || ts) - ts) / 1000));
  if (s < 5) return "now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function MissionControl({ deptStats, feed, running, onOpenCase, now }) {
  return (
    <div style={{ padding: "var(--space-5)", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: "var(--space-5)", alignItems: "start" }}>
      {/* Department lanes */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)" }}>Departments</h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)" }}>
            {running ? "live · agents working" : "paused"}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "var(--space-4)" }}>
          {DEPARTMENTS.map(d => (
            <DeptLane key={d.id} dept={d} stat={deptStats[d.id]} running={running} />
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <aside style={{ position: "sticky", top: 110 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)" }}>Live feed</h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--brand-gold)" }}>★ Strategist verdicts</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          {feed.length === 0 && (
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-tertiary)", padding: "var(--space-4)", textAlign: "center" }}>
              Warming up… verdicts appear here as the swarm scans.
            </div>
          )}
          {feed.map(ev => <FeedRow key={ev.id} ev={ev} now={now} onClick={() => onOpenCase(ev.moleculeKey)} />)}
        </div>
      </aside>
    </div>
  );
}

const DeptLane = memo(function DeptLane({ dept, stat, running }) {
  const cur = stat?.current;
  const active = running && cur;
  return (
    <section style={{
      background: "var(--surface-raised)", border: "1px solid var(--surface-border)",
      borderTop: `2px solid ${dept.color}`, borderRadius: "var(--radius-lg)",
      padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: dept.color, fontSize: 18 }}>{dept.glyph}</span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.1 }}>{dept.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 0.5, color: "var(--text-tertiary)", textTransform: "uppercase" }}>{dept.role}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: dept.color, fontVariantNumeric: "tabular-nums" }}>{(stat?.processed || 0).toLocaleString()}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase" }}>analyzed</div>
        </div>
      </div>

      {/* ELI5 */}
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{dept.eli5}</div>

      {/* What it reads */}
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 4 }}>Reads</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {dept.reads.map((r, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-secondary)",
              background: "var(--surface-base)", border: "1px solid var(--surface-border)",
              borderRadius: "var(--radius-sm)", padding: "2px 6px",
            }}>{r}</span>
          ))}
        </div>
      </div>

      {/* Currently viewing */}
      <div style={{
        background: "var(--surface-base)", border: `1px solid ${active ? dept.color + "55" : "var(--surface-border)"}`,
        borderRadius: "var(--radius-md)", padding: "var(--space-3)", minHeight: 64,
        transition: "border-color var(--duration-standard)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: active ? dept.color : "var(--text-tertiary)",
            animation: active ? "pulse 1.4s var(--ease-standard) infinite" : "none",
          }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
            {active ? "Now viewing" : "Idle"}
          </span>
        </div>
        {cur ? (
          <>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
              {cur.molecule} <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>· {cur.company}</span>
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 6px" }}>{cur.indication}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: cur.ok ? "var(--viability-excellent)" : "var(--text-secondary)", lineHeight: 1.4 }}>
              {cur.ok ? "✓ " : "· "}{cur.finding}
            </div>
          </>
        ) : (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-tertiary)" }}>Awaiting first scan…</div>
        )}
      </div>
    </section>
  );
});

const FeedRow = memo(function FeedRow({ ev, now, onClick }) {
  const vColor = `var(--viability-${ev.viability})`;
  return (
    <button onClick={onClick} style={{
      textAlign: "left", background: "var(--surface-raised)", border: "1px solid var(--surface-border)",
      borderLeft: `3px solid ${vColor}`, borderRadius: "var(--radius-md)", padding: "var(--space-3)",
      cursor: "pointer", animation: "slideIn var(--duration-standard) var(--ease-out) both", width: "100%",
      display: "flex", flexDirection: "column", gap: 3,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{ev.molecule}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: vColor, fontVariantNumeric: "tabular-nums" }}>{ev.composite}</span>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.3 }}>{ev.indication}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)" }}>{ev.action}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>{ev.company}</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {ev.whitespace && <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--viability-excellent)", border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)", padding: "1px 4px", borderRadius: 2, letterSpacing: 0.5 }}>WHITESPACE</span>}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)" }}>{timeAgo(ev.ts, now)}</span>
        </div>
      </div>
    </button>
  );
});
