'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadingInput, ReadingData } from '@/components/reading/reading-input';
import { TarotPicker } from '@/components/reading/tarot-picker';
import { PremiumReport } from '@/components/reading/premium-report';
import { DecisionGuard } from '@/components/reading/decision-guard';

export default function Home() {
  const [step, setStep] = useState<'input' | 'tarot' | 'result'>('input');
  const [readingData, setReadingData] = useState<ReadingData | null>(null);
  const [selectedCards, setSelectedCards] = useState<{ name: string; isReversed: boolean }[]>([]);

  // 결과 상태
  const [reportData, setReportData] = useState<any>(null); // TODO: 구체적인 타입 정의 필요 (CosmicReport 또는 PremiumReportData)
  const [streamContent, setStreamContent] = useState(''); // Fallback용
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<{ phase: number; label: string }>({ phase: 0, label: '' });
  const [metadata, setMetadata] = useState<{ tarot?: { name: string; isReversed: boolean }[] } | undefined>(undefined);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  // Convergence Animation State
  const [isConverging, setIsConverging] = useState(false);

  // Decision Guard State
  const [isDecisionAccepted, setIsDecisionAccepted] = useState(false);

  const handleInputSubmit = (data: ReadingData) => {
    setReadingData(data);
    setLanguage(data.language);
    setStep('tarot');
  };

  const handleTarotComplete = async (cards: any[]) => {
    setSelectedCards(cards);
    setStep('result');
    setIsLoading(true);
    setIsConverging(true); // 애니메이션 시작

    // Convergence 애니메이션을 위해 잠시 대기
    setTimeout(() => {
      setIsConverging(false);
      startReading(cards);
    }, 2000);
  };

  const startReading = async (cards: any[]) => {
    if (!readingData) return;

    try {
      setIsLoading(true);
      let accumulatedReport = {};
      const totalPhases = 5;

      const labelsKo = [
        "",
        "핵심 요약 분석 중... (1/5)",
        "사주 기본 분석 중... (2/5)",
        "운의 흐름 분석 중... (3/5)",
        "영역별 상세 분석 중... (4/5)",
        "특수 분석 & 액션 플랜 생성 중... (5/5)"
      ];
      const labelsEn = [
        "",
        "Analyzing core summary... (1/5)",
        "Analyzing Saju fundamentals... (2/5)",
        "Analyzing fortune flow... (3/5)",
        "Detailed area analysis... (4/5)",
        "Generating action plan... (5/5)"
      ];
      const labels = language === 'en' ? labelsEn : labelsKo;

      // Sequential Execution: Phase 1 -> 5
      for (let phase = 1; phase <= totalPhases; phase++) {
        setLoadingPhase({ phase, label: labels[phase] });

        const response = await fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...readingData,
            tarotCards: cards,
            tier: 'premium',
            language,
            phase, // Execute specific phase
            previousReport: accumulatedReport, // Pass context
          }),
        });

        if (!response.ok) {
          throw new Error(`Phase ${phase} failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || `Phase ${phase} validation failed`);
        }

        console.log(`Phase ${phase} complete:`, result.report);

        // Merge results
        accumulatedReport = { ...accumulatedReport, ...result.report };

        // Update intermediate state (optional, if you want to show partial results)
        // setReportData(accumulatedReport); 

        // Metadata update (once is enough, usually from first phase or accumulated)
        if (result.metadata) {
          setMetadata(prev => ({ ...prev, ...result.metadata }));
        }
      }

      // Finalize
      setReportData(accumulatedReport);

    } catch (error) {
      console.error('Reading failed:', error);
      setStreamContent(language === 'en' ? "Failed to connect to the server. Please try again." : "서버 연결에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden text-white selection:bg-gold selection:text-deep-navy">
      {/* Dynamic Aurora Background */}
      <div className="aurora-bg fixed inset-0 z-0 opacity-80" />

      {/* Main Container */}
      <div className="container-cosmic relative z-10 pt-16 pb-12 md:py-20 safe-area-top">

        {/* Header: The Convergence Engine */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          {/* Central Core Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full -z-10" />

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">
            <span className="text-gradient">Cosmic</span>
            <span className="text-white">Path</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide">
            {isConverging ? (
              <span className="text-gold animate-pulse">{language === 'en' ? 'Aligning Destinies...' : '운명을 정렬하는 중...'}</span>
            ) : (
              language === 'en' ? "Your Personal Destiny Map through Saju, Tarot, and Astrology" : "사주, 타로, 점성술로 완성하는 나만의 운명 지도"
            )}
          </p>

          {/* Convergence Animation Layer */}
          <AnimatePresence>
            {isConverging && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
                {/* Blue Stream (Logic) */}
                <motion.div
                  initial={{ opacity: 0, scale: 2, rotate: 0 }}
                  animate={{ opacity: 1, scale: 0, rotate: 180 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 border-2 border-saju-blue rounded-full opacity-30 blur-sm"
                />
                {/* Yellow Stream (Flow) */}
                <motion.div
                  initial={{ opacity: 0, scale: 2, rotate: 120 }}
                  animate={{ opacity: 1, scale: 0, rotate: 300 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.1 }}
                  className="absolute inset-0 border-2 border-star-yellow rounded-full opacity-30 blur-sm"
                />
                {/* Purple Stream (Intuition) */}
                <motion.div
                  initial={{ opacity: 0, scale: 2, rotate: 240 }}
                  animate={{ opacity: 1, scale: 0, rotate: 420 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                  className="absolute inset-0 border-2 border-tarot-purple rounded-full opacity-30 blur-sm"
                />
                {/* Central Core Burst */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, times: [0, 0.5, 1] }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white blur-xl rounded-full"
                />
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">

          {/* Step 1: Input */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <ReadingInput onSubmit={handleInputSubmit} />
            </motion.div>
          )}

          {/* Step 2: Tarot */}
          {step === 'tarot' && (
            <motion.div
              key="tarot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-4xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-200">
                  {language === 'en' ? 'Select Your Destiny Cards' : '운명의 카드를 선택하세요'}
                </h2>
                <p className="text-white/60">
                  {language === 'en'
                    ? <>Choose 3 cards that your intuition guides you to.<br /><span className="text-xs text-indigo-300">(Reading past / present / future flow)</span></>
                    : <>당신의 무의식이 이끄는 카드 3장을 선택해주세요.<br /><span className="text-xs text-indigo-300">(과거 / 현재 / 미래의 흐름을 읽어냅니다)</span></>
                  }
                </p>
              </div>

              <TarotPicker
                onSelect={handleTarotComplete}
                maxCards={3} // 3장 리딩으로 변경
                language={language}
              />
            </motion.div>
          )}

          {/* Step 3: Result (Deep Dive) */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: isConverging ? 1.5 : 0 }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
                  <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-6" />

                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-white animate-pulse">
                      {loadingPhase.label || (language === 'en' ? "Analyzing your destiny data..." : "운명의 데이터를 분석하고 있습니다...")}
                    </p>
                    {loadingPhase.phase > 0 && (
                      <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                        <motion.div
                          className="h-full bg-gold"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(loadingPhase.phase / 5) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      {loadingPhase.phase > 0
                        ? (language === 'en' ? `Step ${loadingPhase.phase} of 5` : `5단계 정밀 분석 중 (${loadingPhase.phase}/5)`)
                        : (language === 'en' ? "Initializing AI Engine..." : "AI 엔진 초기화 중...")}
                    </p>
                  </div>
                </div>
              ) : reportData ? (
                <>
                  <DecisionGuard
                    isOpen={reportData.summary.trust_score <= 2 && !isDecisionAccepted}
                    onAccept={() => setIsDecisionAccepted(true)}
                    language={language}
                  />
                  {(reportData.summary.trust_score > 2 || isDecisionAccepted) && (
                    <PremiumReport report={reportData} metadata={metadata} language={language} />
                  )}
                </>
              ) : (
                // Fallback Display or Error
                <div className="text-center p-8 bg-white/5 rounded-xl border border-red-500/30">
                  <p className="text-red-300 mb-2">{language === 'en' ? '⚠️ A problem occurred during analysis.' : '⚠️ 분석 중 문제가 발생했습니다.'}</p>
                  <p className="text-sm text-gray-400">{streamContent}</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Ambient Footer */}
      <footer className="absolute bottom-0 w-full p-6 text-center text-white/20 text-xs">
        © 2025 CosmicPath. All Destinies Aligned.
      </footer>
    </main>
  );
}
