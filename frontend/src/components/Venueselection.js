import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../style/Venueselection.css';

const venues = [
  { id:1, emoji:'🏛️', name:'Pearl Continental Hall', city:'Lahore', location:'Gulberg, Lahore', rating:4.8, reviews:124, capacity:800, price:'4,50,000', priceNum:450000, desc:'Our venue offers professional planning services to ensure every detail of your special day is sorted in seconds for a seamless, royal experience.', stars:[1,1,1,1,0.5] },
  { id:2, emoji:'✨', name:'Royal Banquet Gardens', city:'Karachi', location:'Clifton, Karachi', rating:4.8, reviews:98, capacity:1200, price:'6,00,000', priceNum:600000, desc:'Our venue offers professional planning services to ensure every detail of your special day is sorted in seconds for a seamless, royal experience.', stars:[1,1,1,1,0.5] },
  { id:3, emoji:'🌸', name:'Margalla Majestic Hall', city:'Islamabad', location:'F-7, Islamabad', rating:4.8, reviews:76, capacity:600, price:'3,80,000', priceNum:380000, desc:'Our venue offers professional planning services to ensure every detail of your special day is sorted in seconds for a seamless, royal experience.', stars:[1,1,1,1,0.5] },
  { id:4, emoji:'🌹', name:'Golden Marquee Lahore', city:'Lahore', location:'DHA, Lahore', rating:4.6, reviews:55, capacity:1000, price:'3,20,000', priceNum:320000, desc:'A breathtaking marquee venue with lush greenery, world-class catering and an expert wedding management team at your service.', stars:[1,1,1,1,0] },
  { id:5, emoji:'🕌', name:'Al-Noor Grand Hall', city:'Karachi', location:'Gulshan, Karachi', rating:4.7, reviews:89, capacity:900, price:'5,20,000', priceNum:520000, desc:'Timeless elegance meets warm hospitality in this iconic Karachi venue, perfect for both intimate and grand celebrations.', stars:[1,1,1,1,0.5] },
  { id:6, emoji:'🏰', name:'Serene Garden Marquee', city:'Islamabad', location:'E-11, Islamabad', rating:4.5, reviews:42, capacity:500, price:'2,80,000', priceNum:280000, desc:'An open-air paradise surrounded by manicured gardens, fairy lights and mountain backdrop views for an unforgettable evening.', stars:[1,1,1,1,0] },
];

const filters = ['All', 'Lahore', 'Karachi', 'Islamabad'];

function StarIcon({ fill }) {
  if (fill === 1) return <svg viewBox="0 0 16 16" style={{fill:'#D4AF37', width:14, height:14}}><polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6"/></svg>;
  if (fill === 0.5) return <svg viewBox="0 0 16 16" style={{fill:'url(#halfGold)', width:14, height:14}}><polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6"/></svg>;
  return <svg viewBox="0 0 16 16" style={{fill:'rgba(212,175,55,0.25)', width:14, height:14}}><polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6"/></svg>;
}

function VenueSelection() {
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const filtered = activeFilter === 'All' ? venues : venues.filter(v => v.city === activeFilter);

  return (
    <div className="vs-page">
      <svg width="0" height="0" style={{position:'absolute'}}>
        <defs>
          <linearGradient id="halfGold" x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="#D4AF37"/>
            <stop offset="50%" stopColor="rgba(212,175,55,0.25)"/>
          </linearGradient>
        </defs>
      </svg>

      <Header />

      <main className="vs-main">
        <div className="vs-heading">
          <h1>Find Your Perfect Venue</h1>
          <p>Handpicked wedding halls across Pakistan — elegant, royal, unforgettable.</p>
        </div>
        <div className="vs-gold-divider"></div>

        <div className="vs-filter-bar">
          {filters.map(f => (
            <button key={f} className={`vs-filter-btn${activeFilter === f ? ' active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
          ))}
        </div>

        <div className="vs-grid">
          {filtered.map((venue, i) => (
            <div className="vs-card" key={venue.id} style={{animationDelay:`${i * 0.08}s`}}>
              <div className="vs-img-placeholder">{venue.emoji}</div>
              <div className="vs-body">
                <div className="vs-top">
                  <div className="vs-name">{venue.name}</div>
                  <div className="vs-badge">{venue.city}</div>
                </div>
                <div className="vs-stars">
                  <div className="vs-stars-icons">
                    {venue.stars.map((s, idx) => <StarIcon key={idx} fill={s}/>)}
                  </div>
                  <span className="vs-rating-val">{venue.rating}</span>
                  <span className="vs-rating-count">({venue.reviews} reviews)</span>
                </div>
                <p className="vs-desc">{venue.desc}</p>
                <div className="vs-meta">
                  <div className="vs-meta-item">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#4D0D0D" strokeWidth="1.3"/><circle cx="8" cy="6" r="1.5" stroke="#4D0D0D" strokeWidth="1.3"/></svg>
                    {venue.location}
                  </div>
                  <div className="vs-meta-item">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M2 5h12M2 8h8M5 2v2M11 2v2" stroke="#4D0D0D" strokeWidth="1.3" strokeLinecap="round"/><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#4D0D0D" strokeWidth="1.3"/></svg>
                    Up to {venue.capacity.toLocaleString()} guests
                  </div>
                </div>
                <div className="vs-footer">
                  <div className="vs-price">PKR {venue.price} <span>/ event</span></div>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button className="vs-btn-detail" onClick={() => navigate('/venue-detail', { state: { venue } })}>View Detail</button>
                    <button className="vs-btn-book" onClick={() => navigate('/booking', { state: { venue } })}>Book Now</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default VenueSelection;