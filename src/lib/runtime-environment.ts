export type RuntimeEnvironment = 'production' | 'preview' | 'development' | 'test';

function normalizeRuntimeEnvironment(value: string | null | undefined): RuntimeEnvironment | null {
    if (!value) return null;

    const normalized = value.trim().toLowerCase();
    if (normalized === 'production' || normalized === 'preview' || normalized === 'development' || normalized === 'test') {
        return normalized;
    }

    return null;
}

export function getRuntimeEnvironment(): RuntimeEnvironment {
    const explicitEnvironment =
        normalizeRuntimeEnvironment(process.env.APP_RUNTIME_ENV) ??
        normalizeRuntimeEnvironment(process.env.RUNTIME_ENV);

    if (explicitEnvironment) {
        return explicitEnvironment;
    }

    const vercelEnvironment = normalizeRuntimeEnvironment(process.env.VERCEL_ENV);
    if (vercelEnvironment) {
        return vercelEnvironment;
    }

    return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

export function stampRuntimeMetadata<T extends object>(metadata: T): T & {
    runtimeEnvironment: RuntimeEnvironment;
} {
    return {
        ...metadata,
        runtimeEnvironment: getRuntimeEnvironment(),
    };
}

export function getRuntimeEnvironmentFromRecord(record: Record<string, unknown> | null | undefined): RuntimeEnvironment | null {
    const runtimeEnvironment = record?.runtimeEnvironment;
    if (typeof runtimeEnvironment === 'string') {
        return normalizeRuntimeEnvironment(runtimeEnvironment);
    }

    const legacyEnvironment = record?.environment;
    if (typeof legacyEnvironment === 'string') {
        return normalizeRuntimeEnvironment(legacyEnvironment);
    }

    return null;
}

export function matchesCurrentRuntimeEnvironment(tag: RuntimeEnvironment | null | undefined): boolean {
    const currentEnvironment = getRuntimeEnvironment();

    if (!tag) {
        return currentEnvironment === 'production';
    }

    return tag === currentEnvironment;
}

export function isExternalEffectsDisabled(): boolean {
    const value = process.env.COSMICPATH_DISABLE_EXTERNAL_EFFECTS;
    if (!value) return false;

    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true';
}
