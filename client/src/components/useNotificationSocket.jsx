import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://algorithm-addicts.onrender.com' : 'http://localhost:5000');

export const useNotificationSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[GlobalSocket] Frontend socket connected successfully! ID:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[GlobalSocket] Frontend connection error:', err.message);
    });

    // Listen for real-time meeting started event
    newSocket.on('meeting:started', ({ dealId, lenderName }) => {
      // Dispatch a local event so dashboard buttons can instantly unlock
      window.dispatchEvent(new CustomEvent('meeting:started:local', { detail: { dealId } }));

      // Trigger a custom persistent toast
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-white/10 overflow-hidden backdrop-blur-xl border border-blue-500/20`}
          >
            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-violet-600/20 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <Video size={24} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Incoming Call</h3>
                <p className="text-sm text-slate-300">
                  <strong className="text-white">{lenderName}</strong> has started the video meeting.
                </p>
              </div>
            </div>

            <div className="flex border-t border-white/10 p-3 bg-slate-900 gap-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(`/meeting/${dealId}`);
                }}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Video size={16} /> Join Meeting
              </button>
            </div>
          </div>
        ),
        {
          duration: 30000, // Stay on screen for 30 seconds
          position: 'top-right',
          id: `meeting-${dealId}` // Prevent duplicates for the same deal
        }
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, navigate]);

  return socket;
};
