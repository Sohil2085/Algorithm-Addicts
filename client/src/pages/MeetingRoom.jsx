import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initiateCall, endCall, getCallStatus } from '../api/callApi';
import { useVideoCall } from '../components/useVideoCall.js';
import { Video, Mic, MicOff, VideoOff, PhoneOff, ArrowLeft, Loader2, AlertCircle, Users, Send, MessageSquare, Disc, Square } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Chat panel (self-contained) ────────────────────────────────────────────
function ChatPanel({ messages, onSend }) {
    const [draft, setDraft] = useState('');
    const bottomRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const submit = () => {
        const text = draft.trim();
        if (!text) return;
        onSend(text);
        setDraft('');
    };

    const fmtTime = (iso) => {
        try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return ''; }
    };

    return (
        <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden" style={{ minHeight: 0, maxHeight: 260 }}>
            {/* Chat header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 shrink-0">
                <MessageSquare size={14} className="text-purple-400" />
                <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">In-call Chat</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 min-h-0">
                {messages.length === 0 ? (
                    <p className="text-center text-white/20 text-xs py-4">No messages yet — say hello! 👋</p>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.own ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-snug break-words ${
                                    msg.own
                                        ? 'bg-purple-600 text-white rounded-br-sm'
                                        : 'bg-slate-700/80 text-white/90 rounded-bl-sm'
                                }`}
                            >
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-white/25 mt-0.5 px-1">{fmtTime(msg.timestamp)}</span>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/10 shrink-0">
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                    placeholder="Type a message…"
                    maxLength={1000}
                    className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                    onClick={submit}
                    disabled={!draft.trim()}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all shrink-0"
                >
                    <Send size={15} />
                </button>
            </div>
        </div>
    );
}

// ─── Inner call component (rendered once room token is obtained) ────────────
function CallRoom({ dealId, roomToken, onCallEnded }) {
    const {
        localRef,
        remoteRef,
        status,
        isMuted,
        isCamOff,
        toggleMute,
        toggleCam,
        hangUp,
        errorMsg,
        messages,
        sendChatMessage,
        recordingStatus,
        startRecording,
        stopRecording,
    } = useVideoCall({ dealId, roomToken, onEnded: onCallEnded });

    const handleHangUp = async () => {
        hangUp();
        try { await endCall(dealId); } catch { /* best-effort */ }
        onCallEnded();
    };

    const statusColors = {
        idle: 'text-white/40',
        connecting: 'text-amber-400',
        ringing: 'text-blue-400',
        active: 'text-emerald-400',
        ended: 'text-white/40',
        error: 'text-rose-400',
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Status Bar */}
            <div className="flex items-center justify-between px-2">
                <div className={`flex items-center gap-2 text-sm font-medium ${statusColors[status] || 'text-white/40'}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {status === 'active' ? 'Connected'
                        : status === 'ringing' ? 'Waiting for counterparty…'
                        : status === 'connecting' ? 'Connecting…'
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    
                    {/* Recording Indicator */}
                    {status === 'active' && recordingStatus === 'recording' && (
                        <span className="ml-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> REC
                        </span>
                    )}
                    {recordingStatus === 'uploading' && (
                        <span className="ml-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                            <Loader2 size={10} className="animate-spin" /> Uploading…
                        </span>
                    )}
                    {recordingStatus === 'saved' && (
                        <span className="ml-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                            Saved
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Users size={13} />
                    Deal: <span className="font-mono text-white/60">{dealId?.slice(0, 8)}…</span>
                </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {errorMsg}
                </div>
            )}

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Remote */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-800/60 border border-white/10 aspect-video">
                    <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {status !== 'active' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40">
                            <Loader2 size={32} className="animate-spin" />
                            <p className="text-sm">Waiting for counterparty…</p>
                        </div>
                    )}
                    <span className="absolute bottom-3 left-4 text-xs text-white/70 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        Counterparty
                    </span>
                </div>

                {/* Local */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-800/60 border border-white/10 aspect-video">
                    <video ref={localRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-4 text-xs text-white/70 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        You
                    </span>
                    {isCamOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                            <VideoOff size={32} className="text-white/30" />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Chat below videos ─────────────────────────────────────────── */}
            <ChatPanel messages={messages} onSend={sendChatMessage} />

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
                {/* Manual Recording Controls */}
                {status === 'active' && (
                    <div className="flex bg-slate-800/60 rounded-full border border-white/10 p-1 mr-4">
                        {recordingStatus !== 'recording' ? (
                            <button
                                onClick={startRecording}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                            >
                                <Disc size={14} /> Start Rec
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-500/20 animate-pulse"
                            >
                                <Square size={14} className="fill-current" /> Stop Rec
                            </button>
                        )}
                    </div>
                )}
                
                <button
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                    className={`rounded-full flex items-center justify-center transition-all border ${isMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                    style={{ width: 52, height: 52 }}
                >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                    onClick={toggleCam}
                    title={isCamOff ? 'Camera On' : 'Camera Off'}
                    className={`rounded-full flex items-center justify-center transition-all border ${isCamOff ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                    style={{ width: 52, height: 52 }}
                >
                    {isCamOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
                <button
                    onClick={handleHangUp}
                    title="End Call"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-500/30"
                >
                    <PhoneOff size={18} /> End Call
                </button>
            </div>
        </div>
    );
}

// ─── Main MeetingRoom page ──────────────────────────────────────────────────
export default function MeetingRoom() {
    const { dealId } = useParams();
    const navigate = useNavigate();
    const [phase, setPhase] = useState('idle'); // idle | joining | active | ended
    const [roomToken, setRoomToken] = useState(null);
    const [error, setError] = useState(null);

    // Check for an existing in-progress session on mount
    useEffect(() => {
        const checkExisting = async () => {
            try {
                const res = await getCallStatus(dealId);
                if (res.data?.status === 'INITIATED' || res.data?.status === 'ONGOING') {
                    // Session already exists — caller must re-initiate to get a fresh token
                }
            } catch { /* ignore */ }
        };
        checkExisting();
    }, [dealId]);

    const handleJoin = useCallback(async () => {
        setPhase('joining');
        setError(null);
        try {
            const data = await initiateCall(dealId);
            setRoomToken(data.data.roomToken);
            setPhase('active');
        } catch (err) {
            const msg = err?.message || err?.response?.data?.message || 'Failed to start call';
            setError(msg);
            toast.error(msg);
            setPhase('idle');
        }
    }, [dealId]);

    const handleCallEnded = useCallback(() => {
        setRoomToken(null);
        setPhase('ended');
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600 rounded-full -z-10 blur-3xl opacity-[0.08] pointer-events-none" />

            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Video size={15} className="text-purple-400" />
                    </div>
                    <div>
                        <p className="text-white text-sm font-semibold leading-none">Secure Video Meeting</p>
                        <p className="text-white/40 text-xs mt-0.5 font-mono">{dealId?.slice(0, 8)}…</p>
                    </div>
                </div>
                <div className="w-16" /> {/* Spacer */}
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto">
                {phase === 'idle' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                        <div className="w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <Video size={40} className="text-purple-400" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white mb-3">Ready to Join?</h1>
                            <p className="text-white/50 text-base max-w-md">
                                Start a secure, encrypted 1-to-1 video call with your counterparty. Both parties need VERIFIED KYC and an ACTIVE deal.
                            </p>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-md w-full">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleJoin}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/20"
                            >
                                <Video size={17} /> Join Meeting
                            </button>
                        </div>
                    </div>
                )}

                {phase === 'joining' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/50">
                        <Loader2 size={40} className="animate-spin text-purple-400" />
                        <p className="text-base">Verifying eligibility and creating session…</p>
                    </div>
                )}

                {phase === 'active' && roomToken && (
                    <div className="flex-1 flex flex-col">
                        <CallRoom dealId={dealId} roomToken={roomToken} onCallEnded={handleCallEnded} />
                    </div>
                )}

                {phase === 'ended' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center">
                            <PhoneOff size={32} className="text-white/40" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
                            <p className="text-white/50 text-sm">Your session has been recorded for compliance. Thank you!</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setPhase('idle'); setRoomToken(null); }}
                                className="px-6 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium transition-all"
                            >
                                Start Another Call
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
