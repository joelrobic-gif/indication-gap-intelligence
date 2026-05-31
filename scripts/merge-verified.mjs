// ═══ PHASE 1 — VERIFIED-SLICE MERGE ═══
// Augments INDICATION_POOLS with REAL, citation-backed indication rows for the
// molecules sourced + adversarially verified by the cardio research swarm.
// Verified rows carry provenance (source, sourceUrl, nctId, asOf, confidence);
// every other row stays illustrative (no provenance) — the global default.
//
//   node scripts/merge-verified.mjs <verified-slice-output.json>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, "..", "src", "lib", "data");
const VALID = new Set(["US","CA","BR","MX","EU","UK","DE","FR","IT","ES","CH","RU","JP","CN","KR","AU","IN","IL","SA","TR"]);

const outFile = process.argv[2];
if (!outFile) { console.error("usage: node merge-verified.mjs <output.json>"); process.exit(1); }

const SALTS = /\b(hcl|hydrochloride|sodium|potassium|calcium|magnesium|sulfate|sulphate|besylate|mesylate|maleate|citrate|bisulfate|tartrate|succinate|acetate|fumarate|hemifumarate|bromide|chloride|phosphate|nitrate|tromethamine|valerate|propionate|dipropionate|furoate|xinafoate|hyclate|monohydrate|dihydrate|disodium|hydrobromide|axetil)\b/gi;
const canon = (s) => String(s).toLowerCase().replace(/\(.*?\)/g, "").replace(SALTS, "").replace(/[^a-z0-9]+/g, " ").trim();
const normInd = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();

// Reconstruct current pools (keyed by molecule display name) from the live data.
const companies = (await import(pathToFileURL(path.join(DATA, "companies.js")).href)).COMPANIES;
const { generateIndicationData } = await import(pathToFileURL(path.join(DATA, "indications.js")).href);
const POOLS = {};
for (const c of companies) for (const m of c.molecules) if (!POOLS[m.name]) POOLS[m.name] = structuredClone(generateIndicationData(m));

// canon -> existing display key
const canonToKey = {};
for (const name of Object.keys(POOLS)) { const k = canon(name); if (!(k in canonToKey)) canonToKey[k] = name; }

const raw = JSON.parse(fs.readFileSync(outFile, "utf8"));
const R = raw.result || raw;

let matched = 0, added = 0, verifiedRows = 0, newMols = 0;
for (const slice of R.slices || []) {
  for (const mol of slice.data?.molecules || []) {
    const k = canon(mol.name);
    let key = canonToKey[k];
    if (!key) { key = mol.name; POOLS[key] = []; canonToKey[k] = key; newMols++; } else matched++;
    const pool = POOLS[key];
    const byNorm = new Map(pool.map((r, i) => [normInd(r.indication), i]));
    for (const ind of mol.indications || []) {
      const countries = (ind.countries || []).filter(c => VALID.has(c));
      const row = {
        indication: ind.indication, countries,
        evidence: ind.evidence || "Phase IV", patients: ind.patients || "N/A",
        source: ind.source || "", sourceUrl: ind.sourceUrl || "",
        nctId: ind.nctId || "", asOf: ind.asOf || "",
        confidence: ind.confidence === "verified" ? "verified" : "unverified",
      };
      if (row.confidence === "verified") verifiedRows++;
      const ni = normInd(ind.indication);
      if (byNorm.has(ni)) pool[byNorm.get(ni)] = row;           // cited row supersedes illustrative
      else { pool.push(row); byNorm.set(ni, pool.length - 1); added++; }
    }
  }
}

// Serialize indications.js (preserve API).
const J = (x) => JSON.stringify(x, null, 2);
fs.copyFileSync(path.join(DATA, "indications.js"), path.join(DATA, "indications.js.bak"));
fs.writeFileSync(path.join(DATA, "indications.js"),
`// ═══ INDICATION DATA POOLS (illustrative + a real, citation-backed verified slice) ═══
// Most rows are model-generated (illustrative). Rows with confidence:'verified'
// carry real provenance (source, sourceUrl, nctId, asOf) sourced + adversarially
// verified by the research pipeline. Regenerate verified slice:
//   node scripts/merge-verified.mjs <output.json>
const INDICATION_POOLS = ${J(POOLS)};

const FALLBACK = (molecule) => [
  { indication: molecule.originalIndication, countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
];

export function generateIndicationData(molecule) {
  return INDICATION_POOLS[molecule.name] || FALLBACK(molecule);
}

// Count of indication rows backed by real, cited provenance (confidence:'verified').
export const VERIFIED_ROW_COUNT = ${verifiedRows};
`);

console.log("── VERIFIED MERGE ──");
console.log(`  matched existing molecules: ${matched} | new: ${newMols}`);
console.log(`  cited rows added: ${added} | verified rows total: ${verifiedRows}`);
console.log(`  pools: ${Object.keys(POOLS).length}`);
