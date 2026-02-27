import React from 'react';
import { Linkedin, Twitter, Github } from 'lucide-react';

const Footer = () => {
    const year = new Date().getFullYear();

    const scrollToTop = () => {
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            window.scrollTo(0, 0);
        }
    };

    return (
        <footer className="site-footer">
            <div className="landing-container footer-grid">
                <div className="footer-col footer-brand">
                    <div className="footer-logo">FinBridge</div>
                    <div className="footer-tag">AI-powered invoice financing for MSMEs & lenders.</div>
                    <div className="footer-copy">© {year} FinBridge. All rights reserved.</div>
                </div>

                <div className="footer-col footer-links">
                    <div className="footer-heading">Product</div>
                    <a href="#">How it Works</a>
                    <a href="#">Risk Intelligence</a>
                    <a href="#">Security</a>
                    <a href="#">Pricing</a>
                    <a href="#">FAQs</a>
                </div>

                <div className="footer-col footer-links">
                    <div className="footer-heading">Company</div>
                    <a href="#">About</a>
                    <a href="#">Careers</a>
                    <a href="#">Contact</a>
                    <a href="#">Terms</a>
                    <a href="#">Privacy</a>
                </div>

                <div className="footer-col footer-social">
                    <div className="footer-heading">Social</div>
                    <div className="social-row">
                        <a href="#" aria-label="LinkedIn" className="social-link"><Linkedin size={18} /></a>
                        <a href="#" aria-label="X" className="social-link"><Twitter size={18} /></a>
                        <a href="#" aria-label="GitHub" className="social-link"><Github size={18} /></a>
                    </div>
                    <button className="back-to-top" onClick={scrollToTop}>Back to top</button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
