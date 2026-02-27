import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FeatureGuard } from '../context/FeatureContext';
import ProfileBadge from './ProfileBadge';
import { Menu, X, ShieldCheck } from 'lucide-react';
import '../styles/landing.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isLanding = location.pathname === '/';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Hide navbar on auth pages and admin pages
    const hideNavbarRoutes = ['/login', '/register', '/admin'];
    if (hideNavbarRoutes.some(route => location.pathname.startsWith(route))) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Premium Landing Navbar (Responsive)
    if (isLanding) {
        return (
            <nav className="landing-nav fixed top-0 left-0 right-0 px-6 py-3 flex justify-between items-center z-50">
                {/* Brand Left */}
                <div
                    onClick={() => navigate('/')}
                    className="cursor-pointer flex items-center gap-0"
                >
                    <span className="font-bold text-lg tracking-tight text-blue-400">Fin</span>
                    <span className="font-bold text-lg tracking-tight text-white">Bridge</span>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-1">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Right Buttons - Desktop */}
                <div className="hidden md:flex gap-3 items-center">
                    {!user ? (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                className="landing-nav-btn-ghost"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="landing-nav-btn-primary"
                            >
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="landing-nav-btn-ghost"
                        >
                            Logout
                        </button>
                    )}
                </div>

                {/* Mobile Dropdown */}
                {isMobileMenuOpen && (
                    <div className="absolute top-[50px] left-0 right-0 border-b p-5 flex flex-col gap-3 md:hidden shadow-2xl" style={{background:'rgba(11,18,32,0.97)', borderColor:'rgba(59,130,246,0.14)', backdropFilter:'blur(18px)' }}>
                        {!user ? (
                            <>
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                                    className="landing-nav-btn-ghost w-full justify-center"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}
                                    className="landing-nav-btn-primary w-full justify-center"
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                                className="landing-nav-btn-ghost w-full justify-center"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                )}
            </nav>
        );
    }

    // Legacy Dashboard Navbar (Responsive)
    if (!user) return null;

    const linkClass = ({ isActive }) =>
        isActive
            ? 'px-3 py-2 rounded-lg text-sm font-medium text-white bg-white/10 border border-white/10 transition-all block w-full text-left md:w-auto md:inline-block'
            : 'px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all block w-full text-left md:w-auto md:inline-block';

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/60 border-b border-white/10 px-6 py-3">
            <div className="flex justify-between items-center">
                <div
                    className="cursor-pointer flex items-center gap-0"
                    onClick={() => navigate('/msme')}
                >
                    <span className="font-bold text-lg tracking-tight text-blue-400">Fin</span>
                    <span className="font-bold text-lg tracking-tight text-white">Bridge</span>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <ProfileBadge user={user} onLogout={handleLogout} profilePath="/profile" />
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-1">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-1">
                    {user.role === 'MSME' && (
                        <>
                            <NavLink to="/msme" end className={linkClass}>Dashboard</NavLink>
                            <FeatureGuard featureKey="INVOICE_UPLOAD">
                                <NavLink to="/upload-invoice" className={linkClass}>Upload Invoice</NavLink>
                            </FeatureGuard>
                            <FeatureGuard featureKey="INVOICE_UPLOAD">
                                <NavLink to="/invoices" className={linkClass}>Invoices</NavLink>
                            </FeatureGuard>
                        </>
                    )}
                    {user.role === 'LENDER' && (
                        <>
                            <NavLink to="/lender" end className={linkClass}>Dashboard</NavLink>
                            <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
                            <NavLink
                                to="/lender/kyc"
                                className={({ isActive }) =>
                                    `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                        isActive
                                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                            : user.kycStatus === 'VERIFIED'
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                            : user.kycStatus === 'IN_PROGRESS'
                                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                    }`
                                }
                            >
                                <ShieldCheck size={13} />
                                {user.kycStatus === 'VERIFIED' ? 'KYC Verified' : user.kycStatus === 'IN_PROGRESS' ? 'KYC: In Review' : 'Complete KYC'}
                            </NavLink>
                        </>
                    )}
                    <div className="ml-3">
                        <ProfileBadge user={user} onLogout={handleLogout} profilePath="/profile" />
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden pt-4 pb-2 border-t border-white/10 mt-3 flex flex-col gap-2">
                    {user.role === 'MSME' && (
                        <>
                            <NavLink to="/msme" end className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                            <FeatureGuard featureKey="INVOICE_UPLOAD">
                                <NavLink to="/upload-invoice" className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>Upload Invoice</NavLink>
                            </FeatureGuard>
                            <FeatureGuard featureKey="INVOICE_UPLOAD">
                                <NavLink to="/invoices" className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>Invoices</NavLink>
                            </FeatureGuard>
                        </>
                    )}
                    {user.role === 'LENDER' && (
                        <>
                            <NavLink to="/lender" end className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                            <NavLink to="/analytics" className={linkClass} onClick={() => setIsMobileMenuOpen(false)}>Analytics</NavLink>
                            <NavLink
                                to="/lender/kyc"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-lg text-sm font-semibold border transition-all flex items-center gap-2 ${
                                        isActive
                                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                            : user.kycStatus === 'VERIFIED'
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                            : user.kycStatus === 'IN_PROGRESS'
                                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                    }`
                                }
                            >
                                <ShieldCheck size={14} />
                                {user.kycStatus === 'VERIFIED' ? 'KYC Verified' : user.kycStatus === 'IN_PROGRESS' ? 'KYC: In Review' : 'Complete KYC'}
                            </NavLink>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
