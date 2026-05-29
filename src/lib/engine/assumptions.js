// ═══ FINANCIAL MODEL ASSUMPTIONS ═══
// Benchmark inputs for the rNPV (risk-adjusted net present value) model, derived
// by a panel of pharma finance experts (Valuation, Forecasting, Pricing/HEOR,
// R&D Cost, Commercial Cost, Risk). Context throughout: INDICATION EXPANSION of
// an already-marketed small-molecule via a bridging / bibliographic filing into
// a single developed mid-size market (Canada-scale) — NOT a new chemical entity.
//
// Illustrative industry benchmarks (BIO/QLS, EvaluatePharma-style ramp/erosion,
// generic price-erosion comps, 505(b)(2)/repurposing deal comps). Validate
// against primary research before any investment decision.

export const ASSUMPTIONS = {
  // — Valuation (panel) —
  waccPct: 13,              // pure cost-of-capital for a small specialty/generic single-product risk class
  exclusivityYears: 3,      // narrow, quickly-eroding commercial advantage window (no hard IP on a bibliographic label)
  erosionAtLoEPct: 45,      // % of peak retained per year after the window (generic substitution)

  // — Risk / sensitivity tornado swings (panel) —
  waccSwingPct: 2,          // ± absolute points on WACC
  penetrationSwingPct: 30,  // ± relative % on peak penetration
  priceSwingPct: 25,        // ± relative % on price
  ptrsSwingPts: 12,         // ± absolute points on PTRS
  costIncurrenceProb: 0.90, // remaining dev/filing spend is incurred ~regardless of outcome → risk-adjust at 90%, not PTRS

  // — R&D cost: REMAINING cost-to-approval (USD millions) by current highest phase (panel) —
  devCostUSD_M_byPhase: { "Phase III": 2.5, "Phase II": 5, "Phase I": 8, "Preclinical": 12, "Approved": 0.4 },
  filingCostUSD_M: 0.6,

  // — Commercial cost (panel) —
  sgaPctOfSales: 30,        // launch + SG&A as % of net sales (annualized over the window)

  // — Per therapy-area benchmarks (panel) —
  byTA: {
    oncology:       { annualNetPriceUSD: 10000, peakPenetrationPct: 9,  yearsToPeak: 5, cogsPct: 15 },
    hematology:     { annualNetPriceUSD: 7500,  peakPenetrationPct: 20, yearsToPeak: 4, cogsPct: 16 },
    cns:            { annualNetPriceUSD: 900,   peakPenetrationPct: 12, yearsToPeak: 5, cogsPct: 16 },
    cardiovascular: { annualNetPriceUSD: 400,   peakPenetrationPct: 5,  yearsToPeak: 6, cogsPct: 18 },
    metabolic:      { annualNetPriceUSD: 800,   peakPenetrationPct: 6,  yearsToPeak: 6, cogsPct: 17 },
    inflammation:   { annualNetPriceUSD: 2000,  peakPenetrationPct: 10, yearsToPeak: 5, cogsPct: 14 },
    respiratory:    { annualNetPriceUSD: 650,   peakPenetrationPct: 7,  yearsToPeak: 5, cogsPct: 20 },
    gi:             { annualNetPriceUSD: 550,   peakPenetrationPct: 15, yearsToPeak: 4, cogsPct: 17 },
    urology:        { annualNetPriceUSD: 700,   peakPenetrationPct: 13, yearsToPeak: 4, cogsPct: 18 },
  },
  defaultTA: { annualNetPriceUSD: 1200, peakPenetrationPct: 9, yearsToPeak: 5, cogsPct: 16 },

  // Fallback addressable population (global) when a population string can't be parsed.
  defaultAddressableGlobal: 5_000_000,

  rnpvMethod: "rNPV = PTRS × NPV(post-approval net commercial cash flows) − incurrence-probability × NPV(remaining development + filing cost), discounted at WACC. Post-approval cash flows are weighted by PTRS at the single regulatory gate; remaining spend (incurred largely regardless of outcome) is weighted at 90%. WACC is kept as pure cost-of-capital to avoid double-counting program risk already carried by PTRS.",
};
