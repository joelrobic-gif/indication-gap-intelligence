# ExpandRx

AI-powered pharmaceutical **indication-expansion intelligence**. An always-on swarm of
7 specialist "departments" scans a 1,700-molecule × 40-company universe, finds drugs
approved abroad but missing at home, and produces ranked, print-ready business cases
with risk-adjusted NPV (rNPV) valuation.

> **New here (human or AI session)? Read [`HANDOFF.md`](./HANDOFF.md) first** — it has the
> full state, architecture map, scale, pending items, and run/build/deploy instructions.

## Quick start
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

## Stack
Next.js 16 (App Router, Turbopack) · React 18 · zero-database (static, build-time data) ·
optional Anthropic proxy for AI commentary. Live on Railway.

## Surfaces
- **Funnel** — plain-English "how we find the opportunity" + narrowing funnel
- **Mission Control** — live 7-department assembly line (what each agent reads, finds, hands off)
- **Opportunities** — ranked business-case cards per company×molecule
- **Case report** — ~16-page print/PDF dossier with charts, tables, rNPV + sensitivity

## Regenerate the universe
```bash
node scripts/build-universe.mjs <generation-swarm-output.json>
```

See [`HANDOFF.md`](./HANDOFF.md) for everything else.
