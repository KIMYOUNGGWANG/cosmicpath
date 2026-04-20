'use client';

interface SajuBirthFormProps {
    birthDate: string;
    birthTime: string;
    gender: 'M' | 'F' | '';
    formError: string;
    isCheckingOut: boolean;
    onBirthDateChange: (value: string) => void;
    onBirthTimeChange: (value: string) => void;
    onGenderChange: (value: 'M' | 'F' | '') => void;
    onCheckout: () => void;
}

export function SajuBirthForm({
    birthDate,
    birthTime,
    gender,
    formError,
    isCheckingOut,
    onBirthDateChange,
    onBirthTimeChange,
    onGenderChange,
    onCheckout,
}: SajuBirthFormProps) {
    return (
        <section className="py-20 px-6">
            <div className="max-w-lg mx-auto">
                <div
                    className="rounded-3xl p-8 sm:p-10"
                    style={{
                        background: 'rgba(12,12,14,0.9)',
                        border: '1px solid rgba(212,175,55,0.2)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 0 80px rgba(212,175,55,0.06)',
                    }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#D4AF37' }}>
                            ✦ Begin your reading
                        </p>
                        <h2 className="font-serif text-2xl sm:text-3xl" style={{ color: '#E4E4E7', letterSpacing: '-0.02em' }}>
                            Enter your birth details
                        </h2>
                        <p className="mt-2 text-sm" style={{ color: '#71717A' }}>
                            Your exact birth moment is the cosmic coordinate Saju reads.
                        </p>
                    </div>

                    {/* Birth date */}
                    <div className="mb-5">
                        <label
                            htmlFor="saju-birth-date"
                            className="block text-xs uppercase tracking-widest mb-2"
                            style={{ color: '#A1A1AA' }}
                        >
                            Birth Date <span style={{ color: '#D4AF37' }}>*</span>
                        </label>
                        <input
                            id="saju-birth-date"
                            type="date"
                            value={birthDate}
                            onChange={e => onBirthDateChange(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: `1px solid ${birthDate ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                color: '#E4E4E7',
                                colorScheme: 'dark',
                            }}
                            max={new Date().toISOString().split('T')[0]}
                            min="1920-01-01"
                        />
                    </div>

                    {/* Birth time */}
                    <div className="mb-5">
                        <label
                            htmlFor="saju-birth-time"
                            className="block text-xs uppercase tracking-widest mb-2"
                            style={{ color: '#A1A1AA' }}
                        >
                            Birth Time{' '}
                            <span className="normal-case" style={{ color: '#52525B' }}>(optional, improves accuracy)</span>
                        </label>
                        <input
                            id="saju-birth-time"
                            type="time"
                            value={birthTime}
                            onChange={e => onBirthTimeChange(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: `1px solid ${birthTime ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                color: '#E4E4E7',
                                colorScheme: 'dark',
                            }}
                        />
                    </div>

                    {/* Gender */}
                    <div className="mb-8">
                        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#A1A1AA' }}>
                            Gender{' '}
                            <span className="normal-case" style={{ color: '#52525B' }}>(optional, refines elements)</span>
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {(['M', 'F'] as const).map(value => (
                                <button
                                    key={value}
                                    id={`saju-gender-${value}`}
                                    type="button"
                                    onClick={() => onGenderChange(gender === value ? '' : value)}
                                    className="rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
                                    style={{
                                        background: gender === value ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${gender === value ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.08)'}`,
                                        color: gender === value ? '#D4AF37' : '#71717A',
                                    }}
                                >
                                    {value === 'M' ? '♂ Male' : '♀ Female'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error message */}
                    {formError && (
                        <p className="mb-5 text-sm text-center rounded-xl py-2.5 px-4" style={{ color: '#FF3B30', background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}>
                            {formError}
                        </p>
                    )}

                    {/* Checkout button */}
                    <button
                        id="saju-checkout-btn"
                        type="button"
                        onClick={onCheckout}
                        disabled={isCheckingOut}
                        className="w-full py-4 rounded-full font-bold text-black text-base transition-all duration-300 disabled:opacity-60"
                        style={{
                            background: isCheckingOut
                                ? 'rgba(212,175,55,0.6)'
                                : 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                            boxShadow: isCheckingOut ? 'none' : '0 0 30px rgba(212,175,55,0.3)',
                        }}
                    >
                        {isCheckingOut ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Opening the oracle...
                            </span>
                        ) : (
                            'Decode My Destiny — $19'
                        )}
                    </button>

                    {/* Trust signals */}
                    <div className="mt-5 flex flex-col gap-2">
                        {[
                            '🔒 Secure payment via Stripe',
                            '⚡ Your reading is delivered instantly',
                            '✦ One-time payment · No subscription',
                        ].map(text => (
                            <p key={text} className="text-xs text-center" style={{ color: '#52525B' }}>{text}</p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
