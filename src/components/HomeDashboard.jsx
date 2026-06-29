import React, { useState } from 'react';
import { Play, Plus, Check, Star, Sparkles, Flame, Tv, Compass, ShieldAlert, Heart } from 'lucide-react';
import { MOCK_MOVIES, MOODS, PLATFORMS } from '../mockData';

export default function HomeDashboard({
  userPreferences,
  watchlistIds,
  onToggleWatchlist,
  onSelectMovie
}) {
  const [activeMood, setActiveMood] = useState(userPreferences.mood || 'mind_bending');

  // Featured Movie: Dune Part Two (ID 4) or fallback to first item
  const featuredMovie = MOCK_MOVIES.find((m) => m.title === "Dune: Part Two") || MOCK_MOVIES[0];

  // Organize movie collections by industry/type
  const bollywoodMovies = MOCK_MOVIES.filter(m => m.industry === 'bollywood');
  const hollywoodMovies = MOCK_MOVIES.filter(m => m.industry === 'hollywood');
  const tollywoodMovies = MOCK_MOVIES.filter(m => m.industry === 'tollywood');
  const webseriesMovies = MOCK_MOVIES.filter(m => m.type === 'series');
  
  // Trending movies (highest CineVerse ratings)
  const trendingMovies = [...MOCK_MOVIES]
    .sort((a, b) => b.cineverseRating - a.cineverseRating)
    .slice(0, 10);

  // Recommendations for You based on genres in onboarding
  const onboardingGenres = userPreferences.genres || [];
  const forYouMovies = MOCK_MOVIES.filter((m) => 
    m.genres.some((g) => onboardingGenres.includes(g))
  );
  const recommendationsForYou = forYouMovies.length > 0 ? forYouMovies : MOCK_MOVIES.slice(0, 10);

  // Filter movies matching the active mood
  const moodMatchedMovies = MOCK_MOVIES.filter((m) => m.moods && m.moods.includes(activeMood));

  // My watch list
  const myWatchlist = MOCK_MOVIES.filter(m => watchlistIds.includes(m.id));

  const isFeaturedSaved = watchlistIds.includes(featuredMovie.id);

  return (
    <div className="home-dashboard">
      <style>{`
        .home-dashboard {
          padding-bottom: 60px;
          background-color: #141414; /* Netflix background */
          color: #fff;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        /* Netflix Hero Banner */
        .hero-banner {
          height: 80vh;
          position: relative;
          background-size: cover;
          background-position: center 15%;
          display: flex;
          align-items: flex-end;
          padding: 60px;
          margin-bottom: 20px;
        }
        .hero-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.4) 60%, rgba(20, 20, 20, 1) 100%);
          z-index: 1;
        }
        .hero-banner::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(20, 20, 20, 0.9) 0%, rgba(20, 20, 20, 0) 50%);
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 650px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .hero-badge {
          background: #E50914; /* Netflix Red */
          color: white;
          width: fit-content;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          box-shadow: 0 0 10px rgba(229, 9, 20, 0.5);
        }
        .hero-title {
          font-size: 56px;
          font-weight: 900;
          line-height: 1.05;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          letter-spacing: -1px;
        }
        .hero-meta {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 15px;
          color: #a3a3a3;
          font-weight: bold;
        }
        .hero-desc {
          font-size: 16px;
          color: #e5e5e5;
          line-height: 1.45;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          margin-top: 10px;
        }
        .btn-hero-play {
          background-color: white;
          color: black;
          padding: 12px 28px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background-color 0.2s;
        }
        .btn-hero-play:hover {
          background-color: rgba(255, 255, 255, 0.75);
          transform: none;
          box-shadow: none;
        }
        .btn-hero-watch {
          background-color: rgba(109, 109, 110, 0.7);
          color: white;
          padding: 12px 28px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background-color 0.2s;
        }
        .btn-hero-watch:hover {
          background-color: rgba(109, 109, 110, 0.4);
        }

        /* Movie Row / Carousel */
        .movie-carousel-container {
          padding: 0 60px;
          margin-bottom: 40px;
          position: relative;
        }
        .row-heading {
          font-size: 22px;
          font-weight: bold;
          color: #e5e5e5;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s;
        }
        .row-heading:hover {
          color: #fff;
        }
        .carousel-track {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 10px 0 20px 0;
          scroll-snap-type: x mandatory;
        }
        .carousel-card {
          flex: 0 0 200px;
          scroll-snap-align: start;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-radius: 4px;
          overflow: hidden;
        }
        .carousel-card:hover {
          transform: scale(1.08);
          z-index: 10;
        }
        .carousel-poster {
          height: 280px;
          border-radius: 4px;
          background-size: cover;
          background-position: center;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .card-glow-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(0,0,0,0.9) 100%);
          opacity: 1;
        }
        .match-score {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #E50914;
          padding: 4px 8px;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 800;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }
        .carousel-card-title {
          font-size: 14px;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #e5e5e5;
          padding: 0 2px;
        }
        .carousel-card-meta {
          font-size: 12px;
          color: #a3a3a3;
          display: flex;
          justify-content: space-between;
          padding: 0 2px;
          align-items: center;
        }
        .card-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #4cd137;
          font-weight: bold;
        }

        /* Mood Selection Bar */
        .mood-selector-container {
          padding: 0 60px;
          margin-bottom: 25px;
        }
        .mood-pills-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 10px;
        }
        .mood-pill-tab {
          flex: 0 0 auto;
          background: #2f2f2f;
          border: 1px solid #404040;
          color: #ccc;
          padding: 8px 18px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s, color 0.2s;
        }
        .mood-pill-tab:hover {
          background: #404040;
          color: #fff;
        }
        .mood-pill-tab.active {
          background-color: #E50914;
          border-color: #E50914;
          color: white;
          box-shadow: 0 2px 8px rgba(229, 9, 20, 0.4);
        }

        @media (max-width: 768px) {
          .hero-banner {
            height: 60vh;
            padding: 30px;
          }
          .hero-title {
            font-size: 36px;
          }
          .mood-selector-container, .movie-carousel-container {
            padding: 0 24px;
          }
          .carousel-card {
            flex: 0 0 140px;
          }
          .carousel-poster {
            height: 200px;
          }
        }
      `}</style>

      {/* Featured Netflix Banner */}
      <div
        className="hero-banner"
        style={{ backgroundImage: `url(${featuredMovie.backdropUrl})` }}
      >
        <div className="hero-content">
          <div className="hero-badge">Popular on CineVerse</div>
          <h1 className="hero-title">{featuredMovie.title}</h1>
          <div className="hero-meta">
            <span style={{ color: '#4cd137' }}>{featuredMovie.rtRating || '95%'} Match</span>
            <span>{featuredMovie.year}</span>
            <span style={{ border: '1px solid #808080', padding: '1px 5px', fontSize: '11px', borderRadius: '3px' }}>U/A 16+</span>
            <span>{featuredMovie.runtime}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="gold" color="gold" />
              <span style={{ color: 'white', fontWeight: 'bold' }}>{featuredMovie.imdbRating}</span>
            </div>
          </div>
          <p className="hero-desc">{featuredMovie.synopsis}</p>
          <div className="hero-actions">
            <button className="btn-hero-play" onClick={() => onSelectMovie(featuredMovie)}>
              <Play size={18} fill="black" /> Info & Play
            </button>
            <button
              className="btn-hero-watch"
              onClick={() => onToggleWatchlist(featuredMovie.id)}
            >
              {isFeaturedSaved ? <Check size={18} /> : <Plus size={18} />}
              {isFeaturedSaved ? 'My List' : 'My List'}
            </button>
          </div>
        </div>
      </div>

      {/* 1. My List Carousel (if elements present) */}
      {myWatchlist.length > 0 && (
        <div className="movie-carousel-container">
          <h2 className="row-heading">
            <Check size={20} color="#E50914" /> My List
          </h2>
          <div className="carousel-track no-scrollbar">
            {myWatchlist.map((movie) => (
              <div key={movie.id} className="carousel-card" onClick={() => onSelectMovie(movie)}>
                <div className="carousel-poster" style={{ backgroundImage: `url(${movie.posterUrl})` }}>
                  <div className="card-glow-overlay"></div>
                </div>
                <div className="carousel-card-title">{movie.title}</div>
                <div className="carousel-card-meta">
                  <span>{movie.year}</span>
                  <div className="card-rating">
                    <Star size={12} fill="#4cd137" color="#4cd137" />
                    <span>{movie.cineverseRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Bollywood Hits Row */}
      {bollywoodMovies.length > 0 && (
        <div className="movie-carousel-container">
          <h2 className="row-heading">
            Bollywood Blockbusters
          </h2>
          <div className="carousel-track no-scrollbar">
            {bollywoodMovies.map((movie) => (
              <div key={movie.id} className="carousel-card" onClick={() => onSelectMovie(movie)}>
                <div className="carousel-poster" style={{ backgroundImage: `url(${movie.posterUrl})` }}>
                  <div className="card-glow-overlay"></div>
                  <div className="match-score">{movie.rtRating}</div>
                </div>
                <div className="carousel-card-title">{movie.title}</div>
                <div className="carousel-card-meta">
                  <span>{movie.year}</span>
                  <div className="card-rating">
                    <Star size={12} fill="#4cd137" color="#4cd137" />
                    <span>{movie.cineverseRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Hollywood blockbusters Row */}
      {hollywoodMovies.length > 0 && (
        <div className="movie-carousel-container">
          <h2 className="row-heading">
            Hollywood Blockbusters
          </h2>
          <div className="carousel-track no-scrollbar">
            {hollywoodMovies.map((movie) => (
              <div key={movie.id} className="carousel-card" onClick={() => onSelectMovie(movie)}>
                <div className="carousel-poster" style={{ backgroundImage: `url(${movie.posterUrl})` }}>
                  <div className="card-glow-overlay"></div>
                  <div className="match-score">{movie.rtRating}</div>
                </div>
                <div className="carousel-card-title">{movie.title}</div>
                <div className="carousel-card-meta">
                  <span>{movie.year}</span>
                  <div className="card-rating">
                    <Star size={12} fill="#4cd137" color="#4cd137" />
                    <span>{movie.cineverseRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Tollywood Row */}
      {tollywoodMovies.length > 0 && (
        <div className="movie-carousel-container">
          <h2 className="row-heading">
            Tollywood Action & Drama
          </h2>
          <div className="carousel-track no-scrollbar">
            {tollywoodMovies.map((movie) => (
              <div key={movie.id} className="carousel-card" onClick={() => onSelectMovie(movie)}>
                <div className="carousel-poster" style={{ backgroundImage: `url(${movie.posterUrl})` }}>
                  <div className="card-glow-overlay"></div>
                  <div className="match-score">{movie.rtRating}</div>
                </div>
                <div className="carousel-card-title">{movie.title}</div>
                <div className="carousel-card-meta">
                  <span>{movie.year}</span>
                  <div className="card-rating">
                    <Star size={12} fill="#4cd137" color="#4cd137" />
                    <span>{movie.cineverseRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Webseries Row */}
      {webseriesMovies.length > 0 && (
        <div className="movie-carousel-container">
          <h2 className="row-heading">
            Binge-worthy Webseries
          </h2>
          <div className="carousel-track no-scrollbar">
            {webseriesMovies.map((movie) => (
              <div key={movie.id} className="carousel-card" onClick={() => onSelectMovie(movie)}>
                <div className="carousel-poster" style={{ backgroundImage: `url(${movie.posterUrl})` }}>
                  <div className="card-glow-overlay"></div>
                  <div className="match-score">{movie.rtRating}</div>
                </div>
                <div className="carousel-card-title">{movie.title}</div>
                <div className="carousel-card-meta">
                  <span>{movie.year}</span>
                  <div className="card-rating">
                    <Star size={12} fill="#4cd137" color="#4cd137" />
                    <span>{movie.cineverseRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Mood Selector Bar */}
      <div className="mood-selector-container">
        <h2 className="row-heading" style={{ fontSize: '20px' }}>
          <Sparkles size={20} color="#E50914" /> How are you feeling today?
        </h2>
        <div className="mood-pills-row no-scrollbar">
          {MOODS.map((m) => (
            <button
              key={m.id}
              className={`mood-pill-tab ${activeMood === m.id ? 'active' : ''}`}
              onClick={() => setActiveMood(m.id)}
            >
              <span>{m.icon}</span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Mood Pick Carousel (Dynamically Loaded based on Active Mood) */}
      {moodMatchedMovies.length > 0 && (
        <div className="movie-carousel-container">
          <h2 className="row-heading" style={{ fontSize: '18px' }}>
            <span>{MOODS.find(m => m.id === activeMood)?.icon || '🍿'}</span>
            <span>Mood Pick: {MOODS.find(m => m.id === activeMood)?.name}</span>
          </h2>
          <div className="carousel-track no-scrollbar">
            {moodMatchedMovies.map((movie) => (
              <div key={movie.id} className="carousel-card" onClick={() => onSelectMovie(movie)}>
                <div className="carousel-poster" style={{ backgroundImage: `url(${movie.posterUrl})` }}>
                  <div className="card-glow-overlay"></div>
                  <div className="match-score">94% Match</div>
                </div>
                <div className="carousel-card-title">{movie.title}</div>
                <div className="carousel-card-meta">
                  <span>{movie.year}</span>
                  <div className="card-rating">
                    <Star size={12} fill="#4cd137" color="#4cd137" />
                    <span>{movie.cineverseRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Trending Row */}
      <div className="movie-carousel-container">
        <h2 className="row-heading">
          <Flame size={20} color="#E50914" /> Trending Now
        </h2>
        <div className="carousel-track no-scrollbar">
          {trendingMovies.map((movie) => (
            <div key={movie.id} className="carousel-card" onClick={() => onSelectMovie(movie)}>
              <div className="carousel-poster" style={{ backgroundImage: `url(${movie.posterUrl})` }}>
                <div className="card-glow-overlay"></div>
                <div className="match-score" style={{ backgroundColor: '#e67e22' }}>Hot #{trendingMovies.indexOf(movie) + 1}</div>
              </div>
              <div className="carousel-card-title">{movie.title}</div>
              <div className="carousel-card-meta">
                <span>{movie.year}</span>
                <div className="card-rating">
                  <Star size={12} fill="#4cd137" color="#4cd137" />
                  <span>{movie.cineverseRating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
