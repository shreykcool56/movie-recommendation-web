import React, { useState } from 'react';
import { Play, X, Star, Heart, Check, ChevronDown, MessageSquare, Plus, CheckCircle2, Lock } from 'lucide-react';
import { MOCK_REVIEWS, MOCK_MOVIES, PLATFORMS } from '../mockData';
import { useSelector } from 'react-redux';

export default function MovieDetailSheet({
  movie,
  onClose,
  watchlistIds,
  onToggleWatchlist,
  watchedIds,
  onToggleWatched,
  onSelectMovie,
  subscribedPlatforms,
  onOpenUpgradeModal
}) {
  const { user } = useSelector(state => state.auth);
  const isPremium = user?.is_premium === true;

  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(10);
  const [reviews, setReviews] = useState(MOCK_REVIEWS[movie.id] || []);

  if (!movie) return null;

  const isSaved = watchlistIds.includes(movie.id);
  const isWatched = watchedIds.includes(movie.id);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const newRev = {
      user: "You (CineVerse Critic)",
      text: newReviewText,
      rating: parseFloat(newRating),
      likes: 0
    };

    setReviews([newRev, ...reviews]);
    setNewReviewText("");
  };

  // Get similar movies (matching some genres)
  const similarMovies = MOCK_MOVIES.filter(
    (m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g))
  ).slice(0, 4);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <style>{`
        .sheet-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1500;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .sheet-content {
          width: 100%;
          max-width: 800px;
          height: 85vh;
          background-color: var(--bg-secondary);
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          border: 1px solid var(--border-color);
          border-bottom: none;
          overflow-y: auto;
          position: relative;
          animation: slide-up 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .btn-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.5);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border: 1px solid var(--border-color);
          color: white;
        }
        .btn-close:hover {
          background: var(--accent-primary);
        }

        /* Premium Lock Screen Overlay styles */
        .premium-lock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 10, 15, 0.88);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }
        .premium-lock-content {
          max-width: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          animation: fade-in 0.3s ease;
        }
        .lock-icon-gold {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFD700;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
        }
        .premium-lock-title {
          font-size: 16px;
          font-weight: 800;
          color: #FFD700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .premium-lock-text {
          font-size: 12px;
          color: #aaa;
          line-height: 1.5;
        }
        .btn-unlock-premium-gold {
          background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
          color: #111;
          border: none;
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3);
          transition: all 0.2s;
        }
        .btn-unlock-premium-gold:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 15px rgba(255, 215, 0, 0.5);
        }

        /* Trailer/Backdrop Section */
        .backdrop-header {
          position: relative;
          height: 300px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .backdrop-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(13, 13, 13, 0.4) 0%, rgba(26, 26, 46, 1) 100%);
        }
        .play-trailer-btn {
          position: relative;
          z-index: 2;
          background: rgba(233, 69, 96, 0.9);
          color: white;
          padding: 14px 28px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: var(--shadow-glow);
        }
        .play-trailer-btn:hover {
          background: var(--accent-primary-hover);
          transform: scale(1.05);
        }
        .trailer-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          border: none;
        }

        /* Main Details */
        .movie-detail-body {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .title-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }
        .detail-title {
          font-size: 32px;
          font-weight: 700;
        }
        .detail-meta-pills {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 6px;
        }
        .badge-type {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .rating-badges {
          display: flex;
          gap: 12px;
        }
        .rating-item {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #111;
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }
        .rating-item span.rt-color { color: #f25f22; }
        .rating-item span.cv-color { color: var(--accent-primary); font-weight: bold; }

        /* Genres & Actions */
        .genres-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .genre-pill-small {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .actions-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .action-btn {
          flex: 1;
          min-width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-primary);
        }
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .action-btn.active-watch {
          border-color: var(--accent-primary);
          background: rgba(233, 69, 96, 0.1);
          color: var(--accent-primary);
        }
        .action-btn.active-watched {
          border-color: #4cd137;
          background: rgba(76, 209, 55, 0.1);
          color: #4cd137;
        }

        /* Synopsis */
        .synopsis-text {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 15px;
        }
        .btn-toggle-expand {
          color: var(--accent-primary);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 2px;
          margin-top: 4px;
        }

        /* Where to Watch */
        .providers-box {
          background: var(--card-surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
        }
        .provider-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .provider-item:last-child {
          border-bottom: none;
        }
        .provider-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .provider-badge {
          background: #4cd137;
          color: white;
          font-size: 9px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        /* Cast Section */
        .cast-strip {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .cast-card {
          flex: 0 0 100px;
          text-align: center;
        }
        .cast-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          margin: 0 auto 6px;
          border: 2px solid var(--border-color);
        }
        .cast-name {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cast-role {
          font-size: 9px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Reviews */
        .reviews-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .review-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 16px;
          border-radius: 10px;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .review-user {
          font-weight: 600;
        }
        .review-rating {
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: bold;
        }
        .review-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .review-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }
        .review-textarea {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px;
          color: white;
          font-size: 14px;
          resize: none;
          height: 80px;
        }
        .review-form-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rating-select {
          background: var(--bg-primary);
          color: white;
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
        }
        .btn-submit-review {
          background: var(--accent-secondary);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 13px;
        }
        .btn-submit-review:hover {
          background: var(--accent-primary);
        }

        /* Similar Movies */
        .similar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .similar-card {
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          background: var(--card-surface);
          border: 1px solid var(--border-color);
          transition: var(--transition-smooth);
        }
        .similar-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
        }
        .similar-poster {
          height: 140px;
          background-size: cover;
          background-position: center;
        }
        .similar-title {
          padding: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }

        @media (max-width: 600px) {
          .similar-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .title-meta-row {
            flex-direction: column;
            gap: 8px;
          }
          .detail-title {
            font-size: 26px;
          }
        }
      `}</style>

      <div className="sheet-content no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Video Overlay or Background Image */}
        <div className="backdrop-header" style={{ backgroundImage: `url(${movie.backdropUrl})` }}>
          {!isPremium ? (
            <div className="premium-lock-overlay">
              <div className="premium-lock-content">
                <div className="lock-icon-gold">
                  <Lock size={20} />
                </div>
                <h4 className="font-display premium-lock-title">Premium Content</h4>
                <p className="premium-lock-text">Unlock trailer previews & all movies in full HD with CineVerse Premium.</p>
                <button className="btn-unlock-premium-gold" onClick={onOpenUpgradeModal}>
                  Upgrade to Watch 👑
                </button>
              </div>
            </div>
          ) : isPlayingTrailer ? (
            <iframe
              className="trailer-iframe"
              src={`https://www.youtube.com/embed/${movie.trailerId}?autoplay=1`}
              title={`${movie.title} Trailer`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          ) : (
            <button className="play-trailer-btn" onClick={() => setIsPlayingTrailer(true)}>
              <Play size={18} fill="white" /> Play Trailer
            </button>
          )}
        </div>

        <div className="movie-detail-body">
          {/* Title & Metadata */}
          <div className="title-meta-row">
            <div>
              <span className="badge-type">{movie.type}</span>
              <h2 className="detail-title font-display">{movie.title}</h2>
              <div className="detail-meta-pills">
                <span>{movie.year}</span>
                <span>&bull;</span>
                <span>{movie.runtime}</span>
                <span>&bull;</span>
                <span>{movie.languages.join(', ')}</span>
              </div>
            </div>
            <div className="rating-badges">
              <div className="rating-item">
                <Star size={14} fill="gold" color="gold" />
                <span>{movie.imdbRating}</span>
              </div>
              <div className="rating-item">
                <span className="rt-color">🍅</span>
                <span>{movie.rtRating}</span>
              </div>
              <div className="rating-item">
                <span className="cv-color">C</span>
                <span>{movie.cineverseRating}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="actions-row">
            <button
              className={`action-btn ${isSaved ? 'active-watch' : ''}`}
              onClick={() => onToggleWatchlist(movie.id)}
            >
              {isSaved ? <Check size={16} /> : <Plus size={16} />}
              {isSaved ? 'Saved in Watchlist' : 'Add to Watchlist'}
            </button>
            <button
              className={`action-btn ${isWatched ? 'active-watched' : ''}`}
              onClick={() => onToggleWatched(movie.id)}
            >
              {isWatched ? <CheckCircle2 size={16} /> : <Check size={16} />}
              {isWatched ? 'Watched it' : 'Mark as Watched'}
            </button>
          </div>

          {/* Genres */}
          <div className="genres-row">
            {movie.genres.map((g) => (
              <span key={g} className="genre-pill-small">{g}</span>
            ))}
          </div>

          {/* Synopsis */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Synopsis</h3>
            <p className="synopsis-text">
              {isSynopsisExpanded ? movie.synopsis : `${movie.synopsis.slice(0, 160)}...`}
            </p>
            {movie.synopsis.length > 160 && (
              <button className="btn-toggle-expand" onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}>
                {isSynopsisExpanded ? 'Read Less' : 'Read More'}
                <ChevronDown size={14} style={{ transform: isSynopsisExpanded ? 'rotate(180deg)' : 'none' }} />
              </button>
            )}
          </div>

          {/* Where to Watch */}
          <div className="providers-box">
            <h3 style={{ fontSize: '18px', marginBottom: '14px' }}>Where to Watch</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {movie.platforms.map((plat) => {
                const isSubscribed = subscribedPlatforms.includes(plat.id);
                return (
                  <div key={plat.id} className="provider-item">
                    <div className="provider-meta">
                      <span style={{ fontSize: '20px' }}>
                        {PLATFORMS.find(p => p.id === plat.id)?.logo || '🎬'}
                      </span>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{plat.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{plat.price}</div>
                      </div>
                    </div>
                    {isSubscribed ? (
                      <span className="provider-badge">Subscribed</span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Not Subscribed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Cast</h3>
              <div className="cast-strip no-scrollbar">
                {movie.cast.map((c, i) => (
                  <div key={i} className="cast-card">
                    <div className="cast-avatar" style={{ backgroundImage: `url(${c.img})` }}></div>
                    <div className="cast-name">{c.name}</div>
                    <div className="cast-role">{c.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* You Might Also Like */}
          {similarMovies.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>You Might Also Like</h3>
              <div className="similar-grid">
                {similarMovies.map((similar) => (
                  <div
                    key={similar.id}
                    className="similar-card"
                    onClick={() => {
                      setIsPlayingTrailer(false);
                      onSelectMovie(similar);
                    }}
                  >
                    <div className="similar-poster" style={{ backgroundImage: `url(${similar.posterUrl})` }}></div>
                    <div className="similar-title">{similar.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="reviews-section">
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} /> Community Reviews ({reviews.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-header">
                    <span className="review-user">{r.user}</span>
                    <span className="review-rating">⭐ {r.rating}/10</span>
                  </div>
                  <p className="review-text">{r.text}</p>
                </div>
              ))}
            </div>

            {/* Write a Review */}
            <form onSubmit={handleAddReview} className="review-form">
              <textarea
                className="review-textarea"
                placeholder="Share your thoughts... (Support spoiler tags by typing [SPOILER] text [/SPOILER])"
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
              />
              <div className="review-form-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Your Rating:</span>
                  <select
                    className="rating-select"
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n}/10</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-submit-review">
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
