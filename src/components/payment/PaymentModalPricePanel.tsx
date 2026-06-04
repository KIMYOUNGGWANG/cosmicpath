import { Skeleton } from '@/components/ui/skeleton';

interface PaymentModalPricePanelProps {
    readonly isEnglish: boolean;
    readonly dynamicPrice: string | null;
    readonly discountedPriceLabel: string | null;
    readonly displayedPriceLabel: string;
    readonly hasConcreteDisplayedPrice: boolean;
    readonly showPriceContractMismatch: boolean;
    readonly showPriceLoadingState: boolean;
    readonly showPriceFallbackCopy: boolean;
    readonly discount: number;
}

export function PaymentModalPricePanel({
    isEnglish,
    dynamicPrice,
    discountedPriceLabel,
    displayedPriceLabel,
    hasConcreteDisplayedPrice,
    showPriceContractMismatch,
    showPriceLoadingState,
    showPriceFallbackCopy,
    discount,
}: PaymentModalPricePanelProps) {
    return (
        <>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
                <p className="text-[10px] uppercase tracking-[0.26em] text-white/42">
                    {isEnglish ? 'Current Unlock Price' : '현재 전체 해석 가격'}
                </p>
                {showPriceContractMismatch ? (
                    <div className="mt-2 space-y-1">
                        <p className="text-sm font-semibold text-red-200">
                            {isEnglish ? 'Stripe price mismatch' : 'Stripe 가격 설정 불일치'}
                        </p>
                        <p className="text-xs leading-5 text-white/48">
                            {isEnglish
                                ? 'The live Stripe price does not match USD 9, so checkout is paused until the product is corrected.'
                                : '라이브 Stripe 가격이 USD 9와 일치하지 않아 상품 가격을 수정할 때까지 결제를 막았습니다.'}
                        </p>
                    </div>
                ) : discountedPriceLabel ? (
                    <div className="mt-2 flex items-center justify-center gap-3">
                        <span className="text-sm text-white/35 line-through">{dynamicPrice}</span>
                        <span className="text-xl font-bold text-acc-gold md:text-2xl">{discountedPriceLabel}</span>
                    </div>
                ) : hasConcreteDisplayedPrice ? (
                    <span className="mt-2 block text-xl font-bold text-acc-gold md:text-2xl">{displayedPriceLabel}</span>
                ) : (
                    <div className="mt-2 space-y-1">
                        <p className="text-sm font-semibold text-white/78">{displayedPriceLabel}</p>
                        <p className="text-xs text-white/42">
                            {isEnglish
                                ? 'We will confirm the final amount again in Stripe checkout.'
                                : '최종 금액은 Stripe 결제 단계에서 다시 정확히 보여드릴게요.'}
                        </p>
                    </div>
                )}
            </div>
            <div className="mt-3 min-h-10 space-y-2">
                {showPriceLoadingState ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-white/45">
                        <Skeleton className="h-2 w-14 rounded-full bg-white/10" />
                        <span>{isEnglish ? 'Syncing live Stripe price...' : 'Stripe 실시간 가격을 확인하는 중입니다.'}</span>
                    </div>
                ) : null}
                {showPriceFallbackCopy ? (
                    <p className="text-xs text-white/45">
                        {isEnglish
                            ? 'Live pricing is delayed, so the latest amount will be shown again in checkout.'
                            : '실시간 가격 확인이 지연되어 최신 금액은 결제 단계에서 다시 보여드립니다.'}
                    </p>
                ) : null}
                {discountedPriceLabel ? (
                    <p className="text-xs font-medium text-emerald-300">
                        {isEnglish ? `${discount}% discount applied.` : `${discount}% 할인 코드가 적용되었습니다.`}
                    </p>
                ) : null}
            </div>
        </>
    );
}
