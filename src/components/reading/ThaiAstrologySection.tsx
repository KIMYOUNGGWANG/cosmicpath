'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldAlert, Compass, Sun, Moon, Crown, Award, ChevronRight } from 'lucide-react';
import type { ThaiAstrologyResult } from '@/lib/engines/thai-astrology';

interface ThaiAstrologySectionProps {
  data: ThaiAstrologyResult;
  language?: 'ko' | 'en';
}

export function ThaiAstrologySection({
  data,
  language = 'ko',
}: ThaiAstrologySectionProps) {
  if (!data) return null;

  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'persona' | 'timeline' | 'thaksa' | 'dual' | 'prescription'>('persona');

  const dayDeity = data.dayDeity || {
    dayId: 'monday' as const,
    nameKo: '월요일 (완 찬)',
    nameTh: 'วันจันทร์ (Wan Chan)',
    rulerPlanetKo: '달 (프라 찬)',
    rulerPlanetEn: 'Moon',
    sacredColorKo: '카나리아 옐로우 (노란색)',
    sacredColorHex: '#FBBF24',
    buddhaPostureKo: '평화를 권고하는 불상 (파앙 햄 얏)',
    baseTemperamentKo: '타인의 감정을 읽는 뛰어난 직관력, 부드러운 친화력, 환경 적응력',
  };

  const siriPlanet = data.siriPlanet || {
    role: 'siri' as const,
    nameKo: '시리 (최대 축복/부)',
    nameTh: 'ศรี',
    descriptionKo: '인생 최고의 행운, 매력, 재정적 축복, 막힌 운을 뚫는 열쇠',
    planetKo: '토성 (프라 사오)',
    colorKo: '로열 퍼플 (보라색)',
  };

  const kalakiniPlanet = data.kalakiniPlanet || {
    role: 'kalakini' as const,
    nameKo: '칼라키니 (금기/파괴)',
    nameTh: 'กาลกิณี',
    descriptionKo: '가장 경계해야 할 손실 트리거, 갈등의 원인, 피해야 할 행동',
    planetKo: '태양 (프라 아팃)',
    colorKo: '루비 레드 (붉은색)',
  };

  const currentCycle = data.currentMahaThaksaCycle || {
    primaryRulerKo: '수성 대운',
    rulerYears: 17,
    startAge: 23,
    endAge: 40,
    isSiriPeriod: false,
    isKalakiniPeriod: false,
    strategicAdviceKo: '현재 수성 대운의 흐름 속에서 지식과 계약을 견고히 다지는 시기입니다.',
  };

  const thaksaMatrix = data.thaksaMatrix || [];

  const dualSynthesis = data.dualAstrologySynthesis || {
    tropicalArchetype: '내면의 열망과 의식적 자아: 사자자리',
    siderealArchetype: '현실에서의 구체적 발현 방식: 게자리',
    integratedPersona: '사자자리의 내면적 주도권과 열망이 현실에서는 게자리의 체계적이고 보호적인 시스템 구축력으로 발현됩니다.',
    timingConvergenceAdvice: '수성 대운의 흐름 속에서 내면의 직관과 현실의 타이밍이 공명하고 있습니다.',
  };

  const prescription = data.protectionPrescription || {
    luckyColors: ['로열 퍼플 (보라색)', '카나리아 옐로우 (노란색)'],
    luckyDirectionKo: '동북쪽 및 서쪽 (시리 행성 방위)',
    forbiddenColorKo: '루비 레드 (붉은색)',
    avoidActionAdviceKo: '자존심을 앞세운 감정적 대립이나 붉은색 계열의 무리한 투자는 손실을 부를 수 있으니 신중을 기하세요.',
    goldenActionAdviceKo: '로열 퍼플 계열의 에너지를 활용하고, 지식 및 시스템 협업을 강화할 때 최고의 성과가 열립니다.',
  };

  const tanulak = data.tanulak || {
    planetKo: '화성 (프라 앙칸)',
    planetTh: '๓',
    signKo: data.siderealAscendant?.sign?.nameKo || '전갈자리',
    house: 11,
    dignityKo: '마하짝 (부딪치며 성장)',
    outerPersonaKo: '눈빛이 깊고 감정 표현을 아끼며, 주도권과 승부욕을 품고 있어 남들에게 만만해 보이지 않는 묵직한 카리스마를 발산합니다.',
  };

  const tanuset = data.tanuset || {
    planetKo: '달 (프라 찬)',
    planetTh: '๒',
    signKo: data.siderealMoon?.sign?.nameKo || '염소자리',
    house: 3,
    dignityKo: '쁘라 (유연/적응)',
    innerSoulKo: '겉모습과 달리 내면은 매우 섬세하며, 감정적 안정과 생활 기반이 명확히 확보되어야 비로소 편안함과 추진력을 얻는 신중한 설계자입니다.',
  };

  const personaGap = data.personaGap || {
    outerViewKo: '남들이 보는 당신: 결단력 있고 당차며, 어떤 위기에도 흔들림 없이 돌파구를 열어젖히는 리더이자 승부사',
    innerRealityKo: '혼자 있을 때의 당신: 사소한 말 한마디도 깊게 곱씹으며, 마음과 생활 기반이 완벽히 안정되어야 진짜 능력이 발휘되는 섬세한 감수성',
    synergyAdviceKo: '남들이 기대하는 거침없는 대외적 페르소나에 쫓겨 조급히 결단하지 말고, 내면의 신중한 리듬을 지켜 충분한 서류 검토와 안전장치를 마련한 후 움직이십시오.',
  };

  const timeline = (data.mahaThaksaTimeline && data.mahaThaksaTimeline.length > 0) ? data.mahaThaksaTimeline : [
    { planetKo: '달 대운', years: 15, startAge: 0, endAge: 15, roleNameKo: '보리완', roleType: 'normal' as const, score: 55, isCurrent: false, isPeak: false, themeKo: '정서적 안정과 삶의 기반을 다지는 성장기' },
    { planetKo: '화성 대운', years: 8, startAge: 15, endAge: 23, roleNameKo: '아유', roleType: 'normal' as const, score: 65, isCurrent: false, isPeak: false, themeKo: '목표 지향적 행동력과 신체적 활력을 분출하는 시기' },
    { planetKo: '수성 대운', years: 17, startAge: 23, endAge: 40, roleNameKo: '데시', roleType: 'dech' as const, score: 75, isCurrent: true, isPeak: false, themeKo: '사회적 명예, 지식, 권위와 계약 네트워크 확장기' },
    { planetKo: '토성 대운', years: 10, startAge: 40, endAge: 50, roleNameKo: '시리', roleType: 'siri' as const, score: 92, isCurrent: false, isPeak: true, themeKo: '인생 최대의 재물과 결실이 만개하는 10년 황금 번영기' },
    { planetKo: '목성 대운', years: 19, startAge: 50, endAge: 69, roleNameKo: '물라', roleType: 'normal' as const, score: 58, isCurrent: false, isPeak: false, themeKo: '새로운 확장보다 축적된 자산을 수성하는 지혜의 시기' },
    { planetKo: '라후 대운', years: 12, startAge: 69, endAge: 81, roleNameKo: '웃사하', roleType: 'normal' as const, score: 68, isCurrent: false, isPeak: false, themeKo: '불굴의 사업적 집념과 새로운 도전기' },
    { planetKo: '금성 대운', years: 21, startAge: 81, endAge: 102, roleNameKo: '몬트리', roleType: 'montri' as const, score: 82, isCurrent: false, isPeak: false, themeKo: '귀인과 후원자의 강력한 조력으로 도약하는 발전기' },
    { planetKo: '태양 대운', years: 6, startAge: 102, endAge: 108, roleNameKo: '칼라키니', roleType: 'kalakini' as const, score: 48, isCurrent: false, isPeak: false, themeKo: '무리한 확장 금지, 자산과 건강을 단단히 지키는 방어기' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#121626]/90 via-[#0B0F1D]/90 to-[#070913]/90 p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-cinzel tracking-widest text-[#D4AF37] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thai Royal Astrology • Maha Thaksa 108</span>
          </div>
          <h2 className="mt-1 text-2xl md:text-3xl font-cinzel font-bold text-white tracking-wide">
            {isEn ? 'Thai Royal Astrology & Maha Thaksa' : '태국 왕실 점성학 & 마하 탁사 108'}
          </h2>
          <p className="mt-1 text-xs md:text-sm text-white/60 font-light">
            {isEn
              ? 'Tanulak (Outer Persona) vs Tanuset (Inner Reality) combined with 108-year progression cycle.'
              : '탄누락(겉)과 탄누셋(속)의 심층 페르소나 대비 및 108년 마하 탁사 대운 정밀 로드맵.'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap rounded-full bg-white/5 p-1 border border-white/10 text-xs self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveTab('persona')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'persona'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {isEn ? 'Persona Gap' : '겉 vs 속 페르소나'}
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'timeline'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {isEn ? '108-Year Timeline' : '108년 대운 타임라인'}
          </button>
          <button
            onClick={() => setActiveTab('thaksa')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'thaksa'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {isEn ? '8 Attributes' : '8대 생애 속성'}
          </button>
          <button
            onClick={() => setActiveTab('dual')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'dual'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {isEn ? 'Dual Lens' : '내면 vs 현실'}
          </button>
          <button
            onClick={() => setActiveTab('prescription')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'prescription'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {isEn ? 'Prescription' : '개운 처방전'}
          </button>
        </div>
      </div>

      {/* Top Banner: Day of Week & Day Deity */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wan Kerd (Day of Week) */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider">
              {isEn ? 'Day of Birth (Wan Kerd)' : '출생 요일 (วันเกิด)'}
            </span>
            <span
              className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: dayDeity.sacredColorHex, color: dayDeity.sacredColorHex }}
            />
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-white">{dayDeity.nameKo}</h3>
            <p className="text-xs text-white/50">{dayDeity.nameTh}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-white/70">
            <p><span className="text-white/40">{isEn ? 'Ruler:' : '수호 행성:'}</span> {dayDeity.rulerPlanetKo}</p>
            <p className="mt-1"><span className="text-white/40">{isEn ? 'Sacred Color:' : '수호 색상:'}</span> {dayDeity.sacredColorKo}</p>
          </div>
        </div>

        {/* Siri (Supreme Blessing) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3" />
              {isEn ? 'Supreme Blessing (Siri)' : '인생 최대 축복성 (시리, ศรี)'}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-emerald-200">{siriPlanet.planetKo}</h3>
            <p className="text-xs text-emerald-400/70">{siriPlanet.nameKo}</p>
          </div>
          <p className="mt-4 pt-3 border-t border-emerald-500/10 text-xs text-emerald-200/80 leading-relaxed">
            {siriPlanet.descriptionKo}
          </p>
        </div>

        {/* Kalakini (Taboo Trigger) */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              {isEn ? 'Taboo / Loss Trigger (Kalakini)' : '절대 경계 행성 (칼라키니, กาลกิณี)'}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-rose-200">{kalakiniPlanet.planetKo}</h3>
            <p className="text-xs text-rose-400/70">{kalakiniPlanet.nameKo}</p>
          </div>
          <p className="mt-4 pt-3 border-t border-rose-500/10 text-xs text-rose-200/80 leading-relaxed">
            {kalakiniPlanet.descriptionKo}
          </p>
        </div>
      </div>

      {/* Tab 0: Persona Gap (Tanulak vs Tanuset) */}
      {activeTab === 'persona' && (
        <div className="mt-6 space-y-6">
          {/* Dual Card Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tanulak: Outer Persona */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" />
                    {isEn ? 'Tanulak (Outer Persona • Physical)' : '탄누락 (ตนุลัคน์ • 대외적 페르소나)'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    {tanulak.signKo} {tanulak.house}궁
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h4 className="text-xl font-bold text-white">{tanulak.planetKo}</h4>
                  <span className="text-xs text-amber-300/80 font-mono">({tanulak.planetTh})</span>
                </div>
                <div className="mt-1 text-xs text-[#D4AF37] font-medium">품위: {tanulak.dignityKo}</div>
                <p className="mt-3 text-xs md:text-sm text-white/80 leading-relaxed">
                  {tanulak.outerPersonaKo}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-500/20 text-[11px] text-amber-200/60">
                1궁 상승궁의 지배성으로 결정되는 첫인상, 신체적 추진력과 대외적 카리스마
              </div>
            </div>

            {/* Tanuset: Inner Reality */}
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5" />
                    {isEn ? 'Tanuset (Inner Reality • Soul)' : '탄누셋 (ตนุเศษ • 심층 본질 & 생존본능)'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    {tanuset.signKo} {tanuset.house}궁
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <h4 className="text-xl font-bold text-white">{tanuset.planetKo}</h4>
                  <span className="text-xs text-indigo-300/80 font-mono">({tanuset.planetTh})</span>
                </div>
                <div className="mt-1 text-xs text-indigo-300 font-medium">품위: {tanuset.dignityKo}</div>
                <p className="mt-3 text-xs md:text-sm text-white/80 leading-relaxed">
                  {tanuset.innerSoulKo}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-indigo-500/20 text-[11px] text-indigo-200/60">
                상승궁 지배성을 두 번 추적하여 도출하는 내면의 무의식적 의사결정 기준과 안전장치
              </div>
            </div>
          </div>

          {/* Persona Gap Analysis Box */}
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/15 via-white/[0.02] to-transparent p-5 md:p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>{isEn ? 'Persona Gap & Executive Resolution' : '페르소나 갭 대조 & 결단 지침'}</span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-amber-400 font-semibold block mb-1">대외적 모습</span>
                <p className="text-white/80 leading-relaxed">{personaGap.outerViewKo}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-indigo-400 font-semibold block mb-1">내면의 진실</span>
                <p className="text-white/80 leading-relaxed">{personaGap.innerRealityKo}</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25">
              <span className="text-[#D4AF37] text-xs font-bold block mb-1">황금률 의사결정 처방</span>
              <p className="text-xs md:text-sm text-white/90 leading-relaxed font-medium">
                {personaGap.synergyAdviceKo}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: 108-Year Maha Thaksa Timeline Roadmap */}
      {activeTab === 'timeline' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span>{isEn ? '108-Year Maha Thaksa 8 Life Cycles' : '108년 마하 탁사 8대 대운 로드맵'}</span>
            </h4>
            <span className="text-xs text-white/50">출생 요일 기준 108년 순환 주기</span>
          </div>

          <div className="space-y-3">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isCurrent
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]'
                    : item.isPeak
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      item.isCurrent ? 'bg-[#D4AF37] text-black' : item.isPeak ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-white'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{item.planetKo}</span>
                        <span className="text-xs text-white/50 font-mono">({item.years}년)</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                          item.roleType === 'siri'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : item.roleType === 'kalakini'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : item.roleType === 'dech'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : item.roleType === 'montri'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : 'bg-white/5 text-white/70 border-white/10'
                        }`}>
                          {item.roleNameKo}
                        </span>
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">
                        만 {item.startAge}세 ~ {item.endAge}세
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.isCurrent && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#D4AF37] text-black shadow">
                        현재 진행 중
                      </span>
                    )}
                    {item.isPeak && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> 인생 최대 황금기
                      </span>
                    )}
                    <div className="text-right font-mono text-sm font-bold text-[#D4AF37]">
                      {item.score}점
                    </div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="mt-3 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.roleType === 'siri'
                        ? 'bg-gradient-to-r from-emerald-400 to-[#D4AF37]'
                        : item.roleType === 'kalakini'
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-[#D4AF37]/60 to-[#D4AF37]'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>

                <p className="mt-2.5 text-xs text-white/70 leading-relaxed">
                  {item.themeKo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 1: Maha Thaksa 108 Cycle */}
      {activeTab === 'thaksa' && (
        <div className="mt-6 space-y-6">
          {/* Active Major Cycle Card */}
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/15 to-transparent p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  {isEn ? 'Current Active Planetary Cycle' : '현재 나이의 지배 대운'}
                </span>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                만 {currentCycle.startAge}세 ~ {currentCycle.endAge}세 ({currentCycle.rulerYears}년 주기)
              </span>
            </div>
            <h4 className="mt-3 text-xl md:text-2xl font-bold text-white">
              {currentCycle.primaryRulerKo}
              {currentCycle.isSiriPeriod && (
                <span className="ml-3 text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ★ 대발복 시리(Siri) 황금기
                </span>
              )}
              {currentCycle.isKalakiniPeriod && (
                <span className="ml-3 text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ⚠ 칼라키니 방어기
                </span>
              )}
            </h4>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              {currentCycle.strategicAdviceKo}
            </p>
          </div>

          {/* 8-Attribute Thaksa Matrix Table */}
          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              {isEn ? '8 Life Attributes Matrix (Thaksa Phra Khro)' : '8대 생애 속성 매트릭스 (탁사 프라 크로)'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {thaksaMatrix.map((item) => (
                <div
                  key={item.role}
                  className={`rounded-xl border p-3 text-xs transition-all ${
                    item.role === 'siri'
                      ? 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : item.role === 'kalakini'
                      ? 'border-rose-500/40 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                    <span>{item.nameTh}</span>
                    <span className={item.role === 'siri' ? 'text-emerald-400 font-bold' : item.role === 'kalakini' ? 'text-rose-400 font-bold' : 'text-[#D4AF37]'}>
                      {item.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-1.5 font-bold text-white">{item.nameKo}</div>
                  <div className="mt-1 text-[11px] text-[#D4AF37] font-medium">{item.planetKo}</div>
                  <p className="mt-2 text-[10px] text-white/60 line-clamp-2 leading-relaxed">
                    {item.descriptionKo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dual Astrology Lens (Inner vs Outer) */}
      {activeTab === 'dual' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Western Tropical Lens */}
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/15 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <Sun className="w-4 h-4" />
                <span>Western Tropical (내면 심리 엔진)</span>
              </div>
              <h4 className="mt-2 text-lg font-bold text-white">
                {dualSynthesis.tropicalArchetype}
              </h4>
              <p className="mt-3 text-xs md:text-sm text-indigo-200/80 leading-relaxed">
                계절 기준의 회귀황도대는 당신이 <strong>무엇을 진심으로 열망하고 어떤 내면적 자아를 지향하는지</strong>를 보여줍니다.
              </p>
            </div>

            {/* Thai Sidereal Lens */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Moon className="w-4 h-4" />
                <span>Thai Sidereal (현실 발현 궤적)</span>
              </div>
              <h4 className="mt-2 text-lg font-bold text-white">
                {dualSynthesis.siderealArchetype}
              </h4>
              <p className="mt-3 text-xs md:text-sm text-amber-200/80 leading-relaxed">
                실제 밤하늘 항성 기준(라히리 아야남샤 {data.ayanamsaDegrees ?? 23.76}°)은 당신의 열망이 <strong>세상과 부딪힐 때 어떤 방식으로 현실화되는지</strong>를 보여줍니다.
              </p>
            </div>
          </div>

          {/* Integrated Persona Box */}
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/10 via-white/[0.02] to-transparent p-5">
            <h4 className="text-sm font-cinzel font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isEn ? 'Dual Synthesis: Integrated Identity' : '듀얼 융합: 다층적 페르소나 총괄 결론'}
            </h4>
            <p className="mt-3 text-sm md:text-base text-white/90 leading-relaxed font-light">
              {dualSynthesis.integratedPersona}
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-[#D4AF37]/90 flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span>{dualSynthesis.timingConvergenceAdvice}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Protection & Golden Prescriptions */}
      {activeTab === 'prescription' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Golden Action Box */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>{isEn ? 'Golden Action Prescription' : '시리(Siri) 행운 촉진 행동'}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-white/60">행운의 색상:</span>
              <div className="flex gap-1.5">
                {prescription.luckyColors.map((color) => (
                  <span key={color} className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 font-medium">
                    {color}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-emerald-100/90 leading-relaxed">
              {prescription.goldenActionAdviceKo}
            </p>
          </div>

          {/* Taboo Avoidance Box */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>{isEn ? 'Kalakini Taboo Avoidance' : '칼라키니(Kalakini) 위험 방어 수칙'}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-white/60">기피 색상:</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/30 font-medium">
                {prescription.forbiddenColorKo}
              </span>
            </div>
            <p className="mt-4 text-sm text-rose-100/90 leading-relaxed">
              {prescription.avoidActionAdviceKo}
            </p>
          </div>
        </div>
      )}
    </motion.section>
  );
}
