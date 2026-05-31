# REFERENCES.md — Competitive Analysis
## ExpandRx L99 v3 | Phase 1 Reference-Site Catalog

---

## Observable (observablehq.com)
**Archetype:** Data-density-led. Charts ARE the UI; prose is subordinate.

**Chart-type choices for similar data shapes:**
- Tabular data with sparklines: inline SVG bars + color-encoded cells — never a plain table
- Multi-series time data: area chart with smart overlapping opacity (not separated lines)
- Distribution: beeswarm / dot plot over histogram — individual points matter
- Comparison (multi-entity): small multiples with shared axis, NOT grouped bars
- Categorical hierarchy: treemap with quantitative encoding, cells labeled by value

**Color system for 8+ categorical entities:**
- Perceptually-spaced observable10 palette (slate-blue, orange, cyan, vermillion, blue, yellow, green, pink)
- Luminance-normalized: each hue hits ≈55 APCA contrast on dark backgrounds
- No gradient fills; desaturated fills with saturated strokes

**Animation pattern for filter/selection changes:**
- Zero animation on data transitions (analytical audience, no "aha moment" needed)
- Instant highlight-then-fade for selection (200ms opacity pulse)
- Pan/zoom with CSS transform (no reflow)

**Key takeaway for ExpandRx:** Observable's rule is "if you have a table, ask if a chart answers faster." Every comparison surface in ExpandRx should have at least one chart per row.

---

## Airtable (airtable.com)
**Archetype:** Relational data, multi-view switching, progressive disclosure.

**Chart-type choices:**
- Entity comparison: column-locked grid with custom cell renderers — sparklines in cells, colored tags, avatars
- Aggregate view: grouped bar / stacked bar in a side panel, not a full page
- Record detail: vertically stacked "field" layout with labeled sections — no cards within cards

**Color system:**
- Semantic colors only (status = green/yellow/red/gray)
- All entity differentiation via saturation-reduced "badge" system (12 colors, all at 25-30% saturation)
- No color for decoration — every hue carries data meaning

**Animation:**
- View transitions: slide-over animation when switching table → kanban → calendar (150ms ease-out)
- Field focus: border animate-in on hover (no box-shadow — border only)
- Drawer: spring animation from right edge

**Key takeaway for ExpandRx:** Airtable shows that switching between 6 views of the same data is more powerful than building 6 separate pages. ExpandRx's dashboard/heatmap/comparator are the same data viewed differently — they should transition as a view-mode toggle, not separate routes.

---

## Snowflake (snowflake.com)
**Archetype:** Analytics enterprise — restraint as authority signal.

**Chart-type choices:**
- KPI summary: large typographic number + trend arrow + small sparkline (no gauge, no donut)
- Distribution: horizontal bar chart with reference line (not pie)
- Time series: single-line chart with threshold highlight and annotation markers
- Correlation matrix: heatmap with diverging color scale — warm/cool not red/green

**Color system:**
- 2-color brand (deep blue + sky blue), extended with 4 neutrals
- Sequential scale: single-hue (blue family) for quantitative heatmaps
- No fill on line charts — stroke only, 2px weight

**Typography:**
- All numbers: tabular-nums font-variant enforced via CSS
- KPI labels: ALL CAPS, 10px, 120% letter-spacing
- Body: 14px with 160% line-height — dense but breathable

**Key takeaway for ExpandRx:** Snowflake's KPI summary approach (big number + sparkline) should replace ExpandRx's current hero stats section. PTRS should be a big typographic number, not just a gauge.

---

## Polymath / Crunchbase
**Archetype:** Entity-comparison intelligence — "Bloomberg for startups/pharma."

**Chart-type choices:**
- Entity list → detail: master-detail split with pinned column headers
- Side-by-side comparison: column-equality grid — every column the same width, every metric on the same row
- Competitive landscape: bubble chart (x=market size, y=PTRS, size=competitive density)
- Rank change: bump chart (rank-over-time) for indication priority shifts
- Score breakdown: horizontal bar per dimension, all bars aligned left, reference baseline at 50

**Color system:**
- 8-entity palette: Tableau 10 (first 8 colors) — confirmed color-blind safe for deuteranopia
- Consistent entity-color assignment: entity A always uses color 1 across ALL charts on the page
- Selection: entity-color at 100% opacity; non-selected at 20% opacity

**Animation:**
- Adding entity to compare: spring-slide-in new column, existing columns contract proportionally (350ms spring)
- Removing entity: cross-fade + collapse (250ms)
- Hover: immediate (0ms) opacity boost on hovered entity across all linked charts

**Key takeaway for ExpandRx:** The killer feature isn't the data — it's the column-equality layout that lets execs scan 5 indications side-by-side in 10 seconds. ExpandRx's comparator must use this model, not a card-per-molecule layout.

---

## Tempus (tempus.com)
**Archetype:** Precision medicine + institutional credibility.

**Chart-type choices:**
- Patient stratification: waterfall chart (patients sorted by response magnitude)
- Biomarker distribution: violin plot (shows distribution shape, not just median/IQR)
- Trial enrollment: Gantt with milestone markers
- Molecular landscape: scatter plot with quadrant annotation ("High efficacy / Low toxicity" zones)

**Color system:**
- Institutional palette: deep teal + warm sand + navy
- Clinical data: diverging scale (blue=below threshold, red=above threshold, white=at threshold)
- Confidence intervals shown as filled ribbons, not error bars

**Key takeaway for ExpandRx:** Every PTRS and composite score should show a confidence interval. Point estimates alone mislead exec audiences — Tempus makes this non-negotiable in clinical visualization.

---

## Recursion (recursion.com)
**Archetype:** Modern pharma — "science-led" aesthetic with data as hero.

**Chart-type choices:**
- Molecule pipeline: horizontal Gantt (phase as duration bar, indication as row label)
- Indication landscape: force-directed graph (molecules as nodes, shared pathways as edges)
- Portfolio overview: treemap (TA = parent, molecule = child, area = opportunity score)

**Color system:**
- Monochromatic brand + 1 accent (deep green primary, hot yellow-green accent)
- All data: grayscale base with accent for selected/highlighted entities

**Key takeaway for ExpandRx:** The Gantt pipeline view is exactly what ExpandRx needs for "phase-over-time" competitive landscape. Recursion proves you don't need 8 colors if your spatial encoding is strong.

---

## Chart Standardization Decision (7 chart types for ExpandRx)

| Data Shape | Chart Type | Source of Truth |
|---|---|---|
| Indication × competitive density grid | Heatmap (cells = density, color = PTRS band) | Observable |
| Score dimension breakdown per gap | Horizontal faceted bar (5 bars, shared x-axis) | Polymath |
| 5-up indication comparison | Column-equality grid with aligned sparklines | Crunchbase |
| PTRS over time / competitive timeline | Bump chart (rank-over-time) | Crunchbase |
| Portfolio TA distribution | Treemap (area = gap count, color = avg composite) | Recursion |
| Molecule pipeline by phase | Horizontal Gantt (rows = molecules, columns = phase) | Recursion |
| Score confidence intervals | Ribbon-style range chart | Tempus |

**Principle pinned:** chart-type follows data shape, not convention. Gauge charts are banned. Donut charts are banned. Default Recharts/Chart.js aesthetics are banned — every chart gets custom tokens.
