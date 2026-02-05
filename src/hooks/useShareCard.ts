'use client';

import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface UseShareCardOptions {
    filename?: string;
    quality?: number;
}

interface UseShareCardReturn {
    cardRef: React.RefObject<HTMLDivElement | null>;
    isCapturing: boolean;
    captureAndDownload: () => Promise<void>;
    captureAsBlob: () => Promise<Blob | null>;
}

/**
 * 인스타그램 스토리용 이미지 캡처 훅
 * html2canvas를 사용하여 DOM을 이미지로 변환
 */
export function useShareCard(options: UseShareCardOptions = {}): UseShareCardReturn {
    const { filename = 'cosmic-card', quality = 1.0 } = options;
    const cardRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const captureAsBlob = useCallback(async (): Promise<Blob | null> => {
        if (!cardRef.current) return null;

        setIsCapturing(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2, // 고해상도
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#0F1419',
                logging: false,
            });

            return new Promise((resolve) => {
                canvas.toBlob(
                    (blob) => resolve(blob),
                    'image/png',
                    quality
                );
            });
        } catch (error) {
            console.error('Share card capture failed:', error);
            return null;
        } finally {
            setIsCapturing(false);
        }
    }, [quality]);

    const captureAndDownload = useCallback(async () => {
        const blob = await captureAsBlob();
        if (!blob) return;

        // 다운로드 트리거
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [captureAsBlob, filename]);

    return {
        cardRef,
        isCapturing,
        captureAndDownload,
        captureAsBlob,
    };
}
