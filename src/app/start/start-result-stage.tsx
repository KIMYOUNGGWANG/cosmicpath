'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import type { UnifiedReadingResult } from '@/lib/cosmic/schema';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportData } from '@/components/reading/premium-report';
import type {
  PremiumReportState,
  PremiumReportViewMetadata,
  ReadingMetadata,
  TarotSelection,
} from './start-page-helpers';

const PremiumReport = dynamic(() => import('@/components/reading/premium-report').then((mod) => mod.PremiumReport), {
  loading: () => <div className="flex justify-center py-20"><Skeleton className="h-96 w-full" /></div>,
});
const ChatInterface = dynamic(() => import('@/components/oracle-chat/ChatInterface').then((mod) => mod.ChatInterface), {
  loading: () => <Skeleton className="h-48 w-full" />,
});
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
const UnifiedReadingDisplay = dynamic(
  () => import('@/components/cosmic/UnifiedReadingDisplay').then((mod) => mod.UnifiedReadingDisplay),
  {
    loading: () => <Skeleton className="h-[420px] w-full rounded-[32px]" />,
  }
);

type StartResultStageProps = {
  language: 'ko' | 'en';
  isLoading: boolean;
  loadingPhase: { phase: number; label: string };
  metadata?: ReadingMetadata;
  reportData: PremiumReportState | null;
  readingData: ReadingData | null;
  hasPreciseBirthLocation: boolean;
  unifiedResult: UnifiedReadingResult | null;
  premiumReportData: PremiumReportData | null;
  premiumReportMetadata?: PremiumReportViewMetadata;
  shareUrl?: string;
  isPremium: boolean;
  hasPaidQuery: boolean;
  isInvitationMode: boolean;
  dynamicPrice: string;
  streamContent: string;
  onInviteOwner: () => Promise<void>;
  onInviteUpsell: () => Promise<void>;
  onShareCard: () => void;
  onUnlock: () => Promise<void>;
  onRetryPremium: () => void;
  onRetryFree: () => void;
  onReturnToInput: () => void;
};

export function StartResultStage(props: StartResultStageProps) {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {props.isLoading ? (
        <div className="flex min-h-[420px] items-center justify-center px-4 py-12 md:min-h-[500px] md:py-16">
          <OracleCalibrationPanel
            language={props.language}
            loadingLabel={props.loadingPhase.label || (props.language === 'en' ? 'Preparing your reading...' : '리딩을 정리하는 중...')}
            loadingPhase={props.loadingPhase.phase}
            characterId={props.metadata?.characterId ?? props.readingData?.characterId}
            precisionMetadata={props.metadata?.precisionMetadata ?? props.reportData?.precisionMetadata}
            oracleCouncil={props.metadata?.oracleCouncil ?? props.reportData?.oracleCouncil}
            hasPreciseBirthLocation={props.hasPreciseBirthLocation}
          />
        </div>
      ) : props.reportData && props.reportData.summary ? (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 py-10 pt-24 md:py-12 md:pt-32">
          <ErrorBoundary>
            <div className="mb-8 px-4 md:px-0">
              {props.unifiedResult ? <UnifiedReadingDisplay result={props.unifiedResult} /> : null}

              <div className="mt-8 flex flex-col items-center gap-4">
                {(props.isPremium || props.hasPaidQuery) && !props.isInvitationMode && (
                  <button
                    onClick={() => {
                      void props.onInviteOwner();
                    }}
                    className="group relative overflow-hidden rounded-[20px] bg-gradient-to-r from-acc-gold to-[#F59E0B] px-8 py-4 font-bold text-bg-void shadow-[0_14px_32px_rgba(212,175,55,0.14)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,175,55,0.28)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70"
                  >
                    <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-500 group-hover:translate-y-0" />
                    <div className="relative flex items-center gap-2">
                      <span className="font-cinzel tracking-wider">
                        {props.language === 'en' ? 'Send Reading Invite' : '친구 초대 링크 복사하기'}
                      </span>
                    </div>
                  </button>
                )}

                {props.isInvitationMode && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md rounded-[26px] border border-acc-gold/30 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 text-center backdrop-blur-xl">
                    <div className="mb-2 text-xs font-bold uppercase tracking-widest text-acc-gold">
                      {props.language === 'en' ? 'Reading Invitation' : '리딩 초대'}
                    </div>
                    <h3 className="mb-4 text-lg leading-relaxed text-white font-cinzel">
                      {props.language === 'en'
                        ? 'Ready to open your own oracle path?'
                        : `방금 본 결과, 꽤 잘 맞았나요?\n이제 내 질문도 직접 읽어보세요.`}
                    </h3>
                    <button
                      onClick={() => {
                        void props.onInviteUpsell();
                      }}
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 font-bold text-starlight transition-[transform,background-color,border-color,color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-acc-gold hover:text-bg-void hover:shadow-[0_16px_32px_rgba(212,175,55,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70"
                    >
                      {props.language === 'en' ? 'Open My Decision Reading (30% OFF)' : '내 질문도 직접 보기 (30% 할인)'}
                    </button>
                  </div>
                )}

                <button
                  onClick={props.onShareCard}
                  className="flex items-center gap-2 px-6 py-3 text-dim transition-[transform,color] duration-300 hover:-translate-y-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="border-b border-transparent text-sm transition-colors hover:border-white/50">
                    {props.language === 'en' ? 'Save Result Card' : '결과 카드 저장하기'}
                  </span>
                </button>
              </div>
            </div>

            {props.premiumReportData ? (
              <PremiumReport
                report={props.premiumReportData}
                metadata={props.premiumReportMetadata}
                language={props.language}
                shareUrl={props.shareUrl}
                onUnlock={() => {
                  void props.onUnlock();
                }}
                isPremium={props.isPremium}
                price={props.dynamicPrice}
                isLoading={props.isLoading}
                onRetry={props.onRetryPremium}
                userQuestion={props.readingData?.question}
              />
            ) : null}

            {props.shareUrl ? (
              <div className="container relative z-10 mx-auto mt-12 mb-20 px-4">
                <ChatInterface readingId={props.shareUrl.split('/').pop()!} />
              </div>
            ) : null}
          </ErrorBoundary>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card mx-auto my-20 max-w-lg border-red-500/20 p-12 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <span className="text-3xl italic text-red-400 font-cinzel">!</span>
          </div>
          <h3 className="mb-4 text-xl text-red-200 font-cinzel">
            {props.language === 'en' ? 'Analysis Interrupted' : '결과를 불러오지 못했어요'}
          </h3>
          <p className="mb-6 text-sm font-light leading-relaxed text-gray-400">
            {props.streamContent || (props.language === 'en'
              ? 'The cosmic alignment was too complex to process at this moment.'
              : '지금은 결과를 끝까지 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')}
          </p>
          <div className="flex flex-col items-center justify-center gap-3">
            {(props.isPremium || props.hasPaidQuery) ? (
              <button
                onClick={props.onRetryPremium}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all hover:brightness-110"
              >
                <RefreshCw size={16} />
                {props.language === 'en' ? 'Retry Analysis' : '분석 이어서 진행하기'}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={props.onRetryFree}
                  className="btn-primary flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all hover:brightness-110"
                >
                  <RefreshCw size={16} />
                  {props.language === 'en' ? 'Retry Reading' : '리딩 다시 시도하기'}
                </button>
                <button
                  onClick={props.onReturnToInput}
                  className="btn-secondary px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all hover:bg-white/5"
                >
                  {props.language === 'en' ? 'Back To My Inputs' : '작성한 내용 다시 보기'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
