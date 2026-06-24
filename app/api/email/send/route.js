import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { to, cc, subject, emailBody } = body;

        if (!to || !subject || !emailBody) {
            return NextResponse.json({ success: false, error: 'To, Subject, and Body are required.' }, { status: 400 });
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`[Simulated Email] Sent to: ${to}, cc: ${cc || 'none'}, subject: ${subject}`);
        
        return NextResponse.json({
            success: true,
            message: 'Email sent successfully (simulated)',
            details: { to, cc, subject, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
