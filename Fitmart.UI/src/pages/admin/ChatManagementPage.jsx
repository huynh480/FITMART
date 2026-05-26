import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { notification } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { chatApi } from '../../services/api';
import './ChatManagementPage.css';

const SIGNALR_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5049'}/chatHub`;

/* ── Notification Sound (tiny beep via Web Audio API) ── */
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore — browser may block audio
  }
}

/* ── SVG Icons ── */
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/**
 * ChatManagementPage — Messenger-style admin chat interface.
 * Left panel: room list. Right panel: conversation detail.
 */
export default function ChatManagementPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connection, setConnection] = useState(null);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [search, setSearch] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const selectedRoomIdRef = useRef(selectedRoomId);
  const prevRoomRef = useRef(null);

  const adminName = user?.name || 'Admin';

  // Keep ref in sync
  useEffect(() => { selectedRoomIdRef.current = selectedRoomId; }, [selectedRoomId]);

  /* ── Auto-scroll ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  /* ── Load rooms list ── */
  const loadRooms = useCallback(async () => {
    try {
      const data = await chatApi.getRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load rooms failed:', err);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  /* ── SignalR connection ── */
  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(SIGNALR_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    // Nhận tin nhắn real-time trong room đang xem
    conn.on('ReceiveMessage', (data) => {
      if (data.roomId === selectedRoomIdRef.current) {
        setMessages(prev => {
          // Dedup
          const last = prev[prev.length - 1];
          if (last && last.senderName === data.senderName && last.content === data.content &&
              Math.abs(new Date(data.timestamp).getTime() - new Date(last.timestamp).getTime()) < 1500) {
            return prev;
          }
          return [...prev, {
            id: Date.now() + Math.random(),
            roomId: data.roomId,
            senderRole: data.senderRole,
            senderName: data.senderName,
            content: data.content,
            timestamp: data.timestamp,
          }];
        });
      }
    });

    // Nhận thông báo tin nhắn mới từ khách
    conn.on('NewMessageNotification', (data) => {
      // Cập nhật room list
      setRooms(prev => {
        const existing = prev.find(r => r.roomId === data.roomId);
        if (existing) {
          return prev.map(r =>
            r.roomId === data.roomId
              ? {
                  ...r,
                  lastMessage: data.lastMessage,
                  lastMessageAt: data.timestamp,
                  unreadCount: data.roomId === selectedRoomIdRef.current ? 0 : data.unreadCount,
                }
              : r
          ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        }
        // Phòng mới
        return [{
          roomId: data.roomId,
          customerName: data.customerName,
          lastMessage: data.lastMessage,
          lastMessageAt: data.timestamp,
          unreadCount: data.unreadCount,
        }, ...prev];
      });

      // Notification nếu không phải room đang xem
      if (data.roomId !== selectedRoomIdRef.current) {
        playNotificationSound();
        notification.info({
          message: `💬 ${data.customerName}`,
          description: data.lastMessage?.length > 50
            ? data.lastMessage.slice(0, 50) + '...'
            : data.lastMessage,
          placement: 'topRight',
          duration: 4,
        });
      }
    });

    // Connection state
    conn.onreconnecting(() => setConnectionState('Reconnecting'));
    conn.onreconnected(() => {
      setConnectionState('Connected');
      conn.invoke('JoinAdminGroup').catch(() => {});
      if (selectedRoomIdRef.current) {
        conn.invoke('AdminJoinRoom', selectedRoomIdRef.current).catch(() => {});
      }
    });
    conn.onclose(() => setConnectionState('Disconnected'));

    // Start
    conn.start()
      .then(() => {
        setConnectionState('Connected');
        conn.invoke('JoinAdminGroup').catch(() => {});
        console.log('✅ Admin SignalR connected');
      })
      .catch(err => {
        setConnectionState('Disconnected');
        console.error('❌ Admin SignalR failed:', err);
      });

    setConnection(conn);
    return () => { conn.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Select room → load history ── */
  const handleSelectRoom = useCallback(async (roomId) => {
    if (roomId === selectedRoomId) return;

    // Leave previous room
    if (prevRoomRef.current && connection?.state === HubConnectionState.Connected) {
      connection.invoke('AdminLeaveRoom', prevRoomRef.current).catch(() => {});
    }

    setSelectedRoomId(roomId);
    prevRoomRef.current = roomId;
    setLoadingMessages(true);

    try {
      // Load history
      const data = await chatApi.getMessages(roomId);
      setMessages(Array.isArray(data) ? data : []);

      // Mark as read
      chatApi.markAsRead(roomId).catch(() => {});
      setRooms(prev => prev.map(r =>
        r.roomId === roomId ? { ...r, unreadCount: 0 } : r
      ));

      // Join room for real-time updates
      if (connection?.state === HubConnectionState.Connected) {
        connection.invoke('AdminJoinRoom', roomId).catch(() => {});
      }
    } catch (err) {
      console.error('Load messages failed:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedRoomId, connection]);

  /* ── Send message ── */
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedRoomId || !connection || connection.state !== HubConnectionState.Connected) return;

    try {
      await connection.invoke('SendMessageToCustomer', selectedRoomId, adminName, trimmed);
      setInput('');

      // Cập nhật room preview
      setRooms(prev => prev.map(r =>
        r.roomId === selectedRoomId
          ? { ...r, lastMessage: trimmed, lastMessageAt: new Date().toISOString() }
          : r
      ));
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Filter rooms ── */
  const filteredRooms = rooms.filter(r =>
    r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.roomId?.toLowerCase().includes(search.toLowerCase())
  );

  const isConnected = connectionState === 'Connected';
  const selectedRoom = rooms.find(r => r.roomId === selectedRoomId);

  /* ── Helpers ── */
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const formatMsgTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ margin: '-32px -40px', height: 'calc(100vh)' }}>
      {/* Page Title Row */}
      <div style={{ padding: '20px 40px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="admin-content__title" style={{ margin: 0 }}>Tin nhắn</h1>
          <p className="admin-content__subtitle">Trò chuyện thời gian thực với khách hàng</p>
        </div>
        <span className={`admin-chat__connection-badge ${isConnected ? 'admin-chat__connection-badge--online' : 'admin-chat__connection-badge--offline'}`}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
            background: isConnected ? '#2e7d32' : '#c62828'
          }} />
          {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
        </span>
      </div>

      {/* Main Chat Layout */}
      <div style={{ padding: '16px 40px 20px', height: 'calc(100vh - 100px)' }}>
        <div className="admin-chat">
          {/* ── Left Panel: Room List ── */}
          <div className="admin-chat__rooms">
            <div className="admin-chat__rooms-header">
              <h2 className="admin-chat__rooms-title">Hội thoại</h2>
              <input
                className="admin-chat__rooms-search"
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="admin-chat-search"
              />
            </div>

            <div className="admin-chat__rooms-list">
              {filteredRooms.length === 0 ? (
                <div className="admin-chat__room-empty">
                  <span className="admin-chat__room-empty-icon">💬</span>
                  <span>Chưa có cuộc trò chuyện nào</span>
                </div>
              ) : (
                filteredRooms.map(room => (
                  <div
                    key={room.roomId}
                    className={`admin-chat__room-item ${
                      selectedRoomId === room.roomId ? 'admin-chat__room-item--active' : ''
                    }`}
                    onClick={() => handleSelectRoom(room.roomId)}
                    id={`admin-room-${room.roomId}`}
                  >
                    <div className="admin-chat__room-avatar">
                      {getInitials(room.customerName)}
                    </div>
                    <div className="admin-chat__room-info">
                      <p className="admin-chat__room-name">{room.customerName}</p>
                      <p className="admin-chat__room-preview">
                        {room.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                      </p>
                    </div>
                    <div className="admin-chat__room-meta">
                      <span className="admin-chat__room-time">
                        {formatTime(room.lastMessageAt)}
                      </span>
                      {room.unreadCount > 0 && (
                        <span className="admin-chat__room-badge">{room.unreadCount}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Right Panel: Chat Detail ── */}
          <div className="admin-chat__detail">
            {!selectedRoomId ? (
              <div className="admin-chat__detail-empty">
                <span className="admin-chat__detail-empty-icon">💬</span>
                <h3 className="admin-chat__detail-empty-title">Chọn một cuộc trò chuyện</h3>
                <p className="admin-chat__detail-empty-text">
                  Chọn phòng chat ở bên trái để bắt đầu trả lời khách hàng
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="admin-chat__detail-header">
                  <div className="admin-chat__detail-header-avatar">
                    {getInitials(selectedRoom?.customerName)}
                  </div>
                  <div className="admin-chat__detail-header-info">
                    <p className="admin-chat__detail-header-name">
                      {selectedRoom?.customerName || selectedRoomId}
                    </p>
                    <p className="admin-chat__detail-header-room">
                      Room: {selectedRoomId}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="admin-chat__messages" id="admin-chat-messages">
                  {loadingMessages ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: '#999' }}>
                      Đang tải tin nhắn...
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: '#999', fontSize: 13 }}>
                      Chưa có tin nhắn trong cuộc trò chuyện này
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`admin-chat__msg ${
                          msg.senderRole === 'Admin' ? 'admin-chat__msg--admin' : 'admin-chat__msg--customer'
                        }`}
                      >
                        {msg.senderRole !== 'Admin' && (
                          <span className="admin-chat__msg-sender">
                            {msg.senderRole === 'Bot' ? '🤖 ' : ''}{msg.senderName}
                          </span>
                        )}
                        {msg.content}
                        <span className="admin-chat__msg-time">{formatMsgTime(msg.timestamp)}</span>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="admin-chat__input-area">
                  <input
                    ref={inputRef}
                    className="admin-chat__input"
                    type="text"
                    placeholder="Nhập tin nhắn trả lời..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isConnected}
                    id="admin-chat-input"
                  />
                  <button
                    className="admin-chat__send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || !isConnected}
                    aria-label="Gửi tin nhắn"
                    id="admin-chat-send-btn"
                  >
                    <SendIcon />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
