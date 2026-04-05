'use client';

import {
    getOracleIntentLabel,
    type OraclePersonaLanguage,
    type OraclePersonaProfile,
} from '@/lib/ai/oracle-personas';

interface OracleSelectCardProps {
    language: OraclePersonaLanguage;
    persona: OraclePersonaProfile;
    selected: boolean;
    recommended: boolean;
    onSelect: () => void;
}

export function OracleSelectCard({
    language,
    persona,
    selected,
    recommended,
    onSelect,
}: OracleSelectCardProps) {
    const isEn = language === 'en';
    const strengths = isEn ? persona.strengthsEn : persona.strengthsKo;
    const specialtyLabel = getOracleIntentLabel(persona.specialty, language);

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`group rounded-[24px] border px-4 py-4 text-left transition-all duration-300 ${
                selected
                    ? 'border-acc-gold bg-acc-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p
                            className={`font-cinzel text-base tracking-[0.12em] uppercase ${
                                selected ? 'text-acc-gold' : 'text-starlight'
                            }`}
                        >
                            {persona.name}
                        </p>
                        {recommended && (
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-acc-gold">
                                {isEn ? 'Auto Match' : '자동 매칭'}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/40">
                        {persona.title}
                    </p>
                </div>
                <div
                    className={`mt-1 h-2.5 w-2.5 rounded-full transition-colors ${
                        selected ? 'bg-acc-gold' : 'bg-white/20 group-hover:bg-white/40'
                    }`}
                />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {specialtyLabel}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {isEn ? 'Evidence' : '근거'}: {persona.evidencePriority.join(' > ')}
                </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-white/70">
                {persona.description}
            </p>

            <div className="mt-4 space-y-2">
                {strengths.slice(0, 2).map((strength) => (
                    <p key={strength} className="text-xs leading-relaxed text-white/52">
                        {strength}
                    </p>
                ))}
            </div>
        </button>
    );
}
