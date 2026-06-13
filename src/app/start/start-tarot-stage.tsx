'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { INTAKE_SECTION_COPY } from '@/components/reading/intake/reception-copy';
import type { TarotSelection } from './start-page-helpers';

const TarotPicker = dynamic(() => import('@/components/reading/tarot-picker').then((mod) => mod.TarotPicker), {
  loading: () => <div className="flex justify-center py-20"><Skeleton className="h-72 w-full max-w-3xl" /></div>,
});

type StartTarotStageProps = {
  language: 'ko' | 'en';
  isNextMoveReportEntry?: boolean;
  isRelationshipContactEntry?: boolean;
  onSelect: (cards: TarotSelection[]) => void;
};

export function StartTarotStage(props: StartTarotStageProps) {
  const copy = INTAKE_SECTION_COPY[props.language];

  return (
    <motion.div
      key="tarot"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full max-w-5xl mx-auto px-4 py-16 md:px-6 md:py-20"
    >
      <div className="mb-12 text-center">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-[#d7c59a]/20 bg-[#121416]/92 px-6 py-8 shadow-[0_22px_70px_rgba(0,0,0,0.2)]">
          <h2 className="mb-4 font-cinzel text-3xl font-bold tracking-wide text-starlight md:text-4xl">
            {props.isNextMoveReportEntry
              ? copy.tarotLabel
              : (props.language === 'en' ? 'Choose The Cards Your Intuition Trusts' : '직관이 가장 먼저 닿는 카드 3장을 고르세요')}
          </h2>
          <div className="mx-auto mb-6 h-px w-24 bg-[#d7c59a]/45" />
          <p className="text-lg font-light italic tracking-wide text-white/70">
            {props.isNextMoveReportEntry
              ? (props.language === 'en'
                  ? props.isRelationshipContactEntry
                    ? 'Pick one card if you want a tarot immediate signal for the contact question, or skip and open the verdict from the question and birth date.'
                    : 'Pick one card if you want a tarot immediate signal for the decision question, or skip and open the verdict from the question and birth date.'
                  : props.isRelationshipContactEntry
                    ? '연락 질문에 타로 즉시 신호가 필요하면 카드 1장을 고르세요. 질문과 생년월일 기준으로 판정을 열 수 있습니다.'
                    : '결정 질문에 타로 즉시 신호가 필요하면 카드 1장을 고르세요. 질문과 생년월일 기준으로 판정을 열 수 있습니다.')
              : (props.language === 'en'
                  ? 'Pause for a breath. Pick the card that feels like your current path.'
                  : '숨을 한 번 고르고, 지금 내 흐름과 가장 닿아 있는 카드를 선택해보세요.')}
          </p>
          {props.isNextMoveReportEntry ? (
            <button
              type="button"
              onClick={() => props.onSelect([])}
              className="group mt-7 inline-grid min-h-[46px] grid-cols-[44px_minmax(0,1fr)_44px] items-center overflow-hidden border border-[#d7c59a]/32 bg-[#0d0e0f]/72 text-xs font-semibold uppercase tracking-[0.18em] text-[#d7c59a] shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:border-[#d7c59a]/58 hover:bg-[#d7c59a]/[0.08]"
            >
              <span className="border-r border-[#d7c59a]/18 text-[10px] text-[#d7c59a]/62">03</span>
              <span className="px-4">{props.language === 'en' ? 'Skip Tarot' : '타로 없이 판정 보기'}</span>
              <span className="border-l border-[#d7c59a]/18 transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative">
        <TarotPicker
          onSelect={props.onSelect}
          maxCards={props.isNextMoveReportEntry ? 1 : 3}
          language={props.language}
        />
      </div>
    </motion.div>
  );
}
