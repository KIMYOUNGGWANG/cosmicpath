import { sendOpsAlert } from '@/lib/ops-alert';

interface WebhookAlertParams {
    readonly severity: 'warning' | 'critical';
    readonly title: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
}

export async function alertWebhookIssue(params: WebhookAlertParams): Promise<void> {
    await sendOpsAlert({
        source: 'stripe-webhook',
        severity: params.severity,
        title: params.title,
        message: params.message,
        details: params.details,
        dedupeKey: `stripe-webhook:${params.title}`,
    });
}
