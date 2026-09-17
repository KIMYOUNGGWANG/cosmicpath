import { NextRequest } from 'next/server';

const PRODUCTION_DOMAINS = [
  'https://cosmicpath.live',
  'https://www.cosmicpath.live',
  'https://cosmicpath.app',
  'https://www.cosmicpath.app',
];

export function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;

  const trimmed = origin.trim().replace(/\/+$/, '');
  if (!trimmed) return false;

  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '');
  if (configuredAppUrl && trimmed === configuredAppUrl) {
    return true;
  }

  if (PRODUCTION_DOMAINS.includes(trimmed)) {
    return true;
  }

  try {
    const url = new URL(trimmed);

    // Vercel preview deployments
    if (url.hostname.endsWith('.vercel.app')) {
      return true;
    }

    // Local development origins
    if (process.env.NODE_ENV !== 'production') {
      if (
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname.endsWith('.local')
      ) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

export function resolveSafeAppOrigin(request?: NextRequest | Request | { headers: Headers }): string {
  const fallback =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.cosmicpath.app');

  if (!request) {
    return fallback;
  }

  const headers = 'headers' in request ? request.headers : undefined;
  if (!headers) {
    return fallback;
  }

  const originHeader = headers.get('origin');
  if (originHeader && isAllowedOrigin(originHeader)) {
    return originHeader.trim().replace(/\/+$/, '');
  }

  const forwardedHost = headers.get('x-forwarded-host');
  const forwardedProto = headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    const candidate = `${forwardedProto}://${forwardedHost.split(',')[0].trim()}`;
    if (isAllowedOrigin(candidate)) {
      return candidate.replace(/\/+$/, '');
    }
  }

  const host = headers.get('host');
  if (host) {
    const candidate = `https://${host.split(',')[0].trim()}`;
    if (isAllowedOrigin(candidate)) {
      return candidate.replace(/\/+$/, '');
    }
  }

  return fallback;
}

/**
 * Validates and sanitizes a return URL to prevent Open Redirect attacks.
 * Only allows relative paths (starting with '/' and not '//') or absolute URLs matching allowed origins.
 */
export function getSafeReturnUrl(
  returnUrl: string | null | undefined,
  fallbackPath: string = '/'
): string {
  if (!returnUrl) {
    return fallbackPath;
  }

  const trimmed = returnUrl.trim();
  if (!trimmed) {
    return fallbackPath;
  }

  // Safe relative paths: starts with '/' but not '//' or '/\'
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return trimmed;
  }

  // Check if absolute URL belongs to an allowed origin
  try {
    const parsed = new URL(trimmed);
    if (isAllowedOrigin(parsed.origin)) {
      return trimmed;
    }
  } catch {
    return fallbackPath;
  }

  return fallbackPath;
}
