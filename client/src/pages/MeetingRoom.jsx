import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initiateCall, endCall } from '../api/callApi';
import { useVideoCall } from '../components/useVideoCall';
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff,
  ArrowLeft, Loader2, AlertCircle, Users, Send,
  Disc, Square, Loader, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// ─── Chat sub-component ──────────────────────────────────────────────────────
function ChatPanel({ messages, onSend }) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <div className="flex flex-col h-44 mt-4 bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-4 py-2 border-b border-white/10 text-xs font-semibold text-white/40 uppercase tracking-wider">
        In-call Chat
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-white/20 text-xs mt-4">No messages yet…</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.own ? 'justify-end' : 'justify-start'}`}>
            <span
              className={`max-w-[75%] text-xs px-3 py-1.5 rounded-xl leading-relaxed break-words ${
                m.own
                  ? 'bg-violet-600 text-white rounded-br-none'
                  : 'bg-slate-700 text-white/80 rounded-bl-none'
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border-t border-white/10">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Type a message…"
          className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50 transition-colors"
        />
        <button
          onClick={submit}
          disabled={!draft.trim()}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white transition-all shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Active Call Room ─────────────────────────────────────────────────────────
function CallRoom({ dealId, roomToken, onCallEnded, userRole }) {
  const {
    localRef, remoteRef, status, isMuted, isCamOff,
    toggleMute, toggleCam, hangUp, errorMsg,
    messages, sendChatMessage,
    recordingStatus, startRecording, stopRecording,
  } = useVideoCall({ dealId, roomToken, onEnded: onCallEnded });

  const handleHangUp = async () => {
    try { await endCall(dealId); } catch { /* best-effort */ }
    hangUp();
  };

  const statusLabel = {
    idle: 'Idle', connecting: 'Connecting…', ringing: 'Waiting for other party…',
    active: 'Connected', ended: 'Call Ended', error: 'Error',
  }[status] ?? status;

  const statusColor = {
    active: 'text-emerald-400', connecting: 'text-amber-400',
    ringing: 'text-blue-400', error: 'text-rose-400',
  }[status] ?? 'text-white/40';

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Status Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2">
        <div className={`flex items-center gap-2 text-sm font-semibold ${statusColor}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          {statusLabel}

          {/* Recording badge */}
          {status === 'active' && recordingStatus === 'recording' && (
            <span className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> REC
            </span>
          )}
          {recordingStatus === 'uploading' && (
            <span className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
              <Loader size={10} className="animate-spin" /> Uploading…
            </span>
          )}
          {recordingStatus === 'saved' && (
            <span className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
              <CheckCircle size={10} /> Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-white/30 text-xs">
          <Users size={12} />
          <span className="font-mono">{dealId?.slice(0, 8)}…</span>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Remote */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-white/10 aspect-video">
          <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-3 text-xs text-white/50 bg-black/40 px-2 py-0.5 rounded-lg">
            Other Party
          </span>
        </div>
        {/* Local */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-white/10 aspect-video">
          <video ref={localRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          <span className="absolute bottom-2 left-3 text-xs text-white/50 bg-black/40 px-2 py-0.5 rounded-lg">
            You
          </span>
        </div>
      </div>

      {/* Chat */}
      <ChatPanel messages={messages} onSend={sendChatMessage} />

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-4 mt-2">
        {/* Recording buttons — only when active AND user is a LENDER */}
        {status === 'active' && userRole === 'LENDER' && (
          recordingStatus !== 'recording' ? (
            <button
              onClick={startRecording}
              title="Start Recording"
              className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-white/10 shadow-lg"
            >
              <Disc size={20} className="text-rose-400" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              title="Stop Recording"
              className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-500/20 "
            >
              <Square size={18} className="fill-current animate-pulse" />
            </button>
          )
        )}

        {/* Mute */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          className={`flex items-center justify-center w-14 h-14 rounded-full transition-all shadow-lg active:scale-95 ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-slate-800 text-white/90 hover:bg-slate-700 border border-white/10'
          }`}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Camera */}
        <button
          onClick={toggleCam}
          title={isCamOff ? 'Turn on camera' : 'Turn off camera'}
          className={`flex items-center justify-center w-14 h-14 rounded-full transition-all shadow-lg active:scale-95 ${
            isCamOff
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-slate-800 text-white/90 hover:bg-slate-700 border border-white/10'
          }`}
        >
          {isCamOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
        </button>

        {/* End Call */}
        <button
          onClick={handleHangUp}
          title="End Call"
          className="flex items-center justify-center px-8 h-14 rounded-full bg-rose-600 hover:bg-rose-500 transition-all active:scale-95 text-white shadow-lg shadow-rose-500/30 border border-rose-500/50 ml-2"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MeetingRoom() {
  const { dealId } = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const [phase, setPhase]       = useState('pre');   // pre | call | ended
  const [roomToken, setRoomToken] = useState(null);
  const [joining, setJoining]   = useState(false);
  const [joinError, setJoinError] = useState('');

  const join = async () => {
    setJoining(true);
    setJoinError('');
    try {
      const res = await initiateCall(dealId);
      if (!res.success) throw new Error(res.message || 'Failed to initiate call.');
      setRoomToken(res.data.roomToken);
      setPhase('call');
    } catch (err) {
      setJoinError(err?.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setJoining(false);
    }
  };

  const handleCallEnded = () => {
    toast.success('Call ended');
    setPhase('ended');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-sm font-semibold text-white/80">
          Meeting Room <span className="font-mono text-white/40 ml-1">#{dealId?.slice(0, 8)}…</span>
        </span>
        <div />
      </div>

      {/* Body */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-4xl">
          {/* ── PRE CALL ── */}
          {phase === 'pre' && (
            <div className="flex flex-col items-center gap-8 mt-16">
              <div className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <VideoIcon size={36} className="text-violet-400" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Ready to Join?</h1>
                <p className="text-white/50 text-sm max-w-sm">
                  Your camera and microphone will be activated when you join. Make sure you are in a well-lit, quiet space.
                </p>
              </div>
              {joinError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm max-w-sm w-full">
                  <AlertCircle size={16} /> {joinError}
                </div>
              )}
              <button
                onClick={join}
                disabled={joining}
                className="flex items-center gap-3 px-8 py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 rounded-2xl text-white font-semibold transition-all shadow-xl shadow-violet-500/20 active:scale-95"
              >
                {joining ? <Loader2 size={20} className="animate-spin" /> : <VideoIcon size={20} />}
                {joining ? 'Joining…' : 'Join Video Call'}
              </button>
            </div>
          )}

          {/* ── ACTIVE CALL ── */}
          {phase === 'call' && roomToken && (
            <CallRoom dealId={dealId} roomToken={roomToken} onCallEnded={handleCallEnded} userRole={user?.role} />
          )}

          {/* ── ENDED ── */}
          {phase === 'ended' && (
            <div className="flex flex-col items-center gap-6 mt-24">
              <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-white/10 flex items-center justify-center">
                <PhoneOff size={36} className="text-white/30" />
              </div>
              <h1 className="text-2xl font-bold text-white/60">Call Ended</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white/70 rounded-xl text-sm font-medium transition-all border border-white/10"
                >
                  Go Back
                </button>
                <button
                  onClick={() => { setPhase('pre'); setRoomToken(null); }}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all"
                >
                  Rejoin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
