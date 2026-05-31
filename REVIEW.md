# REVIEW.md — Current State Audit
## IndicationGapIntel L99 v3 | Phase 2

**Persona:** Competitive intel director preparing a 5-indication head-to-head for a strategy offsite. Has 90 seconds to scan and identify which gaps to drill into.

---

## Architecture Audit

### File structure
```
src/
  app/
    layout.js          ← good: font loading, metadata
    page.js            ← 5 lines (just mounts the component)
    globals.css        ← lean and clean
    api/
      analyze/route.js ← AI analysis proxy (correct)
      chat/route.js    ← AI chat proxy (correct)
  components/
    IndicationGapIntelligence.jsx  ← 1,925 lines — ENTIRE APP IN ONE FILE
```

**P0 — Monolithic component:** 1,925-line single JSX file contains data constants, PTRS engine, scoring functions, 6+ view renderers, and all state. Impossible to code-split. First-paint loads the entire application regardless of which view is active. Estimated 40-60% unnecessary JS on initial load.

**P1 — No route splitting:** Dashboard, heatmap, comparator, portfolio, detail, molecule views are conditional renders inside one component — not separate routes. Browser history doesn't work. Sharing a specific view requires manual workaround. No deep-linking.

**P1 — No chart library:** Only visualization is the hand-coded SVG PTRS gauge. Heatmap is an HTML table. Comparator is a 4-column div grid. Portfolio view is text stats. This is the biggest gap vs the reference bar.

---

## Visual Design Audit

### What works
- **Font stack:** Fraunces (serif display) + DM Sans (body) + JetBrains Mono (data) — non-default, intentional. Not Inter/Geist.
- **Dark theme:** #08080d base is deep enough. Not charcoal gray.
- **Gold accent (#d4a853):** Warm, institutional — appropriate for pharma.
- **PTRS gauge:** The SVG radial gauge is the most distinctive visual element. Good starting point.

### Anti-slop violations

❌ **Inline styles everywhere** — 200+ `style={{}}` props. No design tokens, no CSS variables. Changing any spacing or color requires a grep-and-replace across 1,925 lines. Typography inconsistencies (fontSize 9/10/11/13/18 scattered without a scale).

❌ **Default card pattern** — Every gap card uses `background: #12121a, border: 1px solid #1e1e2e, borderRadius: 10, padding: 16`. This is the IGI equivalent of Bootstrap cards. No visual hierarchy between card types.

❌ **No data visualization** — Heatmap view is an HTML table with colored cells — not a heatmap. Comparator view is 4 side-by-side divs with ScoreBars — not a comparison chart. Portfolio view is text bullets — not analytics.

❌ **Viability tags inconsistent with RobicDirect** — IGI uses capital-first "Excellent/Strong/Moderate/Low" in rendering but the scoring comment says old 3-tier. RobicDirect canonicalized to lowercase `excellent/strong/moderate/low`. Cross-tool inconsistency.

❌ **Score bars as the only viz** — `<ScoreBar>` (5px horizontal progress bar) is used for ALL 4 scoring dimensions. Every gap looks identical. No visual grammar distinguishing evidence strength from market breadth from regulatory confidence.

❌ **No confidence intervals** — PTRS and composite scores show point estimates. Exec audience knows these are distributions, not points.

❌ **Country pill rendering** — 12 pills per indication renders as an unreadable blob. No geographic grouping (Americas / Europe / APAC).

❌ **Comparator limited to 4** — Hard-coded `prev.length >= 4` limit. Prompt spec calls for 5-up comparison as the killer feature.

---

## Performance Audit

**No Lighthouse run possible without dev server** — estimates based on code analysis:

| Metric | Estimated | Target |
|---|---|---|
| LCP | 3-4s (single large bundle) | <1s |
| INP | 250ms (re-renders entire 1,925-line component on state change) | <100ms |
| CLS | Low (no images, no font swap on dark bg) | <0.1 |
| Total JS | ~180KB (all views loaded upfront) | <60KB per route |
| Code splitting | None | Per-route |

**Root causes:**
- No `dynamic()` imports for views
- All 1,925 lines execute on mount
- Static data arrays (PTRS_BASE_RATES, COMPETITIVE_PIPELINE, UNMET_NEED) never tree-shaken
- useMemo chain recalculates entire portfolio stats on every state change

---

## Feature Gap vs Spec (05-indicationgapintel.md)

| Feature | Status | Notes |
|---|---|---|
| 5-up comparison view with column equality | ❌ Missing | Current comparator is 4-up divs, not column-equality |
| Aligned sparklines in comparison | ❌ Missing | No sparklines anywhere |
| PTRS score breakdown drawer (editable inputs) | ❌ Missing | PTRS shown as gauge, not editable formula |
| Whitespace-map heatmap (click → drilldown) | ⚠️ Partial | Table not heatmap; no drilldown sheet |
| Time-slider "as-of" rewind | ❌ Missing | Entirely absent |
| Saved-view permalink | ❌ Missing | Absent |
| Confidence intervals on scores | ❌ Missing | Point estimates only |
| Print stylesheet | ❌ Missing | Absent |
| Bump chart (rank-over-time) | ❌ Missing | No chart library |
| Gantt pipeline view | ❌ Missing | Absent |
| RobicDirect cross-link | ❌ Missing | Entirely separate products |
| 8-entity categorical palette (Okabe-Ito) | ❌ Missing | Gold/amber monotone only |

---

## Content + Copy Audit

**What works:**
- PTRS_BASE_RATES sourced from BIO/QLS Advisors 2024 — credible
- L99 analysis panel structure is good — 5 expert domains
- AI chat fallback responses are substantive, not generic

**Issues:**
- App title "Indication Gap Intelligence | L99 Panel Analysis" — inconsistent with RobicDirect brand voice (RD uses restrained, product-first names)
- "v2.0 + PTRS" tag on the logo is AI-SaaS signaling (feature-list in the logo)
- "Indication Gap Intelligence" as logo text is descriptive, not brand-distinctive
- Copy in L99 panel fallback responses occasionally slips into "first-mover advantage" clichés

---

## Data Integrity Issues

**P1 — Country set mismatch:** IGI tracks 12 countries; RobicDirect tracks 20. Same ExpandRX project, different geography. Canada-specific gaps not consistent between tools.

**P1 — Scoring methodology divergence:** IGI composite = evidence(20%) + breadth(15%) + regulatory(15%) + commercial(15%) + ptrs(15%) + unmet(10%) + competitive(10%). RobicDirect = evidence(25%) + breadth(15%) + regulatory(20%) + commercial(20%) + marketValue(20%). Different weights, different dimensions. A competitive intel director using both tools gets contradictory gap rankings for the same molecule.

**P2 — Static data staleness:** COMPETITIVE_PIPELINE hardcoded in JSX. No refresh mechanism. No timestamp. Drug approvals change weekly.

---

## Verdict

The current IGI is a well-conceived analytical engine with a credible data model (PTRS, unmet need, competitive density). The bones are right. But it's built as a prototype, not a war-gaming platform. The monolithic architecture, absence of real charts, and inline-style system all need rebuilding before Phase 6. The PROPOSAL should address these in the correct order: architecture → chart library → design system → surfaces → motion.

**P0 items to fix before anything else:**
1. Decompose 1,925-line component into route-split modules with `dynamic()` imports
2. Add Observable Plot or Visx for chart rendering
3. CSS custom properties for all design tokens

**Persona verdict:** A competitive intel director scanning this for a 90-second pre-offsite overview would get stuck at the heatmap (a table), frustrated by the comparator (4 side-by-side divs), and unable to share their view (no permalink). The data is there. The surfaces are not.
