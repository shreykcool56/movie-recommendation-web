import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Mail, Lock, X, Play, ShieldAlert, CheckCircle2, User, Key } from 'lucide-react';
import { loginUser, registerUser, verifyOtp, resendOtp } from '../services/authService';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // OTP States
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { loading, error } = useSelector((state) => state.auth);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    setDebugOtp('');

    if (!email || !password) {
      setLocalError('All fields are required.');
      return;
    }
    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (!isLogin && !name.trim()) {
      setLocalError('Full Name is required.');
      return;
    }

    try {
      if (isLogin) {
        await loginUser(email, password);
        onClose(); // Close modal on login success
      } else {
        const data = await registerUser(email, password, name.trim());
        setSuccessMessage('Registration successful! Please enter the 6-digit OTP code sent to your email.');
        setIsOtpMode(true);
        if (data.debugOtp) {
          setDebugOtp(data.debugOtp);
        }
      }
    } catch (err) {
      if (err.requiresVerification) {
        setLocalError('Your email is not verified yet. Please enter the OTP code below.');
        setIsOtpMode(true);
        // If login returns requiresVerification, let's keep the email in input
        setEmail(err.email || email);
      } else {
        setLocalError(err.message || 'Operation failed. Please try again.');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP code.');
      return;
    }

    try {
      await verifyOtp(email, otpCode.trim());
      setSuccessMessage('Email verified successfully! You can now sign in.');
      setIsOtpMode(false);
      setIsLogin(true); // switch back to login screen
      setOtpCode('');
      setDebugOtp('');
    } catch (err) {
      setLocalError(err.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setLocalError('');
    setSuccessMessage('');
    setResendLoading(true);

    try {
      const data = await resendOtp(email);
      setSuccessMessage('A new 6-digit OTP verification code has been generated.');
      if (data.debugOtp) {
        setDebugOtp(data.debugOtp);
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setIsOtpMode(false);
    setOtpCode('');
    setDebugOtp('');
    setName('');
    setLocalError('');
    setSuccessMessage('');
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal glass-panel animate-fade-in">
        <button onClick={onClose} className="auth-close-btn" title="Close">
          <X size={20} />
        </button>

        <div className="auth-logo font-display">
          <Play size={24} fill="var(--accent-primary)" color="var(--accent-primary)" />
          <span>CINE<span style={{ color: 'var(--accent-primary)' }}>VERSE</span></span>
        </div>

        {isOtpMode ? (
          <>
            <h2 className="auth-title font-display">Verify Your Email</h2>
            <p className="auth-subtitle">
              We have sent a 6-digit verification code to <strong style={{ color: '#fff' }}>{email}</strong>.
            </p>

            {(localError || error) && (
              <div className="auth-error-box animate-shake">
                <ShieldAlert size={16} />
                <span>{localError || error}</span>
              </div>
            )}

            {successMessage && (
              <div className="auth-success-box">
                <CheckCircle2 size={16} />
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{successMessage}</p>
                </div>
              </div>
            )}

            {debugOtp && (
              <div className="auth-success-box" style={{ background: 'rgba(233, 69, 96, 0.1)', borderColor: 'rgba(233, 69, 96, 0.3)', color: 'var(--accent-primary)' }}>
                <Key size={16} />
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>🔧 Developer Debug OTP</p>
                  <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace', fontSize: '16px', fontWeight: '800', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', letterSpacing: '2px' }}>
                    {debugOtp}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="auth-input-group">
                <Key size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="auth-input"
                  style={{ letterSpacing: otpCode.length > 0 ? '4px' : 'normal', fontWeight: otpCode.length > 0 ? 'bold' : 'normal' }}
                  disabled={loading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn font-display" 
                disabled={loading}
              >
                {loading ? <span className="spinner"></span> : 'Verify Code'}
              </button>
            </form>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={handleResendOtp} 
                className="auth-toggle-link"
                style={{ fontSize: '13px' }}
                disabled={resendLoading}
              >
                {resendLoading ? 'Resending OTP...' : "Didn't receive code? Resend OTP"}
              </button>

              <button 
                onClick={() => { setIsOtpMode(false); setLocalError(''); setSuccessMessage(''); }} 
                className="auth-toggle-link"
                style={{ color: 'var(--text-secondary)', fontSize: '12px' }}
              >
                Back to Sign In
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="auth-title font-display">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="auth-subtitle">
              {isLogin ? 'Sign in to access your watchlists and sync movies' : 'Register to start tracking movies across all platforms'}
            </p>

            {(localError || error) && (
              <div className="auth-error-box animate-shake">
                <ShieldAlert size={16} />
                <span>{localError || error}</span>
              </div>
            )}

            {successMessage && (
              <div className="auth-success-box">
                <CheckCircle2 size={16} />
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{successMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="auth-input-group">
                  <User size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                    disabled={loading}
                    required
                  />
                </div>
              )}

              <div className="auth-input-group">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  disabled={loading}
                  required
                />
              </div>

              <div className="auth-input-group">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type="password"
                  placeholder="Password (min. 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  disabled={loading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn font-display" 
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>

            <div className="auth-toggle">
              <span>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
              <button onClick={handleSwitchMode} className="auth-toggle-link">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .auth-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .auth-modal {
          width: 100%;
          max-width: 420px;
          background: rgba(20, 20, 20, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px 30px;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
        }

        .auth-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s, transform 0.2s;
        }
        .auth-close-btn:hover {
          color: white;
          transform: rotate(90deg);
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 1px;
          margin-bottom: 24px;
        }

        .auth-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          text-align: center;
        }

        .auth-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          text-align: center;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .auth-error-box {
          width: 100%;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .auth-success-box {
          width: 100%;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .auth-debug-link {
          display: inline-block;
          margin-top: 8px;
          color: white;
          background: #22c55e;
          padding: 4px 8px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          font-size: 11px;
          transition: background 0.2s;
        }
        .auth-debug-link:hover {
          background: #16a34a;
        }

        .auth-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auth-input-group {
          position: relative;
          width: 100%;
        }

        .auth-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 14px 12px 42px;
          color: white;
          font-size: 14px;
          transition: border-color 0.2s, background 0.2s;
        }
        .auth-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.07);
        }

        .auth-submit-btn {
          width: 100%;
          background: var(--accent-primary);
          border: none;
          color: white;
          padding: 14px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 48px;
        }
        .auth-submit-btn:hover {
          opacity: 0.9;
        }
        .auth-submit-btn:active {
          transform: scale(0.98);
        }

        .auth-toggle {
          margin-top: 24px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .auth-toggle-link {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-weight: bold;
          cursor: pointer;
          padding: 0;
          font-size: 13px;
        }
        .auth-toggle-link:hover {
          text-decoration: underline;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
