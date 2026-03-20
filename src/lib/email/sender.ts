import { Resend } from 'resend';
import { devLog } from '@/lib/dev-logger';
import { safeIncrementUsageCounter } from '@/lib/usage-metrics';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendResultEmailParams {
    email: string;
    resultId: string;
    title?: string;
    birthInfo?: string;
    sajuSummary?: string;
    userContext?: string;
}

export async function sendResultEmail({
    email,
    resultId,
    title,
    birthInfo,
    sajuSummary,
    userContext
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
    // 제목에 줄바꿈이 있으면 Resend API에서 에러 발생 (validation_error)
    // 줄바꿈을 공백으로 치환하고 앞뒤 공백 제거
    const cleanTitle = (title || 'CosmicPath Reading Result').replace(/[\r\n]+/g, ' ').trim();
    const subject = `✨ ${cleanTitle}이(가) 완성되었습니다!`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'CosmicPath <noreply@cosmicpath.app>',
            to: [email],
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${subject}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;700&display=swap');
                    </style>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #030308; color: #ffffff;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #030308;">
                        <tr>
                            <td align="center" style="padding: 40px 10px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0a0a1a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.2);">
                                    
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #0f0f2a 0%, #050510 100%); padding: 50px 30px; text-align: center; border-bottom: 1px solid rgba(139, 92, 246, 0.1);">
                                            <div style="font-size: 14px; letter-spacing: 5px; color: #8B5CF6; text-transform: uppercase; margin-bottom: 15px; font-weight: 700;">✧ CosmicPath ✧</div>
                                            <h1 style="margin: 0; font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700; background: linear-gradient(135deg, #ffffff 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #ffffff;">심화분석 완성!</h1>
                                            <p style="color: #94A3B8; margin-top: 10px; font-size: 16px;">사주팔자 심화분석이 완료되었습니다</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <p style="font-size: 18px; color: #ffffff; text-align: center; margin-bottom: 30px;">안녕하세요, 회원님! 🌟</p>
                                            <p style="font-size: 15px; color: #94A3B8; text-align: center; line-height: 1.6; margin-bottom: 40px;">
                                                요청하신 <strong style="color: #FBBF24;">사주팔자 심화분석</strong>이 완성되었습니다.<br/>
                                                오행분석부터 시작되는 심화분석 내용을 확인해보세요.
                                            </p>
                                            
                                            <!-- Info Cards Container -->
                                            <div style="background: rgba(139, 92, 246, 0.03); border: 1px solid rgba(139, 92, 246, 0.1); border-radius: 20px; padding: 30px;">
                                                
                                                <!-- Birth Info Card -->
                                                <div style="margin-bottom: 25px;">
                                                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                                        <span style="font-size: 16px; margin-right: 8px;">📅</span>
                                                        <span style="font-size: 14px; color: #94A3B8; font-weight: 600;">생년월일시</span>
                                                    </div>
                                                    <div style="color: #ffffff; font-size: 16px; margin-bottom: 10px;">${birthInfo || '정보 없음'}</div>
                                                    <div style="background: rgba(251, 191, 36, 0.1); border-radius: 12px; padding: 12px 16px; border: 1px solid rgba(251, 191, 36, 0.2); color: #FBBF24; font-size: 14px; letter-spacing: 1px;">
                                                        사주: ${sajuSummary || '분석 중...'}
                                                    </div>
                                                </div>
                                                
                                                <!-- User Context Card -->
                                                <div style="padding-top: 25px; border-top: 1px solid rgba(139, 92, 246, 0.1);">
                                                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                                        <span style="font-size: 16px; margin-right: 8px;">💭</span>
                                                        <span style="font-size: 14px; color: #94A3B8; font-weight: 600;">고민하신 내용</span>
                                                    </div>
                                                    <div style="color: #CBD5E1; font-size: 14px; line-height: 1.7; font-style: italic;">
                                                        "${userContext || '종합 운세 분석을 요청하셨습니다.'}"
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- CTA Button -->
                                            <div style="text-align: center; margin-top: 50px;">
                                                <a href="${resultUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: #ffffff; padding: 20px 45px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 18px; box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3); transition: all 0.3s ease;">
                                                    💎 심화분석 결과 보러가기
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 40px 30px; text-align: center; background-color: #050510;">
                                            <p style="color: #475569; font-size: 12px; margin: 0 0 15px 0;">
                                                링크를 클릭해도 열리지 않는다면 아래 주소를 주소창에 붙여넣어 주세요:<br/>
                                                <a href="${resultUrl}" style="color: #6366F1; text-decoration: none;">${resultUrl}</a>
                                            </p>
                                            <div style="height: 1px; background: rgba(139, 92, 246, 0.1); width: 80px; margin: 25px auto;"></div>
                                            <p style="color: #334155; font-size: 11px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
                                                © ${new Date().getFullYear()} CosmicPath. Unveiling the Eternal Flow.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                </table>
                            </td>
                        </tr>
                    </table>
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
    promoCode?: string;
    discount?: number;
    offerUrl?: string;
    expiresAt?: string;
    phase4Url?: string;
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
    promoCode,
    discount,
    offerUrl,
    expiresAt,
    phase4Url,
    cosmicWindow,
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
    if (isCosmicWindowStage && (!cosmicWindow || !phase4Url)) {
        throw new Error('Cosmic window follow-up email requires phase 4 details');
    }
    const resolvedCosmicWindow = cosmicWindow ?? null;

    const expiryLabel = expiresAt
        ? new Intl.DateTimeFormat('ko-KR', {
            month: 'long',
            day: 'numeric',
        }).format(new Date(expiresAt))
        : null;

    const subject = isDiscountStage
        ? '💫 리딩 어떠셨어요? 20% 할인 코드를 준비했어요'
        : isCosmicWindowStage
            ? '🪐 이번 주 하늘의 흐름, Phase 4에서 확인해보세요'
            : isArchiveStage
                ? '⏳ 분석 보관 처리 전에, 꼭 다시 확인해보세요'
                : '🌙 일주일 후, 다시 보는 나의 흐름';
    const title = isDiscountStage
        ? '리딩 어떠셨어요?'
        : isCosmicWindowStage
            ? resolvedCosmicWindow?.title || '이번 주 하늘의 포인트'
            : isArchiveStage
                ? '분석 보관 전에, 핵심 흐름을 다시 확인해보세요'
                : '일주일 후, 다시 보는 나의 흐름';
    const bodyCopy = isDiscountStage
        ? '아직 전체 리포트를 열지 않으셨다면, 이번 주에만 쓸 수 있는 20% 할인 코드로 이어서 확인해보세요.'
        : isCosmicWindowStage
            ? resolvedCosmicWindow?.summary || '지금은 인생 영역별 우선순위를 다시 정리해보기 좋은 구간입니다.'
            : isArchiveStage
                ? '리딩을 생성한 지 일주일이 지났습니다. 보관함으로 넘기기 전에 지금 다시 열어 두면, 처음엔 놓쳤던 문장과 지금 바로 써야 할 힌트를 더 선명하게 정리할 수 있습니다.'
                : '지난 리딩 이후 시간이 흘렀습니다. 지금 다시 보면 더 선명하게 보이는 포인트가 있습니다.';
    const primaryUrl = isDiscountStage ? offerUrl : isCosmicWindowStage ? phase4Url : readingUrl;
    const primaryLabel = isDiscountStage
        ? '20% 할인 적용해서 이어보기'
        : isCosmicWindowStage
            ? 'Phase 4 열기'
            : isArchiveStage
                ? '보관 전에 다시 열기'
                : '내 리딩 다시 열기';

    try {
        const { data, error } = await resend.emails.send({
            from: 'CosmicPath <noreply@cosmicpath.app>',
            to: [email],
            subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>${subject}</title>
                </head>
                <body style="margin:0;padding:0;background:#08080f;color:#e5e7eb;font-family:Inter,Arial,sans-serif;">
                    <div style="max-width:560px;margin:32px auto;padding:28px;border:1px solid rgba(139,92,246,.25);border-radius:18px;background:#0f1020;">
                        <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:2px;color:#a78bfa;text-transform:uppercase;">CosmicPath Follow-up</p>
                        <h1 style="margin:0 0 16px 0;font-size:24px;color:#fff;">${title}</h1>
                        <p style="margin:0 0 18px 0;line-height:1.7;color:#cbd5e1;">
                            ${bodyCopy}
                        </p>
                        ${isDiscountStage ? `
                            <div style="margin:0 0 20px 0;padding:18px;border-radius:16px;background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.18);">
                                <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:1.5px;color:#a78bfa;text-transform:uppercase;">20% Discount Code</p>
                                <p style="margin:0;font-size:28px;font-weight:800;letter-spacing:2px;color:#fff;">${promoCode}</p>
                                <p style="margin:10px 0 0 0;font-size:13px;color:#94a3b8;">
                                    상세 리포트 결제 시 자동 적용됩니다.${expiryLabel ? ` ${expiryLabel}까지 사용 가능해요.` : ''}
                                </p>
                            </div>
                        ` : ''}
                        ${isCosmicWindowStage ? `
                            <div style="margin:0 0 20px 0;padding:18px;border-radius:16px;background:rgba(99,102,241,.10);border:1px solid rgba(99,102,241,.22);">
                                <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:1.5px;color:#a5b4fc;text-transform:uppercase;">Cosmic Window</p>
                                <p style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#fff;">${resolvedCosmicWindow?.seasonLabel}</p>
                                <p style="margin:0;font-size:13px;line-height:1.7;color:#cbd5e1;">
                                    ${resolvedCosmicWindow?.highlight}
                                </p>
                            </div>
                        ` : ''}
                        ${isArchiveStage ? `
                            <div style="margin:0 0 20px 0;padding:18px;border-radius:16px;background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.24);">
                                <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:1.5px;color:#fbbf24;text-transform:uppercase;">Archive Notice</p>
                                <p style="margin:0 0 10px 0;font-size:18px;font-weight:800;color:#fff;">지금 다시 보면 놓친 포인트가 보입니다</p>
                                <p style="margin:0;font-size:13px;line-height:1.7;color:#fde68a;">
                                    관계, 일, 돈 중 지금 가장 먼저 움직여야 할 영역과 다음 질문 포인트를 보관 전에 다시 정리해두세요.
                                </p>
                            </div>
                        ` : ''}
                        <a href="${primaryUrl}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;text-decoration:none;padding:13px 18px;border-radius:12px;font-weight:700;">
                            ${primaryLabel}
                        </a>
                        ${isDiscountStage ? `
                            <p style="margin:16px 0 0 0;line-height:1.6;color:#94a3b8;font-size:13px;">
                                이미 링크를 열어보셨다면 아래에서 기존 리딩도 다시 확인할 수 있습니다.
                            </p>
                            <a href="${readingUrl}" style="display:inline-block;margin-top:10px;color:#c4b5fd;text-decoration:none;font-size:14px;">
                                기존 리딩 다시 보기
                            </a>
                        ` : ''}
                        ${isCosmicWindowStage ? `
                            <p style="margin:16px 0 0 0;line-height:1.6;color:#94a3b8;font-size:13px;">
                                Phase 4는 커리어, 재물, 연애, 건강의 흐름을 한 번에 정리해주는 구간입니다.
                            </p>
                            <a href="${readingUrl}" style="display:inline-block;margin-top:10px;color:#c4b5fd;text-decoration:none;font-size:14px;">
                                기존 리딩 다시 보기
                            </a>
                        ` : ''}
                        ${isArchiveStage ? `
                            <p style="margin:16px 0 0 0;line-height:1.6;color:#94a3b8;font-size:13px;">
                                다시 열어보실 때는 핵심 문장 1-2개와 지금 가장 궁금한 질문을 함께 메모해두시면 다음 행동으로 이어지기 쉽습니다.
                            </p>
                            <a href="${readingUrl}" style="display:inline-block;margin-top:10px;color:#fcd34d;text-decoration:none;font-size:14px;">
                                내 리딩 링크 다시 확인하기
                            </a>
                        ` : ''}
                        <p style="margin:22px 0 0 0;font-size:12px;color:#64748b;">
                            Reading ID: ${readingId}
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
