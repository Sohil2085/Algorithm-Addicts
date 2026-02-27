import React, { useState, useEffect } from 'react';
import { Video, Download, Clock, Calendar, Users } from 'lucide-react';

export default function AdminRecordings() {
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/calls/recordings`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const json = await res.json();
                if (json.success) {
                    setRecordings(json.data);
                }
            } catch (err) {
                console.error("Failed to fetch recordings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecordings();
    }, []);

    if (loading) return <div className="p-8 text-center text-white/50">Loading recordings...</div>;

    if (recordings.length === 0) return null;

    return (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-white/10 bg-slate-800/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <Video size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Meeting Recordings</h2>
                    <p className="text-sm text-white/50">Video calls archived for compliance and review.</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/80 text-white/40 text-xs uppercase tracking-wider font-semibold border-b border-white/5">
                            <th className="px-6 py-4">Deal / Participants</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4 text-right">Downloads</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {recordings.map(rec => (
                            <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-mono text-xs text-white/60 mb-1">{rec.dealId.slice(0, 8)}…</div>
                                    <div className="flex items-center gap-2 text-sm text-white/90">
                                        <Users size={14} className="text-white/30" />
                                        <span className="text-emerald-400">{rec.lender?.name || 'Lender'}</span>
                                        <span className="text-white/30">&</span>
                                        <span className="text-blue-400">{rec.msme?.name || 'MSME'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <Calendar size={14} className="text-white/30" />
                                        {new Date(rec.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <Clock size={14} className="text-white/30" />
                                        {rec.durationSec ? `${Math.floor(rec.durationSec / 60)}m ${rec.durationSec % 60}s` : 'Unknown'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 text-xs">
                                        {rec.recordingUrl && (
                                            <a 
                                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${rec.recordingUrl}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                                            >
                                                <Download size={12} /> Lender Cam
                                            </a>
                                        )}
                                        {rec.recordingUrl2 && (
                                            <a 
                                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${rec.recordingUrl2}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                                            >
                                                <Download size={12} /> MSME Cam
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
