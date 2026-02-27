import React, { useState, useEffect } from 'react';
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
    const navigate = useNavigate();

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
                    <section className="features-section">
                        <div className="landing-container">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="features-header"
                            >
                                <h2 className="landing-h2 text-center text-white">Why Choose FinBridge?</h2>
                            </motion.div>

                            <div className="features-grid">
                                {[
                                    {
                                        title: "Instant Liquidity",
                                        desc: "Convert up to 90% of your invoice value into cash within 24 hours.",
                                        icon: <Zap className="w-8 h-8 text-blue-400" />
                                    },
                                    {
                                        title: "Smart Risk Scoring",
                                        desc: "AI-driven analysis ensures secure transactions and fair rates.",
                                        icon: <Shield className="w-8 h-8 text-blue-400" />
                                    },
                                    {
                                        title: "Seamless Integration",
                                        desc: "Connects directly with your existing accounting software.",
                                        icon: <CheckCircle className="w-8 h-8 text-blue-400" />
                                    }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className="glass-card hover:bg-white/5 transition-colors cursor-default"
                                    >
                                        <div className="feature-icon-wrapper">
                                            {item.icon}
                                        </div>
                                        <h3 className="feature-title">{item.title}</h3>
                                        <p className="feature-desc">
                                            {item.desc}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* How FinBridge Works Section */}
                    <section className="process-section">
                        <div className="landing-container">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="section-header"
                            >
                                <h2 className="section-title">How FinBridge Works</h2>
                                <p className="section-subtitle">Simple, transparent, and secure in four steps.</p>
                            </motion.div>

                            <div className="process-grid">
                                {[
                                    {
                                        step: "01",
                                        title: "Upload Invoice",
                                        desc: "Submit your unpaid invoices in seconds.",
                                        icon: <Upload className="w-8 h-8 text-blue-400" />
                                    },
                                    {
                                        step: "02",
                                        title: "GST Verification",
                                        desc: "Automated verification with tax authorities.",
                                        icon: <FileCheck className="w-8 h-8 text-blue-400" />
                                    },
                                    {
                                        step: "03",
                                        title: "Smart Risk Scoring",
                                        desc: "AI-powered analysis in real-time.",
                                        icon: <TrendingUp className="w-8 h-8 text-blue-400" />
                                    },
                                    {
                                        step: "04",
                                        title: "Instant Funding",
                                        desc: "Receive funds within 24 hours.",
                                        icon: <Zap className="w-8 h-8 text-blue-400" />
                                    }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className="process-card"
                                    >
                                        <div className="process-step">{item.step}</div>
                                        <div className="process-icon-wrapper">
                                            {item.icon}
                                        </div>
                                        <h3 className="process-title">{item.title}</h3>
                                        <p className="process-desc">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Connecting line for visual flow */}
                            <div className="process-line"></div>
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
                    <section className="ai-section">
                        <div className="landing-container">
                            <div className="ai-grid">
                                {/* Left Text Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="ai-content"
                                >
                                    <h2 className="section-title">AI-Driven Risk Intelligence</h2>
                                    <p className="ai-description">
                                        Our proprietary machine learning engine analyzes hundreds of data points in real-time to deliver accurate risk assessments and optimal matching between MSMEs and lenders.
                                    </p>

                                    <div className="ai-features">
                                        <div className="ai-feature">
                                            <Shield className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                            <div>
                                                <strong>Real-Time Scoring</strong>
                                                <p>Instant risk assessment across invoices and parties</p>
                                            </div>
                                        </div>
                                        <div className="ai-feature">
                                            <Zap className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                            <div>
                                                <strong>Fraud Detection</strong>
                                                <p>Advanced anomaly detection prevents fraudulent transactions</p>
                                            </div>
                                        </div>
                                        <div className="ai-feature">
                                            <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                            <div>
                                                <strong>Smart Matching</strong>
                                                <p>Algorithms optimize yield and risk distribution</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ai-stats">
                                        <div className="stat-block">
                                            <div className="stat-number">98%</div>
                                            <div className="stat-label">Accuracy Rate</div>
                                        </div>
                                        <div className="stat-block">
                                            <div className="stat-number">24h</div>
                                            <div className="stat-label">Funding Cycle</div>
                                        </div>
                                        <div className="stat-block">
                                            <div className="stat-number">100%</div>
                                            <div className="stat-label">Digital Workflow</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Right Visual - Smaller Sphere Placeholder */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="ai-visual"
                                >
                                    <div className="ai-frame">
                                        <div className="ai-glow"></div>
                                        <div className="ai-sphere-placeholder">
                                            <Zap className="w-20 h-20 text-blue-400 opacity-30" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* Security & Compliance Section */}
                    <section className="security-section">
                        <div className="landing-container">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="section-header"
                            >
                                <h2 className="section-title">Enterprise-Grade Security</h2>
                                <p className="section-subtitle">Your trust is our foundation.</p>
                            </motion.div>

                            <div className="security-grid">
                                {[
                                    {
                                        title: "Bank-Grade Encryption",
                                        desc: "AES-256 encryption protects all data at rest and in transit.",
                                        icon: <Lock className="w-8 h-8 text-blue-400" />
                                    },
                                    {
                                        title: "GST Verified Transactions",
                                        desc: "Real-time validation with government tax records.",
                                        icon: <FileCheck className="w-8 h-8 text-blue-400" />
                                    },
                                    {
                                        title: "Regulatory Compliant",
                                        desc: "Fully compliant with RBI, SEBI, and GST regulations.",
                                        icon: <Shield className="w-8 h-8 text-blue-400" />
                                    }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className="security-card"
                                    >
                                        <div className="security-icon-wrapper">
                                            {item.icon}
                                        </div>
                                        <h3 className="security-title">{item.title}</h3>
                                        <p className="security-desc">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Impact & Growth Metrics Section */}
                    <section className="metrics-section">
                        <div className="landing-container">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="section-header"
                            >
                                <h2 className="section-title">Impact By The Numbers</h2>
                            </motion.div>

                            <div className="metrics-grid">
                                {[
                                    { number: "₹500Cr+", label: "Invoices Financed" },
                                    { number: "5,000+", label: "MSMEs Supported" },
                                    { number: "50+", label: "Lending Partners" }
                                ].map((metric, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                                        className="metric-card"
                                    >
                                        <div className="metric-number">{metric.number}</div>
                                        <div className="metric-label">{metric.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className="final-cta-section">
                        <div className="landing-container">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="cta-content"
                            >
                                <h2 className="cta-title">Unlock Working Capital. Instantly.</h2>
                                <p className="cta-subtitle">Join thousands of MSMEs already growing with FinBridge.</p>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="btn-primary btn-large"
                                >
                                    Get Started with FinBridge
                                    <ArrowRight className="w-5 h-5" />
                                </button>
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
