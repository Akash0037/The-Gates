'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticlesOverlay from './ParticlesOverlay';

interface IdentityChamberProps {
    onComplete: (name: string) => void;
}

export default function IdentityChamber({ onComplete }: IdentityChamberProps) {
    const [visible, setVisible] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [name, setName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const heartbeatRef = useRef<AudioContext | null>(null);
    const fullText = 'What is your name?';

    // Heartbeat sound
    useEffect(() => {
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            heartbeatRef.current = ctx;

            const playBeat = () => {
                if (ctx.state === 'closed') return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(40, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);

                // Double beat
                setTimeout(() => {
                    if (ctx.state === 'closed') return;
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(35, ctx.currentTime);
                    gain2.gain.setValueAtTime(0.06, ctx.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.start(ctx.currentTime);
                    osc2.stop(ctx.currentTime + 0.2);
                }, 200);
            };

            const interval = setInterval(playBeat, 1200);
            return () => {
                clearInterval(interval);
                ctx.close();
            };
        } catch {
            return;
        }
    }, []);

    // Fade in
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 500);
        return () => clearTimeout(t);
    }, []);

    // Typewriter effect
    useEffect(() => {
        if (!visible) return;
        let i = 0;
        const interval = setInterval(() => {
            if (i < fullText.length) {
                setDisplayedText(fullText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => setShowInput(true), 500);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [visible]);

    const nameRegex = /^[a-zA-Z\s]+$/;

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || nameRegex.test(value)) {
            setName(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length === 0) return;
        if (!nameRegex.test(name.trim())) return;
        setSubmitted(true);
        setTimeout(() => onComplete(name.trim()), 2500);
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 flex items-center justify-center z-[80]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
            >
                {/* Dark stone background */}
                <div
                    className="fixed inset-0"
                    style={{
                        background: 'radial-gradient(ellipse at center, #0d0808 0%, #050202 50%, #000 100%)',
                    }}
                />

                {/* Flickering torch light */}
                <div
                    className="fixed inset-0 flicker"
                    style={{
                        background: 'radial-gradient(circle at 20% 30%, rgba(255, 80, 0, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255, 80, 0, 0.03) 0%, transparent 50%)',
                    }}
                />

                <ParticlesOverlay color="rgba(200, 150, 100, 0.2)" count={25} />
                <div className="vignette" />

                {/* Content */}
                <div className="relative z-[90] flex flex-col items-center px-6">
                    {/* Typewriter text */}
                    <motion.h2
                        className="font-cinzel text-2xl sm:text-3xl md:text-5xl text-center mb-6 sm:mb-8 md:mb-12"
                        style={{
                            color: '#c4a882',
                            textShadow: '0 0 30px rgba(196, 168, 130, 0.3)',
                        }}
                    >
                        {displayedText}
                        <span
                            className="inline-block w-[3px] h-[1em] ml-1 align-middle"
                            style={{
                                background: '#8b0000',
                                animation: 'blink-caret 0.75s step-end infinite',
                            }}
                        />
                    </motion.h2>

                    {/* Input */}
                    <AnimatePresence>
                        {showInput && !submitted && (
                            <motion.form
                                onSubmit={handleSubmit}
                                className="flex flex-col items-center gap-6"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <input
                                    type="text"
                                    className="glass-input text-center"
                                    placeholder="Speak your name..."
                                    value={name}
                                    onChange={handleNameChange}
                                    autoFocus
                                    maxLength={30}
                                />
                                {name.length > 0 && (
                                    <motion.button
                                        type="submit"
                                        className="btn-blood text-sm tracking-[0.3em] px-8 py-3"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        PROCEED
                                    </motion.button>
                                )}
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* After submit */}
                    <AnimatePresence>
                        {submitted && (
                            <motion.div
                                className="flex flex-col items-center gap-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                            >
                                <p
                                    className="font-cinzel text-lg sm:text-xl md:text-2xl"
                                    style={{ color: '#8b0000', textShadow: '0 0 20px rgba(139, 0, 0, 0.5)' }}
                                >
                                    The gate knows you now, <span className="text-red-400">{name}</span>.
                                </p>
                                <motion.div
                                    className="w-32 sm:w-40 md:w-48 h-[2px] bg-gradient-to-r from-transparent via-red-900 to-transparent mt-4"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 1.5 }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Fade out */}
                {submitted && (
                    <motion.div
                        className="fixed inset-0 bg-black z-[200]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 1.5 }}
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
}
