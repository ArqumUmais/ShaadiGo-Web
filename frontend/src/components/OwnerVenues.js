import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OwnerHeader from './OwnerHeader';
import '../style/OwnerVenues.css';

// ── Icons ─────────────────────────────────────────────────────
function IconVenue({ size=36, color='#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M5 21V9l7-6 7 6v12" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="7" rx="1" stroke={color} strokeWidth="1.6"/>
      <rect x="7" y="11" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4"/>
      <rect x="14" y="11" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}
function IconLocation({ size=13, color='#666' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 21S5 13.5 5 9a7 7 0 0 1 14 0c0 4.5-7 12-7 12Z" stroke={color} strokeWidth="1.8"/>
      <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="1.6"/>
    </svg>
  );
}
function IconGuests({ size=13, color='#666' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.6"/>
      <path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth="1.4"/>
      <path d="M21 21c0-2.8-2-5-4.5-5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconMoney({ size=13, color='#666' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="13" rx="2" stroke={color} strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}
function IconStar({ size=13, color='#f39c12' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color}/>
    </svg>
  );
}
function IconEdit({ size=15, color='#8B1A1A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}
function IconDelete({ size=15, color='#c0392b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11v6M14 11v6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function IconPlus({ size=16, color='#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}
function IconClock({ size=12, color='#856404' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconCheck({ size=12, color='#155724' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <path d="M8 12l3 3 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconCalendar({ size=12, color='#0c5460' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="1.8"/>
      <path d="M3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

const EMPTY_FORM   = { name:'', city:'', location:'', capacity:'', price_per_guest:'', description:'' };
const CITY_OPTIONS = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta'];

function OwnerVenues() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('shaadigo_user') || '{}');
  const [venues, setVenues]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState({ text:'', type:'' });

  useEffect(() => {
    if (!user.user_id || user.role !== 'owner') { navigate('/'); return; }
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/owner/venues/${user.user_id}`);
      setVenues(res.data.venues || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setMsg({ text:'', type:'' }); setShowForm(true); };

  const openEdit = (v) => {
    setEditId(v.venue_id);
    setForm({ name:v.name, city:v.city, location:v.location, capacity:v.capacity, price_per_guest:v.price_per_guest, description:v.description||'' });
    setMsg({ text:'', type:'' }); setShowForm(true);
  };

  const handleSave = async () => {
    const missing = [];
    if (!form.name)            missing.push('Venue Name');
    if (!form.city)            missing.push('City');
    if (!form.location)        missing.push('Location');
    if (!form.capacity)        missing.push('Capacity');
    if (!form.price_per_guest) missing.push('Price Per Guest');
    if (missing.length > 0) return setMsg({ text:`Please fill: ${missing.join(', ')}`, type:'error' });
    setSaving(true);
    try {
      if (editId) {
        await axios.put(`http://localhost:5001/api/owner/venues/${editId}`, { ownerId:user.user_id, ...form });
        setMsg({ text:'Venue updated!', type:'success' });
      } else {
        await axios.post('http://localhost:5001/api/owner/venues', { ownerId:user.user_id, ...form });
        setMsg({ text:'Venue added! Visible to customers now.', type:'success' });
      }
      fetchVenues();
      setTimeout(() => { setShowForm(false); setMsg({ text:'', type:'' }); }, 1500);
    } catch (err) {
      setMsg({ text:err.response?.data?.message || 'Save failed.', type:'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (venueId) => {
    if (!window.confirm('Delete this venue? This cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5001/api/owner/venues/${venueId}`, { data:{ ownerId:user.user_id } });
      fetchVenues();
    } catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
  };

  const formatMoney = (n) => `Rs ${Number(n||0).toLocaleString()}`;

  return (
    <div className="owner-page">
      <OwnerHeader />
      <div className="owner-content">

        <div className="ov-header-row">
          <div>
            <h1>My Venues</h1>
            <p>Manage your listed venues. Added venues are immediately visible to customers.</p>
          </div>
          <button className="btn-add-venue" onClick={openAdd}>
            <IconPlus size={16} color="#fff" /> Add Venue
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h2>{editId ? 'Edit Venue' : 'Add New Venue'}</h2>
              {msg.text && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}
              <div className="form-grid">
                <div className="form-field full">
                  <label>Venue Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Pearl Continental Hall" />
                </div>
                <div className="form-field">
                  <label>City *</label>
                  <select value={form.city} onChange={e => setForm({...form, city:e.target.value})}>
                    <option value="">Select city</option>
                    {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Location / Area *</label>
                  <input value={form.location} onChange={e => setForm({...form, location:e.target.value})} placeholder="e.g. Gulberg, Lahore" />
                </div>
                <div className="form-field">
                  <label>Capacity *</label>
                  <input type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity:e.target.value})} placeholder="e.g. 500" />
                </div>
                <div className="form-field">
                  <label>Price Per Guest (Rs) *</label>
                  <input type="number" min="1" value={form.price_per_guest} onChange={e => setForm({...form, price_per_guest:e.target.value})} placeholder="e.g. 2500" />
                </div>
                <div className="form-field full">
                  <label>Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Describe your venue..." />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Venue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="owner-loading"><div className="spinner"></div><p>Loading venues…</p></div>
        ) : venues.length === 0 ? (
          <div className="empty-state">
            <IconVenue size={52} color="#ccc" />
            <div>You haven't added any venues yet.</div>
            <button className="btn-add-venue" style={{ marginTop:16 }} onClick={openAdd}>
              <IconPlus size={14} color="#fff" /> Add Your First Venue
            </button>
          </div>
        ) : (
          <div className="venues-grid">
            {venues.map(v => (
              <div key={v.venue_id} className="venue-card">
                <div className="vc-emoji"><IconVenue size={40} color="#8B1A1A" /></div>
                <div className="vc-body">
                  <h3 className="vc-name">{v.name}</h3>
                  <div className="vc-location">
                    <IconLocation size={13} color="#888" /> {v.location}
                  </div>
                  <div className="vc-meta-row">
                    <span><IconGuests size={13} color="#666" /> {v.capacity.toLocaleString()}</span>
                    <span><IconMoney  size={13} color="#666" /> {formatMoney(v.price_per_guest)}</span>
                    <span><IconStar   size={13} color="#f39c12" /> {Number(v.rating||0).toFixed(1)} ({v.review_count})</span>
                  </div>
                  <div className="vc-stats-row">
                    <span className="vc-stat pending"><IconClock size={12} color="#856404" /> {v.pending_count} pending</span>
                    <span className="vc-stat confirmed"><IconCheck size={12} color="#155724" /> {v.confirmed_count} confirmed</span>
                    <span className="vc-stat total"><IconCalendar size={12} color="#0c5460" /> {v.total_bookings} total</span>
                  </div>
                  {v.description && <p className="vc-desc">{v.description.slice(0,100)}{v.description.length>100?'…':''}</p>}
                </div>
                <div className="vc-actions">
                  <button className="btn-edit" onClick={() => openEdit(v)}>
                    <IconEdit size={14} color="#8B1A1A" /> Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(v.venue_id)}>
                    <IconDelete size={14} color="#c0392b" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerVenues;