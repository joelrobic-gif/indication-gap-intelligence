// Golden tests for the scoring + rNPV financial core (Phase 2).
// Importable now that scoring.js / financials.js use explicit .js specifiers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreGap, computeComposite, viabilityTier } from "../src/lib/scoring.js";
import { computeFinancials, parsePatients } from "../src/lib/engine/financials.js";
import { ASSUMPTIONS } from "../src/lib/engine/assumptions.js";

const MOLECULE = { name: "Testastatin", class: "Test class", atc: "C10AA99", ta: "cardiovascular" };
const INDICATION = { indication: "Heart Failure (HFrEF)", countries: ["US", "EU", "UK"], evidence: "Phase III", patients: "64M" };

test("computeComposite + viabilityTier thresholds", () => {
  const v = computeComposite({ evidence: 85, breadth: 80, regulatory: 90, commercial: 75, ptrs: 0.55, unmet: 70, competitive: 75 });
  assert.ok(v >= 0 && v <= 99, "composite in [0,99]");
  assert.equal(viabilityTier(80).tier, "excellent");
  assert.equal(viabilityTier(65).tier, "strong");
  assert.equal(viabilityTier(50).tier, "moderate");
  assert.equal(viabilityTier(30).tier, "low");
});

test("scoreGap: gap exists when approved abroad but not at home", () => {
  const g = scoreGap(INDICATION, "CA", MOLECULE);
  assert.ok(g, "gap returned");
  assert.ok(g.scores.composite >= 0 && g.scores.composite <= 99);
  assert.ok(g.ptrs.ptrs > 0 && g.ptrs.ptrs <= 1);
  assert.deepEqual(g.approvedIn, ["US", "EU", "UK"]);
  assert.equal(g.notApprovedIn, "CA");
  assert.equal(g.provenance, null, "illustrative row → null provenance");
});

test("scoreGap: returns null when already approved at home", () => {
  const g = scoreGap({ ...INDICATION, countries: ["US", "CA"] }, "CA", MOLECULE);
  assert.equal(g, null);
});

test("scoreGap: carries verified provenance through", () => {
  const cited = { ...INDICATION, confidence: "verified", source: "FDA label", nctId: "NCT01234567", asOf: "2020", sourceUrl: "https://x" };
  const g = scoreGap(cited, "CA", MOLECULE);
  assert.ok(g.provenance && g.provenance.confidence === "verified");
  assert.equal(g.provenance.nctId, "NCT01234567");
});

test("parsePatients handles units", () => {
  assert.equal(parsePatients("64M"), 64e6);
  assert.equal(parsePatients("1.3B"), 1.3e9);
  assert.equal(parsePatients("500K"), 500e3);
  assert.equal(parsePatients("N/A"), null);
  assert.equal(parsePatients("28/100K"), null); // prevalence — needs a base pop
});

test("computeFinancials: produces a coherent rNPV build", () => {
  const g = scoreGap(INDICATION, "CA", MOLECULE);
  const f = computeFinancials(g, "CA");
  assert.ok(Number.isFinite(f.rnpv), "rNPV finite");
  assert.ok(f.peakSales > 0, "peak sales > 0");
  assert.ok(Number.isFinite(f.commercialNPV) && f.commercialNPV >= 0);
  assert.equal(f.sensitivity.length, 4, "tornado has 4 drivers");
  for (const s of f.sensitivity) { assert.ok(Number.isFinite(s.low) && Number.isFinite(s.high)); }
  // Phase III remaining dev cost reflects the recalibrated benchmark ($8M).
  assert.equal(f.devCost, ASSUMPTIONS.devCostUSD_M_byPhase["Phase III"] * 1e6);
  // Unrisked NPV must exceed risk-adjusted rNPV (PTRS < 1).
  assert.ok(f.npv >= f.rnpv - 1, "npv >= rnpv (risk weighting reduces value)");
});

test("computeFinancials: higher PTRS lifts rNPV, all else equal", () => {
  const g = scoreGap(INDICATION, "CA", MOLECULE);
  const lo = computeFinancials({ ...g, ptrs: { ...g.ptrs, ptrs: 0.3 } }, "CA");
  const hi = computeFinancials({ ...g, ptrs: { ...g.ptrs, ptrs: 0.8 } }, "CA");
  assert.ok(hi.rnpv > lo.rnpv, "more probable → more valuable");
});
