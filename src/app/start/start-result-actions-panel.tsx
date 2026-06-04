'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ReadingData } from '@/components/reading/reading-input';
import {
  ORACLE_CHARACTER_IDS,
  getOraclePersona,
  getRecommendedOracleCharacterId,
  inferQuestionIntent,
  getOracleIntentLabel,
  type OracleCharacterId,
  type OracleRecommendationContext,
} from '@/lib/ai/oracle-personas';

type GuideRematchCardProps = {
  readingData: ReadingData;
  isPremium: boolean;
  language: 'ko' | 'en';
  onRematchGuide: (id: string) => void;
};

export function GuideRematchCard(props: GuideRematchCardProps) {
  const isEn = props.language === 'en';
  const [selectedGuideId, setSelectedGuideId] = useState<OracleCharacterId | null>(null);
  const questionIntent = inferQuestionIntent({
    context: props.readingData.context as OracleRecommendationContext | null | undefined,
    question: props.readingData.question,
    partnerBirthDate: props.readingData.partnerBirthDate,
    partnerName: props.readingData.partnerName,
  });
  const currentGuideId = props.readingData.characterId as OracleCharacterId;
  const recommendedId = getRecommendedOracleCharacterId({
    context: props.readingData.context as OracleRecommendationContext | null | undefined,
    question: props.readingData.question,
    questionIntent,
  });
  const alternatives = ORACLE_CHARACTER_IDS
    .filter((id) => id !== currentGuideId)
    .map((id) => {
      const persona = getOraclePersona(id);
      let score = 0;
      if (id === recommendedId) score += 6;
      if (persona.specialty === questionIntent) score += 4;
      return { id, persona, score };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 2);

  if (alternatives.length === 0) return null;

  const targetId = selectedGuideId ?? alternatives[0].id;
  const targetPersona = getOraclePersona(targetId);

  return (
    <div className="mt-6 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.05),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.26em] text-white/38">
        {isEn ? 'Another perspective' : '다른 관점으로도 읽어드릴 수 있어요'}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/65">
        {isEn
          ? 'The same question can reveal different angles with a different guide.'
          : '같은 질문도 가이드에 따라 다른 면이 보입니다.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {alternatives.map(({ id, persona }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedGuideId(id as OracleCharacterId)}
            className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-200 ${
              targetId === id
                ? 'border-acc-gold/40 bg-acc-gold/10 text-acc-gold'
                : 'border-white/12 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white'
            }`}
          >
            {persona.name}
            <span className="ml-1.5 text-[10px] opacity-60">
              {isEn ? getOracleIntentLabel(persona.specialty, 'en') : getOracleIntentLabel(persona.specialty, 'ko')}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
          {isEn ? targetPersona.titleEn : targetPersona.titleKo}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/68">
          {isEn ? targetPersona.strengthsEn[0] : targetPersona.strengthsKo[0]}
        </p>
      </div>
      <button
        type="button"
        onClick={() => props.onRematchGuide(targetId)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/15 bg-white/[0.04] px-5 py-3 text-[12px] uppercase tracking-[0.22em] text-white/78 transition-all duration-300 hover:border-acc-gold/30 hover:bg-acc-gold/5 hover:text-acc-gold"
      >
        <span>
          {props.isPremium
            ? (isEn ? `Re-read with ${targetPersona.name}` : `${targetPersona.name}(으)로 다시 보기`)
            : (isEn ? `See full reading with ${targetPersona.name}` : `${targetPersona.name} 관점으로 전체 읽기`)}
        </span>
        <ChevronRight size={14} />
      </button>
      {!props.isPremium && (
        <p className="mt-2 text-center text-[10px] text-white/30">
          {isEn ? 'Premium required · Unlock once to read all guides' : '프리미엄 필요 · 한 번 결제로 전체 가이드 관점 열림'}
        </p>
      )}
    </div>
  );
}
