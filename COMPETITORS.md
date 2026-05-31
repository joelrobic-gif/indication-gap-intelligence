# ExpandRx — Competitor Landscape

*Researched 2026-05-31 (web-grounded). Honest framing: ExpandRx today is a decision-layer
prototype on an illustrative dataset + one source-verified slice; incumbents below ship real,
licensed data at enterprise scale. This maps where ExpandRx fits, who it overlaps, and the
white space.*

---

## 1. The one-sentence position

Incumbents **own the data**. Repurposing-AI startups **own discovery**. Almost nobody owns
the cheap, transparent **"approved-abroad → gap → rNPV → committee-ready business case"
decision layer for already-marketed molecules** — that is ExpandRx's lane.

## 2. Market map (4 categories)

| Category | What they sell | Closeness to ExpandRx |
|---|---|---|
| A. Pharma data / competitive-intelligence incumbents | Licensed pipeline, trial, regulatory, deal data + dashboards | **Closest functionally** — ExpandRx's gap/regulatory/competitive layer is a thin slice of what they cover, but they stop at data, not a costed decision |
| B. Drug-repurposing AI | ML/knowledge-graph discovery of new drug–disease links | Same *mission* (new use for a drug), different *end* — they hunt novel biology; ExpandRx values & packages known, already-approved expansions |
| C. 505(b)(2) / IP / regulatory tools | Orange Book, patent landscape, regulatory tracking | Adjacent — they inform the filing path ExpandRx assumes |
| D. Open / academic knowledge graphs | Free drug–disease–gene graphs | Commodity baseline — free, but raw and undecisioned |

## 3. Category A — Data / CI incumbents (the real competition for budget)

**Market structure:** dominated by four integrated providers — **IQVIA, Clarivate (Cortellis),
Citeline (Norstella), Evaluate (Norstella)** — plus broad challenger **GlobalData**. Large pharma
runs a "best-of-breed" multi-subscription stack. Pricing: GlobalData ~$30–80k/yr; Citeline /
Clarivate six figures/yr.

| Player | What it is | Strength | Gap vs ExpandRx |
|---|---|---|---|
| **Clarivate / Cortellis** | Product + Clinical Trials + **Regulatory (80+ jurisdictions)** + Deals + Competitive Intelligence; Dec-2025 Cortellis Regulatory AI Assistant | The single closest product — global approval data ExpandRx only models | Sells data + dashboards; analyst still hand-builds the rNPV + business case in Excel |
| **IQVIA** | RWE + commercial analytics king (1B+ patient records, 100+ countries, 4B+ Rx claims/yr) | Unmatched real-world/commercial data | Not a repurposing/indication-gap decision tool; no rNPV dossier output |
| **Citeline (Norstella)** | Pharmaprojects (90k drugs, 20k active, 40-yr history) + Trialtrove/Sitetrove; 2025 AI SmartSolutions | Definitive pipeline/trial tracking | Pipeline tracking, not gap-to-value decisioning |
| **Evaluate (Norstella)** | Consensus forecasts + NorstellaLinQ (Evaluate + Citeline + MMIT + Panalgo) | Forecasting/valuation data — overlaps ExpandRx's rNPV inputs | Forecast data feed, not a per-opportunity ranked dossier engine |
| **GlobalData** | Broad drug/trial/regulatory/market aggregator | Cheapest broad coverage | Generalist; no indication-gap or rNPV specialization |

**Read:** Cortellis is the product ExpandRx most resembles in *scope* — and the most natural
**host/acquirer**: ExpandRx's engine + dossier generator is the premium-output layer they lack,
their golden data is the provenance ExpandRx lacks. Complementary, not head-to-head.

## 4. Category B — Drug-repurposing AI (same mission, different end of the pipe)

| Player | Approach | Why NOT a direct competitor |
|---|---|---|
| **Every Cure** | Knowledge-graph + ML ranking of **66M drug–disease pairs**, human-in-the-loop review; non-profit, all diseases | Discovery/ranking of novel repurposing biology — not a commercial BD rNPV/dossier tool; mission-driven, not a pharma-BD product |
| **Healx** | Generative-AI rare-disease repurposing; took sulindac → Fragile X to Phase 2a | Builds its own therapeutic pipeline; not selling a decision platform |
| **BenevolentAI** | Biomedical knowledge graph (baricitinib → COVID) | Internal discovery engine, novel mechanisms |
| **Lantern Pharma** | RADR platform, oncology drug rescue/positioning | Own clinical-stage assets, oncology-specific |
| **Biovista** | "Project Prodigy" systematic discovery; own repositioned pipeline | Discovery + own pipeline, not a buyer-facing SaaS |
| **(adjacent) Insilico, Recursion, Schrödinger** | AI discovery at scale; identify repurposing candidates | NCE/target discovery focus; not approved-molecule indication-gap valuation |

**Read:** these chase *new biology*; ExpandRx exploits *known approvals not yet local*. They de-risk
"does it work"; ExpandRx answers "is the already-proven expansion worth filing here, and what's it
worth." Different question, different buyer.

## 5. Category C — 505(b)(2) / IP / regulatory

- **DrugPatentWatch** — Orange Book, patent terms, prosecution history, competitor products; the
  go-to 505(b)(2) opportunity/IP tool. Overlaps ExpandRx's "is the path clear" question on the IP side; no rNPV/forecast or business-case output.
- **Cortellis Regulatory Intelligence / IQVIA Regulatory Intelligence** — global approval &
  guidance tracking; the real version of ExpandRx's regulatory-gap layer.

## 6. Category D — Open / academic (free baseline)

**DRKG, Clinical Knowledge Graph, OREGANO, Open Targets, DrugBank** (free). Raw drug–disease–gene
graphs for repurposing research. Powerful + free, but: research-grade, no commercial valuation, no
regulatory-gap-by-market view, no dossier — engineering effort required to make anything decisional.
They are the "build-it-yourself" alternative.

## 7. Positioning — two axes

```
                 DECISION-READY (rNPV + ranked business case)
                              ▲
                              │   ★ ExpandRx (thin, cheap, transparent —
                              │      but illustrative data today)
        Evaluate ◄───────────┼───────────────►
        (forecasts)          │   Cortellis CI (data-rich dashboards)
                              │
   RAW DATA / DISCOVERY ──────┼────────────── LICENSED REAL DATA
        Open Targets/DRKG     │   IQVIA / Citeline / GlobalData
        Every Cure/Healx      │
        (discovery)           ▼
```

- **Vertical axis** = how close the output is to a decision (data → forecast → ranked, costed case).
- **Horizontal axis** = data realness/scale.
- ExpandRx sits **top-left**: most decision-ready, weakest data. Incumbents sit **right**: real
  data, weak decision-output. The roadmap (`ACQUISITION.md`) = move ExpandRx right (verified data
  via the adapter) while keeping the decision-readiness edge.

## 8. Where ExpandRx wins / loses

**Wins**
- Output is a **decision**, not a dataset: ranked opportunities + transparent rNPV + sensitivity + a 16-page committee-ready dossier. Incumbents make analysts build this by hand.
- **Clarity of signal** — every score/dollar traceable; gate-correct PTRS; double-count-free rNPV.
- **Indication-expansion niche** for established/generic molecules (the 505(b)(2)/bridging wedge) — under-served by both the data giants and the discovery-AI crowd.
- Lean, cheap, fast; a transparent methodology whitepaper + calibration harness.
- The **outcome-feedback moat** (house-adjusted PTRS) — a compounding edge none of the data feeds have.

**Loses (today)**
- **Data provenance & scale** — incumbents ship real, licensed, global data; ExpandRx is illustrative + one verified slice. This is the gap that gates everything.
- **Enterprise trust/coverage** — 40-yr datasets (Pharmaprojects), 80+ jurisdictions (Cortellis), 1B+ patient records (IQVIA) vs a prototype.
- **No real-world/commercial data** (IQVIA's moat) for true market sizing.
- No customers, brand, or compliance footprint yet.

## 9. White space ExpandRx targets

1. **The decision layer no incumbent ships** — gap → rNPV → dossier, as a product not a services engagement.
2. **Generic/specialty manufacturers** (Pharmascience-class) priced out of six-figure Cortellis/IQVIA stacks — a cheaper, focused indication-expansion tool.
3. **Transparency as a feature** — traceable assumptions + calibration, vs black-box scores.
4. **Outcome-feedback compounding** — proprietary, per-desk calibration over time.

## 10. Bottom line

ExpandRx is **not** trying to out-data IQVIA/Cortellis or out-discover Every Cure — it would lose
both. Its defensible lane is the **transparent decision layer on top of approved-molecule expansion
opportunities**, ideally **riding an incumbent's golden data** (Cortellis the obvious host) or
**serving the under-tooled generics tier directly**. Closest single competitor: **Clarivate
Cortellis** (scope overlap + best acquirer fit). Biggest structural risk: any incumbent bolts a
"business-case generator" onto data they already own — so ExpandRx's window is **provenance +
a signed pilot + the outcome moat**, fast (see `ACQUISITION.md`).

## 11. Cost comparison

Most vendors keep pricing confidential (custom enterprise contracts); figures below are
research estimates except DrugPatentWatch (publicly listed).

| Player | Annual cost (est.) | Model |
|---|---|---|
| IQVIA | ~$50k/mo+ enterprise → **$600k–$1M+/yr** (≈$5–15k/mo for 10 users) | Custom, seats + modules |
| Clarivate / Cortellis | **six figures/yr** (modules ~$10–20k/seat; enterprise $50–100k+) | Custom, per-module |
| Citeline (Pharmaprojects) | **six figures/yr** | Custom |
| Evaluate | undisclosed, six-figure-class | Custom (Norstella) |
| GlobalData | **$30–80k/yr** | Tiered |
| DrugPatentWatch | **$3k–8k/yr** + modules ($2–7k ea) — only publicly priced | Self-serve SaaS |
| Repurposing-AI (Every Cure, Healx, Biovista…) | **N/A** — non-profit / own pipelines / services, not a product you buy | — |
| Open KGs (DrugBank, Open Targets, DRKG) | **free** | Build-it-yourself |
| **★ ExpandRx** | **~CAD $40–75k paid POC** (`PILOT.md`), then a focused annual license well below the incumbent stacks | Pilot → license |

**The number that matters:** large pharma runs a *best-of-breed stack* (IQVIA + Cortellis +
Citeline + Evaluate) commonly totalling **$200k–$1M+/yr** — and the analyst still hand-builds
the rNPV business case in Excel. ExpandRx's wedge: (1) the **generics/specialty tier** is priced
out of six-figure stacks; (2) you pay for the **decision** (gap→rNPV→dossier), not another data
feed. Caveats: incumbents ship **real licensed data** (ExpandRx is illustrative + one verified
slice today), and the cleanest play is ExpandRx **riding** a feed already licensed, not replacing it.

---

### Sources
- [Pharma market-intelligence providers overview — IntuitionLabs](https://intuitionlabs.ai/articles/pharmaceutical-market-intelligence-providers)
- [Top biopharma business-intelligence services — DrugPatentWatch](https://www.drugpatentwatch.com/blog/what-are-the-top-biopharmaceutical-business-intelligence-services/)
- [Cortellis explained — IntuitionLabs](https://intuitionlabs.ai/articles/clarivate-cortellis-guide)
- [IQVIA Regulatory Intelligence](https://www.iqvia.com/solutions/integrated-global-compliance/regulatory-compliance/iqvia-regulatory-intelligence)
- [Pharmaprojects — Citeline](https://www.citeline.com/en/products-services/clinical/pharmaprojects)
- [Every Cure end-to-end repurposing platform](https://drugrepocentral.scienceopen.com/hosted-document?doi=10.58647/REXPO.25000098.v1)
- [Healx](https://healx.ai/) · [Biovista](https://www.biovista.com/)
- [AI in drug repurposing market size — Grand View Research](https://www.grandviewresearch.com/industry-analysis/ai-drug-repurposing-market-report)
- [505(b)(2) IP/commercial strategy — DrugPatentWatch](https://www.drugpatentwatch.com/blog/review-of-drugs-approved-via-the-505b2-pathway-uncovering-drug-development-trends-and-regulatory-requirements/)
- [Knowledge graphs for drug repurposing — Briefings in Bioinformatics](https://academic.oup.com/bib/article/25/6/bbae461/7774899)
- [Clarivate alternatives + pricing — Salesmotion](https://salesmotion.io/clarivate-alternatives)
- [IQVIA pricing — ITQlick](https://www.itqlick.com/ims-health/pricing)
- [DrugPatentWatch pricing](https://www.drugpatentwatch.com/pricing/)
- [Cortellis value & pricing — Oreate AI](https://www.oreateai.com/blog/navigating-the-landscape-of-clarivate-cortellis-understanding-its-value-and-pricing/6f2af9e8d3a62235fe38d0234a2598ec)
