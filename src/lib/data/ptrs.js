// ═══ PTRS ENGINE ═══
// Phase Transition Rates by Therapeutic Area
// Source: BIO/QLS Advisors 2024 Industry Analysis
// Used by scoreGap() to compute PTRS and remaining months.

export const PTRS_BASE_RATES = {
  oncology:       { p1_p2: 0.329, p2_p3: 0.289, p3_nda: 0.576, nda_appr: 0.906, overall_loa: 0.053, avg_months: 132 },
  cardiovascular: { p1_p2: 0.561, p2_p3: 0.362, p3_nda: 0.651, nda_appr: 0.919, overall_loa: 0.121, avg_months: 108 },
  cns:            { p1_p2: 0.517, p2_p3: 0.298, p3_nda: 0.597, nda_appr: 0.903, overall_loa: 0.083, avg_months: 120 },
  metabolic:      { p1_p2: 0.583, p2_p3: 0.412, p3_nda: 0.687, nda_appr: 0.935, overall_loa: 0.154, avg_months:  96 },
  inflammation:   { p1_p2: 0.534, p2_p3: 0.331, p3_nda: 0.631, nda_appr: 0.912, overall_loa: 0.102, avg_months: 114 },
  respiratory:    { p1_p2: 0.571, p2_p3: 0.389, p3_nda: 0.668, nda_appr: 0.928, overall_loa: 0.141, avg_months: 102 },
  gi:             { p1_p2: 0.548, p2_p3: 0.356, p3_nda: 0.644, nda_appr: 0.921, overall_loa: 0.117, avg_months: 110 },
  hematology:     { p1_p2: 0.547, p2_p3: 0.378, p3_nda: 0.663, nda_appr: 0.929, overall_loa: 0.128, avg_months: 106 },
  urology:        { p1_p2: 0.556, p2_p3: 0.351, p3_nda: 0.638, nda_appr: 0.918, overall_loa: 0.115, avg_months: 112 },
};

/**
 * Calculate PTRS and timeline for a given evidence string + therapeutic area.
 * Returns: { ptrs: number (0-1), phase: string, remaining: number (months), ci80: [low, high] }
 */
export function calculatePTRS(evidence, therapeuticArea) {
  const rates = PTRS_BASE_RATES[therapeuticArea] || PTRS_BASE_RATES.inflammation;

  if (evidence.includes("Phase IV") || evidence.includes("approved")) {
    return { ptrs: 0.95, phase: "Approved", remaining: 0, ci80: [0.91, 0.98] };
  }
  if (evidence.includes("Phase III")) {
    const ptrs = rates.p3_nda * rates.nda_appr;
    // 80% CI: ±15% relative uncertainty at Phase III
    return { ptrs, phase: "Phase III", remaining: Math.round(rates.avg_months * 0.3), ci80: [ptrs * 0.85, Math.min(ptrs * 1.15, 0.99)] };
  }
  if (evidence.includes("Phase II")) {
    const ptrs = rates.p2_p3 * rates.p3_nda * rates.nda_appr;
    return { ptrs, phase: "Phase II", remaining: Math.round(rates.avg_months * 0.6), ci80: [ptrs * 0.75, Math.min(ptrs * 1.25, 0.95)] };
  }
  if (evidence.includes("Phase I")) {
    const ptrs = rates.p1_p2 * rates.p2_p3 * rates.p3_nda * rates.nda_appr;
    return { ptrs, phase: "Phase I", remaining: rates.avg_months, ci80: [ptrs * 0.60, Math.min(ptrs * 1.40, 0.80)] };
  }
  return { ptrs: 0.02, phase: "Preclinical", remaining: rates.avg_months + 24, ci80: [0.005, 0.06] };
}

/**
 * Describes evidence tier as a label.
 */
export function evidenceTierLabel(evidence) {
  if (evidence.includes("Phase IV") || evidence.includes("approved")) return "Post-market";
  if (evidence.includes("Phase III")) return "Phase III";
  if (evidence.includes("Phase II")) return "Phase II";
  if (evidence.includes("Phase I")) return "Phase I";
  return "Preclinical";
}
