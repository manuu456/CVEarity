import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: '#0a0a0a',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '8px'
};

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', company: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    const result = await register({
      username: formData.username, email: formData.email, password: formData.password,
      firstName: formData.firstName, lastName: formData.lastName, company: formData.company
    });
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
    }
    setLoading(false);
  };

  const getFocusStyle = (name) => ({
    ...inputStyle,
    borderColor: focusedField === name ? '#E53E3E' : '#2a2a2a',
    boxShadow: focusedField === name ? '0 0 0 3px rgba(229,62,62,0.12)' : 'none'
  });

  const focusProps = (name) => ({
    onFocus: () => setFocusedField(name),
    onBlur: () => setFocusedField('')
  });

  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '2px solid #E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 14px rgba(229,62,62,0.5)'
              }}>
                <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }} fill="#E53E3E">
                  <circle cx="12" cy="12" r="2"/>
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
              </div>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.03em' }}>CVEarity</span>
            </div>
          </Link>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '16px' }}>
            Intelligence Framework
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Create Account
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            Join the global vulnerability intelligence network.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#0f0f0f',
          border: '1px solid #1f1f1f',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#E53E3E,#ff6b6b,#E53E3E)' }}/>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {error && (
              <div style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.25)', borderLeft: '3px solid #E53E3E', borderRadius: '8px', padding: '12px 16px' }}>
                <p style={{ color: '#f87171', fontSize: '12px', fontWeight: '700', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Name Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} placeholder="First name" style={getFocusStyle('firstName')} {...focusProps('firstName')} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} placeholder="Last name" style={getFocusStyle('lastName')} {...focusProps('lastName')} />
              </div>
            </div>

            {/* Username / Email Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Username *</label>
                <input name="username" type="text" required value={formData.username} onChange={handleChange} placeholder="Choose a username" style={getFocusStyle('username')} {...focusProps('username')} autoComplete="username" />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="your@email.com" style={getFocusStyle('email')} {...focusProps('email')} autoComplete="email" />
              </div>
            </div>

            {/* Company */}
            <div>
              <label style={labelStyle}>Organization</label>
              <input name="company" type="text" value={formData.company} onChange={handleChange} placeholder="Company or institution (optional)" style={getFocusStyle('company')} {...focusProps('company')} />
            </div>

            {/* Password Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Password *</label>
                <input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="Min 6 characters" style={getFocusStyle('password')} {...focusProps('password')} autoComplete="new-password" />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" style={getFocusStyle('confirmPassword')} {...focusProps('confirmPassword')} autoComplete="new-password" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading ? '#7f1d1d' : '#E53E3E',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.05em',
                boxShadow: '0 0 20px rgba(229,62,62,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px'
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#E53E3E', fontWeight: '700', textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #3f3f46; }
        input:focus { outline: none; }
        @media (max-width: 480px) {
          form > div[style*="grid"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
