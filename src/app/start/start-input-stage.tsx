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
  landingSource?: string;
  onLanguageChange: (language: 'ko' | 'en') => void;
  onSubmit: (data: ReadingData) => void;
};

export function StartInputStage(props: StartInputStageProps) {
  const isNextMoveReportEntry = props.landingSource === 'next_move_report_mvp_v1';

  return (
    <motion.div
      key="input"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto w-full max-w-[1820px] px-4 pt-24 pb-12 md:px-8 md:pt-32 md:pb-20 lg:px-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-16 items-start">
        {/* Left Column: Input Canvas */}
        <div className="flex-1 w-full max-w-4xl mx-auto lg:mx-0">
          <div className="mb-8 md:mb-12">
            <div className="rounded-[28px] border border-white/10 bg-panel px-6 py-8 shadow-2xl backdrop-blur-xl md:rounded-[32px] md:px-10 md:py-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-acc-gold">
                  {isNextMoveReportEntry
                    ? 'Next Move Report'
                    : (props.language === 'en' ? 'Decision Timing Reading' : '결정 타이밍 리딩')}
                </span>
              </div>
              <h1 className="mb-3 mt-4 font-cinzel text-[2rem] text-starlight md:mb-4 md:mt-5 md:text-5xl">
                {isNextMoveReportEntry
                  ? (props.language === 'en' ? 'Contact them, or wait?' : '연락할까, 기다릴까부터 정리해볼까요')
                  : (props.language === 'en' ? 'Move Now, Or Wait?' : '지금 움직일지, 기다릴지 먼저 정리해볼까요')}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-moonlight md:leading-7">
                {isNextMoveReportEntry
                  ? (props.language === 'en'
                      ? 'Start with the relationship or DM decision. The free result shows the contact verdict, evidence summary, and next message move before the full report.'
                      : '연락 타이밍 질문 하나부터 넣어주세요. 무료 결과는 연락 판정, 근거 요약, 다음 연락 행동을 먼저 보여주고 전체 리포트는 그 뒤에 엽니다.')
                  : (props.language === 'en'
                      ? 'Start with one real decision. The free result will show the first verdict, the evidence, and the next action before the full report.'
                      : '진짜로 망설이는 질문 하나부터 넣어주세요. 무료 결과에서 판정, 근거, 다음 행동을 먼저 보여주고 전체 리포트는 그 뒤에 엽니다.')}
              </p>
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
            isNextMoveReportEntry={isNextMoveReportEntry}
          />
        </div>

        {/* Right Column: Guide Rail */}
        <div className="hidden lg:flex flex-col gap-6 sticky top-32">
          <div className="glass-card p-6 border-line bg-surface/80">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10">
                <span className="font-cinzel text-acc-gold text-lg">결</span>
              </div>
              <div>
                <h3 className="font-semibold text-starlight">Oracle Guide</h3>
                <p className="text-xs text-moonlight">
                  {isNextMoveReportEntry ? 'Contact Timing & Safety' : 'Analytic & Neutral'}
                </p>
              </div>
            </div>
            
            <p className="text-sm italic text-moonlight mb-6">
              {isNextMoveReportEntry
                ? '상대 반응을 보장하지 않고, 지금 보낼지 기다릴지와 피해야 할 압박 신호만 분리합니다.'
                : '막연한 운세가 아닌 행동의 방향을 잡기 위해, 질문은 구체적일수록 좋습니다.'}
            </p>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-starlight">Input Tips</h4>
              <ul className="space-y-3 text-sm text-moonlight">
                <li className="flex gap-3">
                  <span className="text-acc-gold">•</span>
                  <span><strong>관계:</strong> 먼저 보낼 메시지, 마지막 연락, 지금의 거리감을 포함해주세요.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-acc-gold">•</span>
                  <span><strong>근거:</strong> 사주, 타로, 점성술은 선택 근거 레이어로만 씁니다.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-acc-gold">•</span>
                  <span><strong>안전:</strong> 압박, 확인 집착, 스토킹성 행동은 보류 신호로 다룹니다.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
