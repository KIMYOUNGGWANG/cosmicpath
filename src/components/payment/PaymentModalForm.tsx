import { motion } from 'framer-motion';
import { PromoCodeInput } from './PromoCodeInput';

interface PaymentModalFormProps {
    readonly isEnglish: boolean;
    readonly isFreePromo: boolean;
    readonly email: string;
    readonly emailError: string | null;
    readonly isOpen: boolean;
    readonly isLoading: boolean;
    readonly discount: number;
    readonly resolvedAutoReferralCode: string | null;
    readonly isCheckoutPausedForPriceIssue: boolean;
    readonly onEmailChange: (value: string) => void;
    readonly onPromoApply: (id: string, discount: number, code: string) => void;
    readonly onPayment: () => void;
}

function checkoutButtonLabel({
    isEnglish,
    isLoading,
    isCheckoutPausedForPriceIssue,
    discount,
}: Pick<PaymentModalFormProps, 'isEnglish' | 'isLoading' | 'isCheckoutPausedForPriceIssue' | 'discount'>): string {
    if (isLoading) return isEnglish ? 'Processing...' : '처리 중...';
    if (isCheckoutPausedForPriceIssue) return isEnglish ? 'Checkout paused' : '결제 일시 중지';
    if (discount === 100) return isEnglish ? 'Open Decision Timing for Free' : '무료로 결정 타이밍 열기';
    return isEnglish ? 'Open Evidence, Timing, Action' : '근거·타이밍·행동 순서 열기';
}

export function PaymentModalForm({
    isEnglish,
    isFreePromo,
    email,
    emailError,
    isOpen,
    isLoading,
    discount,
    resolvedAutoReferralCode,
    isCheckoutPausedForPriceIssue,
    onEmailChange,
    onPromoApply,
    onPayment,
}: PaymentModalFormProps) {
    const disabled = isLoading || isCheckoutPausedForPriceIssue;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.14 }}
                className="mb-6"
            >
                <label className="mb-3 ml-1 block text-xs font-semibold uppercase tracking-widest text-acc-gold">
                    {isEnglish ? 'Email for your result link' : '결과 링크를 받아볼 이메일'}
                    {isFreePromo ? <span className="ml-1 text-red-400">*</span> : <span className="ml-2 text-white/30 normal-case">(optional)</span>}
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder={isFreePromo
                        ? 'name@example.com'
                        : (isEnglish ? 'Optional: get your result link by email' : '선택: 결과 링크를 이메일로 받기')}
                    className={`w-full rounded-2xl border bg-white/5 px-5 py-4 font-light text-white placeholder:text-gray-600 transition-[border-color,box-shadow,background-color] focus:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/40 ${emailError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-white/10 focus:border-acc-gold/50 hover:border-white/15 hover:bg-white/[0.06]'
                    }`}
                />
                {emailError ? <p className="ml-1 mt-2 animate-pulse text-xs text-red-400">{emailError}</p> : null}
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.18 }}
                className="mb-8"
            >
                <PromoCodeInput
                    email={email}
                    initialCode={resolvedAutoReferralCode || undefined}
                    autoApply={isOpen}
                    onApply={onPromoApply}
                    disabled={isLoading}
                />
            </motion.div>
            <motion.button
                onClick={onPayment}
                disabled={disabled}
                whileHover={disabled ? undefined : { y: -2, boxShadow: discount === 100 ? '0 18px 44px rgba(16,185,129,0.28)' : '0 18px 44px rgba(212,175,55,0.28)' }}
                whileTap={disabled ? undefined : { scale: 0.985 }}
                className={`w-full rounded-2xl py-4 font-bold transition-all shadow-lg hover:opacity-90 disabled:opacity-50 ${discount === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-acc-gold via-[#f0c35c] to-[#d88b16] text-black shadow-acc-gold/30'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-acc-gold/60`}
            >
                {checkoutButtonLabel({ isEnglish, isLoading, isCheckoutPausedForPriceIssue, discount })}
            </motion.button>
            <p className="mt-4 text-center text-xs text-white/35">
                {isEnglish
                    ? 'Stripe handles the one-time 7-Day Decision Packet checkout safely. Your current result stays saved when you come back.'
                    : 'Stripe에서 one-time 7일 결정 패킷 결제를 안전하게 처리하고, 지금 결과는 그대로 저장되어 다시 와도 이어서 볼 수 있습니다.'}
            </p>
        </>
    );
}
