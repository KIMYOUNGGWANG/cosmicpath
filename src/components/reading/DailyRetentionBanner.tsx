'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Language = 'ko' | 'en';

interface DailyRetentionBannerProps {
  language?: Language;
}

const LAST_READING_KEY = 'cp_last_reading_date';

function getTodayKst(): string {
  // KST 기준 날짜 문자열 반환 (YYYY-MM-DD)
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0]!;
}

export function DailyRetentionBanner({ language = 'ko' }: DailyRetentionBannerProps) {
  const [visible, setVisible] = useState(false);
  const isEn = language === 'en';

  useEffect(() => {
    const today = getTodayKst();

    // 오늘 이미 daily를 봤으면 배너 숨김
    try {
      const lastDate = localStorage.getItem(LAST_READING_KEY);
      if (lastDate === today) {
        return;
      }
    } catch {
      // localStorage 접근 불가 → 배너 표시
    }

    // 리딩 완료 날짜 저장
    try {
      localStorage.setItem(LAST_READING_KEY, today);
    } catch {
      // ignore
    }

    // 약간의 딜레이 후 표시 (결과 화면이 먼저 보이도록)
    const timer = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-6 w-full max-w-lg px-4"
    >
      <Link
        href="/daily"
        id="daily-retention-banner"
        className="group flex items-center gap-4 rounded-[22px] border border-white/[0.09] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-4 backdrop-blur-sm transition-all duration-300 hover:border-cyan-300/20 hover:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.13),transparent_55%)]"
      >
        {/* 아이콘 */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xl transition-transform duration-300 group-hover:scale-105">
          🌙
        </div>

        {/* 텍스트 */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/50 mb-0.5">
            {isEn ? 'Tomorrow Check-In' : '내일 결정 체크인'}
          </p>
          <p className="text-[13.5px] font-medium leading-snug text-white/80 group-hover:text-white/95">
            {isEn
              ? 'Come back tomorrow and check whether the timing shifted'
              : '내일 다시 와서 이 결정의 타이밍이 바뀌었는지 확인하세요'}
          </p>
          <p className="mt-0.5 text-[11px] text-cyan-300/55">
            {isEn ? 'Resets at midnight · Free daily signal →' : '자정 갱신 · 매일 무료 신호 →'}
          </p>
        </div>

        {/* 화살표 */}
        <div className="shrink-0 text-cyan-300/35 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-300/60">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
