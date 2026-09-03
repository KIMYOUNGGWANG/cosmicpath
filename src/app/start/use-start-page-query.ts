'use client';

import type { ReadonlyURLSearchParams } from 'next/navigation';
import { getLandingVariant } from '@/lib/language-preference';
import {
  getPrefilledQuestion,
  getPrefilledReadingContext,
  getPrefilledScenario,
  getScenarioPreset,
  getStartPageSource,
  isDecisionTimingSource,
} from './start-page-helpers';

export function useStartPageQuery(
  searchParams: ReadonlyURLSearchParams,
  language: 'ko' | 'en'
) {
  const autoReferralCode =
    searchParams.get('referralCode') ||
    searchParams.get('ref') ||
    searchParams.get('promo') ||
    undefined;
  const entry = searchParams.get('entry');
  const queryLanguage = getQueryLanguage(searchParams.get('lang'), searchParams.get('language'));
  const presetKey = searchParams.get('preset');
  const preset = getScenarioPreset(presetKey, language);

  const initialContext = getPrefilledReadingContext(searchParams.get('context')) || preset?.context;
  const initialQuestion = getPrefilledQuestion(searchParams.get('question')) || preset?.question;
  const initialScenarioA =
    getPrefilledScenario(searchParams.get('scenarioA') || searchParams.get('optA')) || preset?.scenarioA;
  const initialScenarioB =
    getPrefilledScenario(searchParams.get('scenarioB') || searchParams.get('optB')) || preset?.scenarioB;

  const landingSource = getStartPageSource(Boolean(searchParams.get('invite')), entry);
  const isRelationshipContactEntry =
    landingSource === 'next_move_report_mvp_v1' ||
    landingSource === 'relationship_contact_timing_v1' ||
    landingSource === 'en_relationship_contact_timing_v1';
  const effectiveInitialContext = isRelationshipContactEntry ? (initialContext ?? 'love') : initialContext;
  const activeLandingVariant =
    landingSource === 'en_relationship_contact_timing_v1'
      ? 'en_contact_timing_v1'
      : getLandingVariant(language);

  return {
    activeLandingVariant,
    autoReferralCode,
    effectiveInitialContext,
    entry,
    initialContext,
    initialQuestion,
    initialScenarioA,
    initialScenarioB,
    isDecisionTimingEntry: isDecisionTimingSource(landingSource),
    isNextMoveReportEntry: isRelationshipContactEntry,
    landingSource,
    paidFromSearchParams: searchParams.get('paid') === 'true',
    queryLanguage,
  };
}

function getQueryLanguage(...values: Array<string | null>): 'ko' | 'en' | null {
  const matched = values.find((value) => value === 'ko' || value === 'en');
  return matched === 'ko' || matched === 'en' ? matched : null;
}
