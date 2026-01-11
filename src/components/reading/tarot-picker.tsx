'use client';

/**
 * 타로 카드 선택 컴포넌트
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAJOR_ARCANA, TarotCard, selectCardByIndex } from '@/lib/engines/tarot';

interface TarotPickerProps {
    onSelect: (cards: TarotCard[]) => void;
    maxCards?: number;
    language?: 'ko' | 'en';
}

export function TarotPicker({ onSelect, maxCards = 1, language = 'ko' }: TarotPickerProps) {
    const isEn = language === 'en';
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
    const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    const handleCardClick = (index: number) => {
        if (isComplete) return;

        // 이미 선택된 카드면 무시
        if (selectedIndices.includes(index)) return;

        // 카드 뒤집기
        setFlippedCards(prev => new Set(prev).add(index));

        // 짧은 딜레이 후 선택 처리
        setTimeout(() => {
            const card = selectCardByIndex(index, true);

            setSelectedIndices(prev => [...prev, index]);
            setSelectedCards(prev => [...prev, card]);

            // 최대 카드 수에 도달하면 완료
            if (selectedIndices.length + 1 >= maxCards) {
                setIsComplete(true);
                setTimeout(() => {
                    onSelect([...selectedCards, card]);
                }, 500);
            }
        }, 300);
    };

    // 카드 섞기 효과를 위한 랜덤 순서
    const [shuffledOrder] = useState(() =>
        [...Array(22).keys()].sort(() => Math.random() - 0.5)
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* 안내 메시지 */}
            <div className="text-center">
                <h3 className="text-xl text-gold mb-2">
                    {isEn ? '🔮 Select Your Tarot Cards' : '🔮 타로 카드를 선택하세요'}
                </h3>
                <p className="text-gray-400">
                    {isEn
                        ? `Choose ${maxCards} cards that your intuition guides you to`
                        : `직관적으로 끌리는 카드 ${maxCards}장을 선택해주세요`
                    } ({selectedIndices.length}/{maxCards})
                </p>
            </div>

            {/* 카드 그리드 */}
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {shuffledOrder.map((cardIndex, displayIndex) => {
                    const card = MAJOR_ARCANA[cardIndex];
                    const isSelected = selectedIndices.includes(cardIndex);
                    const isFlipped = flippedCards.has(cardIndex);

                    return (
                        <motion.div
                            key={cardIndex}
                            initial={{ opacity: 0, rotateY: -90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            transition={{ delay: displayIndex * 0.03 }}
                            onClick={() => handleCardClick(cardIndex)}
                            className={`tarot-card ${isFlipped ? 'flipped' : ''} ${isSelected ? 'selected' : ''}`}
                        >
                            <div className="tarot-card-inner">
                                {/* 뒷면 (보이는 면) */}
                                <div className="tarot-card-front">
                                    <div className="text-4xl opacity-50">✨</div>
                                </div>

                                {/* 앞면 (카드 정보) */}
                                <div className="tarot-card-back w-full h-full bg-slate-900 rounded-lg overflow-hidden relative">
                                    {/* 실제 이미지 */}
                                    {card.image && (
                                        <img
                                            src={card.image}
                                            alt={isEn ? card.nameEn : card.name}
                                            className="w-full h-full object-cover opacity-90"
                                        />
                                    )}
                                    {/* 텍스트 오버레이 */}
                                    <div className="absolute bottom-0 w-full bg-black/60 p-1 text-center backdrop-blur-sm">
                                        <span className="text-[10px] font-bold text-white">
                                            {isEn ? card.nameEn : card.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* 선택된 카드 표시 */}
            <AnimatePresence>
                {selectedCards.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="glass-card p-4"
                    >
                        <h4 className="text-sm text-gray-400 mb-3">{isEn ? 'Selected Cards:' : '선택된 카드:'}</h4>
                        <div className="flex flex-wrap gap-4">
                            {selectedCards.map((card, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 bg-white/5 pr-4 rounded-lg overflow-hidden border border-white/10"
                                >
                                    <div className={`w-12 h-16 bg-gray-800 shrink-0 ${card.isReversed ? 'rotate-180' : ''}`}>
                                        {card.image && <img src={card.image} alt={isEn ? card.nameEn : card.name} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gold">
                                            {isEn ? card.nameEn : card.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {card.isReversed
                                                ? (isEn ? 'Reversed' : '역방향 (Reversed)')
                                                : (isEn ? 'Upright' : '정방향 (Upright)')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}


