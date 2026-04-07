import { Resend } from 'resend';
import { devLog } from '@/lib/dev-logger';
import { safeIncrementUsageCounter } from '@/lib/usage-metrics';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailLanguage = 'ko' | 'en';

function resolveEmailLanguage(value?: unknown): EmailLanguage {
    return value === 'en' ? 'en' : 'ko';
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatMonthDay(value: string | undefined, language: EmailLanguage): string | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ko-KR', {
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function buildResultEmailContent(params: {
    language: EmailLanguage;
    cleanTitle: string;
    resultUrl: string;
    birthInfo?: string;
    sajuSummary?: string;
    userContext?: string;
}) {
    const isEnglish = params.language === 'en';
    const subject = isEnglish
        ? 'Your CosmicPath reading is ready'
        : 'CosmicPath 리딩이 준비됐어요';
    const title = isEnglish ? 'Your reading is ready' : '리딩이 준비됐어요';
    const subtitle = isEnglish
        ? 'Open it now, then come back whenever you want a clearer next step.'
        : '지금 열어보고, 다음 행동이 더 궁금할 때 다시 돌아오세요.';
    const focusLabel = isEnglish ? 'What this reading is about' : '이번 리딩 주제';
    const focusValue = params.userContext?.trim() || params.cleanTitle;
    const birthLabel = isEnglish ? 'Birth details' : '생년월일 정보';
    const birthValue = params.birthInfo?.trim() || (isEnglish ? 'Not added' : '입력되지 않음');
    const summaryLabel = isEnglish ? 'Saju summary' : '사주 요약';
    const summaryValue = params.sajuSummary?.trim() || (isEnglish ? 'Still being prepared' : '아직 정리되지 않았어요');
    const buttonLabel = isEnglish ? 'Open my reading' : '내 리딩 열기';
    const backupLabel = isEnglish
        ? 'If the button does not open, use this link:'
        : '버튼이 열리지 않으면 아래 링크를 사용해 주세요:';

    return {
        subject,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${escapeHtml(subject)}</title>
            </head>
            <body style="margin:0;padding:24px;background:#08080f;color:#e5e7eb;font-family:Inter,Arial,sans-serif;">
                <div style="max-width:560px;margin:0 auto;border:1px solid rgba(212,175,55,.18);border-radius:24px;background:#10111c;overflow:hidden;">
                    <div style="padding:32px 28px;background:linear-gradient(180deg,rgba(212,175,55,.16),rgba(16,17,28,0));border-bottom:1px solid rgba(255,255,255,.08);">
                        <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#f4d88a;">CosmicPath</p>
                        <h1 style="margin:0;font-size:30px;line-height:1.2;color:#ffffff;">${escapeHtml(title)}</h1>
                        <p style="margin:14px 0 0 0;font-size:15px;line-height:1.7;color:#cbd5e1;">${escapeHtml(subtitle)}</p>
                    </div>

                    <div style="padding:28px;">
                        <div style="display:grid;gap:14px;">
                            <div style="padding:18px;border-radius:18px;background:#15182a;border:1px solid rgba(255,255,255,.08);">
                                <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f4d88a;">${escapeHtml(focusLabel)}</p>
                                <p style="margin:0;font-size:15px;line-height:1.7;color:#ffffff;">${escapeHtml(focusValue)}</p>
                            </div>
                            <div style="padding:18px;border-radius:18px;background:#15182a;border:1px solid rgba(255,255,255,.08);">
                                <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f4d88a;">${escapeHtml(birthLabel)}</p>
                                <p style="margin:0;font-size:15px;line-height:1.7;color:#ffffff;">${escapeHtml(birthValue)}</p>
                            </div>
                            <div style="padding:18px;border-radius:18px;background:#15182a;border:1px solid rgba(255,255,255,.08);">
                                <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f4d88a;">${escapeHtml(summaryLabel)}</p>
                                <p style="margin:0;font-size:15px;line-height:1.7;color:#ffffff;">${escapeHtml(summaryValue)}</p>
                            </div>
                        </div>

                        <div style="margin-top:28px;text-align:center;">
                            <a href="${escapeHtml(params.resultUrl)}" style="display:inline-block;padding:15px 24px;border-radius:14px;background:linear-gradient(135deg,#d4af37,#f4d88a);color:#08080f;text-decoration:none;font-size:16px;font-weight:800;">
                                ${escapeHtml(buttonLabel)}
                            </a>
                        </div>
                    </div>

                    <div style="padding:20px 28px 28px;border-top:1px solid rgba(255,255,255,.08);">
                        <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#94a3b8;">${escapeHtml(backupLabel)}</p>
                        <a href="${escapeHtml(params.resultUrl)}" style="color:#f4d88a;font-size:13px;line-height:1.7;word-break:break-all;text-decoration:none;">
                            ${escapeHtml(params.resultUrl)}
                        </a>
                    </div>
                </div>
            </body>
            </html>
        `,
    };
}

function buildFollowUpEmailContent(params: {
    language: EmailLanguage;
    stage: 'D2_DISCOUNT' | 'D5_COSMIC_WINDOW' | 'H48' | 'D7';
    promoCode?: string;
    discount?: number;
    readingUrl: string;
    offerUrl?: string;
    dailyUrl?: string;
    expiresAt?: string;
}) {
    const isEnglish = params.language === 'en';
    const expiryLabel = formatMonthDay(params.expiresAt, params.language);

    if (params.stage === 'D2_DISCOUNT' || params.stage === 'H48') {
        return {
            subject: isEnglish
                ? 'A small discount if you want to keep going'
                : '이어서 보고 싶다면 할인 코드를 써보세요',
            title: isEnglish
                ? 'Want to keep going?'
                : '이어서 보고 싶으신가요?',
            body: isEnglish
                ? 'If the first reading was useful, you can open the deeper report with a small discount.'
                : '첫 리딩이 도움이 됐다면, 할인 코드로 더 깊은 리포트를 열어보세요.',
            detailLabel: isEnglish ? 'Discount code' : '할인 코드',
            detailTitle: params.promoCode || '',
            detailBody: isEnglish
                ? `${params.discount ?? 20}% off is ready for you.${expiryLabel ? ` Use it by ${expiryLabel}.` : ''}`
                : `${params.discount ?? 20}% 할인 코드가 준비되어 있어요.${expiryLabel ? ` ${expiryLabel}까지 사용할 수 있습니다.` : ''}`,
            primaryLabel: isEnglish ? 'Open the full report' : '전체 리포트 열기',
            primaryUrl: params.offerUrl || params.readingUrl,
            secondaryLabel: isEnglish ? 'Open my reading again' : '기존 리딩 다시 보기',
            secondaryUrl: params.readingUrl,
        };
    }

    if (params.stage === 'D5_COSMIC_WINDOW') {
        const hasDailyDestination = Boolean(params.dailyUrl);
        return {
            subject: isEnglish
                ? hasDailyDestination
                    ? 'Check today’s signal in one minute'
                    : 'Take one minute to check your reading again'
                : '오늘의 신호를 1분 안에 확인해보세요',
            title: isEnglish
                ? hasDailyDestination
                    ? 'A quick check for today'
                    : 'A quick check-in'
                : '오늘 흐름을 가볍게 확인해보세요',
            body: isEnglish
                ? hasDailyDestination
                    ? 'Open today’s signal and compare it with your last reading. It is an easy way to see what needs your attention right now.'
                    : 'Open your reading again and check what still feels true today. It is a simple way to see what needs your attention right now.'
                : '오늘의 신호를 열어보고 지난 리딩과 나란히 비교해보세요. 지금 어디에 먼저 신경 써야 하는지 더 쉽게 보입니다.',
            detailLabel: isEnglish ? 'Simple next step' : '쉬운 다음 단계',
            detailTitle: isEnglish
                ? hasDailyDestination
                    ? 'Check today, then compare'
                    : 'Read it again with today in mind'
                : '오늘 보고, 지난 리딩과 비교하기',
            detailBody: isEnglish
                ? hasDailyDestination
                    ? 'You do not need to learn a new system first. Just look at today’s pattern and see whether it matches your current question.'
                    : 'You do not need to study anything new first. Just reopen the reading and see whether it still matches your current question.'
                : '어려운 해석부터 다시 공부할 필요는 없어요. 오늘 흐름이 지금 질문과 맞는지만 먼저 확인하면 됩니다.',
            primaryLabel: isEnglish
                ? hasDailyDestination
                    ? 'Check today’s signal'
                    : 'Open my reading again'
                : '오늘의 신호 보기',
            primaryUrl: hasDailyDestination ? (params.dailyUrl || params.readingUrl) : params.readingUrl,
            secondaryLabel: isEnglish ? 'Open my reading again' : '기존 리딩 다시 보기',
            secondaryUrl: params.readingUrl,
        };
    }

    return {
        subject: isEnglish
            ? 'Open your reading once more before it fades out'
            : '리딩이 묻히기 전에 한 번 더 열어보세요',
        title: isEnglish
            ? 'One more look can help'
            : '한 번 더 보면 더 잘 보일 수 있어요',
        body: isEnglish
            ? 'A week later, the useful part is often simpler: what to do now, what to leave alone, and what to ask next.'
            : '일주일이 지나고 나면 더 중요한 건 간단해집니다. 지금 할 일, 잠시 두어야 할 일, 다음에 물어볼 질문이 더 또렷해질 수 있어요.',
        detailLabel: isEnglish ? 'Before you close it' : '다시 보기 전에',
        detailTitle: isEnglish ? 'Find one sentence that still feels true' : '지금도 맞는 문장 하나를 찾기',
        detailBody: isEnglish
            ? 'Open the reading once more and keep one line that still feels true today.'
            : '리딩을 다시 열고, 지금도 맞다고 느껴지는 문장 하나만 먼저 남겨보세요.',
        primaryLabel: isEnglish ? 'Open my reading again' : '내 리딩 다시 보기',
        primaryUrl: params.readingUrl,
        secondaryLabel: params.dailyUrl
            ? (isEnglish ? 'Check today’s signal' : '오늘의 신호 보기')
            : null,
        secondaryUrl: params.dailyUrl ?? null,
    };
}

interface SendResultEmailParams {
    email: string;
    resultId: string;
    title?: string;
    birthInfo?: string;
    sajuSummary?: string;
    userContext?: string;
    language?: EmailLanguage;
}

export async function sendResultEmail({
    email,
    resultId,
    title,
    birthInfo,
    sajuSummary,
    userContext,
    language,
}: SendResultEmailParams) {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        devLog.warn('Invalid email format provided:', email);
        throw new Error('Invalid email format');
    }

    // App URL 결정 (환경변수 없으면 Vercel URL, 없으면 로컬호스트)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const resultUrl = `${appUrl}/share/${resultId}?view=full`;
    const emailLanguage = resolveEmailLanguage(language);
    const cleanTitle = (title || (emailLanguage === 'en' ? 'Your CosmicPath reading' : 'CosmicPath 리딩'))
        .replace(/[\r\n]+/g, ' ')
        .trim();
    const { subject, html } = buildResultEmailContent({
        language: emailLanguage,
        cleanTitle,
        resultUrl,
        birthInfo,
        sajuSummary,
        userContext,
    });

    try {
        const { data, error } = await resend.emails.send({
            from: 'CosmicPath <noreply@cosmicpath.app>',
            to: [email],
            subject: subject,
            html,
        });

        if (error) {
            devLog.error('Resend Error:', error);
            throw new Error(error.message);
        }

        await safeIncrementUsageCounter({
            provider: 'resend',
            metric: 'emails_sent',
            count: 1,
            metadata: { type: 'result' },
        });

        return data;

    } catch (error: unknown) {
        devLog.error('Failed to send email:', error);
        throw error;
    }
}

interface SendVerificationEmailParams {
    email: string;
    token: string;
}

export async function sendVerificationEmail({ email, token }: SendVerificationEmailParams) {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'CosmicPath <noreply@cosmicpath.app>',
            to: [email],
            subject: '🔒 [CosmicPath] 로그인 인증번호',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>인증번호</title>
                </head>
                <body style="font-family: sans-serif; padding: 20px; background-color: #f4f4f5;">
                    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="margin: 0 0 20px; color: #18181b; font-size: 20px; font-weight: 700; text-align: center;">인증번호 확인</h2>
                        <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.5; text-align: center;">
                            아래 6자리 인증번호를 입력하여 로그인을 완료해주세요.<br>
                            이 번호는 10분간 유효합니다.
                        </p>
                        <div style="background: #f4f4f5; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
                            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #18181b;">${token}</span>
                        </div>
                        <p style="margin: 0; color: #a1a1aa; font-size: 14px; text-align: center;">
                            본인이 요청하지 않았다면 이 이메일을 무시해주세요.
                        </p>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            devLog.error('Resend Error:', error);
            throw new Error(error.message);
        }

        await safeIncrementUsageCounter({
            provider: 'resend',
            metric: 'emails_sent',
            count: 1,
            metadata: { type: 'verification' },
        });

        return data;
    } catch (error) {
        devLog.error('Failed to send verification email:', error);
        throw error;
    }
}

interface SendFollowUpNudgeEmailParams {
    email: string;
    readingId: string;
    stage: 'D2_DISCOUNT' | 'D5_COSMIC_WINDOW' | 'H48' | 'D7';
    readingUrl: string;
    language?: EmailLanguage;
    promoCode?: string;
    discount?: number;
    offerUrl?: string;
    expiresAt?: string;
    phase4Url?: string;
    dailyUrl?: string;
    cosmicWindow?: {
        seasonLabel: string;
        title: string;
        summary: string;
        highlight: string;
    };
}

export async function sendFollowUpNudgeEmail({
    email,
    readingId,
    stage,
    readingUrl,
    language,
    promoCode,
    discount,
    offerUrl,
    expiresAt,
    phase4Url,
    dailyUrl,
}: SendFollowUpNudgeEmailParams) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    const isDiscountStage = stage === 'D2_DISCOUNT' || stage === 'H48';
    const isCosmicWindowStage = stage === 'D5_COSMIC_WINDOW';
    const isArchiveStage = stage === 'D7';
    if (isDiscountStage && (!promoCode || !offerUrl || typeof discount !== 'number')) {
        throw new Error('Discount follow-up email requires offer details');
    }
    if (isCosmicWindowStage && !dailyUrl && !phase4Url) {
        throw new Error('Daily follow-up email requires a destination URL');
    }
    const emailLanguage = resolveEmailLanguage(language);
    const content = buildFollowUpEmailContent({
        language: emailLanguage,
        stage,
        promoCode,
        discount,
        readingUrl,
        offerUrl,
        dailyUrl: dailyUrl || phase4Url,
        expiresAt,
    });

    try {
        const { data, error } = await resend.emails.send({
            from: 'CosmicPath <noreply@cosmicpath.app>',
            to: [email],
            subject: content.subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>${escapeHtml(content.subject)}</title>
                </head>
                <body style="margin:0;padding:0;background:#08080f;color:#e5e7eb;font-family:Inter,Arial,sans-serif;">
                    <div style="max-width:560px;margin:32px auto;padding:28px;border:1px solid rgba(139,92,246,.25);border-radius:18px;background:#0f1020;">
                        <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:2px;color:#a78bfa;text-transform:uppercase;">CosmicPath</p>
                        <h1 style="margin:0 0 16px 0;font-size:24px;color:#fff;">${escapeHtml(content.title)}</h1>
                        <p style="margin:0 0 18px 0;line-height:1.7;color:#cbd5e1;">
                            ${escapeHtml(content.body)}
                        </p>
                        <div style="margin:0 0 20px 0;padding:18px;border-radius:16px;background:${isArchiveStage ? 'rgba(245,158,11,.10)' : 'rgba(139,92,246,.08)'};border:1px solid ${isArchiveStage ? 'rgba(245,158,11,.24)' : 'rgba(139,92,246,.18)'};">
                            <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:1.5px;color:${isArchiveStage ? '#fbbf24' : '#c4b5fd'};text-transform:uppercase;">${escapeHtml(content.detailLabel)}</p>
                            <p style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#fff;">${escapeHtml(content.detailTitle)}</p>
                            <p style="margin:0;font-size:13px;line-height:1.7;color:#cbd5e1;">
                                ${escapeHtml(content.detailBody)}
                            </p>
                        </div>
                        <a href="${escapeHtml(content.primaryUrl)}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;text-decoration:none;padding:13px 18px;border-radius:12px;font-weight:700;">
                            ${escapeHtml(content.primaryLabel)}
                        </a>
                        ${content.secondaryLabel && content.secondaryUrl ? `
                            <p style="margin:16px 0 0 0;line-height:1.6;color:#94a3b8;font-size:13px;">
                                ${escapeHtml(emailLanguage === 'en' ? 'You can also use this link:' : '이 링크로 바로 열 수도 있어요:')}
                            </p>
                            <a href="${escapeHtml(content.secondaryUrl)}" style="display:inline-block;margin-top:10px;color:${isArchiveStage ? '#fcd34d' : '#c4b5fd'};text-decoration:none;font-size:14px;">
                                ${escapeHtml(content.secondaryLabel)}
                            </a>
                        ` : ''}
                        <p style="margin:22px 0 0 0;font-size:12px;color:#64748b;">
                            Reading ID: ${escapeHtml(readingId)}
                        </p>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            devLog.error('Resend Error:', error);
            throw new Error(error.message);
        }

        await safeIncrementUsageCounter({
            provider: 'resend',
            metric: 'emails_sent',
            count: 1,
            metadata: { type: 'followup', stage },
        });

        return data;
    } catch (error) {
        devLog.error('Failed to send follow-up email:', error);
        throw error;
    }
}

interface SendOpsAlertEmailParams {
    email: string;
    source: string;
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    details?: Record<string, unknown>;
}

export async function sendOpsAlertEmail({
    email,
    source,
    severity,
    title,
    message,
    details,
}: SendOpsAlertEmailParams) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    const detailsText = details ? JSON.stringify(details, null, 2).slice(0, 3000) : '';
    const subject = `[${severity.toUpperCase()}] ${source} - ${title}`;

    const { data, error } = await resend.emails.send({
        from: 'CosmicPath Ops <noreply@cosmicpath.app>',
        to: [email],
        subject,
        html: `
            <div style="font-family:Inter,Arial,sans-serif;padding:20px;background:#0f172a;color:#e2e8f0;">
                <h2 style="margin:0 0 8px 0;">Operational Alert</h2>
                <p style="margin:0 0 8px 0;"><strong>Source:</strong> ${source}</p>
                <p style="margin:0 0 8px 0;"><strong>Severity:</strong> ${severity}</p>
                <p style="margin:0 0 8px 0;"><strong>Title:</strong> ${title}</p>
                <p style="margin:0 0 16px 0;"><strong>Message:</strong> ${message}</p>
                ${detailsText ? `<pre style=\"white-space:pre-wrap;background:#020617;padding:12px;border-radius:8px;\">${detailsText}</pre>` : ''}
            </div>
        `,
    });

    if (error) {
        devLog.error('Resend Error:', error);
        throw new Error(error.message);
    }

    await safeIncrementUsageCounter({
        provider: 'resend',
        metric: 'emails_sent',
        count: 1,
        metadata: { type: 'ops_alert', source, severity },
    });

    return data;
}
