import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

type ResultErrorPanelProps = {
  language: 'ko' | 'en';
  streamContent: string;
  isPremium: boolean;
  hasPaidQuery: boolean;
  onUnlock: () => Promise<void>;
  onRetryPremium: () => void;
  onRetryFree: () => void;
  onReturnToInput: () => void;
};

export function QuotaExceededPanel(props: Pick<ResultErrorPanelProps, 'language' | 'streamContent' | 'onUnlock' | 'onReturnToInput'>) {
  const parts = props.streamContent.split('|');
  const message = parts[1] || '';
  const hoursLeft = parseInt(parts[2] || '0', 10);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto my-20 max-w-lg rounded-[28px] border border-[#D4AF37]/20 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_50%)] p-8 md:p-12 text-center backdrop-blur-md shadow-[0_28px_60px_rgba(0,0,0,0.4)]"
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
        <span className="text-3xl">🔒</span>
      </div>
      <h3 className="mb-3 text-xl font-bold text-white font-cinzel">
        {props.language === 'en' ? "Today's Free Reading Used" : '오늘의 무료 사주를 이미 사용했습니다'}
      </h3>
      <p className="mb-6 text-sm font-light leading-relaxed text-white/60">{message}</p>
      {hoursLeft > 0 && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37]/60 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
          </span>
          {props.language === 'en' ? `Next free reading in ~${hoursLeft}h` : `다음 무료 리딩까지 약 ${hoursLeft}시간`}
        </div>
      )}
      <button
        onClick={() => { void props.onUnlock(); }}
        className="w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#f0c35c] to-[#d88b16] py-4 font-bold text-black shadow-lg shadow-[#D4AF37]/20 transition-all hover:shadow-[#D4AF37]/40 hover:-translate-y-0.5 cursor-pointer"
      >
        {props.language === 'en' ? 'Unlock Detailed Decision Note' : '자세한 결정 노트 열기'}
      </button>
      <p className="mt-3 text-xs text-white/30">
        {props.language === 'en'
          ? '5 locked sections · Timing · Career · Love · Blind spot · Action plan'
          : '잠긴 5개 섹션 · 대운 타이밍 · 직업 · 연애 · 사각지대 · 행동 가이드'}
      </p>
      <button
        onClick={props.onReturnToInput}
        className="mt-6 text-xs text-white/35 underline decoration-white/15 underline-offset-4 transition-colors hover:text-white/60 cursor-pointer"
      >
        {props.language === 'en' ? 'Back to my inputs' : '작성한 내용으로 돌아가기'}
      </button>
    </motion.div>
  );
}

export function InterruptedResultPanel(props: ResultErrorPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card mx-auto my-20 max-w-lg border-red-500/20 p-12 text-center"
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <span className="text-3xl italic text-red-400 font-cinzel">!</span>
      </div>
      <h3 className="mb-4 text-xl text-red-200 font-cinzel">
        {props.language === 'en' ? 'Analysis Interrupted' : '결과를 불러오지 못했어요'}
      </h3>
      <p className="mb-6 text-sm font-light leading-relaxed text-gray-400">
        {props.streamContent || (props.language === 'en'
          ? 'This decision note could not be completed at this moment.'
          : '지금은 결과를 끝까지 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')}
      </p>
      <div className="flex flex-col items-center justify-center gap-3">
        {(props.isPremium || props.hasPaidQuery) ? (
          <button
            onClick={props.onRetryPremium}
            className="btn-primary flex items-center gap-2 px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all hover:brightness-110"
          >
            <RefreshCw size={16} />
            {props.language === 'en' ? 'Retry Analysis' : '분석 이어서 진행하기'}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={props.onRetryFree}
              className="btn-primary flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all hover:brightness-110"
            >
              <RefreshCw size={16} />
              {props.language === 'en' ? 'Retry Reading' : '리딩 다시 시도하기'}
            </button>
            <button
              onClick={props.onReturnToInput}
              className="btn-secondary px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all hover:bg-white/5"
            >
              {props.language === 'en' ? 'Back To My Inputs' : '작성한 내용 다시 보기'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
