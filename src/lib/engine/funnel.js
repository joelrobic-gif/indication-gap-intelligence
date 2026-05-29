// ═══ THE OPPORTUNITY FUNNEL ═══
// Turns a scored gap into a per-department narrative, computes the narrowing
// funnel tiers, and synthesizes ranked one-page business cases per molecule.
// All deterministic — runs offline, forever, with zero backend.

import { getCountry } from "../data/countries";
import { evidenceTierLabel } from "../data/ptrs";

// ── What each department "sees" and concludes for a single gap ──
export function runFunnel(gap, homeCountry) {
  const pct = Math.round(gap.ptrs.ptrs * 100);
  const homeName = getCountry(homeCountry).name;
  const nRivals = gap.competitors.length;
  return [
    { dept: "scout",        finding: `Candidate: ${gap.molecule} → ${gap.indication}`,                 value: gap.moleculeClass,             ok: true },
    { dept: "cartographer", finding: `Approved in ${gap.approvedIn.length} markets · open in ${homeName}`, value: gap.scores.regulatory,         ok: gap.approvedIn.length > 0 },
    { dept: "clinician",    finding: `${evidenceTierLabel(gap.evidence)} · PTRS ${pct}% (±CI)`,         value: gap.scores.evidence,           ok: gap.scores.evidence >= 60 },
    { dept: "recon",        finding: nRivals === 0 ? "Whitespace — no direct rival tracked" : `${nRivals} rival program${nRivals > 1 ? "s" : ""} tracked`, value: gap.competitiveScore, ok: gap.competitiveScore >= 55 },
    { dept: "economist",    finding: `${gap.patientPop !== "N/A" ? gap.patientPop + " patients" : "population unsized"} · unmet ${gap.scores.unmet}`, value: gap.scores.commercial, ok: gap.scores.unmet >= 60 || gap.scores.commercial >= 70 },
    { dept: "risk",         finding: `Composite ${gap.scores.composite}/99 · ${gap.viabilityLabel}`,    value: gap.scores.composite,          ok: gap.scores.composite >= 60 },
    { dept: "strategist",   finding: recommendedAction(gap),                                            value: gap.scores.composite,          ok: true },
  ];
}

export function recommendedAction(gap) {
  const c = gap.scores.composite;
  const white = gap.competitors.length === 0;
  if (c >= 75) return white ? "Fast-track — commission dossier, claim the whitespace" : "Fast-track — commission regulatory dossier";
  if (c >= 60) return "Advance — scope a bridging study & regulatory pathway";
  if (c >= 45) return "Monitor — track competitor moves & evidence maturation";
  return "Park — revisit if evidence strengthens";
}

const HIGH_VALUE = (g) => g.scores.unmet >= 60 || g.scores.commercial >= 70;

// ── Funnel tiers: the same opportunity set, narrowing stage by stage ──
export function funnelTiers(universe) {
  const { gaps, candidateCount } = universe;
  const live = gaps;
  const evidence = live.filter(g => g.scores.evidence >= 60);          // Phase II+
  const runway   = evidence.filter(g => g.competitiveScore >= 55);     // few/no rivals
  const highValue = runway.filter(HIGH_VALUE);
  const cases = bestPerMolecule(highValue);
  return [
    { id: "universe",  label: "Universe scanned",     count: candidateCount, desc: "Every drug × disease pair examined", dept: "scout",        color: "var(--entity-1)" },
    { id: "gaps",      label: "Live regulatory gaps", count: live.length,    desc: "Approved abroad, open at home",      dept: "cartographer", color: "var(--entity-3)" },
    { id: "evidence",  label: "Evidence-backed",      count: evidence.length,desc: "Phase II or stronger proof",         dept: "clinician",    color: "var(--entity-5)" },
    { id: "runway",    label: "Clear runway",         count: runway.length,  desc: "Whitespace or few rivals",           dept: "recon",        color: "var(--entity-2)" },
    { id: "value",     label: "High-value",           count: highValue.length,desc: "Large market or high unmet need",   dept: "economist",    color: "var(--entity-4)" },
    { id: "cases",     label: "Priority business cases", count: cases.length, desc: "Ranked, one-per-molecule",          dept: "strategist",   color: "var(--brand-gold)" },
  ];
}

function bestPerMolecule(gaps) {
  const best = new Map();
  for (const g of gaps) {
    const cur = best.get(g.moleculeKey);
    if (!cur || g.scores.composite > cur.scores.composite) best.set(g.moleculeKey, g);
  }
  return [...best.values()];
}

// ── Business cases: aggregate every gap into one ranked case per molecule ──
export function buildBusinessCases(universe, homeCountry, humanActions = {}) {
  const { gaps } = universe;
  const byMol = new Map();
  for (const g of gaps) {
    if (!byMol.has(g.moleculeKey)) byMol.set(g.moleculeKey, []);
    byMol.get(g.moleculeKey).push(g);
  }

  const cases = [];
  for (const [moleculeKey, list] of byMol) {
    list.sort((a, b) => b.scores.composite - a.scores.composite);
    const headline = list[0];
    const supporting = list.slice(1, 6);
    const whitespace = list.filter(g => g.competitors.length === 0).length;
    const marketsOpen = Math.max(...list.map(g => g.approvedIn.length));
    const human = humanActions[moleculeKey] || {};
    cases.push({
      key: moleculeKey,
      molecule: headline.molecule,
      moleculeClass: headline.moleculeClass,
      atc: headline.atc,
      ta: headline.ta,
      companyId: headline.companyId,
      companyName: headline.companyName,
      headline,
      supporting,
      gapCount: list.length,
      bestComposite: headline.scores.composite,
      avgComposite: Math.round(list.reduce((s, g) => s + g.scores.composite, 0) / list.length),
      whitespace,
      marketsOpen,
      priority: HIGH_VALUE(headline) && headline.scores.evidence >= 60 && headline.competitiveScore >= 55,
      action: recommendedAction(headline),
      narrative: narrative(headline, homeCountry),
      status: human.status || null,     // 'approved' | 'flagged' | 'reviewing' | null
      note: human.note || "",
      pinned: !!human.pinnedAt,
    });
  }

  // Rank: pinned first, then composite desc.
  cases.sort((a, b) => (b.pinned - a.pinned) || (b.bestComposite - a.bestComposite));
  cases.forEach((c, i) => { c.rank = i + 1; });
  return cases;
}

function narrative(gap, homeCountry) {
  const homeName = getCountry(homeCountry).name;
  const n = gap.approvedIn.length;
  const top = gap.approvedIn.slice(0, 4).map(c => getCountry(c).code).join(", ");
  const pct = Math.round(gap.ptrs.ptrs * 100);
  const evid = evidenceTierLabel(gap.evidence);
  const comp = gap.competitors.length === 0
    ? "No direct competitor program is currently tracked for this indication — open whitespace."
    : `${gap.competitors.length} competitor program${gap.competitors.length > 1 ? "s are" : " is"} tracked (lead: ${gap.competitors[0].company} ${gap.competitors[0].molecule}).`;
  const commercial = gap.patientPop !== "N/A"
    ? `The addressable population is roughly ${gap.patientPop}.`
    : "The addressable population is not yet sized.";
  return `${gap.molecule} (${gap.moleculeClass}) is already approved for ${gap.indication} in ${n} market${n !== 1 ? "s" : ""}${top ? ` — ${top}${n > 4 ? "…" : ""}` : ""}, but not in ${homeName}. Evidence stands at ${evid}, giving a modelled ${pct}% probability of regulatory success. ${comp} ${commercial} On the 7-factor model this scores ${gap.scores.composite}/99 — ${gap.viabilityLabel} viability.`;
}
