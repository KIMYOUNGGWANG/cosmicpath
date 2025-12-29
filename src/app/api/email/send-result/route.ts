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
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0F0F18; color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8B5CF6; font-size: 24px;">CosmicPath</h1>
                    </div>
                    
                    <div style="background-color: #1A1A2E; padding: 30px; border-radius: 12px; border: 1px solid #2D2D42;">
                        <h2 style="color: #FBBF24; margin-top: 0;">Your Reading is Ready!</h2>
                        <p style="color: #E2E8F0; line-height: 1.6;">
                            Thank you for using CosmicPath. Your integrative analysis has been preserved in the cosmic archives.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resultUrl}" style="background-color: #8B5CF6; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                                View Full Result
                            </a>
                        </div>
                        
                        <p style="color: #94A3B8; font-size: 12px; margin-top: 20px;">
                            Or copy this link: <br/>
                            <a href="${resultUrl}" style="color: #8B5CF6;">${resultUrl}</a>
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #475569; font-size: 12px;">
                        © ${new Date().getFullYear()} CosmicPath. All rights reserved.
                    </div>
                </div>
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
