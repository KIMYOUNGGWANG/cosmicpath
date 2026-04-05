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
      '출생 좌표 정렬',
      '진태양시 보정',
      '사주 원국 재계산',
      '자미 · 점성 합일',
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
      '질문 흐름 정리',
      '사주 해석 정렬',
      '타로 · 점성 교차 확인',
      '최종 리포트 구성',
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
      label: 'Oracle Calibration',
      pendingTitle: '우주 좌표를 정밀 정렬하는 중',
      readyTitle: '진태양시 보정 완료',
      loadingText: '차트 시간, 페르소나 톤, 삼중 오라클 수렴도를 다시 조율하고 있습니다.',
      snapshotLabel: 'Calibration Snapshot',
      guideLabel: '선택한 오라클 가이드',
      timingLabel: '진태양시',
      timingPending: '경도 보정 대기 중',
      timingExplainLabel: '입력 시각 → 적용 시각',
      pillarLabel: '최종 시주',
      scopeLabel: '오라클 수렴도',
      scopePending: '자미두수와 점성 레이어를 동기화하는 중',
      footerText: '출생 경도, 진태양시, 삼중 오라클 합성 기준으로 차트를 다시 계산하고 있습니다.',
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
      label: 'Oracle Reading',
      pendingTitle: '리딩 흐름을 정리하는 중',
      readyTitle: '핵심 리딩 정리 완료',
      loadingText: '사주, 점성술, 타로 흐름을 교차 확인하며 리포트를 정리하고 있습니다.',
      snapshotLabel: 'Reading Snapshot',
      guideLabel: '현재 오라클 가이드',
      timingLabel: '해석 기준',
      timingPending: '출생지 입력이 없어 위치 기반 보정은 전면 노출하지 않습니다',
      timingExplainLabel: '입력 기준',
      pillarLabel: '시주',
      scopeLabel: '분석 범위',
      scopePending: '사주 · 점성술 · 타로',
      footerText: '출생지 정보가 없어 위치 기반 진태양시 보정은 UI에 드러내지 않고, 입력한 생년월일시 기준으로 리딩을 정리하고 있습니다.',
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

      <div className={`relative z-10 ${compact ? 'space-y-5' : 'grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'}`}>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-acc-gold/80">
                {copy.label}
              </p>
              <h3 className={`${compact ? 'text-xl' : 'text-2xl md:text-3xl'} font-cinzel text-starlight`}>
                {hasPrecision && showPrecisionDetails ? copy.readyTitle : copy.pendingTitle}
              </h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/55">
              {showPrecisionDetails ? persona.name : (language === 'en' ? 'Oracle Read' : '오라클 리딩')}
            </div>
          </div>

          <div className="relative flex items-center justify-center py-6">
            <motion.div
              className="absolute h-40 w-40 rounded-full border border-acc-gold/20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            />
            <motion.div
              className="absolute h-28 w-28 rounded-full border border-sky-300/20"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            />
            <motion.div
              className="absolute h-16 w-16 rounded-full bg-acc-gold/10 blur-xl"
              animate={{ scale: [0.88, 1.08, 0.88], opacity: [0.45, 0.9, 0.45] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            />
            <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full border border-white/10 bg-black/30 px-3 text-center">
              <div className="font-cinzel text-base tracking-[0.16em] text-starlight">
                {persona.name}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/40">
                {showPrecisionDetails
                  ? persona.title
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
                  <span className="text-sm tracking-[0.08em]">{stage}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
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
                    ? persona.title
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
