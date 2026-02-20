'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        setError('');
        setIsLoading(true);

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
            } else {
                await signInWithEmail(email, password);
            }
            onClose();
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            switch (firebaseError.code) {
                case 'auth/email-already-in-use':
                    setError('This soul is already bound...');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid incantation...');
                    break;
                case 'auth/weak-password':
                    setError('Your ward is too weak... (min 6 chars)');
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('The gate does not recognize you...');
                    break;
                default:
                    setError('Dark forces intervened... try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            await signInWithGoogle();
            onClose();
        } catch {
            setError('The ritual failed... try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[300] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(20, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)',
                            backdropFilter: 'blur(8px)',
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        className="auth-modal relative z-[301]"
                        initial={{ opacity: 0, scale: 0.85, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 40 }}
                        transition={{ duration: 0.6, type: 'spring', damping: 18 }}
                    >
                        {/* Decorative top line */}
                        <motion.div
                            className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-red-700 to-transparent"
                            initial={{ width: 0 }}
                            animate={{ width: '80%' }}
                            transition={{ duration: 1, delay: 0.3 }}
                        />

                        {/* Close button */}
                        <motion.button
                            onClick={onClose}
                            className="auth-close-btn"
                            whileHover={{ scale: 1.15, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            ✕
                        </motion.button>

                        {/* Skull icon */}
                        <motion.div
                            className="flex justify-center mb-3"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 12px rgba(139, 0, 0, 0.6))' }}>
                                💀
                            </span>
                        </motion.div>

                        {/* Title */}
                        <motion.h2
                            className="font-cinzel text-xl sm:text-2xl text-center mb-1 tracking-[0.12em]"
                            style={{
                                background: 'linear-gradient(180deg, #ff3333, #8b0000, #ff1a1a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0 0 15px rgba(139, 0, 0, 0.4))',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            {isSignUp ? 'BIND YOUR SOUL' : 'IDENTIFY YOURSELF'}
                        </motion.h2>

                        <motion.p
                            className="text-center font-cinzel mb-6"
                            style={{
                                color: '#5a3a3a',
                                fontSize: '0.65rem',
                                letterSpacing: '0.25em',
                                textTransform: 'uppercase',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                        >
                            {isSignUp ? '— forge your dark covenant —' : '— the gate demands proof —'}
                        </motion.p>

                        {/* Error message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="auth-error"
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <span className="auth-error-icon">⚠</span> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Google Sign-in — FIRST for better UX */}
                        <motion.button
                            onClick={handleGoogleSignIn}
                            className="google-btn w-full"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="google-btn-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 5.48c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.09 2.69z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53l-3.12 2.42C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32l3.57 2.77c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L2.72 7.22C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                </svg>
                            </div>
                            <span className="google-btn-text font-cinzel">
                                {isLoading ? 'SUMMONING...' : '⚡ ENTER VIA GOOGLE'}
                            </span>
                        </motion.button>

                        {/* Divider */}
                        <div className="auth-divider">
                            <div className="auth-divider-line" />
                            <span className="auth-divider-text font-cinzel">or use dark magic</span>
                            <div className="auth-divider-line" />
                        </div>

                        {/* Form */}
                        <motion.form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="auth-input-group">
                                <span className="auth-input-icon">✉</span>
                                <input
                                    type="email"
                                    className="auth-input"
                                    placeholder="Your dark sigil (email)..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <div className="auth-input-group">
                                <span className="auth-input-icon">🗝️</span>
                                <input
                                    type="password"
                                    className="auth-input"
                                    placeholder="Your secret ward (password)..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <motion.button
                                type="submit"
                                className="auth-submit-btn font-cinzel"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className="auth-submit-glow" />
                                {isLoading ? '⏳ THE RITUAL...' : isSignUp ? '🩸 FORGE COVENANT' : '🔥 ENTER THE DARK'}
                            </motion.button>
                        </motion.form>

                        {/* Toggle */}
                        <motion.p
                            className="text-center text-xs font-cinzel mt-5"
                            style={{ color: '#4a3535', letterSpacing: '0.1em' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {isSignUp ? 'Already bound to the dark?' : 'No covenant yet?'}{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                }}
                                className="auth-toggle-btn"
                            >
                                {isSignUp ? 'Sign In' : 'Bind Your Soul'}
                            </button>
                        </motion.p>

                        {/* Decorative bottom line */}
                        <motion.div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-900/50 to-transparent"
                            initial={{ width: 0 }}
                            animate={{ width: '60%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
