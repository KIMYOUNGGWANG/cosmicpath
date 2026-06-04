import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { PaymentModalForm } from './PaymentModalForm';
import { PaymentModalPricePanel } from './PaymentModalPricePanel';
import { PaymentModalBenefits, PaymentModalLockedSections } from './PaymentModalSections';
import { getLockedSections, getPaywallIntroCopy, getUnlockBenefits } from './payment-modal-copy';

interface PaymentModalContentProps {
    readonly offerName: string;
    readonly isEnglish: boolean;
    readonly isRelationshipContactTiming: boolean;
    readonly dynamicPrice: string | null;
    readonly discountedPriceLabel: string | null;
    readonly displayedPriceLabel: string;
    readonly hasConcreteDisplayedPrice: boolean;
    readonly showPriceContractMismatch: boolean;
    readonly showPriceLoadingState: boolean;
    readonly showPriceFallbackCopy: boolean;
    readonly isFreePromo: boolean;
    readonly email: string;
    readonly emailError: string | null;
    readonly isOpen: boolean;
    readonly isLoading: boolean;
    readonly discount: number;
    readonly resolvedAutoReferralCode: string | null;
    readonly isCheckoutPausedForPriceMismatch: boolean;
    readonly onEmailChange: (value: string) => void;
    readonly onPromoApply: (id: string, discount: number, code: string) => void;
    readonly onPayment: () => void;
}

function BodyLines({ lines }: { readonly lines: readonly string[] }) {
    return (
        <>
            {lines.map((line, index) => (
                <span key={line}>
                    {line}
                    {index < lines.length - 1 ? <br /> : null}
                </span>
            ))}
        </>
    );
}

export function PaymentModalContent(props: PaymentModalContentProps) {
    const copyInput = {
        isEnglish: props.isEnglish,
        isRelationshipContactTiming: props.isRelationshipContactTiming,
    };
    const introCopy = getPaywallIntroCopy(copyInput);
    const lockedSections = getLockedSections(copyInput);
    const unlockBenefits = getUnlockBenefits(copyInput);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="mb-8 text-center md:mb-10"
            >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-acc-gold/20 bg-acc-gold/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-acc-gold">
                    <Lock className="h-4 w-4" />
                    {props.offerName}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white md:text-2xl">{introCopy.title}</h3>
                <p className="text-sm leading-relaxed text-white/60">
                    <BodyLines lines={introCopy.bodyLines} />
                </p>
                <PaymentModalPricePanel
                    isEnglish={props.isEnglish}
                    dynamicPrice={props.dynamicPrice}
                    discountedPriceLabel={props.discountedPriceLabel}
                    displayedPriceLabel={props.displayedPriceLabel}
                    hasConcreteDisplayedPrice={props.hasConcreteDisplayedPrice}
                    showPriceContractMismatch={props.showPriceContractMismatch}
                    showPriceLoadingState={props.showPriceLoadingState}
                    showPriceFallbackCopy={props.showPriceFallbackCopy}
                    discount={props.discount}
                />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
            >
                <PaymentModalLockedSections isEnglish={props.isEnglish} items={lockedSections} />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12 }}
            >
                <PaymentModalBenefits items={unlockBenefits} />
            </motion.div>
            <PaymentModalForm
                isEnglish={props.isEnglish}
                isFreePromo={props.isFreePromo}
                email={props.email}
                emailError={props.emailError}
                isOpen={props.isOpen}
                isLoading={props.isLoading}
                discount={props.discount}
                resolvedAutoReferralCode={props.resolvedAutoReferralCode}
                isCheckoutPausedForPriceMismatch={props.isCheckoutPausedForPriceMismatch}
                onEmailChange={props.onEmailChange}
                onPromoApply={props.onPromoApply}
                onPayment={props.onPayment}
            />
        </>
    );
}
