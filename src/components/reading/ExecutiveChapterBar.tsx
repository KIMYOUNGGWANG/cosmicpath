'use client';

import { motion } from 'framer-motion';
import { Sparkles, Calendar, Layers, Users, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChapterKey = 'brief' | 'timing' | 'intelligence' | 'life';

export interface ChapterDef {
  key: ChapterKey;
  targetId: string;
  titleKo: string;
  titleEn: string;
  badgeKo: string;
  badgeEn: string;
  icon: typeof Sparkles;
  descriptionKo: string;
}

export const CHAPTER_DEFS: ChapterDef[] = [
  {
    key: 'brief',
    targetId: 'domain-brief',
    titleKo: '1. 결단 브리프',
    titleEn: '1. Executive Brief',
    badgeKo: '결단',
    badgeEn: 'Brief',
    icon: Sparkles,
    descriptionKo: '30초 결단 요약 · 실전 액션 플랜 · 길일 캘린더',
  },
  {
    key: 'timing',
    targetId: 'domain-timing',
    titleKo: '2. 타이밍 로드맵',
    titleEn: '2. Timing Roadmap',
    badgeKo: '타이밍',
    badgeEn: 'Timing',
    icon: Calendar,
    descriptionKo: '12개월 운세 장부 · 48주 히트맵 · 108년 마하탁사',
  },
  {
    key: 'intelligence',
    targetId: 'domain-intelligence',
    titleKo: '3. 5대 엔진 명반',
    titleEn: '3. Deep Intelligence',
    badgeKo: '명반',
    badgeEn: 'Charts',
    icon: Layers,
    descriptionKo: '자미두수 12궁 · 사주 4주 · 서양점성 · 신살승화 · 수비학',
  },
  {
    key: 'life',
    targetId: 'domain-life',
    titleKo: '4. 인연 & 1:1 상담',
    titleEn: '4. Life & Allies',
    badgeKo: '인연',
    badgeEn: 'Life',
    icon: Users,
    descriptionKo: '4대 인생영역 · 천을귀인 · 4차원 궁합 · 1:1 오라클 AI 챗',
  },
];

interface ExecutiveChapterBarProps {
  activeChapter: ChapterKey;
  onSelectChapter: (chapter: ChapterKey) => void;
  language?: 'ko' | 'en';
  progress?: number;
}

export function ExecutiveChapterBar({
  activeChapter,
  onSelectChapter,
  language = 'ko',
  progress = 0,
}: ExecutiveChapterBarProps) {
  const isEn = language === 'en';

  const scrollToTarget = (_targetId: string, chapterKey: ChapterKey) => {
    onSelectChapter(chapterKey);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 mb-8 bg-[#090807]/95 backdrop-blur-xl border-y border-[#c8a84d]/30 shadow-[0_12px_36px_rgba(0,0,0,0.7)] transition-all">
      {/* Top Header & Reading Progress */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#c8a84d] animate-pulse" />
            <span className="text-[11px] font-mono text-[#e6ca7d] font-semibold uppercase tracking-wider">
              {isEn ? 'Dossier Reading Radar' : 'VIP 리포트 네비게이션 레이더'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/50 font-mono">
              {isEn ? 'Reading' : '열람 진행률'} {progress}%
            </span>
            <button
              onClick={scrollToTop}
              className="hidden sm:flex items-center gap-1 text-[10px] text-white/40 hover:text-[#f5d77f] font-mono transition-colors"
              title="Top of Dossier"
            >
              <ChevronUp className="w-3 h-3" />
              <span>TOP</span>
            </button>
          </div>
        </div>

        {/* Chapter Anchor Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {CHAPTER_DEFS.map((chapter) => {
            const Icon = chapter.icon;
            const isActive = activeChapter === chapter.key;

            return (
              <button
                key={chapter.key}
                onClick={() => scrollToTarget(chapter.targetId, chapter.key)}
                className={cn(
                  'group relative shrink-0 flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border',
                  isActive
                    ? 'bg-gradient-to-r from-[#c8a84d]/25 via-[#c8a84d]/15 to-transparent text-[#f5d77f] border-[#c8a84d] shadow-[0_0_20px_rgba(200,168,77,0.25)] ring-1 ring-[#c8a84d]/40'
                    : 'bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                )}
              >
                <Icon
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-[#f5d77f]' : 'text-white/40'
                  )}
                />
                <span className="whitespace-nowrap font-medium">
                  {isEn ? chapter.titleEn : chapter.titleKo}
                </span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded font-mono',
                    isActive
                      ? 'bg-[#c8a84d]/30 text-[#f5d77f]'
                      : 'bg-white/5 text-white/40'
                  )}
                >
                  {isEn ? chapter.badgeEn : chapter.badgeKo}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thin Gold Progress Bar along bottom edge */}
      <div className="w-full h-0.5 bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#c8a84d] via-[#f5d77f] to-[#c8a84d]"
          style={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut', duration: 0.2 }}
        />
      </div>
    </div>
  );
}

