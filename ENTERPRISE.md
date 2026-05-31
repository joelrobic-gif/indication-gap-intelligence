# ExpandRx — Enterprise Envelope & the Moat

Phase 4 of the acquisition roadmap. Two tracks: the **compounding moat** (built, working
today on local state) and the **enterprise plumbing** (scaffolded + specified; gated on
Phase 3 traction because it needs a hosted database + deploy).

---

## A. Outcome-feedback moat — BUILT (working)

The one durable, network-effect-style asset. A clone starting from the same public baseline
cannot reproduce *your desk's realized outcomes*.

- **Capture:** every business case can be marked **Filed / Approved / Rejected / Parked**
  (report toolbar). Stored with the rest of the engine state.
- **Feedback:** `src/lib/engine/outcomes.js` aggregates outcomes by therapy area and computes
  a **house-adjusted PTRS** — a Bayesian shrinkage blend of the model prior and the desk's
  observed approval rate (`(prior·k + observed·n)/(k+n)`, k=5).
- **Surfaced:** when ≥1 decided outcome exists for a TA, the case report shows a
  **★ HOUSE-ADJUSTED PTRS** panel (model vs blended, with n + observed rate). The more
  outcomes recorded, the more the platform reflects real-world performance.
- **Today's limitation:** outcomes persist in `localStorage` (single browser). Track B moves
  them to attributed, server-side rows so the loop compounds across a whole organisation.

## B. Enterprise plumbing — SPECIFIED (gated on a DB host + deploy)

Not yet built: it requires infrastructure a buyer/pilot provisions, and over-investing before
a signed pilot (Phase 3) is the wrong order. The path:

1. **Auth + SSO** — OIDC/SAML (e.g. WorkOS/Auth.js). Route guards on every app surface.
2. **Tenancy** — Postgres model: `org → users → roles (viewer / analyst / admin)`. Railway/
   Neon Postgres + Prisma. Migrate engine state + human actions (status/note/pin/outcome) off
   `localStorage` to attributed rows keyed by `(orgId, caseKey)`.
3. **Audit log** — immutable, attributed record of every decision and report generation
   (who/what/when), exportable; surfaced as a per-case activity timeline. A direct GxP/QA
   procurement checkbox.
4. **Exports & integrations** — server-rendered PDF (vs browser print), CSV/JSON of the board
   (**CSV/JSON shipped client-side today** — see the Opportunities toolbar), plus one push
   integration (Veeva / SharePoint / Slack) or a read API.
5. **Org onboarding** — portfolio import of the buyer's own molecule list; guided empty states;
   explicit sample-vs-live mode toggle.
6. **AI-proxy hardening** — per-tenant / BYO keys, durable (Redis/Upstash) rate-limiting +
   usage metering, request logging, CSP/HSTS.

## Sequencing (why this order)

Per `ACQUISITION.md`: provenance (Phase 1) → defensibility (Phase 2) → a paid pilot (Phase 3)
→ THEN this enterprise build (Phase 4). The moat (Track A) is built now because it's the
differentiator and needs no infra; the envelope (Track B) is deferred until a customer signal
justifies the spend. Building Track B before a pilot would be the classic over-invest mistake.

---

*Status: Track A live (local). Track B specified, not deployed — needs a hosted DB and a
deploy target, and should follow a signed pilot.*
