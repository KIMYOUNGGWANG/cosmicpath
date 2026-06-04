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
          title={props.reportData.summary?.title || '내 리딩 결과'}
          trustScore={props.reportData.summary?.trust_score ? Math.round(props.reportData.summary.trust_score * 20) : 85}
          matchLevel={getShareMatchLevel(props.reportData.summary?.trust_score || 0)}
          keywords={props.reportData.summary?.keywords?.slice(0, 4) || ['타이밍', '변화', '선택']}
          userName={props.readingData?.name}
        />
      )}
    </>
  );
}

function getShareMatchLevel(trustScore: number) {
  if (trustScore >= 4.5) return 'PERFECT';
  if (trustScore >= 3) return 'PARTIAL';

  return 'CONFLICT';
}
