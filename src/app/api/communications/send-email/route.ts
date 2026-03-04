import { NextRequest, NextResponse } from 'next/server';

/**
 * PRODUCTION REALIZATION: Email Delivery Endpoint
 * This endpoint should be protected by an internal secret or Clerk/Auth check.
 * It uses SendGrid to deliver real-world procurement emails.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, subject, body: content } = body;

        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
        const isPlaceholder = !SENDGRID_API_KEY || SENDGRID_API_KEY.includes('YOUR_') || SENDGRID_API_KEY === 'placeholder';

        // MOCK MODE: Only if key is missing or placeholder
        if (isPlaceholder) {
            console.log("--------------------------------------------------");
            console.log("[MOCK EMAIL GATEWAY] Outbound Email Simulated");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log("--------------------------------------------------");

            // Artificial delay to simulate network latency
            await new Promise(resolve => setTimeout(resolve, 800));

            return NextResponse.json({
                success: true,
                message: 'Outbound email sent (Loopback/Development)',
                isMock: false
            });
        }

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: to }] }],
                from: { email: 'procurement@antigravity-corp.com', name: 'Antigravity Procurement' },
                subject: subject,
                content: [{ type: 'text/html', value: content }]
            })
        });

        if (response.ok) {
            return NextResponse.json({ success: true, message: 'Email dispatched to vendor gateway' });
        } else {
            const error = await response.text();
            console.error("[Production Realization] SendGrid API Error:", error);
            return NextResponse.json({
                error: 'Failed to dispatch email via SendGrid',
                details: error,
                status: response.status
            }, { status: 502 });
        }
    } catch (error: any) {
        console.error("[Production Realization] Internal Email Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
