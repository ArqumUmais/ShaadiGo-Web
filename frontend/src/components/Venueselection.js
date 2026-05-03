import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../style/Venuedetail.css';
import {
  IconVenue, IconGarden, IconMarquee, IconMosque, IconCastle, IconStar,
  IconParking, IconAC, IconSound, IconCatering, IconDecor, IconCamera,
  IconAccessibility, IconSecurity
} from './Icons';

const CATEGORIES = ['all', 'hall', 'outdoor', 'decor', 'food', 'suite'];
const CAT_LABELS  = { all:'All', hall:'Hall', outdoor:'Outdoor', decor:'Décor', food:'Catering', suite:'Suites' };
const catCounts   = { all:18, hall:5, outdoor:4, decor:4, food:3, suite:2 };

// Gallery items — SVG icon instead of emoji
const GalleryIcon = ({ cat, size = 48 }) => {
  const props = { size, color: '#4D0D0D' };
  const map = {
    hall:    <IconVenue    {...props} />,
    outdoor: <IconGarden   {...props} />,
    decor:   <IconDecor    {...props} />,
    food:    <IconCatering {...props} />,
    suite:   <IconStar     {...props} />,
  };
  return map[cat] || <IconVenue {...props} />;
};

const galleryData = [
  { idx:0,  caption:'Grand Banquet Hall — Main Floor',       cat:'hall',    h:'xl' },
  { idx:1,  caption:'Lush Garden Lawn — Ceremony Area',      cat:'outdoor', h:'md' },
  { idx:2,  caption:'Bridal Stage Floral Arrangement',       cat:'decor',   h:'lg' },
  { idx:3,  caption:'Bridal Suite — Premium Dressing Room',  cat:'suite',   h:'sm' },
  { idx:4,  caption:'Crystal Chandelier — Imported Italian', cat:'hall',    h:'md' },
  { idx:5,  caption:'Catering Spread — 120 Dish Buffet',     cat:'food',    h:'lg' },
  { idx:6,  caption:'Evening Facade — Illuminated Entry',    cat:'outdoor', h:'xl' },
  { idx:7,  caption:'Candlelit Table Settings',              cat:'decor',   h:'sm' },
  { idx:8,  caption:'Stage and Dance Floor Area',            cat:'hall',    h:'md' },
  { idx:9,  caption:'Rooftop Terrace Lounge',               cat:'outdoor', h:'lg' },
  { idx:10, caption:'Custom Wedding Cake Display',           cat:'food',    h:'sm' },
  { idx:11, caption:"Groom's Preparation Room",              cat:'suite',   h:'md' },
  { idx:12, caption:'Rose Petal Aisle Walkway',              cat:'decor',   h:'lg' },
  { idx:13, caption:'VIP Lounge — Entrance Foyer',          cat:'hall',    h:'sm' },
  { idx:14, caption:'Fountain & Water Feature',              cat:'outdoor', h:'md' },
  { idx:15, caption:'High Tea & Chai Station',               cat:'food',    h:'lg' },
  { idx:16, caption:'Evening Lighting — Full Setup',         cat:'hall',    h:'xl' },
  { idx:17, caption:'Butterfly & Fairy Light Ceiling',       cat:'decor',   h:'md' },
];

const amenities = [
  { Icon: IconParking,       name:'Ample Parking',        desc:'Covered & open parking for 300+ vehicles with dedicated valet service.' },
  { Icon: IconAC,            name:'Central AC & Heating', desc:'Climate-controlled throughout all indoor spaces for year-round comfort.' },
  { Icon: IconSound,         name:'Sound & AV System',    desc:'Professional surround sound, LED screens, and live performance stage setup.' },
  { Icon: IconCatering,      name:'In-house Catering',    desc:'120-dish menu options with dedicated chefs. Halal certified kitchen.' },
  { Icon: IconDecor,         name:'Décor Services',       desc:'Full floral, lighting, and stage decoration by our in-house design team.' },
  { Icon: IconCamera,        name:'Photography Spaces',   desc:'Designated backdrops, gardens, and studio-lit areas for photography.' },
  { Icon: IconAccessibility, name:'Accessibility',        desc:'Elevator access, ramps, and dedicated accessible restrooms on all floors.' },
  { Icon: IconSecurity,      name:'Security & CCTV',      desc:'24/7 on-site security team, CCTV coverage, and private event management.' },
];

function VenueDetail() {
  const [reviews, setReviews]   = useState([]);
  const location  = useLocation();
  const navigate  = useNavigate();
  const venue     = location.state?.venue;
  const [activeCat, setActiveCat] = useState('all');
  const [lbOpen, setLbOpen]       = useState(false);
  const [lbIdx, setLbIdx]         = useState(0);

  useEffect(() => { if (!venue) navigate('/venues'); }, [venue, navigate]);

  const visible = galleryData.filter(g => activeCat === 'all' || g.cat === activeCat);

  useEffect(() => {
    const handler = (e) => {
      if (!lbOpen) return;
      if (e.key === 'Escape')      setLbOpen(false);
      if (e.key === 'ArrowLeft')   setLbIdx(i => (i - 1 + visible.length) % visible.length);
      if (e.key === 'ArrowRight')  setLbIdx(i => (i + 1) % visible.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lbOpen, visible.length]);

  useEffect(() => {
    if (!venue) return;
    fetch(`http://localhost:5001/api/reviews/${venue.venue_id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setReviews(d.reviews); })
      .catch(() => {});
  }, [venue]);

  if (!venue) return null;

  const openLb  = (idx) => { setLbIdx(idx); setLbOpen(true); };
  const current = visible[lbIdx] || visible[0];

  // Price display
  const ppgRaw = Number(venue.price_per_guest ?? venue.price_per_event ?? 0);
  const ppg    = Math.round(ppgRaw / 100) * 100;
  const priceDisplay = ppg > 0
    ? `PKR ${ppg.toLocaleString('en-IN')} / guest`
    : venue.price ? `PKR ${venue.price}` : 'Price on request';

  return (
    <div className="vd-page">

      {/* LIGHTBOX */}
      {lbOpen && (
        <div className="vd-lb" onClick={() => setLbOpen(false)}>
          <div className="vd-lb-wrap" onClick={e => e.stopPropagation()}>
            <div className={`vd-lb-img vd-bg-${current?.cat}`}>
              <GalleryIcon cat={current?.cat} size={80} />
            </div>
            <button className="vd-lb-close" onClick={() => setLbOpen(false)}>✕</button>
          </div>
          <div className="vd-lb-bottom">
            <button className="vd-lb-arrow" onClick={() => setLbIdx(i => (i - 1 + visible.length) % visible.length)}>←</button>
            <div className="vd-lb-info">
              <div className="vd-lb-caption">{current?.caption}</div>
              <div className="vd-lb-counter">{lbIdx + 1} / {visible.length}</div>
            </div>
            <button className="vd-lb-arrow" onClick={() => setLbIdx(i => (i + 1) % visible.length)}>→</button>
          </div>
          <div className="vd-lb-thumbs">
            {visible.map((g, i) => (
              <div key={g.idx} className={`vd-lb-thumb vd-bg-${g.cat}${i === lbIdx ? ' active' : ''}`}
                onClick={e => { e.stopPropagation(); setLbIdx(i); }}>
                <GalleryIcon cat={g.cat} size={20} />
              </div>
            ))}
          </div>
        </div>
      )}

      <Header />

      {/* HERO */}
      <div className="vd-hero">
        <button className="vd-back" onClick={() => navigate('/venues')}>
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
            <path d="M9 2L4 7l5 5" stroke="#4D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Venues
        </button>

        <div className="vd-meta-strip">
          <div className="vd-meta-left">
            <h1>{venue.name.split(' ').slice(0,-1).join(' ')} <em>{venue.name.split(' ').slice(-1)}</em></h1>
            <div className="vd-pills">
              <span className="vd-badge">{venue.city}</span>
              <span className="vd-pill-sep"></span>
              <span className="vd-pill">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#4D0D0D" strokeWidth="1.3"/><circle cx="8" cy="6" r="1.5" stroke="#4D0D0D" strokeWidth="1.3"/></svg>
                {venue.location}
              </span>
              <span className="vd-pill-sep"></span>
              <span className="vd-pill">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2" stroke="#4D0D0D" strokeWidth="1.3"/><path d="M1 13c0-2 2-3.5 5-3.5" stroke="#4D0D0D" strokeWidth="1.3" strokeLinecap="round"/><circle cx="11" cy="6" r="1.8" stroke="#4D0D0D" strokeWidth="1.3"/><path d="M8.5 13c0-2 1.5-3 2.5-3s2.5 1 2.5 3" stroke="#4D0D0D" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Up to {venue.capacity.toLocaleString()} guests
              </span>
              <span className="vd-pill-sep"></span>
              <span className="vd-pill">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6" fill="#D4AF37"/></svg>
                {venue.rating} ({venue.review_count} reviews)
              </span>
            </div>
          </div>
          <div className="vd-meta-right">
            <div className="vd-price">{priceDisplay}</div>
            <button className="vd-btn-book" onClick={() => navigate('/booking', { state: { venue } })}>
              Book This Venue
            </button>
          </div>
        </div>

        <div className="vd-hero-grid">
          <div className="vd-hero-main vd-bg-hall" onClick={() => { setActiveCat('all'); openLb(0); }}>
            <div className="vd-hero-icon"><IconVenue size={80} color="#4D0D0D" /></div>
            <div className="vd-photo-badge">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 4h3l2-2h6l2 2h1v10H2V4Z" stroke="#fff" strokeWidth="1.3"/><circle cx="8" cy="9" r="2.5" stroke="#fff" strokeWidth="1.3"/></svg>
              18 Photos
            </div>
            <div className="vd-hover-overlay"><div className="vd-view-icon">View Gallery</div></div>
          </div>
          <div className="vd-hero-right">
            <div className="vd-hero-thumb vd-bg-decor" onClick={() => { setActiveCat('all'); openLb(2); }}>
              <div className="vd-hero-icon-sm"><IconDecor size={40} color="#4D0D0D" /></div>
              <div className="vd-hover-overlay"><div className="vd-view-icon">View</div></div>
            </div>
            <div className="vd-hero-thumb vd-bg-outdoor" onClick={() => { setActiveCat('all'); openLb(6); }}>
              <div className="vd-hero-icon-sm"><IconGarden size={40} color="#4D0D0D" /></div>
              <div className="vd-hover-overlay"><div className="vd-view-icon">View</div></div>
              <button className="vd-show-all" onClick={e => { e.stopPropagation(); openLb(0); }}>
                ⊞ Show all photos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GALLERY */}
      <div className="vd-gallery">
        <div className="vd-section-row">
          <div className="vd-section-heading">Media <em>Gallery</em></div>
          <div className="vd-cat-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`vd-cat-tab${activeCat === cat ? ' active' : ''}`}
                onClick={() => { setActiveCat(cat); setLbIdx(0); }}>
                {CAT_LABELS[cat]} <span className="vd-tab-count">{catCounts[cat]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="vd-masonry">
          {visible.map((g, i) => (
            <div key={g.idx} className="vd-gal-item" onClick={() => openLb(i)}>
              <div className={`vd-gal-ph vd-h-${g.h} vd-bg-${g.cat}`}>
                <GalleryIcon cat={g.cat} size={40} />
              </div>
              <span className="vd-gal-tag">{CAT_LABELS[g.cat]}</span>
              <div className="vd-gal-overlay"><div className="vd-gal-caption">{g.caption}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* AMENITIES */}
      <div className="vd-amenities">
        <div className="vd-section-row" style={{marginBottom:'18px'}}>
          <div className="vd-section-heading">Venue <em>Amenities</em></div>
        </div>
        <div className="vd-amenities-grid">
          {amenities.map(a => (
            <div key={a.name} className="vd-amenity-card">
              <div className="vd-amenity-icon-wrap"><a.Icon size={36} color="#4D0D0D" /></div>
              <div className="vd-amenity-name">{a.name}</div>
              <div className="vd-amenity-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="vd-reviews">
        <div className="vd-section-row" style={{marginBottom:'18px'}}>
          <div className="vd-section-heading">Guest <em>Reviews</em></div>
          <div className="vd-reviews-summary">
            <span className="vd-reviews-avg">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6" fill="#D4AF37"/></svg>
              {venue.rating}
            </span>
            <span className="vd-reviews-count">({venue.review_count} reviews)</span>
          </div>
        </div>
        {reviews.length === 0 ? (
          <div className="vd-no-reviews">No reviews yet — be the first to share your experience!</div>
        ) : (
          <div className="vd-reviews-grid">
            {reviews.map(r => (
              <div key={r.review_id} className="vd-review-card">
                <div className="vd-review-top">
                  <div className="vd-review-avatar">{r.username.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="vd-review-username">{r.username}</div>
                    <div className="vd-review-event">{r.event_type}</div>
                  </div>
                  <div className="vd-review-stars">
                    {'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))}
                    <span className="vd-review-rating-val">{r.rating}</span>
                  </div>
                </div>
                {r.review_text && <div className="vd-review-text">"{r.review_text}"</div>}
                <div className="vd-review-date">
                  {new Date(r.created_at).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default VenueDetail;
