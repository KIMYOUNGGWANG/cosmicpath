'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadingInput, ReadingData } from '@/components/reading/reading-input';
import { TarotPicker } from '@/components/reading/tarot-picker';
import { PremiumReport } from '@/components/reading/premium-report';
import { DecisionGuard } from '@/components/reading/decision-guard';
import { ReadingSession, createSession } from '@/lib/session/reading-session';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { StickyCTA } from '@/components/common/sticky-cta';

import { Suspense } from 'react';
import { Footer } from '@/components/landing/Footer';
import { GlobalHeader } from '@/components/common/GlobalHeader';

function CosmicPathContent() {
  const [step, setStep] = useState<'input' | 'mirror' | 'tarot' | 'result'>('input');
  const [readingData, setReadingData] = useState<ReadingData | null>(null);
  const [selectedCards, setSelectedCards] = useState<{ name: string; isReversed: boolean }[]>([]);

  // 결과 상태
  const [reportData, setReportData] = useState<any>(null); // TODO: 구체적인 타입 정의 필요 (CosmicReport 또는 PremiumReportData)
  const [streamContent, setStreamContent] = useState(''); // Fallback용
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<{ phase: number; label: string }>({ phase: 0, label: '' });
  const [metadata, setMetadata] = useState<{
    tarot?: { name: string; isReversed: boolean }[];
    radarScores?: { saju: number; astrology: number; tarot: number };
  } | undefined>(undefined);
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
  const [isPremium, setIsPremium] = useState(false); // Paywall Enabled
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const [hasCheckedResume, setHasCheckedResume] = useState(false);

  // Dynamic Price State
  const [dynamicPrice, setDynamicPrice] = useState<string>('$3.99');

  // Fetch dynamic price on mount
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/payment/price');
        const data = await response.json();
        if (data.formattedPrice) {
          setDynamicPrice(data.formattedPrice);
        }
      } catch (error) {
        console.error('Failed to fetch dynamic price:', error);
      }
    };
    fetchPrice();
  }, []);

  // Resume Reading after Payment
  useEffect(() => {
    const checkResume = async () => {
      const paid = searchParams.get('paid');
      const canceled = searchParams.get('canceled');
      const readingIdFromUrl = searchParams.get('reading_id');

      // Small delay ONLY if we don't have explicit URL flags (relying on sessionStorage only)
      if (!paid && !canceled && !readingIdFromUrl) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const reset = searchParams.get('reset') === 'true';
      const isSessionActive = sessionStorage.getItem('is_session_active') === 'true';

      if (reset) {
        console.log('[Resume] Reset flag detected. Clearing session.');
        sessionStorage.clear(); // Or clear specific items
        setHasCheckedResume(true);
        return;
      }

      const readingId = readingIdFromUrl || sessionStorage.getItem('pending_reading_id');

      if (readingId || paid === 'true' || canceled === 'true' || isSessionActive) {
        if (readingId && !sessionStorage.getItem('pending_reading_id')) {
          sessionStorage.setItem('pending_reading_id', readingId);
        }

        let pendingData = sessionStorage.getItem('pending_reading_data');
        let pendingReportJson = sessionStorage.getItem('pending_report_data');
        let pendingMetadataJson = sessionStorage.getItem('pending_metadata');

        if (readingId && (!pendingData || pendingData === 'null')) {
          try {
            console.log('[Resume] Fetching reading from DB:', readingId);
            const response = await fetch(`/api/reading/save?id=${readingId}`);
            if (response.ok) {
              const saved = await response.json();
              if (saved.success) {
                const rData = saved.metadata?.readingData || null;
                const rReport = saved.data || null;
                const rMeta = saved.metadata || null;

                pendingData = JSON.stringify(rData);
                pendingReportJson = JSON.stringify(rReport);
                pendingMetadataJson = JSON.stringify(rMeta);

                // Persist back to sessionStorage for future refreshes
                if (rData) sessionStorage.setItem('pending_reading_data', pendingData);
                if (rReport) sessionStorage.setItem('pending_report_data', pendingReportJson);
                if (rMeta) sessionStorage.setItem('pending_metadata', pendingMetadataJson);
              }
            }
          } catch (err) {
            console.error('[Resume] DB fetch failed:', err);
          }
        }

        if (pendingData && pendingData !== 'null') {
          try {
            console.log('[Resume] Restoring session state...', { paid, canceled, isSessionActive });
            const data = JSON.parse(pendingData);
            setReadingData(data);
            setLanguage(data.language as 'ko' | 'en');

            if (data.tarotCards) {
              setSelectedCards(data.tarotCards);
            }

            if (pendingReportJson && pendingReportJson !== 'null') {
              setReportData(JSON.parse(pendingReportJson));
            }
            if (pendingMetadataJson && pendingMetadataJson !== 'null') {
              const meta = JSON.parse(pendingMetadataJson);
              setMetadata(meta);
              if (meta.language) setLanguage(meta.language as 'ko' | 'en');
              if (meta.isPremium) setIsPremium(true);
            }
            if (sessionStorage.getItem('decision_accepted') === 'true') {
              setIsDecisionAccepted(true);
            }
            if (sessionStorage.getItem('is_premium_user') === 'true') {
              setIsPremium(true);
            }

            // Persistence: Always go to result if we have data
            setStep('result');

            // If we have a saved ID, sync the URL
            const pendingId = sessionStorage.getItem('pending_reading_id');
            if (pendingId) {
              window.history.replaceState({ readingId: pendingId }, '', `/share/${pendingId}${window.location.search}`);
            }

            // Success Flow: If explicitly paid, trigger premium logic
            if (paid === 'true') {
              setIsPremium(true);
              const report = pendingReportJson ? JSON.parse(pendingReportJson) : null;

              const determineNextPhase = (r: any) => {
                if (!r || !r.summary) return 1;
                if (!r.saju_sections) return 2;
                if (!r.fortune_flow) return 3;
                if (!r.life_areas) return 4;
                if (!r.special_analysis) return 5;
                return 6; // All complete
              };

              const nextPhase = determineNextPhase(report);

              if (nextPhase <= 5) {
                console.log(`[Resume] Resuming analysis from phase ${nextPhase}`);
                startReading(data.tarotCards || [], true, data, report || undefined, nextPhase);
              } else {
                console.log('[Resume] Analysis already complete. Skipping resumption.');
              }
            }

            // Cleanup query params ONLY, keeping sessionStorage for refresh-resilience
            if (paid === 'true' || canceled === 'true') {
              window.history.replaceState({}, '', window.location.pathname);
            }
          } catch (e) {
            console.error("[Resume] Failure during restoration:", e);
          }
        }
      }

      setHasCheckedResume(true);
    };

    checkResume();
  }, [searchParams]);

  // Step 1: Birthdate Submission -> Go to Tarot
  const handleInputSubmit = (data: ReadingData) => {
    const keysToClear = [
      'pending_reading_data',
      'pending_report_data',
      'pending_metadata',
      'pending_reading_id',
      'payment_completed',
      'decision_accepted'
    ];
    keysToClear.forEach(key => sessionStorage.removeItem(key));
    sessionStorage.setItem('is_session_active', 'false'); // Explicitly false until results are ready

    setReadingData(data);
    setLanguage(data.language);
    setStep('tarot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Step 2: Tarot Completion -> Start Partial Reading
  const handleTarotComplete = async (cards: { name: string; isReversed: boolean }[]) => {
    setSelectedCards(cards);

    // Mark session as active and persist data once we reach results
    sessionStorage.setItem('is_session_active', 'true');
    if (readingData) {
      sessionStorage.setItem('pending_reading_data', JSON.stringify({ ...readingData, tarotCards: cards }));
    }

    setStep('result');
    setIsLoading(true);
    setIsConverging(true);

    // Initial analysis (Phases 1-2 for free preview)
    setTimeout(() => {
      setIsConverging(false);
      startReading(cards);
    }, 2000);
  };

  const handleUpgrade = async () => {
    // Open payment modal instead of direct unlock, unless already premium
    if (isPremium) return;
    setIsPaymentModalOpen(true);
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
      let accumulatedMetadata: any = metadata || {};
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

      const startPhase = startPhaseOverride || 1;
      // If we are not premium, only show Phase 1-2 (Summary & Traits)
      const maxPhase = (isPremium || isPremiumOverride) ? totalPhases : 2;

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

        // Update UI immediately for each phase
        setReportData({ ...accumulatedReport });
        sessionStorage.setItem('pending_report_data', JSON.stringify(accumulatedReport));

        // Metadata update (once is enough, usually from first phase or accumulated)
        if (result.metadata) {
          accumulatedMetadata = { ...accumulatedMetadata, ...result.metadata };
          setMetadata({ ...accumulatedMetadata });
          sessionStorage.setItem('pending_metadata', JSON.stringify(accumulatedMetadata));
        }
      }

      // Save result to DB for sharing (Async) - Final save
      const isComplete = maxPhase === 5;
      if (isComplete) {
        setIsPremium(true);
        sessionStorage.setItem('is_premium_user', 'true');
      }
      (async () => {
        try {
          const existingId = sessionStorage.getItem('pending_reading_id');
          const response = await fetch('/api/reading/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: existingId || undefined,
              data: accumulatedReport,
              metadata: {
                ...accumulatedMetadata,
                isPremium: isComplete,
                readingData: dataToUse,
                tarotCards: cards,
                language
              }
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Failed to save to database:', response.status, errData);
            return;
          }

          const { id } = await response.json();
          if (id) {
            sessionStorage.setItem('pending_reading_id', id);
            const origin = window.location.origin;
            const appUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;
            const newUrl = `/share/${id}`;
            setShareUrl(`${appUrl}${newUrl}`);

            // 브라우저 주소창 동기화 (새로고침 시 결과 유지)
            window.history.replaceState({ readingId: id }, '', newUrl);

            // Send Email ONLY if this is a completed premium reading
            const userEmail = localStorage.getItem('user_email');
            if (userEmail && isComplete) {
              const birthInfoStr = `${dataToUse.birthDate} ${dataToUse.birthTime}생`;
              const sajuStr = (accumulatedMetadata as any)?.saju?.fullSaju || '';
              const contextMap: Record<string, string> = {
                career: '커리어/직업',
                love: '연애/결혼',
                money: '금전/재물',
                health: '건강/웰빙',
                general: '종합 운세'
              };
              const contextStr = dataToUse.question || contextMap[dataToUse.context] || '운세 리딩';

              fetch('/api/email/send-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: userEmail,
                  resultId: id,
                  title: accumulatedReport.summary?.title,
                  birthInfo: birthInfoStr,
                  sajuSummary: sajuStr,
                  userContext: contextStr
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
    <main className="min-h-screen relative overflow-hidden text-foreground selection:bg-accent-gold selection:text-bg-void font-outfit">
      {/* Conversion-Focused Background */}
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="noise-overlay" />

      {/* Step 0: Initial Loading/Resume Check */}
      {!hasCheckedResume && (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-20">
          <div className="w-12 h-12 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/60 text-sm animate-pulse tracking-widest font-cinzel">
            {searchParams.get('paid') === 'true'
              ? (language === 'en' ? 'PAYMENT VERIFIED! PREPARING PREMIUM REPORT...' : '결제 확인 완료! 프리미엄 리포트를 준비 중입니다...')
              : 'CALIBRATING...'}
          </p>
        </div>
      )}

      <GlobalHeader language={language} showBackButton={step === 'input' || step === 'result'} />

      {/* Main Container */}
      <div className="container-cosmic relative z-10 safe-area-top">
        <AnimatePresence mode="wait">
          {/* Step 1: Input (The Ritual) */}
          {hasCheckedResume && step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-4xl mx-auto py-20 px-6"
            >
              <div className="text-center mb-20">
                <h1 className="font-cinzel text-4xl md:text-5xl text-starlight mb-4">
                  BEGIN SEQUENCE
                </h1>
                <p className="text-dim text-sm tracking-[0.2em] uppercase">
                  Enter your coordinates
                </p>
              </div>

              <ReadingInput
                onSubmit={(data) => {
                  handleInputSubmit({
                    ...data,
                    birthTime: data.birthTime || '12:00',
                    calendarType: data.calendarType || 'solar',
                    unknownTime: data.unknownTime || false
                  });
                }}
                isLoading={isLoading}
              />
            </motion.div>
          )}


          {/* Step 3: Tarot Selection */}
          {step === 'tarot' && (
            <motion.div
              key="tarot"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full max-w-5xl mx-auto py-20"
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

          {/* Step 4: Result (Deep Dive) */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: isConverging ? 1.5 : 0 }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-400">
                  <div className="relative w-24 h-24 mb-10">
                    <div className="absolute inset-0 border-t-2 border-accent-gold rounded-full animate-[spin_1.5s_linear_infinite]" />
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
                            className="h-full bg-gradient-to-r from-saju-blue via-accent-gold to-tarot-purple"
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
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 py-12 pt-32">
                  <DecisionGuard
                    isOpen={reportData.summary.trust_score <= 2 && !isDecisionAccepted}
                    onAccept={() => {
                      setIsDecisionAccepted(true);
                      sessionStorage.setItem('decision_accepted', 'true');
                    }}
                    language={language}
                  />
                  {(reportData.summary.trust_score > 2 || isDecisionAccepted) && (
                    <PremiumReport
                      report={reportData}
                      metadata={metadata}
                      language={language}
                      shareUrl={shareUrl}
                      onUnlock={handleUpgrade}
                      isPremium={isPremium}
                    />
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-12 glass-card border-red-500/20 max-w-lg mx-auto my-20"
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
                    onClick={() => window.location.href = '/start?reset=true'}
                    className="btn-secondary px-8 py-3 text-sm font-medium tracking-widest uppercase hover:bg-white/5 transition-all"
                  >
                    Start New Journey
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient Footer */}
      <Footer />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentStart={() => {
          console.log('Payment started');
        }}
        readingData={readingData ? { ...readingData, tarotCards: selectedCards, language } : undefined}
        currentReport={reportData}
        metadata={metadata}
        isDecisionAccepted={isDecisionAccepted}
      />

    </main >
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen relative z-20 bg-slate-950">
        <div className="w-12 h-12 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/60 text-sm animate-pulse tracking-widest font-cinzel">LOADING...</p>
      </div>
    }>
      <CosmicPathContent />
    </Suspense>
  );
}
