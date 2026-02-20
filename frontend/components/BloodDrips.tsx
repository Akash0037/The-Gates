'use client';

import { useMemo } from 'react';

export default function BloodDrips({ count = 8 }: { count?: number }) {
    const drips = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            left: `${5 + Math.random() * 90}%`,
            delay: `${Math.random() * 8}s`,
            duration: `${3 + Math.random() * 5}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${40 + Math.random() * 80}px`,
        }));
    }, [count]);

    return (
        <div className="drip-container">
            {drips.map((d) => (
                <svg
                    key={d.id}
                    style={{
                        position: 'absolute',
                        left: d.left,
                        top: '-80px',
                        width: d.width,
                        height: d.height,
                        animationDelay: d.delay,
                        animationDuration: d.duration,
                    }}
                    className="blood-drip"
                    viewBox="0 0 10 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id={`drip-grad-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4a0000" stopOpacity="0" />
                            <stop offset="30%" stopColor="#8b0000" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#5a0000" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                    <rect
                        x="3"
                        y="0"
                        width="4"
                        height="90"
                        rx="2"
                        fill={`url(#drip-grad-${d.id})`}
                    />
                    <ellipse cx="5" cy="95" rx="4" ry="5" fill="#8b0000" opacity="0.7" />
                </svg>
            ))}
        </div>
    );
}
