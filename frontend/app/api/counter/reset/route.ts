import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Counter from '@/lib/Counter';

// TEMPORARY: Reset counter to 0 — remove after use
export async function POST() {
    try {
        await dbConnect();
        const counter = await Counter.findOneAndUpdate(
            { name: 'global' },
            { $set: { count: 0 }, lastClickedAt: new Date() },
            { new: true, upsert: true }
        );
        return NextResponse.json({ success: true, count: counter.count, message: 'Counter reset to 0' });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to reset counter' }, { status: 500 });
    }
}
