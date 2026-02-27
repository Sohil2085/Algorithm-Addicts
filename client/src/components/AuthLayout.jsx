import { motion } from 'framer-motion';
import { ShieldCheck, Zap, TrendingUp, Home, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/authTheme.css';
import MovingLinesBackground from './MovingLinesBackground';

const AuthLayout = ({ children, title, subtitle }) => {
    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const stagger = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    return (
        <div className="auth-layout">
            {/* Background Elements */}
            <MovingLinesBackground />
            <div className="auth-bg">
                <div className="aurora"></div>
                <div className="noise"></div>
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {/* Left Panel: Marketing */}
            <motion.div
                className="brand-panel relative"
                initial="hidden"
                animate="visible"
                variants={stagger}
            >
                {/* Home Button */}
                <motion.div variants={fadeIn} className="absolute top-12 left-8 lg:top-16 lg:left-24 z-50">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center p-3 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-border text-theme-text-muted hover:text-theme-text transition-all backdrop-blur-md shadow-sm hover:shadow-theme-md duration-300"
                        title="Return to Home"
                    >
                        <Home size={18} />
                    </Link>
                </motion.div>
                <motion.div variants={fadeIn} className="my-10 translate-y-8 lg:translate-y-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-surface backdrop-blur-md px-5 py-2.5 text-sm font-medium text-theme-text shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-theme-md transition-all duration-300">
                        <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="leading-none tracking-wider uppercase text-xs font-bold">Enterprise-Grade Financing</span>
                    </div>
                </motion.div>

                <motion.div variants={fadeIn} className="flex items-center gap-5 mt-4 mb-6 group cursor-default">
                    <div className="relative flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-[1.25rem] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-400/40 overflow-hidden shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_45px_rgba(59,130,246,0.7)] group-hover:rotate-3">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out"></div>
                        <Landmark className="w-9 h-9 text-theme-text relative z-10 drop-shadow-md" strokeWidth={2.5} />
                    </div>
                    <h1 className="brand-name">
                        FinBridge
                    </h1>
                </motion.div>

                <motion.p variants={fadeIn} className="brand-tagline">
                    Unlock trapped capital in your unpaid invoices. We provide <span className="text-theme-text font-medium">instant liquidity</span> with seamless, AI-driven risk assessment to accelerate your business growth.
                </motion.p>

                <motion.div variants={fadeIn} className="feature-list">
                    <div className="feature-item group">
                        <div className="feature-icon-box group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300 ease-out">
                            <Zap size={20} className="text-blue-400" />
                        </div>
                        <div className="flex flex-col ml-3">
                            <span className="font-semibold text-theme-text text-[1.05rem]">Instant Liquidity</span>
                            <span className="text-[0.9rem] text-theme-text-muted mt-1">Access up to 80% of your invoice value within 24 hours.</span>
                        </div>
                    </div>
                    <div className="feature-item group mt-2">
                        <div className="feature-icon-box group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300 ease-out">
                            <ShieldCheck size={20} className="text-blue-400" />
                        </div>
                        <div className="flex flex-col ml-3">
                            <span className="font-semibold text-theme-text text-[1.05rem]">Smart Risk Engine</span>
                            <span className="text-[0.9rem] text-theme-text-muted mt-1">AI-powered, GST-verified assessment for rapid approvals.</span>
                        </div>
                    </div>
                    <div className="feature-item group mt-2">
                        <div className="feature-icon-box group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300 ease-out">
                            <TrendingUp size={20} className="text-blue-400" />
                        </div>
                        <div className="flex flex-col ml-3">
                            <span className="font-semibold text-theme-text text-[1.05rem]">Scale Without Debt</span>
                            <span className="text-[0.9rem] text-theme-text-muted mt-1">Grow your operations without taking on rigid bank loans.</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Right Panel: Form */}
            <div className="form-panel">
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="auth-header">
                        <h2 className="auth-title">{title}</h2>
                        <p className="description" style={{ color: 'var(--muted)' }}>{subtitle}</p>
                    </div>
                    {children}
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;
