// ═══ ExpandRx SCORING ENGINE ═══
// 7-dimension composite scoring for indication-level gap analysis.
// Distinct from RobicDirect's 5-dimension model (different analytical purpose):
//   - RobicDirect: market opportunity scoring (which country to enter?)
//   - ExpandRx: technical feasibility scoring (can we get this approved?)
// Viability labels harmonized with RobicDirect: lowercase (excellent/strong/moderate/low).

import { COMPETITIVE_PIPELINE, UNMET_NEED } from "./data/pipeline";
import { calculatePTRS } from "./data/ptrs";

// ── Composite weights (must sum to 1.0) ──
export const WEIGHTS = {
  evidence:    0.20,
  breadth:     0.15,
  regulatory:  0.15,
  commercial:  0.15,
  ptrs:        0.15,
  unmet:       0.10,
  competitive: 0.10,
};

export function computeEvidenceScore(evidence) {
  if (evidence.includes("Phase IV") || evidence.includes("approved")) return 0;  // already approved, not a gap
  if (evidence.includes("Phase III")) return 85;
  if (evidence.includes("Phase II")) return 60;
  if (evidence.includes("Phase I")) return 35;
  return 20; // preclinical
}

export function computeBreadthScore(approvedCount) {
  return Math.min(approvedCount * 12, 95);
}

export function computeRegulatoryScore(approvedCount) {
  if (approvedCount >= 4) return 90;
  if (approvedCount >= 2) return 70;
  return 50;
}

export function computeCommercialScore(patientPop) {
  return patientPop !== "N/A" ? 75 : 50;
}

export function computeCompetitiveScore(indication) {
  const competitors = COMPETITIVE_PIPELINE[indication] || [];
  const n = competitors.length;
  if (n === 0) return 95;
  if (n <= 2)  return 75;
  if (n <= 4)  return 55;
  return 35;
}

export function computeUnmetScore(indication) {
  const unmet = UNMET_NEED[indication];
  return unmet ? unmet.score : 50;
}

export function computeComposite(scores) {
  return Math.round(
    scores.evidence    * WEIGHTS.evidence    +
    scores.breadth     * WEIGHTS.breadth     +
    scores.regulatory  * WEIGHTS.regulatory  +
    scores.commercial  * WEIGHTS.commercial  +
    (scores.ptrs * 100) * WEIGHTS.ptrs       +
    scores.unmet       * WEIGHTS.unmet       +
    scores.competitive * WEIGHTS.competitive
  );
}

export function viabilityTier(composite) {
  if (composite >= 75) return { tier: "excellent", color: "var(--viability-excellent)", label: "Excellent" };
  if (composite >= 60) return { tier: "strong",    color: "var(--viability-strong)",    label: "Strong" };
  if (composite >= 45) return { tier: "moderate",  color: "var(--viability-moderate)",  label: "Moderate" };
  return                      { tier: "low",       color: "var(--viability-low)",       label: "Low" };
}

/**
 * Score a single (molecule, indication, homeCountry) triple.
 * Returns null if no gap exists (already approved or no precedent).
 */
export function scoreGap(indication, homeCountry, molecule) {
  const approvedCount = indication.countries.length;
  const gapExists = !indication.countries.includes(homeCountry) && approvedCount > 0;
  if (!gapExists) return null;

  const ptrsData   = calculatePTRS(indication.evidence, molecule.ta || "inflammation");
  const unmet      = UNMET_NEED[indication.indication] || null;
  const competitors = COMPETITIVE_PIPELINE[indication.indication] || [];

  const scores = {
    evidence:    computeEvidenceScore(indication.evidence),
    breadth:     computeBreadthScore(approvedCount),
    regulatory:  computeRegulatoryScore(approvedCount),
    commercial:  computeCommercialScore(indication.patients),
    ptrs:        ptrsData.ptrs,
    unmet:       unmet ? unmet.score : 50,
    competitive: computeCompetitiveScore(indication.indication),
  };

  const composite = computeComposite(scores);
  const { tier, color, label } = viabilityTier(composite);

  return {
    // Identity
    id: `${molecule.name}::${indication.indication}`,
    molecule:       molecule.name,
    moleculeClass:  molecule.class,
    atc:            molecule.atc,
    ta:             molecule.ta,
    indication:     indication.indication,
    // Coverage
    approvedIn:     indication.countries,
    notApprovedIn:  homeCountry,
    evidence:       indication.evidence,
    patientPop:     indication.patients,
    // Scores (7 dimensions + composite)
    scores: { ...scores, composite },
    // PTRS (with CI)
    ptrs: ptrsData,
    // Context
    unmetNeed:        unmet,
    competitors,
    competitiveScore: scores.competitive,
    // Viability
    viability: tier,    // lowercase canonical
    viabilityLabel: label,
    color,
  };
}
