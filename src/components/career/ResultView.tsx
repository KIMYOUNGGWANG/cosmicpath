'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Compass, Sparkles, Stars, Target } from 'lucide-react';
import { CareerPremiumReport } from '@/types/career';

interface ResultViewProps {
  report: CareerPremiumReport;
  readingId?: string | null;
  onReset: () => void;
}

function splitParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function MetaPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/58">
      {label}
    </span>
  );
}

function NarrativeSection({
  icon: Icon,
  eyebrow,
  title,
  body,
  tone = 'default',
}: {
  icon: typeof Sparkles;
  eyebrow: string;
  title: string;
  body: string;
  tone?: 'default' | 'accent';
}) {
  const panelClass =
    tone === 'accent'
      ? 'border-amber-200/18 bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(255,255,255,0.04))]'
      : 'border-white/10 bg-white/6';

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[30px] border p-6 backdrop-blur-2xl ${panelClass}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/8 p-3 text-cyan-100">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div className="space-y-4 text-[15px] leading-8 text-white/76">
        {splitParagraphs(body).map((paragraph, index) => (
          <p key={`${title}-${index}`}>{paragraph}</p>
        ))}
      </div>
    </motion.section>
  );
}

function KeywordConstellation({ keywords }: { keywords: string[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[30px] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl"
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Career Signature</p>
      <h3 className="mt-2 text-xl font-semibold text-white">이 리포트가 잡아낸 핵심 강점</h3>
      <p className="mt-3 text-sm leading-7 text-white/60">
        아래 문구는 자기소개서, 포트폴리오, 면접 답변에 바로 녹일 수 있는 방향으로 정리한 키워드입니다.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-full border border-cyan-200/16 bg-cyan-100/8 px-4 py-2 text-sm text-cyan-50/86"
          >
            {keyword}
          </span>
        ))}
      </div>
    </motion.section>
  );
}

function ActionTimeline({ items }: { items: string[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 backdrop-blur-2xl"
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Action Blueprint</p>
      <h3 className="mt-2 text-xl font-semibold text-white">움직임을 바꾸는 실행 순서</h3>
      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex gap-4 rounded-[24px] border border-white/8 bg-slate-950/38 px-4 py-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/10 text-sm font-semibold text-amber-100">
              {index + 1}
            </div>
            <p className="pt-1 text-sm leading-7 text-white/74">{item}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export function ResultView({ report, readingId, onReset }: ResultViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 backdrop-blur-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <MetaPill label="Career Oracle" />
          {readingId ? <MetaPill label={`Reading ${readingId.slice(0, 8)}`} /> : null}
        </div>
        <h2 className="mt-5 text-3xl font-semibold leading-tight text-white md:text-[2.2rem]">
          당신의 커리어는 “더 열심히”보다 “어디에 힘을 써야 하는지”를 먼저 알아야 풀립니다.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">{report.snapshot}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <NarrativeSection
          icon={Stars}
          eyebrow="Why Now"
          title="왜 지금 이 고민이 반복되는가"
          body={report.phase1_pastAnalysis}
        />
        <NarrativeSection
          icon={Compass}
          eyebrow="Timing Window"
          title="언제 움직여야 손해를 줄이고 기회를 잡는가"
          body={report.phase2_timing}
          tone="accent"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <NarrativeSection
          icon={Sparkles}
          eyebrow="Saju Reading"
          title="사주가 말하는 커리어 흐름"
          body={report.sajuTiming}
        />
        <NarrativeSection
          icon={ArrowRight}
          eyebrow="Astrology Reading"
          title="점성술이 드러내는 적성과 조직 궁합"
          body={report.astrologyTalent}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <NarrativeSection
          icon={Target}
          eyebrow="Tarot Reading"
          title="지금 끊고 밀어야 할 선택"
          body={report.tarotAdvice}
        />
        <KeywordConstellation keywords={report.phase3_keywords} />
      </div>

      <ActionTimeline items={report.actionPlan} />

      <div className="flex justify-center pt-1">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/78 transition hover:border-white/15 hover:bg-white/10 hover:text-white"
        >
          새 커리어 리딩 다시 시작
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
