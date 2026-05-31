# PROPOSAL.md — Direction + Design System
## ExpandRx L99 v3 | Phase 3 Gate

**Status: AWAITING JOEL SIGN-OFF. Do not execute Phase 4+ until approved.**

---

## Direction Decision: Option B — Polymath/Crunchbase Entity-Comparison

Three directions were prototyped mentally against the reference bar:

**(A) Observable-style data-density-led** — charts dominate every surface, prose subordinate. Risk: pharma exec audience is not always data-native; dense grids without narrative lose them. Best for: data teams who live in the tool daily.

**(B) Polymath/Crunchbase entity-comparison ← CHOSEN** — column-equality comparison is the primary surface. Every metric aligns across columns. Bloomberg-for-pharma. Fast scan, structured drill-down. The 5-up indication comparator is the hero. Best for: strategy offsite prep, cross-indication prioritization, executive briefing.

**(C) Field.io motion-rich** — animated transitions as the core interaction verb. Risk: motion-first analytics tools feel demo-y in boardrooms; the motion distracts from the data when decisions are high-stakes. Reserve motion as *enhancement*, not the proposition.

**Why B:** The primary user persona (competitive intel director, 90-second scan before offsite) needs to answer "which 2 of these 5 indications should we prioritize?" in a single glance. Column-equality comparison with aligned sparklines and PTRS gauges answers that question faster than any other layout. B also aligns with the project's Bloomberg-for-pharma thesis stated in the L99 prompt.

Motion from Option C is incorporated as *interaction vocabulary* within Option B — not as the lead proposition.

---

## Palette + Tokens

### Color philosophy
**Okabe-Ito** for 8-entity categorical (confirmed color-blind safe for deuteranopia, protanopia, tritanopia):

| Token | Hex | Use |
|---|---|---|
| `--color-entity-1` | `#0072B2` | Indication A (blue) |
| `--color-entity-2` | `#D55E00` | Indication B (vermillion) |
| `--color-entity-3` | `#009E73` | Indication C (green) |
| `--color-entity-4` | `#CC79A7` | Indication D (rose) |
| `--color-entity-5` | `#56B4E9` | Indication E (sky) |
| `--color-entity-6` | `#E69F00` | Indication F (amber) |
| `--color-entity-7` | `#F0E442` | Indication G (yellow) |
| `--color-entity-8` | `#000000` | Indication H (black — dark-mode: #e8e8f0) |

Tinted 15° toward brand navy (hue rotation applied post-Okabe):
- Blues shift slightly warmer toward the brand's existing `#0e1829` navy
- Vermillion retains full chroma (most distinct from gold accent)
- Gold brand accent `#d4a853` is reserved for brand chrome — NOT used as an entity color

### Semantic tokens (CSS custom properties)

```css
/* Surface */
--surface-base:     #08080d;   /* page background */
--surface-raised:   #0e0e18;   /* card background */
--surface-overlay:  #14141f;   /* modal / sheet background */
--surface-border:   #1e1e2e;   /* default border */
--surface-border-subtle: #151520; /* dividers */

/* Text */
--text-primary:     #e8e8f0;
--text-secondary:   #9090b0;
--text-tertiary:    #5555708a;
--text-inverse:     #08080d;

/* Brand */
--brand-gold:       #d4a853;
--brand-gold-dim:   #d4a85330;
--brand-navy:       #0e1829;

/* Viability (shared with RobicDirect) */
--viability-excellent: #34d399;
--viability-strong:    #fbbf24;
--viability-moderate:  #60a5fa;
--viability-low:       #ef4444;

/* Sequential scale (heatmap, single-hue safe) */
--seq-0:  #0e1829;   /* 0 density */
--seq-20: #0f2a45;
--seq-40: #0e4272;
--seq-60: #0e6099;
--seq-80: #1280c4;
--seq-100: #38a8f0; /* max density */

/* Comparative-view specific */
--col-equality-width: 220px;   /* fixed per column in 5-up view */
--sparkline-baseline: 1px solid #1e1e2e; /* horizontal reference */
--reference-line:     #d4a85340; /* median reference line on charts */

/* Typography scale */
--text-xs:   10px;  /* JetBrains Mono labels */
--text-sm:   12px;  /* secondary info */
--text-base: 14px;  /* body */
--text-lg:   16px;  /* card titles */
--text-xl:   20px;  /* section headings */
--text-2xl:  28px;  /* KPI numbers */
--text-3xl:  40px;  /* hero KPI */

/* Spacing scale (4px base) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;

/* Motion */
--duration-instant:  0ms;   /* data updates */
--duration-fast:     120ms; /* hover states */
--duration-standard: 220ms; /* view transitions */
--duration-enter:    350ms; /* spring-in (new column) */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1); /* overshoot on column add */
--ease-out:      cubic-bezier(0, 0, 0.2, 1);
```

---

## Type System

Shared with RobicDirect for cross-project brand consistency:

| Role | Font | Weight | Size | Feature |
|---|---|---|---|---|
| Display / Logo | Fraunces | 700 | 18–40px | optical-sizing: auto |
| Section heading | Fraunces | 400 | 20–28px | tracked slightly tight |
| Body | DM Sans | 400 | 14px | 160% line-height |
| Body strong | DM Sans | 600 | 14px | |
| KPI number | DM Sans | 700 | 28–40px | font-variant-numeric: tabular-nums |
| Code / Data | JetBrains Mono | 400 | 10–13px | tabular-nums enforced |
| ICD-10 / ATC codes | JetBrains Mono | 500 | 11px | ALL CAPS, 1px letter-spacing |
| PTRS formula | JetBrains Mono | 400 | 12px | color: --text-secondary |
| Label / Tag | JetBrains Mono | 600 | 9–10px | UPPERCASE, 1px letter-spacing |

**Rule:** Tabular nums everywhere numbers appear. No proportional-width digits in any data context.

---

## Chart Standardization (7 canonical chart types)

| Surface | Chart | Library | Notes |
|---|---|---|---|
| 5-up comparator | Column-equality grid + inline sparklines | Observable Plot | Each column 220px, sparklines 80×24px |
| Heatmap | Color-encoded cell grid | Observable Plot | Single-hue sequential scale; click → drilldown sheet |
| Score breakdown | Horizontal faceted bar (5 dimensions) | Observable Plot | Shared x-axis 0–100; reference line at 50 |
| Portfolio TA distribution | Treemap | Observable Plot | Area = gap count, color = avg composite viability |
| Competitive timeline | Horizontal Gantt | Custom SVG | Phase as duration; indication as row |
| PTRS confidence | Ribbon range chart | Observable Plot | Point estimate + 80% CI ribbon |
| Rank-over-time | Bump chart | Observable Plot | When time-slider scrubbed: rank changes animate |

**Library decision: Observable Plot** (not Visx, not D3 raw, not Recharts)
- Reasons: tightest API for analytical chart types; composable marks system; first-class dark-mode support; React integration via `useRef` + `plot(...)` pattern; no default ugly aesthetics; Tempus and Observable both use it
- Recharts/Chart.js are explicitly banned (AI-slop look)
- D3 raw allowed only for the Gantt (no Plot primitive for it)

---

## Motion Vocabulary

**Principle:** motion earns its place only when it communicates state change. No ambient animation.

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Add indication to 5-up compare | New column spring-slides in from right; existing columns contract proportionally | 350ms | `--ease-spring` |
| Remove indication from compare | Column fades (opacity 1→0) + collapses (width → 0) | 250ms | `--ease-out` |
| Filter change (viability / TA) | Gap cards fade-out at 0.4 opacity, re-sort, fade-in | 200ms | `--ease-standard` |
| Time-slider scrub | All Observable Plot charts re-render at ~60fps via React `useTransition` + low-priority update | Continuous | N/A |
| Heatmap cell hover | Cell opacity 1.0, row + column headers gain --brand-gold underline | 80ms | Linear |
| Heatmap cell click | Sheet slides in from right (shadcn Sheet component) | 300ms | `--ease-out` |
| PTRS gauge | Stroke-dashoffset animates on mount (900ms ease); static on filter changes | 900ms / 0ms | ease |
| prefers-reduced-motion | All durations → 0ms; transforms → none | instant | N/A |

**Rule:** data updates (filter, sort, tab change) are NEVER animated — instant. Only structural changes (adding/removing entities, opening drawers) animate.

---

## Architecture Plan

### Component decomposition (from 1,925-line monolith)

```
src/
  app/
    layout.js
    page.js
    globals.css
    api/
      analyze/route.js
      chat/route.js
  components/
    shell/
      TopBar.jsx          ← company/country selectors, view mode toggle
      Sidebar.jsx         ← watchlist, filter panel
      ChatDrawer.jsx      ← AI chat panel
    views/
      Dashboard.jsx       ← gap card grid (virtualized)
      Comparator.jsx      ← 5-up column-equality view (HERO)
      Heatmap.jsx         ← Observable Plot heatmap
      Portfolio.jsx       ← treemap + stats
      MoleculeReport.jsx  ← molecule-level detail
    detail/
      GapDetailSheet.jsx  ← shadcn Sheet drilldown
      PTRSBreakdown.jsx   ← formula + editable inputs
      L99Panel.jsx        ← AI analysis results
    charts/
      SparkLine.jsx       ← inline trend sparkline
      ScoreDimensions.jsx ← horizontal faceted bar (5 dims)
      HeatmapPlot.jsx     ← Observable Plot wrapper
      TreemapPlot.jsx     ← Observable Plot wrapper
      BumpChart.jsx       ← Observable Plot wrapper
      RangePlot.jsx       ← PTRS confidence ribbon
    primitives/
      ScoreBar.jsx        ← (existing, keep + tokenize)
      Tag.jsx             ← (existing, keep + tokenize)
      CountryPill.jsx     ← (existing, extend to 20 countries)
      WatchlistStar.jsx   ← (existing, keep)
      KPINumber.jsx       ← NEW: big typographic KPI
  lib/
    scoring.js            ← PTRS + composite (extracted from component)
    data/
      companies.js        ← COMPANIES constant
      countries.js        ← COUNTRIES (extended to 20 to match RobicDirect)
      pipeline.js         ← COMPETITIVE_PIPELINE
      ptrs-rates.js       ← PTRS_BASE_RATES
      unmet-need.js       ← UNMET_NEED
  hooks/
    useGaps.js            ← gap computation (extracted useMemo)
    usePortfolio.js       ← portfolio stats
    useWatchlist.js       ← localStorage persistence
    useCompare.js         ← 5-up selection state
```

### Routing
- Switch from single-component state machine to Next.js App Router routes:
  - `/` → Dashboard (default)
  - `/compare` → 5-up Comparator
  - `/heatmap` → Heatmap
  - `/portfolio` → Portfolio
  - `/gap/[id]` → Gap detail (shareable permalink)
  - `/molecule/[slug]` → Molecule report

### Data bridge (optional — flag for Joel)
Phase 9 in the spec calls for cross-linking with RobicDirect. Two options:
- **A (static parity):** Extend ExpandRx's static data to match RobicDirect's 20 countries and scoring weights. Both tools remain independent.
- **B (live bridge):** ExpandRx fetches from RobicDirect's Express API (`/api/gaps`, `/api/molecules`). ExpandRx becomes the comparison view; RobicDirect is the data source. Requires CORS config on RobicDirect.

Recommendation: **Option A first** (unblock Phase 4), flag B for Joel decision. A live bridge makes sense but adds deployment coupling — needs explicit sign-off.

---

## Decisions Locked (value-maximizing counsel applied)

All four questions resolved. Rationale for each: pick the choice that delivers more analytical depth, more data coverage, or more trust — whichever directly raises customer value and adoption.

**1. Chart library → Observable Plot ✓**
Fastest path to reference-bar-quality analytical charts. Composable marks system produces correct chart types (bump, ribbon, treemap, Gantt) without fighting a component library. No default ugly aesthetics. Recharts and Chart.js are banned. D3 raw reserved for the Gantt only (no Plot primitive exists for it).

**2. RobicDirect data bridge → Live bridge (Option B) ✓**
Single source of truth between ExpandRx and RobicDirect drives adoption. An exec using both tools who sees different composite scores for the same molecule loses trust in both tools simultaneously. ExpandRx will fetch from RobicDirect's Express API (`/api/gaps`, `/api/molecules`, `/api/countries`) using SWR with stale-while-revalidate caching — so ExpandRx remains functional if RobicDirect is offline (last-known data shown with a staleness badge). CORS header added to RobicDirect's API routes.

**3. Country count → Extend to 20 ✓**
More markets = more gaps surfaced per session = more value per login. 20 countries matches RobicDirect's canonical list. The 8 missing countries (DE, FR, IT, ES, MX, RU, SA, TR) get added to `generateIndicationData` pools with reasonable evidence mappings. Global coverage is table stakes for the exec audience.

**4. Scoring methodology → Keep ExpandRx's 7-dimension model ✓**
ExpandRx's analytical purpose is different from RobicDirect's: ExpandRx answers "can we get this approved?" (technical/clinical feasibility), RD answers "which markets should we enter?" (commercial opportunity). PTRS, unmet need, and competitive density are all directly load-bearing for ExpandRx's question — removing them would reduce analytical depth. Resolution: keep the 7-dimension composite, standardize viability tier labels to lowercase (excellent/strong/moderate/low) to match RobicDirect's visual language, and add a methodology tooltip on the composite score badge explaining the difference. Transparency beats false consistency.

**5. AI model → claude-sonnet-4-20250514 ✓ (stays)**
Sonnet hits the quality bar for L99 panel analysis at acceptable latency. Opus would improve multi-domain reasoning depth but adds ~4× cost and ~3× latency — not justified until usage data shows users are hitting sonnet's limits.

---

## Scope for Phase 4+

Pending Joel sign-off, Phase 4 will deliver:
- CSS custom properties (full token system above implemented in globals.css)
- Component decomposition (1,925-line monolith → ~20 focused components)
- Observable Plot installed and wired with brand tokens
- shadcn Sheet, DataTable, Combobox installed (no default styling, full token override)
- Fraunces optical sizing enabled (font-optical-sizing: auto)
- 5-up comparison view with column equality as first new surface built
- PTRS confidence intervals added to existing gauge
- Country set extended to 20 (matching RobicDirect) if Joel approves #3

**STOP HERE — waiting for Joel's go/no-go on this proposal.**
