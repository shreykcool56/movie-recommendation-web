import React, { useState } from 'react';
import { X, Sparkles, CreditCard, QrCode, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { createPaymentOrder, verifyPayment, verifyUpiPayment } from '../services/authService';
import { setPremiumStatus } from '../store/authSlice';

export default function PremiumUpgradeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('razorpay'); // razorpay, upi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [utr, setUtr] = useState('');

  const premiumAmount = '199';
  const upiId = '9627791530@mbk';
  const upiUrl = `upi://pay?pa=${upiId}&pn=CineVerse&am=${premiumAmount}&cu=INR&tn=CineVerse%20Premium`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=13-13-13&data=${encodeURIComponent(upiUrl)}`;

  // Dynamic script loader for Razorpay Checkout
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Create Order on backend
      const order = await createPaymentOrder();

      // 2. Check if running in mock sandbox mode (no keys in env)
      if (order.isMock) {
        setError('Notice: Razorpay credentials not configured in backend .env. Simulating sandbox payment...');
        setTimeout(async () => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: order.orderId,
              razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
              razorpay_signature: 'mock_signature',
              isMock: true
            });

            if (verifyRes.success) {
              dispatch(setPremiumStatus(true));
              setError('');
              setSuccess(true);
            }
          } catch (verErr) {
            setError(verErr.message || 'Payment signature verification failed.');
          } finally {
            setLoading(false);
          }
        }, 2000);
        return;
      }

      // 3. Real Payment flow - load script and open checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay checkout script. Please check your network or try direct UPI.');
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'CineVerse',
        description: 'CineVerse Premium Subscription',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80',
        order_id: order.orderId,
        prefill: {
          email: user?.email || '',
          name: user?.name || ''
        },
        theme: {
          color: '#E94560'
        },
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isMock: false
            });

            if (verifyRes.success) {
              dispatch(setPremiumStatus(true));
              setSuccess(true);
            }
          } catch (verErr) {
            setError(verErr.message || 'Payment signature verification failed.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      setError(err.message || 'Failed to initialize payment.');
      setLoading(false);
    }
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    if (!utr.trim() || utr.trim().length < 12) {
      setError('Please enter a valid 12-digit UTR Transaction ID.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await verifyUpiPayment(utr.trim());
      if (result.success) {
        dispatch(setPremiumStatus(true));
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify transaction. Please check UTR and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-backdrop" onClick={onClose}>
      <style>{`
        .payment-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .payment-modal-card {
          width: 100%;
          max-width: 550px;
          background: linear-gradient(180deg, #1f1f2e 0%, #111116 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 30px;
          position: relative;
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(233, 69, 96, 0.15);
          animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modal-pop {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .payment-btn-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
        }
        .payment-btn-close:hover {
          color: white;
          background: rgba(233, 69, 96, 0.2);
          border-color: var(--accent-primary);
        }
        
        .premium-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .crown-icon-container {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
        }
        .premium-title {
          font-size: 26px;
          font-weight: 800;
          background: linear-gradient(90deg, #fff 0%, #FFD700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .premium-desc {
          font-size: 13px;
          color: #aaa;
          margin-top: 6px;
        }

        .perks-list {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .perk-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #ddd;
        }

        .payment-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .payment-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #aaa;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .payment-tab-btn.active {
          color: white;
          background: rgba(233, 69, 96, 0.15);
          border: 1px solid rgba(233, 69, 96, 0.3);
        }

        .tab-panel {
          min-height: 200px;
        }

        .gateway-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 10px;
          text-align: center;
          gap: 16px;
        }
        .pay-rzp-btn {
          width: 100%;
          max-width: 320px;
          background: linear-gradient(90deg, #E94560 0%, #c32b42 100%);
          color: white;
          padding: 14px;
          border-radius: 12px;
          border: none;
          font-weight: bold;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 8px 16px rgba(233, 69, 96, 0.3);
          transition: all 0.2s;
        }
        .pay-rzp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px rgba(233, 69, 96, 0.4);
        }
        .pay-rzp-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upi-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .qr-wrapper {
          background: white;
          padding: 12px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-image {
          width: 180px;
          height: 180px;
        }
        .upi-deep-link {
          font-size: 12px;
          color: #FFD700;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .upi-instruction {
          font-size: 11px;
          color: #888;
          text-align: center;
          line-height: 1.4;
          max-width: 400px;
        }
        
        .upi-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }
        .upi-input-row {
          display: flex;
          gap: 8px;
        }
        .utr-input {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px;
          color: white;
          font-size: 13px;
          font-family: monospace;
          letter-spacing: 1px;
        }
        .utr-input:focus {
          border-color: var(--accent-primary);
          outline: none;
          background: rgba(0, 0, 0, 0.5);
        }
        .btn-upi-submit {
          background: #4cd137;
          color: white;
          border: none;
          padding: 0 20px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-upi-submit:hover:not(:disabled) {
          background: #44bd32;
        }
        .btn-upi-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 10px;
          gap: 16px;
        }
        .success-title {
          font-size: 24px;
          font-weight: 800;
          color: #4cd137;
        }
        .btn-success-close {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 10px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 12px;
          width: 100%;
          box-sizing: border-box;
          margin-top: 16px;
        }
      `}</style>

      <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
        {!success && (
          <button className="payment-btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        )}

        {success ? (
          <div className="success-panel">
            <CheckCircle2 size={64} color="#4cd137" style={{ filter: 'drop-shadow(0 0 10px rgba(76, 209, 55, 0.3))' }} />
            <h3 className="success-title font-display">Upgrade Successful!</h3>
            <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5' }}>
              Welcome to CineVerse Premium. All movies, blockbusters, and trailers are now fully unlocked for you.
            </p>
            <button className="btn-success-close" onClick={onClose}>
              Start Watching
            </button>
          </div>
        ) : (
          <>
            <div className="premium-header">
              <div className="crown-icon-container">
                <Sparkles size={28} color="white" />
              </div>
              <h2 className="premium-title font-display">CINEVERSE PREMIUM</h2>
              <p className="premium-desc">Unlock unlimited blockbusters & TV series</p>
            </div>

            <div className="perks-list">
              <div className="perk-item">
                <CheckCircle2 size={14} color="#FFD700" />
                <span>Unlimited Movie Watching</span>
              </div>
              <div className="perk-item">
                <CheckCircle2 size={14} color="#FFD700" />
                <span>Watch Trailing Previews</span>
              </div>
              <div className="perk-item">
                <CheckCircle2 size={14} color="#FFD700" />
                <span>Premium Quality Trailers</span>
              </div>
              <div className="perk-item">
                <CheckCircle2 size={14} color="#FFD700" />
                <span>Live Metadata Sync Access</span>
              </div>
            </div>

            <div className="payment-tabs">
              <button 
                className={`payment-tab-btn ${activeTab === 'razorpay' ? 'active' : ''}`}
                onClick={() => { setActiveTab('razorpay'); setError(''); }}
              >
                <CreditCard size={15} />
                <span>Razorpay Gateway</span>
              </button>
              <button 
                className={`payment-tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
                onClick={() => { setActiveTab('upi'); setError(''); }}
              >
                <QrCode size={15} />
                <span>Direct UPI QR</span>
              </button>
            </div>

            <div className="tab-panel">
              {activeTab === 'razorpay' ? (
                <div className="gateway-panel">
                  <p style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.6', marginBottom: '8px' }}>
                    Pay securely using Razorpay Gateway. Supports all Indian cards, UPI apps (GPay, PhonePe, Paytm), Netbanking, and Wallets.
                  </p>
                  
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFD700', margin: '4px 0' }}>
                    ₹{premiumAmount} <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>/ Lifetime</span>
                  </div>

                  <button 
                    className="pay-rzp-btn" 
                    onClick={handleRazorpayPayment} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Initializing Checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay with Razorpay</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="upi-panel">
                  <div className="qr-wrapper">
                    <img 
                      className="qr-image" 
                      src={qrCodeUrl} 
                      alt="UPI QR Code" 
                      title="Scan to pay via any UPI App"
                    />
                  </div>

                  <a href={upiUrl} className="upi-deep-link">
                    Click to Pay via UPI App
                  </a>

                  <p className="upi-instruction">
                    Scan the QR code using any UPI App (GPay, PhonePe, Paytm, BHIM) to transfer <strong>₹{premiumAmount}</strong> directly to <strong>{upiId}</strong>.
                  </p>

                  <form onSubmit={handleUpiSubmit} className="upi-form">
                    <span style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold' }}>Enter 12-Digit UPI Ref No. / UTR Code</span>
                    <div className="upi-input-row">
                      <input 
                        type="text" 
                        className="utr-input"
                        placeholder="e.g. 617283940128" 
                        value={utr}
                        onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        disabled={loading}
                      />
                      <button 
                        type="submit" 
                        className="btn-upi-submit"
                        disabled={loading || utr.length < 12}
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
