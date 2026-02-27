import { motion } from 'framer-motion';
import { Check, Shield, Zap } from 'lucide-react';
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
                className="brand-panel"
                initial="hidden"
                animate="visible"
                variants={stagger}
            >
                <motion.div variants={fadeIn} className="pill-badge">
                    <Shield size={14} style={{ marginRight: '6px' }} />
                    Secure • Automated • Fast
                </motion.div>

                <motion.h1 variants={fadeIn} className="brand-name">
                    InvoiceFlow
                </motion.h1>

                <motion.p variants={fadeIn} className="brand-tagline">
                    Turn unpaid invoices into instant working capital.
                    Stop waiting for payments and start growing your business.
                </motion.p>

                <motion.div variants={fadeIn} className="feature-list">
                    <div className="feature-item">
                        <div className="feature-icon-box">
                            <Check size={20} />
                        </div>
                        <span>GST-verified authentic invoices</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon-box">
                            <Shield size={20} />
                        </div>
                        <span>Smart risk scoring AI engine</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon-box">
                            <Zap size={20} />
                        </div>
                        <span>Instant 70–80% funding availability</span>
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