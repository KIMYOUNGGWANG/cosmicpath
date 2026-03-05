import type { Metadata } from 'next';

import { Navigation } from '@/components/landing/Navigation';
import { DailySealedWidget } from '@/components/daily/DailySealedWidget';

export const metadata: Metadata = {
    title: '오늘의 운세 | CosmicPath',
    description: '생년월일 기반 오늘의 운세를 확인하고 사랑/재물/커리어/건강 흐름을 받아보세요.',
};

export default function DailyPage() {
    return (
        <main className="w-full min-h-screen bg-void text-starlight selection:bg-acc-gold selection:text-bg-void flex flex-col">
            <Navigation />

            <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 cosmic-dust opacity-30 pointer-events-none" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-acc-gold/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="z-10 w-full max-w-2xl">
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-acc-gold via-white to-white/50 mb-4">
                            오늘의 운세
                        </h1>
                        <p className="text-starlight/60 text-lg">
                            생년월일 기반으로 오늘의 에너지를 확인하세요.
                        </p>
                    </header>

                    <DailySealedWidget />
                </div>
            </div>
        </main>
    );
}
