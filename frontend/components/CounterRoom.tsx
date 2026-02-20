'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticlesOverlay from './ParticlesOverlay';
import BloodDrips from './BloodDrips';

interface CounterRoomProps {
    userName: string;
    userLocation: string;
}

export default function CounterRoom({ userName, userLocation }: CounterRoomProps) {
    const [visible, setVisible] = useState(false);
    const [globalCount, setGlobalCount] = useState(99995);
    const [localClicks, setLocalClicks] = useState(0);
    const [shaking, setShaking] = useState(false);
    const [flickering, setFlickering] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [showBurst, setShowBurst] = useState(false);
    const [burstPosition, setBurstPosition] = useState({ x: 0, y: 0 });
    const audioCtxRef = useRef<AudioContext | null>(null);
    const distortionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch initial count
    useEffect(() => {
        fetch('/api/counter')
            .then((r) => r.json())
            .then((data) => setGlobalCount(data.count || 99995))
            .catch(() => setGlobalCount(99995));
    }, []);

    // Distortion sound
    useEffect(() => {
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            audioCtxRef.current = ctx;

            // Low rumble
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(30, ctx.currentTime);
            gain.gain.setValueAtTime(0.015, ctx.currentTime);

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(100, ctx.currentTime);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start();

            // Periodic distortion bursts
            distortionIntervalRef.current = setInterval(() => {
                if (ctx.state === 'closed') return;
                const noise = ctx.createOscillator();
                const noiseGain = ctx.createGain();
                noise.type = 'square';
                noise.frequency.setValueAtTime(Math.random() * 100 + 20, ctx.currentTime);
                noiseGain.gain.setValueAtTime(0.02, ctx.currentTime);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                noise.connect(noiseGain);
                noiseGain.connect(ctx.destination);
                noise.start();
                noise.stop(ctx.currentTime + 0.1);
            }, 3000);

            return () => {
                osc.stop();
                ctx.close();
                if (distortionIntervalRef.current) clearInterval(distortionIntervalRef.current);
            };
        } catch {
            return;
        }
    }, []);

    // Fade in
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
    }, []);

    // Check if unlocked
    useEffect(() => {
        if (globalCount >= 100000 && !unlocked) {
            setUnlocked(true);
        }
    }, [globalCount, unlocked]);

    // Click SFX
    const playClickSound = useCallback(() => {
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state === 'closed') return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch { /* noop */ }
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        // Increment
        setLocalClicks((c) => c + 1);
        setGlobalCount((c) => c + 1);

        // API call
        fetch('/api/counter', { method: 'POST' }).catch(() => { });

        // Effects
        setShaking(true);
        setFlickering(true);
        playClickSound();

        // Red particle burst at click position
        setBurstPosition({ x: e.clientX, y: e.clientY });
        setShowBurst(true);

        setTimeout(() => setShaking(false), 150);
        setTimeout(() => setFlickering(false), 200);
        setTimeout(() => setShowBurst(false), 600);
    };

    if (!visible) {
        return <div className="fixed inset-0 bg-black z-[80]" />;
    }

    return (
        <motion.div
            className={`fixed inset-0 z-[80] ${shaking ? 'screen-shake' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
        >
            {/* Background */}
            <div
                className="fixed inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, #0a0000 0%, #030000 50%, #000 100%)',
                }}
            />

            {/* Pulsating red light */}
            <motion.div
                className="fixed inset-0"
                animate={{
                    background: [
                        'radial-gradient(circle at 50% 40%, rgba(139, 0, 0, 0.06) 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 40%, rgba(139, 0, 0, 0.12) 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 40%, rgba(139, 0, 0, 0.06) 0%, transparent 50%)',
                    ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            <ParticlesOverlay color="rgba(255, 0, 0, 0.3)" count={50} />
            <BloodDrips count={10} />
            <div className="vignette" />
            <div className="scan-line" />

            {/* Flicker overlay */}
            {flickering && (
                <div
                    className="fixed inset-0 z-[95]"
                    style={{ background: 'rgba(255, 26, 26, 0.05)', pointerEvents: 'none' }}
                />
            )}

            {/* Red particle burst on click */}
            <AnimatePresence>
                {showBurst && (
                    <motion.div
                        className="fixed z-[100]"
                        style={{ left: burstPosition.x, top: burstPosition.y, pointerEvents: 'none' }}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1.5 h-1.5 rounded-full"
                                style={{ background: '#ff1a1a', boxShadow: '0 0 6px #ff1a1a' }}
                                initial={{ x: 0, y: 0, scale: 1 }}
                                animate={{
                                    x: Math.cos((i * Math.PI * 2) / 12) * (40 + Math.random() * 30),
                                    y: Math.sin((i * Math.PI * 2) / 12) * (40 + Math.random() * 30),
                                    scale: 0,
                                    opacity: 0,
                                }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-6">
                {/* Small info */}
                <motion.p
                    className="text-gray-600 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.3em] font-cinzel mb-2 uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1 }}
                >
                    {userName} from {userLocation}
                </motion.p>

                {/* Glitch header */}
                <motion.h2
                    className="font-cinzel text-xl sm:text-2xl md:text-4xl text-center mb-4 sm:mb-6 md:mb-8 glitch-text"
                    style={{
                        color: '#ff1a1a',
                        textShadow: '0 0 30px rgba(255, 26, 26, 0.5), 2px 0 #ff0000, -2px 0 #00ffff',
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    THE FINAL CHAMBER
                </motion.h2>

                {/* Counter display */}
                <motion.div
                    className="flex flex-col items-center mb-4 sm:mb-6 md:mb-8"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                >
                    <p className="text-gray-500 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.5em] font-cinzel mb-2 sm:mb-3 uppercase">
                        Souls who clicked
                    </p>
                    <div className="counter-display">
                        {globalCount.toLocaleString()}
                    </div>
                    <motion.div
                        className="w-32 h-[1px] bg-gradient-to-r from-transparent via-red-800 to-transparent mt-2"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 2, delay: 1.5 }}
                    />
                    {localClicks > 0 && (
                        <motion.p
                            className="text-red-900 text-xs mt-2 font-cinzel"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                        >
                            Your contribution: {localClicks}
                        </motion.p>
                    )}
                </motion.div>

                {/* THE BUTTON */}
                <motion.div
                    className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 1.8 }}
                >
                    <p
                        className="text-gray-500 text-xs sm:text-sm font-cinzel tracking-wider italic mb-1 sm:mb-2"
                        style={{ textShadow: '0 0 10px rgba(139, 0, 0, 0.3)' }}
                    >
                        To know more… click.
                    </p>
                    <motion.button
                        onClick={handleClick}
                        className="relative px-8 py-3 sm:px-10 sm:py-4 md:px-12 md:py-5 font-cinzel text-base sm:text-lg tracking-[0.15em] sm:tracking-[0.3em] uppercase cursor-pointer overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #1a0000, #3d0000, #1a0000)',
                            border: '1px solid rgba(139, 0, 0, 0.5)',
                            color: '#ff4444',
                            borderRadius: '6px',
                            textShadow: '0 0 10px rgba(255, 68, 68, 0.5)',
                        }}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: '0 0 50px rgba(255, 26, 26, 0.3), inset 0 0 30px rgba(139, 0, 0, 0.2)',
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* Animated border glow */}
                        <motion.span
                            className="absolute inset-0 rounded-md"
                            style={{ border: '1px solid transparent' }}
                            animate={{
                                boxShadow: [
                                    'inset 0 0 10px rgba(139, 0, 0, 0.2)',
                                    'inset 0 0 20px rgba(255, 26, 26, 0.3)',
                                    'inset 0 0 10px rgba(139, 0, 0, 0.2)',
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        🩸 C L I C K
                    </motion.button>
                </motion.div>

                {/* Progress towards 100K */}
                <motion.div
                    className="mt-4 sm:mt-6 md:mt-8 w-48 sm:w-56 md:w-64"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                >
                    <div className="flex justify-between text-xs text-gray-600 font-cinzel mb-1">
                        <span>0</span>
                        <span>100,000</span>
                    </div>
                    <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: 'linear-gradient(90deg, #3d0000, #8b0000, #ff1a1a)',
                                boxShadow: '0 0 10px rgba(255, 26, 26, 0.5)',
                            }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${Math.min((globalCount / 100000) * 100, 100)}%` }}
                            transition={{ duration: 2, delay: 0.5 }}
                        />
                    </div>
                    <p className="text-center text-xs text-gray-700 font-cinzel mt-1">
                        {((globalCount / 100000) * 100).toFixed(2)}% complete
                    </p>
                </motion.div>
            </div>

            {/* UNLOCKED STATE - 100K reached - MAXIMUM HORROR */}
            <AnimatePresence>
                {unlocked && (
                    <motion.div
                        className="fixed inset-0 z-[200] unlock-warp"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Pure black base */}
                        <div className="fixed inset-0 bg-black" />

                        {/* AGGRESSIVE STROBE FLASH */}
                        <div className="fixed inset-0 unlock-seizure z-[201]" />

                        {/* Blood oozing from top */}
                        <div className="fixed inset-0 z-[202] blood-overlay" style={{
                            background: 'linear-gradient(180deg, #3a0000 0%, #8b0000 15%, rgba(139, 0, 0, 0.4) 40%, transparent 70%)',
                        }} />

                        {/* Static noise overlay */}
                        <div className="fixed inset-0 z-[203] static-overlay" style={{ opacity: 0.3 }} />

                        {/* Heavy blood drips */}
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={`blood-${i}`}
                                className="fixed z-[204]"
                                style={{
                                    left: `${(i / 20) * 100}%`,
                                    top: 0,
                                    width: `${Math.random() * 8 + 3}px`,
                                    height: '100vh',
                                    background: `linear-gradient(180deg, #8b0000, #3a0000 ${30 + Math.random() * 40}%, transparent)`,
                                    opacity: 0.5 + Math.random() * 0.5,
                                }}
                                initial={{ y: '-100vh' }}
                                animate={{ y: '0vh' }}
                                transition={{
                                    duration: 2 + Math.random() * 3,
                                    delay: Math.random() * 2,
                                    ease: 'easeIn',
                                }}
                            />
                        ))}

                        {/* Flickering red scanlines */}
                        <motion.div
                            className="fixed inset-0 z-[205]"
                            style={{
                                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 0, 0.03) 2px, rgba(255, 0, 0, 0.03) 4px)',
                                pointerEvents: 'none',
                            }}
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                        />

                        {/* Main content - GLITCHING */}
                        <div className="fixed inset-0 z-[210] flex items-center justify-center unlock-glitch">
                            <div className="relative flex flex-col items-center gap-3 sm:gap-4 md:gap-6 px-4 sm:px-6 md:px-8">
                                {/* Pulsating blood orb */}
                                <motion.div
                                    className="absolute w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 rounded-full"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(255, 0, 0, 0.4), rgba(139, 0, 0, 0.2), transparent)',
                                        boxShadow: '0 0 150px rgba(255, 0, 0, 0.6), 0 0 300px rgba(139, 0, 0, 0.3)',
                                    }}
                                    animate={{
                                        scale: [1, 1.3, 0.8, 1.2, 1],
                                        opacity: [0.6, 1, 0.4, 0.9, 0.6],
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                />

                                {/* THE TEXT - chromatic horror */}
                                <motion.h1
                                    className="relative font-cinzel text-lg sm:text-2xl md:text-4xl lg:text-6xl text-center chromatic-text font-black"
                                    style={{
                                        color: '#ff1a1a',
                                        WebkitTextStroke: '1px rgba(139, 0, 0, 0.5)',
                                    }}
                                    initial={{ opacity: 0, scale: 2 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.5 }}
                                >
                                    You opened what should never have been opened.
                                </motion.h1>

                                {/* Secondary horror text */}
                                <motion.p
                                    className="font-cinzel text-sm sm:text-lg md:text-2xl text-center chromatic-text"
                                    style={{ color: '#ff4444' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0, 1, 0.5, 1] }}
                                    transition={{ delay: 3, duration: 1, repeat: Infinity, repeatDelay: 2 }}
                                >
                                    IT SEES YOU NOW.
                                </motion.p>

                                {/* Counter frozen at 100000 */}
                                <motion.div
                                    className="font-cinzel text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black"
                                    style={{
                                        color: '#ff0000',
                                        textShadow: '0 0 60px rgba(255, 0, 0, 0.8), 0 0 120px rgba(139, 0, 0, 0.5)',
                                    }}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{
                                        opacity: [0, 1, 0.3, 1],
                                        y: 0,
                                    }}
                                    transition={{ delay: 2, duration: 0.5 }}
                                >
                                    100,000
                                </motion.div>

                                {/* Final message */}
                                <motion.p
                                    className="font-cinzel text-[10px] sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.5em] uppercase"
                                    style={{
                                        color: '#666',
                                        textShadow: '0 0 10px rgba(139, 0, 0, 0.5)',
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0.6, 0.2, 0.6] }}
                                    transition={{ delay: 5, duration: 2, repeat: Infinity }}
                                >
                                    There is no going back.
                                </motion.p>
                            </div>
                        </div>

                        {/* Extra flickering vignette */}
                        <motion.div
                            className="fixed inset-0 z-[215]"
                            style={{
                                background: 'radial-gradient(ellipse at center, transparent 20%, rgba(139, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.9) 100%)',
                                pointerEvents: 'none',
                            }}
                            animate={{ opacity: [0.7, 1, 0.5, 0.9, 0.7] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
