import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        let grant_type = '';
        let assertion = '';
        
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            const body = await request.json();
            grant_type = body.grant_type;
            assertion = body.assertion;
        } else {
            // Support URL-encoded form data just in case
            const formData = await request.formData();
            grant_type = formData.get('grant_type');
            assertion = formData.get('assertion');
        }
        
        if (!grant_type || !assertion) {
            return NextResponse.json(
                { error: "invalid_request", error_description: "grant_type and assertion are required" },
                { status: 400 }
            );
        }
        
        // Dynamically build the instance URL based on host header
        const host = request.headers.get('host') || 'localhost:3000';
        const proto = request.headers.get('x-forwarded-proto') || 'http';
        const instanceUrl = `${proto}://${host}`;
        
        return NextResponse.json({
            access_token: "mock_sf_token_abc123xyz789",
            scope: "api",
            instance_url: instanceUrl,
            id: "https://login.salesforce.com/id/00D28000000HYFHEA4/00528000000M8TVAA0",
            token_type: "Bearer"
        });
    } catch (err) {
        console.error("OAuth token error:", err);
        return NextResponse.json({ error: "server_error", error_description: err.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
