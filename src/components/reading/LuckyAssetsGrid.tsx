'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, UtensilsCrossed, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LuckyAssetsData {
    colors: {
        name: string;
        hex: string;
        reason: string;
    }[];
    foods: {
        name: string;
        emoji: string;
        benefit: string;
    }[];
    places: {
        name: string;
        description: string;
    }[];
}

interface LuckyAssetsGridProps {
    data: LuckyAssetsData;
    language?: 'ko' | 'en';
}

// Duplicate imports removed
// Duplicate interface removed

export function LuckyAssetsGrid({ data, language = 'ko' }: LuckyAssetsGridProps) {
    const isEn = language === 'en';
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

    if (!data) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 px-4 md:px-6"
        >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-gold" />
                {isEn ? 'Lucky Assets' : '행운의 요소'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lucky Colors */}
                <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-2xl p-5 space-y-4 hover:border-pink-500/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2 pb-3 border-b border-pink-500/20">
                        <div className="p-2 rounded-lg bg-pink-500/20 text-pink-300">
                            <Palette size={18} />
                        </div>
                        <h3 className="text-base font-bold text-pink-100">
                            {isEn ? 'Lucky Colors' : '행운의 컬러'}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {data.colors.map((color, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedItem({
                                    type: 'color',
                                    title: color.name,
                                    subTitle: color.hex,
                                    description: color.reason,
                                    color: color.hex
                                })}
                                className="group flex flex-col items-center text-center gap-3 p-3 rounded-xl bg-pink-500/5 hover:bg-pink-500/10 transition-colors border border-pink-500/10 cursor-pointer active:scale-95 duration-200"
                            >
                                <div
                                    className="w-14 h-14 rounded-full shrink-0 border-4 border-white/10 shadow-lg group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color.hex }}
                                />
                                <div className="w-full">
                                    <p className="text-sm font-bold text-white break-keep leading-tight mb-1">{color.name}</p>
                                    <div className="flex justify-center mb-1">
                                        <span className="text-[10px] font-mono text-pink-300/80 bg-pink-900/40 px-2 py-0.5 rounded-full">{color.hex}</span>
                                    </div>
                                    <p className="text-xs text-pink-200/60 line-clamp-2 leading-relaxed">{color.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lucky Foods */}
                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-5 space-y-4 hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2 pb-3 border-b border-orange-500/20">
                        <div className="p-2 rounded-lg bg-orange-500/20 text-orange-300">
                            <UtensilsCrossed size={18} />
                        </div>
                        <h3 className="text-base font-bold text-orange-100">
                            {isEn ? 'Lucky Foods' : '행운의 음식'}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {data.foods.map((food, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedItem({
                                    type: 'food',
                                    title: food.name,
                                    description: food.benefit,
                                    emoji: food.emoji
                                })}
                                className="group flex flex-col items-center text-center gap-3 p-3 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 transition-colors border border-orange-500/10 cursor-pointer active:scale-95 duration-200"
                            >
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-900/20 flex items-center justify-center shrink-0 text-3xl shadow-inner group-hover:scale-110 transition-transform ring-1 ring-orange-500/20">
                                    {food.emoji}
                                </div>
                                <div className="w-full">
                                    <p className="text-sm font-bold text-white break-keep mb-1">{food.name}</p>
                                    <p className="text-xs text-orange-200/60 line-clamp-2 leading-relaxed">{food.benefit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lucky Places */}
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-5 space-y-4 hover:border-blue-500/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2 pb-3 border-b border-blue-500/20">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                            <MapPin size={18} />
                        </div>
                        <h3 className="text-base font-bold text-blue-100">
                            {isEn ? 'Lucky Places' : '행운의 장소'}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {data.places.map((place, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedItem({
                                    type: 'place',
                                    title: place.name,
                                    description: place.description
                                })}
                                className="group flex flex-col items-center text-center gap-3 p-3 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors border border-blue-500/10 cursor-pointer active:scale-95 duration-200"
                            >
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-900/20 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform shadow-lg">
                                    <MapPin className="text-blue-300" size={20} />
                                </div>
                                <div className="w-full">
                                    <p className="text-sm font-bold text-white break-keep mb-1">{place.name}</p>
                                    <p className="text-xs text-blue-200/60 line-clamp-2 leading-relaxed">{place.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-[#1a1c23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className={cn("p-6 border-b border-white/5",
                                selectedItem.type === 'color' && "bg-pink-500/10",
                                selectedItem.type === 'food' && "bg-orange-500/10",
                                selectedItem.type === 'place' && "bg-blue-500/10"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 border-white/10 text-3xl",
                                        selectedItem.type === 'color' && "border-pink-500/20",
                                        selectedItem.type === 'food' && "bg-orange-500/20 border-orange-500/20",
                                        selectedItem.type === 'place' && "bg-blue-500/20 border-blue-500/20"
                                    )} style={selectedItem.color ? { backgroundColor: selectedItem.color } : {}}>
                                        {selectedItem.emoji || (selectedItem.type === 'place' && <MapPin size={24} className="text-blue-300" />)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                                selectedItem.type === 'color' && "bg-pink-500/20 text-pink-300",
                                                selectedItem.type === 'food' && "bg-orange-500/20 text-orange-300",
                                                selectedItem.type === 'place' && "bg-blue-500/20 text-blue-300"
                                            )}>
                                                {selectedItem.type === 'color' && (isEn ? 'Lucky Color' : '행운의 컬러')}
                                                {selectedItem.type === 'food' && (isEn ? 'Lucky Food' : '행운의 음식')}
                                                {selectedItem.type === 'place' && (isEn ? 'Lucky Place' : '행운의 장소')}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{selectedItem.title}</h3>
                                        {selectedItem.subTitle && (
                                            <p className="text-sm text-gray-400 font-mono mt-0.5">{selectedItem.subTitle}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                    {selectedItem.description}
                                </p>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                                >
                                    {isEn ? 'Close' : '닫기'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.section >
    );
}
