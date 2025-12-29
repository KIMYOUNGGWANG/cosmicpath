'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadingInput, ReadingData } from '@/components/reading/reading-input';
import { TarotPicker } from '@/components/reading/tarot-picker';
import { PremiumReport } from '@/components/reading/premium-report';
import { DecisionGuard } from '@/components/reading/decision-guard';
import { FollowUpChat } from '@/components/reading/FollowUpChat';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { ReadingSession, createSession, saveSession } from '@/lib/session/reading-session';

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

  // Follow-up Chat Session State
  const [session, setSession] = useState<ReadingSession | null>(null);

  // Share URL State
  const [shareUrl, setShareUrl] = useState<string | undefined>(undefined);

  // Payment State
  const [isPremium, setIsPremium] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Resume Reading after Payment
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const paid = urlParams.get('paid');

    if (paid === 'true') {
      // Use sessionStorage for temporary payment flow persistence
      const pendingData = sessionStorage.getItem('pending_reading_data');
      const paymentCompleted = sessionStorage.getItem('payment_completed');

      if (pendingData && paymentCompleted === 'true') {
        try {
          console.log('[Resume] Found pending data & payment completed');

          // Clear flags
          sessionStorage.removeItem('pending_reading_data');
          sessionStorage.removeItem('payment_completed');

          // Remove query param
          window.history.replaceState({}, '', window.location.pathname);

          // Restore data
          const data = JSON.parse(pendingData);
          console.log('[Resume] Restored data:', data);

          // Restore report if exists
          const pendingReportJson = sessionStorage.getItem('pending_report_data');
          let pendingReport = null;
          if (pendingReportJson) {
            try {
              pendingReport = JSON.parse(pendingReportJson);
              console.log('[Resume] Restored existing report:', pendingReport);
              sessionStorage.removeItem('pending_report_data');

              // Set initial report state so UI shows it immediately
              setReportData(pendingReport);
            } catch (e) {
              console.error('Failed to parse pending report:', e);
            }
          }

          setReadingData(data);
          setLanguage(data.language as 'ko' | 'en');
          setStep('result');
          setIsPremium(true);

          if (data.tarotCards) {
            console.log('[Resume] Starting reading with restored cards:', data.tarotCards);
            setSelectedCards(data.tarotCards);

            // Resume specific logic:
            const startPhase = pendingReport ? 3 : 1;

            // Slight delay to ensure state updates
            setTimeout(() => startReading(data.tarotCards, true, data, pendingReport, startPhase), 500);
          } else {
            console.error('[Resume] Missing tarotCards in pending data');
            setStreamContent('Error: Could not restore session data (Missing Tarot Cards)');
          }
        } catch (e) {
          console.error("Failed to resume reading:", e);
          setStreamContent(`Error: Failed to resume session (${e})`);
        }
      } else {
        console.log('[Resume] No pending data found or payment not completed');
      }
    } else {
      // Handle "Back" navigation or cancelled payment (paid !== 'true')
      // Use sessionStorage here too
      const pendingData = sessionStorage.getItem('pending_reading_data');
      const pendingReportJson = sessionStorage.getItem('pending_report_data');

      // Only restore if we have BOTH input data and report data (meaning we were at the result screen)
      if (pendingData && pendingReportJson) {
        console.log('[Resume] Found cached session (User returned from payment)');
        try {
          const data = JSON.parse(pendingData);
          const report = JSON.parse(pendingReportJson);

          // Restore state but remain LOCKED (isPremium = false)
          setReadingData(data);
          setLanguage(data.language as 'ko' | 'en');
          if (data.tarotCards) {
            setSelectedCards(data.tarotCards);
          }
          setReportData(report);
          setStep('result');
          // intentionally NOT setting isPremium(true)
        } catch (e) {
          console.error("Failed to restore cached session:", e);
        }
      } else {
        // !!! IMPORTANT FIX: Check and clear STUCK localStorage items from previous version !!!
        if (localStorage.getItem('pending_reading_data')) {
          console.log('[Cleanup] Removing stale localStorage data from previous version');
          localStorage.removeItem('pending_reading_data');
          localStorage.removeItem('pending_report_data');
          localStorage.removeItem('payment_completed');
        }
      }
    }
  }, []);

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

  const startReading = async (
    cards: any[],
    isPremiumOverride = false,
    readingDataOverride?: ReadingData,
    initialReport?: any,
    startPhaseOverride?: number
  ) => {
    const dataToUse = readingDataOverride || readingData;
    if (!dataToUse) return;

    try {
      setIsLoading(true);

      // If resuming, use existing report, otherwise start empty
      let accumulatedReport: any = initialReport || {};
      const totalPhases = 5;

      const labelsKo = [
        "",
        "핵심 요약 분석 중... (1/5)",
        "사주 기본 분석 중... (2/5)",
        "운의 흐름 분석 중... (3/5)",
        "영역별 상세 분석 중... (4/5)",
        "특수 분석 & 액션 플랜 생성 중... (5/5)"
      ];
      // ... (labelsEn omitted for brevity, assuming existing code structure)
      const labelsEn = [
        "",
        "Analyzing core summary... (1/5)",
        "Analyzing Saju fundamentals... (2/5)",
        "Analyzing fortune flow... (3/5)",
        "Detailed area analysis... (4/5)",
        "Generating action plan... (5/5)"
      ];
      const labels = language === 'en' ? labelsEn : labelsKo;

      // Determine phases to run
      // If resuming (initialReport exists), we might start from Phase 3
      const startPhase = startPhaseOverride || 1;
      const maxPhase = (isPremium || isPremiumOverride) ? 5 : 2;

      // If we are just starting fresh free reading, phases 1-2.
      // If we upgraded, we run 3-5 (assuming startPhase=3).

      for (let phase = startPhase; phase <= maxPhase; phase++) {
        setLoadingPhase({ phase, label: labels[phase] });

        const response = await fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...dataToUse,
            tarotCards: cards,
            tier: 'premium',
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

      // Save result to DB for sharing (Async)
      (async () => {
        try {
          const response = await fetch('/api/reading/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: accumulatedReport,
              metadata: { ...metadata, language }
            })
          });
          const { id } = await response.json();
          if (id) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
            const newUrl = `/share/${id}`;
            setShareUrl(`${appUrl}${newUrl}`);

            // 브라우저 주소창 동기화 (새로고침 시 결과 유지)
            window.history.replaceState(
              { readingId: id },
              '',
              newUrl
            );

            // Send Email if user email exists in localStorage (비회원 주문)
            const userEmail = localStorage.getItem('user_email');
            if (userEmail) {
              fetch('/api/email/send-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: userEmail,
                  resultId: id,
                  title: accumulatedReport.summary?.title
                })
              }).catch(console.error);
            }
          }
        } catch (err) {
          console.error('Failed to save result:', err);
        }
      })();

      // Create session for follow-up chat (바이럴 모드: 기본 0회, 공유 시 추가)
      const newSession = createSession('free_session', accumulatedReport, 0);
      setSession(newSession);

    } catch (error) {
      console.error('Reading failed:', error);
      setStreamContent(language === 'en' ? "Failed to connect to the server. Please try again." : "서버 연결에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden text-foreground selection:bg-star-yellow selection:text-deep-navy font-outfit">
      {/* Refined Cosmic Atmosphere */}
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none z-0" />

      {/* Main Container */}
      <div className="container-cosmic relative z-10 pt-20 pb-16 md:py-24 safe-area-top">

        {/* Header: The Convergence Engine */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16 relative px-6"
        >
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight font-cinzel leading-tight mb-4 flex flex-wrap justify-center">
              <span className="text-gradient block sm:inline">Cosmic</span>
              <span className="text-white sm:ml-4">Path</span>
            </h1>
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="text-gray-200 text-base md:text-xl font-light tracking-wide leading-relaxed">
              {isConverging ? (
                <span className="text-star-yellow animate-pulse text-glow-yellow font-cinzel italic tracking-[0.1em]">
                  {language === 'en' ? 'Aligning Celestial Bodies...' : '천체들을 정렬하는 중...'}
                </span>
              ) : (
                <span className="opacity-100 italic">
                  {language === 'en'
                    ? "Your Sacred Narrative woven through Saju, Astrology, and Tarot"
                    : "사주, 타로, 점성술로 수놓은 당신만의 신성한 서사"}
                </span>
              )}
            </p>
          </div>

          {/* Convergence Animation Layer */}
          <AnimatePresence>
            {isConverging && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none flex items-center justify-center">
                {/* Orbital Rings - Refined for premium feel */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 2.5, rotate: i * 120 }}
                    animate={{ opacity: [0, 0.4, 0], scale: 0, rotate: i * 120 + 360 }}
                    transition={{ duration: 2.2, ease: "easeInOut", delay: i * 0.15 }}
                    className={`absolute inset-0 border-[1px] rounded-full blur-[2px] ${i === 0 ? 'border-saju-blue' : i === 1 ? 'border-star-yellow' : 'border-tarot-purple'
                      }`}
                  />
                ))}

                {/* Central Nova Burst */}
                <motion.div
                  initial={{ scale: 0, opacity: 0, filter: 'blur(10px)' }}
                  animate={{
                    scale: [0, 2, 0],
                    opacity: [0, 1, 0],
                    filter: ['blur(10px)', 'blur(0px)', 'blur(20px)']
                  }}
                  transition={{ duration: 2, times: [0, 0.5, 1] }}
                  className="w-32 h-32 bg-white rounded-full mix-blend-screen"
                />
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Content Area - Using glassmorphism and asymmetrical balance */}
        <AnimatePresence mode="wait">

          {/* Step 1: Input */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl mx-auto px-4"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-saju-blue/20 via-tarot-purple/20 to-star-yellow/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative glass-card border-white/5 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <ReadingInput onSubmit={handleInputSubmit} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Tarot */}
          {step === 'tarot' && (
            <motion.div
              key="tarot"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full max-w-5xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cinzel text-glow-purple tracking-wide">
                  {language === 'en' ? 'Select Your Sacred Major Arcana' : '운명의 대아르카나를 선택하세요'}
                </h2>
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-tarot-purple/50 to-transparent mx-auto mb-6" />
                <p className="text-white/70 text-lg font-light tracking-wide italic">
                  {language === 'en'
                    ? "Close your eyes, breathe, and let your spirit guide your hand."
                    : "숨을 가다듬고, 당신의 영혼이 손을 이끌게 하세요."
                  }
                </p>
              </div>

              <div className="relative px-4">
                <TarotPicker
                  onSelect={handleTarotComplete}
                  maxCards={3}
                  language={language}
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Result (Deep Dive) */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: isConverging ? 1.5 : 0 }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-400">
                  {/* Premium Spinner */}
                  <div className="relative w-24 h-24 mb-10">
                    <div className="absolute inset-0 border-t-2 border-star-yellow rounded-full animate-[spin_1.5s_linear_infinite]" />
                    <div className="absolute inset-2 border-r-2 border-saju-blue rounded-full animate-[spin_2s_linear_infinite]" />
                    <div className="absolute inset-4 border-l-2 border-tarot-purple rounded-full animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-0 bg-white/5 blur-xl rounded-full animate-pulse" />
                  </div>

                  <div className="text-center space-y-4 max-w-sm px-6">
                    <p className="text-2xl font-cinzel text-white tracking-[0.15em] animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                      {loadingPhase.label || (language === 'en' ? "weaving tapestry..." : "운명의 실타래를 엮는 중...")}
                    </p>

                    {loadingPhase.phase > 0 && (
                      <div className="space-y-2">
                        <div className="w-64 h-[1px] bg-white/10 rounded-full overflow-hidden mx-auto">
                          <motion.div
                            className="h-full bg-gradient-to-r from-saju-blue via-star-yellow to-tarot-purple"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(loadingPhase.phase / 5) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                          {language === 'en' ? `Phase ${loadingPhase.phase} of 5` : `심층 분석 ${loadingPhase.phase}단계`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : reportData && reportData.summary ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <DecisionGuard
                    isOpen={reportData.summary.trust_score <= 2 && !isDecisionAccepted}
                    onAccept={() => setIsDecisionAccepted(true)}
                    language={language}
                  />
                  {(reportData.summary.trust_score > 2 || isDecisionAccepted) && (
                    <>
                      <PremiumReport
                        report={reportData}
                        metadata={metadata}
                        language={language}
                        shareUrl={shareUrl}
                        onUnlock={() => setIsPaymentModalOpen(true)}
                      />

                      {/* Follow-up Chat (Temporarily Disabled by User Request) */}
                      {/* {session && (
                        <div className="max-w-2xl mx-auto px-4 mt-8">
                          <FollowUpChat
                            session={session}
                            onSessionUpdate={(updatedSession) => {
                              setSession(updatedSession);
                              saveSession(updatedSession);
                            }}
                            shareUrl={shareUrl}
                          />
                        </div>
                      )} */}
                    </>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-12 glass-card border-red-500/20 max-w-lg mx-auto"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-red-400 text-3xl italic font-cinzel">!</span>
                  </div>
                  <h3 className="text-xl font-cinzel mb-4 text-red-200">Analysis Interrupted</h3>
                  <p className="text-sm text-gray-400 mb-6 font-light leading-relaxed">
                    {streamContent || (language === 'en'
                      ? "The cosmic alignment was too complex to process at this moment."
                      : "우주의 기운이 너무 복잡하여 현재 처리할 수 없습니다.")}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-secondary px-8 py-3 text-sm font-medium tracking-widest uppercase hover:bg-white/5 transition-all"
                  >
                    Realign Path
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        readingData={readingData ? { ...readingData, tarotCards: selectedCards } : undefined}
        currentReport={reportData}
      />

      {/* Ambient Footer */}
      <footer className="w-full py-12 text-center relative z-10 px-6">
        <div className="h-[1px] w-24 bg-white/20 mx-auto mb-6" />
        <p className="text-white/50 text-[10px] tracking-[0.5em] uppercase font-bold">
          © 2025 CosmicPath. Unveiling the Eternal Flow.
        </p>
      </footer>
    </main>
  );
}
