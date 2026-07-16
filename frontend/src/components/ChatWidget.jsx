import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChat, HiX, HiPaperAirplane, HiArrowLeft, HiVideoCamera, HiLink, HiLockClosed } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/sounds';
import api from '../utils/api';

/* ── Time helper ── */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

/* ── Conversation List ── */
function ConversationList({ conversations, onSelect, loading }) {
  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (conversations.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <HiChat className="w-10 h-10 text-surface-300 dark:text-surface-600 mb-2" />
      <p className="text-sm text-surface-500 dark:text-surface-400">No conversations yet</p>
      <p className="text-xs text-surface-400 mt-1">Book a session to start chatting</p>
    </div>
  );

  return (
    <div className="overflow-y-auto flex-1">
      {conversations.map(conv => (
        <button
          key={conv.sessionId}
          onClick={() => { playSound('click'); onSelect(conv); }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors border-b border-surface-100 dark:border-surface-800 text-left"
        >
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${
            conv.isLocked ? 'bg-surface-400' : 'bg-gradient-to-br from-primary-500 to-purple-600'
          }`}>
            {conv.otherParty.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">
                {conv.otherParty}
              </p>
              {conv.lastMessage && (
                <span className="text-[10px] text-surface-400 shrink-0 ml-2">
                  {timeAgo(conv.lastMessage.time)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-primary-500 dark:text-primary-400">{conv.courseCode}</span>
              {conv.isLocked && <HiLockClosed className="w-2.5 h-2.5 text-surface-400" />}
            </div>
            {conv.lastMessage && (
              <p className="text-xs text-surface-400 truncate mt-0.5">
                {conv.lastMessage.isMe ? 'You: ' : ''}{conv.lastMessage.content}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ── Chat View ── */
function ChatView({ conversation, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${conversation.sessionId}`);
      setMessages(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [conversation.sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || conversation.isLocked) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${conversation.sessionId}`, { content: input.trim() });
      setMessages(prev => [...prev, data]);
      setInput('');
      playSound('pop');
    } catch (err) {
      // silently handle locked error
    }
    finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
          <HiArrowLeft className="w-4 h-4 text-surface-500" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">{conversation.otherParty}</p>
          <p className="text-[10px] text-surface-400">{conversation.courseCode} · {conversation.status}</p>
        </div>
        {conversation.isLocked && (
          <span className="flex items-center gap-1 text-[10px] text-surface-400 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-full">
            <HiLockClosed className="w-3 h-3" /> Locked
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-xs text-surface-400">No messages yet</p>
            {!conversation.isLocked && <p className="text-[10px] text-surface-400 mt-0.5">Say hi! 👋</p>}
          </div>
        ) : (
          messages.map(msg => {
            const isMe = (msg.sender?._id || msg.sender) === user._id;
            const isRecording = msg.type === 'recording';

            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  isRecording
                    ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50'
                    : isMe
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-surface-100 dark:bg-surface-800 rounded-bl-md'
                }`}>
                  {isRecording ? (
                    <a href={msg.metadata?.recordingUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 font-medium hover:underline">
                      <HiVideoCamera className="w-3.5 h-3.5" />
                      {msg.content}
                      <HiLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className={`text-[13px] leading-relaxed ${isMe ? 'text-white' : 'text-surface-800 dark:text-surface-100'}`}>
                      {msg.content}
                    </p>
                  )}
                  <p className={`text-[9px] mt-0.5 ${isMe ? 'text-white/50' : 'text-surface-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input or locked notice */}
      {conversation.isLocked ? (
        <div className="px-3 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <p className="text-xs text-surface-400 text-center flex items-center justify-center gap-1.5">
            <HiLockClosed className="w-3.5 h-3.5" />
            This conversation is locked — session has ended
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-2.5 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-surface-100 dark:bg-surface-800 border-0 rounded-full px-4 py-2 text-sm text-surface-800 dark:text-surface-100 placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 outline-none"
            disabled={sending}
          />
          <motion.button
            whileTap={{ scale: 0.85 }}
            type="submit"
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-600 transition-colors"
          >
            <HiPaperAirplane className="w-3.5 h-3.5 rotate-90" />
          </motion.button>
        </form>
      )}
    </div>
  );
}

/* ── Main Widget ── */
export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);

  // Don't show for admin
  if (user?.role === 'admin') return null;

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages');
      setConversations(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setIsOpen(!isOpen); playSound('click'); }}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isOpen ? 'bg-surface-700 dark:bg-surface-600' : 'bg-primary-500 hover:bg-primary-600'
        }`}
      >
        {isOpen ? (
          <HiX className="w-6 h-6 text-white" />
        ) : (
          <HiChat className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-40 w-80 h-[28rem] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden"
          >
            {selectedConvo ? (
              <ChatView
                conversation={selectedConvo}
                onBack={() => { setSelectedConvo(null); fetchConversations(); }}
              />
            ) : (
              <>
                {/* Header */}
                <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white">Messages</h3>
                  <p className="text-[10px] text-surface-400">Your session conversations</p>
                </div>
                <ConversationList
                  conversations={conversations}
                  onSelect={setSelectedConvo}
                  loading={loading}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
