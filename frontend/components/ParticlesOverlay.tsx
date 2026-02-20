'use client';

import { useMemo } from 'react';

export default function ParticlesOverlay({ color = 'rgba(255, 26, 26, 0.4)', count = 40 }: { color?: string; count?: number }) {
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 6}s`,
            duration: `${4 + Math.random() * 4}s`,
            size: `${1 + Math.random() * 3}px`,
        }));
    }, [count]);

    return (
        <div className="particles-container">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        background: color,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                    }}
                />
            ))}
        </div>
    );
}
