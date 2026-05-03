import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Tagline from './components/Tagline';
import SignUpCard from './components/SignUpCard';
import Footer from './components/Footer';
import VenueSelection from './components/Venueselection';
import Booking from './components/Booking';
import VenueDetail from './components/Venuedetail';
import Contact from './components/Contact';
import Dashboard from './components/Dashboard';
import AboutUs from './components/AboutUs';
import Chat from './components/Chat';

// Owner Portal
import OwnerDashboard from './components/OwnerDashboard';
import OwnerVenues    from './components/OwnerVenues';
import OwnerChats     from './components/OwnerChats';

import './App.css';

// Route guard: redirect non-owners away from owner pages
function OwnerRoute({ element }) {
    const user = JSON.parse(localStorage.getItem('shaadigo_user') || '{}');
    return user?.role === 'owner' ? element : <Navigate to="/" replace />;
}

function HomePage() {
    return (
        <div className="App">
            <Header />
            <main>
                <Tagline />
                <div className="divider-v"></div>
                <SignUpCard />
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Customer routes */}
                <Route path="/"              element={<HomePage />} />
                <Route path="/venues"        element={<VenueSelection />} />
                <Route path="/venue-detail"  element={<VenueDetail />} />
                <Route path="/booking"       element={<Booking />} />
                <Route path="/contact"       element={<Contact />} />
                <Route path="/dashboard"     element={<Dashboard />} />
                <Route path="/chat"          element={<Chat />} />
                <Route path="/about"         element={<AboutUs />} />

                {/* Owner portal routes */}
                <Route path="/owner/dashboard" element={<OwnerRoute element={<OwnerDashboard />} />} />
                <Route path="/owner/venues"    element={<OwnerRoute element={<OwnerVenues />} />} />
                <Route path="/owner/chats"     element={<OwnerRoute element={<OwnerChats />} />} />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
