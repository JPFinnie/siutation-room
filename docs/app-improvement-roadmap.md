# FinSitch Improvement Roadmap

This roadmap focuses on improvements that would make the app more trustworthy, faster to use, and easier to evolve.

## 1) Improve user trust and data transparency

- Add a visible **"data health" dock** that surfaces stale/error states by source and panel.
- Extend existing freshness tracking into per-panel badges (Fresh / Delayed / Offline) with drill-down to source-level failures.
- Add "last successful refresh" and source reliability trends over 24h.

## 2) Better international UX (without full page reload)

- Remove full page reload after language changes.
- Switch language live by rerendering UI bindings and keeping map/panel state intact.
- Add locale-aware number/date formatting consistency checks.

## 3) Create privacy-safe product analytics for UX decisions

- Implement minimal, opt-in telemetry for core interactions (panel open/close, search success, settings completion), with local aggregation before send.
- Keep current local-only default, but expose optional analytics adapters (self-hosted or cloud) so improvements can be measured.

## 4) Reduce information overload with "market mode" presets

- Add preset layouts (Macro Day, Earnings Day, Volatility Mode, Crypto Mode).
- Prefill panel and map-layer toggles to reduce setup time for first-time users.
- Add quick command palette actions for preset switching.

## 5) Improve feed quality and dedup relevance

- Add stronger source weighting and duplicate collapse across near-identical wire copies.
- Show "why this is shown" badges (source tier, novelty score, recency).
- Add per-feed health metrics (timeouts, parse failures) and temporary quarantine for noisy feeds.

## 6) Performance guardrails and budgets

- Define page-interaction SLOs (first usable panel render, map ready, search latency).
- Add CI checks for bundle regressions and interaction timing thresholds.
- Introduce adaptive polling intervals based on tab visibility and device constraints.

## 7) Onboarding and retention

- Add first-run walkthrough for panel categories, risk/freshness semantics, and source controls.
- Add "Saved Workspaces" so users can store and share panel/layer configurations.
- Introduce keyboard shortcuts cheat sheet and command palette discoverability.

## 8) Branding and discoverability cleanup

- Standardize naming (FinSitch vs Situation Room) and domain spelling consistency.
- Add clearer value proposition and role-based landing copy (trader, analyst, newsroom).
- Tighten social preview cards and SEO metadata for finance-specific intents.
