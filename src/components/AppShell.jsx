"use client";
// ═══ APP SHELL ═══
// Top-level orchestrator. Hosts the autonomous swarm engine (global, all
// companies) for the new Funnel / Mission Control / Opportunities surfaces, and
// keeps the legacy company-scoped Explorer / Heatmap / Portfolio / Compare views.

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";

// Data
import { COMPANIES, COMPANY_BY_ID } from "../lib/data/companies";
import { COUNTRIES } from "../lib/data/countries";

// Hooks
import { useGaps, useProcessedGaps, usePortfolioStats } from "../hooks/useGaps";
import { useWatchlist } from "../hooks/useWatchlist";
import { useAutonomousEngine } from "../hooks/useAutonomousEngine";

// Shell
import { TopBar } from "./shell/TopBar";
import { EngineBar } from "./shell/EngineBar";

// Engine views (eager — primary surfaces)
import { Funnel } from "./views/Funnel";
import { MissionControl } from "./views/MissionControl";
import { OpportunityBoard } from "./views/OpportunityBoard";
import { CaseReport } from "./views/CaseReport";

// Legacy views (dynamic — code-split)
const Dashboard  = dynamic(() => import("./views/Dashboard").then(m => ({ default: m.Dashboard })),   { ssr: false });
const Comparator = dynamic(() => import("./views/Comparator").then(m => ({ default: m.Comparator })),  { ssr: false });
const Heatmap    = dynamic(() => import("./views/Heatmap").then(m => ({ default: m.Heatmap })),        { ssr: false });
const Portfolio  = dynamic(() => import("./views/Portfolio").then(m => ({ default: m.Portfolio })),     { ssr: false });

const ENGINE_VIEWS = new Set(["funnel", "mission", "opportunities"]);

export default function AppShell() {
  // ── Shared state ──
  const [homeCountry, setHomeCountry] = useState("CA");
  const [view, setView] = useState("funnel");
  const [companyId, setCompanyId] = useState(COMPANIES[0].id);

  // ── Autonomous engine (global) ──
  const engine = useAutonomousEngine(homeCountry);
  const [selectedCaseKey, setSelectedCaseKey] = useState(null);
  const casesByKey = useMemo(() => Object.fromEntries(engine.cases.map(c => [c.key, c])), [engine.cases]);
  const selectedCase = selectedCaseKey ? casesByKey[selectedCaseKey] : null;

  // ── Live clock for relative timestamps ──
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(h);
  }, []);

  // ── Legacy company-scoped state ──
  const [sortBy, setSortBy] = useState("composite");
  const [filterViability, setFilterViability] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]);
  const [selectedGap, setSelectedGap] = useState(null);
  const [toast, setToast] = useState(null);

  const company = COMPANY_BY_ID[companyId];
  const { watchlist, toggle: toggleWatchlist, has: isWatched, count: watchlistCount } = useWatchlist();
  const gaps = useGaps(company, homeCountry);
  const processedGaps = useProcessedGaps(gaps, { filterViability, showWatchlistOnly, watchlist, searchQuery, sortBy });
  const portfolioStats = usePortfolioStats(gaps);

  // ── Toast ──
  const toastTimer = useRef(null);
  const showToast = useCallback((msg) => {
    setToast(msg); clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Comparator ──
  const toggleCompare = useCallback((gap) => {
    setCompareSelection(prev => {
      const exists = prev.some(g => g.id === gap.id);
      if (exists) return prev.filter(g => g.id !== gap.id);
      if (prev.length >= 5) { showToast("Maximum 5 indications in comparison view"); return prev; }
      return [...prev, gap];
    });
  }, [showToast]);
  const removeFromCompare = useCallback((id) => setCompareSelection(prev => prev.filter(g => g.id !== id)), []);
  const isInCompare = useCallback((id) => compareSelection.some(g => g.id === id), [compareSelection]);

  // ── Case drawer ──
  const openCase = useCallback((key) => setSelectedCaseKey(key), []);
  const closeCase = useCallback(() => setSelectedCaseKey(null), []);
  useEffect(() => {
    if (!selectedCaseKey) return;
    const onKey = (e) => { if (e.key === "Escape") setSelectedCaseKey(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCaseKey]);

  // ── Reset legacy selection on company/country change ──
  useEffect(() => {
    setSelectedGap(null); setCompareSelection([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, homeCountry]);

  const isEngineView = ENGINE_VIEWS.has(view);

  return (
    <div style={{ background: "var(--surface-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      {toast && <Toast message={toast} />}

      <TopBar
        companies={COMPANIES} companyId={companyId} onCompanyChange={setCompanyId}
        countries={COUNTRIES} homeCountry={homeCountry} onCountryChange={setHomeCountry}
        view={view} onViewChange={setView}
        watchlistCount={watchlistCount} compareCount={compareSelection.length}
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
        showCompanyControls={!isEngineView}
      />

      {/* Engine control strip — only on swarm surfaces */}
      {isEngineView && (
        <EngineBar
          running={engine.running} speedMs={engine.speedMs} cycles={engine.cycles}
          processedCount={engine.processedCount} universe={engine.universe} startedAt={engine.startedAt}
          onToggleRun={engine.toggleRun} onStep={engine.stepOnce} onSetSpeed={engine.setSpeed} onReset={engine.reset}
          now={now}
        />
      )}

      <main>
        {view === "funnel" && (
          <Funnel
            tiers={engine.tiers} processedCount={engine.processedCount} universe={engine.universe}
            onGotoCases={() => setView("opportunities")} onGotoDepartments={() => setView("mission")}
          />
        )}
        {view === "mission" && (
          <MissionControl
            deptStats={engine.deptStats} feed={engine.feed} running={engine.running}
            onOpenCase={openCase} now={now}
          />
        )}
        {view === "opportunities" && (
          <OpportunityBoard cases={engine.cases} onOpenCase={openCase} onTogglePin={engine.togglePin} />
        )}

        {/* ── Legacy company-scoped views ── */}
        {view === "explorer" && (
          <Dashboard
            gaps={processedGaps} allGaps={gaps} sortBy={sortBy} onSortChange={setSortBy}
            filterViability={filterViability} onFilterChange={setFilterViability}
            showWatchlistOnly={showWatchlistOnly} onToggleWatchlist={() => setShowWatchlistOnly(v => !v)}
            watchlistCount={watchlistCount} isWatched={isWatched} onToggleWatchlistItem={toggleWatchlist}
            isInCompare={isInCompare} onToggleCompare={toggleCompare} compareCount={compareSelection.length}
            onOpenGap={setSelectedGap} homeCountry={homeCountry} portfolioStats={portfolioStats}
          />
        )}
        {view === "compare" && (
          <Comparator selection={compareSelection} onRemove={removeFromCompare} onOpen={setSelectedGap} allGaps={gaps} />
        )}
        {view === "heatmap" && <Heatmap gaps={gaps} company={company} homeCountry={homeCountry} />}
        {view === "portfolio" && <Portfolio gaps={gaps} company={company} stats={portfolioStats} homeCountry={homeCountry} />}
      </main>

      {/* Full business-case report */}
      {selectedCase && (
        <CaseReport
          caseObj={selectedCase} homeCountry={homeCountry} now={now} onClose={closeCase}
          onSetStatus={engine.setStatus} onSetNote={engine.setNote} onTogglePin={engine.togglePin}
        />
      )}
    </div>
  );
}

function Toast({ message }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: "var(--surface-overlay)", border: "1px solid var(--surface-border)",
      color: "var(--text-primary)", padding: "10px 20px", borderRadius: "var(--radius-md)",
      fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "fadeIn 0.15s var(--ease-out)",
    }}>
      {message}
    </div>
  );
}
