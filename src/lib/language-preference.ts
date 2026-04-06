export type SupportedLanguage = 'ko' | 'en';

export const USER_LANGUAGE_STORAGE_KEY = 'user_language';

export function resolvePreferredLanguage(value?: string | null): SupportedLanguage {
    return value?.toLowerCase().includes('en') ? 'en' : 'ko';
}

export function readStoredLanguage(): SupportedLanguage | null {
    if (typeof window === 'undefined') return null;

    const stored = window.localStorage.getItem(USER_LANGUAGE_STORAGE_KEY);
    return stored === 'ko' || stored === 'en' ? stored : null;
}

export function readPreferredClientLanguage(): SupportedLanguage {
    return readStoredLanguage() || resolvePreferredLanguage(window.navigator.language);
}

export function getLandingVariant(language: SupportedLanguage): string {
    return language === 'en'
        ? 'en_korean_saju_decision_timing_v1'
        : 'ko_decision_timing_oracle_v1';
}
