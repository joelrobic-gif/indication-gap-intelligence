# ExpandRx — Session Transfer / Handoff

**Last updated:** 2026-05-31 · **Branch:** `master` (clean, fully pushed) · **HEAD:** `f12f171+`

A fresh Claude session should read this file first. It captures the complete state
of the **ExpandRx** platform (formerly "Indication Gap Intelligence / IGI / Goodman").

### Acquisition roadmap — ALL 4 PHASES EXECUTED (2026-05-31)
Per `ACQUISITION.md`. Plus a marketing **Landing** page (default view, theme "clarity of signal").
- **Phase 0** — LICENSE (proprietary), honest metadata + `robots:index:false`, synthetic-data banner on reports, engine unit tests (`test/`, node:test) + GitHub Actions CI (`.github/workflows/ci.yml`), `npm audit` high cleared.
- **Phase 1** — provenance schema + real **source-verified cardiovascular slice** (46 molecules, 117 cited rows: FDA/EMA labels + NCT IDs + years), via `scripts/merge-verified.mjs`; `✓ CITED` chips + SOURCE-VERIFIED report block.
- **Phase 2** — recalibrated + **cited** assumptions (`assumptionsVersion 2026.2`, `sources`); scoring/financials made testable (explicit `.js` specifiers) + golden tests (14 total); calibration harness `scripts/calibrate.mjs` → `CALIBRATION.md` (Brier/ECE); `app/error.js` + `app/not-found.js`.
- **Phase 3** — `WHITEPAPER.md` (methodology + limitations), `PILOT.md` (Pharmascience design-partner POC template + price anchor), honest board scale relabel.
- **Phase 4** — **outcome-feedback moat** (`src/lib/engine/outcomes.js`): capture Filed/Approved/Rejected/Parked → house-adjusted PTRS (Bayesian shrinkage), surfaced in report; CSV/JSON board export; `ENTERPRISE.md` (auth/tenancy path, gated on a pilot). Engine storage key now `igi-engine-v5`.
- New deal docs to read: `ACQUISITION.md`, `WHITEPAPER.md`, `PILOT.md`, `CALIBRATION.md`, `ENTERPRISE.md`.
- Regenerate verified slice: `node scripts/merge-verified.mjs <swarm-output.json>`; calibration: `node scripts/calibrate.mjs`; tests: `npm test`.

### Where everything lives (transfer package)
- **GitHub remote (source of truth):** `git@github.com:joelrobic-gif/indication-gap-intelligence.git` — all work pushed to `master`. (Visibility should be **private**; verify with `gh repo view joelrobic-gif/indication-gap-intelligence --json visibility` once `gh auth login` is redone — the CLI token is currently expired.)
- **Local copy A (canonical working tree):** `C:\Users\joelr\OneDrive\Desktop\Desktop files\IndicationGapIntel\` — develop here.
- **Local copy B (kept in sync):** `C:\Users\joelr\GitHub\indication-gap-intelligence\` — fast-forwarded to the same HEAD; either copy works.
- **Portable git bundle (full history, offline transfer):** `…\Desktop files\ExpandRx-transfer.bundle` — clone/restore anywhere with `git clone ExpandRx-transfer.bundle ExpandRx`.
- **Claude project memory:** `C:\Users\joelr\.claude\projects\C--Users-joelr-OneDrive-Desktop-IndicationGapIntel\memory\` — auto-loads in a new session.

---

## 1. What this is

**ExpandRx** — a Next.js 16 web app that finds pharmaceutical **indication-expansion
opportunities**: drugs already approved for a disease *abroad* but **not yet in the home
market**. An always-on autonomous swarm of 7 "departments" scans the whole drug universe,
funnels candidates, and writes ranked, print-ready business cases with rNPV valuation.

Funding/real-world context (NOT app-facing): drug-repurposing initiative for **David
Goodman / Goodman Foundation** × Pharmascience. The in-app **brand is ExpandRx**; the
funder relationship is unchanged. NO stock/trading/securities — pure pharma intel.

- **Repo:** `git@github.com:joelrobic-gif/indication-gap-intelligence.git` (SSH)
- **Live URL:** https://indication-gap-intelligence-production.up.railway.app/
- **Canonical local path:** `C:\Users\joelr\OneDrive\Desktop\Desktop files\IndicationGapIntel\`
  (NOTE: inside the `Desktop files` subfolder. The `C:\Users\joelr\GitHub\…` copy is OLDER — ignore it.)

---

## 2. ⚠️ Pending / action items

1. **Railway deploy is NOT automatic.** Pushing `master` does NOT deploy. Railway CLI
   token is expired. To deploy the current code:
   ```bash
   cd "C:/Users/joelr/OneDrive/Desktop/Desktop files/IndicationGapIntel"
   railway login      # interactive browser OAuth — only the user can do this
   railway up         # builds + deploys
   ```
   `railway.toml`: build `npm install && npm run build`, start `PORT=${PORT:-3000} npm start`,
   healthcheck `/`. **The live URL is still running the OLD pre-rebuild build until this runs.**
2. **Leaked GitHub PAT** (a `ghp_…` classic token, full value NOT stored here — see the
   user's secret vault / prior session notes) was embedded in the old token-HTTPS remote,
   now rewritten to SSH. **Still needs manual revocation** at github.com/settings/tokens →
   delete the classic PAT created for this repo.

---

## 3. Current scale (after mega-universe build)

| Metric | Value |
|---|---|
| Unique molecules | **1,702** |
| Companies | **40** (Pharmascience first) |
| Company-molecule instances | 14,381 (avg ~8.4 holders/molecule, capped at 9) |
| Unique indication-pool rows | 6,915 |
| Total scanned candidate rows | 58,789 |
| Live regulatory gaps (Canada) | ~23,072 |
| Ranked business cases | ~11,210 |
| Competitive pipelines | 254 indications · Unmet-need: 243 |

All data is **static, zero-database** — generated by AI swarms, embedded at build time,
computed client-side. Real marketed generics only (no invented drugs).

---

## 4. Architecture

Next.js 16 (App Router, Turbopack) · React 18 · zero-DB · Anthropic proxy for optional AI.

```
src/
  app/
    layout.js              metadata (title "ExpandRx | L99 Panel Analysis")
    page.js                mounts <AppShell/>
    api/analyze/route.js   Claude proxy (rate-limited) — optional, needs ANTHROPIC_API_KEY
    api/chat/route.js      Claude proxy
    globals.css            design tokens (CSS vars) + print stylesheet (report pagination)
  components/
    AppShell.jsx           orchestrator: engine hook + view router + report drawer
    shell/TopBar.jsx       brand (ExpandRx) + view tabs + country picker
    shell/EngineBar.jsx    swarm controls (run/pause/step/speed/reset) + live counters
    views/Funnel.jsx           ELI5 "how we find the opportunity" + narrowing funnel
    views/MissionControl.jsx   7-department assembly line (looks-for/reads/examines/found/handoff) + verdict feed
    views/OpportunityBoard.jsx ranked business-case cards (RENDER_CAP=600) + filters + company logos
    views/CaseReport.jsx       ~16-page print-ready report (cover->exec->sections->rNPV->sensitivity->recommendation)
    views/{Dashboard,Heatmap,Portfolio,Comparator}.jsx   legacy company-scoped views (kept)
    primitives/CompanyLogo.jsx  inline-SVG brand monogram badges for all 40 companies
    primitives/{PTRSRing,tokens}.js · charts/{ScoreDimensionBar,Sparkline}.jsx
  hooks/
    useAutonomousEngine.js  THE ENGINE — reducer, localStorage "igi-engine-v4", heartbeat tick,
                            per-dept live state, feed, human co-work (status/note/pin)
    useGaps.js · useWatchlist.js · useRobicDirectBridge.js (legacy)
  lib/
    scoring.js              7-factor composite + viability tiers
    data/companies.js       40 companies x molecule portfolios (GENERATED)
    data/indications.js     INDICATION_POOLS keyed by molecule name (GENERATED, salt-normalized)
    data/pipeline.js        COMPETITIVE_PIPELINE + UNMET_NEED (GENERATED)
    data/countries.js       20 markets + MARKET_VALUE_INDEX
    data/ptrs.js            BIO/QLS phase-transition base rates by TA
    data/universe.js        computeUniverse() — flattens all companies -> scored gaps
    engine/departments.js   7 real pharma departments (Lifecycle Mgmt, Regulatory Affairs,
                            Clinical Dev, Competitive Intel, Commercial/HEOR, Portfolio Mgmt, BD&Strategy)
    engine/funnel.js        runFunnel (per-dept examined/found/handoff) · funnelTiers · buildBusinessCases (+financials)
    engine/financials.js    computeFinancials() — rNPV model
    engine/assumptions.js   finance-panel benchmark inputs (WACC 13%, 3yr window, per-TA price/penetration/COGS)
scripts/
    build-universe.mjs      MEGA build: swarm output + 40-co roster -> data files (salt-normalized, seeded assignment)
    merge-universe.mjs      older additive per-company merge (superseded by build-universe)
```

### The autonomous engine (key concept)
- Runs **forever with zero human input**; loops the universe as continuous monitoring.
- Persists to `localStorage["igi-engine-v4"]` (resumes across reloads — uptime survives).
- Humans **co-work, never required**: pause/step/speed + approve/flag/reviewing/pin/note on cases.

### The 7-factor score -> rNPV
- Composite (0-99): evidence .20 / breadth .15 / regulatory .15 / commercial .15 / ptrs .15 / unmet .10 / competitive .10.
- rNPV = PTRS x NPV(net commercial cash flows) - 0.90 x NPV(remaining dev+filing), discounted at WACC 13%.
  Finance-panel assumptions in `engine/assumptions.js`. WACC kept pure (PTRS carries program risk — no double-count).

---

## 5. How to run / build / regenerate

```bash
cd "C:/Users/joelr/OneDrive/Desktop/Desktop files/IndicationGapIntel"
npm install
npm run dev          # localhost:3000 (dev)
npm run build        # production build (Turbopack)
npm start            # serve production build on PORT (default 3000)
```
**Regenerate the drug universe** (after a new generation swarm dumps JSON):
```bash
node scripts/build-universe.mjs <workflow-output.json>   # rewrites companies/indications/pipeline .js (+.bak)
```
The build script: salt-normalizes molecule names (merges "Metformin"/"Metformin HCl"),
assigns molecules to the 40-company roster (seeded RNG, focus/density, max 9 holders),
preserves Pharmascience's forced portfolio.

---

## 6. Verification protocol (always before claiming "done")
- Localhost UI -> Chrome DevTools MCP: `new_page` localhost:3000, `take_snapshot`/`evaluate_script`, check expected text + `list_console_messages` for errors.
- Build must be clean (`npm run build`).
- Server lock on `.next` during build -> kill listener on port 3000 first (PowerShell `Get-NetTCPConnection -LocalPort 3000`).

---

## 7. Arc commit history (this rebuild, newest first)
```
7b7287e chore: remove IGI brand acronym
0b73007 chore: rebrand Goodman -> ExpandRX
af5479d feat: mega-universe — 1,702 molecules across 40 companies
0085499 feat: company brand logos for clear per-company attribution
b338f99 feat: commercial financial model (rNPV) — finance-panel-derived valuation
4f75f07 feat: full multi-page business-case report on case click
cee9ec0 feat: real pharma department names + transparent handoff chain in Mission Control
9066d70 feat: L99 autonomous swarm rebuild — ELI5 funnel, 7 agent departments
```

---

## 8. Known issues / future refinements
- **Cross-company duplicates by design:** a generic (e.g. Metformin) is held by many
  companies -> one card each. Accepted + made legible via company logos. NOT collapsed
  (board header says "best case per molecule" but is actually per company x molecule —
  a future option is molecule-level grouping with a `companies[]` array; see the
  duplicate-review verdict — deferred per user's per-company decision).
- **Board perf:** ~11k cases; `OpportunityBoard` caps render at 600 with a "showing top N"
  note. `buildBusinessCases` recomputes on every human action (pin/note) — acceptable, could memoize financials per gap if it lags.
- **Legacy views** (Dashboard/Heatmap/Portfolio/Comparator) remain company-scoped via the
  old `useGaps` hook + company picker; the new engine surfaces (Funnel/Mission/Opportunities) are global.
- **Population parsing:** prevalence-style strings ("28/100K") fall back to a TA default
  in the financial model (flagged in the report).

---

## 9. Cross-cutting rules
- Push to `master`. Deploy via `railway up` (NOT auto). Never touch other Railway projects.
- Real molecules/trials only — validate against primary sources before any investment claim.
- Best-in-class UX bar; verify live via MCP before reporting "done".
