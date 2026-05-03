import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OwnerHeader from './OwnerHeader';
import '../style/OwnerDashboard.css';

// ── Icons ─────────────────────────────────────────────────────
function IconVenue({ size=28, color='#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M5 21V9l7-6 7 6v12" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="7" rx="1" stroke={color} strokeWidth="1.6"/>
      <rect x="7" y="11" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4"/>
      <rect x="14" y="11" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}
function IconCalendar({ size=24, color='#2980b9' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="1.8"/>
      <path d="M3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill={color} opacity="0.5"/>
      <rect x="11" y="14" width="3" height="3" rx="0.5" fill={color} opacity="0.3"/>
    </svg>
  );
}
function IconClock({ size=24, color='#e67e22' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconCheck({ size=24, color='#27ae60' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <path d="M8 12l3 3 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconMoney({ size=24, color='#8e44ad' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="13" rx="2" stroke={color} strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6"/>
      <path d="M6 9v6M18 9v6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconStar({ size=24, color='#f39c12' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}
function IconChat({ size=16, color='currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16v13H14l-4 4v-4H4V4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}
function IconWarning({ size=20, color='#e67e22' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 21h20L12 3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M12 10v4M12 17v.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function IconList({ size=20, color='#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"
        stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ Icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon"><Icon size={28} color={color} /></div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    confirmed: { bg:'#d4edda', color:'#155724' },
    pending:   { bg:'#fff3cd', color:'#856404' },
    cancelled: { bg:'#f8d7da', color:'#721c24' },
  };
  const { bg, color } = map[status] || { bg:'#eee', color:'#333' };
  return (
    <span style={{ background: bg, color, padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, textTransform:'capitalize' }}>
      {status}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────
function OwnerDashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('shaadigo_user') || '{}');
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!user.user_id || user.role !== 'owner') { navigate('/'); return; }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/owner/dashboard/${user.user_id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await axios.patch(`http://localhost:5001/api/owner/booking/${bookingId}/status`, {
        ownerId: user.user_id, status
      });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const formatDate  = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' }) : '—';
  const formatMoney = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

  if (loading) return (
    <div className="owner-page">
      <OwnerHeader />
      <div className="owner-loading"><div className="spinner"></div><p>Loading dashboard…</p></div>
    </div>
  );
  if (error) return (
    <div className="owner-page">
      <OwnerHeader />
      <div className="owner-error">{error}</div>
    </div>
  );

  const { stats, recentBookings, pendingVerifications } = data;

  return (
    <div className="owner-page">
      <OwnerHeader />
      <div className="owner-content">

        {/* Welcome */}
        <div className="owner-welcome">
          <h1>Welcome back, <span>{user.username}</span></h1>
          <p>Here's what's happening across your venues today.</p>
        </div>
        <div className="owner-gold-divider"></div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard Icon={IconVenue}    label="Total Venues"     value={stats.total_venues}                          color="#8B1A1A" />
          <StatCard Icon={IconCalendar} label="Total Bookings"   value={stats.total_bookings}                        color="#2980b9" />
          <StatCard Icon={IconClock}    label="Pending"          value={stats.pending_bookings}                      color="#e67e22" />
          <StatCard Icon={IconCheck}    label="Confirmed"        value={stats.confirmed_bookings}                    color="#27ae60" />
          <StatCard Icon={IconMoney}    label="Advance Collected" value={formatMoney(stats.total_revenue)}           color="#8e44ad" />
          <StatCard Icon={IconStar}     label="Avg Rating"       value={Number(stats.avg_rating || 0).toFixed(1)}   color="#f39c12" />
        </div>

        {/* Pending Verifications */}
        {pendingVerifications?.length > 0 && (
          <div className="owner-section">
            <h2 className="section-title">
              <IconWarning size={18} color="#e67e22" />
              Pending Confirmations
            </h2>
            <div className="verif-list">
              {pendingVerifications.map(b => (
                <div key={b.booking_id} className="verif-card">
                  <div className="verif-emoji"><IconVenue size={36} color="#8B1A1A" /></div>
                  <div className="verif-info">
                    <div className="verif-name">{b.fname} {b.lname}</div>
                    <div className="verif-meta">{b.venue_name} · {b.event_type} · {formatDate(b.event_date)}</div>
                    <div className="verif-amount">Advance: {formatMoney(b.advance_paid)}</div>
                  </div>
                  <div className="verif-actions">
                    <button className="btn-confirm" onClick={() => handleStatusChange(b.booking_id, 'confirmed')}>
                      <IconCheck size={14} color="#fff" /> Confirm
                    </button>
                    <button className="btn-open-chat" onClick={() => navigate('/owner/chats', { state: { bookingId: b.booking_id } })}>
                      <IconChat size={14} color="#8B1A1A" /> Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="owner-section">
          <h2 className="section-title">
            <IconList size={18} color="#4D0D0D" />
            Recent Bookings
          </h2>
          {recentBookings?.length === 0 ? (
            <div className="empty-state">
              <IconVenue size={48} color="#ccc" />
              <div>No bookings yet. Share your venue link to get started!</div>
            </div>
          ) : (
            <div className="bookings-table-wrap">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Venue</th><th>Guest</th><th>Event</th>
                    <th>Date</th><th>Advance</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.booking_id}>
                      <td>
                        <span className="t-emoji"><IconVenue size={16} color="#8B1A1A" /></span>
                        {b.venue_name}
                      </td>
                      <td>{b.fname} {b.lname}</td>
                      <td>{b.event_type}</td>
                      <td>{formatDate(b.event_date)}</td>
                      <td>{formatMoney(b.advance_paid)}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>
                        {b.status === 'pending' && (
                          <button className="btn-sm-confirm" onClick={() => handleStatusChange(b.booking_id, 'confirmed')}>
                            Confirm
                          </button>
                        )}
                        <button className="btn-sm-chat" onClick={() => navigate('/owner/chats', { state: { bookingId: b.booking_id } })}>
                          Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default OwnerDashboard;
