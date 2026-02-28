# FinSitch Improvement Roadmap (Impact-Ranked)

This version prioritizes the highest-leverage product changes first, with clear justification and success metrics.

## Prioritization Method

Each initiative is ranked by:

- **User Impact**: how much it improves decision quality/speed.
- **Business Impact**: retention, activation, and trust effects.
- **Implementation Cost**: engineering effort and risk.

---

## 1) Data Trust Layer (Highest Impact)

### What to build

- Add a persistent **Data Health Bar** in the header: Fresh / Delayed / Degraded / Offline.
- Surface per-panel freshness badges and source-level failure reasons.
- Add “last successful update” timestamps and 24h source reliability trends.

### Why this is impactful

- This app is used for time-sensitive analysis; stale data with no context can lead to wrong conclusions.
- Clear trust signals reduce cognitive overhead and improve analyst confidence immediately.
- The codebase already has freshness primitives, so this is high impact with moderate effort.

### Success metrics

- +20% increase in sessions where users open source drill-down (indicates trust-check behavior).
- -30% drop in support/feedback about “is this data live?” confusion.
- Higher average session duration on high-volatility days.

---

## 2) No-Reload Language Switching

### What to build

- Remove full window reload when language changes.
- Re-render translated UI strings live while preserving map center, filters, and panel state.
- Add locale formatting consistency for numbers/dates/currency.

### Why this is impactful

- Current forced reload interrupts active workflows and causes state loss.
- Multilingual monitoring is a core differentiator; frictionless language switching increases utility for global teams.

### Success metrics

- +15% increase in multilingual sessions (users switching language at least once).
- -40% reduction in drop-off immediately after language change.

---

## 3) Workflow Presets (“Market Modes”)

### What to build

- Add one-click presets: **Macro Day**, **Earnings Day**, **Volatility Mode**, **Crypto Focus**.
- Presets configure panel visibility, map layers, and feed emphasis.
- Add command-palette shortcuts for fast switching.

### Why this is impactful

- The app has many panels/layers; first-time users can feel overwhelmed.
- Presets shorten time-to-value and reduce setup friction for repeat workflows.

### Success metrics

- -35% time-to-first-meaningful-interaction (first panel interaction + map action).
- +25% increase in returning users adopting at least one preset.

---

## 4) Feed Quality & Relevance Ranking

### What to build

- Add stronger near-duplicate collapse across wire copies.
- Rank by source credibility tier + novelty + recency.
- Show “Why this item?” labels (source quality, freshness, uniqueness).
- Add temporary quarantine for feeds with repeated parse/timeouts.

### Why this is impactful

- Signal quality is more valuable than feed volume in intelligence workflows.
- Better ranking and explainability improves trust and reduces noise fatigue.

### Success metrics

- +20% click-through on top 5 items in each feed.
- -30% duplicate headline exposure per session.

---

## 5) Privacy-Safe Product Analytics (Opt-In)

### What to build

- Add opt-in telemetry for core UX events (panel toggles, search success, preset usage, settings completion).
- Keep privacy-first defaults and aggregate locally before shipping.
- Support pluggable adapters (self-hosted/cloud).

### Why this is impactful

- Without usage data, roadmap decisions are guesswork.
- Opt-in architecture preserves privacy while enabling evidence-based improvement.

### Success metrics

- Instrument at least 80% of critical user flows.
- Monthly product decisions tied to measurable metrics instead of anecdotal feedback.

---

## 6) Performance SLOs + CI Guardrails

### What to build

- Define performance budgets for first panel render, map-ready time, and search response.
- Add CI checks for bundle growth and interaction regressions.
- Apply adaptive polling based on visibility and device capability.

### Why this is impactful

- Performance regressions are hard to spot until users complain.
- Hard guardrails keep speed from degrading as features scale.

### Success metrics

- Keep p95 map-ready time under target budget.
- Zero unnoticed bundle-size regressions beyond threshold.

---

## 7) Onboarding + Saved Workspaces

### What to build

- Add a first-run guided tour (freshness, signals, map layers, feed controls).
- Add saved workspace profiles and shareable workspace links.
- Add keyboard-shortcuts modal and command palette discoverability hints.

### Why this is impactful

- Better onboarding boosts activation.
- Saved workspaces improve retention for analyst teams with recurring workflows.

### Success metrics

- +20% activation (users completing at least 3 key actions in first session).
- +15% week-2 retention for new users.

---

## 8) Naming + Positioning Consistency

### What to build

- Standardize product naming across app/UI/domain/social metadata.
- Clarify role-based value props (trader, analyst, newsroom).
- Tighten landing page and OG cards for finance intent keywords.

### Why this is impactful

- Inconsistent naming harms trust and discoverability.
- Clear positioning improves conversion from first visit to active use.

### Success metrics

- Improved branded-search CTR.
- Increased conversion from landing page to active session.

---

## Suggested Delivery Plan

### Phase 1 (Quick wins, 1–2 sprints)

1. Data Trust Layer
2. No-Reload Language Switching
3. Workflow Presets

### Phase 2 (Scale quality, 2–3 sprints)

4. Feed Quality & Relevance Ranking
5. Performance SLOs + CI Guardrails

### Phase 3 (Growth + optimization)

6. Privacy-Safe Analytics
7. Onboarding + Saved Workspaces
8. Naming + Positioning Consistency
