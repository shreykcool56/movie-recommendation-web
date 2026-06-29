import React, { useState, useEffect } from 'react';
import { Home, Compass, Bookmark, Users, User, Play, Info, Sparkles } from 'lucide-react';
import { MOCK_MOVIES } from './mockData';
import Onboarding from './components/Onboarding';
import HomeDashboard from './components/HomeDashboard';
import SearchDiscover from './components/SearchDiscover';
import WatchlistManager from './components/WatchlistManager';
import UserProfile from './components/UserProfile';
import MovieDetailSheet from './components/MovieDetailSheet';
import AuthModal from './components/AuthModal';
import PremiumUpgradeModal from './components/PremiumUpgradeModal';
import { useSelector } from 'react-redux';
import { logoutUser, getMovies } from './services/authService';

export default function App() {
  const [preferences, setPreferences] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // home, discover, watchlist, social, profile
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [watchedIds, setWatchedIds] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Redux state
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [moviesLoaded, setMoviesLoaded] = useState(0);

  // Load preferences and state from localStorage scoped per user
  useEffect(() => {
    const suffix = (isAuthenticated && user) ? `_${user.email}` : '_guest';
    
    const savedPrefs = localStorage.getItem(`cineverse_preferences${suffix}`);
    const savedWatchlist = localStorage.getItem(`cineverse_watchlist${suffix}`);
    const savedWatched = localStorage.getItem(`cineverse_watched${suffix}`);

    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    } else {
      // For authenticated users, if they don't have preferences yet, let them go through onboarding.
      // For guest, let it be null as well to show onboarding.
      setPreferences(null);
    }
    
    if (savedWatchlist) {
      setWatchlistIds(JSON.parse(savedWatchlist));
    } else {
      setWatchlistIds([1, 3, 12]);
    }
    
    if (savedWatched) {
      setWatchedIds(JSON.parse(savedWatched));
    } else {
      setWatchedIds([2, 5, 10]);
    }
    
    setIsLoading(false);
  }, [isAuthenticated, user]);

  // Fetch and load live movies from the database
  useEffect(() => {
    const loadLiveMovies = async () => {
      try {
        const data = await getMovies();
        if (data && data.movies && data.movies.length > 0) {
          const mapped = data.movies.map(m => {
            const numericId = parseInt(m.id.replace('ext-movie-', '').replace('tmdb-movie-', '').replace('tmdb-series-', '').replace('premium-hw-', '').replace('premium-bw-', '').replace('premium-tw-', '').replace('premium-ws-', '')) || m.id;
            
            // Cast details parsing
            let cast = [];
            if (m.cast_details) {
              cast = typeof m.cast_details === 'string' ? JSON.parse(m.cast_details) : m.cast_details;
            } else if (m.cast_members) {
              cast = m.cast_members.map((name, idx) => ({
                name,
                role: `Cast Member`,
                img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
              }));
            }

            // Platforms parsing
            let platforms = [];
            if (m.platforms) {
              const parsedPlats = typeof m.platforms === 'string' ? JSON.parse(m.platforms) : m.platforms;
              platforms = parsedPlats.map((p) => ({
                id: p.id || p.name.toLowerCase().replace(' ', '').replace('+', 'plus'),
                name: p.name,
                price: p.price === 0 ? 'Subscription' : `Rent ₹${p.price}`,
                available: true
              }));
            }

            // Moods parsing (derive based on genres if not exists)
            let moods = m.moods || [];
            if (moods.length === 0) {
              if (m.genres.includes('Action') || m.genres.includes('Thriller')) moods.push('action_packed');
              if (m.genres.includes('Sci-Fi') || m.genres.includes('Mystery')) moods.push('mind_bending');
              if (m.genres.includes('Drama') && m.genres.includes('Romance')) moods.push('good_cry');
              if (m.genres.includes('Comedy')) moods.push('fun_light');
              if (moods.length === 0) moods.push('feel_good');
            }

            return {
              id: numericId,
              title: m.title,
              type: m.type,
              year: m.year || 2024,
              runtime: m.runtime || "120 min",
              genres: m.genres,
              languages: m.languages || ["English"],
              imdbRating: parseFloat(m.ratings) || 7.5,
              rtRating: m.rt_rating || "85%",
              cineverseRating: parseFloat(m.ratings) || 7.5,
              synopsis: m.synopsis,
              backdropUrl: m.backdrop_url || "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200",
              posterUrl: m.poster_url,
              moods,
              platforms,
              cast,
              trailerId: m.trailer_id || "dQw4w9WgXcQ",
              industry: m.industry
            };
          });

          // Clear length and push live movies
          MOCK_MOVIES.length = 0;
          MOCK_MOVIES.push(...mapped);
          setMoviesLoaded(prev => prev + 1); // reload layout views
        }
      } catch (err) {
        console.warn('⚠️ Could not load live movies from database, using static mock data.', err.message);
      }
    };

    loadLiveMovies();
  }, [isAuthenticated, activeTab]); // reload when auth state changes or user navigates to tabs

  const handleOnboardingComplete = (data) => {
    const suffix = (isAuthenticated && user) ? `_${user.email}` : '_guest';
    
    // Determine user's custom name
    const userDisplayName = (isAuthenticated && user?.name) 
      ? user.name 
      : ((isAuthenticated && user?.email) ? user.email.split('@')[0] : "Explorer");
    
    const formattedName = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);

    const finalPrefs = {
      name: formattedName,
      bio: "Joined CineVerse. Movie lover and explorer.",
      avatar: "🍿",
      platforms: data.platforms,
      mood: data.mood,
      genres: data.genres,
      seededLikes: data.seededLikes
    };
    setPreferences(finalPrefs);
    localStorage.setItem(`cineverse_preferences${suffix}`, JSON.stringify(finalPrefs));
    
    // Add seeded likes directly to watchlist
    const updatedWatchlist = [...new Set([...watchlistIds, ...data.seededLikes])];
    setWatchlistIds(updatedWatchlist);
    localStorage.setItem(`cineverse_watchlist${suffix}`, JSON.stringify(updatedWatchlist));
    setActiveTab('home');
  };

  const handleToggleWatchlist = (id) => {
    const suffix = (isAuthenticated && user) ? `_${user.email}` : '_guest';
    let updated;
    if (watchlistIds.includes(id)) {
      updated = watchlistIds.filter(item => item !== id);
    } else {
      updated = [...watchlistIds, id];
    }
    setWatchlistIds(updated);
    localStorage.setItem(`cineverse_watchlist${suffix}`, JSON.stringify(updated));
  };

  const handleToggleWatched = (id) => {
    const suffix = (isAuthenticated && user) ? `_${user.email}` : '_guest';
    let updated;
    if (watchedIds.includes(id)) {
      updated = watchedIds.filter(item => item !== id);
    } else {
      updated = [...watchedIds, id];
    }
    setWatchedIds(updated);
    localStorage.setItem(`cineverse_watched${suffix}`, JSON.stringify(updated));
  };

  const handleUpdatePreferences = (updatedPrefs) => {
    const suffix = (isAuthenticated && user) ? `_${user.email}` : '_guest';
    setPreferences(updatedPrefs);
    localStorage.setItem(`cineverse_preferences${suffix}`, JSON.stringify(updatedPrefs));
  };

  const handleResetApp = () => {
    localStorage.clear();
    setPreferences(null);
    setWatchlistIds([1, 3, 12]);
    setWatchedIds([2, 5, 10]);
    setActiveTab('home');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%' }}></div>
      </div>
    );
  }

  // Trigger Onboarding Quiz if no preferences exist
  if (!preferences) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app-container">
      {/* Global Responsive Branding & Auth Header */}
      <header className="app-header font-display">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={20} fill="var(--accent-primary)" color="var(--accent-primary)" />
          <span>CINE<span style={{ color: 'var(--accent-primary)' }}>VERSE</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <div className="user-auth-box">
              {user?.is_premium ? (
                <span className="premium-badge-header" title="CineVerse Premium Member">
                  👑 Premium
                </span>
              ) : (
                <button onClick={() => setIsPremiumModalOpen(true)} className="btn-auth-header upgrade-gold">
                  Upgrade 👑
                </button>
              )}
              <span className="user-email-header">{user?.email}</span>
              <button onClick={logoutUser} className="btn-auth-header logout">
                Log Out
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="btn-auth-header login">
              Sign In
            </button>
          )}
          <button onClick={handleResetApp} className="btn-reset-onboarding" title="Reset onboarding data">
            Reset
          </button>
        </div>
      </header>

      {/* Auth Modal overlay wrapper */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Premium Upgrade Modal overlay wrapper */}
      <PremiumUpgradeModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />

      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          background: rgba(13, 13, 13, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 1000;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        
        .user-auth-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-email-header {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: normal;
          font-family: sans-serif;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-auth-header {
          font-size: 11px;
          font-weight: bold;
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-family: sans-serif;
          transition: background 0.2s, opacity 0.2s;
        }
        .btn-auth-header.login {
          background: var(--accent-primary);
          color: white;
        }
        .btn-auth-header.logout {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid var(--border-color);
        }
        .btn-auth-header:hover {
          opacity: 0.9;
        }
        .premium-badge-header {
          font-size: 11px;
          font-weight: 800;
          color: #FFD700;
          background: rgba(255, 215, 0, 0.12);
          border: 1px solid rgba(255, 215, 0, 0.25);
          padding: 5px 10px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-auth-header.upgrade-gold {
          background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
          color: #111;
          border: none;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
        }
        .btn-auth-header.upgrade-gold:hover {
          background: linear-gradient(90deg, #FFA500 0%, #FF8C00 100%);
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
        }

        .btn-reset-onboarding {
          font-size: 11px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
        }
        .btn-reset-onboarding:hover {
          color: white;
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
        }

        /* Social Tab Placeholder style */
        .social-placeholder-card {
          max-width: 500px;
          margin: 100px auto;
          text-align: center;
          padding: 40px;
          background: var(--card-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>

      {/* Main Content Area based on tabs */}
      <main>
        {activeTab === 'home' && (
          <HomeDashboard
            userPreferences={preferences}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectMovie={setSelectedMovie}
          />
        )}

        {activeTab === 'discover' && (
          <SearchDiscover onSelectMovie={setSelectedMovie} />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistManager
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectMovie={setSelectedMovie}
          />
        )}

        {activeTab === 'social' && (
          <div className="social-placeholder-card glass-panel">
            <Users size={48} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
            <h2 className="font-display" style={{ fontSize: '22px' }}>Social Circles & Clubs</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              Phase 2 release coming soon! You will be able to follow friends, react to ratings with emojis, join cinema discussion clubs, and share live recommendations.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
              <span>#FilmTok</span> &bull; <span>#CineVerseSocial</span> &bull; <span>#SquadWatch</span>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <UserProfile
            userPreferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            watchedIds={watchedIds}
            watchlistIds={watchlistIds}
          />
        )}
      </main>

      {/* Bottom/Left Tab Bar Navigation */}
      <nav className="nav-tab-bar glass-panel">
        <button
          className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <Compass size={20} />
          <span>Discover</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          <Bookmark size={20} />
          <span>Watchlist</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          <Users size={20} />
          <span>Social</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>

      {/* Bottom Sheet detail card details slider */}
      {selectedMovie && (
        <MovieDetailSheet
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          watchlistIds={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
          watchedIds={watchedIds}
          onToggleWatched={handleToggleWatched}
          onSelectMovie={setSelectedMovie}
          subscribedPlatforms={preferences.platforms}
          onOpenUpgradeModal={() => setIsPremiumModalOpen(true)}
        />
      )}
    </div>
  );
}
