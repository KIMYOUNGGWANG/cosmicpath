'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import type { TarotSelection } from './start-page-helpers';

const TarotPicker = dynamic(() => import('@/components/reading/tarot-picker').then((mod) => mod.TarotPicker), {
  loading: () => <div className="flex justify-center py-20"><Skeleton className="h-72 w-full max-w-3xl" /></div>,
});

type StartTarotStageProps = {
  language: 'ko' | 'en';
  onSelect: (cards: TarotSelection[]) => void;
};

export function StartTarotStage(props: StartTarotStageProps) {
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
        <div className="mx-auto max-w-3xl rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(139,92,246,0.08),rgba(255,255,255,0.02))] px-6 py-8 backdrop-blur-xl">
          <h2 className="mb-4 text-3xl font-bold tracking-wide text-glow-purple md:text-4xl font-cinzel">
            {props.language === 'en' ? 'Choose The Cards Your Intuition Trusts' : '직관이 가장 먼저 닿는 카드 3장을 고르세요'}
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-tarot-purple/50 to-transparent mx-auto mb-6" />
          <p className="text-lg font-light italic tracking-wide text-white/70">
            {props.language === 'en'
              ? 'Pause for a breath. Pick the card that feels like your current path.'
              : '숨을 한 번 고르고, 지금 내 흐름과 가장 닿아 있는 카드를 선택해보세요.'}
          </p>
        </div>
      </div>

      <div className="relative">
        <TarotPicker
          onSelect={props.onSelect}
          maxCards={3}
          language={props.language}
        />
      </div>
    </motion.div>
  );
}
