'use client';

import { AnimatePresence } from 'framer-motion';
import type { ReadingData } from '@/components/reading/reading-input';
import type { UnifiedReadingResult } from '@/lib/cosmic/schema';
import { ProductShell } from '@/components/common/ProductShell';
import { Footer } from '@/components/landing/Footer';
import type { PremiumReportData } from '@/components/reading/premium-report';
import type {
  PremiumReportState,
  PremiumReportViewMetadata,
  ReadingMetadata,
  ReadingStep,
  TarotSelection,
} from './start-page-helpers';
import { StartInputStage } from './start-input-stage';
import { StartRevealStage } from './start-reveal-stage';
import { StartResultStage } from './start-result-stage';

type StartPageStagesProps = {
  readonly language: 'ko' | 'en';
  readonly step: ReadingStep;
  readonly hasCheckedResume: boolean;
  readonly shouldHideProductHeader: boolean;
  readonly isLoading: boolean;
  readonly loadingPhase: { phase: number; label: string };
  readonly searchPaid: boolean;
  readonly readingData: ReadingData | null;
  readonly inviterName?: string;
  readonly inviteCode?: string;
  readonly initialContext?: ReadingData['context'];
  readonly initialQuestion?: string;
  readonly initialScenarioA?: string;
  readonly initialScenarioB?: string;
  readonly landingSource: string;
  readonly isDecisionTimingEntry: boolean;
  readonly isNextMoveReportEntry: boolean;
  readonly metadata?: ReadingMetadata;
  readonly reportData: PremiumReportState | null;
  readonly hasPreciseBirthLocation: boolean;
  readonly unifiedResult: UnifiedReadingResult | null;
  readonly premiumReportData: PremiumReportData | null;
  readonly premiumReportMetadata?: PremiumReportViewMetadata;
  readonly shareUrl?: string;
  readonly isPremium: boolean;
  readonly hasPaidQuery: boolean;
  readonly isInvitationMode: boolean;
  readonly dynamicPrice: string;
  readonly streamContent: string;
  readonly onLanguageChange: (value: 'ko' | 'en') => void;
  readonly onInputSubmit: (data: ReadingData) => void;
  readonly onTarotComplete: (cards: TarotSelection[]) => void;
  readonly onRevealComplete: () => void;
  readonly onInviteOwner: () => Promise<void>;
  readonly onInviteUpsell: () => Promise<void>;
  readonly onShareCard: () => void;
  readonly onUnlock: () => Promise<void>;
  readonly onRetryPremium: () => void;
  readonly onRetryFree: () => void;
  readonly onReturnToInput: () => void;
  readonly onRematchGuide: (targetGuideId: string) => void;
};

export function StartPageStages(props: StartPageStagesProps) {
  return (
    <ProductShell
      language={props.language}
      showBackButton={props.step === 'input' || props.step === 'result' || props.step === 'tarot'}
      showHeader={!props.shouldHideProductHeader}
    >
      {!props.hasCheckedResume && <StartPageResumeLoading {...props} />}
      <AnimatePresence mode="wait">
        {props.hasCheckedResume && props.step === 'input' && (
          <StartInputStage
            language={props.language}
            initialData={
              props.readingData
                ? props.readingData
                : (props.initialScenarioA || props.initialScenarioB
                    ? { scenarioA: props.initialScenarioA, scenarioB: props.initialScenarioB }
                    : undefined)
            }
            isLoading={props.isLoading}
            inviterName={props.inviterName}
            inviteCode={props.inviteCode}
            initialContext={props.initialContext}
            initialQuestion={props.initialQuestion}
            landingSource={props.landingSource}
            onLanguageChange={props.onLanguageChange}
            onSubmit={props.onInputSubmit}
          />
        )}
        {(props.step === 'tarot' || props.step === 'reveal') && (
          <StartRevealStage
            language={props.language}
            loadingPhase={props.loadingPhase}
            characterId={props.readingData?.characterId}
            precisionMetadata={props.metadata?.precisionMetadata ?? props.reportData?.precisionMetadata}
            oracleCouncil={props.metadata?.oracleCouncil ?? props.reportData?.oracleCouncil}
            hasPreciseBirthLocation={props.hasPreciseBirthLocation}
            onReveal={props.onRevealComplete}
          />
        )}
        {props.step === 'result' && (
          <StartResultStage
            language={props.language}
            isLoading={props.isLoading}
            loadingPhase={props.loadingPhase}
            metadata={props.metadata}
            reportData={props.reportData}
            readingData={props.readingData}
            hasPreciseBirthLocation={props.hasPreciseBirthLocation}
            unifiedResult={props.unifiedResult}
            premiumReportData={props.premiumReportData}
            premiumReportMetadata={props.premiumReportMetadata}
            shareUrl={props.shareUrl}
            isPremium={props.isPremium}
            hasPaidQuery={props.hasPaidQuery}
            isInvitationMode={props.isInvitationMode}
            dynamicPrice={props.dynamicPrice}
            landingSource={props.landingSource}
            streamContent={props.streamContent}
            onInviteOwner={props.onInviteOwner}
            onInviteUpsell={props.onInviteUpsell}
            onShareCard={props.onShareCard}
            onUnlock={props.onUnlock}
            onRetryPremium={props.onRetryPremium}
            onRetryFree={props.onRetryFree}
            onReturnToInput={props.onReturnToInput}
            onRematchGuide={props.onRematchGuide}
          />
        )}
      </AnimatePresence>
      <Footer language={props.language} />
    </ProductShell>
  );
}

function StartPageResumeLoading(props: Pick<StartPageStagesProps, 'language' | 'searchPaid'>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative z-20">
      <div className="w-12 h-12 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-white/60 text-sm animate-pulse tracking-widest font-cinzel">
        {props.searchPaid
          ? (props.language === 'en' ? 'PAYMENT VERIFIED! PREPARING DETAILED NOTE...' : '결제 확인 완료! 자세한 노트를 준비 중입니다...')
          : (props.language === 'en' ? 'PREPARING YOUR READING...' : '리딩을 준비하는 중...')}
      </p>
    </div>
  );
}
