'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Compass, 
  Calendar, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  Printer, 
  Layers, 
  Activity, 
  Scale, 
  Star,
  Zap,
  TrendingUp,
  Heart,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChapterKey, CHAPTER_DEFS } from './ExecutiveChapterBar';

export interface NavSectionItem {
  id: string;
  label: string;
  labelEn: string;
  icon: typeof Sparkles;
  phaseNum?: number;
  chapter: ChapterKey;
}

export const NAV_SECTIONS: NavSectionItem[] = [
  { id: 'section-executive', label: 'VIP 30초 총괄 브리프', labelEn: 'Executive Brief', icon: Sparkles, chapter: 'brief' },
  { id: 'section-action', label: '실전 액션 플랜', labelEn: 'Action Blueprint', icon: CheckCircle2, chapter: 'brief' },
  { id: 'section-dates', label: '길일 / 흉일 캘린더', labelEn: 'Super Days Calendar', icon: Calendar, chapter: 'brief' },

  { id: 'section-flow', label: '12개월 운세 장부', labelEn: '12-Month Fortune', icon: Calendar, chapter: 'timing' },
  { id: 'section-weekly-heatmap', label: '48주 주간 히트맵', labelEn: '48-Week Heatmap', icon: TrendingUp, chapter: 'timing' },
  { id: 'section-thai-astrology', label: '태국 점성술 (마하탁사)', labelEn: 'Thai Maha Thaksa', icon: Crown, chapter: 'timing' },

  { id: 'section-ziwei', label: '자미두수 12궁 명반', labelEn: 'Ziwei 12 Palaces', icon: Layers, chapter: 'intelligence' },
  { id: 'section-core', label: '오행 & 사주 원국', labelEn: '5 Elements & Saju', icon: Scale, chapter: 'intelligence' },
  { id: 'section-shadow-transformation', label: '전화위복 (살 승화)', labelEn: 'Shadow Superpowers', icon: Zap, chapter: 'intelligence' },
  { id: 'section-saju', label: '정통 사주 4주 분석', labelEn: '4 Pillars Matrix', icon: Activity, chapter: 'intelligence' },
  { id: 'section-astro', label: '점성술 행성 기상도', labelEn: 'Astrology Deep', icon: Star, chapter: 'intelligence' },
  { id: 'section-numerology', label: '수비학 & 5단 의사결정', labelEn: '5-Layer Strategy', icon: Compass, chapter: 'intelligence' },

  { id: 'section-life-areas', label: '4대 인생 영역', labelEn: '4 Life Areas', icon: Briefcase, chapter: 'life' },
  { id: 'section-special', label: '천을귀인 & 조력자', labelEn: 'Noble Person & Allies', icon: Users, chapter: 'life' },
  { id: 'section-compatibility-4d', label: '4차원 궁합·화해법', labelEn: '4D Synergy', icon: Heart, chapter: 'life' },
  { id: 'section-followup-chat', label: '1:1 오라클 AI 챗', labelEn: '1:1 Oracle Chat', icon: MessageSquare, chapter: 'life' },
];

interface ReportSidebarNavProps {
  language?: 'ko' | 'en';
  onPrint?: () => void;
  availableSectionIds: string[];
  activeChapter?: ChapterKey;
  onSelectChapter?: (chapter: ChapterKey) => void;
  onChapterInView?: (chapter: ChapterKey) => void;
}

export function ReportSidebarNav({
  language = 'ko',
  onPrint,
  availableSectionIds,
  activeChapter = 'brief',
  onSelectChapter,
  onChapterInView,
}: ReportSidebarNavProps) {
  const isEn = language === 'en';
  const [activeId, setActiveId] = useState<string>('section-executive');
  const [scrollProgress, setScrollProgress] = useState(0);

  // All available sections are rendered continuously in the Bento Dossier
  const visibleSections = NAV_SECTIONS.filter((s) => availableSectionIds.includes(s.id));

  // Scroll spy & reading progress
  useEffect(() => {
    const handleScroll = () => {
      // Calculate overall page scroll progress
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        const scrolled = (winScroll / height) * 100;
        setScrollProgress(Math.min(100, Math.max(0, Math.round(scrolled))));
      }

      // Determine active section using viewport bounding rect
      for (let i = visibleSections.length - 1; i >= 0; i--) {
        const section = document.getElementById(visibleSections[i].id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 240) {
            setActiveId(visibleSections[i].id);
            // Only update active chapter indicator, NEVER trigger scroll!
            if (onChapterInView && visibleSections[i].chapter !== activeChapter) {
              onChapterInView(visibleSections[i].chapter);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleSections, activeChapter, onChapterInView]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 135;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
      setActiveId(id);
    }
  };

  const scrollToChapter = (chapterKey: ChapterKey) => {
    if (onSelectChapter) {
      onSelectChapter(chapterKey);
    }
  };

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 rounded-2xl border border-[#c8a84d]/25 bg-[#0e0d0a]/92 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {/* Header & Progress Bar */}
        <div className="mb-3 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between text-xs font-bold text-[#e6ca7d] mb-1.5 uppercase tracking-wider">
            <span>{isEn ? 'Dossier Index' : '리포트 목차'}</span>
            <span className="font-mono text-[11px] text-white/60">{scrollProgress}%</span>
          </div>
          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#c8a84d] to-[#f5d77f]"
              style={{ width: `${scrollProgress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>
        </div>

        {/* Chapter Quick Jump Buttons */}
        <div className="mb-3 pb-3 border-b border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">
            {isEn ? 'QUICK DOMAIN JUMP' : '핵심 영역 바로가기'}
          </span>
          <div className="grid grid-cols-2 gap-1">
            {CHAPTER_DEFS.map((ch) => {
              const isCurrent = activeChapter === ch.key;
              return (
                <button
                  key={ch.key}
                  onClick={() => scrollToChapter(ch.key)}
                  className={cn(
                    'px-2 py-1.5 rounded-lg text-[11px] font-medium text-left truncate transition-all',
                    isCurrent
                      ? 'bg-[#c8a84d]/30 text-[#f5d77f] font-bold border border-[#c8a84d]/50 shadow-sm'
                      : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/5'
                  )}
                >
                  {isEn ? ch.badgeEn : ch.titleKo.split('. ')[1] || ch.titleKo}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Links */}
        <nav className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto no-scrollbar pr-1">
          {visibleSections.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-[#c8a84d]/20 to-transparent border border-[#c8a84d]/40 text-[#f5d77f] font-bold shadow-[0_0_15px_rgba(200,168,77,0.15)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05] border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-[#c8a84d]' : 'text-white/40'
                  )}
                />
                <span className="truncate flex-1">
                  {idx + 1}. {isEn ? item.labelEn : item.label}
                </span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c8a84d] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Print / Save Trigger */}
        {onPrint && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <button
              onClick={onPrint}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/[0.05] text-xs font-semibold text-white/80 hover:text-white hover:bg-[#c8a84d]/20 hover:border-[#c8a84d]/40 transition-all shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 text-[#c8a84d]" />
              <span>{isEn ? 'Print / Save PDF' : 'PDF 리포트 출력·저장'}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
