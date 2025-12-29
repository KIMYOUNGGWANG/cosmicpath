import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, resultId, title, birthInfo, sajuSummary, userContext } = await request.json();

        if (!email || !resultId) {
            return NextResponse.json(
                { error: 'Email and resultId are required' },
                { status: 400 }
            );
        }

        const resultUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${resultId}`;
        const subject = `✨ ${title || 'CosmicPath Reading Result'}이(가) 완성되었습니다!`;

        const { data, error } = await resend.emails.send({
            from: 'CosmicPath <onboarding@resend.dev>',
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
            console.error('Resend Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Failed to send email:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
