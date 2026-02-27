/**
 * Summarization Service — Ollama Only
 * Uses the SummarizeArticle RPC to call local Ollama instance.
 */

import { SITE_VARIANT } from '@/config';
import { isFeatureAvailable, type RuntimeFeatureId } from './runtime-config';
import { NewsServiceClient, type SummarizeArticleResponse } from '@/generated/client/worldmonitor/news/v1/service_client';
import { createCircuitBreaker } from '@/utils';

export type SummarizationProvider = 'ollama' | 'cache';

export interface SummarizationResult {
  summary: string;
  provider: SummarizationProvider;
  model: string;
  cached: boolean;
}

export type ProgressCallback = (step: number, total: number, message: string) => void;

export interface SummarizeOptions {
  skipCloudProviders?: boolean;
  skipBrowserFallback?: boolean;
}

// ── Sebuf client ──

const newsClient = new NewsServiceClient('', { fetch: (...args) => globalThis.fetch(...args) });
const summaryBreaker = createCircuitBreaker<SummarizeArticleResponse>({ name: 'News Summarization', cacheTtlMs: 0 });

const emptySummaryFallback: SummarizeArticleResponse = { summary: '', provider: '', model: '', cached: false, skipped: false, fallback: true, tokens: 0, reason: '', error: '', errorType: '' };

// ── Provider definition ──

interface ApiProviderDef {
  featureId: RuntimeFeatureId;
  provider: SummarizationProvider;
  label: string;
}

const API_PROVIDERS: ApiProviderDef[] = [
  { featureId: 'aiOllama', provider: 'ollama', label: 'Ollama' },
];

// ── Ollama provider caller ──

async function tryApiProvider(
  providerDef: ApiProviderDef,
  headlines: string[],
  geoContext?: string,
  lang?: string,
): Promise<SummarizationResult | null> {
  if (!isFeatureAvailable(providerDef.featureId)) return null;
  try {
    const resp: SummarizeArticleResponse = await summaryBreaker.execute(async () => {
      return newsClient.summarizeArticle({
        provider: providerDef.provider,
        headlines,
        mode: 'brief',
        geoContext: geoContext || '',
        variant: SITE_VARIANT,
        lang: lang || 'en',
      });
    }, emptySummaryFallback);

    if (resp.skipped || resp.fallback) return null;

    const summary = typeof resp.summary === 'string' ? resp.summary.trim() : '';
    if (!summary) return null;

    const cached = Boolean(resp.cached);
    const resultProvider = cached ? 'cache' : providerDef.provider;
    console.log(`[Summarization] ${cached ? 'Cache hit' : `${providerDef.label} success`}:`, resp.model);
    return {
      summary,
      provider: resultProvider as SummarizationProvider,
      model: resp.model || providerDef.provider,
      cached,
    };
  } catch (error) {
    console.warn(`[Summarization] ${providerDef.label} failed:`, error);
    return null;
  }
}

/**
 * Generate a summary using Ollama
 */
export async function generateSummary(
  headlines: string[],
  onProgress?: ProgressCallback,
  geoContext?: string,
  lang: string = 'en',
  _options?: SummarizeOptions,
): Promise<SummarizationResult | null> {
  if (!headlines || headlines.length < 2) {
    return null;
  }

  onProgress?.(1, 1, 'Connecting to Ollama...');

  for (const provider of API_PROVIDERS) {
    const result = await tryApiProvider(provider, headlines, geoContext, lang);
    if (result) return result;
  }

  console.warn('[Summarization] Ollama unavailable');
  return null;
}

/**
 * Translate text using Ollama (via SummarizeArticle RPC with mode='translate')
 */
export async function translateText(
  text: string,
  targetLang: string,
  onProgress?: ProgressCallback
): Promise<string | null> {
  if (!text) return null;

  for (const [i, providerDef] of API_PROVIDERS.entries()) {
    if (!isFeatureAvailable(providerDef.featureId)) continue;

    onProgress?.(i + 1, API_PROVIDERS.length, `Translating with ${providerDef.label}...`);
    try {
      const resp = await summaryBreaker.execute(async () => {
        return newsClient.summarizeArticle({
          provider: providerDef.provider,
          headlines: [text],
          mode: 'translate',
          geoContext: '',
          variant: targetLang,
          lang: '',
        });
      }, emptySummaryFallback);

      if (resp.fallback || resp.skipped) continue;
      const summary = typeof resp.summary === 'string' ? resp.summary.trim() : '';
      if (summary) return summary;
    } catch (e) {
      console.warn(`${providerDef.label} translation failed`, e);
    }
  }

  return null;
}
