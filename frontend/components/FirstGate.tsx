'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';
import HorrorAvatar from './HorrorAvatar';

const GateScene = dynamic(() => import('./GateScene'), { ssr: false });

interface FirstGateProps {
    onEnter: () => void;
}

export default function FirstGate({ onEnter }: FirstGateProps) {
    const [showButton, setShowButton] = useState(false);
    const [opening, setOpening] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const gateAudioRef = useRef<HTMLAudioElement | null>(null);
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => setShowButton(true), 2000);

        // Create ambient audio
        try {
            const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(55, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            // LFO for eerie wobble
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.setValueAtTime(0.5, audioCtx.currentTime);
            lfoGain.gain.setValueAtTime(5, audioCtx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            lfo.start();
            oscillator.start();

            audioRef.current = null; // We store context reference differently
            return () => {
                clearTimeout(timer);
                oscillator.stop();
                lfo.stop();
                audioCtx.close();
            };
        } catch {
            return () => clearTimeout(timer);
        }
    }, []);

    const handleEnter = () => {
        // If not authenticated, show auth modal
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        // Authenticated — proceed
        setOpening(true);

        // Gate creak sound
        try {
            const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const noise = audioCtx.createBufferSource();
            const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.8));
            }
            noise.buffer = buffer;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, audioCtx.currentTime);
            filter.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 2);
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            noise.start();
            gateAudioRef.current = null;
        } catch { /* audio not critical */ }

        setTimeout(() => setTransitioning(true), 1500);
        setTimeout(() => onEnter(), 3000);
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            {/* 3D Scene */}
            <GateScene opening={opening} />

            {/* Lightning flash */}
            <div className="lightning-flash" />

            {/* Scan line */}
            <div className="scan-line" />

            {/* Vignette */}
            <div className="vignette" />

            {/* Horror Avatar - top right */}
            <AnimatePresence>
                {!loading && user && (
                    <motion.div
                        className="fixed top-4 right-4 z-[150] flex items-center gap-3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.8, type: 'spring' }}
                    >
                        <HorrorAvatar
                            uid={user.uid}
                            displayName={user.displayName || user.email?.split('@')[0]}
                            size={44}
                            showName={true}
                        />
                        <motion.button
                            onClick={logout}
                            className="text-gray-600 hover:text-red-500 transition-colors text-xs font-cinzel tracking-wider"
                            whileHover={{ scale: 1.1 }}
                            title="Unbind your soul"
                        >
                            ⛓️‍💥
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Title & Button Overlay */}
            <AnimatePresence>
                {!transitioning && (
                    <motion.div
                        className="fixed inset-0 flex flex-col items-center justify-end pb-16 sm:pb-24 md:pb-32 z-[70]"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                    >
                        {/* Title */}
                        <motion.h1
                            className="font-cinzel text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-center mb-3 sm:mb-4 tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em]"
                            style={{
                                background: 'linear-gradient(135deg, #ff1a1a, #8b0000, #ff4500, #8b0000)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0 0 30px rgba(139, 0, 0, 0.5))',
                            }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 2, delay: 0.5 }}
                        >
                            THE 100,000 GATE
                        </motion.h1>

                        <motion.p
                            className="text-gray-500 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.3em] font-cinzel mb-6 sm:mb-8 md:mb-12 uppercase"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ duration: 2, delay: 1.5 }}
                        >
                            Some doors should remain closed
                        </motion.p>

                        {/* Enter Button */}
                        {showButton && !opening && (
                            <div className="flex flex-col items-center gap-3">
                                <motion.button
                                    className="btn-blood pulse-glow"
                                    onClick={handleEnter}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, type: 'spring' }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    🔥 E N T E R
                                </motion.button>

                                {/* Auth hint */}
                                {!loading && !user && (
                                    <motion.p
                                        className="text-gray-600 text-[10px] sm:text-xs tracking-[0.15em] font-cinzel"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        🔒 Sign in to pass through...
                                    </motion.p>
                                )}
                            </div>
                        )}

                        {opening && (
                            <motion.p
                                className="text-red-800 text-xs tracking-[0.25em] sm:tracking-[0.5em] font-cinzel"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                THE GATE OPENS...
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />

            {/* Fade to black transition */}
            <AnimatePresence>
                {transitioning && (
                    <motion.div
                        className="fixed inset-0 bg-black z-[200]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
