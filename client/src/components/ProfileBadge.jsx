import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings } from 'lucide-react';

/**
 * Reusable profile avatar badge with dropdown.
 *
 * Props
 * ─────
 *  user         – { name, role }
 *  onLogout     – () => void  (call existing logout + redirect logic)
 *  profilePath  – string (default "/profile")
 */
const ProfileBadge = ({ user, onLogout, profilePath = '/profile' }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const containerRef = useRef(null);

    /* ── Close on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Close on Esc ── */
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

    const roleDot =
        user?.role === 'LENDER' ? 'bg-emerald-400' :
        user?.role === 'ADMIN'  ? 'bg-rose-400'    :
                                  'bg-blue-400';

    return (
        <div ref={containerRef} className="relative flex items-center">
            {/* ── Avatar Button (with diagonal shine on hover) ── */}
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Open profile menu"
                aria-expanded={open}
                className="
                    relative w-9 h-9 rounded-full overflow-hidden cursor-pointer
                    flex items-center justify-center
                    bg-gradient-to-tr from-blue-600 to-indigo-500
                    text-theme-text font-bold text-sm select-none
                    ring-2 ring-white/10 hover:ring-indigo-400/50
                    transition-all duration-200
                    group
                "
            >
                {/* ── Shine sweep layer ── */}
                <span
                    className="
                        absolute inset-0 pointer-events-none
                        bg-gradient-to-r from-transparent via-white/35 to-transparent
                        rotate-[20deg] -translate-x-[180%]
                        group-hover:translate-x-[180%]
                        transition-transform duration-700 ease-out
                    "
                />
                {initial}
            </button>

            {/* ── Status dot ── */}
            <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${roleDot} rounded-full border-2 border-slate-950`}
            />

            {/* ── Dropdown ── */}
            {open && (
                <div className="
                    absolute right-0 top-[calc(100%+10px)] w-52
                    rounded-xl bg-slate-900 border border-theme-border
                    shadow-2xl shadow-black/60
                    overflow-hidden z-50
                ">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-theme-border">
                        <p className="text-theme-text font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-white/45 text-xs mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
                    </div>

                    {/* Nav items */}
                    <div className="p-1">
                        <button
                            onClick={() => { setOpen(false); navigate(profilePath); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/75 hover:text-theme-text hover:bg-white/[0.07] rounded-lg transition-all text-left group/item"
                        >
                            <User size={15} className="text-theme-text-muted group-hover/item:text-indigo-400 transition-colors" />
                            Profile Settings
                        </button>

                        <button
                            disabled
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/25 rounded-lg text-left cursor-not-allowed"
                        >
                            <Settings size={15} className="text-white/20" />
                            Settings
                            <span className="ml-auto text-[10px] bg-white/8 text-white/25 px-1.5 py-0.5 rounded border border-theme-border">
                                Soon
                            </span>
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="p-1 border-t border-theme-border">
                        <button
                            onClick={() => { setOpen(false); onLogout(); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400/75 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all text-left"
                        >
                            <LogOut size={15} />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileBadge;
