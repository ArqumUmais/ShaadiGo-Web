import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../style/AboutUs.css';
import { IconVenue, IconCalendar, IconChat, IconCheck, IconDashboard, IconLock } from './Icons';

const features = [
  { Icon: IconVenue,     title: 'Premium Venues',        text: 'Handpicked wedding halls and marquees across Lahore, Karachi, and Islamabad — each verified for quality, capacity, and service.' },
  { Icon: IconCalendar,  title: 'Real-Time Availability', text: 'Our live availability calendar shows you exactly which dates are open — no back-and-forth calls, no surprises.' },
  { Icon: IconChat,      title: 'Direct Owner Chat',      text: 'Communicate directly with venue owners to negotiate, ask questions, and coordinate every detail of your event.' },
  { Icon: IconCheck,     title: 'Instant Confirmation',   text: 'Book your venue in minutes and receive instant confirmation — your date is secured the moment you confirm.' },
  { Icon: IconDashboard, title: 'Booking Dashboard',      text: 'Manage all your bookings from a personalized dashboard — track status, view details, and stay organized.' },
  { Icon: IconLock,      title: 'Secure & Reliable',      text: 'Your bookings and personal information are protected with industry-standard security practices.' },
];

function AboutUs() {
  const navigate = useNavigate();
  return (
    <div className="ab-page">
      <Header />
      <main className="ab-main">

        <div className="ab-hero">
          <div className="ab-hero-tag">Est. 2026 · Pakistan's Premier Wedding Platform</div>
          <h1 className="ab-hero-title">We Make Your Dream<br />Wedding a Reality</h1>
          <p className="ab-hero-sub">ShaadiGo connects couples across Pakistan with the finest wedding venues — seamlessly, beautifully, and stress-free.</p>
          <button className="ab-hero-btn" onClick={() => navigate('/venues')}>Browse Venues</button>
        </div>

        <div className="ab-gold-divider"></div>

        <div className="ab-stats">
          {[['100+','Weddings Conducted'],['6','Premium Venues'],['3','Cities Covered'],['4.7★','Average Rating']].map(([num, label]) => (
            <div key={label} className="ab-stat-card">
              <div className="ab-stat-num">{num}</div>
              <div className="ab-stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="ab-section">
          <div className="ab-section-label">Who We Are</div>
          <h2 className="ab-section-title">Pakistan's Most Trusted Wedding Venue Platform</h2>
          <p className="ab-section-text">ShaadiGo was founded with a single mission — to take the stress out of finding and booking the perfect wedding venue. We understand that your wedding day is one of the most important moments of your life, and every detail matters.</p>
          <p className="ab-section-text">Our platform brings together Pakistan's most prestigious banquet halls, marquees, and garden venues under one roof. From intimate gatherings to grand celebrations of 1,200+ guests, we have the perfect space for every occasion.</p>
        </div>

        <div className="ab-features">
          <div className="ab-section-label" style={{textAlign:'center'}}>What We Offer</div>
          <h2 className="ab-section-title" style={{textAlign:'center'}}>Everything You Need, In One Place</h2>
          <div className="ab-features-grid">
            {features.map(({ Icon, title, text }) => (
              <div key={title} className="ab-feature-card">
                <div className="ab-feature-icon-wrap">
                  <Icon size={40} color="#4D0D0D" />
                </div>
                <div className="ab-feature-title">{title}</div>
                <p className="ab-feature-text">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ab-section">
          <div className="ab-section-label">Our Story</div>
          <h2 className="ab-section-title">From a Simple Idea to 100+ Happy Couples</h2>
          <p className="ab-section-text">ShaadiGo started when our founders struggled to find a reliable wedding venue for a family event. The process was exhausting — endless phone calls, conflicting availability information, and no way to compare venues side by side.</p>
          <p className="ab-section-text">We built ShaadiGo to solve exactly that problem. Since launching, we have helped over 100 couples celebrate their special day at some of Pakistan's most beautiful venues.</p>
          <p className="ab-section-text">Today, ShaadiGo operates across three major cities with a growing network of premium venues — and we are just getting started.</p>
        </div>

        <div className="ab-cta">
          <h2 className="ab-cta-title">Ready to Find Your Perfect Venue?</h2>
          <p className="ab-cta-sub">Join hundreds of happy couples who trusted ShaadiGo for their special day.</p>
          <button className="ab-cta-btn" onClick={() => navigate('/venues')}>Explore Venues</button>
        </div>

      </main>
      <Footer />
    </div>
  );
}

export default AboutUs;
