// ═══ COMMERCIAL FINANCIAL MODEL (rNPV) ═══
// Risk-adjusted NPV for an indication-expansion opportunity, built on the
// finance panel's assumptions. Deterministic, offline, transparent.
//
//   rNPV = PTRS × NPV(post-approval net commercial cash flows)
//          − costIncurrenceProb × NPV(remaining development + filing cost)
//
// All cash flows discounted at WACC. Revenues risk-adjusted by PTRS at the
// single regulatory gate; remaining spend taken near-full (incurred regardless).

import { MARKET_VALUE_INDEX, getMarketValue } from "../data/countries.js";
import { ASSUMPTIONS } from "./assumptions.js";

const SUM_INDEX = Object.values(MARKET_VALUE_INDEX).reduce((s, v) => s + v, 0);

// Single-market share of the global indication population (value-weighted).
export function homeShareFrac(home) {
  return (getMarketValue(home)) / (SUM_INDEX || 1);
}

// Parse a population string ("462M", "1.3B", "283M", "N/A", "28/100K") → number | null.
export function parsePatients(str) {
  if (!str || str === "N/A") return null;
  if (/\/\s*100/.test(str)) return null;            // prevalence per-100k — needs a base pop; fall back
  const m = String(str).replace(/,/g, "").match(/([\d.]+)\s*(billion|million|thousand|B|M|K)?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!isFinite(n)) return null;
  const u = (m[2] || "").toLowerCase();
  const mult = u === "b" || u === "billion" ? 1e9 : u === "m" || u === "million" ? 1e6 : u === "k" || u === "thousand" ? 1e3 : 1;
  return n * mult;
}

// Core model — returns the full discounted cash-flow build for a given WACC,
// peak-sales figure and PTRS. Cheap; called repeatedly for sensitivity.
function model({ wacc, peakSales, ptrs, A, devTotal, launchYears, rampYears, window, erosion, netMargin }) {
  const tail = 3;
  const horizon = window + tail;
  const rows = [];
  let revenueNPV = 0, commercialNPV = 0, paybackYear = null;
  for (let k = 0; k < horizon; k++) {
    let rev;
    if (k < rampYears) rev = peakSales * ((k + 1) / rampYears);
    else if (k < window) rev = peakSales;
    else rev = peakSales * Math.pow(erosion, k - window + 1);
    const t = launchYears + k;                       // absolute years from now
    const disc = Math.pow(1 + wacc, t);
    const net = rev * netMargin;
    revenueNPV += rev / disc;
    commercialNPV += net / disc;
    rows.push({ k, t, revenue: rev, net });
  }
  // Remaining development spread over the run-up to launch; filing at launch.
  let devNPV = 0;
  const devAnnual = devTotal.dev / Math.max(launchYears, 1);
  for (let t = 0; t < Math.max(launchYears, 1); t++) devNPV += devAnnual / Math.pow(1 + wacc, t);
  devNPV += devTotal.filing / Math.pow(1 + wacc, Math.max(launchYears, 1));

  const incurrence = A.costIncurrenceProb;
  const rnpv = ptrs * commercialNPV - incurrence * devNPV;
  const npv = commercialNPV - devNPV;

  // Payback (discounted, risk-adjusted) measured from now.
  let running = -incurrence * devNPV;
  for (const r of rows) { running += (r.net / Math.pow(1 + wacc, r.t)) * ptrs; if (running >= 0 && paybackYear === null) paybackYear = r.t; }

  return { rows, revenueNPV, commercialNPV, devNPV, rnpv, npv, paybackYear };
}

export function computeFinancials(gap, homeCountry, A = ASSUMPTIONS) {
  const ta = A.byTA[gap.ta] || A.defaultTA;
  const wacc = A.waccPct / 100;
  const window = A.exclusivityYears;
  const erosion = A.erosionAtLoEPct / 100;
  const ptrs = gap.ptrs.ptrs;
  const cogsPct = ta.cogsPct / 100;
  const sgaPct = A.sgaPctOfSales / 100;
  const netMargin = Math.max(0, 1 - cogsPct - sgaPct);
  const rampYears = Math.max(1, Math.min(ta.yearsToPeak, window));

  const parsed = parsePatients(gap.patientPop);
  const globalPop = parsed ?? A.defaultAddressableGlobal;
  const popEstimated = parsed == null;
  const share = homeShareFrac(homeCountry);
  const homeAddressable = globalPop * share;
  const treatedPeak = homeAddressable * (ta.peakPenetrationPct / 100);
  const peakSales = treatedPeak * ta.annualNetPriceUSD;

  const launchYears = Math.max(Math.round((gap.ptrs.remaining || 12) / 12), 1);
  const devTotal = {
    dev: (A.devCostUSD_M_byPhase[gap.ptrs.phase] ?? A.devCostUSD_M_byPhase["Phase III"]) * 1e6,
    filing: A.filingCostUSD_M * 1e6,
  };

  const base = model({ wacc, peakSales, ptrs, A, devTotal, launchYears, rampYears, window, erosion, netMargin });

  // ── Sensitivity tornado (Δ rNPV vs base) ──
  const ptrsLo = Math.max(0.02, ptrs - A.ptrsSwingPts / 100);
  const ptrsHi = Math.min(0.99, ptrs + A.ptrsSwingPts / 100);
  const penLo = 1 - A.penetrationSwingPct / 100, penHi = 1 + A.penetrationSwingPct / 100;
  const prLo = 1 - A.priceSwingPct / 100, prHi = 1 + A.priceSwingPct / 100;
  const mk = (over) => model({ wacc, peakSales, ptrs, A, devTotal, launchYears, rampYears, window, erosion, netMargin, ...over });
  const sensitivity = [
    { driver: `Peak penetration (±${A.penetrationSwingPct}%)`, low: mk({ peakSales: peakSales * penLo }).rnpv, high: mk({ peakSales: peakSales * penHi }).rnpv },
    { driver: `Net price (±${A.priceSwingPct}%)`, low: mk({ peakSales: peakSales * prLo }).rnpv, high: mk({ peakSales: peakSales * prHi }).rnpv },
    { driver: `PTRS (±${A.ptrsSwingPts} pts)`, low: mk({ ptrs: ptrsLo }).rnpv, high: mk({ ptrs: ptrsHi }).rnpv },
    { driver: `WACC (±${A.waccSwingPct} pts)`, low: mk({ wacc: wacc + A.waccSwingPct / 100 }).rnpv, high: mk({ wacc: wacc - A.waccSwingPct / 100 }).rnpv },
  ].sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));

  return {
    globalPop, popEstimated, homeSharePct: share * 100, homeAddressable, treatedPeak,
    annualPrice: ta.annualNetPriceUSD, peakPenetrationPct: ta.peakPenetrationPct,
    cogsPct: ta.cogsPct, sgaPct: A.sgaPctOfSales, netMarginPct: Math.round(netMargin * 100),
    launchYears, rampYears, window, wacc: A.waccPct, ptrsPct: Math.round(ptrs * 100),
    peakSales, revenueNPV: base.revenueNPV, commercialNPV: base.commercialNPV,
    devNPV: base.devNPV, devCost: devTotal.dev, filingCost: devTotal.filing,
    rnpv: base.rnpv, npv: base.npv, paybackYear: base.paybackYear,
    revenueByYear: base.rows, sensitivity,
  };
}
