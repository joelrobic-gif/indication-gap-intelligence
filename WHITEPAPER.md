# ExpandRx — Methodology & Limitations Whitepaper

*Indication-expansion opportunity discovery, scoring, and risk-adjusted valuation.*
Version 2026.2 · companion to the in-product business-case reports.

---

## 1. Thesis

A drug's biology is constant; its **approvals are not**. The same molecule is cleared
for a new indication in one market years before another. That lag is a recurring,
under-exploited source of value — especially for established / generic molecules, where a
new indication can be pursued via a **bridging / bibliographic (505(b)(2)-style)** filing
that leverages foreign approvals and published evidence rather than a de-novo program.

ExpandRx systematically (1) finds these gaps, (2) scores them on a transparent multi-factor
model, (3) values them with a risk-adjusted NPV (rNPV), and (4) renders a committee-ready
business case. **Clarity of signal** — not more data — is the product: the noise of tens of
thousands of drug × disease combinations reduced to a ranked, costed shortlist whose every
number is traceable to its inputs.

## 2. Gap detection

For each (molecule, indication, home-market) triple: a **gap** exists when the indication is
approved in ≥1 tracked market **and not** in the home market. Tracked set: 20 regulators
(FDA, EMA, Health Canada, PMDA, …). Whitespace = approved nowhere yet (frontier).

## 3. Seven-factor composite score (0–99)

Weighted sum of normalized sub-scores:

| Factor | Weight | Basis |
|---|---|---|
| Evidence quality | 0.20 | Highest trial phase reached for the indication |
| Global breadth | 0.15 | # markets already approved |
| Regulatory precedent | 0.15 | Strength/number of prior approvals |
| Commercial | 0.15 | Addressable population × market value |
| PTRS | 0.15 | Probability of technical & regulatory success |
| Unmet need | 0.10 | Severity / gaps in current standard of care |
| Competitive whitespace | 0.10 | Inverse of tracked competitor density |

Viability tiers: Excellent ≥75, Strong ≥60, Moderate ≥45, Low <45.

## 4. PTRS (probability of technical & regulatory success)

PTRS is applied at a **single regulatory gate** — appropriate for an already-approved
molecule whose CMC/tox/core-safety are retired — not the NCE Phase-1→approval rate. Base
rates are therapy-area phase-transition probabilities (BIO / QLS Advisors / Informa Pharma
Intelligence). Output carries an 80% confidence interval and an estimated time-to-approval.

## 5. rNPV valuation

```
rNPV = PTRS × NPV(post-approval net commercial cash flows)
       − costIncurrenceProb × NPV(remaining development + filing cost)
```

- Revenues risk-adjusted by **PTRS** at the gate; remaining spend taken at **90%** (incurred
  largely regardless of outcome). **WACC is kept pure** (cost-of-capital only) so program risk
  is not double-counted — it is already carried by PTRS.
- Bottom-up revenue: global population → value-weighted home share → peak penetration (by TA)
  → net price/patient → ramp over years-to-peak → exclusivity window → generic erosion.
- A **tornado sensitivity** flexes penetration, price, PTRS and WACC.

### Key benchmark assumptions (v2026.2, sourced)
| Input | Value | Basis |
|---|---|---|
| WACC | 13% | Small specialty/generic single-product cost-of-capital |
| Exclusivity window | 3 yr | No hard IP on a bibliographic label |
| Erosion post-window | 45%/yr retained | Generic price-erosion comps |
| Remaining dev cost | $2M (approved-elsewhere) → $90M (preclinical) | DiMasi/Tufts scaled for 505(b)(2)/repurposing; Nosengo (Nature 2016) |
| Filing | $2M | Agency fees + dossier + medical writing + PV |
| SG&A | 30% of net sales | Large-cap SG&A on shared infra, single-market extension |

Full citations: `src/lib/engine/assumptions.js` → `sources`.

## 6. Validation

A calibration harness (`scripts/calibrate.mjs` → `CALIBRATION.md`) scores predicted PTRS
against labelled outcomes in the **source-verified slice** using **Brier score** and
**Expected Calibration Error (ECE)** with a binned reliability table. The engine core
(scoring, PTRS, rNPV) is regression-protected by a unit-test suite (CI-gated).

## 7. Data provenance

- Indications carry a `confidence` flag. **Verified** rows are sourced + adversarially
  verified against primary sources (FDA/EMA/Health Canada labels, ClinicalTrials.gov NCT IDs,
  approval years) and display a citation in-product. The first verified slice covers
  cardiovascular (statins, PCSK9, SGLT2, MRAs, icosapent ethyl, etc.).
- **Illustrative** rows are model-generated for demonstration and are clearly labelled as
  such in the UI and on every report.

## 8. Limitations (stated plainly)

1. **Most of the bundled dataset is illustrative**, not sourced. Only the verified slice is
   citation-backed today; the rest demonstrates the engine.
2. **Calibration is not yet a balanced backtest** — the verified slice is approval-skewed
   (~92% base rate); negative labels (failed/withdrawn programs) are required for a
   decision-grade reliability curve.
3. **Population & pricing are TA-level benchmarks**, not asset-level market research.
4. **No live data pipeline yet** — the verified slice is a point-in-time compilation, not a
   continuous regulator feed.

These are the explicit work items on the roadmap (`HANDOFF.md`, `ACQUISITION.md`): swap the
illustrative layer for licensed/sourced data behind the existing data-adapter, add negative
labels for calibration, and stand up a continuous monitoring feed.

## 9. What is defensible

The **methodology** (gate-correct PTRS, double-count-free rNPV, transparent weights), the
**ingestion/normalization pipeline**, the **provenance model**, and the **dossier generator**
are real, transferable IP. They are data-source-agnostic: point the adapter at a golden
source and the platform produces sourced, decision-grade output unchanged.

---

*Illustrative figures are not for investment or clinical decisions. Validate all claims
against primary sources before any decision.*
