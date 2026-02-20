'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticlesOverlay from './ParticlesOverlay';

interface LocationChamberProps {
    userName: string;
    onComplete: (location: string) => void;
}

export default function LocationChamber({ userName, onComplete }: LocationChamberProps) {
    const [visible, setVisible] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [location, setLocation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const windRef = useRef<AudioContext | null>(null);
    const fullText = `Where are you from, ${userName}?`;

    // Wind sound
    useEffect(() => {
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            windRef.current = ctx;

            const bufferSize = ctx.sampleRate * 8;
            const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
            for (let c = 0; c < 2; c++) {
                const data = buffer.getChannelData(c);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.5;
                }
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, ctx.currentTime);

            // Modulate for wind effect
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
            lfoGain.gain.setValueAtTime(150, ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            lfo.start();

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.04, ctx.currentTime);

            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            source.start();

            return () => {
                source.stop();
                lfo.stop();
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

    // Typewriter
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
        }, 80);
        return () => clearInterval(interval);
    }, [visible, fullText]);

    // Button emerges slowly
    useEffect(() => {
        if (location.length > 0 && !showButton) {
            const t = setTimeout(() => setShowButton(true), 1200);
            return () => clearTimeout(t);
        }
    }, [location, showButton]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (location.trim().length === 0) return;
        setSubmitted(true);
        setTimeout(() => onComplete(location.trim()), 2500);
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
                {/* Darker background */}
                <div
                    className="fixed inset-0"
                    style={{
                        background: 'radial-gradient(ellipse at center, #080405 0%, #030101 50%, #000 100%)',
                    }}
                />

                {/* Moving shadow effect */}
                <motion.div
                    className="fixed inset-0"
                    animate={{
                        background: [
                            'radial-gradient(circle at 30% 50%, rgba(50, 0, 0, 0.08) 0%, transparent 60%)',
                            'radial-gradient(circle at 70% 50%, rgba(50, 0, 0, 0.08) 0%, transparent 60%)',
                            'radial-gradient(circle at 50% 30%, rgba(50, 0, 0, 0.08) 0%, transparent 60%)',
                            'radial-gradient(circle at 30% 50%, rgba(50, 0, 0, 0.08) 0%, transparent 60%)',
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />

                <ParticlesOverlay color="rgba(100, 100, 120, 0.15)" count={30} />
                <div className="vignette" />
                <div className="scan-line" />

                {/* Content */}
                <div className="relative z-[90] flex flex-col items-center px-6">
                    {/* Typewriter text */}
                    <motion.h2
                        className="font-cinzel text-2xl sm:text-3xl md:text-5xl text-center mb-6 sm:mb-8 md:mb-12"
                        style={{
                            color: '#8a8a9a',
                            textShadow: '0 0 20px rgba(138, 138, 154, 0.2)',
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
                                className="flex flex-col items-center gap-5 sm:gap-6 md:gap-8"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <input
                                    type="text"
                                    className="glass-input text-center"
                                    placeholder="Name your origin..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    autoFocus
                                    maxLength={50}
                                />

                                {/* Button emerges from ground */}
                                <AnimatePresence>
                                    {showButton && location.length > 0 && (
                                        <motion.button
                                            type="submit"
                                            className="btn-blood text-sm tracking-[0.3em] px-8 py-3"
                                            initial={{ opacity: 0, y: 60, scale: 0.5 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 1.5, type: 'spring', damping: 15 }}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            DESCEND DEEPER
                                        </motion.button>
                                    )}
                                </AnimatePresence>
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
                                    className="font-cinzel text-base sm:text-lg md:text-xl text-center"
                                    style={{ color: '#5a5a6a', textShadow: '0 0 15px rgba(90, 90, 106, 0.3)' }}
                                >
                                    <span className="text-red-700">{location}</span> will not save you here.
                                </p>
                                <motion.div
                                    className="w-40 sm:w-52 md:w-64 h-[1px] bg-gradient-to-r from-transparent via-red-900/50 to-transparent mt-4"
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
