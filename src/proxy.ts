/**
 * Next.js Proxy - Security Headers & Request Processing
 *
 * Applied to all requests. Adds security headers to all responses.
 */

import { NextResponse } from 'next/server';

// Security headers configuration
const securityHeaders = [
    // XSS Protection
    { key: 'X-XSS-Protection', value: '1; mode=block' },

    // Prevent MIME type sniffing
    { key: 'X-Content-Type-Options', value: 'nosniff' },

    // Clickjacking prevention
    { key: 'X-Frame-Options', value: 'DENY' },

    // Referrer policy
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

    // Permissions policy (disable unused APIs)
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },

    // HSTS (only in production)
    ...(process.env.NODE_ENV === 'production' ? [
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }
    ] : []),

    // Content Security Policy (Report-Only for safe initial deployment)
    // Change to 'Content-Security-Policy' after verifying no violations in production
    {
        key: 'Content-Security-Policy-Report-Only',
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://t1.kakaocdn.net https://developers.kakao.com https://www.googletagmanager.com https://va.vercel-scripts.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob: https://*.stripe.com https://www.google-analytics.com",
            "connect-src 'self' https://api.stripe.com https://ka-f.fontawesome.com https://*.google-analytics.com https://vitals.vercel-insights.com",
            "frame-src https://js.stripe.com https://hooks.stripe.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ')
    },
];

export function proxy() {
    // Clone the response
    const response = NextResponse.next();

    // Apply security headers
    securityHeaders.forEach(({ key, value }) => {
        response.headers.set(key, value);
    });

    // Add request ID for tracing
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-Id', requestId);

    return response;
}

export default proxy;

// Apply to all routes except static files
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
