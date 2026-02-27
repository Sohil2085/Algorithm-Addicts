/**
 * useVideoCall — React hook for WebRTC + Socket.IO signaling
 *
 * Signaling roles:
 *   - Initiator: first peer in room → receives call:peer-joined → creates SDP offer
 *   - Receiver : second peer        → receives call:peer-ready  → waits for offer
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useVideoCall({ dealId, roomToken, onEnded }) {
  const [status, setStatus] = useState("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recordingStatus, setRecordingStatus] = useState("idle");

  const localRef = useRef(null);
  const remoteRef = useRef(null);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Buffer ICE candidates that arrive before remoteDescription is set
  const iceCandidateBuffer = useRef([]);

  // ──────────────────────────────────────────────────────────────
  // Teardown
  // ──────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    iceCandidateBuffer.current = [];
    if (localRef.current) localRef.current.srcObject = null;
    if (remoteRef.current) remoteRef.current.srcObject = null;
    
    // Safety stop if still recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const uploadRecording = useCallback(async (blob) => {
    setRecordingStatus("uploading");
    const formData = new FormData();
    formData.append("recording", blob, "recording.webm");
    try {
      const res = await fetch(`${SOCKET_URL}/api/call/${dealId}/recording`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setRecordingStatus("saved");
    } catch (err) {
      console.error("[useVideoCall] Upload error:", err);
      setRecordingStatus("error");
    }
  }, [dealId]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") return;
    
    setRecordingStatus("recording");
    recordedChunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    
    mr.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      uploadRecording(blob);
    };
    
    mr.start(1000); // chunk every 1s
    mediaRecorderRef.current = mr;
  }, [uploadRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); // This triggers onstop, which triggers upload
    }
  }, []);

  const hangUp = useCallback(() => {
    setStatus("ended");
    socketRef.current?.emit("call:leave");

    // Process recording if it's still running when we hang up
    stopRecording();

    cleanup();
    onEnded?.();
  }, [cleanup, onEnded, stopRecording]);

  const toggleMute = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((m) => !m);
  }, []);

  const toggleCam = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCamOff((c) => !c);
  }, []);

  // Flush ICE candidates buffered before remoteDescription was set
  const flushIceCandidates = useCallback(async (pc) => {
    while (iceCandidateBuffer.current.length > 0) {
      const candidate = iceCandidateBuffer.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("[useVideoCall] buffered ICE error", e);
      }
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Main effect — runs when dealId + roomToken are available
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!dealId || !roomToken) return;
    let destroyed = false;

    const start = async () => {
      try {
        setStatus("connecting");
        setErrorMsg(null);

        // 1. Local media - Ensure video and audio constraints are consistent
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (localRef.current) localRef.current.srcObject = stream;

        // 2. Socket.IO — send roomToken + user JWT so server can identify user
        const socket = io(`${SOCKET_URL}/call`, {
          auth: {
            roomToken,
            userToken: localStorage.getItem("token"),
          },
          transports: ["websocket", "polling"],
        });
        socketRef.current = socket;

        // 3. RTCPeerConnection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Always add track in a specific order (audio then video) to avoid m-line mismatch issues
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];
        
        if (audioTrack) pc.addTrack(audioTrack, stream);
        if (videoTrack) pc.addTrack(videoTrack, stream);

        pc.ontrack = (event) => {
          if (remoteRef.current && remoteRef.current.srcObject !== event.streams[0]) {
              remoteRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) socket.emit("call:ice-candidate", { candidate });
        };

        pc.onconnectionstatechange = () => {
          if (destroyed) return;
          const s = pc.connectionState;
          if (s === "connected") {
            setStatus("active");
            // Recording is manual now, do not autostart
          }
          if (s === "failed") {
            setStatus("error");
            setErrorMsg("WebRTC connection failed.");
          }
          if (s === "disconnected" || s === "closed") hangUp();
        };

        // ── Socket events ────────────────────────────────────────

        socket.on("connect_error", (err) => {
          if (destroyed) return;
          setStatus("error");
          setErrorMsg(err.message);
        });

        // Joined room — waiting for peer
        socket.on("call:joined", () => {
          if (destroyed) return;
          setStatus("ringing");
        });

        // ✅ INITIATOR ONLY — peer joined → create and send SDP offer
        socket.on("call:peer-joined", async () => {
          if (destroyed) return;
          setStatus("active");
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("call:offer", { offer });
          } catch (e) {
            setStatus("error");
            setErrorMsg("Failed to create offer: " + e.message);
          }
        });

        // ✅ RECEIVER ONLY — peer is ready → wait for incoming offer (no action)
        socket.on("call:peer-ready", () => {
          if (destroyed) return;
          setStatus("active");
        });

        // RECEIVER: handle incoming offer → send back answer
        socket.on("call:offer", async ({ offer }) => {
          if (destroyed) return;
          try {
            if (
              pc.signalingState !== "stable" &&
              pc.signalingState !== "have-local-pranswer"
            ) {
              console.warn("[useVideoCall] ignoring offer in state:", pc.signalingState);
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            await flushIceCandidates(pc);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("call:answer", { answer });
          } catch (e) {
            setStatus("error");
            setErrorMsg("Failed to process offer: " + e.message);
          }
        });

        // INITIATOR: handle answer from receiver
        socket.on("call:answer", async ({ answer }) => {
          if (destroyed) return;
          try {
            if (pc.signalingState !== "have-local-offer") {
              console.warn("[useVideoCall] ignoring answer in state:", pc.signalingState);
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            await flushIceCandidates(pc);
          } catch (e) {
            console.error("[useVideoCall] answer error", e);
          }
        });

        // ICE candidates — buffer until remoteDescription is ready
        socket.on("call:ice-candidate", async ({ candidate }) => {
          if (destroyed || !candidate) return;
          if (!pc.remoteDescription) {
            iceCandidateBuffer.current.push(candidate);
          } else {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.warn("[useVideoCall] ICE candidate error", e);
            }
          }
        });

        // In-call chat
        socket.on("call:chat-message", (msg) => {
          if (destroyed) return;
          setMessages((prev) => [...prev, msg]);
        });

        socket.on("call:peer-left", () => {
          if (!destroyed) hangUp();
        });

        socket.on("call:error", ({ message }) => {
          if (destroyed) return;
          setStatus("error");
          setErrorMsg(message);
          cleanup();
        });
      } catch (err) {
        if (!destroyed) {
          setStatus("error");
          setErrorMsg(err.message || "Failed to start call.");
          cleanup();
        }
      }
    };

    start();

    return () => {
      destroyed = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId, roomToken]);

  const sendChatMessage = useCallback((text) => {
    if (!socketRef.current || !text.trim()) return;
    socketRef.current.emit("call:chat-message", { text: text.trim() });
  }, []);

  return {
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
  };
}
