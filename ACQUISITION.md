# ExpandRx — Acquisition Value-Creation Plan

**L99 panel · 2026-05-31.** Seven independent expert lenses (M&A, pharma-data domain
buyer, SaaS/data valuation, product/enterprise-readiness, scientific credibility,
technical architecture, moat/IP) reviewed the live platform. This is the candid,
diligence-grade synthesis — written to survive an acquirer's diligence team, not to hype.

---

## Honest current state

ExpandRx today is a fast, well-crafted **single-author prototype, not an acquirable
company or data asset**. All seven lenses converge: the **rNPV/PTRS valuation engine** and
the **16-page print-ready business-case report** are genuinely competent, data-source-agnostic
IP a senior BD&L analyst would respect — but they sit on **~5 MB of 100% AI-fabricated data
with zero provenance** (no NCT IDs, no regulator links, no as-of dates), demonstrable factual
errors (e.g. Metformin shown approved in oncology), and headline scale (~23k gaps / ~11k
cases) that is an inflated synthetic cross-join with intentional per-company duplicates and
an EU-counted-as-its-own-members double-count. The "autonomous 7-department AI swarm" is a
deterministic client-side `setInterval` over a precomputed array (no LLM in the loop; two
orphaned API routes). No revenue, customers, auth, multi-tenancy, RBAC, audit log,
server-side persistence, tests, or CI; an unrevoked leaked PAT; no LICENSE; stale deploy;
a HIGH-severity Next.js CVE.

**Realistic outcome as-is:** sub-$1M acqui-hire / IP-and-concept tuck-in priced on the
engine + UX + founder velocity + the Goodman/Pharmascience relationship — explicitly **NOT**
a data or methodology moat.

---

## Who realistically acquires it

| Acquirer | Thesis | Pays for |
|---|---|---|
| **Pharma-data incumbents** (Citeline/Norstella, Clarivate/Cortellis, Evaluate, IQVIA, GlobalData, Definitive) | They own verified approval/trial/pipeline data but lack a clean gap→rNPV→dossier workflow; analysts still hand-build in Excel/PPT. ExpandRx is the missing premium-output layer on their golden source. | The data-source-agnostic rNPV/PTRS engine, the inline-SVG dossier generator, the ingestion/normalization schema, and an acqui-hire of the builder. Time-to-feature, not data. |
| **Strategic generics / repurposing** (Pharmascience first — the funder — then Apotex/Sun/Sandoz/Viatris) | "Approved abroad, missing at home → bibliographic/505(b)(2) bridging filing" is a real underserved internal workflow. Goodman×Pharmascience is the warmest channel and the single most realistic exit. | Internal BD&L decision tool on their own pipeline + a licensed feed; the report as a committee-ready deliverable; the founder. A signed pilot/LOI here beats any code improvement for valuation. |
| **Acqui-hire / talent buyer** (pharma-analytics or life-sci-SaaS scale-up) | Fallback if neither integration nor pilot matures. Asset = founder velocity shipping investor-legible, domain-literate artifacts on a clean codebase + a correct rNPV/PTRS mental model. | The team + methodology as a head-start; platform treated as throwaway. Lowest band, but the floor. |

---

## Top value drivers (what survives diligence)
1. **rNPV/PTRS engine** — PTRS applied only at the regulatory gate; remaining dev/filing risk-weighted separately (0.90); WACC kept pure (no double-count); sorted tornado sensitivity. Pure, offline, data-source-agnostic, unit-testable. The spine of every thesis.
2. **Business-case report generator** (`CaseReport.jsx`) — 16-page, print/PDF, dependency-free inline-SVG. The actual sellable artifact; ports into any host app.
3. **Ingestion + normalization pipeline** (`build-universe.mjs`) — deterministic seeded build, salt-name normalization, correct ATC/TA/regulator ontologies. Model is sound + transferable even though content is fake — repoint at a licensed feed and the app lights up.
4. **Intellectual honesty** — pervasive "validate against primary sources" disclaimers reduce reps-and-warranties risk.
5. **Goodman × Pharmascience channel** — warm, thesis-aligned route into a real manufacturer. Structured as a pilot/LOI, it's the most acquirable non-code asset.
6. **Clean, lean, low-debt codebase + hardened AI proxy** — fast integration, low carrying cost, credible work sample.

## Deal-killers (must fix or they walk)
1. **100% AI-fabricated data, zero provenance** — no NCT IDs, regulator links, citations, or as-of dates across ~13,830 rows; no `source` field. Unanimous #1 break.
2. **Falsifiable false claims about real entities** — Metformin "approved" in oncology (JP/KR/CN); invented holdings/competitor programs attributed to named real companies. Accuracy **and** defamation/legal exposure; drives the rNPV market-share math.
3. **Overclaiming** — "autonomous AI swarm" is a `setInterval` over a static array; only two real LLM endpoints, both orphaned. Diligence punishes overclaiming harder than it rewards flash.
4. **Security/IP hygiene auto-no-go** — leaked classic PAT unrevoked, no LICENSE, HIGH-sev Next.js CVE on a stale pin, indexable synthetic dataset (`robots:index:true`), stale live build.
5. **Zero commercial validation** — no revenue/customers/LOIs/pilots/pricing/usage; CAC/LTV/NRR uncomputable.
6. **No enterprise plumbing, no moat** — no auth/tenancy/RBAC/audit; state in one browser's localStorage; no tests/CI/observability; core method (disclosed weights + textbook rNPV) replicable in days.

---

## Quick wins (do this week)
- **Revoke the leaked GitHub PAT**, scrub git history (BFG/filter-repo), confirm repo private. *(hours)*
- Add **LICENSE** + copyright headers + one-page IP-ownership/funder clarification. *(hours)*
- **Reframe the headline** off "autonomous AI swarm" → "deterministic indication-gap valuation & business-case engine"; add an **"ILLUSTRATIVE / SYNTHETIC — NOT FOR INVESTMENT/CLINICAL USE"** banner + blocking acknowledgment + PDF watermark. *(days — biggest credibility-per-hour win)*
- `npm audit fix` + bump Next.js off the CVE; `robots:index:false`; redeploy current build (live URL is stale). *(hours)*
- Fix the stale "123 molecules" string + EU-as-member double-count; dedupe indications within a molecule. *(day)*
- Re-report scale honestly: lead with **unique-molecule** counts; label the cross-join "candidate combinations"; wire/delete the orphaned API routes. *(day)*
- Add **unit tests + CI** on the pure scoring/rNPV/PTRS functions. *(days — protects the one valuable asset)*

---

## Phased roadmap (attractiveness rises monotonically; spend stays contingent)

**Phase 0 — Week 1 · Clear binary no-go flags.** Revoke PAT + scrub history + repo private; LICENSE + copyright + IP/funder ownership; `npm audit fix` + Next bump + `robots:index:false`; honest reframe + synthetic banner + PDF watermark; wire/delete orphaned routes; fix stale strings; redeploy current build. *Effect: protects the floor; removes deal-delay friction.*

**Phase 1 — Weeks 2-6 · Prove the engine on REAL, sourced data (one TA slice).** Add a **provenance schema** (`source, sourceUrl, nctId, approvalDate, asOf, confidence`) + citation chips + muted "unverified" styling; build a **pluggable data-adapter** (synthetic files become one provider behind a licensed/public one); source + hand-verify ~25-50 molecules for one TA (FDA Orange Book/Drugs@FDA, EMA, Health Canada DPD, ClinicalTrials.gov); ship 3-5 genuinely TRUE cited reports; fix the dedupe + EU-scoring bugs with a validation gate. *Effect: flips the biggest deal-killer; demo→working product on a sourced slice with a documented integration path. Sub-$100k → credible six-to-seven-figure tuck-in.*

**Phase 2 — Weeks 6-12 · Make the methodology defensible + measurable.** Recalibrate the cost side with cited 505(b)(2)/bridging benchmarks (current $2.5M dev/$0.6M filing understates ~10×, biasing to "go"); externalize all assumptions into a versioned, citation-tagged benchmark library; real epidemiology/population module (replace 75/50 + `approvedCount*12` heuristics); unit tests + CI golden snapshots on the core; publish a **precision/recall + calibration benchmark** (Brier, ECE) on 50-100 claims vs ground truth; capture the generation/validation pipeline as a documented private trade-secret asset; add Error Boundary + Sentry + CI deploys. *Effect: "plausible demo math" → "defensible with our inputs"; pipeline becomes transferable, not tacit.*

**Phase 3 — Weeks 8-16 (parallel) · Land one commercial signal.** Convert Pharmascience/Goodman into a **signed design-partner letter / LOI / paid POC** on their real portfolio; set a price anchor + reference logo; instrument usage; publish an rNPV/PTRS methodology + limitations whitepaper; re-report honest normalized scale in deal materials. *Effect: kills "no commercial validation"; the reference that moves from acqui-hire to strategic premium. Highest valuation-per-dollar.*

**Phase 4 — Months 4-9 (ONLY for a product-multiple exit; gate on Phase 3 traction).** Real auth + SSO + Postgres tenancy + RBAC + route guards; migrate human actions/engine state off localStorage to attributed rows; immutable audit log; real server-rendered exports + one integration (Veeva/SharePoint/Slack); org onboarding + portfolio import + sample-vs-live toggle; **the compounding moat** — a closed-loop outcome layer that tracks which flagged gaps actually get filed/approved and recalibrates PTRS/weights (proprietary outcome data a clone can't replicate); reframe the swarm as genuine scheduled server-side monitoring that re-scores on Phase III readouts/competitor approvals; enterprise-harden the AI proxy. *Effect: unlocks a venture/PE product multiple vs a tuck-in.*

---

## Valuation narrative (post-roadmap)

The story an acquirer underwrites becomes: *"A senior-analyst-grade, source-cited
indication-gap valuation engine — the rNPV/PTRS modeling and circulation-ready dossier
generator that BD&L teams otherwise hand-build in Excel — proven correct on real,
regulator-cited data through a documented data-adapter that plugs into any golden source,
with a published precision/recall + calibration benchmark, a defensible methodology
whitepaper, and a signed pilot with a real generics manufacturer (Pharmascience)
validating that a buyer pays for the output."*

That reframes the deal from a **sub-$1M acqui-hire** into a **strategic tuck-in / product
acquisition**: an incumbent buys "your engine + report generator + our verified data = a
shippable premium module we'd otherwise spend a year building"; a strategic generics player
buys a validated internal BD&L workflow plus (if Phase 4 lands) a continuous-monitoring
system of record with a proprietary outcome-feedback loop that compounds. The premium rests
on three things the prototype lacks and the roadmap manufactures in order: **provenance**
(real + auditable), **validation** (a customer pays), and a **moat** (outcome data that
makes the model measurably better over time).

---

## Appendix — per-lens verdicts
- **M&A / strategic-acquirer:** Not acquirable as a standalone company; credible $50k–$250k acqui-hire / IP tuck-in for a pharma-data incumbent or Pharmascience. North of low-six-figures requires real data + a paying buyer — neither exists today.
- **Pharma data/BD domain buyer:** Core deliverable is 100% AI-generated with zero citations — the one thing their customers won't tolerate. The *workflow IP* (gap→rNPV→dossier) is what incumbents lack. Sub-$1M asset purchase, contingent on swapping in sourced data.
- **SaaS & data-asset valuation:** Pre-everything as SaaS — no revenue/customers/tenancy; "data moat" is fiction. Buying a thesis + UX + founder velocity. Low-to-mid six figures at most.
- **Product & enterprise-readiness:** Compelling demo, pre-product enterprise asset — fails the first security questionnaire (no auth/tenancy/RBAC/audit/exports). Acquirable = methodology + design.
- **Scientific credibility & data integrity:** Engine is honest + transparent; wrapped around fabricated data while the UI claims to "read" regulators it never queries. Methodology demo on synthetic data, not a defensible intelligence asset.
- **Technical architecture:** Clean demo, not an acquirable system. ~600 lines of defensible pure functions; the rest is theater or absent (no backend/DB/pipeline/auth/tests/CI/observability). Acquire the team + model; treat the platform as a throwaway.
- **Moat, IP & defensibility:** Almost no durable moat — a deterministic spreadsheet on static AI data, reproducible in 1-2 weeks. The assets that *could* be defensible (primary-source-validated dataset + generation pipeline) are synthetic or not even in the repo. Price as acqui-hire, not a data/method moat.
