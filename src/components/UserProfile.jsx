import React, { useState, useEffect } from 'react';
import { Settings2, Film, Check, Users, Mail, User, Palette, RefreshCw, Play as PlayIcon, Square, FileText } from 'lucide-react';
import { MOCK_MOVIES, GENRES, PLATFORMS } from '../mockData';
import { useSelector } from 'react-redux';
import { getMovieSyncStatus, startMovieSync, stopMovieSync, getTmdbKeyConfig, saveTmdbKeyConfig } from '../services/authService';

const ILLUSTRATED_AVATARS = [
  { id: 'director', name: 'Director Cap', emoji: '🎬' },
  { id: 'reel', name: 'Film Reel', emoji: '🎞️' },
  { id: 'popcorn', name: 'Popcorn Critic', emoji: '🍿' },
  { id: 'camera', name: 'Cine Camera', emoji: '🎥' },
  { id: 'glasses', name: '3D Glasses', emoji: '🕶️' }
];

export default function UserProfile({
  userPreferences,
  onUpdatePreferences,
  watchedIds,
  watchlistIds
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userPreferences.name || "Arjun Kumar");
  const [tempBio, setTempBio] = useState(userPreferences.bio || "Film critic, indie filmmaker based in Mumbai. Mubi enthusiast.");
  const [tempAvatar, setTempAvatar] = useState(userPreferences.avatar || "🍿");
  const [tempPlatforms, setTempPlatforms] = useState(userPreferences.platforms || []);

  const { isAuthenticated } = useSelector(state => state.auth);
  const [activeSubTab, setActiveSubTab] = useState("watched"); // watched, lists, platforms, sync
  
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const [tmdbKey, setTmdbKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedApiKey, setMaskedApiKey] = useState('');
  const [apiKeyMessage, setApiKeyMessage] = useState('');

  // Fetch TMDB Key Config status
  useEffect(() => {
    if (!isAuthenticated || activeSubTab !== 'sync') return;
    const fetchKeyConfig = async () => {
      try {
        const data = await getTmdbKeyConfig();
        setHasApiKey(data.hasApiKey);
        setMaskedApiKey(data.maskedApiKey || '');
      } catch (err) {
        console.error('Failed to load TMDB API key config:', err);
      }
    };
    fetchKeyConfig();
  }, [isAuthenticated, activeSubTab]);

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setApiKeyMessage('');
    setSyncError('');
    try {
      const data = await saveTmdbKeyConfig(tmdbKey);
      setApiKeyMessage(data.message || 'Key saved successfully');
      setTmdbKey('');
      // reload config
      const config = await getTmdbKeyConfig();
      setHasApiKey(config.hasApiKey);
      setMaskedApiKey(config.maskedApiKey || '');
    } catch (err) {
      setSyncError(err.message || 'Failed to save TMDB key');
    }
  };

  // Poll sync status if running
  useEffect(() => {
    if (!isAuthenticated) return;

    let intervalId = null;

    const fetchStatus = async () => {
      try {
        const data = await getMovieSyncStatus();
        setSyncStatus(data.status);
        setSyncLogs(data.logs || []);
        
        if (data.status?.status === 'running') {
          setIsSyncing(true);
        } else {
          setIsSyncing(false);
        }
      } catch (err) {
        console.error('Failed to fetch sync status:', err);
      }
    };

    fetchStatus(); // initial call

    // poll every 2 seconds to update logs and status
    intervalId = setInterval(fetchStatus, 2000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, isSyncing]);

  const handleStartSync = async () => {
    setSyncError('');
    try {
      await startMovieSync();
      setIsSyncing(true);
    } catch (err) {
      setSyncError(err.message);
    }
  };

  const handleStopSync = async () => {
    setSyncError('');
    try {
      await stopMovieSync();
      setIsSyncing(false);
    } catch (err) {
      setSyncError(err.message);
    }
  };

  // Compute genre statistics for Taste Graph (using watched movie genres + fallback to onboarding genres)
  const watchedMovies = MOCK_MOVIES.filter(m => watchedIds.includes(m.id));
  const activeGenres = watchedMovies.flatMap(m => m.genres);

  // default mock genres count if watched list is empty to render a cool graph
  const genreCounts = {};
  const baseGenres = activeGenres.length > 0 ? activeGenres : (userPreferences.genres || ["Sci-Fi", "Drama", "Thriller"]);
  baseGenres.forEach(g => {
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });

  const totalGenreHits = Object.values(genreCounts).reduce((a, b) => a + b, 0);
  
  // Format data for SVG Pie Chart
  const colors = ["#E94560", "#0F3460", "#16213E", "#FFD700", "#9B59B6", "#1ABC9C", "#2ECC71", "#E67E22"];
  let accumulatedAngle = 0;

  const pieSlices = Object.entries(genreCounts).map(([genre, count], idx) => {
    const percentage = ((count / totalGenreHits) * 100).toFixed(0);
    const angle = (count / totalGenreHits) * 360;
    
    // Calculate polar coordinates for SVG paths
    const radius = 80;
    const center = 100;
    
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    // SVG path string
    const d = `
      M ${center} ${center}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      Z
    `;

    return {
      genre,
      count,
      percentage,
      path: d,
      color: colors[idx % colors.length]
    };
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdatePreferences({
      ...userPreferences,
      name: tempName,
      bio: tempBio,
      avatar: tempAvatar,
      platforms: tempPlatforms
    });
    setIsEditing(false);
  };

  const togglePlatform = (platId) => {
    if (tempPlatforms.includes(platId)) {
      setTempPlatforms(tempPlatforms.filter(p => p !== platId));
    } else {
      setTempPlatforms([...tempPlatforms, platId]);
    }
  };

  return (
    <div className="profile-screen">
      <style>{`
        .profile-screen {
          padding: 40px;
          min-height: 100vh;
        }
        .profile-hero {
          display: flex;
          align-items: center;
          gap: 30px;
          background: var(--card-surface);
          border: 1px solid var(--border-color);
          padding: 30px;
          border-radius: 16px;
          margin-bottom: 30px;
          position: relative;
          flex-wrap: wrap;
        }
        .profile-avatar-large {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 3px solid var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 44px;
          box-shadow: var(--shadow-glow);
        }
        .profile-info-box {
          flex: 1;
        }
        .profile-name {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .profile-bio {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .profile-follows {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .follow-stat strong {
          color: white;
        }
        .btn-edit-profile {
          position: absolute;
          top: 30px;
          right: 30px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-edit-profile:hover {
          border-color: var(--accent-primary);
          background: rgba(233, 69, 96, 0.05);
        }

        /* Stats strip */
        .stats-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: var(--card-surface);
          border: 1px solid var(--border-color);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }
        .stat-card h4 {
          font-size: 28px;
          font-weight: 800;
          color: var(--accent-primary);
          text-shadow: var(--shadow-glow);
        }
        .stat-card p {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        /* Layout panels */
        .profile-layout {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 30px;
        }
        @media (max-width: 900px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
          .stats-strip {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Taste Graph Card */
        .taste-graph-card {
          background: var(--card-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .svg-container {
          position: relative;
          width: 200px;
          height: 200px;
          margin-bottom: 20px;
        }
        .pie-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .legend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        .legend-label-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        /* Modal Overlay for Edit Profile */
        .edit-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 2500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .edit-modal-card {
          width: 100%;
          max-width: 500px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: var(--shadow-premium);
        }
        .modal-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .modal-input {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: 8px;
          color: white;
          font-size: 14px;
        }
        .avatar-selectors {
          display: flex;
          gap: 12px;
          justify-content: space-between;
        }
        .avatar-select-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-select-btn.selected {
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-glow);
        }

        .edit-platforms-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .edit-plat-toggle {
          padding: 8px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }
        .edit-plat-toggle.active {
          color: white;
          border-color: var(--accent-primary);
          background: rgba(233, 69, 96, 0.05);
        }

        /* Movie Sub Tabs in Profile */
        .profile-sub-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          gap: 20px;
          margin-bottom: 20px;
        }
        .profile-sub-tab-btn {
          padding: 10px 4px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          position: relative;
        }
        .profile-sub-tab-btn.active {
          color: white;
        }
        .profile-sub-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--accent-primary);
        }

        .compatibility-card {
          background: linear-gradient(135deg, var(--accent-secondary) 0%, var(--bg-secondary) 100%);
          border: 1px solid var(--border-color);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .sync-status-badge {
          font-size: 11px;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .sync-status-badge.idle {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
        }
        .sync-status-badge.running {
          background: rgba(233, 69, 96, 0.15);
          color: var(--accent-primary);
          animation: pulse 1.5s infinite;
        }
        .sync-status-badge.completed {
          background: rgba(76, 209, 55, 0.1);
          color: #4cd137;
        }
        .sync-status-badge.interrupted, .sync-status-badge.failed {
          background: rgba(232, 65, 24, 0.1);
          color: #e84118;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>

      {/* User Info Header */}
      <div className="profile-hero">
        <div className="profile-avatar-large">
          {userPreferences.avatar || "🍿"}
        </div>
        <div className="profile-info-box">
          <h2 className="profile-name">{userPreferences.name || "Arjun Kumar"}</h2>
          <p className="profile-bio">{userPreferences.bio || "Film critic, indie filmmaker based in Mumbai. Mubi enthusiast."}</p>
          <div className="profile-follows">
            <span className="follow-stat"><strong>142</strong> followers</span>
            <span className="follow-stat"><strong>268</strong> following</span>
            <span className="follow-stat"><strong>85%</strong> Taste compatibility</span>
          </div>
        </div>
        <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
          <Settings2 size={14} /> Edit Profile
        </button>
      </div>

      {/* Stats Strip */}
      <div className="stats-strip">
        <div className="stat-card">
          <h4>{watchedIds.length}</h4>
          <p>Watched</p>
        </div>
        <div className="stat-card">
          <h4>{watchlistIds.length}</h4>
          <p>Watchlists</p>
        </div>
        <div className="stat-card">
          <h4>3</h4>
          <p>Reviews</p>
        </div>
        <div className="stat-card">
          <h4>180</h4>
          <p>CineScore</p>
        </div>
      </div>

      {/* Main layout */}
      <div className="profile-layout">
        {/* Left Side: Movie Collections */}
        <div>
          <div className="profile-sub-tabs">
            <button
              className={`profile-sub-tab-btn ${activeSubTab === "watched" ? "active" : ""}`}
              onClick={() => setActiveSubTab("watched")}
            >
              Watched Recently
            </button>
            <button
              className={`profile-sub-tab-btn ${activeSubTab === "platforms" ? "active" : ""}`}
              onClick={() => setActiveSubTab("platforms")}
            >
              Streaming Connections
            </button>
            {isAuthenticated && (
              <button
                className={`profile-sub-tab-btn ${activeSubTab === "sync" ? "active" : ""}`}
                onClick={() => setActiveSubTab("sync")}
              >
                Metadata Sync
              </button>
            )}
          </div>

          {activeSubTab === "watched" && (
            <div className="movie-grid">
              {watchedMovies.map((movie) => (
                <div
                  key={movie.id}
                  style={{ background: 'var(--card-surface)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}
                >
                  <div
                    style={{ height: '180px', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${movie.posterUrl})` }}
                  ></div>
                  <div style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {movie.title}
                  </div>
                </div>
              ))}
              {watchedMovies.length === 0 && (
                <div style={{ gridColumn: 'span 3', color: 'var(--text-secondary)', padding: '20px', textAlign: 'center' }}>
                  No titles marked as Watched yet. Tapping "Watched It" on movie cards builds this list.
                </div>
              )}
            </div>
          )}

          {activeSubTab === "platforms" && (
            <div style={{ background: 'var(--card-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Active Subscriptions</h3>
              {PLATFORMS.map((p) => {
                const isConnected = userPreferences.platforms?.includes(p.id);
                return (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{p.logo}</span>
                      <span style={{ fontWeight: '500' }}>{p.name}</span>
                    </div>
                    {isConnected ? (
                      <span style={{ background: 'rgba(76, 209, 55, 0.1)', color: '#4cd137', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>CONNECTED</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>DISCONNECTED</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeSubTab === "sync" && isAuthenticated && (
            <div style={{ background: 'var(--card-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', margin: 0 }}>CineVerse Metadata Sync</h3>
                <span className={`sync-status-badge ${syncStatus?.status || 'idle'}`}>
                  {(syncStatus?.status || 'idle').toUpperCase()}
                </span>
              </div>
              
              <div className="sync-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>LAST PAGE</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{syncStatus?.last_page || 0}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PROCESSED</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{syncStatus?.processed_count || 0}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TOTAL ITEMS</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{syncStatus?.total_count || 0}</div>
                </div>
              </div>

              {syncError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px', borderRadius: '6px', fontSize: '13px' }}>
                  {syncError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleStartSync} 
                  disabled={isSyncing} 
                  className="btn-create-list"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: isSyncing ? 0.6 : 1 }}
                >
                  <PlayIcon size={16} fill="white" /> Start Sync
                </button>
                <button 
                  onClick={handleStopSync} 
                  disabled={!isSyncing}
                  className="btn-row-action"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: !isSyncing ? 0.6 : 1 }}
                >
                  <Square size={16} fill="white" /> Interrupt Sync
                </button>
              </div>

              {/* TMDB API Key settings Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '10px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  TMDB API Configuration (Optional)
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                  To sync live Hollywood, Bollywood, Tollywood blockbusters & TV series, enter your TMDB API Key (v3) below. If left empty, sync will seed a curated offline premium collection.
                </p>
                {hasApiKey && (
                  <div style={{ fontSize: '11px', color: '#4cd137', marginBottom: '10px', fontWeight: 'bold' }}>
                    Status: Active (Masked: {maskedApiKey})
                  </div>
                )}
                <form onSubmit={handleSaveApiKey} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    placeholder={hasApiKey ? "•••••••••••• (Enter new key to change)" : "Enter TMDB API Key (v3 auth)"}
                    value={tmdbKey}
                    onChange={(e) => setTmdbKey(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white', fontSize: '12px' }}
                  />
                  <button
                    type="submit"
                    className="btn-create-list"
                    style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Save Key
                  </button>
                </form>
                {apiKeyMessage && (
                  <div style={{ color: '#4cd137', fontSize: '11px', marginTop: '6px', fontWeight: 'bold' }}>
                    {apiKeyMessage}
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Sync Log History (Real-time)
                </h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '6px', padding: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {syncLogs.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '15px' }}>
                      No logs recorded yet. Trigger sync to generate logs.
                    </div>
                  ) : (
                    syncLogs.map((log) => (
                      <div key={log.id} style={{ fontSize: '11px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span style={{ fontWeight: 'bold', color: log.status === 'completed' ? '#4cd137' : log.status === 'failed' ? '#e84118' : 'var(--accent-primary)' }}>
                            {log.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ color: 'white', marginTop: '3px', textAlign: 'left' }}>
                          {log.details}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Taste Graph */}
        <div className="taste-graph-card">
          <h3 className="font-display" style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center' }}>
            My Taste Graph
          </h3>
          
          <div className="svg-container">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {pieSlices.map((slice, i) => (
                <path
                  key={i}
                  d={slice.path}
                  fill={slice.color}
                  stroke="var(--bg-secondary)"
                  strokeWidth="2"
                  style={{ transition: 'var(--transition-smooth)' }}
                />
              ))}
            </svg>
          </div>

          <div className="pie-legend">
            {pieSlices.map((slice, i) => (
              <div key={i} className="legend-item">
                <div className="legend-label-box">
                  <div className="legend-dot" style={{ backgroundColor: slice.color }}></div>
                  <span style={{ fontWeight: '500' }}>{slice.genre}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>{slice.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="edit-modal-backdrop" onClick={() => setIsEditing(false)}>
          <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display" style={{ fontSize: '20px' }}>Edit CineVerse Profile</h3>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="modal-input-group">
                <span className="filter-label">Illustrative Avatar</span>
                <div className="avatar-selectors">
                  {ILLUSTRATED_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      className={`avatar-select-btn ${tempAvatar === av.emoji ? 'selected' : ''}`}
                      onClick={() => setTempAvatar(av.emoji)}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-input-group">
                <span className="filter-label">Username</span>
                <input
                  type="text"
                  className="modal-input"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
              </div>

              <div className="modal-input-group">
                <span className="filter-label">Short Bio</span>
                <textarea
                  className="modal-input"
                  style={{ height: '70px', resize: 'none' }}
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                />
              </div>

              <div className="modal-input-group">
                <span className="filter-label">Sync Platforms</span>
                <div className="edit-platforms-grid">
                  {PLATFORMS.map((p) => {
                    const isActive = tempPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`edit-plat-toggle ${isActive ? 'active' : ''}`}
                        onClick={() => togglePlatform(p.id)}
                      >
                        <span>{p.logo} {p.name}</span>
                        {isActive && <Check size={12} color="var(--accent-primary)" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn-create-list"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  className="btn-row-action"
                  style={{ padding: '12px' }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
