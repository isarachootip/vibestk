import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET() {
    try {
        if (isPostgresActive()) {
            const result = await query('SELECT platform, config FROM social_configs');
            const configs = {};
            result.rows.forEach(row => {
                configs[row.platform] = typeof row.config === 'string' ? JSON.parse(row.config) : row.config;
            });
            // If postgres is empty but active, fallback to in-memory defaults
            if (Object.keys(configs).length === 0) {
                 return NextResponse.json(IN_MEMORY_DB.social_config);
            }
            return NextResponse.json(configs);
        }
        return NextResponse.json(IN_MEMORY_DB.social_config);
    } catch (err) {
        console.error("GET /api/social-config error:", err);
        return NextResponse.json(IN_MEMORY_DB.social_config); // Safe fallback
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { facebook, line } = body;
        
        if (isPostgresActive()) {
            if (facebook) {
                const fbJson = JSON.stringify(facebook);
                await query('INSERT INTO social_configs (platform, config) VALUES ($1, $2) ON CONFLICT (platform) DO UPDATE SET config = $2', ['facebook', fbJson]);
            }
            if (line) {
                const lineJson = JSON.stringify(line);
                await query('INSERT INTO social_configs (platform, config) VALUES ($1, $2) ON CONFLICT (platform) DO UPDATE SET config = $2', ['line', lineJson]);
            }
            return NextResponse.json({ success: true, message: `Updated social configs.` });
        } else {
            if (facebook) IN_MEMORY_DB.social_config.facebook = facebook;
            if (line) IN_MEMORY_DB.social_config.line = line;
            return NextResponse.json({ success: true, message: `Updated social configs in-memory.` });
        }
    } catch (err) {
        console.error("POST /api/social-config error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export const dynamic = 'force-dynamic';
