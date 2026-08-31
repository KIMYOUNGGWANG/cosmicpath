'use client';

import { motion } from 'framer-motion';
import { ReadingInput, type ReadingData } from '@/components/reading/reading-input';
import { START_RECEPTION_COPY } from '@/components/reading/intake/reception-copy';
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
  const isRelationshipContactEntry =
    props.landingSource === 'next_move_report_mvp_v1' ||
    props.landingSource === 'relationship_contact_timing_v1' ||
    props.landingSource === 'en_relationship_contact_timing_v1';
  const isDecisionTimingEntry = props.landingSource === 'decision_timing_rebuild_v1';
  const isQuestionFirstEntry = isRelationshipContactEntry || isDecisionTimingEntry;
  const copy = START_RECEPTION_COPY[props.language];

  return (
    <motion.div
      data-start-intake
      key="input"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto w-full max-w-[1720px] px-4 pt-24 pb-12 md:px-8 md:pt-32 md:pb-20 lg:px-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-14 items-start">
        <div className="flex-1 w-full max-w-4xl mx-auto lg:mx-0">
          <div className="mb-8 md:mb-12">
            <div className="rounded-[24px] border border-[#d7c59a]/20 bg-[#141516]/95 px-6 py-8 shadow-[0_22px_70px_rgba(0,0,0,0.22)] md:px-10 md:py-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-[#d7c59a]/30 bg-[#d7c59a]/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#d7c59a]">
                  {copy.badge}
                </span>
              </div>
              <h1 className="mb-3 mt-4 font-cinzel text-[2rem] text-starlight md:mb-4 md:mt-5 md:text-5xl">
                {copy.title}
              </h1>
              <p className="max-w-2xl break-keep text-sm leading-6 text-moonlight md:leading-7">
                {props.language === 'ko' ? (
                  <>
                    <span className="block sm:hidden">5대 계산 엔진으로 선택을 정리합니다.</span>
                    <span className="block sm:hidden">첫 판정은 무료입니다. 생년월일만 필수입니다.</span>
                    <span className="hidden sm:inline">{copy.subtitle}</span>
                  </>
                ) : copy.subtitle}
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
            isNextMoveReportEntry={isQuestionFirstEntry}
            isRelationshipContactEntry={isRelationshipContactEntry}
          />
        </div>

        <div className="hidden lg:flex flex-col gap-6 sticky top-32">
          <div className="border border-[#d7c59a]/18 bg-[#111315]/90 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-4 border-b border-[#d7c59a]/12 pb-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center border border-[#d7c59a]/25 bg-[#d7c59a]/10">
                <span className="font-cinzel text-[#d7c59a] text-lg">01</span>
              </div>
              <div>
                <h3 className="font-semibold text-starlight">{copy.sideTitle}</h3>
                <p className="text-xs text-moonlight">
                  {copy.sideSubtitle}
                </p>
              </div>
            </div>
            
            <p className="text-sm italic text-moonlight mb-6">
              {copy.sideNote}
            </p>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-starlight">
                {copy.writingTitle}
              </h4>
              <ul className="space-y-3 text-sm text-moonlight">
                {copy.writingItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-[#d7c59a]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
