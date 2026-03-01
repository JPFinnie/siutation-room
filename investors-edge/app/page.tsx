'use client';

import { useState } from 'react';
import PortfolioForm     from '@/components/PortfolioForm';
import RecommendationCard from '@/components/RecommendationCard';
import ScenarioChart     from '@/components/ScenarioChart';
import LoadingState      from '@/components/LoadingState';
import { PortfolioInput, AnalysisResult } from '@/lib/types';

// ─── Header ─────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header style={{ backgroundColor: '#0B1A40' }} className="text-white px-6 py-5">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: '#C8973A', color: '#0B1A40' }}
          >
            IE
          </div>
          <div>
            <p className="font-bold text-base leading-tight">Investor&apos;s Edge</p>
            <p className="text-xs opacity-60">for CIBC Investor&apos;s Edge users</p>
          </div>
        </div>
        <p className="text-sm opacity-50 hidden sm:block">
          Your highest-leverage financial action, calculated.
        </p>
      </div>
    </header>
  );
}

// ─── Portfolio metrics summary bar ──────────────────────────────────────────
function MetricBar({ metrics }: { metrics: AnalysisResult['metrics'] }) {
  function fmt(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
    return `$${n}`;
  }

  const gainColor = metrics.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600';
  const gainSign  = metrics.unrealizedGainLoss >= 0 ? '+' : '';

  return (
    <div className="card p-4 fade-up">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-400 mb-1">Portfolio Value</p>
          <p className="text-lg font-bold text-gray-900">{fmt(metrics.totalValue)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Unrealised G/L</p>
          <p className={`text-lg font-bold ${gainColor}`}>
            {gainSign}{fmt(metrics.unrealizedGainLoss)}
            <span className="text-xs font-normal ml-1">
              ({gainSign}{metrics.unrealizedGainLossPct.toFixed(1)}%)
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Equity / Fixed</p>
          <p className="text-lg font-bold text-gray-900">
            {Math.round(metrics.currentAllocation.equityPct)}% /{' '}
            {Math.round(metrics.currentAllocation.fixedIncomePct)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Weighted Return</p>
          <p className="text-lg font-bold text-gray-900">
            {(metrics.weightedAnnualReturn * 100).toFixed(1)}%
            <span className="text-xs font-normal text-gray-400 ml-1">/ yr</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [result,    setResult]    = useState<AnalysisResult | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioInput | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleAnalyze(portfolio: PortfolioInput) {
    setPortfolio(portfolio);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res  = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ portfolio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setResult(data as AnalysisResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Hero copy (only when no result) */}
        {!result && !loading && (
          <div className="text-center py-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              What&apos;s your #1 financial move this month?
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              Enter your portfolio details and our engine scores every possible action —
              from tax-loss harvesting to TFSA optimisation — and surfaces the single
              highest-expected-value move.
            </p>
          </div>
        )}

        {/* Form */}
        {!result && !loading && (
          <PortfolioForm onAnalyze={handleAnalyze} />
        )}

        {/* Loading */}
        {loading && <LoadingState />}

        {/* Error */}
        {error && (
          <div className="card p-6 text-center space-y-3">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => { setError(null); }}
              className="text-sm text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">

            {/* Metrics bar */}
            <MetricBar metrics={result.metrics} />

            {/* Main recommendation + scored list */}
            <RecommendationCard
              aiInsight={result.aiInsight}
              topAction={result.topAction}
              allActions={result.allActions}
            />

            {/* Scenario chart */}
            <ScenarioChart
              scenarios={result.scenarios}
              goalAmount={portfolio?.goal.targetAmount ?? 0}
              yearsToGoal={portfolio?.goal.yearsToGoal ?? (result.scenarios[0]?.yearByYearValues.length - 1)}
            />

            {/* Reset */}
            <div className="text-center pb-8">
              <button
                onClick={() => { setResult(null); setPortfolio(null); }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
              >
                ← Analyse a different portfolio
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
