'use client';

import { motion } from 'framer-motion';

interface HorrorAvatarProps {
    uid: string;
    displayName?: string | null;
    size?: number;
    showName?: boolean;
}

// Generate a deterministic horror avatar based on user UID
function getAvatarConfig(uid: string) {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = ((hash << 5) - hash) + uid.charCodeAt(i);
        hash |= 0;
    }

    const abs = Math.abs(hash);
    const eyeColor = [
        '#ff0000', '#ff3300', '#cc0000', '#ff1a1a', '#ff4400',
        '#00ff00', '#ffff00', '#ff00ff',
    ][abs % 8];
    const scarType = abs % 4;  // 0-3 different scar patterns
    const hornStyle = abs % 3; // 0-2 horn variations
    const teethCount = 3 + (abs % 4); // 3-6 teeth

    return { eyeColor, scarType, hornStyle, teethCount, hash: abs };
}

export default function HorrorAvatar({ uid, displayName, size = 48, showName = true }: HorrorAvatarProps) {
    const config = getAvatarConfig(uid);
    const s = size;

    return (
        <motion.div
            className="horror-avatar-container"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', damping: 12 }}
        >
            <div className="horror-avatar" style={{ width: s, height: s }}>
                <svg viewBox="0 0 100 100" width={s} height={s}>
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="48" fill="#0a0000" stroke="#3a0000" strokeWidth="2" />

                    {/* Skull shape */}
                    <ellipse cx="50" cy="45" rx="30" ry="32" fill="#1a1210" />
                    <ellipse cx="50" cy="55" rx="20" ry="18" fill="#1a1210" />

                    {/* Jaw */}
                    <path d="M 30 55 Q 50 80 70 55" fill="none" stroke="#2a1a10" strokeWidth="1.5" />

                    {/* Eye sockets */}
                    <ellipse cx="38" cy="40" rx="10" ry="9" fill="#050000" />
                    <ellipse cx="62" cy="40" rx="10" ry="9" fill="#050000" />

                    {/* Glowing eyes */}
                    <circle cx="38" cy="40" r="4" fill={config.eyeColor} opacity="0.9">
                        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="62" cy="40" r="4" fill={config.eyeColor} opacity="0.9">
                        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" begin="0.3s" />
                    </circle>

                    {/* Eye glow */}
                    <circle cx="38" cy="40" r="7" fill={config.eyeColor} opacity="0.15">
                        <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="62" cy="40" r="7" fill={config.eyeColor} opacity="0.15">
                        <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite" begin="0.3s" />
                    </circle>

                    {/* Nose cavity */}
                    <path d="M 47 50 L 50 55 L 53 50" fill="none" stroke="#2a0000" strokeWidth="1.5" />

                    {/* Teeth */}
                    {Array.from({ length: config.teethCount }).map((_, i) => {
                        const x = 38 + (i * (24 / (config.teethCount - 1)));
                        const h = 3 + (config.hash + i) % 4;
                        return (
                            <rect key={i} x={x} y="60" width="2.5" height={h} rx="0.5"
                                fill="#d4c8b0" opacity="0.7" />
                        );
                    })}

                    {/* Scars */}
                    {config.scarType === 0 && (
                        <path d="M 25 30 L 35 45" stroke="#5a0000" strokeWidth="1.5" fill="none" opacity="0.6" />
                    )}
                    {config.scarType === 1 && (
                        <path d="M 65 25 L 70 40 L 75 35" stroke="#5a0000" strokeWidth="1.5" fill="none" opacity="0.6" />
                    )}
                    {config.scarType === 2 && (
                        <>
                            <path d="M 30 35 L 25 45" stroke="#5a0000" strokeWidth="1" fill="none" opacity="0.5" />
                            <path d="M 70 30 L 75 42" stroke="#5a0000" strokeWidth="1" fill="none" opacity="0.5" />
                        </>
                    )}
                    {config.scarType === 3 && (
                        <path d="M 45 25 L 50 35 L 55 25" stroke="#5a0000" strokeWidth="1.5" fill="none" opacity="0.6" />
                    )}

                    {/* Horns */}
                    {config.hornStyle === 0 && (
                        <>
                            <path d="M 25 30 Q 15 10 20 5" stroke="#3a1a00" strokeWidth="3" fill="none" strokeLinecap="round" />
                            <path d="M 75 30 Q 85 10 80 5" stroke="#3a1a00" strokeWidth="3" fill="none" strokeLinecap="round" />
                        </>
                    )}
                    {config.hornStyle === 1 && (
                        <>
                            <path d="M 28 25 Q 20 5 25 2" stroke="#3a1a00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M 72 25 Q 80 5 75 2" stroke="#3a1a00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </>
                    )}
                    {/* hornStyle === 2: no horns, just skull */}

                    {/* Blood drip */}
                    <path d="M 38 48 Q 37 55 38 60" stroke="#8b0000" strokeWidth="1" fill="none" opacity="0.6">
                        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>
            {showName && displayName && (
                <motion.span
                    className="horror-avatar-name"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {displayName.split(' ')[0]}
                </motion.span>
            )}
        </motion.div>
    );
}
