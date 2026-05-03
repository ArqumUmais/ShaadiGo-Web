import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import OwnerHeader from './OwnerHeader';
import '../style/OwnerChats.css';
import { IconVenue } from './Icons';

function OwnerChats() {
    const navigate   = useNavigate();
    const location   = useLocation();
    const user       = JSON.parse(localStorage.getItem('shaadigo_user') || '{}');
    const [chats, setChats]         = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages]   = useState([]);
    const [newMsg, setNewMsg]       = useState('');
    const [loading, setLoading]     = useState(true);
    const [sending, setSending]     = useState(false);
    const messagesEndRef            = useRef(null);
    const pollRef                   = useRef(null);

    useEffect(() => {
        if (!user.user_id || user.role !== 'owner') { navigate('/'); return; }
        fetchChats();
        // If navigated with a bookingId state, auto-open that chat
        if (location.state?.bookingId) {
            openChatById(location.state.bookingId);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (activeChat) {
            clearInterval(pollRef.current);
            pollRef.current = setInterval(() => fetchMessages(activeChat.booking_id), 4000);
        }
        return () => clearInterval(pollRef.current);
    }, [activeChat]);

    const fetchChats = async () => {
        try {
            const res = await axios.get(`http://localhost:5001/api/owner/chats/${user.user_id}`);
            setChats(res.data.chats || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openChatById = async (bookingId) => {
        try {
            const res = await axios.get(`http://localhost:5001/api/owner/chats/${user.user_id}`);
            const found = (res.data.chats || []).find(c => c.booking_id === bookingId);
            if (found) { setChats(res.data.chats); setActiveChat(found); fetchMessages(bookingId); }
        } catch(err) { console.error(err); }
    };

    const fetchMessages = async (bookingId) => {
        try {
            const res = await axios.get(`http://localhost:5001/api/chat/${bookingId}`);
            setMessages(res.data.messages || []);
        } catch (err) { console.error(err); }
    };

    const openChat = (chat) => {
        setActiveChat(chat);
        fetchMessages(chat.booking_id);
        setMessages([]);
    };

    const sendMessage = async () => {
        if (!newMsg.trim() || !activeChat) return;
        setSending(true);
        try {
            await axios.post(`http://localhost:5001/api/chat/${activeChat.booking_id}`, {
                userId: user.user_id,
                message: newMsg.trim(),
                messageType: 'text',
                senderRole: 'owner'
            });
            setNewMsg('');
            fetchMessages(activeChat.booking_id);
            fetchChats();
        } catch (err) { console.error(err); }
        finally { setSending(false); }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '';
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : '';

    const statusBadge = (s) => {
        const map = { confirmed: '#27ae60', pending: '#e67e22', cancelled: '#c0392b' };
        return <span style={{ color: map[s] || '#666', fontSize: '12px', fontWeight: 600 }}>● {s}</span>;
    };

    return (
        <div className="owner-page">
            <OwnerHeader />
            <div className="owner-chats-layout">
                {/* Sidebar */}
                <div className="chats-sidebar">
                    <div className="sidebar-header">
                        <h2>💬 Bookings & Chats</h2>
                        <p>{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
                    </div>
                    {loading ? (
                        <div className="sidebar-loading"><div className="spinner-sm"></div></div>
                    ) : chats.length === 0 ? (
                        <div className="sidebar-empty">No bookings yet.</div>
                    ) : (
                        <div className="chats-list">
                            {chats.map(c => (
                                <div
                                    key={c.booking_id}
                                    className={`chat-item ${activeChat?.booking_id === c.booking_id ? 'active' : ''}`}
                                    onClick={() => openChat(c)}
                                >
                                    <div className="chat-item-emoji"><IconVenue size={28} color="#4D0D0D" /></div>
                                    <div className="chat-item-info">
                                        <div className="chat-item-top">
                                            <span className="chat-item-name">{c.fname} {c.lname}</span>
                                            <span className="chat-item-time">{formatDate(c.last_message_at)}</span>
                                        </div>
                                        <div className="chat-item-venue">{c.venue_name} · {statusBadge(c.status)}</div>
                                        <div className="chat-item-preview">{c.last_message || 'No messages yet'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Window */}
                <div className="chat-window">
                    {!activeChat ? (
                        <div className="chat-placeholder">
                            <div className="placeholder-icon"><svg width="56" height="56" viewBox="0 0 48 48" fill="none"><path d="M6 8h36v26H28l-8 8v-8H6V8Z" stroke="#ccc" strokeWidth="2.5" strokeLinejoin="round"/><path d="M14 20h20M14 26h12" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/></svg></div>
                            <h3>Select a booking to chat</h3>
                            <p>Choose a booking from the left to view and reply to messages.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="chat-win-header">
                                <div className="chat-win-emoji"><IconVenue size={32} color="#4D0D0D" /></div>
                                <div className="chat-win-info">
                                    <div className="chat-win-name">{activeChat.fname} {activeChat.lname}</div>
                                    <div className="chat-win-sub">
                                        {activeChat.venue_name} · {activeChat.event_type} · {new Date(activeChat.event_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        <span style={{ marginLeft: 8 }}>{statusBadge(activeChat.status)}</span>
                                    </div>
                                </div>
                                <div className="chat-win-ref">#{activeChat.booking_id}</div>
                            </div>

                            {/* Messages */}
                            <div className="messages-area">
                                {messages.length === 0 ? (
                                    <div className="no-messages">No messages yet. Say hello!</div>
                                ) : (
                                    messages.map(m => (
                                        <div key={m.message_id} className={`msg-bubble-wrap ${m.sender === 'owner' ? 'mine' : 'theirs'}`}>
                                            <div className={`msg-bubble ${m.sender === 'owner' ? 'bubble-owner' : 'bubble-customer'}`}>
                                                {false ? (
                                                    <div>
                                                        <div style={{ fontSize: 12, marginBottom: 6, opacity: 0.8 }}>📷 Payment Screenshot</div>
                                                        <img src={m.image_data} alt="Payment" style={{ maxWidth: 220, borderRadius: 8 }} />
                                                    </div>
                                                ) : (
                                                    <span>{m.message}</span>
                                                )}
                                                <div className="msg-time">{formatTime(m.sent_at)}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="chat-input-area">
                                <textarea
                                    className="chat-textarea"
                                    rows={2}
                                    placeholder="Type a message… (Enter to send)"
                                    value={newMsg}
                                    onChange={e => setNewMsg(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className="chat-send-btn" onClick={sendMessage} disabled={sending || !newMsg.trim()}>
                                    {sending ? '…' : '➤'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OwnerChats;