import React from 'react';
import '../style/Header.css';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('shaadigo_user') || 'null');

    const handleLogout = () => {
        localStorage.removeItem('shaadigo_user');
        navigate('/');
    };

    return (
        <header>
            <span className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                ShaadiGo
            </span>
            <div className="header-nav">
                <span className="nav-link" onClick={() => navigate('/about')}>About Us</span>
                <span className="nav-link" onClick={() => navigate('/venues')}>Venues</span>
                <span className="nav-link" onClick={() => navigate('/contact')}>Contact</span>
                {loggedInUser ? (
                    <>
                        <span className="nav-dashboard" onClick={() => navigate('/dashboard')}>
                            My Bookings
                        </span>
                        <span className="nav-link nav-logout" onClick={handleLogout}>
                            Logout
                        </span>
                    </>
                ) : (
                    <span className="nav-link nav-login" onClick={() => navigate('/')}>
                        Login / Sign Up
                    </span>
                )}
            </div>
        </header>
    );
}

export default Header;
