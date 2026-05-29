// ═══ GLOBAL DRUG UNIVERSE ═══
// Flattens the entire company portfolio into one scannable stream of
// (molecule × indication) candidates. Pharmascience is scanned FIRST, then
// every other company. This is what the autonomous swarm walks through,
// over and over, forever.

import { COMPANIES, COMPANY_BY_ID } from "./companies";
import { generateIndicationData } from "./indications";
import { scoreGap } from "../scoring";

// Pharmascience always leads the scan order.
export const SCAN_ORDER = (() => {
  const ps = COMPANIES.filter(c => c.id === "pharmascience");
  const rest = COMPANIES.filter(c => c.id !== "pharmascience");
  return [...ps, ...rest];
})();

/**
 * Walk the entire universe for a given home market.
 * Returns scored gaps (approved abroad, open at home) with company attribution,
 * plus raw candidate accounting for the funnel's top-of-pipe count.
 */
export function computeUniverse(homeCountry) {
  const gaps = [];
  let candidateCount = 0;       // every molecule × indication examined
  let approvedAtHome = 0;       // already approved here → no gap
  let frontier = 0;             // no approval anywhere → pure frontier/whitespace

  SCAN_ORDER.forEach((company, companyIdx) => {
    company.molecules.forEach(mol => {
      generateIndicationData(mol).forEach(ind => {
        candidateCount++;
        const approvedCount = ind.countries.length;
        if (ind.countries.includes(homeCountry)) { approvedAtHome++; return; }
        if (approvedCount === 0) { frontier++; return; }

        const gap = scoreGap(ind, homeCountry, mol);
        if (!gap) return;
        gaps.push({
          ...gap,
          companyId: company.id,
          companyName: company.name,
          companyIdx,
          moleculeKey: `${company.id}::${gap.molecule}`,
        });
      });
    });
  });

  // Scan order: company order first (Pharmascience leads), then composite desc.
  gaps.sort((a, b) => a.companyIdx - b.companyIdx || b.scores.composite - a.scores.composite);

  return {
    gaps,
    candidateCount,
    approvedAtHome,
    frontier,
    moleculeCount: SCAN_ORDER.reduce((s, c) => s + c.molecules.length, 0),
    companyCount: SCAN_ORDER.length,
  };
}

export function companyName(id) {
  return COMPANY_BY_ID[id]?.name || id;
}
