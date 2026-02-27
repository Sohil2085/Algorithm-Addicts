import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Zap, Upload, FileCheck, TrendingUp, Lock } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Fake3DSphere from '../components/Fake3DSphere';
import AnimatedBackground from '../components/AnimatedBackground';
import '../styles/landing.css';
import Footer from '../components/Footer';

const Landing = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [dotProgress, setDotProgress] = useState(0);
    const [activeFeature, setActiveFeature] = useState(0); const timelineRef = useRef(null);
    const stepRefs = useRef([]);
    const animationRef = useRef(null);
    const navigate = useNavigate();

    // Loading Simulation Lifecycle
    useEffect(() => {
        // sessionStorage only exists in a browser environment
        if (typeof window === 'undefined' || !window.sessionStorage) {
            return;
        }

        const seen = sessionStorage.getItem('landingAnimationPlayed');
        if (seen) {
            setTimeout(() => {
                setIsLoading(false);
            }, 0);
            return;
        }

        // Simulate loading time on first visit
        const timer = setTimeout(() => {
            setIsLoading(false);
            sessionStorage.setItem('landingAnimationPlayed', 'true');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Cinematic Animation Logic for Timeline Dot & Active Step Sync
    useEffect(() => {
        if (isLoading) return;

        let startTime = null;
        const DURATION = 8000; // 8 seconds per cycle
        let currentProgress = 0;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            // Loop progress from 0 to 1
            currentProgress = (elapsed % DURATION) / DURATION;
            setDotProgress(currentProgress);

            if (timelineRef.current && stepRefs.current.length === 4) {
                const isMobile = window.innerWidth < 768;
                const timelineSize = isMobile ? timelineRef.current.offsetHeight : timelineRef.current.offsetWidth;

                // Calculate absolute dot position relative to the timeline container
                const dotPos = currentProgress * timelineSize;

                // Find the closest step center to the dot
                let closestIdx = 0;
                let minDistance = Infinity;

                stepRefs.current.forEach((stepEl, idx) => {
                    if (stepEl) {
                        // Get coordinates relative to the timeline parent container
                        // We must offset them based on whether it's horizontal or vertical
                        const timelineRect = timelineRef.current.getBoundingClientRect();
                        const stepRect = stepEl.getBoundingClientRect();

                        let stepCenter;
                        if (isMobile) {
                            stepCenter = (stepRect.top - timelineRect.top) + (stepRect.height / 2);
                        } else {
                            stepCenter = (stepRect.left - timelineRect.left) + (stepRect.width / 2);
                        }

                        const distance = Math.abs(dotPos - stepCenter);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestIdx = idx;
                        }
                    }
                });

                setActiveStep(closestIdx);
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isLoading]);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="landing-page">
            <LoadingScreen isLoading={isLoading} />

            {/* Show content only when loading is done */}
            {!isLoading && (
                <>
                    <AnimatedBackground />

                    {/* Hero Section - Strict Desktop Layout */}
                    <header className="hero-section">
                        <div className="landing-container">
                            <div className="hero-grid">

                                {/* Left Content Column (56%) */}
                                <motion.div
                                    className="hero-left"
                                    initial="hidden"
                                    animate="visible"
                                    variants={staggerContainer}
                                >
                                    <motion.div variants={fadeInUp} className="eyebrow flex items-center gap-2 w-fit px-4 py-1.5 rounded-full bg-theme-surface-hover border border-theme-border backdrop-blur-md text-sm font-semibold text-theme-text-muted hover:shadow-theme-md hover:border-theme-border-focus transition-all cursor-default mb-6">
                                        NEXT-GEN INVOICE FINANCING
                                    </motion.div>

                                    <motion.h1 variants={fadeInUp} className="landing-h1 tracking-tight leading-[1.05] text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-theme-text">
                                        Turn Unpaid Invoices Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Instant Working Capital</span>
                                    </motion.h1>

                                    <motion.p variants={fadeInUp} className="landing-text max-w-lg text-theme-text-muted leading-relaxed text-lg mb-8">
                                        FinBridge is a secure, AI-powered marketplace connecting MSMEs with lenders for fast invoice discounting. Risk-free, transparent, and built for growth.
                                    </motion.p>

                                    <motion.div variants={fadeInUp} className="cta-row flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto">
                                        <button
                                            onClick={() => navigate('/register')}
                                            className="relative overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-[1px] transition-all duration-300 flex items-center justify-center gap-2 group border border-blue-500/50 hover:border-blue-400 after:content-[''] after:absolute after:inset-0 after:-translate-x-full hover:after:translate-x-[100%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:transition-transform after:duration-[1.5s] after:ease-in-out"
                                        >
                                            <span className="relative z-10">Get Started Now</span>
                                            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-theme-text bg-theme-surface border border-theme-border hover:bg-theme-surface-hover hover:border-theme-border-focus transition-colors duration-300 flex items-center justify-center"
                                        >
                                            Login to Platform
                                        </button>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="trust-row flex flex-wrap items-center gap-3">
                                        {[
                                            { text: "Bank-Grade Security", icon: <Shield className="w-4 h-4 text-blue-400" /> },
                                            { text: "24h Approval", icon: <Zap className="w-4 h-4 text-emerald-400" /> },
                                            { text: "No Hidden Fees", icon: <CheckCircle className="w-4 h-4 text-blue-400" /> }
                                        ].map((trust, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-theme-surface border border-theme-border text-[13px] font-medium text-theme-text-muted hover:bg-theme-surface-hover transition-colors">
                                                {trust.icon}
                                                <span>{trust.text}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                </motion.div>

                                {/* Right Visual Column (44%) */}
                                <motion.div
                                    className="hero-right relative"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                                >
                                    {/* Radial Glow Behind Sphere */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-blue-600/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none z-0"></div>

                                    {/* Visual Frame - Fixed Dimensions */}
                                    <motion.div
                                        className="visualFrame relative z-10 w-full h-full"
                                        animate={{ y: [-8, 8, -8] }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Fake3DSphere />

                                        {/* Floating Cards - Absolute within Visual Frame */}
                                        <motion.div
                                            className="card-invoice bg-theme-surface backdrop-blur-xl border border-theme-border shadow-theme-md rounded-xl p-4 min-w-[180px]"
                                            animate={{ y: [0, -12, 0] }}
                                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <div className="card-header flex justify-between items-center mb-2">
                                                <div className="card-label text-xs font-semibold text-theme-text-muted uppercase tracking-wider">Invoice #4092</div>
                                                <div className="card-status text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">Approved</div>
                                            </div>
                                            <div className="card-value text-xl font-black text-theme-text">$12,450.00</div>
                                        </motion.div>

                                        <motion.div
                                            className="card-risk bg-theme-surface backdrop-blur-xl border border-theme-border shadow-theme-md rounded-xl p-4 min-w-[200px]"
                                            animate={{ y: [0, 12, 0] }}
                                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className="icon-circle w-10 h-10 rounded-full bg-theme-tag-bg border border-theme-tag-border flex items-center justify-center text-theme-accent">
                                                    <Zap size={18} />
                                                </div>
                                                <div>
                                                    <div className="card-label text-xs font-semibold text-theme-text-muted uppercase tracking-wider mb-0.5">Risk Score</div>
                                                    <div className="card-value-sm text-sm font-bold text-theme-text">A+ (Low Risk)</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </header>

                    {/* Features Section */}
                    <section className="relative py-24 overflow-hidden">
                        {/* Background Enhancement (Subtle radial gradient blobs) */}
                        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 -z-10 pointer-events-none"></div>
                        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] -translate-y-1/2 -z-10 pointer-events-none"></div>

                        <div className="landing-container relative z-10">
                            <div className="text-center mb-16">
                                <h2 className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-theme-text to-theme-accent pb-4">Why Choose FinBridge?</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {[
                                    {
                                        title: "Instant Liquidity",
                                        desc: "Convert up to 90% of your invoice value into cash within 24 hours.",
                                        icon: <Zap className="w-8 h-8 text-blue-400 relative z-10" />,
                                        stat: "₹500Cr+ Funded"
                                    },
                                    {
                                        title: "Smart Risk Scoring",
                                        desc: "AI-driven analysis ensures secure transactions and fair rates.",
                                        icon: <Shield className="w-8 h-8 text-blue-400 relative z-10" />,
                                        stat: "98% Accuracy"
                                    },
                                    {
                                        title: "Seamless Integration",
                                        desc: "Connects directly with your existing accounting software.",
                                        icon: <CheckCircle className="w-8 h-8 text-blue-400 relative z-10" />,
                                        stat: "100% Digital"
                                    }
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative bg-theme-surface backdrop-blur-xl border border-theme-border rounded-2xl p-8 hover:-translate-y-2 hover:shadow-theme-md transition-all duration-500 overflow-hidden flex flex-col items-center text-center outline-none cursor-default"
                                    >
                                        {/* Gradient glow shadow behind card */}
                                        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"></div>

                                        {/* Animated Accent Line */}
                                        <div className="absolute top-0 left-0 w-full h-[2px] overflow-hidden bg-theme-surface-hover">
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                                        </div>

                                        {/* Icon Container with Glow & Rotation */}
                                        <div className="relative mb-8 mt-2 flex items-center justify-center w-20 h-20">
                                            {/* Outer blurred circle */}
                                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-colors duration-500"></div>
                                            {/* Rotating ring around icon */}
                                            <div className="absolute inset-[-4px] border border-blue-500/30 rounded-full border-dashed animate-[spin_10s_linear_infinite] group-hover:border-blue-400/60 transition-colors"></div>
                                            {/* Inner lifted icon */}
                                            <div className="w-16 h-16 rounded-full bg-theme-surface border border-theme-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
                                                {/* Pulse glow */}
                                                <div className="absolute inset-0 rounded-full group-hover:animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] bg-blue-400/30 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
                                                {item.icon}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-theme-text mb-3">{item.title}</h3>
                                        <p className="text-theme-text-muted text-sm leading-relaxed mb-6 flex-grow">
                                            {item.desc}
                                        </p>

                                        {/* Micro Stat */}
                                        <div className="mt-auto px-4 py-1.5 rounded-full bg-theme-surface-hover border border-theme-border text-xs font-semibold text-theme-text-muted group-hover:text-theme-accent group-hover:bg-theme-tag-bg group-hover:border-theme-tag-border transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                            {item.stat}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* How FinBridge Works Section */}
                    <section className="relative py-16 lg:py-20 overflow-hidden z-20">
                        <div className="landing-container">
                            <div className="text-center mb-24 relative">
                                <h2 className="text-4xl sm:text-5xl font-extrabold text-theme-text inline-block relative px-4 pb-2">
                                    How FinBridge Works
                                </h2>
                                <p className="mt-6 text-theme-text-muted text-lg max-w-2xl mx-auto">Cinematic progression from unpaid invoice to instant working capital.</p>
                            </div>

                            <div className="relative max-w-6xl mx-auto" ref={timelineRef}>
                                {/* Connecting timeline line (Desktop: horizontal) */}
                                <div className="absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-blue-900/40 hidden md:block z-0 overflow-visible rounded-full">
                                    <div
                                        className="absolute top-1/2 w-4 h-4 bg-blue-400 blur-sm rounded-full animate-pulse shadow-[0_0_20px_6px_rgba(96,165,250,0.8)] -translate-y-1/2"
                                        style={{ left: `${dotProgress * 100}%` }}
                                    ></div>
                                    <div
                                        className="absolute top-1/2 w-2 h-2 bg-white rounded-full -translate-y-1/2"
                                        style={{ left: `${dotProgress * 100}%` }}
                                    ></div>
                                    <div
                                        className="absolute top-0 h-full w-[20%] bg-gradient-to-r from-transparent via-blue-400/80 to-transparent"
                                        style={{ left: `${(dotProgress * 100) - 20}%` }}
                                    ></div>
                                </div>

                                {/* Mobile vertical line (Mobile: vertical) */}
                                <div className="absolute top-[5%] bottom-[5%] left-1/2 w-[2px] bg-blue-900/40 -translate-x-1/2 md:hidden z-0 overflow-visible rounded-full">
                                    <div
                                        className="absolute left-1/2 w-4 h-4 bg-blue-400 blur-sm rounded-full animate-pulse shadow-[0_0_20px_6px_rgba(96,165,250,0.8)] -translate-x-1/2"
                                        style={{ top: `${dotProgress * 100}%` }}
                                    ></div>
                                    <div
                                        className="absolute left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2"
                                        style={{ top: `${dotProgress * 100}%` }}
                                    ></div>
                                    <div
                                        className="absolute left-0 w-full h-[20%] bg-gradient-to-b from-transparent via-blue-400/80 to-transparent"
                                        style={{ top: `${(dotProgress * 100) - 20}%` }}
                                    ></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
                                    {[
                                        {
                                            step: "01",
                                            title: "Upload Invoice",
                                            desc: "Submit your unpaid invoices in seconds.",
                                            subtext: "Auto-data extraction API",
                                            icon: <Upload className="w-7 h-7 relative z-10 transition-colors duration-500" />
                                        },
                                        {
                                            step: "02",
                                            title: "GST Verification",
                                            desc: "Automated verification with tax authorities.",
                                            subtext: "GSP Network Sync",
                                            icon: <FileCheck className="w-7 h-7 relative z-10 transition-colors duration-500" />
                                        },
                                        {
                                            step: "03",
                                            title: "Smart Risk Scoring",
                                            desc: "AI-powered analysis in real-time.",
                                            subtext: "Proprietary ML Models",
                                            icon: <TrendingUp className="w-7 h-7 relative z-10 transition-colors duration-500" />
                                        },
                                        {
                                            step: "04",
                                            title: "Instant Funding",
                                            desc: "Receive funds within 24 hours.",
                                            subtext: "Direct Escrow Transfer",
                                            icon: <Zap className="w-7 h-7 relative z-10 transition-colors duration-500" />
                                        }
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative flex flex-col items-center text-center pt-4"
                                            ref={(el) => (stepRefs.current[idx] = el)}
                                        >
                                            {/* Step circular node */}
                                            <div className={`relative w-20 h-20 rounded-full bg-theme-bg border-2 flex items-center justify-center mb-8 z-10 transition-all duration-500 ${activeStep === idx ? 'border-theme-border-focus shadow-[0_0_35px_rgba(59,130,246,0.5)] scale-110 -translate-y-1' : 'border-theme-border'}`}>
                                                <div className={`absolute inset-[-6px] rounded-full border transition-all duration-700 pointer-events-none ${activeStep === idx ? 'border-theme-border-focus/40 animate-ping' : 'border-theme-border-focus/0'}`}></div>
                                                <div className={`absolute inset-2 rounded-full transition-colors duration-500 blur-sm pointer-events-none ${activeStep === idx ? 'bg-theme-accent-subtle' : 'bg-transparent'}`}></div>
                                                <div className={`transition-transform duration-500 ${activeStep === idx ? 'scale-110 text-theme-accent rotate-3' : 'text-theme-text'}`}>
                                                    {item.icon}
                                                </div>
                                            </div>

                                            {/* Card Content Elevation */}
                                            <div className={`relative z-10 backdrop-blur-xl rounded-2xl p-8 lg:p-10 border w-full max-w-[300px] min-h-[260px] transition-all duration-500 flex flex-col items-center flex-grow shadow-lg ${activeStep === idx ? 'bg-theme-surface border-theme-border-focus/40 shadow-[0_0_50px_rgba(59,130,246,0.35)] -translate-y-2 scale-[1.04]' : 'bg-theme-surface-hover border-theme-border'}`}>
                                                <div className={`font-bold tracking-[0.2em] text-[10px] mb-3 transition-colors ${activeStep === idx ? 'text-theme-accent' : 'text-theme-accent/60'}`}>
                                                    STEP {item.step}
                                                </div>
                                                <h3 className={`text-xl font-bold mb-3 tracking-wide transition-colors ${activeStep === idx ? 'text-theme-text drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-theme-text-muted'}`}>{item.title}</h3>
                                                <p className="text-theme-text-muted text-sm leading-relaxed mb-4">{item.desc}</p>

                                                {/* Hover Subtext fade in */}
                                                <div className={`mt-auto pt-4 border-t border-theme-border-hover w-full text-[10px] uppercase tracking-wider font-semibold transition-all duration-700 text-center ${activeStep === idx ? 'opacity-100 translate-y-0 text-theme-accent' : 'opacity-0 translate-y-2 text-theme-accent/80'}`}>
                                                    {item.subtext}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Built for MSMEs & Lenders Section */}
                    <section className="relative py-24 overflow-hidden z-20 bg-theme-bg shadow-[inset_0_0_100px_rgba(0,0,0,0.02)]">
                        {/* Background Accents */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none z-0"></div>
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                        <div className="landing-container relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-center mb-16"
                            >
                                <h2 className="text-4xl sm:text-5xl font-extrabold text-theme-text mb-4 tracking-tight drop-shadow-sm">Built for MSMEs & Lenders</h2>
                                <p className="text-theme-text-muted text-lg max-w-2xl mx-auto">Tailored solutions for every stakeholder.</p>
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative">
                                {/* Vertical glowing divider (Desktop only) */}
                                <div className="hidden lg:block absolute left-1/2 top-[5%] bottom-[5%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 z-0"></div>

                                {/* MSME Side */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="group relative bg-theme-surface backdrop-blur-xl border border-theme-border rounded-3xl p-8 sm:p-10 hover:-translate-y-2 hover:shadow-theme-md transition-all duration-500 overflow-hidden flex flex-col z-10"
                                >
                                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"></div>

                                    {/* Icon Header */}
                                    <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300">
                                        <FileCheck className="w-7 h-7 text-blue-400" />
                                    </div>

                                    {/* Role Badge */}
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-6 w-fit">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
                                        For MSMEs
                                    </div>

                                    <div className="flex flex-col gap-4 mb-8 flex-grow">
                                        {[
                                            "Get funded in 24 hours",
                                            "Retain complete invoice ownership",
                                            "No hidden charges or collateral needed"
                                        ].map((text, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-theme-text-muted">
                                                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Micro Stats */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {["24h Funding", "0% Hidden Fees", "100% Ownership"].map((stat, idx) => (
                                            <div key={idx} className="px-3 py-1.5 rounded-lg bg-theme-surface-hover border border-theme-border text-xs font-semibold text-theme-text-muted">
                                                {stat}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => navigate('/register')}
                                        className="mt-auto w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 relative overflow-hidden group/btn text-[15px]"
                                    >
                                        <span className="relative z-10 block w-full text-center">Start as MSME</span>
                                        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1.5s] ease-in-out"></div>
                                    </button>
                                </motion.div>

                                {/* Lender Side */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                                    className="group relative bg-theme-surface backdrop-blur-xl border border-theme-border rounded-3xl p-8 sm:p-10 hover:-translate-y-2 hover:shadow-theme-md transition-all duration-500 overflow-hidden flex flex-col z-10"
                                >
                                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"></div>

                                    {/* Icon Header */}
                                    <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300">
                                        <TrendingUp className="w-7 h-7 text-blue-400" />
                                    </div>

                                    {/* Role Badge */}
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-6 w-fit">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
                                        For Lenders
                                    </div>

                                    <div className="flex flex-col gap-4 mb-8 flex-grow">
                                        {[
                                            "Pre-screened, low-risk assets",
                                            "Consistent 12-15% annual returns",
                                            "Diversified portfolio management"
                                        ].map((text, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-theme-text-muted">
                                                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Micro Stats */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {["12–15% Returns", "AI Risk Filtered", "Diversified Pool"].map((stat, idx) => (
                                            <div key={idx} className="px-3 py-1.5 rounded-lg bg-theme-surface-hover border border-theme-border text-xs font-semibold text-theme-text-muted">
                                                {stat}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => navigate('/login')}
                                        className="mt-auto w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 relative overflow-hidden group/btn text-[15px]"
                                    >
                                        <span className="relative z-10 block w-full text-center">Partner as Lender</span>
                                        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1.5s] ease-in-out"></div>
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* AI Risk Intelligence Section */}
                    <section className="relative py-20 lg:py-28 overflow-hidden z-20 bg-theme-elevated/40">
                        {/* Decorative Background for AI Section */}
                        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>

                        <div className="landing-container">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
                                {/* Left Text Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="flex flex-col relative z-10"
                                >
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-theme-text mb-6">
                                        AI-Driven Risk Intelligence
                                    </h2>
                                    <p className="text-theme-text-muted text-lg leading-relaxed mb-10 max-w-lg">
                                        Our proprietary machine learning engine analyzes hundreds of data points in real-time to deliver accurate risk assessments and optimal matching between MSMEs and lenders.
                                    </p>

                                    <div className="flex flex-col gap-6 mb-12">
                                        {[
                                            {
                                                title: "Real-Time Scoring",
                                                desc: "Instant risk assessment across invoices and parties",
                                                icon: <Shield className="w-5 h-5 text-blue-400" />
                                            },
                                            {
                                                title: "Fraud Detection",
                                                desc: "Advanced anomaly detection prevents fraudulent transactions",
                                                icon: <Zap className="w-5 h-5 text-blue-400" />
                                            },
                                            {
                                                title: "Smart Matching",
                                                desc: "Algorithms optimize yield and risk distribution",
                                                icon: <CheckCircle className="w-5 h-5 text-blue-400" />
                                            }
                                        ].map((feature, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-default border ${activeFeature === idx ? 'bg-theme-tag-bg border-theme-tag-border' : 'bg-transparent border-transparent hover:bg-theme-surface-active'}`}
                                                onMouseEnter={() => setActiveFeature(idx)}
                                            >
                                                <div className={`mt-1 p-2 rounded-lg transition-colors ${activeFeature === idx ? 'bg-theme-accent-subtle' : 'bg-theme-surface-hover'}`}>
                                                    {feature.icon}
                                                </div>
                                                <div>
                                                    <h4 className={`text-lg font-bold mb-1 transition-colors ${activeFeature === idx ? 'text-theme-text' : 'text-theme-text'}`}>{feature.title}</h4>
                                                    <p className={`text-sm transition-colors ${activeFeature === idx ? 'text-theme-text-muted' : 'text-theme-text-muted'}`}>{feature.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 3 Premium Metric Cards */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { number: "98%", label: "Accuracy Rate", color: "from-blue-500 to-indigo-500" },
                                            { number: "24h", label: "Funding Cycle", color: "from-emerald-400 to-teal-500" },
                                            { number: "100%", label: "Digital Workflow", color: "from-purple-500 to-pink-500" }
                                        ].map((stat, idx) => (
                                            <div key={idx} className="group relative bg-theme-bg backdrop-blur-md rounded-2xl border border-theme-border p-5 overflow-hidden hover:border-theme-border-hover hover:-translate-y-1 transition-all duration-300 text-center">
                                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                                                <div className="absolute inset-0 bg-gradient-to-b from-theme-surface-hover to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                <div className="text-2xl lg:text-3xl font-black text-theme-text mb-1 relative z-10 drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">{stat.number}</div>
                                                <div className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-theme-text-muted relative z-10 group-hover:text-theme-text transition-colors">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Right Visual - Dynamic Intelligence Panel */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="relative h-[500px] w-full flex items-center justify-center lg:justify-end"
                                >
                                    <div className="relative w-full max-w-[450px] aspect-square rounded-full border border-blue-900/30 flex items-center justify-center">
                                        {/* Outer Rotating Ring */}
                                        <div className="absolute inset-4 border border-blue-500/20 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>

                                        {/* Middle Ring with Glow */}
                                        <div className="absolute inset-12 border border-blue-400/30 rounded-full shadow-[0_0_30px_inset_rgba(59,130,246,0.1)] flex items-center justify-center">
                                            {/* Orbital dots representing data points */}
                                            <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-300 rounded-full shadow-[0_0_10px_rgba(147,197,253,0.8)] -translate-x-1/2 -translate-y-1/2"></div>
                                            <div className="absolute bottom-1/4 right-0 w-1.5 h-1.5 bg-indigo-300 rounded-full shadow-[0_0_8px_rgba(165,180,252,0.8)] -translate-y-1/2"></div>
                                        </div>

                                        {/* Central Core Glass Panel */}
                                        <div className="relative z-10 w-64 h-64 rounded-full bg-theme-surface/75 backdrop-blur-2xl border border-theme-border shadow-[0_0_50px_rgba(30,58,138,0.5)] flex flex-col items-center justify-center p-8 text-center overflow-hidden transition-all duration-500">

                                            {/* Reactive radial background based on hover state */}
                                            <div className={`absolute inset-0 bg-gradient-to-tr transition-colors duration-700 opacity-20 ${activeFeature === 0 ? 'from-blue-600 to-transparent' :
                                                activeFeature === 1 ? 'from-purple-600 to-transparent' :
                                                    'from-emerald-600 to-transparent'
                                                }`}></div>

                                            {/* Dynamic Icon Center */}
                                            <div className="relative mb-4 z-10 transition-transform duration-500 scale-110">
                                                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full"></div>
                                                <Zap className={`w-12 h-12 transition-colors duration-500 relative z-10 ${activeFeature === 0 ? 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]' :
                                                    activeFeature === 1 ? 'text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]' :
                                                        'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]'
                                                    }`} />
                                            </div>

                                            {/* Dynamic Text */}
                                            <div className="z-10 relative">
                                                <div className="text-[10px] uppercase font-bold tracking-widest text-theme-text-muted mb-1">Status</div>
                                                <div className="text-lg font-black text-theme-text tracking-wide">
                                                    {activeFeature === 0 ? 'ANALYZING...' : activeFeature === 1 ? 'SECURED' : 'OPTIMIZED'}
                                                </div>
                                            </div>

                                            {/* Scanning Line Animation */}
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-[flowDown_3s_linear_infinite]"></div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className="relative py-24 overflow-hidden border-t border-theme-border bg-theme-bg shadow-[inset_0_0_150px_rgba(0,0,0,0.05)]">
                        {/* Dramatic radial glow behind CTA */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none"></div>

                        {/* Subtle spark dots grid (mimicked with css pattern) */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                        <div className="landing-container relative z-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="max-w-4xl mx-auto text-center"
                            >
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-theme-text mb-6 leading-tight drop-shadow-sm">
                                    Ready to unlock instant <br className="hidden sm:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">working capital?</span>
                                </h2>
                                <p className="text-theme-text-muted text-lg lg:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                                    Upload an invoice, get verified, and receive funding—fast. Experience the future of B2B financing today.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-theme-text bg-theme-surface border border-theme-border hover:bg-theme-surface-hover hover:border-theme-border-hover hover:-translate-y-1 transition-all duration-300 text-lg"
                                    >
                                        Login
                                    </button>
                                </div>

                                {/* Trust Chips */}
                                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                                    {[
                                        { label: "GST Verified", icon: <FileCheck className="w-4 h-4 text-emerald-400" /> },
                                        { label: "AI Risk Scoring", icon: <TrendingUp className="w-4 h-4 text-theme-accent" /> },
                                        { label: "24h Funding", icon: <Zap className="w-4 h-4 text-purple-400" /> }
                                    ].map((chip, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-theme-surface border border-theme-border text-sm font-semibold text-theme-text-muted backdrop-blur-sm shadow-theme-sm"
                                        >
                                            {chip.icon}
                                            {chip.label}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    <Footer />
                </>
            )}
        </div>
    );
};

export default Landing;
