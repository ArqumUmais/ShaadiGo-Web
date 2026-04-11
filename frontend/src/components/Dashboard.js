import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../style/Dashboard.css';

const statusConfig = {
  confirmed:  { label: 'Confirmed',  color: '#1a7f4b', bg: 'rgba(26,127,75,0.1)',   dot: '#1a7f4b' },
  pending:    { label: 'Pending',    color: '#b8942e', bg: 'rgba(212,175,55,0.15)', dot: '#D4AF37' },
  cancelled:  { label: 'Cancelled', color: '#9b2335', bg: 'rgba(155,35,53,0.1)',   dot: '#c0392b' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className="db-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
      <span className="db-status-dot" style={{ background: cfg.dot }}></span>
      {cfg.label}
    </span>
  );
}

function BookingCard({ booking, onCancel }) {
  const navigate    = useNavigate();
  const [expanded, setExpanded]     = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const eventDate = new Date(booking.event_date);
  const createdAt = new Date(booking.created_at);
  const isPast    = eventDate < new Date();
  const canCancel = booking.status === 'confirmed' && !isPast;
  const remaining = (Number(booking.total_price) - Number(booking.advance_paid)).toLocaleString('en-IN');
  const ref       = `SG-${createdAt.getFullYear()}-${String(booking.booking_id).padStart(5,'0')}`;

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    await onCancel(booking.booking_id);
    setCancelling(false);
  };

  const handleChat = () => {
    navigate('/chat', { state: { booking } });
  };

  return (
    <div className={`db-card ${booking.status}`}>
      {/* Card Header */}
      <div className="db-card-header">
        <div className="db-card-emoji">{booking.emoji || '🏛️'}</div>
        <div className="db-card-info">
          <div className="db-card-venue">{booking.venue_name}</div>
          <div className="db-card-location">
            <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
              <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#4D0D0D" strokeWidth="1.3"/>
              <circle cx="8" cy="6" r="1.5" stroke="#4D0D0D" strokeWidth="1.3"/>
            </svg>
            {booking.location}
          </div>
          <div className="db-card-ref">{ref}</div>
        </div>
        <div className="db-card-right">
          <StatusBadge status={booking.status} />
          <div className="db-card-date">
            {eventDate.toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' })}
          </div>
          <div className="db-card-event-type">{booking.event_type}</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="db-card-stats">
        <div className="db-stat">
          <span className="db-stat-label">Total</span>
          <span className="db-stat-val">PKR {Number(booking.total_price).toLocaleString('en-IN')}</span>
        </div>
        <div className="db-stat-divider"></div>
        <div className="db-stat">
          <span className="db-stat-label">Advance Paid</span>
          <span className="db-stat-val" style={{color:'#1a7f4b'}}>PKR {Number(booking.advance_paid).toLocaleString('en-IN')}</span>
        </div>
        <div className="db-stat-divider"></div>
        <div className="db-stat">
          <span className="db-stat-label">Remaining</span>
          <span className="db-stat-val" style={{color:'#b8942e'}}>PKR {remaining}</span>
        </div>
        <div className="db-stat-divider"></div>
        <div className="db-stat">
          <span className="db-stat-label">Guests</span>
          <span className="db-stat-val">{booking.guest_count ? booking.guest_count.toLocaleString() : '—'}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="db-card-details">
          <div className="db-detail-row">
            <span className="db-detail-label">Hall Price</span>
            <span className="db-detail-val">PKR {Number(booking.hall_price).toLocaleString('en-IN')}</span>
          </div>
          <div className="db-detail-row">
            <span className="db-detail-label">Service Fee</span>
            <span className="db-detail-val">PKR {Number(booking.service_fee).toLocaleString('en-IN')}</span>
          </div>
          <div className="db-detail-row">
            <span className="db-detail-label">Booked On</span>
            <span className="db-detail-val">
              {createdAt.toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}
            </span>
          </div>
          {booking.special_requests && (
            <div className="db-detail-row">
              <span className="db-detail-label">Special Requests</span>
              <span className="db-detail-val">{booking.special_requests}</span>
            </div>
          )}
        </div>
      )}

     {/* Action Buttons */}
<div className="db-card-actions">
  <button className="db-btn db-btn-ghost" onClick={() => setExpanded(e => !e)}>
    {expanded ? '▲ Less Details' : '▼ More Details'}
  </button>
  {booking.status === 'confirmed' && (
    <button className="db-btn db-btn-chat" onClick={handleChat}>
      💬 Chat with Owner
    </button>
  )}
</div>
      
    </div>
  );
}

function Dashboard() {
  const navigate     = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('shaadigo_user') || 'null');
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!loggedInUser) { navigate('/'); return; }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:5001/api/bookings/${loggedInUser.user_id}`);
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
      else setError(data.message);
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const res  = await fetch(`http://localhost:5001/api/booking/${bookingId}/cancel`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: loggedInUser.user_id }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev =>
          prev.map(b => b.booking_id === bookingId ? { ...b, status: 'cancelled' } : b)
        );
      } else {
        alert(data.message);
      }
    } catch {
      alert('Could not cancel booking. Please try again.');
    }
  };

  if (!loggedInUser) return null;

  const total      = bookings.length;
  const confirmed  = bookings.filter(b => b.status === 'confirmed').length;
  const cancelled  = bookings.filter(b => b.status === 'cancelled').length;
  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + Number(b.advance_paid), 0);

  const filtered = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="db-page">
      <Header />
      <main className="db-main">

        <div className="db-heading">
          <div>
            <h1>My Dashboard</h1>
            <p>Welcome back, <strong>{loggedInUser.username}</strong> — manage all your bookings here.</p>
          </div>
          <button className="db-btn-new" onClick={() => navigate('/venues')}>
            + New Booking
          </button>
        </div>
        <div className="db-gold-divider"></div>

        <div className="db-summary-grid">
          <div className="db-summary-card">
            <div className="db-summary-icon">📋</div>
            <div className="db-summary-val">{total}</div>
            <div className="db-summary-label">Total Bookings</div>
          </div>
          <div className="db-summary-card">
            <div className="db-summary-icon">✅</div>
            <div className="db-summary-val">{confirmed}</div>
            <div className="db-summary-label">Confirmed</div>
          </div>
          <div className="db-summary-card">
            <div className="db-summary-icon">✕</div>
            <div className="db-summary-val">{cancelled}</div>
            <div className="db-summary-label">Cancelled</div>
          </div>
          <div className="db-summary-card">
            <div className="db-summary-icon">💰</div>
            <div className="db-summary-val" style={{fontSize:'1rem'}}>PKR {totalSpent.toLocaleString('en-IN')}</div>
            <div className="db-summary-label">Total Advance Paid</div>
          </div>
        </div>

        <div className="db-filter-tabs">
          {['all','confirmed','pending','cancelled'].map(s => (
            <button
              key={s}
              className={`db-tab${filterStatus === s ? ' active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="db-tab-count">
                {s === 'all' ? total : bookings.filter(b => b.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {loading && <div className="db-status">Loading your bookings…</div>}
        {error   && <div className="db-status db-error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="db-empty">
            <div className="db-empty-icon">🏛️</div>
            <div className="db-empty-title">No bookings yet</div>
            <div className="db-empty-sub">Find your perfect venue and make your first booking!</div>
            <button className="db-btn-new" onClick={() => navigate('/venues')}>Browse Venues</button>
          </div>
        )}

        {!loading && !error && (
          <div className="db-cards-list">
            {filtered.map(b => (
              <BookingCard key={b.booking_id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
