# Indication Gap Intelligence v2.0 -- Design Specification

| Field            | Value                                     |
|------------------|-------------------------------------------|
| **Version**      | 2.0.0                                     |
| **Status**       | Active Development                        |
| **Last Updated** | 2026-04-07                                |
| **Stack**        | Next.js 16, React 18, App Router          |
| **Deployment**   | Railway (standalone service)              |
| **Database**     | None (zero-database architecture)         |
| **AI Backend**   | Anthropic Claude via server-side proxy    |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [System Architecture](#3-system-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Scoring Model](#5-scoring-model)
6. [Feature Specifications](#6-feature-specifications)
   - 6.1 [PTRS Engine](#61-ptrs-engine-probability-of-technical--regulatory-success)
   - 6.2 [Indication Heatmap Matrix](#62-indication-heatmap-matrix)
   - 6.3 [Competitive Pipeline Radar](#63-competitive-pipeline-radar)
   - 6.4 [AI Chat / NLQ Panel](#64-ai-chat--nlq-panel)
   - 6.5 [Watchlist with Persistence](#65-watchlist-with-persistence)
   - 6.6 [Side-by-Side Comparator](#66-side-by-side-comparator)
   - 6.7 [Portfolio Dashboard](#67-portfolio-dashboard)
   - 6.8 [Report Export](#68-report-export)
7. [API Design](#7-api-design)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Security Model](#9-security-model)
10. [Performance Considerations](#10-performance-considerations)
11. [Competitive Landscape & Benchmarks](#11-competitive-landscape--benchmarks)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

Indication Gap Intelligence is a standalone Next.js web application that provides pharmaceutical companies with an AI-powered platform for identifying drug indication expansion opportunities. The system cross-references global regulatory approvals across 12 jurisdictions and scores each gap using a 7-factor composite model enhanced by AI analysis.

The platform covers 6 generic/specialty pharmaceutical companies, 42 molecules, and 12 regulatory jurisdictions. It is modeled on capabilities found in enterprise platforms from IQVIA, Clarivate (Cortellis), BioMedTracker, Citeline, Evaluate Pharma, and GlobalData, but delivered as a focused, lightweight, zero-infrastructure application.

### Design Principles

- **Zero database** -- All computation is client-side with static data embedded at build time. No external data stores, no user accounts, no persistent server state.
- **Graceful degradation** -- AI features fall back to deterministic responses when the Anthropic API is unavailable.
- **Isolated deployment** -- Runs as its own Railway service. Does not share ports, processes, or deployment pipelines with any existing application.
- **Pharma-grade data modeling** -- PTRS base rates sourced from BIO/QLS Advisors 2024 clinical success rate data. Competitive pipeline data reflects real-world assets.

---

## 2. Problem Statement

Generic and specialty pharmaceutical companies must continuously evaluate their existing molecule portfolios for indication expansion potential. This evaluation requires simultaneous consideration of:

- **Regulatory geography**: Where is a molecule approved, and where are the gaps?
- **Clinical evidence maturity**: What phase of development exists for a new indication?
- **Probability of success**: What are the base rates for a given therapeutic area and phase?
- **Competitive landscape**: Who else is pursuing the same indication, and at what stage?
- **Unmet medical need**: How well does the current standard of care address the condition?
- **Commercial viability**: Is the patient population large enough to justify development?

These data points are scattered across IQVIA, Citeline, ClinicalTrials.gov, FDA/EMA/PMDA databases, and proprietary analyst reports. Indication Gap Intelligence unifies them into a single analytical surface.

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
+--------------------------------------------------------------------+
|                        BROWSER (Client)                            |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |           IndicationGapIntelligence.jsx (SPA)                |  |
|  |                                                              |  |
|  |  +----------+  +----------+  +----------+  +----------+     |  |
|  |  |  PTRS    |  | Heatmap  |  | Pipeline |  | AI Chat  |     |  |
|  |  |  Engine  |  | Matrix   |  | Radar    |  | / NLQ    |     |  |
|  |  +----------+  +----------+  +----------+  +----------+     |  |
|  |  +----------+  +----------+  +----------+  +----------+     |  |
|  |  | Watchlist|  |Comparator|  |Portfolio |  | Export   |     |  |
|  |  | (local)  |  | (4-up)   |  |Dashboard |  | Engine   |     |  |
|  |  +----------+  +----------+  +----------+  +----------+     |  |
|  |                                                              |  |
|  |  +------------------------------------------------------+   |  |
|  |  |           Static Data Layer (embedded)                |   |  |
|  |  | COMPANIES[] | COUNTRIES[] | PTRS_BASE_RATES{}         |   |  |
|  |  | COMPETITIVE_PIPELINE{} | UNMET_NEED{} | Indications   |   |  |
|  |  +------------------------------------------------------+   |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
+--------------------------------------------------------------------+
         |                              |
         | POST /api/chat               | POST /api/analyze
         |                              |
+--------------------------------------------------------------------+
|                    NEXT.JS SERVER (App Router)                      |
|                                                                    |
|  +------------------------------+  +----------------------------+  |
|  | /api/chat/route.js           |  | /api/analyze/route.js      |  |
|  | - NLQ conversation           |  | - Gap deep analysis        |  |
|  | - Context injection          |  | - Molecule-indication pair |  |
|  | - Streaming responses        |  | - Structured AI output     |  |
|  +------------------------------+  +----------------------------+  |
|                |                              |                    |
+--------------------------------------------------------------------+
                 |                              |
                 v                              v
+--------------------------------------------------------------------+
|              ANTHROPIC API (External)                               |
|              claude-sonnet-4-20250514                                  |
|              - System prompt with pharma context                   |
|              - Temperature: 0.3 (factual)                          |
|              - Max tokens: 2048                                    |
+--------------------------------------------------------------------+
```

### 3.2 Component Architecture

```
src/
  app/
    layout.js              Root layout, metadata, global styles
    page.js                Entry point, renders <IndicationGapIntelligence />
    globals.css            Dark theme, utility classes
    api/
      chat/
        route.js           POST handler -- NLQ conversations via Anthropic
      analyze/
        route.js           POST handler -- structured gap analysis via Anthropic
  components/
    IndicationGapIntelligence.jsx   Monolithic client component (~2500 lines)
                                    Contains all 8 features, data, and UI
```

### 3.3 Technology Choices

| Layer          | Technology          | Rationale                                   |
|----------------|---------------------|---------------------------------------------|
| Framework      | Next.js 16          | App Router, API routes, SSR-ready            |
| UI             | React 18            | Hooks-based, client-side state management    |
| Styling        | Inline styles       | Zero CSS-in-JS overhead, no build tooling    |
| AI             | Anthropic Claude    | Server-proxied, no client key exposure       |
| State          | React useState      | No Redux/Zustand; state is view-local        |
| Persistence    | localStorage        | Watchlist only; no server persistence needed |
| Visualization  | SVG (hand-rolled)   | PTRS ring gauges, no charting library dep    |
| Deployment     | Railway             | Git-push deploy, healthcheck, auto-restart   |

### 3.4 Data Flow

```
User Interaction
       |
       v
[Filter/Sort/Select]
       |
       v
[generateIndicationData(molecule)] --> Static indication pool for molecule
       |
       v
[scoreGap(indication, country, molecule)] --> 7-factor composite
       |
       +---> evidenceScore   (phase of development)
       +---> breadthScore    (number of countries approved)
       +---> regulatoryEase  (cross-jurisdiction signal)
       +---> commercialScore (patient population proxy)
       +---> ptrsScore       (calculatePTRS via BIO/QLS rates)
       +---> unmetNeedScore  (UNMET_NEED lookup)
       +---> competitiveScore(COMPETITIVE_PIPELINE density)
       |
       v
[Composite Score] --> Ranked gap list --> UI rendering
```

---

## 4. Data Architecture

### 4.1 Jurisdiction Coverage

All regulatory gap analysis covers these 12 authorities:

| Code | Country        | Authority     |
|------|----------------|---------------|
| CA   | Canada         | Health Canada |
| US   | United States  | FDA           |
| EU   | European Union | EMA           |
| UK   | United Kingdom | MHRA          |
| JP   | Japan          | PMDA          |
| AU   | Australia      | TGA           |
| KR   | South Korea    | MFDS          |
| CN   | China          | NMPA          |
| IN   | India          | CDSCO         |
| BR   | Brazil         | ANVISA        |
| CH   | Switzerland    | Swissmedic    |
| IL   | Israel         | MOH           |

### 4.2 Company & Molecule Coverage

| Company                | HQ                  | Molecule Count | Key Therapeutic Areas                    |
|------------------------|----------------------|----------------|------------------------------------------|
| Pharmascience          | Montreal, Canada     | 12             | Metabolic, CV, CNS, GI, Inflammation     |
| Apotex                 | Toronto, Canada      | 8              | CV, CNS, GI                              |
| Teva Pharmaceutical    | Tel Aviv, Israel     | 6              | CNS, Inflammation, Hematology            |
| Sandoz (Novartis)      | Basel, Switzerland   | 6              | Inflammation, Oncology                   |
| Sun Pharma             | Mumbai, India        | 5              | Oncology                                 |
| Viatris (Mylan)        | Canonsburg, USA      | 5              | Metabolic, Hematology                    |
| **Total**              |                      | **42**         | **9 therapeutic areas**                  |

### 4.3 PTRS Base Rates (BIO/QLS Advisors 2024)

Phase transition probabilities used for Probability of Technical & Regulatory Success calculations:

| Therapeutic Area | P1->P2 | P2->P3 | P3->NDA | NDA->Appr | Overall LOA | Avg Months |
|------------------|--------|--------|---------|-----------|-------------|------------|
| Oncology         | 32.9%  | 28.9%  | 57.6%   | 90.6%     | 5.3%        | 132        |
| Cardiovascular   | 56.1%  | 36.2%  | 65.1%   | 91.9%     | 12.1%       | 108        |
| CNS              | 51.7%  | 29.8%  | 59.7%   | 90.3%     | 8.3%        | 120        |
| Metabolic        | 58.3%  | 41.2%  | 68.7%   | 93.5%     | 15.4%       | 96         |
| Inflammation     | 53.4%  | 33.1%  | 63.1%   | 91.2%     | 10.2%       | 114        |
| Respiratory      | 57.1%  | 38.9%  | 66.8%   | 92.8%     | 14.1%       | 102        |
| GI               | 54.8%  | 35.6%  | 64.4%   | 92.1%     | 11.7%       | 110        |
| Hematology       | 54.7%  | 37.8%  | 66.3%   | 92.9%     | 12.8%       | 106        |
| Urology          | 55.6%  | 35.1%  | 63.8%   | 91.8%     | 11.5%       | 112        |

### 4.4 Competitive Pipeline Data

The `COMPETITIVE_PIPELINE` object contains competitor intelligence for 15+ indications:

- Polycystic Ovary Syndrome (PCOS)
- Colorectal Cancer Adjuvant
- Cardiovascular Event Prevention
- Heart Failure (HFrEF)
- Chronic Kidney Disease
- Migraine Prevention
- Alcohol Use Disorder
- Binge Eating Disorder
- Multiple Myeloma
- CML
- NASH / MASLD
- Pericarditis
- Familial Adenomatous Polyposis
- Restless Legs Syndrome

Each entry contains: company name, molecule, clinical phase, and mechanism of action.

### 4.5 Unmet Need Scores

Curated scores (0-100 scale) for 10 key indications, modeled on GlobalData/IQVIA unmet need frameworks:

| Indication                        | Score | Current Standard of Care              |
|-----------------------------------|-------|---------------------------------------|
| Anti-Aging / Longevity (TAME)     | 95    | None approved                         |
| Alcohol Use Disorder              | 88    | Naltrexone + counseling               |
| NASH / MASLD                      | 85    | Resmetirom (newly approved)           |
| PCOS                              | 82    | Metformin (off-label) + OCP           |
| Pericarditis                      | 79    | NSAIDs + colchicine                   |
| Binge Eating Disorder             | 76    | Lisdexamfetamine                      |
| Chronic Kidney Disease            | 72    | SGLT2i + RASi                         |
| Colorectal Cancer Adjuvant        | 71    | FOLFOX/CAPOX                          |
| CV Event Prevention               | 68    | Statins + ASA                         |
| Heart Failure (HFrEF)             | 65    | GDMT (ARNi+BB+MRA+SGLT2i)            |

---

## 5. Scoring Model

### 5.1 Composite Score Formula

Each identified gap receives a composite score from 0-100 based on 7 weighted factors:

```
Composite = Evidence       x 0.20
           + Breadth       x 0.15
           + Regulatory    x 0.15
           + Commercial    x 0.15
           + PTRS          x 0.15
           + Unmet Need    x 0.10
           + Competitive   x 0.10
```

### 5.2 Factor Definitions

**Evidence Score (20%)**
Reflects maturity of clinical evidence for the new indication.

| Phase             | Score |
|-------------------|-------|
| Phase IV/Approved | 0 (no gap exists) |
| Phase III         | 85    |
| Phase II          | 60    |
| Phase I           | 30    |

**Breadth Score (15%)**
Number of jurisdictions where the indication is already approved, capped at 95.

```
breadthScore = min(approvedCount x 12, 95)
```

**Regulatory Ease (15%)**
Cross-jurisdictional signal: more approvals elsewhere implies a clearer regulatory path.

| Approved Count | Score |
|----------------|-------|
| >= 4           | 90    |
| >= 2           | 70    |
| < 2            | 50    |

**Commercial Score (15%)**
Binary proxy based on whether a patient population estimate is available.

| Patient Population Data | Score |
|-------------------------|-------|
| Available               | 75    |
| Not available           | 50    |

**PTRS Score (15%)**
Calculated from BIO/QLS base rates using phase chain multiplication (see Section 6.1). Normalized to 0-100 scale:

```
ptrsScore = ptrs_probability x 100
```

**Unmet Need Score (10%)**
Direct lookup from curated UNMET_NEED table. Defaults to 50 if no specific score exists for the indication.

**Competitive Advantage Score (10%)**
Inversely proportional to competitive density:

| Competitor Count | Score | Interpretation  |
|------------------|-------|-----------------|
| 0                | 95    | Whitespace      |
| 1-2              | 75    | Low competition |
| 3-4              | 55    | Moderate        |
| 5+               | 35    | Crowded         |

### 5.3 Viability Classification

| Composite Range | Label     | Color Code |
|-----------------|-----------|------------|
| >= 75           | Excellent | #34d399    |
| 60-74           | Strong    | #fbbf24    |
| 45-59           | Moderate  | #60a5fa    |
| < 45            | Low       | #ef4444    |

---

## 6. Feature Specifications

### 6.1 PTRS Engine (Probability of Technical & Regulatory Success)

**Modeled on:** BioMedTracker LOA, IQVIA Pipeline Intelligence

**Purpose:** Calculate and display the probability that a specific molecule-indication pair will achieve regulatory approval, based on its current clinical phase and therapeutic area base rates.

**Calculation Logic:**

```
Given: molecule in therapeutic area T, indication at Phase X

Phase I:     PTRS = P1->P2 x P2->P3 x P3->NDA x NDA->Approval
Phase II:    PTRS = P2->P3 x P3->NDA x NDA->Approval
Phase III:   PTRS = P3->NDA x NDA->Approval
Approved:    PTRS = 0.95 (fixed)
Preclinical: PTRS = 0.02 (fixed)
```

**Remaining Time Estimate:**

| Phase       | Remaining Months Formula       |
|-------------|-------------------------------|
| Phase I     | avg_months (full timeline)     |
| Phase II    | avg_months x 0.6              |
| Phase III   | avg_months x 0.3              |
| Approved    | 0                             |
| Preclinical | avg_months + 24               |

**Visualization:** SVG ring gauge rendered inline. The arc fill represents PTRS probability (0.0 to 1.0). Color grades from red (low) through amber to green (high). Center text shows percentage and estimated months-to-approval.

```
     ╭────────────╮
    ╱   ██████░░   ╲        Ring arc filled proportionally
   │    ██████░░    │        to PTRS probability
   │     52.3%      │        Center: percentage + months
   │    ~36 mo      │
    ╲   ░░░░░░░░   ╱
     ╰────────────╯
```

### 6.2 Indication Heatmap Matrix

**Modeled on:** Clarivate Cortellis Drug Indication Matrix, Evaluate Pharma Pipeline Matrix

**Purpose:** Provide a bird's-eye view of all molecules versus all indications, color-coded by composite score with PTRS overlay.

**Layout:**

```
                  Indication A    Indication B    Indication C    ...
Molecule 1      [  ████  75  ]  [  ████  62  ]  [  ░░░░  38  ]
Molecule 2      [  ████  81  ]  [  ---  n/a  ]  [  ████  71  ]
Molecule 3      [  ░░░░  42  ]  [  ████  68  ]  [  ████  79  ]
...
```

**Behavior:**
- Rows: molecules belonging to the selected company
- Columns: all indications that have at least one gap for that company
- Cell color: mapped to viability classification (Excellent/Strong/Moderate/Low)
- Cell text: composite score
- Click action: opens detailed gap drill-down view with full scoring breakdown, PTRS ring, competitor list, and AI analysis trigger

**Filtering:**
- Filter by therapeutic area
- Filter by minimum composite score
- Filter by evidence phase
- Sort by composite, PTRS, or unmet need

### 6.3 Competitive Pipeline Radar

**Modeled on:** Citeline Pipeline Intelligence, GlobalData Pharma Intelligence

**Purpose:** For any given indication, display all known competing molecules in development or on-market, with phase, company, and mechanism of action.

**Data Structure:**

```
COMPETITIVE_PIPELINE = {
  "Indication Name": [
    { company, molecule, phase, mechanism },
    ...
  ]
}
```

**Whitespace Identification:**
When `COMPETITIVE_PIPELINE[indication]` returns an empty array or undefined, the indication is flagged as **WHITESPACE** -- no known competitors are pursuing it. This is surfaced as a high-priority signal (competitive score = 95).

**Integration with Scoring:**
Competitive density feeds directly into the composite score via the Competitive Advantage factor (10% weight). Gaps with fewer competitors score higher, all else being equal.

**Display:**
- Table format within gap detail view
- Columns: Company, Molecule, Phase, Mechanism
- Phase badges: color-coded (Approved = green, Phase III = amber, Phase II = blue, Phase I = gray)
- Count summary: "N competitors in pipeline"

### 6.4 AI Chat / NLQ Panel

**Modeled on:** IQVIA Orchestrated Analytics, Clarivate NLQ

**Purpose:** Allow users to query the platform using natural language. The AI receives full context about the current view state (selected company, country, filters, visible gaps) and returns analytical responses.

**Architecture:**

```
Browser                          Server                        Anthropic
  |                                |                              |
  |-- POST /api/chat ------------->|                              |
  |   { messages[], context }      |                              |
  |                                |-- POST /v1/messages -------->|
  |                                |   { system, messages }       |
  |                                |                              |
  |                                |<-- response body ------------|
  |<-- JSON { analysis } ---------|                              |
  |                                |                              |
```

**Context Injection:**
The server-side route constructs a system prompt that includes:
- Current company and home country
- Number of gaps identified
- Top-ranked gaps with scores
- Available therapeutic areas
- PTRS base rates for relevant TAs

**Query Categories:**
1. **Portfolio queries** -- "Which molecules have the most expansion opportunities?"
2. **PTRS queries** -- "What's the success probability for Metformin in PCOS?"
3. **Competitor queries** -- "Who is competing in the CKD space?"
4. **Strategy queries** -- "Should we prioritize oncology or cardiovascular gaps?"
5. **Comparison queries** -- "Compare the top 3 gaps by unmet need"

**Fallback Behavior:**
When `ANTHROPIC_API_KEY` is not set or the API returns an error, the system falls back to deterministic response generation. The fallback engine pattern-matches query keywords (e.g., "PTRS", "competitor", "top") and constructs responses from the static data layer. This ensures the platform remains functional without API access.

**UI:**
- Slide-out panel or inline chat area
- Message history maintained in React state
- Loading indicator during API calls
- Error state with fallback notification

### 6.5 Watchlist with Persistence

**Purpose:** Allow users to bookmark specific gaps for tracking, persisted across browser sessions.

**Implementation:**

```
Storage key: "indication-gap-watchlist"
Storage format: JSON array of gap identifiers
Identifier: "{moleculeName}|{indicationName}|{countryCode}"
```

**Behavior:**
- Star/bookmark icon on each gap card or row
- Toggle adds/removes from watchlist
- `localStorage.setItem()` on every change
- `localStorage.getItem()` on component mount via `useEffect`
- Filter toggle: "Show watchlist only" filters the gap list to starred items

**Constraints:**
- No server persistence; watchlist is browser-local
- No cross-device sync
- Clearing browser storage clears the watchlist

### 6.6 Side-by-Side Comparator

**Modeled on:** Evaluate Pharma Asset Comparator

**Purpose:** Select up to 4 gaps and view their full metrics in aligned columns for direct comparison.

**Layout:**

```
+------------------+------------------+------------------+------------------+
| Gap A            | Gap B            | Gap C            | Gap D            |
+------------------+------------------+------------------+------------------+
| Molecule         | Molecule         | Molecule         | Molecule         |
| Indication       | Indication       | Indication       | Indication       |
| Composite: 81    | Composite: 74    | Composite: 68    | Composite: 55    |
| PTRS: 54.2%      | PTRS: 38.1%      | PTRS: 61.0%      | PTRS: 12.3%      |
| Phase: III       | Phase: II        | Phase: III       | Phase: II        |
| Months: 36       | Months: 72       | Months: 32       | Months: 84       |
| Competitors: 2   | Competitors: 0   | Competitors: 4   | Competitors: 1   |
| Unmet Need: 82   | Unmet Need: 95   | Unmet Need: 71   | Unmet Need: 65   |
| Viability: Exc   | Viability: Str   | Viability: Str   | Viability: Mod   |
| [PTRS Ring]      | [PTRS Ring]      | [PTRS Ring]      | [PTRS Ring]      |
+------------------+------------------+------------------+------------------+
```

**Behavior:**
- Checkbox or "Compare" button on each gap
- Maximum 4 selections enforced
- Comparator panel opens when >= 2 gaps selected
- Clear all / remove individual selections
- Metric rows are aligned for visual scanning

### 6.7 Portfolio Dashboard

**Modeled on:** IQVIA Pipeline Dimensions, GlobalData Portfolio Analytics

**Purpose:** Aggregate analytics across the entire selected company portfolio, providing executive-level summary.

**Widgets:**

1. **TA Distribution** -- Breakdown of gaps by therapeutic area (bar/donut)
2. **Phase Distribution** -- Gaps by clinical evidence phase (Phase I/II/III)
3. **Competitive Landscape Summary** -- Average competitor density across all gaps
4. **Top 5 Ranked Opportunities** -- Highest composite-scored gaps with quick metrics
5. **Aggregate Statistics** -- Total gaps identified, average composite, average PTRS

**Data Source:**
All widgets are computed client-side from the same scored gap array used by the main view. No additional data fetching.

```
Portfolio Analytics Pipeline:

allGaps = companies[selected].molecules
  .flatMap(mol => generateIndicationData(mol)
    .map(ind => scoreGap(ind, selectedCountry, mol))
    .filter(gap => gap !== null))

taDistribution  = groupBy(allGaps, 'ta')
phaseDistrib    = groupBy(allGaps, 'ptrs.phase')
top5            = sortBy(allGaps, 'scores.composite').slice(0, 5)
avgComposite    = mean(allGaps.map(g => g.scores.composite))
avgPTRS         = mean(allGaps.map(g => g.ptrs.ptrs))
```

### 6.8 Report Export

**Purpose:** One-click export of the current analysis for executive consumption.

**Export Formats:**
- **Clipboard** -- Formatted text copied to system clipboard via `navigator.clipboard.writeText()`
- **File download** -- Generated text/markdown file via Blob URL

**Report Structure:**

```
INDICATION GAP INTELLIGENCE REPORT
====================================
Company: {name}
Home Country: {country}
Generated: {timestamp}
------------------------------------
PORTFOLIO SUMMARY
  Total Gaps Identified: {N}
  Average Composite Score: {X}
  Average PTRS: {X}%
------------------------------------
TOP OPPORTUNITIES (ranked by composite)

1. {molecule} -- {indication}
   Composite: {score} | PTRS: {ptrs}% | Phase: {phase}
   Competitors: {N} | Unmet Need: {score}
   Approved in: {countries}
   ...

------------------------------------
COMPETITIVE LANDSCAPE SUMMARY
  ...
====================================
```

**Behavior:**
- Export button in toolbar/header area
- Generates report from current filtered/sorted view state
- Includes watchlisted items if any are starred
- Formatted for readability in email, Slack, or executive decks

---

## 7. API Design

### 7.1 POST /api/chat

Handles natural language queries via the Anthropic Claude API.

**Request:**

```json
{
  "messages": [
    { "role": "user", "content": "What are the top PCOS opportunities?" }
  ],
  "context": {
    "company": "Pharmascience",
    "country": "CA",
    "gapCount": 28,
    "topGaps": [ ... ]
  }
}
```

**Response (success):**

```json
{
  "analysis": "Based on the current portfolio analysis..."
}
```

**Response (fallback):**

```json
{
  "analysis": "[Deterministic] Based on available data, the top opportunity...",
  "fallback": true
}
```

**Server-side behavior:**
1. Validate request body
2. Construct system prompt with pharma domain context
3. Call Anthropic API with `model: "claude-sonnet-4-20250514"`, `temperature: 0.3`, `max_tokens: 2048`
4. Return response body
5. On error: return deterministic fallback

### 7.2 POST /api/analyze

Handles structured deep analysis for a specific molecule-indication gap.

**Request:**

```json
{
  "molecule": "Metformin HCl",
  "indication": "Polycystic Ovary Syndrome (PCOS)",
  "company": "Pharmascience",
  "gapData": { ... }
}
```

**Response:**

```json
{
  "analysis": "## Strategic Analysis\n\nMetformin for PCOS represents..."
}
```

**Server-side behavior:**
Identical proxy pattern to /api/chat. System prompt is tuned for structured analytical output (strategic rationale, risk factors, recommended next steps).

### 7.3 Error Handling

Both endpoints follow the same error handling pattern:

```
try {
  response = await anthropic.messages.create(...)
  return NextResponse.json({ analysis: response.content[0].text })
} catch (error) {
  return NextResponse.json(
    { analysis: generateFallbackAnalysis(requestData), fallback: true },
    { status: 200 }
  )
}
```

The 200 status on fallback is intentional: the client always receives a usable response. The `fallback: true` flag allows the UI to indicate that AI was unavailable.

---

## 8. Deployment Architecture

### 8.1 Railway Configuration

```toml
# railway.toml

[build]
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5
```

### 8.2 Deployment Diagram

```
GitHub Repository
       |
       | git push origin master
       v
+-------------------+
|     Railway        |
|                   |
|  +--------------+ |
|  | Build Stage  | |       npm install && npm run build
|  +--------------+ |
|        |          |
|  +--------------+ |
|  | Deploy Stage | |       npm start -p $PORT
|  +--------------+ |
|        |          |
|  +--------------+ |
|  | Healthcheck  | |       GET / --> 200 OK
|  +--------------+ |
|                   |
+-------------------+
       |
       | HTTPS (Railway domain or custom)
       v
    End Users
```

### 8.3 Environment Variables

| Variable           | Required | Description                                |
|--------------------|----------|--------------------------------------------|
| `PORT`             | No       | Set by Railway automatically               |
| `ANTHROPIC_API_KEY`| No       | Enables AI features; omit for fallback mode|
| `NODE_ENV`         | No       | Set to "production" by Railway             |

### 8.4 Isolation Requirements

This application is deployed as a **separate Railway service**. It does not:
- Share a port with any existing deployment
- Interfere with any NV12 processes or ports (3000, 3001)
- Modify or depend on any other Railway service
- Require any database or external service beyond Anthropic (optional)

### 8.5 Start Command

```bash
next start -p ${PORT:-3000}
```

Railway injects `PORT` automatically. The `:-3000` fallback is for local development only.

---

## 9. Security Model

### 9.1 API Key Protection

The Anthropic API key is stored server-side as a Railway environment variable. It is never:
- Included in client-side JavaScript bundles
- Sent to the browser in any response
- Logged or persisted in application code

All AI requests are proxied through Next.js API routes:

```
Browser --> POST /api/chat --> Next.js Server --> Anthropic API
                                (key injected here)
```

### 9.2 Input Validation

- API routes validate request body structure before forwarding to Anthropic
- User input is passed within structured message arrays (not raw string interpolation)
- No SQL injection surface (no database)
- No XSS vectors from API responses (React auto-escapes)

### 9.3 Rate Limiting

Currently not implemented at the application layer. Railway provides basic DDoS protection. For production hardening, consider:
- Per-IP rate limiting on /api/chat and /api/analyze
- Token budget caps per session
- Request queuing for burst traffic

### 9.4 No Authentication

The platform does not require user authentication. It is designed as an internal analytical tool. If access control is needed, it should be handled at the network/proxy level (e.g., Railway private networking, VPN, or an auth proxy).

---

## 10. Performance Considerations

### 10.1 Bundle Size

| Concern                   | Mitigation                                         |
|---------------------------|----------------------------------------------------|
| Single component file     | Tree-shaking eliminates unused code paths          |
| No charting library       | SVG ring gauges are hand-rolled (~50 lines)        |
| No CSS-in-JS runtime      | Inline styles have zero runtime cost               |
| No external data fetching | All data is embedded; no waterfall requests        |
| Static data constants     | Minified by Next.js build pipeline                 |

### 10.2 Rendering Performance

- All gap scoring (`scoreGap()`) runs synchronously on filter/sort changes
- Molecule iteration: ~42 molecules x ~6 indications average = ~252 scoreGap calls
- Each scoreGap is O(1) (lookups and arithmetic)
- Total: < 5ms on modern hardware
- `useMemo` used for expensive computed values that depend on filter state

### 10.3 AI Latency

- Anthropic API calls: 1-5 seconds typical latency
- Streaming not currently implemented (batch response)
- Fallback responses are instantaneous (< 1ms)
- UI shows loading state during API calls

### 10.4 localStorage Performance

- Watchlist serialization: negligible (< 100 items typical)
- Read on mount: single `getItem()` call
- Write on change: single `setItem()` call
- No impact on render performance

---

## 11. Competitive Landscape & Benchmarks

This platform is modeled on capabilities found across 6 enterprise pharma intelligence platforms. The following table maps each feature to its commercial analog:

| Feature                      | IQVIA            | Clarivate        | BioMedTracker  | Citeline       | Evaluate Pharma | GlobalData     |
|------------------------------|------------------|------------------|----------------|----------------|-----------------|----------------|
| PTRS Engine                  |                  |                  | LOA by phase   |                |                 |                |
| Indication Heatmap           | Pipeline Dims    | Cortellis Matrix |                | Pipeline view  | Asset Matrix    |                |
| Competitive Pipeline Radar   | Pipeline Intel   | CI Module        |                | Trialtrove     |                 | Pharma Intel   |
| AI Chat / NLQ                | Orchestrated     |                  |                |                |                 |                |
| Watchlist                    | My Pipeline      | Alerts           |                | My Projects    | Watchlist       | My Dashboard   |
| Side-by-Side Comparator      |                  |                  |                |                | Asset Compare   |                |
| Portfolio Dashboard          | Pipeline Dims    |                  |                |                | Portfolio View  | Company Dash   |
| Report Export                | PDF Export       | Export           |                | Reports        | Excel Export    | Reports        |

### Key Differentiators

1. **Zero infrastructure** -- No database, no user management, no ETL pipelines
2. **Embedded data** -- All pharma intelligence is compiled into the application
3. **AI-enhanced analysis** -- Natural language querying with full context injection
4. **Graceful degradation** -- Fully functional without API connectivity
5. **Instant deployment** -- Single `git push` to Railway

---

## 12. Appendices

### Appendix A: Molecule-to-Indication Mapping (Selected Examples)

**Metformin HCl (Pharmascience)**
| Indication                        | Countries Approved       | Evidence Phase  |
|-----------------------------------|--------------------------|-----------------|
| Type 2 Diabetes Mellitus          | All 12                   | Phase IV        |
| PCOS                              | US, EU, UK, AU, IL       | Phase III       |
| Gestational Diabetes Prevention   | UK, AU                   | Phase III       |
| Colorectal Cancer Adjuvant        | JP, KR                   | Phase II        |
| Anti-Aging / Longevity            | None                     | Phase III       |

**Colchicine (Pharmascience)**
| Indication                        | Countries Approved       | Evidence Phase  |
|-----------------------------------|--------------------------|-----------------|
| Gout Flares                       | All 12                   | Phase IV        |
| FMF                               | CA, US, EU, UK, JP, AU, IL, CH | Phase IV  |
| Pericarditis                      | US, EU, UK, AU, CH, IL   | Phase III       |
| CV Event Prevention (COLCOT)      | CA, AU                   | Phase III       |
| Liver Fibrosis / Cirrhosis        | CN, IN                   | Phase II        |

**Dapagliflozin (Viatris)**
| Indication                        | Countries Approved       | Evidence Phase  |
|-----------------------------------|--------------------------|-----------------|
| Type 2 Diabetes                   | All 12                   | Phase IV        |
| Heart Failure (HFrEF)             | US, EU, UK, JP, AU, CH   | Phase III       |
| Heart Failure (HFpEF)             | US, EU, UK, JP           | Phase III       |
| Chronic Kidney Disease            | US, EU, UK, JP, AU, CH   | Phase III       |
| NASH / MASLD                      | None                     | Phase II        |

### Appendix B: File Structure Reference

```
IndicationGapIntel/
  docs/
    DESIGN_SPEC.md             <-- This document
  public/                      Static assets (favicon, etc.)
  src/
    app/
      api/
        analyze/
          route.js             Gap deep-analysis endpoint
        chat/
          route.js             NLQ conversation endpoint
      globals.css              Dark theme, base styles
      layout.js                Root layout component
      page.js                  Entry point
    components/
      IndicationGapIntelligence.jsx   Main application component
  next.config.js               Next.js configuration
  package.json                 Dependencies and scripts
  railway.toml                 Railway deployment configuration
```

### Appendix C: Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Start on specific port
PORT=4000 npm start
```

### Appendix D: Glossary

| Term       | Definition                                                              |
|------------|-------------------------------------------------------------------------|
| ACS        | Acute Coronary Syndrome                                                 |
| ATC        | Anatomical Therapeutic Chemical classification                          |
| BPH        | Benign Prostatic Hyperplasia                                            |
| CKD        | Chronic Kidney Disease                                                  |
| CML        | Chronic Myeloid Leukemia                                                |
| CPPS       | Chronic Pelvic Pain Syndrome                                            |
| FMF        | Familial Mediterranean Fever                                            |
| GAD        | Generalized Anxiety Disorder                                            |
| GBM        | Glioblastoma Multiforme                                                 |
| GDMT       | Guideline-Directed Medical Therapy                                      |
| GERD       | Gastroesophageal Reflux Disease                                         |
| GIST       | Gastrointestinal Stromal Tumor                                          |
| HCC        | Hepatocellular Carcinoma                                                |
| HFpEF      | Heart Failure with Preserved Ejection Fraction                          |
| HFrEF      | Heart Failure with Reduced Ejection Fraction                            |
| LOA        | Likelihood of Approval                                                  |
| MASLD      | Metabolic Dysfunction-Associated Steatotic Liver Disease                |
| MDD        | Major Depressive Disorder                                               |
| MDS        | Myelodysplastic Syndromes                                               |
| MET        | Medical Expulsive Therapy                                               |
| NASH       | Non-Alcoholic Steatohepatitis                                           |
| NDA        | New Drug Application                                                    |
| NLQ        | Natural Language Query                                                  |
| NSCLC      | Non-Small Cell Lung Cancer                                              |
| PAD        | Peripheral Artery Disease                                               |
| PCOS       | Polycystic Ovary Syndrome                                               |
| PTRS       | Probability of Technical & Regulatory Success                           |
| RCC        | Renal Cell Carcinoma                                                    |
| SoC        | Standard of Care                                                        |
| TA         | Therapeutic Area                                                        |
| VTE        | Venous Thromboembolism                                                  |

---

*End of Design Specification*
