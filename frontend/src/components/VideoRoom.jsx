import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { HiX, HiVideoCamera, HiShare, HiClipboard, HiExternalLink, HiLink } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/sounds';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function VideoRoom({ session, onClose }) {
  const { user } = useAuth();
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    api.get(`/messages/${session._id}/video-room`)
      .then(({ data }) => {
        setRoomInfo(data);
      })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to get room'))
      .finally(() => setLoading(false));
  }, [session._id]);

  // Auto-open in new tab once room info is available
  useEffect(() => {
    if (roomInfo && !launched) {
      const link = buildJitsiUrl(roomInfo);
      window.open(link, '_blank');
      setLaunched(true);
    }
  }, [roomInfo]);

  const buildJitsiUrl = (info) => {
    const name = encodeURIComponent(`${user.firstName} ${user.lastName}`);
    return `https://${info.jitsiDomain}/${info.roomName}#userInfo.displayName="${name}"&config.startWithAudioMuted=true`;
  };

  const copyRoomLink = () => {
    if (!roomInfo) return;
    const link = `https://${roomInfo.jitsiDomain}/${roomInfo.roomName}`;
    navigator.clipboard.writeText(link);
    toast.success('Room link copied!');
    playSound('pop');
  };

  const openAgain = () => {
    if (!roomInfo) return;
    window.open(buildJitsiUrl(roomInfo), '_blank');
    playSound('click');
  };

  const handleShareRecording = async () => {
    if (!recordingUrl.trim()) { toast.error('Paste the recording link'); return; }
    try {
      await api.post(`/messages/${session._id}/recording`, {
        recordingUrl: recordingUrl.trim(),
        title: `${session.course?.courseCode || 'Session'} Recording — ${new Date().toLocaleDateString()}`,
      });
      playSound('success');
      toast.success('Recording shared in session chat!');
      setRecordingUrl('');
      setShowShare(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to share');
    }
  };

  if (loading) return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-white text-sm">Starting video session...</p>
      </div>
    </div>,
    document.body
  );

  if (!roomInfo) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-surface-900 rounded-2xl shadow-2xl border border-surface-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
              <HiVideoCamera className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{roomInfo.displayName}</h3>
              <p className="text-[10px] text-surface-400 font-mono">{roomInfo.roomName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
            <HiX className="w-4 h-4 text-surface-400" />
          </button>
        </div>

        {/* Status */}
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">Video session opened</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">
                Jitsi Meet launched in a new tab. Both participants should join the same room.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={openAgain}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors">
              <HiExternalLink className="w-4 h-4" /> Rejoin
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={copyRoomLink}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 text-sm font-medium transition-colors">
              <HiClipboard className="w-4 h-4" /> Copy Link
            </motion.button>
          </div>

          {/* Recording section */}
          <div className="rounded-xl border border-surface-700 overflow-hidden">
            <button
              onClick={() => setShowShare(!showShare)}
              className="w-full flex items-center justify-between px-4 py-3 bg-surface-800/50 hover:bg-surface-800 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm text-surface-300">
                <HiShare className="w-4 h-4 text-purple-400" />
                Share Recording Link
              </span>
              <span className="text-[10px] text-surface-500">After the call</span>
            </button>
            {showShare && (
              <motion.div
                initial={{ height: 0 }} animate={{ height: 'auto' }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3 border-t border-surface-700">
                  <p className="text-xs text-surface-400">
                    Record your session using Jitsi's built-in recorder (... → Start Recording → Dropbox) or any screen recorder, then paste the link below to share it in the session chat.
                  </p>
                  <div className="flex gap-2">
                    <input value={recordingUrl} onChange={e => setRecordingUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-surface-900 border border-surface-700 text-sm text-white placeholder-surface-500 focus:border-purple-500 outline-none"
                      placeholder="https://... recording link" />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleShareRecording}
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
                      Share
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium transition-colors border border-red-600/30">
            End Session
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
