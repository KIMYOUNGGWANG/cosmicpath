/**
 * Audit Logger
 * 
 * Logs security-relevant events for monitoring and compliance
 */

export type AuditEventType =
    | 'PAYMENT_INITIATED'
    | 'PAYMENT_COMPLETED'
    | 'PAYMENT_FAILED'
    | 'PROMO_USED'
    | 'PROMO_INVALID_ATTEMPT'
    | 'RATE_LIMIT_EXCEEDED'
    | 'VALIDATION_FAILED'
    | 'READING_CREATED'
    | 'MATCH_SESSION_CREATED'
    | 'EMAIL_SENT'
    | 'SUSPICIOUS_ACTIVITY';

interface AuditLogEntry {
    timestamp: string;
    eventType: AuditEventType;
    ip?: string;
    userId?: string; // For future use
    sessionId?: string;
    metadata?: Record<string, unknown>;
    severity: 'info' | 'warning' | 'critical';
}

/**
 * Log an audit event
 * In production, this could be extended to send to external logging service
 */
export function auditLog(
    eventType: AuditEventType,
    options: {
        ip?: string;
        sessionId?: string;
        metadata?: Record<string, unknown>;
        severity?: 'info' | 'warning' | 'critical';
    } = {}
): void {
    const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        ip: options.ip ? maskIp(options.ip) : undefined,
        sessionId: options.sessionId,
        metadata: options.metadata,
        severity: options.severity || getSeverity(eventType),
    };

    // Console log with structured format
    const prefix = entry.severity === 'critical' ? '🚨' :
        entry.severity === 'warning' ? '⚠️' :
            '📋';

    console.log(`${prefix} [AUDIT] ${entry.eventType}`, JSON.stringify(entry));

    // TODO: In production, send to external logging service (e.g., Datadog, LogDNA)
    // if (process.env.NODE_ENV === 'production') {
    //     sendToLoggingService(entry);
    // }
}

// Mask IP address for privacy (keep first two octets)
function maskIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.*.*`;
    }
    return ip.substring(0, 10) + '***';
}

// Determine severity based on event type
function getSeverity(eventType: AuditEventType): 'info' | 'warning' | 'critical' {
    const criticalEvents: AuditEventType[] = ['PAYMENT_FAILED', 'SUSPICIOUS_ACTIVITY'];
    const warningEvents: AuditEventType[] = ['RATE_LIMIT_EXCEEDED', 'PROMO_INVALID_ATTEMPT', 'VALIDATION_FAILED'];

    if (criticalEvents.includes(eventType)) return 'critical';
    if (warningEvents.includes(eventType)) return 'warning';
    return 'info';
}

/**
 * Helper: Extract IP from request headers
 */
export function getClientIp(headers: Headers): string {
    return headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        'unknown';
}
