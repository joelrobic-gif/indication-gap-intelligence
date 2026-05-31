// Engine unit tests — pure numeric core (zero-dependency, node:test).
// Run: npm test  ·  CI gate in .github/workflows/ci.yml
// Covers the most-cited deterministic functions/constants: PTRS base rates +
// calculatePTRS, and the finance-panel assumptions. Full scoring/financials
// golden-snapshot coverage is added in Phase 2 (needs a bundler-aware runner).

import { test } from "node:test";
import assert from "node:assert/strict";
import { PTRS_BASE_RATES, calculatePTRS, evidenceTierLabel } from "../src/lib/data/ptrs.js";
import { ASSUMPTIONS } from "../src/lib/engine/assumptions.js";

test("PTRS base rates: every TA has sane transition probabilities", () => {
  const keys = ["p1_p2", "p2_p3", "p3_nda", "nda_appr", "overall_loa", "avg_months"];
  for (const [ta, r] of Object.entries(PTRS_BASE_RATES)) {
    for (const k of keys) assert.ok(k in r, `${ta} missing ${k}`);
    for (const p of ["p1_p2", "p2_p3", "p3_nda", "nda_appr", "overall_loa"]) {
      assert.ok(r[p] > 0 && r[p] <= 1, `${ta}.${p} out of (0,1]: ${r[p]}`);
    }
    assert.ok(r.avg_months > 0 && r.avg_months < 300, `${ta}.avg_months unreasonable`);
  }
});

test("calculatePTRS: monotonic non-decreasing by phase maturity", () => {
  const ta = "cardiovascular";
  const pre = calculatePTRS("Preclinical", ta).ptrs;
  const p1 = calculatePTRS("Phase I", ta).ptrs;
  const p2 = calculatePTRS("Phase II", ta).ptrs;
  const p3 = calculatePTRS("Phase III", ta).ptrs;
  const appr = calculatePTRS("Phase IV approved", ta).ptrs;
  assert.ok(pre < p1, "preclinical < phase I");
  assert.ok(p1 < p2, "phase I < phase II");
  assert.ok(p2 < p3, "phase II < phase III");
  assert.ok(p3 <= appr, "phase III <= approved");
  for (const v of [pre, p1, p2, p3, appr]) assert.ok(v >= 0 && v <= 1, "ptrs in [0,1]");
});

test("calculatePTRS: returns CI bounds and non-negative timeline", () => {
  const r = calculatePTRS("Phase III", "oncology");
  assert.ok(Array.isArray(r.ci80) && r.ci80.length === 2);
  assert.ok(r.ci80[0] <= r.ptrs && r.ptrs <= r.ci80[1] + 1e-9, "ptrs within its CI");
  assert.ok(r.ci80[0] >= 0 && r.ci80[1] <= 1, "CI within [0,1]");
  assert.ok(r.remaining >= 0, "remaining months >= 0");
});

test("calculatePTRS: unknown TA falls back, does not throw", () => {
  const r = calculatePTRS("Phase II", "not-a-real-ta");
  assert.ok(r.ptrs > 0 && r.ptrs < 1);
});

test("evidenceTierLabel maps phases", () => {
  assert.equal(evidenceTierLabel("Phase III (PIVOTAL)"), "Phase III");
  assert.equal(evidenceTierLabel("approved"), "Post-market");
  assert.equal(evidenceTierLabel("something preclinical"), "Preclinical");
});

test("ASSUMPTIONS: valuation inputs are sane and complete", () => {
  assert.ok(ASSUMPTIONS.waccPct > 0 && ASSUMPTIONS.waccPct < 30, "WACC plausible");
  assert.ok(ASSUMPTIONS.exclusivityYears > 0 && ASSUMPTIONS.exclusivityYears <= 20);
  assert.ok(ASSUMPTIONS.erosionAtLoEPct >= 0 && ASSUMPTIONS.erosionAtLoEPct <= 100);
  assert.ok(ASSUMPTIONS.costIncurrenceProb > 0 && ASSUMPTIONS.costIncurrenceProb <= 1);
  const tas = Object.keys(ASSUMPTIONS.byTA);
  assert.ok(tas.length >= 9, "covers the 9 therapy areas");
  for (const [ta, v] of Object.entries(ASSUMPTIONS.byTA)) {
    assert.ok(v.annualNetPriceUSD > 0, `${ta} price > 0`);
    assert.ok(v.peakPenetrationPct > 0 && v.peakPenetrationPct <= 100, `${ta} penetration`);
    assert.ok(v.yearsToPeak > 0 && v.yearsToPeak <= 12, `${ta} yearsToPeak`);
    assert.ok(v.cogsPct >= 0 && v.cogsPct < 100, `${ta} cogs`);
  }
});

test("ASSUMPTIONS: dev cost is monotonic by phase maturity (later = cheaper to finish)", () => {
  const d = ASSUMPTIONS.devCostUSD_M_byPhase;
  assert.ok(d.Preclinical >= d["Phase I"], "preclin >= phase I remaining cost");
  assert.ok(d["Phase I"] >= d["Phase II"], "phase I >= phase II");
  assert.ok(d["Phase II"] >= d["Phase III"], "phase II >= phase III");
  assert.ok(d["Phase III"] >= d.Approved, "phase III >= approved");
});
