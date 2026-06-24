import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET() {
    try {
        if (isPostgresActive()) {
            const result = await query('SELECT channel_id, platform, channel_name, config FROM social_configs ORDER BY created_at DESC');
            const configs = result.rows.map(row => ({
                channel_id: row.channel_id,
                platform: row.platform,
                channel_name: row.channel_name,
                config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config
            }));
            // If postgres is empty but active, fallback to in-memory defaults
            if (configs.length === 0) {
                 return NextResponse.json(IN_MEMORY_DB.social_configs);
            }
            return NextResponse.json(configs);
        }
        return NextResponse.json(IN_MEMORY_DB.social_configs);
    } catch (err) {
        console.error("GET /api/social-config error:", err);
        return NextResponse.json(IN_MEMORY_DB.social_configs); // Safe fallback
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { channel_id, platform, channel_name, config } = body;
        
        if (!channel_id || !platform || !channel_name || !config) {
            return NextResponse.json({ error: 'channel_id, platform, channel_name, and config are required' }, { status: 400 });
        }

        if (isPostgresActive()) {
            const configJson = JSON.stringify(config);
            await query(
                `INSERT INTO social_configs (channel_id, platform, channel_name, config) 
                 VALUES ($1, $2, $3, $4) 
                 ON CONFLICT (channel_id) 
                 DO UPDATE SET channel_name = $3, config = $4`,
                [channel_id, platform, channel_name, configJson]
            );
            return NextResponse.json({ success: true, message: `Updated social config for ${channel_name}.` });
        } else {
            const existingIdx = IN_MEMORY_DB.social_configs.findIndex(c => c.channel_id === channel_id);
            const newConfig = { channel_id, platform, channel_name, config };
            if (existingIdx !== -1) {
                IN_MEMORY_DB.social_configs[existingIdx] = newConfig;
            } else {
                IN_MEMORY_DB.social_configs.push(newConfig);
            }
            return NextResponse.json({ success: true, message: `Updated in-memory social config for ${channel_name}.` });
        }
    } catch (err) {
        console.error("POST /api/social-config error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { channel_id } = await request.json();
        if (!channel_id) {
            return NextResponse.json({ error: 'channel_id is required' }, { status: 400 });
        }

        if (isPostgresActive()) {
            await query('DELETE FROM social_configs WHERE channel_id = $1', [channel_id]);
            return NextResponse.json({ success: true, message: `Deleted social config ${channel_id}.` });
        } else {
            const idx = IN_MEMORY_DB.social_configs.findIndex(c => c.channel_id === channel_id);
            if (idx !== -1) {
                IN_MEMORY_DB.social_configs.splice(idx, 1);
            }
            return NextResponse.json({ success: true, message: `Deleted in-memory social config ${channel_id}.` });
        }
    } catch (err) {
        console.error("DELETE /api/social-config error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
