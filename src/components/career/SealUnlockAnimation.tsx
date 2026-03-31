'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SealUnlockAnimationProps {
  onComplete: () => void;
}

// Generate stable random values outside the component to avoid React's "impure function" render rules
const PARTICLES = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  x: (i * 7) % 100, // Deterministic "random" positions
  y: (i * 13) % 100,
  duration: 2 + (i % 3),
  delay: (i % 5) * 0.4,
  scale: 0.5 + (i % 4) * 0.25,
}));

export function SealUnlockAnimation({ onComplete }: SealUnlockAnimationProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050814]/90 backdrop-blur-xl"
      onAnimationComplete={() => {
          // Trigger completion after a delay to show the animation
          setTimeout(onComplete, 2500);
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Outer Glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 h-48 w-48 -translate-x-12 -translate-y-12 rounded-full bg-gradient-to-tr from-amber-400/20 via-cyan-400/20 to-teal-400/20 blur-[60px]"
        />

        {/* Central Seal */}
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full border-2 border-amber-300/50 bg-slate-900 shadow-[0_0_40px_rgba(251,191,36,0.3)]"
        >
            <motion.div
                animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.1, 1] 
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <Sparkles className="h-12 w-12 text-amber-300" />
            </motion.div>
        </motion.div>

        {/* Expanding Ring */}
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute z-0 h-32 w-32 rounded-full border-2 border-amber-300/30"
        />

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
        >
            <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-white">봉인 해제 중</h2>
            <p className="mt-2 text-sm text-cyan-200/50">운명의 궤적을 재구성하고 있습니다...</p>
        </motion.div>
      </div>

      {/* Particle Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map((p) => (
              <motion.div
                  key={p.id}
                  initial={{ 
                      x: p.x + "%", 
                      y: p.y + "%",
                      opacity: 0
                  }}
                  animate={{ 
                      y: [null, (p.y - 30) + "%"],
                      opacity: [0, 1, 0],
                      scale: [0, p.scale, 0]
                  }}
                  transition={{ 
                      duration: p.duration,
                      repeat: Infinity,
                      delay: p.delay
                  }}
                  className="absolute h-1 w-1 rounded-full bg-amber-200 blur-[1px]"
              />
          ))}
      </div>
    </motion.div>
  );
}
