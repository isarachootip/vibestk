import { NextResponse } from 'next/server';
import { isPostgresActive } from '@/lib/db';

export async function GET() {
    return NextResponse.json({
        status: "online",
        mode: isPostgresActive() ? "PostgreSQL Database" : "In-Memory Simulation Mode",
        build: "471",
        version: "1.0.1"
    });
}
export const dynamic = 'force-dynamic';
