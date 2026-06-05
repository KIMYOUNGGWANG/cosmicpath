'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { RevealContainer } from '@/components/reading/RevealContainer';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReadingMetadata } from './start-page-helpers';

const OracleCalibrationPanel = dynamic(
  () => import('@/components/reading/OracleCalibrationPanel').then((mod) => mod.OracleCalibrationPanel),
  {
    loading: () => (
      <div className="flex w-full max-w-3xl justify-center py-8">
        <Skeleton className="h-[320px] w-full rounded-[28px]" />
      </div>
    ),
  }
);

type StartRevealStageProps = {
  language: 'ko' | 'en';
  loadingPhase: { phase: number; label: string };
  characterId?: string;
  precisionMetadata?: ReadingMetadata['precisionMetadata'];
  oracleCouncil?: ReadingMetadata['oracleCouncil'];
  hasPreciseBirthLocation: boolean;
  onReveal: () => void;
};

export function StartRevealStage(props: StartRevealStageProps) {
  return (
    <motion.div
      key="reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 md:px-6 md:py-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-cinzel text-starlight mb-4">
          {props.language === 'en' ? 'Your Note Is Ready' : '정리할 준비가 끝났습니다'}
        </h2>
        <p className="text-acc-gold/80 text-sm tracking-widest uppercase">
          {props.language === 'en' ? 'Tap to unseal your first direction' : '터치해서 첫 방향의 봉인을 풀어보세요'}
        </p>
      </div>

      <RevealContainer
        onReveal={props.onReveal}
        title={props.language === 'en' ? 'UNSEAL YOUR PATH' : '당신의 길을 열어보세요'}
      >
        <div className="flex h-full w-full items-center justify-center bg-[#0A0A0C] p-4">
          <OracleCalibrationPanel
            compact
            language={props.language}
            loadingLabel={props.language === 'en' ? 'Preparing your decision note...' : '결정 정리를 준비하는 중...'}
            loadingPhase={props.loadingPhase.phase}
            characterId={props.characterId}
            precisionMetadata={props.precisionMetadata}
            oracleCouncil={props.oracleCouncil}
            hasPreciseBirthLocation={props.hasPreciseBirthLocation}
          />
        </div>
      </RevealContainer>
    </motion.div>
  );
}
