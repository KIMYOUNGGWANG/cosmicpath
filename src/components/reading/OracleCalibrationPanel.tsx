'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOraclePersona } from '@/lib/ai/oracle-personas';

const PREMIUM_ORACLE_MESSAGES_KO = [
  '명반을 대조하는 중...',
  '명리학의 뿌리를 캐는 중...',
  '행성 궤도를 분석하는 중...',
  '자미두수 명반과 사주를 대조하는 중...',
  '과거의 패턴을 추적하는 중...',
  '선택의 전환점을 탐색하는 중...',
  '인생의 흐름도를 그리는 중...',
  '최종 행동 지침을 도출하는 중...',
];

const PREMIUM_ORACLE_MESSAGES_EN = [
  'Mapping your celestial chart...',
  'Tracing the roots of this decision...',
  'Analyzing planetary alignments...',
  'Cross-referencing Ziwei and Saju...',
  'Tracking patterns from the past...',
  'Locating your pivotal turning points...',
  'Drawing the arc of your life seasons...',
  'Deriving your final decision note...',
];

interface OracleCalibrationPanelProps {
  language: 'ko' | 'en';
  loadingLabel?: string;
  loadingPhase?: number;
  characterId?: string;
  isPremium?: boolean;
  precisionMetadata?: {
    inputDate: string;
    inputTime: string;
    tstOffset: number;
    correctedDate: string;
    correctedTime: string;
    lon: number;
    hourPillar: string;
    astrologyInputDate?: string;
    astrologyInputTime?: string;
    astrologyTimezoneOffset?: number;
    astrologyTimePolicy?: 'civil_time';
    astrologyAscendantConfidence?: 'exact_time' | 'approximate_noon';
  } | null;
  oracleCouncil?: {
    convergenceScore: number;
    ziweiSummary: string;
    natalSummary: string;
  } | null;
  compact?: boolean;
  hasPreciseBirthLocation?: boolean;
}

const STAGE_LABELS = {
  precision: {
    ko: [
      '출생 시간 기준 확인',
      '진태양시 보정',
      '사주 다시 계산',
      '교차 확인 정리',
    ],
    en: [
      'Birth Coordinate Sync',
      'True Solar Time Shift',
      'Saju Recalculation',
      'Ziwei + Natal Merge',
    ],
  },
  basic: {
    ko: [
      '질문 정리',
      '사주 계산',
      '점성술 · 자미두수 확인',
      '첫 결과 구성',
    ],
    en: [
      'Question Framing',
      'Saju Alignment',
      'Astrology + Ziwei Alignment',
      'Final Report Assembly',
    ],
  },
};

const PANEL_COPY = {
  precision: {
    ko: {
      label: '정밀 리딩 준비',
      pendingTitle: '출생 시간 기준을 다시 맞추는 중',
      readyTitle: '정밀 보정이 끝났어요',
      loadingText: '입력한 시간과 출생지 기준을 다시 확인하고, 교차 해석을 정리하고 있습니다.',
      snapshotLabel: '리딩 기준 요약',
      guideLabel: '선택한 가이드',
      timingLabel: '진태양시',
      timingPending: '경도 보정 대기 중',
      timingExplainLabel: '입력 시각 → 적용 시각',
      pillarLabel: '최종 시주',
      scopeLabel: '교차 확인 범위',
      scopePending: '자미두수와 점성 레이어를 함께 정리하는 중',
      footerText: '출생지와 시간 기준을 다시 확인한 뒤, 사주와 다른 해석 레이어를 함께 정리하고 있습니다.',
    },
    en: {
      label: 'CosmicPath Setup',
      pendingTitle: 'Preparing the CosmicPath reading',
      readyTitle: 'True Solar Time Locked',
      loadingText: 'Checking chart time, question context, and evidence layers.',
      snapshotLabel: 'Setup Snapshot',
      guideLabel: 'Selected Lens',
      timingLabel: 'True Solar Time',
      timingPending: 'awaiting longitude correction',
      timingExplainLabel: 'Input time → chart time',
      pillarLabel: 'Final Hour Pillar',
      scopeLabel: 'Evidence Scope',
      scopePending: 'synchronizing ziwei and natal layers',
      footerText: 'Your chart is being recalculated with local longitude, true solar time, and cross-system evidence.',
    },
  },
  basic: {
    ko: {
      label: '운명 정밀 계산 중',
      pendingTitle: '사주 원국과 행성 궤도를 정밀 대조하는 중',
      readyTitle: '핵심 운명 분석 완료',
      loadingText: '사용자의 생년월일시 사주 4주 8자와 KASI 천문학 행성 궤도를 정밀 교차 분석하고 있습니다.',
      snapshotLabel: '분석 기준 요약',
      guideLabel: '담당 오라클',
      timingLabel: '해석 기준',
      timingPending: '한국천문연구원(KASI) 역법 및 출생 기준 적용',
      timingExplainLabel: '입력 기준',
      pillarLabel: '시주(時柱)',
      scopeLabel: '융합 분석 범위',
      scopePending: '사주 명리학(60%) · 서양 점성술(40%) · 자미두수',
      footerText: '입력하신 생년월일시를 바탕으로 사주 원국과 점성술 10대 행성 배치를 정밀 교차 분석합니다.',
    },
    en: {
      label: 'CosmicPath Precision Engine',
      pendingTitle: 'Aligning Four Pillars and Planetary Orbits',
      readyTitle: 'Destiny Analysis Prepared',
      loadingText: 'Cross-checking your Saju Four Pillars, planetary transits, and celestial alignments.',
      snapshotLabel: 'Analysis Snapshot',
      guideLabel: 'Selected Oracle',
      timingLabel: 'Calculation Basis',
      timingPending: 'KASI Ephemeris & True Solar Alignment',
      timingExplainLabel: 'Input basis',
      pillarLabel: 'Hour Pillar',
      scopeLabel: 'Analysis Scope',
      scopePending: 'Saju (60%) · Astrology (40%) · Ziwei Doushu',
      footerText: 'Your chart is cross-verified across Eastern Four Pillars and Western Planetary Ephemeris.',
    },
  },
};

function getStageState(
  index: number,
  loadingPhase: number,
  hasPrecision: boolean,
  showPrecisionDetails: boolean
) {
  if (showPrecisionDetails && hasPrecision && index <= 1) return 'done';
  if (loadingPhase >= 4 && index <= 2) return 'done';
  if (loadingPhase >= 6 && index <= 3) return 'done';
  if (loadingPhase <= 0 && index === 0) return 'active';
  if (index === 0) return 'active';
  if (loadingPhase >= 3 && index === 1) return 'active';
  if (loadingPhase >= 4 && index === 2) return 'active';
  if (loadingPhase >= 6 && index === 3) return 'active';
  return 'idle';
}

function formatAstrologyTimezone(offset: number | undefined) {
  if (offset === 9) return 'KST';
  if (offset === 0) return 'UTC';
  if (typeof offset !== 'number') return 'KST';

  return `UTC${offset > 0 ? '+' : ''}${offset}`;
}

export function OracleCalibrationPanel({
  language,
  loadingLabel,
  loadingPhase = 0,
  characterId,
  isPremium = false,
  precisionMetadata,
  oracleCouncil,
  compact = false,
  hasPreciseBirthLocation = false,
}: OracleCalibrationPanelProps) {
  const persona = getOraclePersona(characterId);
  const showPrecisionDetails = hasPreciseBirthLocation;
  const mode = showPrecisionDetails ? 'precision' : 'basic';
  const stages = STAGE_LABELS[mode][language];
  const copy = PANEL_COPY[mode][language];
  const hasPrecision = Boolean(precisionMetadata);
  const timeShiftText = precisionMetadata
    ? `${precisionMetadata.inputDate} ${precisionMetadata.inputTime} → ${precisionMetadata.correctedDate} ${precisionMetadata.correctedTime}`
    : null;
  const astrologyTimeText = precisionMetadata?.astrologyInputDate && precisionMetadata.astrologyInputTime
    ? language === 'en'
      ? `Astrology basis: ${precisionMetadata.astrologyInputDate} ${precisionMetadata.astrologyInputTime} ${formatAstrologyTimezone(precisionMetadata.astrologyTimezoneOffset)} (${precisionMetadata.astrologyAscendantConfidence === 'approximate_noon' ? 'unknown birth time, ascendant reference value' : 'civil birth time'})`
      : `점성술 기준: ${precisionMetadata.astrologyInputDate} ${precisionMetadata.astrologyInputTime} ${formatAstrologyTimezone(precisionMetadata.astrologyTimezoneOffset)} (${precisionMetadata.astrologyAscendantConfidence === 'approximate_noon' ? '출생시 미상, 상승궁 참고값' : '민간 출생시 기준'})`
    : null;
  const hasDateShift = Boolean(
    precisionMetadata && precisionMetadata.inputDate !== precisionMetadata.correctedDate
  );
  const containerSize = compact
    ? 'w-full max-w-md p-6'
    : showPrecisionDetails
      ? 'w-full max-w-3xl p-8 md:p-10'
      : 'w-full max-w-2xl p-6 md:p-8';

  // Premium: 5초 간격으로 오라클 메시지 순환
  const premiumMessages = language === 'ko' ? PREMIUM_ORACLE_MESSAGES_KO : PREMIUM_ORACLE_MESSAGES_EN;
  const [premiumMessageIndex, setPremiumMessageIndex] = useState(0);
  const [isPremiumMessageVisible, setIsPremiumMessageVisible] = useState(true);

  useEffect(() => {
    if (!isPremium) return;

    const interval = setInterval(() => {
      setIsPremiumMessageVisible(false);
      setTimeout(() => {
        setPremiumMessageIndex((prev) => (prev + 1) % premiumMessages.length);
        setIsPremiumMessageVisible(true);
      }, 400);
    }, 4600);

    return () => clearInterval(interval);
  }, [isPremium, premiumMessages.length]);

  const activeLoadingLabel = isPremium
    ? premiumMessages[premiumMessageIndex]
    : (loadingLabel || copy.loadingText);


  return (
    <div className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] backdrop-blur-2xl ${containerSize}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,141,255,0.18),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(212,175,55,0.14),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(110,231,255,0.08),transparent_30%)]" />

      <div className={`relative z-10 ${compact ? 'space-y-5' : 'grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8'}`}>
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.32em] text-acc-gold/80">
                {copy.label}
              </p>
              <h3 className={`${compact ? 'text-xl' : 'text-2xl md:text-3xl'} font-cinzel leading-tight text-starlight`}>
                {hasPrecision && showPrecisionDetails ? copy.readyTitle : copy.pendingTitle}
              </h3>
            </div>
            <div className="max-w-full self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55 sm:text-[11px] sm:tracking-[0.24em]">
              {showPrecisionDetails ? persona.name : (language === 'en' ? 'Reading View' : '리딩 보기')}
            </div>
          </div>

          <div className="relative flex items-center justify-center py-4 md:py-6">
            <motion.div
              className="absolute h-32 w-32 rounded-full border border-acc-gold/20 md:h-40 md:w-40"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            />
            <motion.div
              className="absolute h-24 w-24 rounded-full border border-sky-300/20 md:h-28 md:w-28"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            />
            <motion.div
              className="absolute h-14 w-14 rounded-full bg-acc-gold/10 blur-xl md:h-16 md:w-16"
              animate={{ scale: [0.88, 1.08, 0.88], opacity: [0.45, 0.9, 0.45] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            />
            <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full border border-white/10 bg-black/30 px-2 text-center md:h-24 md:w-24 md:px-3">
              <div className="font-cinzel text-sm tracking-[0.12em] text-starlight md:text-base md:tracking-[0.16em]">
                {persona.name}
              </div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/40 md:text-[10px] md:tracking-[0.22em]">
                {showPrecisionDetails
                  ? (language === 'en' ? persona.titleEn : persona.titleKo)
                  : (language === 'en' ? persona.toneEn : persona.toneKo)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative min-h-[28px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={isPremium ? premiumMessageIndex : 'static'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: isPremium ? (isPremiumMessageVisible ? 1 : 0) : 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35 }}
                  className={`text-sm leading-relaxed ${isPremium ? 'text-acc-gold/90 font-medium tracking-wide' : 'text-white/70'}`}
                >
                  {isPremium && <span className="mr-1.5 opacity-70">✦</span>}
                  {activeLoadingLabel}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="h-[1px] w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-300 via-acc-gold to-cyan-200"
                initial={{ width: '18%' }}
                animate={{ width: hasPrecision && showPrecisionDetails ? '74%' : `${Math.min(94, 24 + loadingPhase * 10)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>


          <div className="grid gap-2">
            {stages.map((stage, index) => {
              const state = getStageState(index, loadingPhase, hasPrecision, showPrecisionDetails);
              return (
                <div
                  key={stage}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${state === 'done'
                    ? 'border-acc-gold/30 bg-acc-gold/8 text-starlight'
                    : state === 'active'
                      ? 'border-sky-300/20 bg-sky-300/8 text-starlight'
                      : 'border-white/8 bg-white/[0.03] text-white/45'
                    }`}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${state === 'done'
                    ? 'bg-acc-gold'
                    : state === 'active'
                      ? 'bg-sky-300'
                      : 'bg-white/20'
                    }`} />
                  <span className="text-sm tracking-[0.04em] sm:tracking-[0.08em]">{stage}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 md:p-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
              {copy.snapshotLabel}
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                  {copy.guideLabel}
                </div>
                <div className="mt-1 font-cinzel text-lg text-starlight">{persona.name}</div>
                <div className="text-sm text-white/55">
                  {showPrecisionDetails
                    ? (language === 'en' ? persona.titleEn : persona.titleKo)
                    : (language === 'en' ? persona.toneEn : persona.toneKo)}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                  {copy.timingLabel}
                </div>
                <div className="mt-1 text-lg text-starlight">
                  {showPrecisionDetails
                    ? (precisionMetadata?.correctedTime || '--:--')
                    : (language === 'en' ? 'Entered birth time' : '입력한 출생 시간')}
                </div>
                <div className="text-sm text-white/55">
                  {showPrecisionDetails && precisionMetadata
                    ? `${precisionMetadata.tstOffset >= 0 ? '+' : ''}${precisionMetadata.tstOffset}m / ${precisionMetadata.lon.toFixed(3)}°`
                    : copy.timingPending}
                </div>
                {showPrecisionDetails && timeShiftText && (
                  <div className="mt-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/70">
                    <div className="uppercase tracking-[0.2em] text-white/35">
                      {copy.timingExplainLabel}
                    </div>
                    <div className="mt-1 text-starlight">{timeShiftText}</div>
                    {astrologyTimeText && (
                      <div className="mt-1 text-starlight/85">{astrologyTimeText}</div>
                    )}
                    <div className="mt-1 text-white/50">
                      {hasDateShift
                        ? (language === 'en'
                          ? 'The corrected chart date also shifted, so day and hour pillars were recalculated on the true solar boundary.'
                          : '보정 과정에서 날짜도 함께 이동해 일주와 시주를 진태양시 기준으로 다시 계산했습니다.')
                        : (language === 'en'
                          ? 'The chart time changed, but the calendar date stayed the same.'
                          : '보정으로 차트 시각만 바뀌고 날짜는 유지되었습니다.')}
                    </div>
                  </div>
                )}
              </div>

              {showPrecisionDetails && precisionMetadata && (
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    {copy.pillarLabel}
                  </div>
                  <div className="mt-1 text-lg text-starlight">{precisionMetadata.hourPillar}</div>
                  <div className="text-sm text-white/55">
                    {language === 'en'
                      ? 'This is the final hour pillar after true solar time was applied.'
                      : '진태양시 보정까지 반영한 최종 시주입니다.'}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                  {copy.scopeLabel}
                </div>
                <div className="mt-1 text-lg text-starlight">
                  {showPrecisionDetails
                    ? (oracleCouncil ? `${oracleCouncil.convergenceScore}/100` : '-- / 100')
                    : copy.scopePending}
                </div>
                <div className="text-sm text-white/55">
                  {showPrecisionDetails
                    ? (oracleCouncil
                      ? (language === 'en' ? 'ziwei and natal layers now synchronized' : '자미두수와 점성 레이어가 동기화되었습니다')
                      : copy.scopePending)
                    : (language === 'en' ? 'kept intentionally simple until precise location is provided' : '정밀 위치 입력 전까지는 단순한 기준만 보여줍니다')}
                </div>
              </div>
            </div>
          </div>

          {!compact && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-white/65">
              {showPrecisionDetails && oracleCouncil
                ? oracleCouncil.ziweiSummary
                : copy.footerText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
