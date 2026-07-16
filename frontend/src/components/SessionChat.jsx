import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaperAirplane, HiX, HiVideoCamera, HiLink } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/sounds';
import api from '../utils/api';

export default function SessionChat({ session, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${session._id}`);
      setMessages(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [session._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${session._id}`, { content: input.trim() });
      setMessages(prev => [...prev, data]);
      setInput('');
      playSound('pop');
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const isTutor = (session.tutor?._id || session.tutor) === user._id;
  const otherName = isTutor
    ? session.tutees?.map(t => `${t.firstName}`).join(', ')
    : `${session.tutor?.firstName || 'Tutor'}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg h-[70vh] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <div>
            <h3 className="text-sm font-bold text-surface-900 dark:text-white">
              {session.course?.courseCode} — Chat
            </h3>
            <p className="text-[11px] text-surface-400">with {otherName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            <HiX className="w-4 h-4 text-surface-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm text-surface-400">No messages yet</p>
              <p className="text-xs text-surface-400 mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = (msg.sender?._id || msg.sender) === user._id;
              const isRecording = msg.type === 'recording';

              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                    isRecording
                      ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50'
                      : isMe
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface-100 dark:bg-surface-800'
                  }`}>
                    {!isMe && (
                      <p className={`text-[10px] font-medium mb-0.5 ${isRecording ? 'text-purple-600 dark:text-purple-400' : 'text-surface-400'}`}>
                        {msg.sender?.firstName}
                      </p>
                    )}
                    {isRecording ? (
                      <a href={msg.metadata?.recordingUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 font-medium hover:underline">
                        <HiVideoCamera className="w-4 h-4" />
                        {msg.content}
                        <HiLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className={`text-sm ${isMe ? 'text-white' : 'text-surface-800 dark:text-surface-100'}`}>
                        {msg.content}
                      </p>
                    )}
                    <p className={`text-[9px] mt-1 ${
                      isMe ? 'text-white/60' : isRecording ? 'text-purple-400' : 'text-surface-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field py-2.5 text-sm"
            disabled={sending}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-primary-500 text-white disabled:opacity-50 hover:bg-primary-600 transition-colors"
          >
            <HiPaperAirplane className="w-4 h-4 rotate-90" />
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
