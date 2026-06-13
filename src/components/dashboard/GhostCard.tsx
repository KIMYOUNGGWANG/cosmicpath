'use client';

import { motion } from 'framer-motion';
import { Flower, Eye, Navigation, Zap, Moon, Shield, PenTool, Crown, BookOpen, Flame, Gavel, Heart, Sword, GraduationCap, Sun, Sparkles, AlertTriangle, ShieldAlert, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ShinSalType } from '@/lib/engines/saju';

export type GhostType = ShinSalType;

interface GhostCardProps {
    type: GhostType;
    level: number; // 0-100
    isLocked?: boolean;
}

const GHOST_CONFIG: Record<ShinSalType, {
    label: string;
    icon: LucideIcon;
    color: string;
    desc: string;
    oneLiner: string;
}> = {
    [ShinSalType.DOHWA]: {
        label: "도화살 (Peach Blossom)",
        icon: Flower,
        color: "from-pink-500 to-rose-500",
        desc: "눈길을 끄는 강한 매력. 연예인, 인플루언서처럼 주목받는 기운.",
        oneLiner: "Magnetic Appeal"
    },
    [ShinSalType.HWAGAE]: {
        label: "화개살 (Covered Splendor)",
        icon: Moon,
        color: "from-indigo-400 to-slate-500",
        desc: "고독 속에 피어나는 예술성. 철학자, 아티스트의 기운.",
        oneLiner: "Solitary Genius"
    },
    [ShinSalType.YORKMA]: {
        label: "역마살 (Travel Horse)",
        icon: Navigation,
        color: "from-emerald-400 to-teal-500",
        desc: "한곳에 머물지 못하는 역동성. 글로벌, 여행가의 기운.",
        oneLiner: "Global Nomad"
    },
    [ShinSalType.YANGIN]: {
        label: "양인살 (Goat Blade)",
        icon: Zap,
        color: "from-red-500 to-orange-600",
        desc: "칼을 쥐고 휘두르는 카리스마. 리더, 혁명가의 기운.",
        oneLiner: "Ruthless Leader"
    },
    [ShinSalType.GWIMUN]: {
        label: "귀문관살 (Ghost Gate)",
        icon: Eye,
        color: "from-purple-500 to-violet-600",
        desc: "남들이 보지 못하는 것을 보는 직관. 예민함, 천재성.",
        oneLiner: "Sixth Sense"
    },
    [ShinSalType.CHEONEUL]: {
        label: "천을귀인 (Guardian)",
        icon: Shield,
        color: "from-yellow-400 to-amber-600",
        desc: "하늘이 내린 최고의 길신. 어려울 때 돕는 귀인이 따름.",
        oneLiner: "Divine Protection"
    },
    [ShinSalType.HYEONCHIM]: {
        label: "현침살 (Mystic Needle)",
        icon: PenTool,
        color: "from-cyan-400 to-blue-500",
        desc: "바늘처럼 예리한 분석력. 의료, IT, 디자인 분야의 전문가.",
        oneLiner: "Sharp Precision"
    },
    [ShinSalType.BANAN]: {
        label: "반안살 (Golden Saddle)",
        icon: Crown,
        color: "from-emerald-500 to-green-700",
        desc: "말 안장에 오르는 출세운. 시험 합격, 승진, 명예.",
        oneLiner: "Road to Success"
    },
    [ShinSalType.MOONCHANG]: {
        label: "문창귀인 (Academic Star)",
        icon: BookOpen,
        color: "from-blue-400 to-indigo-600",
        desc: "총명함과 뛰어난 문장력. 교수, 작가, 학자의 기운.",
        oneLiner: "Intellectual Genius"
    },
    [ShinSalType.BAEKHO]: {
        label: "백호대살 (White Tiger)",
        icon: Flame,
        color: "from-red-600 to-orange-700",
        desc: "호랑이 같은 맹렬한 기세. 엄청난 폭발력과 실행력.",
        oneLiner: "Fierce Energy"
    },
    [ShinSalType.GOEGANG]: {
        label: "괴강살 (Boss Energy)",
        icon: Gavel,
        color: "from-slate-600 to-neutral-800",
        desc: "모든 사람을 제압하는 우두머리. 강력한 리더십과 통솔력.",
        oneLiner: "Supreme Authority"
    },
    [ShinSalType.CHEONMUN]: {
        label: "천문성 (Heaven Gate)",
        icon: Heart,
        color: "from-sky-300 to-blue-400",
        desc: "하늘의 이치를 깨달은 자. 사람을 살리는 활인업의 기운.",
        oneLiner: "Divine Healer"
    },
    [ShinSalType.JANGSUNG]: {
        label: "장성살 (General Star)",
        icon: Sword,
        color: "from-blue-600 to-indigo-800",
        desc: "군대를 지휘하는 장군의 기운. 조직의 우두머리, 강력한 권위.",
        oneLiner: "Supreme Commander"
    },
    [ShinSalType.HAKDANG]: {
        label: "학당귀인 (Academy Noble)",
        icon: GraduationCap,
        color: "from-teal-500 to-emerald-600",
        desc: "학업과 문장에 뛰어난 기운. 교육자, 학술 분야의 성공.",
        oneLiner: "Great Scholar"
    },
    [ShinSalType.CHEONDEOK]: {
        label: "천덕귀인 (Heavenly Virtue)",
        icon: Sun,
        color: "from-orange-400 to-yellow-500",
        desc: "하늘의 은덕을 입는 길신. 흉한 일을 막아주고 복을 끌어옴.",
        oneLiner: "Divine Grace"
    },
    [ShinSalType.WOLDEOK]: {
        label: "월덕귀인 (Monthly Virtue)",
        icon: Sparkles,
        color: "from-amber-300 to-yellow-400",
        desc: "달의 은덕을 입는 길신. 대인관계가 원만하고 인덕이 따름.",
        oneLiner: "Lunar Blessing"
    },
    [ShinSalType.GEOBSAL]: {
        label: "겁살 (Robbery Star)",
        icon: AlertTriangle,
        color: "from-zinc-500 to-slate-700",
        desc: "빼앗거나 빼앗기는 강력한 에너지. 경쟁심, 승부욕, 파괴적 혁신.",
        oneLiner: "Ruthless Competitor"
    },
    [ShinSalType.JAESAL]: {
        label: "재살 (Disaster Star)",
        icon: ShieldAlert,
        color: "from-stone-600 to-neutral-800",
        desc: "재난을 피하는 지혜. 비상한 머리 회전과 위기 관리 능력.",
        oneLiner: "Crisis Strategist"
    },
    [ShinSalType.JEONGROK]: {
        label: "정록 (Celestial Wage)",
        icon: Shield,
        color: "from-lime-400 to-emerald-600",
        desc: "안정적인 복록과 신뢰를 얻는 품격 있는 생활 기반.",
        oneLiner: "Steady Fortune"
    },
    [ShinSalType.WOLSAY]: {
        label: "월살 (Creeper Star)",
        icon: Moon,
        color: "from-violet-500 to-indigo-700",
        desc: "고독한 몰입과 내면 성찰이 깊어지는 시기적 기운.",
        oneLiner: "Silent Depth"
    },
    [ShinSalType.CHEONSAL]: {
        label: "천살 (Heavenly Curse)",
        icon: AlertTriangle,
        color: "from-slate-500 to-gray-700",
        desc: "압박을 성장 동력으로 바꾸는 정신적 단련의 에너지.",
        oneLiner: "Trial by Sky"
    },
    [ShinSalType.JISAL]: {
        label: "지살 (Earthly Foundation)",
        icon: Navigation,
        color: "from-cyan-500 to-blue-700",
        desc: "이동과 환경 변화로 기반을 넓히는 확장형 기운.",
        oneLiner: "Ground Shift"
    },
    [ShinSalType.MANGSIN]: {
        label: "망신살 (Public Shame)",
        icon: Flame,
        color: "from-rose-500 to-red-700",
        desc: "노출과 평판 관리가 중요한 강한 표현의 에너지.",
        oneLiner: "Spotlight Risk"
    },
    [ShinSalType.YUKHAE]: {
        label: "육해살 (Six Damages)",
        icon: PenTool,
        color: "from-zinc-400 to-slate-600",
        desc: "민감한 감수성을 정교한 판단력으로 전환하는 기운.",
        oneLiner: "Keen Reflex"
    },
    [ShinSalType.HWANGEUN]: {
        label: "황은대사 (Imperial Grace)",
        icon: Star,
        color: "from-amber-400 to-yellow-600",
        desc: "하늘의 은혜로 큰 재앙을 면하고 도움을 얻는 기운.",
        oneLiner: "Heavenly Favor"
    }
};

export function GhostCard({ type, level, isLocked = false }: GhostCardProps) {
    const config = GHOST_CONFIG[type];
    if (!config) {
        return null;
    }
    const Icon = config.icon;

    if (level < 30) return null; // Don't show weak ghosts

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative group w-full h-full min-h-[340px] rounded-2xl overflow-hidden cursor-pointer"
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Border Glow */}
            <div className={`absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/30 transition-colors`} />

            {/* Content */}
            <div className="relative z-10 h-full p-5 flex flex-col justify-between items-center text-center">

                {/* Header */}
                <div className="w-full flex justify-between items-center opacity-70 text-xs tracking-widest font-mono">
                    <span>유형 0{Object.keys(GHOST_CONFIG).indexOf(type) + 1}</span>
                    <span>강도 {level}</span>
                </div>

                {/* Main Visual */}
                <div className="flex-1 flex flex-col justify-center items-center gap-3">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${config.color} shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                        <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-cinzel font-bold text-white leading-tight">
                        {config.label.split('(')[0]}
                    </h3>
                    <p className="text-xs text-white/60 font-serif italic">
                        &ldquo;{config.oneLiner}&rdquo;
                    </p>
                </div>

                {/* Footer / Description */}
                <div className="w-full pt-3 border-t border-white/10">
                    <p className="text-xs text-dim leading-relaxed">
                        {config.desc}
                    </p>
                </div>
            </div>

            {/* Locked Overlay */}
            {isLocked && (
                <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <Eye size={24} className="text-dim mb-2" />
                    <p className="text-sm text-dim font-cinzel">UNLOCK TO REVEAL</p>
                </div>
            )}
        </motion.div>
    );
}
