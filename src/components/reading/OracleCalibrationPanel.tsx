'use client';

import { motion } from 'framer-motion';
import { getOraclePersona } from '@/lib/ai/oracle-personas';

interface OracleCalibrationPanelProps {
  language: 'ko' | 'en';
  loadingLabel?: string;
  loadingPhase?: number;
  characterId?: string;
  precisionMetadata?: {
    inputDate: string;
    inputTime: string;
    tstOffset: number;
    correctedDate: string;
    correctedTime: string;
    lon: number;
    hourPillar: string;
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
      '타로 · 별자리 확인',
      '첫 결과 구성',
    ],
    en: [
      'Question Framing',
      'Saju Alignment',
      'Tarot + Astrology Cross-check',
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
      label: 'Oracle Calibration',
      pendingTitle: 'Aligning Your Cosmic Coordinates',
      readyTitle: 'True Solar Time Locked',
      loadingText: 'Rebalancing chart time, personality layer, and tri-oracle convergence.',
      snapshotLabel: 'Calibration Snapshot',
      guideLabel: 'Selected Oracle Guide',
      timingLabel: 'True Solar Time',
      timingPending: 'awaiting longitude correction',
      timingExplainLabel: 'Input time → chart time',
      pillarLabel: 'Final Hour Pillar',
      scopeLabel: 'Oracle Convergence',
      scopePending: 'synchronizing ziwei and natal layers',
      footerText: 'Your chart is being recalculated with local longitude, true solar time, and tri-oracle synthesis.',
    },
  },
  basic: {
    ko: {
      label: '리딩 준비 중',
      pendingTitle: '질문에 맞는 결과를 정리하는 중',
      readyTitle: '핵심 결과 정리 완료',
      loadingText: '질문, 사주, 타로, 별자리 신호를 같이 확인하고 있습니다.',
      snapshotLabel: '리딩 요약',
      guideLabel: '현재 가이드',
      timingLabel: '해석 기준',
      timingPending: '출생지 입력이 없어 위치 기반 보정은 전면 노출하지 않습니다',
      timingExplainLabel: '입력 기준',
      pillarLabel: '시주',
      scopeLabel: '분석 범위',
      scopePending: '사주 · 점성술 · 타로',
      footerText: '출생지 정보가 없으면 입력한 생년월일시를 기준으로 먼저 리딩을 정리합니다.',
    },
    en: {
      label: 'Oracle Reading',
      pendingTitle: 'Preparing Your Oracle Reading',
      readyTitle: 'Core Reading Prepared',
      loadingText: 'Cross-checking saju, astrology, and tarot signals for your report.',
      snapshotLabel: 'Reading Snapshot',
      guideLabel: 'Current Oracle Guide',
      timingLabel: 'Reading Basis',
      timingPending: 'no birth location was provided, so location-based precision is not surfaced here',
      timingExplainLabel: 'Input basis',
      pillarLabel: 'Hour Pillar',
      scopeLabel: 'Analysis Scope',
      scopePending: 'saju · astrology · tarot',
      footerText: 'No birth location was provided, so we keep this screen honest and base the reading on the time you entered plus cross-system synthesis.',
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

export function OracleCalibrationPanel({
  language,
  loadingLabel,
  loadingPhase = 0,
  characterId,
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
  const hasDateShift = Boolean(
    precisionMetadata && precisionMetadata.inputDate !== precisionMetadata.correctedDate
  );
  const containerSize = compact
    ? 'w-full max-w-md p-6'
    : showPrecisionDetails
      ? 'w-full max-w-3xl p-8 md:p-10'
      : 'w-full max-w-2xl p-6 md:p-8';

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
            <p className="text-sm leading-relaxed text-white/70">
              {loadingLabel || copy.loadingText}
            </p>
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
