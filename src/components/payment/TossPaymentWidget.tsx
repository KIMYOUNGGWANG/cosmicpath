'use client';

import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { READING_PRODUCT, ProductType } from '@/lib/payment/payment-config';

interface TossPaymentWidgetProps {
    product?: ProductType;
    onSuccess?: (paymentInfo: any) => void;
    onFail?: (error: any) => void;
}

const CLIENT_KEY = 'test_ck_D5PzymTirL16m8zJZWn3V5gejeA'; // Toss Sandbox Client Key (Fixed space)

export default function TossPaymentWidget({
    product = READING_PRODUCT,
    onSuccess,
    onFail
}: TossPaymentWidgetProps) {
    const paymentWidgetRef = useRef<any>(null);
    const paymentMethodsWidgetRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isWidgetReady, setIsWidgetReady] = useState(false);

    useEffect(() => {
        const fetchPaymentWidget = async () => {
            try {
                // 1. 위젯 객체 불러오기 (v1.x SDK pattern)
                const paymentWidget = await loadPaymentWidget(CLIENT_KEY, 'ANONYMOUS'); // 비회원 결제 기준

                // 2. 결제 UI 렌더링
                const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                    '#payment-method',
                    { value: product.price },
                    { variantKey: 'DEFAULT' }
                );

                // 3. 이용약관 UI 렌더링
                paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });

                // 4. 위젯 렌더링 완료 이벤트 리스너 추가
                paymentMethodsWidget.on('ready', () => {
                    console.log('Toss Payment Widget is ready');
                    setIsWidgetReady(true);
                    setIsLoading(false);
                });

                paymentWidgetRef.current = paymentWidget;
                paymentMethodsWidgetRef.current = paymentMethodsWidget;
            } catch (error) {
                console.error('Error loading Toss Payment Widget:', error);
                setIsLoading(false);
                if (onFail) onFail(error);
            }
        };

        fetchPaymentWidget();
    }, [product.price, onFail]);

    const handlePaymentRequest = async () => {
        const paymentWidget = paymentWidgetRef.current;

        if (!paymentWidget || !isWidgetReady) {
            console.error('Payment widget is not ready yet');
            return;
        }

        try {
            const orderId = `order_${Date.now()}`;

            await paymentWidget.requestPayment({
                orderId,
                orderName: product.name,
                customerName: '구매자', // 실제 서비스 시 유저 정보로 교체
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            });
        } catch (error) {
            console.error('Payment request failed:', error);
            if (onFail) onFail(error);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-white/60 text-sm">{product.description}</p>
                <div className="mt-4 text-3xl font-black text-[#A184FF]">
                    {product.price.toLocaleString()}원
                </div>
            </div>

            <div id="payment-method" className="mb-4 min-h-[400px]" />
            <div id="agreement" className="mb-8" />

            <button
                onClick={handlePaymentRequest}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#A184FF] to-[#7B5CFF] text-white font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-[0_0_20px_rgba(161,132,255,0.4)]"
            >
                {isLoading ? '로딩 중...' : '결제하기'}
            </button>
            <p className="mt-4 text-center text-xs text-white/40">
                토스페이먼츠의 안전한 결제 시스템을 사용합니다.
            </p>
        </div>
    );
}
