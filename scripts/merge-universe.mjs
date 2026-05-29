// One-shot build script: merge the swarm-generated drug universe into the
// curated static data files. Additive — existing data is preserved, new
// molecules/indications are unioned in. Run with: node scripts/merge-universe.mjs <outputFile>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "src", "lib", "data");

const VALID_COUNTRIES = new Set(["US","CA","BR","MX","EU","UK","DE","FR","IT","ES","CH","RU","JP","CN","KR","AU","IN","IL","SA","TR"]);
const VALID_TA = new Set(["oncology","cardiovascular","cns","metabolic","inflammation","respiratory","gi","hematology","urology"]);

const outFile = process.argv[2];
if (!outFile) { console.error("usage: node merge-universe.mjs <workflow-output-file>"); process.exit(1); }

// ── Load existing curated data via public exports ──
const companiesMod = await import(pathToFileURL(path.join(DATA, "companies.js")).href);
const indicationsMod = await import(pathToFileURL(path.join(DATA, "indications.js")).href);
const pipelineMod = await import(pathToFileURL(path.join(DATA, "pipeline.js")).href);

const existingCompanies = companiesMod.COMPANIES;
const competitive = structuredClone(pipelineMod.COMPETITIVE_PIPELINE);
const unmet = structuredClone(pipelineMod.UNMET_NEED);

// company id -> { meta:{id,name,hq}, molecules: Map<name, molObj> }
const companies = new Map();
function ensureCompany(id, name, hq) {
  if (!companies.has(id)) companies.set(id, { meta: { id, name: name || id, hq: hq || "" }, molecules: new Map(), order: companies.size });
  const c = companies.get(id);
  if (name && (!c.meta.name || c.meta.name === id)) c.meta.name = name;
  if (hq && !c.meta.hq) c.meta.hq = hq;
  return c;
}

// global indication pools keyed by molecule name (shared across companies, matches existing design)
const pools = new Map();
function normInd(s) { return String(s).toLowerCase().replace(/\s+/g, " ").trim(); }
function addIndication(molName, ind) {
  if (!pools.has(molName)) pools.set(molName, new Map());
  const m = pools.get(molName);
  const countries = (ind.countries || []).filter(c => VALID_COUNTRIES.has(c));
  const clean = { indication: ind.indication, countries, evidence: ind.evidence || "Phase II", patients: ind.patients || "N/A" };
  const key = normInd(ind.indication);
  const prev = m.get(key);
  // prefer the richer entry (more approval countries)
  if (!prev || countries.length > prev.countries.length) m.set(key, clean);
}

// ── Seed from existing curated data ──
for (const c of existingCompanies) {
  const cc = ensureCompany(c.id, c.name, c.hq);
  for (const mol of c.molecules) {
    if (!cc.molecules.has(mol.name)) cc.molecules.set(mol.name, { ...mol });
    for (const ind of indicationsMod.generateIndicationData(mol)) addIndication(mol.name, ind);
  }
}

// ── Merge swarm output ──
const raw = JSON.parse(fs.readFileSync(outFile, "utf8"));
const R = raw.result || raw;

function ingestBundle(companyId, bundle) {
  const c = companies.get(companyId) || ensureCompany(companyId);
  for (const mol of bundle.molecules || []) {
    const ta = VALID_TA.has(mol.ta) ? mol.ta : "inflammation";
    if (!c.molecules.has(mol.name)) {
      c.molecules.set(mol.name, {
        name: mol.name, class: mol.class || "—",
        originalIndication: mol.originalIndication || (mol.indications?.[0]?.indication ?? "—"),
        atc: mol.atc || "—", ta,
      });
    }
    for (const ind of mol.indications || []) addIndication(mol.name, ind);
  }
  // merge competitive + unmet maps (don't clobber existing)
  for (const [ind, rivals] of Object.entries(bundle.competitive || {})) {
    if (!competitive[ind] && Array.isArray(rivals) && rivals.length) competitive[ind] = rivals;
  }
  for (const [ind, info] of Object.entries(bundle.unmet || {})) {
    if (!unmet[ind] && info && typeof info.score === "number") unmet[ind] = info;
  }
}

for (const bundle of R.pharmascience || []) ingestBundle("pharmascience", bundle);
for (const o of R.others || []) ingestBundle(o.companyId, o.data || o);

// ── Serialize ──
const COMPANIES_OUT = [...companies.values()]
  .sort((a, b) => (a.meta.id === "pharmascience" ? -1 : b.meta.id === "pharmascience" ? 1 : a.order - b.order))
  .map(c => ({ id: c.meta.id, name: c.meta.name, hq: c.meta.hq, molecules: [...c.molecules.values()] }));

const POOLS_OUT = {};
for (const [name, m] of pools) POOLS_OUT[name] = [...m.values()];

const J = (x) => JSON.stringify(x, null, 2);

fs.copyFileSync(path.join(DATA, "companies.js"), path.join(DATA, "companies.js.bak"));
fs.copyFileSync(path.join(DATA, "indications.js"), path.join(DATA, "indications.js.bak"));
fs.copyFileSync(path.join(DATA, "pipeline.js"), path.join(DATA, "pipeline.js.bak"));

fs.writeFileSync(path.join(DATA, "companies.js"),
`// ═══ COMPANY PORTFOLIO DATA (generated + merged) ═══
// Pharmascience leads. Expanded by the autonomous Discovery swarm + curated seed.
// Regenerate: node scripts/merge-universe.mjs <workflow-output>
export const COMPANIES = ${J(COMPANIES_OUT)};

export const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map(c => [c.id, c]));
`);

fs.writeFileSync(path.join(DATA, "indications.js"),
`// ═══ INDICATION DATA POOLS (generated + merged) ═══
// Per-molecule indication lists with approval-country coverage.
// Country codes restricted to the canonical 20-market set.
const INDICATION_POOLS = ${J(POOLS_OUT)};

const FALLBACK = (molecule) => [
  { indication: molecule.originalIndication, countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
];

export function generateIndicationData(molecule) {
  return INDICATION_POOLS[molecule.name] || FALLBACK(molecule);
}
`);

fs.writeFileSync(path.join(DATA, "pipeline.js"),
`// ═══ COMPETITIVE PIPELINE + UNMET NEED (generated + merged) ═══
export const COMPETITIVE_PIPELINE = ${J(competitive)};

export const UNMET_NEED = ${J(unmet)};
`);

// ── Report ──
const totalMol = COMPANIES_OUT.reduce((s, c) => s + c.molecules.length, 0);
const totalInd = Object.values(POOLS_OUT).reduce((s, a) => s + a.length, 0);
console.log("── MERGE COMPLETE ──");
COMPANIES_OUT.forEach(c => console.log(`  ${c.name.padEnd(28)} ${c.molecules.length} molecules`));
console.log(`  TOTAL: ${totalMol} molecules across ${COMPANIES_OUT.length} companies`);
console.log(`  ${totalInd} indication rows in ${Object.keys(POOLS_OUT).length} pools`);
console.log(`  competitive: ${Object.keys(competitive).length} indications | unmet: ${Object.keys(unmet).length} indications`);
