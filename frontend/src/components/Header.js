import React from 'react';
import '../style/Header.css';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    return (
        <header>
            <span className="brand">ShaadiGo</span>
            <div className="header-nav">
                <a href="#">About Us</a>
                <span onClick={() => navigate('/venues')} style={{ cursor: 'pointer' }}>Venues</span>
                <a href="#">Booking</a>
                <span onClick={() => navigate('/contact')} style={{ cursor: 'pointer' }}>Contact</span>
            </div>
        </header>
    );
}

export default Header;