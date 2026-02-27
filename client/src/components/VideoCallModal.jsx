/**
 * VideoCallModal
 *
 * Layout (when call is active):
 *   ┌──────────────────────────────────┐
 *   │  Header (status badge)           │
 *   ├──────────────────────────────────┤
 *   │  [You]          [Counterparty]   │  ← side-by-side videos
 *   ├──────────────────────────────────┤
 *   │  💬 Chat area (scrollable)       │  ← chat below videos
 *   │  [ type message...  ]  [Send]    │
 *   ├──────────────────────────────────┤
 *   │       🎙 Mute  📷  📵 Hang Up   │  ← controls
 *   └──────────────────────────────────┘
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { initiateCall, endCall } from "../api/callApi";
import { useVideoCall } from "./useVideoCall.js";

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.88)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#0f1117",
    borderRadius: 16,
    padding: "20px 20px 16px",
    width: "94vw",
    maxWidth: 960,
    height: "90vh",
    boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  // ─── header ────────────────────────────────────────────────────────────────
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  title: { color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 },
  badge: (color) => ({
    background: color,
    color: "#fff",
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.5px",
  }),
  // ─── videos ────────────────────────────────────────────────────────────────
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    flexShrink: 0,
  },
  videoWrapper: {
    background: "#1a1d27",
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: "16/9",
    position: "relative",
  },
  video: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  videoLabel: {
    position: "absolute",
    bottom: 8,
    left: 10,
    color: "#fff",
    fontSize: 11,
    background: "rgba(0,0,0,0.55)",
    padding: "2px 8px",
    borderRadius: 6,
  },
  // ─── chat ──────────────────────────────────────────────────────────────────
  chatContainer: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    background: "#12151e",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  chatHeader: {
    padding: "8px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    color: "#64748b",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    flexShrink: 0,
  },
  chatMessages: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  emptyChat: {
    color: "#374151",
    fontSize: 12,
    textAlign: "center",
    padding: "12px 0",
  },
  msgRow: (own) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: own ? "flex-end" : "flex-start",
  }),
  bubble: (own) => ({
    maxWidth: "70%",
    background: own ? "#2563eb" : "#1e2535",
    color: "#f1f5f9",
    borderRadius: own ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
    padding: "7px 12px",
    fontSize: 13,
    lineHeight: 1.5,
    wordBreak: "break-word",
  }),
  msgTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    marginTop: 2,
  },
  chatInputRow: {
    display: "flex",
    gap: 8,
    padding: "8px 12px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    flexShrink: 0,
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    background: "#1e2535",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#f1f5f9",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    background: "#2563eb",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    transition: "background 0.15s",
  },
  // ─── controls ──────────────────────────────────────────────────────────────
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexShrink: 0,
  },
  btn: (variant) => ({
    padding: "9px 20px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    border: "none",
    background:
      variant === "danger"
        ? "#dc2626"
        : variant === "primary"
          ? "#2563eb"
          : "#1e2535",
    color: "#fff",
  }),
  error: {
    background: "#2d1515",
    border: "1px solid #fc8181",
    borderRadius: 8,
    color: "#fc8181",
    padding: "8px 14px",
    fontSize: 13,
    flexShrink: 0,
  },
  idleBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    flex: 1,
    color: "#a0aec0",
  },
};

const STATUS_COLOR = {
  idle: "#4a5568",
  connecting: "#ca8a04",
  ringing: "#2563eb",
  active: "#16a34a",
  ended: "#6b7280",
  error: "#dc2626",
};

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// ─── Chat section ─────────────────────────────────────────────────────────────
function ChatBox({ messages, onSend }) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  };

  return (
    <div style={S.chatContainer}>
      <div style={S.chatHeader}>💬 In-call chat</div>

      <div style={S.chatMessages}>
        {messages.length === 0 && (
          <p style={S.emptyChat}>No messages yet — say something! 👋</p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={S.msgRow(m.own)}>
            <div style={S.bubble(m.own)}>{m.text}</div>
            <span style={S.msgTime}>{fmtTime(m.timestamp)}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={S.chatInputRow}>
        <input
          style={S.chatInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Type a message and press Enter…"
          maxLength={1000}
        />
        <button style={S.sendBtn} onClick={submit}>Send ➤</button>
      </div>
    </div>
  );
}

// ─── Active call view ─────────────────────────────────────────────────────────
function VideoCallInner({ dealId, roomToken, onCallEnded, onClose }) {
  const {
    localRef, remoteRef,
    status, isMuted, isCamOff,
    toggleMute, toggleCam, hangUp,
    errorMsg, messages, sendChatMessage,
  } = useVideoCall({ dealId, roomToken, onEnded: onCallEnded });

  const handleHangUp = async () => {
    hangUp();
    try { await endCall(dealId); } catch { /* best-effort */ }
    onCallEnded();
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, gap: 12 }}>
      {/* Header */}
      <div style={S.header}>
        <p style={S.title}>🔒 Secure Video Call — Deal {dealId.slice(0, 8)}…</p>
        <span style={S.badge(STATUS_COLOR[status] ?? "#6b7280")}>
          {status.toUpperCase()}
        </span>
      </div>

      {errorMsg && <div style={S.error}>{errorMsg}</div>}

      {/* Videos side-by-side */}
      <div style={S.videoGrid}>
        <div style={S.videoWrapper}>
          <video ref={localRef} autoPlay playsInline muted style={S.video} />
          <span style={S.videoLabel}>You</span>
        </div>
        <div style={S.videoWrapper}>
          <video ref={remoteRef} autoPlay playsInline style={S.video} />
          <span style={S.videoLabel}>Counterparty</span>
        </div>
      </div>

      {/* Chat below videos */}
      <ChatBox messages={messages} onSend={sendChatMessage} />

      {/* Controls */}
      <div style={S.controls}>
        <button style={S.btn(isMuted ? "primary" : "default")} onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🎙 Mute"}
        </button>
        <button style={S.btn(isCamOff ? "primary" : "default")} onClick={toggleCam}>
          {isCamOff ? "📵 Cam On" : "📷 Cam Off"}
        </button>
        <button style={S.btn("danger")} onClick={handleHangUp}>
          📵 Hang Up
        </button>
        <button style={S.btn("default")} onClick={onClose}>
          ✕ Close
        </button>
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export default function VideoCallModal({ dealId, onClose }) {
  const [phase, setPhase] = useState("idle");
  const [roomToken, setRoomToken] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleStartCall = useCallback(async () => {
    setPhase("loading");
    setApiError(null);
    try {
      const data = await initiateCall(dealId);
      setRoomToken(data.data.roomToken);
      setPhase("calling");
    } catch (err) {
      setPhase("idle");
      setApiError(err?.response?.data?.message || err?.message || "Failed to initiate call.");
    }
  }, [dealId]);

  const handleCallEnded = useCallback(() => {
    setPhase("ended");
    setRoomToken(null);
  }, []);

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>

        {phase === "idle" && (
          <div style={S.idleBox}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#e2e8f0" }}>
              Start a secure 1-to-1 video call for this deal
            </p>
            {apiError && <div style={S.error}>{apiError}</div>}
            <div style={{ display: "flex", gap: 12 }}>
              <button style={S.btn("primary")} onClick={handleStartCall}>📞 Start Call</button>
              <button style={S.btn("default")} onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}

        {phase === "loading" && (
          <div style={S.idleBox}>
            <p style={{ color: "#94a3b8" }}>Verifying eligibility and creating session…</p>
          </div>
        )}

        {phase === "calling" && roomToken && (
          <VideoCallInner
            dealId={dealId}
            roomToken={roomToken}
            onCallEnded={handleCallEnded}
            onClose={onClose}
          />
        )}

        {phase === "ended" && (
          <div style={S.idleBox}>
            <p style={{ color: "#94a3b8", fontWeight: 600 }}>Call ended.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={S.btn("primary")} onClick={() => setPhase("idle")}>Call Again</button>
              <button style={S.btn("default")} onClick={onClose}>Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
