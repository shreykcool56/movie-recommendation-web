import React, { useState } from 'react';
import { Sparkles, Check, ChevronRight, Apple, Play, Flame } from 'lucide-react';
import { PLATFORMS, MOODS, GENRES, MOCK_MOVIES } from '../mockData';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['netflix', 'prime']);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [seedIndex, setSeedIndex] = useState(0);
  const [seededLikes, setSeededLikes] = useState([]);
  const [isFinishing, setIsFinishing] = useState(false);

  // We choose 6 iconic movies for seed
  const seedMovies = MOCK_MOVIES.slice(0, 6);

  const togglePlatform = (id) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSeedAction = (liked) => {
    const movie = seedMovies[seedIndex];
    if (liked) {
      setSeededLikes([...seededLikes, movie.id]);
    }

    if (seedIndex < seedMovies.length - 1) {
      setSeedIndex(seedIndex + 1);
    } else {
      // Last step: Show processing screen
      setIsFinishing(true);
      setTimeout(() => {
        onComplete({
          platforms: selectedPlatforms,
          mood: selectedMood,
          genres: selectedGenres,
          seededLikes: [...seededLikes, liked ? movie.id : null].filter(Boolean)
        });
      }, 2000);
    }
  };

  // Rendering individual steps
  return (
    <div className="onboarding-overlay">
      <style>{`
        .onboarding-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-primary);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow-y: auto;
        }
        .onboarding-card {
          width: 100%;
          max-width: 540px;
          border-radius: 16px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-premium);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          transition: width 0.4s ease;
        }
        .logo-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 2px;
        }
        .step-title {
          font-size: 24px;
          font-weight: 600;
          text-align: center;
        }
        .step-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          text-align: center;
          margin-top: -12px;
        }
        /* Step 1: Welcome */
        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          margin-top: 16px;
        }
        .btn-oauth {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 12px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
        }
        .btn-oauth:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-secondary);
          font-size: 12px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }
        .divider:not(:empty)::before { margin-right: .5em; }
        .divider:not(:empty)::after { margin-left: .5em; }

        .btn-primary {
          background-color: var(--accent-primary);
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: var(--shadow-glow);
        }
        .btn-primary:hover {
          background-color: var(--accent-primary-hover);
          transform: translateY(-2px);
        }
        .btn-primary:disabled {
          background-color: #555;
          color: #aaa;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        /* Step 2: Platforms */
        .platform-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .platform-card {
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: var(--transition-smooth);
        }
        .platform-card:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .platform-card.selected {
          border-color: var(--accent-primary);
          background: rgba(233, 69, 96, 0.08);
        }
        .platform-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .platform-logo {
          font-size: 24px;
        }

        /* Step 3: Moods */
        .mood-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mood-card {
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
          transition: var(--transition-smooth);
        }
        .mood-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }
        .mood-card.selected {
          border-color: var(--accent-primary);
          background: rgba(233, 69, 96, 0.08);
          box-shadow: var(--shadow-glow);
        }
        .mood-icon {
          font-size: 28px;
        }
        .mood-meta h4 {
          font-size: 16px;
          margin-bottom: 2px;
        }
        .mood-meta p {
          color: var(--text-secondary);
          font-size: 12px;
        }

        /* Step 4: Genres */
        .genre-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        .genre-pill {
          padding: 10px 20px;
          border-radius: 50px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.02);
          font-weight: 500;
          font-size: 14px;
          transition: var(--transition-smooth);
        }
        .genre-pill:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .genre-pill.selected {
          background-color: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
          box-shadow: var(--shadow-glow);
        }

        /* Step 5: Taste Seed */
        .seed-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          min-height: 320px;
        }
        .seed-counter {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .seed-movie-card {
          width: 220px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-premium);
          display: flex;
          flex-direction: column;
          animation: card-enter 0.4s ease;
        }
        @keyframes card-enter {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .seed-poster {
          height: 280px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .seed-movie-info {
          padding: 12px;
          text-align: center;
        }
        .seed-movie-title {
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .seed-movie-meta {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        .seed-actions {
          display: flex;
          gap: 16px;
          width: 100%;
          margin-top: 8px;
        }
        .btn-seed {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
        }
        .btn-skip {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }
        .btn-skip:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .btn-like {
          background: var(--accent-primary);
          color: white;
          box-shadow: var(--shadow-glow);
        }
        .btn-like:hover {
          background: var(--accent-primary-hover);
        }

        /* Finishing state */
        .finishing-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 40px 0;
          text-align: center;
        }
        .spinner-glow {
          width: 60px;
          height: 60px;
          border: 4px solid var(--accent-secondary);
          border-top: 4px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: var(--shadow-glow);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="onboarding-card glass-panel">
        <div className="progress-bar" style={{ width: `${(step / 5) * 100}%` }}></div>

        {isFinishing ? (
          <div className="finishing-container">
            <div className="spinner-glow"></div>
            <h3 className="font-display" style={{ fontSize: '22px' }}>Analyzing Your Movie Taste</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
              Training the AI models and fetching real-time recommendations across your networks...
            </p>
          </div>
        ) : (
          <>
            {/* Step 1: Welcome Screen */}
            {step === 1 && (
              <>
                <div className="logo-display font-display text-glow">
                  <Play size={32} fill="var(--accent-primary)" color="var(--accent-primary)" />
                  <span>CINE<span style={{ color: 'var(--accent-primary)' }}>VERSE</span></span>
                </div>
                <h2 className="step-title" style={{ marginTop: '10px' }}>Find Your Next Favorite Film</h2>
                <p className="step-subtitle">
                  Discover customized movies and series recommendations across all your platforms in under 60 seconds.
                </p>

                <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setStep(2)}>
                  Get Started <ChevronRight size={18} />
                </button>

                <div className="divider">or connect with</div>

                <div className="auth-buttons">
                  <button className="btn-oauth" onClick={() => setStep(2)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  <button className="btn-oauth" onClick={() => setStep(2)}>
                    <Apple size={18} fill="currentColor" />
                    Continue with Apple
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Platform Connect */}
            {step === 2 && (
              <>
                <h3 className="step-title">Select Your Streaming Services</h3>
                <p className="step-subtitle">
                  We will prioritize recommending content available on your active subscriptions.
                </p>

                <div className="platform-grid">
                  {PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        className={`platform-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <div className="platform-info">
                          <span className="platform-logo">{platform.logo}</span>
                          <span style={{ fontWeight: '500' }}>{platform.name}</span>
                        </div>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isSelected ? 'var(--accent-primary)' : '#555',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isSelected ? 'var(--accent-primary)' : 'transparent'
                        }}>
                          {isSelected && <Check size={12} color="white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button className="btn-primary" onClick={() => setStep(3)} style={{ marginTop: '12px' }}>
                  Continue <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Step 3: Mood Onboarding */}
            {step === 3 && (
              <>
                <h3 className="step-title">How do you usually feel?</h3>
                <p className="step-subtitle">
                  Select the typical mood you seek when watching a movie or series.
                </p>

                <div className="mood-list">
                  {MOODS.map((m) => {
                    const isSelected = selectedMood === m.id;
                    return (
                      <button
                        key={m.id}
                        className={`mood-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedMood(m.id)}
                      >
                        <span className="mood-icon">{m.icon}</span>
                        <div className="mood-meta">
                          <h4>{m.name}</h4>
                          <p>{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn-primary"
                  disabled={!selectedMood}
                  onClick={() => setStep(4)}
                  style={{ marginTop: '12px' }}
                >
                  Continue <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Step 4: Genre Selection */}
            {step === 4 && (
              <>
                <h3 className="step-title">Choose Your Core Genres</h3>
                <p className="step-subtitle">
                  Select at least 3 genres that always capture your attention.
                </p>

                <div className="genre-grid">
                  {GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        className={`genre-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>

                <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedGenres.length < 3 
                    ? `${3 - selectedGenres.length} more genre(s) required` 
                    : `Perfect! ${selectedGenres.length} selected`}
                </div>

                <button
                  className="btn-primary"
                  disabled={selectedGenres.length < 3}
                  onClick={() => setStep(5)}
                  style={{ marginTop: '12px' }}
                >
                  Continue <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Step 5: Taste Seed */}
            {step === 5 && (
              <>
                <h3 className="step-title">Quick Taste Seed</h3>
                <p className="step-subtitle">
                  Swipe or tap to like or skip these titles. This aligns the recommendation model immediately.
                </p>

                <div className="seed-container">
                  <div className="seed-counter">
                    Movie {seedIndex + 1} of {seedMovies.length}
                  </div>

                  <div className="seed-movie-card">
                    <div
                      className="seed-poster"
                      style={{ backgroundImage: `url(${seedMovies[seedIndex].posterUrl})` }}
                    ></div>
                    <div className="seed-movie-info">
                      <div className="seed-movie-title">{seedMovies[seedIndex].title}</div>
                      <div className="seed-movie-meta">
                        {seedMovies[seedIndex].year} &bull; {seedMovies[seedIndex].genres.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="seed-actions">
                    <button className="btn-seed btn-skip" onClick={() => handleSeedAction(false)}>
                      Skip
                    </button>
                    <button className="btn-seed btn-like" onClick={() => handleSeedAction(true)}>
                      Like
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
