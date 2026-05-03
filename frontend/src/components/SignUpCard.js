import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/SignUpCard.css';

function IconCustomer({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconOwner({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M5 21V9l7-6 7 6v12" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="7" rx="1" stroke={color} strokeWidth="1.6"/>
      <rect x="7" y="11" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4"/>
      <rect x="14" y="11" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}

function SignUpCard() {
    const [isLogin, setIsLogin]   = useState(false);
    const [role, setRole]         = useState('customer');
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage]   = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const switchToLogin = (e) => {
        e.preventDefault();
        setIsLogin(true);
        setMessage({ text: '', type: '' });
    };

    const switchToSignup = (e) => {
        e.preventDefault();
        setIsLogin(false);
        setMessage({ text: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        const endpoint = isLogin ? '/api/login' : '/api/signup';
        try {
            const response = await axios.post(`http://localhost:5001${endpoint}`, {
                username: formData.username,
                password: formData.password,
                ...(!isLogin && { role })
            });

            if (isLogin) {
                const user = response.data.user;
                localStorage.setItem('shaadigo_user', JSON.stringify({
                    user_id:  user.user_id,
                    username: user.username,
                    role:     user.role
                }));
                navigate(user.role === 'owner' ? '/owner/dashboard' : '/venues');
            } else {
                setMessage({ text: 'Account created! You can now log in.', type: 'success' });
                setFormData({ username: formData.username, password: '' });
                setIsLogin(true);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            setMessage({ text: msg, type: 'error' });
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
                <div className="accent-line"></div>
                <p>{isLogin ? 'Login to your ShaadiGo account' : 'Join thousands planning their dream wedding'}</p>
            </div>

            {/* Role toggle — only on signup */}
            {!isLogin && (
                <div className="role-toggle">
                    <button
                        type="button"
                        className={`role-btn ${role === 'customer' ? 'active' : ''}`}
                        onClick={() => setRole('customer')}
                    >
                        <IconCustomer size={16} color={role === 'customer' ? '#fff' : '#4D0D0D'} />
                        Customer
                    </button>
                    <button
                        type="button"
                        className={`role-btn ${role === 'owner' ? 'active' : ''}`}
                        onClick={() => setRole('owner')}
                    >
                        <IconOwner size={16} color={role === 'owner' ? '#fff' : '#4D0D0D'} />
                        Venue Owner
                    </button>
                </div>
            )}

            {message.text && (
                <div style={{
                    padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrap">
                        <svg className="input-icon" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="5.5" r="2.5" stroke="#4D0D0D" strokeWidth="1.4"/>
                            <path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        <input type="text" id="username" placeholder="e.g. ali_hassan"
                            value={formData.username} onChange={handleChange} required />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrap">
                        <svg className="input-icon" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#4D0D0D" strokeWidth="1.4"/>
                            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        <input type="password" id="password" placeholder="Min. 8 characters"
                            value={formData.password} onChange={handleChange} required minLength="8" />
                    </div>
                </div>

                <button className="btn-signup" type="submit">
                    {isLogin ? 'Log In' : (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {role === 'owner'
                                ? <><IconOwner size={16} color="#fff" /> Sign Up as Venue Owner</>
                                : <><IconCustomer size={16} color="#fff" /> Sign Up as Customer</>
                            }
                        </span>
                    )}
                </button>
            </form>

            <div className="or-row"><span>or</span></div>

            <p className="login-link">
                {isLogin ? (
                    <>Don't have an account? <a href="#" onClick={switchToSignup}>Sign up</a></>
                ) : (
                    <>Already have an account? <a href="#" onClick={switchToLogin}>Log in</a></>
                )}
            </p>
        </div>
    );
}

export default SignUpCard;
