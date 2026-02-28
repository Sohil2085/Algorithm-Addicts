/**
 * useVideoCall — React hook for WebRTC + Socket.IO signaling
 * Roles:
 *   Initiator = first peer in room → call:peer-joined → creates SDP offer
 *   Receiver  = second peer        → call:peer-ready  → waits for offer
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TURN_URL = import.meta.env.VITE_TURN_URL;
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME;
const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL;

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Optional TURN for tough NATs (recommended to set via env)
    ...(TURN_URL
      ? [
          {
            urls: TURN_URL,
            username: TURN_USERNAME,
            credential: TURN_CREDENTIAL,
          },
        ]
      : []),
  ],
  iceCandidatePoolSize: 4,
};

// Favor speech intelligibility: keep AGC/NS on and avoid aggressive VAD drops
const AUDIO_CONSTRAINTS = {
  channelCount: 1,
  sampleRate: 48000,
  sampleSize: 16,
  echoCancellation: { ideal: true },
  noiseSuppression: { ideal: true },
  autoGainControl: { ideal: true },
  voiceIsolation: true,
};

// Prefer Opus and tune it for continuous speech (no clipping on long words)
const enhanceOpusSdp = (sdp) => {
  const lines = sdp.split("\r\n");
  const opusLineIndex = lines.findIndex((l) =>
    /^a=rtpmap:(\d+) opus\/48000/i.test(l),
  );
  if (opusLineIndex === -1) return sdp;
  const opusPayload = lines[opusLineIndex].match(/^a=rtpmap:(\d+)/i)[1];

  const mLineIndex = lines.findIndex((l) => l.startsWith("m=audio"));
  if (mLineIndex !== -1) {
    const parts = lines[mLineIndex].split(" ");
    const header = parts.slice(0, 3);
    const codecs = parts.slice(3).filter(Boolean);
    const reordered = [opusPayload, ...codecs.filter((c) => c !== opusPayload)];
    lines[mLineIndex] = [...header, ...reordered].join(" ");
  }

  const fmtpParams =
    "stereo=0; sprop-stereo=0; maxaveragebitrate=96000; useinbandfec=1; usedtx=0; ptime=20";
  const fmtpIndex = lines.findIndex((l) =>
    l.startsWith(`a=fmtp:${opusPayload}`),
  );
  if (fmtpIndex !== -1) {
    lines[fmtpIndex] = `a=fmtp:${opusPayload} ${fmtpParams}`;
  } else {
    lines.splice(opusLineIndex + 1, 0, `a=fmtp:${opusPayload} ${fmtpParams}`);
  }

  if (!lines.some((l) => l.startsWith("a=ptime:"))) {
    lines.splice(opusLineIndex + 1, 0, "a=ptime:20");
  }

  return lines.join("\r\n");
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
  const iceCandidateBuffer = useRef([]);

  // ── Teardown ──────────────────────────────────────────────────────
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

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Recording Upload ──────────────────────────────────────────────
  const uploadRecording = useCallback(
    async (blob) => {
      setRecordingStatus("uploading");
      const formData = new FormData();
      formData.append("recording", blob, "recording.webm");
      try {
        const res = await fetch(`${SOCKET_URL}/api/call/${dealId}/recording`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        setRecordingStatus("saved");
      } catch (err) {
        console.error("[useVideoCall] upload error", err);
        setRecordingStatus("error");
      }
    },
    [dealId],
  );

  // ── Manual Recording ──────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    if (mediaRecorderRef.current?.state === "recording") return;

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
    mr.start(1000);
    mediaRecorderRef.current = mr;
  }, [uploadRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Hang Up ───────────────────────────────────────────────────────
  const hangUp = useCallback(() => {
    setStatus("ended");
    socketRef.current?.emit("call:leave");
    stopRecording();
    cleanup();
    onEnded?.();
  }, [cleanup, onEnded, stopRecording]);

  const toggleMute = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((m) => !m);
  }, []);

  const toggleCam = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCamOff((c) => !c);
  }, []);

  // ── ICE flush ─────────────────────────────────────────────────────
  const flushIce = useCallback(async (pc) => {
    while (iceCandidateBuffer.current.length > 0) {
      const c = iceCandidateBuffer.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.warn("[useVideoCall] ICE flush error", e);
      }
    }
  }, []);

  // ── Main Effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (!dealId || !roomToken) return;
    let destroyed = false;

    const start = async () => {
      try {
        setStatus("connecting");
        setErrorMsg(null);

        // 1. Camera + mic with speech-friendly constraints (AGC/NS enabled)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: AUDIO_CONSTRAINTS,
        });
        streamRef.current = stream;
        if (localRef.current) localRef.current.srcObject = stream;
        console.log("[useVideoCall] local media secured");

        // 2. Socket.IO
        const socket = io(`${SOCKET_URL}/call`, {
          auth: { roomToken, userToken: localStorage.getItem("token") },
          transports: ["websocket", "polling"],
        });
        socketRef.current = socket;

        // 3. PeerConnection — add audio then video (consistent m-line order)
        const pc = new RTCPeerConnection(ICE_CONFIG);
        pcRef.current = pc;

        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];
        if (audioTrack) {
          try {
            // Apply explicit constraints to reduce clipping on sustained speech
            await audioTrack.applyConstraints({
              ...AUDIO_CONSTRAINTS,
              advanced: [
                { noiseSuppression: true },
                { autoGainControl: true },
                { echoCancellation: true },
              ],
            });
          } catch (err) {
            console.warn("[useVideoCall] audio constraint warning", err);
          }
          pc.addTrack(audioTrack, stream);
        }
        if (videoTrack) pc.addTrack(videoTrack, stream);

        // Prefer Opus explicitly to avoid lower-quality fallbacks on some devices
        const audioTransceiver = pc
          .getTransceivers()
          .find((t) => t.sender?.track?.kind === "audio");
        const audioCapabilities = RTCRtpSender.getCapabilities("audio");
        if (
          audioTransceiver?.setCodecPreferences &&
          audioCapabilities?.codecs
        ) {
          const opusFirst = [
            ...audioCapabilities.codecs.filter(
              (c) => c.mimeType === "audio/opus",
            ),
            ...audioCapabilities.codecs.filter(
              (c) => c.mimeType !== "audio/opus",
            ),
          ];
          if (opusFirst.length) {
            audioTransceiver.setCodecPreferences(opusFirst);
          }
        }

        // Raise audio priority and disable DTX to avoid syllable clipping
        const audioSender = pc
          .getSenders()
          .find((s) => s.track?.kind === "audio");
        if (audioSender?.getParameters) {
          try {
            const params = audioSender.getParameters();
            if (!params.encodings || params.encodings.length === 0)
              params.encodings = [{}];
            params.encodings[0] = {
              ...params.encodings[0],
              maxBitrate: 64000,
              dtx: false,
              priority: "high",
            };
            params.degradationPreference = "maintain-framerate";
            await audioSender.setParameters(params);
          } catch (err) {
            console.warn("[useVideoCall] audio sender params warning", err);
          }
        }

        pc.ontrack = (e) => {
          if (remoteRef.current && remoteRef.current.srcObject !== e.streams[0])
            remoteRef.current.srcObject = e.streams[0];
        };

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) socket.emit("call:ice-candidate", { candidate });
        };

        pc.onconnectionstatechange = () => {
          if (destroyed) return;
          const s = pc.connectionState;
          if (s === "connected") setStatus("active");
          if (s === "failed") {
            setStatus("error");
            setErrorMsg("WebRTC connection failed.");
          }
          if (s === "disconnected" || s === "closed") hangUp();
        };

        // ── Socket events ────────────────────────────────────────
        socket.on("connect_error", (err) => {
          if (!destroyed) {
            setStatus("error");
            setErrorMsg(err.message);
          }
        });

        socket.on("call:joined", () => {
          if (!destroyed) setStatus("ringing");
        });
        socket.on("call:peer-ready", () => {
          if (!destroyed) setStatus("active");
        });

        // INITIATOR: peer joined → create offer
        let isCreatingOffer = false;
        socket.on("call:peer-joined", async () => {
          if (destroyed || isCreatingOffer) return;
          isCreatingOffer = true;
          setStatus("active");
          try {
            // Include iceRestart so that if the peer refreshed the page (new RTCPeerConnection),
            // this peer will generate new ICE candidates for the new session.
            const offer = await pc.createOffer({ iceRestart: true });
            offer.sdp = enhanceOpusSdp(offer.sdp || "");
            await pc.setLocalDescription(offer);
            socket.emit("call:offer", { offer });
          } catch (e) {
            setStatus("error");
            setErrorMsg("Failed to create offer: " + e.message);
          } finally {
            isCreatingOffer = false;
          }
        });

        // RECEIVER: handle offer → answer
        let isProcessingOffer = false;
        socket.on("call:offer", async ({ offer }) => {
          if (destroyed || isProcessingOffer) return;
          isProcessingOffer = true;
          try {
            if (pc.signalingState !== "stable") {
              console.warn(
                "[useVideoCall] ignoring offer in state",
                pc.signalingState,
              );
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            await flushIce(pc);
            const answer = await pc.createAnswer();
            answer.sdp = enhanceOpusSdp(answer.sdp || "");
            await pc.setLocalDescription(answer);
            socket.emit("call:answer", { answer });
          } catch (e) {
            setStatus("error");
            setErrorMsg("Offer error: " + e.message);
          } finally {
            isProcessingOffer = false;
          }
        });

        // INITIATOR: handle answer
        socket.on("call:answer", async ({ answer }) => {
          if (destroyed) return;
          try {
            if (pc.signalingState !== "have-local-offer") {
              console.warn(
                "[useVideoCall] ignoring answer in state",
                pc.signalingState,
              );
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            await flushIce(pc);
          } catch (e) {
            console.error("[useVideoCall] answer error", e);
          }
        });

        // ICE candidates
        socket.on("call:ice-candidate", async ({ candidate }) => {
          if (destroyed || !candidate) return;
          if (!pc.remoteDescription) {
            iceCandidateBuffer.current.push(candidate);
          } else {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.warn("[useVideoCall] ICE error", e);
            }
          }
        });

        // Chat
        socket.on("call:chat-message", (msg) => {
          if (!destroyed) setMessages((p) => [...p, msg]);
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

        // Join the room!
        socket.emit("call:join");
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

  // ── Chat send ────────────────────────────────────────────────────
  const sendChatMessage = useCallback((text) => {
    if (!socketRef.current || !text?.trim()) return;
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
