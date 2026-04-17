'use client';

import { motion } from 'framer-motion';
import { ReadingInput, type ReadingData } from '@/components/reading/reading-input';
import type { ReadingContext } from '@/lib/ai/prompt-builder';

type StartInputStageProps = {
  language: 'ko' | 'en';
  initialData?: Partial<ReadingData>;
  isLoading: boolean;
  inviterName?: string;
  inviteCode?: string;
  initialContext?: ReadingContext;
  initialQuestion?: string;
  onLanguageChange: (language: 'ko' | 'en') => void;
  onSubmit: (data: ReadingData) => void;
};

export function StartInputStage(props: StartInputStageProps) {
  return (
    <motion.div
      key="input"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto w-full max-w-4xl px-4 pt-24 pb-12 md:px-6 md:pt-32 md:pb-20"
    >
      <div className="mb-8 text-center md:mb-16">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-6 shadow-[0_24px_70px_rgba(2,6,23,0.24)] backdrop-blur-xl md:rounded-[32px] md:px-10 md:py-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-acc-gold">
              {props.language === 'en' ? 'Decision Timing Reading' : '결정 타이밍 리딩'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
              {props.language === 'en' ? 'Free First Reading' : '첫 리딩 무료'}
            </span>
          </div>
          <h1 className="mb-3 mt-4 font-cinzel text-[2rem] text-starlight md:mb-4 md:mt-5 md:text-5xl">
            {props.language === 'en' ? 'Start With The Question' : '지금 고민되는 질문부터 적어보세요'}
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-white/60 md:leading-7">
            {props.language === 'en'
              ? 'Start with one real question, then choose the tarot card your intuition reaches for before the first result opens.'
              : '질문 하나와 핵심 정보로 시작하고, 직관이 끌리는 타로 카드를 고른 뒤 첫 결과를 여는 흐름으로 다시 다듬었습니다.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45 md:mt-5">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {props.language === 'en' ? 'Pick Domain' : '영역 고르기'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {props.language === 'en' ? 'Write Question' : '질문 적기'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {props.language === 'en' ? 'Core Saju Inputs' : '생년월일 입력'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {props.language === 'en' ? 'Choose Tarot' : '타로 고르기'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {props.language === 'en' ? 'See Free Result' : '무료 결과 보기'}
            </span>
          </div>
        </div>
      </div>

      <ReadingInput
        initialData={props.initialData}
        initialLanguage={props.language}
        onLanguageChange={props.onLanguageChange}
        onSubmit={(data) => {
          props.onSubmit({
            ...data,
            birthTime: data.birthTime || '12:00',
            calendarType: data.calendarType || 'solar',
            unknownTime: data.unknownTime || false,
          });
        }}
        isLoading={props.isLoading}
        inviterName={props.inviterName}
        inviteCode={props.inviteCode}
        initialContext={props.initialContext}
        initialQuestion={props.initialQuestion}
      />
    </motion.div>
  );
}
