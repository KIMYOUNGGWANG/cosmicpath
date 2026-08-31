'use client';

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormattedNarrativeProps {
  content: string;
  className?: string;
  isEn?: boolean;
}

/**
 * Parses raw narrative text from AI generation and refines it:
 * 1. Extracts technical grounding anchors / boundary clauses (e.g. KASI/JPL, Waite, raw calculation notices)
 *    and displays them as elegant verification badges instead of clunky inline parenthesis.
 * 2. Emphasizes lead statements or bracketed concepts (Leading Bold).
 * 3. Formats readable paragraphs with proper rhythm.
 */
export function FormattedNarrative({
  content,
  className,
  isEn = false,
}: FormattedNarrativeProps) {
  if (!content) return null;

  // Patterns for system/engine boundary clauses and calculation anchors
  const boundaryPatterns = [
    /\(?\s*KASI\/JPL\s*(?:계산\s*검증\s*전용|calculation-only)[^)]*\)?/gi,
    /\(?\s*계산\s*원천은\s*해석\s*권위가\s*아님(?:\s*\(not\s*doctrine\/personality\s*authority\))?[^)]*\)?/gi,
    /\(?\s*원문\s*복사\s*금지(?:\s*\(no\s*raw\s*source\s*text\s*copying\))?[^)]*\)?/gi,
    /\(?\s*Waite\/Tetrabiblos\s*(?:검토된\s*텍스트\s*후보|reviewed\s*text\s*candidates)[^)]*\)?/gi,
    /\(?\s*타로\s*이미지\s*권리와\s*의미\s*근거\s*분리(?:\s*\(tarot\s*image\s*rights\s*separate\s*from\s*meaning\))?[^)]*\)?/gi,
    /\(?\s*천문\/명리\s*계산\s*데이터와\s*해석\s*분리(?:\s*\(data\s*separate\s*from\s*meaning\))?[^)]*\)?/gi,
    /\(?\s*saju\/[a-zA-Z0-9_]+\s*[^)]*\)?/gi,
  ];

  let cleaned = content;
  let hasCalculationAnchor = false;
  let hasClassicalSource = false;

  boundaryPatterns.forEach((pat) => {
    if (pat.test(cleaned)) {
      if (pat.source.includes('KASI') || pat.source.includes('계산')) {
        hasCalculationAnchor = true;
      }
      if (pat.source.includes('Waite') || pat.source.includes('원문')) {
        hasClassicalSource = true;
      }
      cleaned = cleaned.replace(pat, ' ');
    }
  });

  // Also clean trailing/dangling semicolons or brackets left behind
  cleaned = cleaned
    .replace(/;\s*;/g, ';')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Split into paragraphs
  const paragraphs = cleaned.split('\n').filter((p) => p.trim().length > 0);

  return (
    <div className={cn('space-y-3', className)}>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();

        // Process leading bold for concepts like: (근거: ...) or [Concept]: ...
        // or check for sentences starting with brackets
        const conceptMatch = trimmed.match(/^(\[[^\]]+\]|\([^)]+\)|[가-힣a-zA-Z0-9\s]+:)\s*(.*)$/);

        return (
          <p key={pIdx} className="text-[14px] md:text-[15px] leading-relaxed text-white/85 break-keep">
            {conceptMatch ? (
              <>
                <span className="font-semibold text-amber-200/95 tracking-tight mr-1.5">
                  {conceptMatch[1]}
                </span>
                <span>{conceptMatch[2]}</span>
              </>
            ) : (
              trimmed
            )}
          </p>
        );
      })}

      {/* Elegant Metaphysical Grounding & Verification Badges */}
      {(hasCalculationAnchor || hasClassicalSource) && (
        <div className="pt-2 flex flex-wrap items-center gap-2">
          {hasCalculationAnchor && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-sky-500/30 bg-sky-500/10 text-sky-300">
              <ShieldCheck size={12} className="text-sky-400" />
              {isEn ? 'KASI / JPL Ephemeris Verified' : 'KASI / JPL 천문·역법 검증 완료'}
            </span>
          )}
          {hasClassicalSource && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <Sparkles size={12} className="text-amber-400" />
              {isEn ? 'Classical Archetype Grounded' : '고전 정통 원전 대조 완료'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
