import React, { useState, useEffect } from 'react';
import { Search, Mic, SlidersHorizontal, Star, Play, X } from 'lucide-react';
import { MOCK_MOVIES, GENRES, PLATFORMS } from '../mockData';

export default function SearchDiscover({ onSelectMovie }) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedEra, setSelectedEra] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const trendingSearches = ["Interstellar", "Zendaya", "Anime", "Slow Burn", "Indie Thriller", "A24"];

  const languages = ["English", "Hindi", "Telugu", "Tamil", "Korean", "Japanese", "French"];

  // Filter movies based on inputs
  const filteredMovies = MOCK_MOVIES.filter((movie) => {
    // 1. Text Search matching title, synopsis, or cast
    const matchesQuery = query === "" || 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.synopsis.toLowerCase().includes(query.toLowerCase()) ||
      movie.genres.some(g => g.toLowerCase().includes(query.toLowerCase())) ||
      (movie.cast && movie.cast.some(c => c.name.toLowerCase().includes(query.toLowerCase())));

    // 2. Genre Filter
    const matchesGenre = selectedGenre === "all" || movie.genres.includes(selectedGenre);

    // 3. Platform Filter
    const matchesPlatform = selectedPlatform === "all" || movie.platforms.some(p => p.id === selectedPlatform);

    // 4. Era Filter
    let matchesEra = true;
    if (selectedEra !== "all") {
      if (selectedEra === "2020s") matchesEra = movie.year >= 2020;
      else if (selectedEra === "2010s") matchesEra = movie.year >= 2010 && movie.year < 2020;
      else if (selectedEra === "2000s") matchesEra = movie.year >= 2000 && movie.year < 2010;
      else if (selectedEra === "1990s") matchesEra = movie.year >= 1990 && movie.year < 2000;
    }

    // 5. Language Filter
    const matchesLanguage = selectedLanguage === "all" || movie.languages.includes(selectedLanguage);

    // 6. Rating Filter
    const matchesRating = movie.cineverseRating >= minRating;

    return matchesQuery && matchesGenre && matchesPlatform && matchesEra && matchesLanguage && matchesRating;
  });

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setQuery("Interstellar"); // Simulate voice recognition
    }, 1500);
  };

  const handleGenreChip = (genre) => {
    setSelectedGenre(genre);
    setShowFilters(true);
  };

  const handleDecadeChip = (decade) => {
    setSelectedEra(decade);
    setShowFilters(true);
  };

  return (
    <div className="search-discover-screen">
      <style>{`
        .search-discover-screen {
          padding: 40px;
          min-height: 100vh;
        }
        .search-header-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 30px;
        }
        .search-bar-wrapper {
          position: relative;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        .search-input {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 50px;
          padding: 16px 54px 16px 24px;
          font-size: 16px;
          color: white;
          transition: var(--transition-smooth);
        }
        .search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 15px rgba(233, 69, 96, 0.2);
        }
        .search-icon-left {
          position: absolute;
          right: 50px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          cursor: pointer;
        }
        .search-icon-left:hover {
          color: var(--accent-primary);
        }
        .mic-icon-right {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          cursor: pointer;
        }
        .mic-icon-right:hover {
          color: var(--accent-primary);
        }
        .mic-icon-right.listening {
          color: var(--accent-primary);
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          from { transform: translateY(-50%) scale(1); }
          to { transform: translateY(-50%) scale(1.2); }
        }

        /* Filter Controls */
        .filter-toggle-row {
          display: flex;
          justify-content: center;
          margin-top: 8px;
        }
        .btn-toggle-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 50px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        .btn-toggle-filters:hover, .btn-toggle-filters.active {
          color: white;
          border-color: var(--accent-primary);
          background: rgba(233, 69, 96, 0.05);
        }

        .filter-panel {
          max-width: 600px;
          margin: 10px auto 0;
          background: var(--card-surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          animation: expand-filter 0.3s ease;
        }
        @keyframes expand-filter {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .filter-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .filter-select {
          background: var(--bg-primary);
          color: white;
          border: 1px solid var(--border-color);
          padding: 10px;
          border-radius: 6px;
          font-size: 14px;
        }

        /* Discover default state */
        .discover-default-box {
          max-width: 700px;
          margin: 30px auto 0;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .chip-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .search-chip {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 13px;
          transition: var(--transition-smooth);
        }
        .search-chip:hover {
          border-color: var(--accent-primary);
          color: white;
          background: rgba(233, 69, 96, 0.04);
        }
        .grid-discover-genres {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }
        .genre-grid-card {
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--card-surface) 100%);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          transition: var(--transition-smooth);
        }
        .genre-grid-card:hover {
          border-color: var(--accent-primary);
          transform: scale(1.03);
          box-shadow: var(--shadow-premium);
        }

        /* Results grid */
        .results-container {
          margin-top: 20px;
        }
        .results-info {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        .result-item-card {
          background: var(--card-surface);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .result-item-card:hover {
          transform: translateY(-6px);
          border-color: var(--accent-primary);
        }
        .result-poster {
          height: 260px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .result-meta {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .result-title {
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .result-subtitle {
          font-size: 11px;
          color: var(--text-secondary);
          display: flex;
          justify-content: space-between;
        }

        @media (max-width: 600px) {
          .search-discover-screen {
            padding: 20px;
          }
          .filter-panel {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="search-header-box">
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder={isListening ? "Listening..." : "Search movies, series, cast, directors..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SlidersHorizontal
            size={18}
            className="search-icon-left"
            onClick={() => setShowFilters(!showFilters)}
          />
          <Mic
            size={18}
            className={`mic-icon-right ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceSearch}
          />
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <span className="filter-label">Genre</span>
              <select
                className="filter-select"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="all">All Genres</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Streaming Platform</span>
              <select
                className="filter-select"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                <option value="all">All Platforms</option>
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Era / Decade</span>
              <select
                className="filter-select"
                value={selectedEra}
                onChange={(e) => setSelectedEra(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="2020s">2020s (New Releases)</option>
                <option value="2010s">2010s</option>
                <option value="2000s">2000s</option>
                <option value="1990s">1990s</option>
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Language</span>
              <select
                className="filter-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="all">Any Language</option>
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="filter-group" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="filter-label">Min Rating (CineVerse)</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>⭐ {minRating === 0 ? 'Any' : `${minRating}+`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                style={{ accentColor: 'var(--accent-primary)', marginTop: '6px' }}
              />
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSelectedGenre("all");
                setSelectedPlatform("all");
                setSelectedEra("all");
                setSelectedLanguage("all");
                setMinRating(0);
                setQuery("");
              }}
              style={{
                gridColumn: 'span 2',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: '1px solid var(--border-color)',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Default Browse vs Active Search Grid */}
      {query === "" && !showFilters ? (
        <div className="discover-default-box">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Trending Searches</h3>
            <div className="chip-container">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  className="search-chip"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Browse by Genre</h3>
            <div className="grid-discover-genres">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  className="genre-grid-card"
                  onClick={() => handleGenreChip(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Explore by Decade</h3>
            <div className="chip-container">
              <button className="search-chip" onClick={() => handleDecadeChip("2020s")}>2020s Cinema</button>
              <button className="search-chip" onClick={() => handleDecadeChip("2010s")}>2010s Golden Era</button>
              <button className="search-chip" onClick={() => handleDecadeChip("2000s")}>2000s Nostalgia</button>
              <button className="search-chip" onClick={() => handleDecadeChip("1990s")}>90s Classics</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="results-container">
          <div className="results-info">
            Found {filteredMovies.length} title(s) matching your selections
          </div>
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="result-item-card"
                onClick={() => onSelectMovie(movie)}
              >
                <div
                  className="result-poster"
                  style={{ backgroundImage: `url(${movie.posterUrl})` }}
                ></div>
                <div className="result-meta">
                  <div className="result-title">{movie.title}</div>
                  <div className="result-subtitle">
                    <span>{movie.year}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={11} fill="gold" color="gold" />
                      <span>{movie.cineverseRating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredMovies.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              No matches found. Try broadening your filters or editing your search text.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
