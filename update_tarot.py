import re

with open('src/components/reading/premium-report-sections.tsx', 'r') as f:
    content = f.read()

# Add useEffect to imports if not present
if 'useEffect' not in content:
    content = content.replace("import { useState, type UIEvent } from 'react';", "import { useState, useEffect, type UIEvent } from 'react';")

# Find TarotSpreadSection
start_str = "export function TarotSpreadSection({"
end_str = "export function TraitsSection({"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_section = """export function TarotSpreadSection({
  cards,
  onCardClick,
  language,
}: {
  cards: { name: string; isReversed: boolean; image?: string }[];
  onCardClick: (idx: number) => void;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const roles = isEn
    ? ['Current Situation', 'Challenge/Obstacle', 'Solution/Outcome']
    : ['현재 상황', '장애물/과제', '해결책/결과'];

  const [flipped, setFlipped] = useState<boolean[]>(cards.map(() => false));
  const [autoRevealed, setAutoRevealed] = useState(false);

  useEffect(() => {
    // Auto flip after 1.5 seconds if not already flipped
    const timer = setTimeout(() => {
      setFlipped(cards.map(() => true));
      setAutoRevealed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [cards]);

  const handleCardClick = (idx: number) => {
    if (!flipped[idx]) {
      const newFlipped = [...flipped];
      newFlipped[idx] = true;
      setFlipped(newFlipped);
    } else {
      onCardClick(idx);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-6 px-4 md:px-6"
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <EvidenceTooltip
          tag="🔮"
          sources={['tarot']}
          explanation={isEn
            ? 'Reads the current intuition and psychological state through Tarot cards.'
            : '타로 카드를 통해 현재의 직관과 심리 상태를 읽어냅니다.'}
        />
        {isEn ? 'Tarot Reading' : '타로 리딩'}
      </h2>
      <div className="grid grid-cols-3 gap-2 md:gap-4 relative perspective-[1000px]">
        {cards.map((card, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <motion.div
              onClick={() => handleCardClick(idx)}
              className="group relative aspect-[2/3] w-full cursor-pointer rounded-lg transition-all"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped[idx] ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            >
              {/* Back of Card */}
              <div 
                className="absolute inset-0 backface-hidden rounded-lg border border-[#D4AF37]/30 bg-[#0a0a0c] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="w-full h-full border border-white/5 m-1 rounded-md flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                    <Star size={16} className="text-[#D4AF37]/50" />
                </div>
              </div>

              {/* Front of Card */}
              <div 
                className="absolute inset-0 backface-hidden rounded-lg border border-white/10 hover:border-tarot-purple/50 overflow-hidden"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.name}
                      className={cn('h-full w-full object-cover', card.isReversed && 'rotate-180')}
                      onError={(event) => {
                        (event.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className={cn(
                        'h-full w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
                        card.isReversed && 'rotate-180'
                      )}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-2 text-center transition-all group-hover:bg-black/20">
                    <span
                      className={cn(
                        'notranslate text-[10px] font-bold text-white/90 md:text-sm shadow-black drop-shadow-md',
                        card.isReversed && 'text-red-300'
                      )}
                      translate="no"
                    >
                      {card.name}
                      {card.isReversed && (isEn ? ' (Rev)' : ' (역)')}
                    </span>
                  </div>
              </div>
            </motion.div>
            <span className="mt-2 text-[10px] font-medium text-gold md:text-xs">
              {roles[idx] || (isEn ? `Card ${idx + 1}` : `카드 ${idx + 1}`)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-[10px] text-gray-500">
        {isEn
          ? 'Click each card to see detailed integrated interpretation.'
          : '각 카드를 클릭하면 상세한 융합 해석을 볼 수 있습니다.'}
      </p>
    </motion.section>
  );
}

"""
    
    new_content = content[:start_idx] + new_section + content[end_idx:]
    with open('src/components/reading/premium-report-sections.tsx', 'w') as f:
        f.write(new_content)
    print("Successfully updated TarotSpreadSection.")
else:
    print("Could not find boundaries for TarotSpreadSection.")
