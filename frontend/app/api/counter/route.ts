import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Counter from '@/lib/Counter';

export async function GET() {
    try {
        await dbConnect();
        let counter = await Counter.findOne({ name: 'global' });
        if (!counter) {
            counter = await Counter.create({ name: 'global', count: 0 });
        }
        return NextResponse.json({ count: counter.count });
    } catch {
        // Return a fallback count if DB is unavailable
        return NextResponse.json({ count: 0, offline: true });
    }
}

export async function POST() {
    try {
        await dbConnect();
        const counter = await Counter.findOneAndUpdate(
            { name: 'global' },
            { $inc: { count: 1 }, lastClickedAt: new Date() },
            { new: true, upsert: true }
        );
        return NextResponse.json({ count: counter.count });
    } catch {
        return NextResponse.json({ count: 0, offline: true });
    }
}
