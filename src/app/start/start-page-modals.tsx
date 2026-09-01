'use client';

import dynamic from 'next/dynamic';
import type { ReadingData } from '@/components/reading/reading-input';
import type {
  PremiumReportState,
  ReadingMetadata,
  TarotSelection,
} from './start-page-helpers';

const PaymentModal = dynamic(() => import('@/components/payment/PaymentModal').then((mod) => mod.PaymentModal));
const ReviewModal = dynamic(() => import('@/components/review/ReviewModal').then((mod) => mod.ReviewModal));
const ShareCardModal = dynamic(() => import('@/components/share/ShareCardModal').then((mod) => mod.ShareCardModal));

type StartPageModalsProps = {
  readonly language: 'ko' | 'en';
  readonly isPaymentModalOpen: boolean;
  readonly isReviewOpen: boolean;
  readonly isShareModalOpen: boolean;
  readonly readingData: ReadingData | null;
  readonly selectedCards: readonly TarotSelection[];
  readonly reportData: PremiumReportState | null;
  readonly metadata?: ReadingMetadata;
  readonly isDecisionAccepted: boolean;
  readonly dynamicPrice: string;
  readonly trackingSource: string;
  readonly autoReferralCode?: string;
  readonly shareUrl?: string;
  readonly onClosePayment: () => void;
  readonly onCloseReview: () => void;
  readonly onCloseShare: () => void;
};

export function StartPageModals(props: StartPageModalsProps) {
  return (
    <>
      <PaymentModal
        isOpen={props.isPaymentModalOpen}
        onClose={props.onClosePayment}
        readingData={props.readingData ? { ...props.readingData, tarotCards: props.selectedCards, language: props.language } : undefined}
        currentReport={props.reportData}
        metadata={props.metadata}
        isDecisionAccepted={props.isDecisionAccepted}
        price={props.dynamicPrice}
        trackingSource={props.trackingSource}
        autoReferralCode={props.autoReferralCode}
      />
      <ReviewModal
        isOpen={props.isReviewOpen}
        onClose={props.onCloseReview}
        readingId={props.shareUrl?.split('/').pop()}
      />
      {props.reportData && (
        <ShareCardModal
          isOpen={props.isShareModalOpen}
          onClose={props.onCloseShare}
          title={props.reportData.summary?.title || (props.language === 'en' ? 'CosmicPath Decision Note' : '운명 의사결정 브리프')}
          matchLevel={getShareMatchLevel(props.reportData.summary?.trust_score || 94)}
          dayMaster={
            (props.metadata?.saju as { dayMaster?: string } | undefined)?.dayMaster ||
            props.reportData.traits?.find((t) => t.name.includes('일간'))?.name?.replace(/[^甲乙丙丁戊己庚辛壬癸]/g, '') ||
            '甲'
          }
          keywords={
            props.reportData.summary?.keywords && props.reportData.summary.keywords.length > 0
              ? props.reportData.summary.keywords.slice(0, 4)
              : [
                  `${new Date().getFullYear()}골든타임`,
                  props.reportData.traits?.[0]?.name?.replace(/[\s·]/g, '_') || '사주점성융합',
                  props.language === 'en' ? 'Optimal_Move' : '핵심승부수',
                  props.language === 'en' ? 'Convergence94%' : '교차합의율94%',
                ]
          }
          source={props.trackingSource}
          language={props.language}
          readingId={props.shareUrl?.split('/').pop()}
          resultType={props.reportData.free_focus?.decision_label}
        />
      )}
    </>
  );
}

function getShareMatchLevel(trustScore: number) {
  if (trustScore >= 80 || trustScore >= 4.5) return 'PERFECT';
  if (trustScore >= 60 || trustScore >= 3) return 'PARTIAL';

  return 'CONFLICT';
}
