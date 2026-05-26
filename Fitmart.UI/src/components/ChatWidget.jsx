import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { chatApi } from '../services/api';
import './ChatWidget.css';

/* ── SVG Icons ── */
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const FitmartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
  </svg>
);

/* ── Framer Motion Variants ── */
const windowVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 350 },
  },
  exit: {
    opacity: 0, y: 20, scale: 0.95,
    transition: { duration: 0.15 },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

const SIGNALR_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5049'}/chatHub`;

/** Tạo roomId duy nhất cho khách hàng */
function getRoomId(user) {
  if (user?.id) return `user_${user.id}`;
  // Guest: dùng sessionStorage để giữ ID trong phiên
  let guestId = sessionStorage.getItem('chat_guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('chat_guest_id', guestId);
  }
  return guestId;
}

/**
 * ChatWidget — Floating real-time chat cho khách hàng.
 * Kết nối SignalR tới backend, gửi/nhận tin nhắn theo room.
 */
export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connection, setConnection] = useState(null);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [hasUnread, setHasUnread] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isOpenRef = useRef(isOpen);

  /* ── Derived values ── */
  const displayName = user?.name || 'Khách';
  const roomId = getRoomId(user);

  // Keep ref in sync
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  /* ── Auto-scroll xuống cuối khi có tin mới ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ── Focus input khi mở chat ── */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasUnread(false);
    }
  }, [isOpen]);

  /* ── Load lịch sử chat khi mở lần đầu ── */
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      chatApi.getMessages(roomId)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data.map(m => ({
              id: m.id,
              sender: m.senderName,
              senderRole: m.senderRole,
              text: m.content,
              time: new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              isMine: m.senderRole === 'Customer',
            })));
          }
          setHistoryLoaded(true);
        })
        .catch(err => {
          console.error('Load chat history failed:', err);
          setHistoryLoaded(true);
        });
    }
  }, [isOpen, historyLoaded, roomId]);

  /* ── Thiết lập kết nối SignalR ── */
  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(SIGNALR_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    // Lắng nghe tin nhắn từ server (cả Admin reply)
    conn.on('ReceiveMessage', (data) => {
      if (data.roomId !== roomId) return; // Chỉ nhận tin của room mình

      const newMsg = {
        id: Date.now() + Math.random(),
        sender: data.senderName,
        senderRole: data.senderRole,
        text: data.content,
        time: new Date(data.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isMine: data.senderRole === 'Customer',
      };

      setMessages(prev => {
        // Dedup: check last message
        const last = prev[prev.length - 1];
        if (last && last.sender === newMsg.sender && last.text === newMsg.text &&
            Math.abs(newMsg.id - last.id) < 1500) {
          return prev;
        }
        return [...prev, newMsg];
      });

      // Unread indicator khi chat đang đóng
      if (!isOpenRef.current) {
        setHasUnread(true);
      }
    });

    // Connection state tracking
    conn.onreconnecting(() => setConnectionState('Reconnecting'));
    conn.onreconnected(() => {
      setConnectionState('Connected');
      // Re-join room sau khi reconnect
      conn.invoke('JoinRoom', roomId).catch(() => {});
    });
    conn.onclose(() => setConnectionState('Disconnected'));

    // Start connection + join room
    conn.start()
      .then(() => {
        setConnectionState('Connected');
        conn.invoke('JoinRoom', roomId).catch(() => {});
        console.log('✅ SignalR connected to', SIGNALR_URL, 'room:', roomId);
      })
      .catch(err => {
        setConnectionState('Disconnected');
        console.error('❌ SignalR connection failed:', err);
      });

    setConnection(conn);

    return () => { conn.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Gửi tin nhắn ── */
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !connection || connection.state !== HubConnectionState.Connected) return;

    try {
      await connection.invoke('SendMessageToAdmin', roomId, displayName, trimmed);
      setInput('');
    } catch (err) {
      console.error('Gửi tin nhắn thất bại:', err);
    }
  };

  /* ── Enter để gửi ── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Connection status text ── */
  const statusText = {
    Connected: 'Đang trực tuyến',
    Reconnecting: 'Đang kết nối lại...',
    Disconnected: 'Mất kết nối',
  }[connectionState] || 'Đang kết nối...';

  const isConnected = connectionState === 'Connected';

  return (
    <>
      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            variants={windowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            id="chat-window"
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header__info">
                <h3 className="chat-header__title">FITMART Support</h3>
                <span className="chat-header__status">
                  <span className={`chat-header__status-dot ${
                    isConnected ? 'chat-header__status-dot--online' : 'chat-header__status-dot--offline'
                  }`} />
                  {statusText}
                </span>
              </div>
              <button
                className="chat-header__close"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng chat"
                id="chat-close-btn"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages" id="chat-messages-area">
              {messages.length === 0 && (
                <div className="chat-welcome">
                  <div className="chat-welcome__icon">
                    <FitmartIcon />
                  </div>
                  <h4 className="chat-welcome__title">Chào mừng đến FITMART! 👋</h4>
                  <p className="chat-welcome__text">
                    Hãy gửi tin nhắn, đội ngũ hỗ trợ sẽ phản hồi sớm nhất có thể.
                  </p>
                </div>
              )}

              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  className={`chat-msg ${msg.isMine ? 'chat-msg--sent' : 'chat-msg--received'}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {!msg.isMine && (
                    <span className="chat-msg__sender">
                      {msg.senderRole === 'Bot' ? '🤖' : '🛡️'} {msg.sender}
                    </span>
                  )}
                  {msg.text}
                  <span className="chat-msg__time">{msg.time}</span>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                ref={inputRef}
                className="chat-input"
                type="text"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isConnected}
                id="chat-input-field"
              />
              <button
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || !isConnected}
                aria-label="Gửi tin nhắn"
                id="chat-send-btn"
              >
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Action Button ── */}
      <motion.button
        className={`chat-fab ${hasUnread && !isOpen ? 'chat-fab--pulse' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Mở chat hỗ trợ"
        id="chat-fab-btn"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <CloseIcon />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChatIcon />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
