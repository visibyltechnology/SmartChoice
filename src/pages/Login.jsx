import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  React.useEffect(() => {
    if (isLoggingIn && user) {
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate(user.isAdmin ? '/admin' : '/');
      }
    }
  }, [user, isLoggingIn, navigate, location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoggingIn(true);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        
        {/* Logo */}
        <div className="auth-logo" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <Link to="/">
            <div style={{ fontFamily: 'var(--font2)', fontSize: '32px', fontWeight: 900, background: 'linear-gradient(90deg, var(--blue-lt), var(--red))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SmartChoice
            </div>
          </Link>
          <p style={{ color: 'var(--text-m)', fontSize: '13px', marginTop: '6px' }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(208, 2, 27, 0.1)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: '13px', padding: '12px 16px', borderRadius: 'var(--r-sm)', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 600 }}>Forgot Password?</Link>
            </div>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" style={{ paddingRight: '40px' }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-m)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth" disabled={true} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.5, cursor: 'not-allowed' }}>
            <LogIn size={16} /> Sign In (Disabled)
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-m)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--red)', fontWeight: 700 }}>Create Account</Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-l)' }}><Lock size={12} color="var(--green)" /> Secure Login</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-l)' }}><ShieldCheck size={12} color="var(--blue-md)" /> 100% Safe</span>
        </div>
      </div>
    </main>
  );
}
