import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, resultId, title } = await request.json();

        if (!email || !resultId) {
            return NextResponse.json(
                { error: 'Email and resultId are required' },
                { status: 400 }
            );
        }

        const resultUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${resultId}`;
        const subject = `✨ ${title || 'CosmicPath Reading Result'} is ready!`;

        const { data, error } = await resend.emails.send({
            from: 'CosmicPath <onboarding@resend.dev>', // Default Resend verified domain for testing
            to: [email],
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${subject}</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0a0a12;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a12;">
                        <tr>
                            <td align="center" style="padding: 40px 20px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px;">
                                    
                                    <!-- Header with Gradient -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #1e1e3f 0%, #0f0f1a 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center; border: 1px solid rgba(139, 92, 246, 0.3); border-bottom: none;">
                                            <div style="font-size: 12px; letter-spacing: 4px; color: #8B5CF6; text-transform: uppercase; margin-bottom: 10px;">✧ Cosmic Reading Complete ✧</div>
                                            <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #8B5CF6, #FBBF24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">CosmicPath</h1>
                                        </td>
                                    </tr>
                                    
                                    <!-- Main Content -->
                                    <tr>
                                        <td style="background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%); padding: 40px 30px; border: 1px solid rgba(139, 92, 246, 0.2); border-top: none; border-bottom: none;">
                                            
                                            <!-- Greeting -->
                                            <h2 style="color: #FBBF24; font-size: 22px; margin: 0 0 20px 0; text-align: center;">
                                                🌟 Your Reading is Ready!
                                            </h2>
                                            
                                            <!-- Reading Title Card -->
                                            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                                                <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0; text-align: center;">${title || 'Your Cosmic Reading'}</h3>
                                                <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                                                    Your personalized analysis integrating Saju, Astrology, and Tarot has been preserved in the cosmic archives.
                                                </p>
                                            </div>
                                            
                                            <!-- Trust Score Badge -->
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <span style="display: inline-block; background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(139, 92, 246, 0.2)); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 20px; padding: 8px 16px; color: #FBBF24; font-size: 12px; font-weight: 600;">
                                                    ⭐⭐⭐⭐⭐ High Confidence Reading
                                                </span>
                                            </div>
                                            
                                            <!-- CTA Button -->
                                            <div style="text-align: center; margin: 30px 0;">
                                                <a href="${resultUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);">
                                                    ✨ View Full Reading
                                                </a>
                                            </div>
                                            
                                            <!-- What's Included -->
                                            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; margin-top: 24px;">
                                                <p style="color: #64748B; font-size: 12px; text-align: center; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">What's Inside</p>
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td width="33%" style="text-align: center; padding: 10px;">
                                                            <div style="font-size: 24px; margin-bottom: 8px;">📜</div>
                                                            <div style="color: #94A3B8; font-size: 11px;">Saju Analysis</div>
                                                        </td>
                                                        <td width="33%" style="text-align: center; padding: 10px;">
                                                            <div style="font-size: 24px; margin-bottom: 8px;">🌌</div>
                                                            <div style="color: #94A3B8; font-size: 11px;">Astrology</div>
                                                        </td>
                                                        <td width="33%" style="text-align: center; padding: 10px;">
                                                            <div style="font-size: 24px; margin-bottom: 8px;">🔮</div>
                                                            <div style="color: #94A3B8; font-size: 11px;">Tarot Reading</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                            
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background: #0a0a12; border-radius: 0 0 16px 16px; padding: 30px; text-align: center; border: 1px solid rgba(139, 92, 246, 0.2); border-top: none;">
                                            <p style="color: #475569; font-size: 12px; margin: 0 0 10px 0;">
                                                Or copy this link: <a href="${resultUrl}" style="color: #8B5CF6;">${resultUrl}</a>
                                            </p>
                                            <p style="color: #334155; font-size: 11px; margin: 0;">
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
