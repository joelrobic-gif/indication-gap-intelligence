// ═══ OUTCOME-FEEDBACK LOOP (the moat) ═══
// Humans record what actually happened to a flagged opportunity (filed,
// approved, rejected, parked). Those realized outcomes are aggregated by therapy
// area and fed back to produce a "house-adjusted PTRS" — a Bayesian shrinkage
// blend of the model's prior and the desk's observed approval rate. The more
// outcomes recorded, the more the platform's probabilities reflect THIS desk's
// real-world hit rate — proprietary signal a fresh clone cannot reproduce.

export const OUTCOMES = [
  { id: "filed",    label: "Filed",    color: "var(--viability-strong)" },
  { id: "approved", label: "Approved", color: "var(--viability-excellent)" },
  { id: "rejected", label: "Rejected", color: "var(--viability-low)" },
  { id: "parked",   label: "Parked",   color: "var(--text-tertiary)" },
];
export const OUTCOME_IDS = new Set(OUTCOMES.map(o => o.id));

const PRIOR_WEIGHT = 5; // pseudo-count: how many "model" samples the prior is worth

// Aggregate recorded outcomes by therapy area.
// cases: [{ key, ta }]; humanActions: { [key]: { outcome } }
export function buildOutcomeStats(cases, humanActions) {
  const byTA = {};
  let total = 0, approved = 0, decided = 0;
  for (const c of cases) {
    const o = humanActions?.[c.key]?.outcome;
    if (!o) continue;
    total++;
    const t = (byTA[c.ta] ||= { ta: c.ta, filed: 0, approved: 0, rejected: 0, parked: 0, decided: 0 });
    if (o in t) t[o]++;
    if (o === "approved" || o === "rejected") { t.decided++; decided++; if (o === "approved") approved++; }
  }
  for (const t of Object.values(byTA)) {
    t.observedApprovalRate = t.decided > 0 ? t.approved / t.decided : null;
  }
  return { byTA, total, decided, observedApprovalRate: decided > 0 ? approved / decided : null };
}

// Shrinkage blend of model PTRS (prior) and the desk's observed rate for this TA.
// Returns { value, n, observed } or null when there's no decided outcome for the TA.
export function houseAdjustedPTRS(modelPtrs, ta, outcomeStats) {
  const t = outcomeStats?.byTA?.[ta];
  if (!t || t.decided <= 0 || t.observedApprovalRate == null) return null;
  const n = t.decided;
  const value = (modelPtrs * PRIOR_WEIGHT + t.observedApprovalRate * n) / (PRIOR_WEIGHT + n);
  return { value, n, observed: t.observedApprovalRate };
}
