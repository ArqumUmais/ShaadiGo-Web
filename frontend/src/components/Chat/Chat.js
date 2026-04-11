import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../style/Chat.css';

function Chat() {
  const location     = useLocation();
  const navigate     = useNavigate();
  const booking      = location.state?.booking;
  const loggedInUser = JSON.parse(localStorage.getItem('shaadigo_user') || 'null');

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState(null);
  const bottomRef               = useRef(null);

  useEffect(() => {
    if (!booking || !loggedInUser) { navigate('/dashboard'); return; }
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res  = await fetch(`http://localhost:5001/api/chat/${booking.booking_id}`);
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch {
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const tempMsg = {
      message_id: Date.now(),
      sender:     'customer',
      message:    input.trim(),
      sent_at:    new Date().toISOString(),
      username:   loggedInUser.username,
      pending:    true,
    };

    setMessages(prev => [...prev, tempMsg]);
    setInput('');

    try {
      const res  = await fetch(`http://localhost:5001/api/chat/${booking.booking_id}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId:  loggedInUser.user_id,
          message: tempMsg.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev =>
          prev.map(m => m.message_id === tempMsg.message_id
            ? { ...m, message_id: data.message_id, sent_at: data.sent_at, pending: false }
            : m
          )
        );
      } else {
        setMessages(prev => prev.filter(m => m.message_id !== tempMsg.message_id));
        setError(data.message);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.message_id !== tempMsg.message_id));
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (str) => {
    const d = new Date(str);
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) +
           ' · ' + d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  if (!booking || !loggedInUser) return null;

  const ref = `SG-${new Date(booking.created_at).getFullYear()}-${String(booking.booking_id).padStart(5,'0')}`;

  return (
    <div className="ch-page">
      <Header />
      <main className="ch-main">

        <button className="ch-back" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
            <path d="M9 2L4 7l5 5" stroke="#4D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>

        <div className="ch-layout">

          <div className="ch-info-card">
            <div className="ch-info-emoji">{booking.emoji || '🏛️'}</div>
            <div className="ch-info-venue">{booking.venue_name}</div>
            <div className="ch-info-location">{booking.location}</div>
            <div className="ch-info-divider"></div>
            <div className="ch-info-row"><span>Reference</span><strong>{ref}</strong></div>
            <div className="ch-info-row"><span>Event</span><strong>{booking.event_type}</strong></div>
            <div className="ch-info-row">
              <span>Date</span>
              <strong>{new Date(booking.event_date).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' })}</strong>
            </div>
            <div className="ch-info-row">
              <span>Status</span>
              <strong className={`ch-status ch-status--${booking.status}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </strong>
            </div>
            <div className="ch-info-divider"></div>
            <div className="ch-info-note">💬 Messages are private between you and the venue owner.</div>
          </div>

          <div className="ch-window">

            <div className="ch-window-header">
              <div className="ch-owner-avatar">{booking.emoji || '🏛️'}</div>
              <div>
                <div className="ch-owner-name">{booking.venue_name} — Owner</div>
                <div className="ch-owner-sub">Venue Manager · Typically replies within a few hours</div>
              </div>
            </div>

            <div className="ch-messages">
              {loading && <div className="ch-center-msg">Loading messages…</div>}
              {error   && <div className="ch-center-msg ch-error">{error}</div>}

              {!loading && messages.length === 0 && (
                <div className="ch-center-msg">
                  <div className="ch-empty-icon">💬</div>
                  <div>No messages yet.</div>
                  <div style={{fontSize:'0.78rem', opacity:0.5, marginTop:4}}>
                    Start the conversation with the venue owner!
                  </div>
                </div>
              )}

              {messages.map(msg => {
                const isMe = msg.sender === 'customer';
                return (
                  <div key={msg.message_id} className={`ch-msg-row ${isMe ? 'ch-msg-row--me' : 'ch-msg-row--owner'}`}>
                    {!isMe && <div className="ch-avatar ch-avatar--owner">{booking.emoji || '🏛️'}</div>}
                    <div className={`ch-bubble ${isMe ? 'ch-bubble--me' : 'ch-bubble--owner'} ${msg.pending ? 'ch-bubble--pending' : ''}`}>
                      <div className="ch-bubble-text">{msg.message}</div>
                      <div className="ch-bubble-time">
                        {msg.pending ? 'Sending…' : formatTime(msg.sent_at)}
                      </div>
                    </div>
                    {isMe && (
                      <div className="ch-avatar ch-avatar--me">
                        {loggedInUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef}></div>
            </div>

            <div className="ch-input-bar">
              <textarea
                className="ch-input"
                placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="ch-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || sending}
              >
                <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                  <path d="M3 10L17 3l-4 7 4 7L3 10Z" fill="currentColor"/>
                </svg>
              </button>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Chat;
