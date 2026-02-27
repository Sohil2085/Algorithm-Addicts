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
                                    <motion.div variants={fadeInUp} className="eyebrow">
                                        Next-Gen Invoice Financing
                                    </motion.div>

                                    <motion.h1 variants={fadeInUp} className="landing-h1">
                                        Turn Unpaid Invoices Into Instant Working Capital
                                    </motion.h1>

                                    <motion.p variants={fadeInUp} className="landing-text">
                                        FinBridge is a secure, AI-powered marketplace connecting MSMEs with lenders for fast invoice discounting. Risk-free, transparent, and built for growth.
                                    </motion.p>

                                    <motion.div variants={fadeInUp} className="cta-row">
                                        <button
                                            onClick={() => navigate('/register')}
                                            className="btn-primary flex items-center justify-center gap-2 group"
                                        >
                                            Get Started Now
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="btn-ghost"
                                        >
                                            Login to Platform
                                        </button>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="trust-row">
                                        <div className="trust-item">
                                            <Shield className="w-5 h-5 text-blue-500" />
                                            <span>Bank-Grade Security</span>
                                        </div>
                                        <div className="trust-item">
                                            <Zap className="w-5 h-5 text-blue-500" />
                                            <span>24h Approval</span>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* Right Visual Column (44%) */}
                                <motion.div
                                    className="hero-right"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                                >
                                    {/* Visual Frame - Fixed Dimensions */}
                                    <div className="visualFrame">
                                        <Fake3DSphere />

                                        {/* Floating Cards - Absolute within Visual Frame */}
                                        <motion.div
                                            className="card-invoice"
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <div className="card-header">
                                                <div className="card-label">Invoice #4092</div>
                                                <div className="card-status">Approved</div>
                                            </div>
                                            <div className="card-value">$12,450.00</div>
                                        </motion.div>

                                        <motion.div
                                            className="card-risk"
                                            animate={{ y: [0, 10, 0] }}
                                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        >
                                            <div className="flex gap-3 items-center">
                                                <div className="icon-circle">
                                                    <Zap size={16} />
                                                </div>
                                                <div>
                                                    <div className="card-label">Risk Score</div>
                                                    <div className="card-value-sm">A+ (Low Risk)</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
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
                                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Why Choose FinBridge?</h2>
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
                                        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all duration-500 overflow-hidden flex flex-col items-center text-center outline-none cursor-default"
                                    >
                                        {/* Gradient glow shadow behind card */}
                                        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"></div>

                                        {/* Animated Accent Line */}
                                        <div className="absolute top-0 left-0 w-full h-[2px] overflow-hidden bg-white/5">
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                                        </div>

                                        {/* Icon Container with Glow & Rotation */}
                                        <div className="relative mb-8 mt-2 flex items-center justify-center w-20 h-20">
                                            {/* Outer blurred circle */}
                                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-colors duration-500"></div>
                                            {/* Rotating ring around icon */}
                                            <div className="absolute inset-[-4px] border border-blue-500/30 rounded-full border-dashed animate-[spin_10s_linear_infinite] group-hover:border-blue-400/60 transition-colors"></div>
                                            {/* Inner lifted icon */}
                                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
                                                {/* Pulse glow */}
                                                <div className="absolute inset-0 rounded-full group-hover:animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] bg-blue-400/30 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
                                                {item.icon}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                                            {item.desc}
                                        </p>

                                        {/* Micro Stat */}
                                        <div className="mt-auto px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-semibold text-slate-400 group-hover:text-blue-300 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
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
                                <h2 className="text-4xl sm:text-5xl font-extrabold text-white inline-block relative px-4 pb-2">
                                    How FinBridge Works
                                </h2>
                                <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">Cinematic progression from unpaid invoice to instant working capital.</p>
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
                                            <div className={`relative w-20 h-20 rounded-full bg-[#0b1220] border-2 flex items-center justify-center mb-8 z-10 transition-all duration-500 ${activeStep === idx ? 'border-blue-400 shadow-[0_0_35px_rgba(59,130,246,0.5)] scale-110 -translate-y-1' : 'border-slate-800'}`}>
                                                <div className={`absolute inset-[-6px] rounded-full border transition-all duration-700 pointer-events-none ${activeStep === idx ? 'border-blue-500/40 animate-ping' : 'border-blue-500/0'}`}></div>
                                                <div className={`absolute inset-2 rounded-full transition-colors duration-500 blur-sm pointer-events-none ${activeStep === idx ? 'bg-blue-500/30' : 'bg-blue-500/0'}`}></div>
                                                <div className={`transition-transform duration-500 ${activeStep === idx ? 'scale-110 text-blue-200 rotate-3' : 'text-white'}`}>
                                                    {item.icon}
                                                </div>
                                            </div>

                                            {/* Card Content Elevation */}
                                            <div className={`relative z-10 backdrop-blur-xl rounded-2xl p-8 lg:p-10 border w-full max-w-[300px] min-h-[260px] transition-all duration-500 flex flex-col items-center flex-grow shadow-lg ${activeStep === idx ? 'bg-slate-800/90 border-blue-400/40 shadow-[0_0_50px_rgba(59,130,246,0.35)] -translate-y-2 scale-[1.04]' : 'bg-[#0b1220]/75 border-white/10'}`}>
                                                <div className={`font-bold tracking-[0.2em] text-[10px] mb-3 transition-colors ${activeStep === idx ? 'text-blue-300' : 'text-blue-400/60'}`}>
                                                    STEP {item.step}
                                                </div>
                                                <h3 className={`text-xl font-bold mb-3 tracking-wide transition-colors ${activeStep === idx ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-gray-200'}`}>{item.title}</h3>
                                                <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.desc}</p>

                                                {/* Hover Subtext fade in */}
                                                <div className={`mt-auto pt-4 border-t border-white/5 w-full text-[10px] uppercase tracking-wider font-semibold transition-all duration-700 text-center ${activeStep === idx ? 'opacity-100 translate-y-0 text-blue-300' : 'opacity-0 translate-y-2 text-blue-400/80'}`}>
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
                    <section className="dual-section">
                        <div className="landing-container">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="section-header"
                            >
                                <h2 className="section-title">Built for MSMEs & Lenders</h2>
                                <p className="section-subtitle">Tailored solutions for every stakeholder.</p>
                            </motion.div>

                            <div className="dual-grid">
                                {/* MSME Side */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="dual-card msme-card"
                                >
                                    <h3 className="dual-title">For MSMEs</h3>
                                    <div className="dual-benefits">
                                        <div className="benefit-item">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span>Get funded in 24 hours</span>
                                        </div>
                                        <div className="benefit-item">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span>Retain complete invoice ownership</span>
                                        </div>
                                        <div className="benefit-item">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span>No hidden charges or collateral needed</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="btn-primary mt-8"
                                    >
                                        Start as MSME
                                    </button>
                                </motion.div>

                                {/* Lender Side */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="dual-card lender-card"
                                >
                                    <h3 className="dual-title">For Lenders</h3>
                                    <div className="dual-benefits">
                                        <div className="benefit-item">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span>Pre-screened, low-risk assets</span>
                                        </div>
                                        <div className="benefit-item">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span>Consistent 12-15% annual returns</span>
                                        </div>
                                        <div className="benefit-item">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span>Diversified portfolio management</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="btn-primary mt-8"
                                    >
                                        Partner as Lender
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* AI Risk Intelligence Section */}
                    <section className="relative py-20 lg:py-28 overflow-hidden z-20 bg-[#060a12]/80">
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
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
                                        AI-Driven Risk Intelligence
                                    </h2>
                                    <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg">
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
                                                className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-default border ${activeFeature === idx ? 'bg-blue-500/10 border-blue-500/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                                                onMouseEnter={() => setActiveFeature(idx)}
                                            >
                                                <div className={`mt-1 p-2 rounded-lg transition-colors ${activeFeature === idx ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                                                    {feature.icon}
                                                </div>
                                                <div>
                                                    <h4 className={`text-lg font-bold mb-1 transition-colors ${activeFeature === idx ? 'text-blue-100' : 'text-white'}`}>{feature.title}</h4>
                                                    <p className={`text-sm transition-colors ${activeFeature === idx ? 'text-gray-300' : 'text-gray-500'}`}>{feature.desc}</p>
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
                                            <div key={idx} className="group relative bg-[#0b1220]/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-300 text-center">
                                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                <div className="text-2xl lg:text-3xl font-black text-white mb-1 relative z-10 drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">{stat.number}</div>
                                                <div className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-gray-400 relative z-10 group-hover:text-gray-200 transition-colors">{stat.label}</div>
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
                                        <div className="relative z-10 w-64 h-64 rounded-full bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(30,58,138,0.5)] flex flex-col items-center justify-center p-8 text-center overflow-hidden transition-all duration-500">

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
                                                <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Status</div>
                                                <div className="text-lg font-black text-white tracking-wide">
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
                    <section className="relative py-24 overflow-hidden border-t border-white/5 bg-[#03060c]">
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
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-sm">
                                    Ready to unlock instant <br className="hidden sm:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">working capital?</span>
                                </h2>
                                <p className="text-gray-400 text-lg lg:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
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
                                        className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 transition-all duration-300 text-lg"
                                    >
                                        Login
                                    </button>
                                </div>

                                {/* Trust Chips */}
                                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                                    {[
                                        { label: "GST Verified", icon: <FileCheck className="w-4 h-4 text-emerald-400" /> },
                                        { label: "AI Risk Scoring", icon: <TrendingUp className="w-4 h-4 text-blue-400" /> },
                                        { label: "24h Funding", icon: <Zap className="w-4 h-4 text-purple-400" /> }
                                    ].map((chip, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-800 text-sm font-semibold text-slate-300 backdrop-blur-sm"
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
