import React, { useState } from 'react';
import { Plus, Trash2, Users, Flame, Star, Play, Check, Vote, ThumbsUp } from 'lucide-react';
import { MOCK_MOVIES, PLATFORMS } from '../mockData';

export default function WatchlistManager({
  watchlistIds,
  onToggleWatchlist,
  onSelectMovie
}) {
  const [activeTab, setActiveTab] = useState("all"); // all, movies, series, shared
  const [customLists, setCustomLists] = useState([
    { id: 'default', name: 'General Watchlist', items: watchlistIds },
    { id: 'date_night', name: 'Date Night Picks', items: [6, 14, 20] },
    { id: 'solo_rainy', name: 'Solo Rainy Days', items: [1, 2, 8] }
  ]);
  const [selectedListId, setSelectedListId] = useState('default');
  const [newListName, setNewListName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Shared / collaborative watchlist simulation state
  const [sharedList, setSharedList] = useState([
    { movieId: 3, votes: 4, addedBy: "Priya" },
    { movieId: 1, votes: 3, addedBy: "Arjun" },
    { movieId: 17, votes: 5, addedBy: "Riya" },
    { movieId: 13, votes: 2, addedBy: "Squad Bot" }
  ]);

  // Sync the default watchlist with global state
  const currentWatchlistIds = selectedListId === 'default' 
    ? watchlistIds 
    : customLists.find(l => l.id === selectedListId)?.items || [];

  const moviesInList = MOCK_MOVIES.filter((m) => currentWatchlistIds.includes(m.id));

  // Filter list by tab type
  const filteredMovies = moviesInList.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "movies") return m.type === "movie";
    if (activeTab === "series") return m.type === "series";
    return true;
  });

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newList = {
      id: `list_${Date.now()}`,
      name: newListName,
      items: []
    };
    setCustomLists([...customLists, newList]);
    setSelectedListId(newList.id);
    setNewListName("");
    setShowCreateForm(false);
  };

  const handleRemoveFromList = (movieId) => {
    if (selectedListId === 'default') {
      onToggleWatchlist(movieId);
    } else {
      setCustomLists(customLists.map(list => {
        if (list.id === selectedListId) {
          return { ...list, items: list.items.filter(id => id !== movieId) };
        }
        return list;
      }));
    }
  };

  const handleVote = (movieId) => {
    setSharedList(sharedList.map(item => {
      if (item.movieId === movieId) {
        return { ...item, votes: item.votes + 1 };
      }
      return item;
    }));
  };

  // Sort shared list by votes descending
  const sortedSharedList = [...sharedList].sort((a, b) => b.votes - a.votes);

  return (
    <div className="watchlist-screen">
      <style>{`
        .watchlist-screen {
          padding: 40px;
          min-height: 100vh;
        }
        .watchlist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .watchlist-select-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .watchlist-select {
          background: var(--bg-secondary);
          color: white;
          border: 1px solid var(--border-color);
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
        }
        .btn-create-list {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-secondary);
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
        }
        .btn-create-list:hover {
          background: var(--accent-primary);
        }

        .create-list-form {
          background: var(--card-surface);
          border: 1px solid var(--border-color);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
          animation: slide-down-form 0.3s ease;
        }
        @keyframes slide-down-form {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .create-list-input {
          flex: 1;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 10px 14px;
          color: white;
          font-size: 14px;
        }

        /* Tabs Navigation */
        .watchlist-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          gap: 24px;
          margin-bottom: 24px;
        }
        .watchlist-tab-btn {
          padding: 12px 4px;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 14px;
          position: relative;
          transition: var(--transition-smooth);
        }
        .watchlist-tab-btn:hover {
          color: var(--text-primary);
        }
        .watchlist-tab-btn.active {
          color: var(--accent-primary);
        }
        .watchlist-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--accent-primary);
        }

        /* Movie List Rows */
        .watchlist-item-row {
          display: flex;
          align-items: center;
          gap: 20px;
          background: var(--card-surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          position: relative;
          transition: var(--transition-smooth);
        }
        .watchlist-item-row:hover {
          border-color: var(--accent-primary);
          transform: translateX(4px);
        }
        .watchlist-thumbnail {
          width: 70px;
          height: 100px;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
          cursor: pointer;
        }
        .watchlist-row-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .watchlist-item-title {
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .watchlist-item-title:hover {
          color: var(--accent-primary);
        }
        .watchlist-item-meta {
          font-size: 12px;
          color: var(--text-secondary);
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .watchlist-availability {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 4px;
        }
        .mini-platform-badge {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .watchlist-row-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .btn-row-action {
          padding: 10px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
        }
        .btn-row-action:hover {
          background: var(--bg-primary);
          color: white;
        }
        .btn-row-delete:hover {
          background: rgba(233, 69, 96, 0.1);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        /* Shared Voting styles */
        .vote-count-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(233, 69, 96, 0.1);
          border: 1px solid var(--accent-primary);
          color: var(--accent-primary);
          font-weight: bold;
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 6px;
        }
        .shared-by-text {
          font-size: 11px;
          color: var(--accent-secondary);
          font-weight: bold;
          background: rgba(15, 52, 96, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }
        .glow-squad-pick {
          position: absolute;
          top: -10px;
          left: 16px;
          background: linear-gradient(90deg, #ffd700, #ffa500);
          color: black;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
        }

        @media (max-width: 600px) {
          .watchlist-screen {
            padding: 20px;
          }
          .watchlist-item-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .watchlist-row-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>

      <div className="watchlist-header">
        <h1 className="font-display" style={{ fontSize: '28px' }}>Your Content Library</h1>
        
        {activeTab !== "shared" && (
          <div className="watchlist-select-wrapper">
            <select
              className="watchlist-select"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
            >
              {customLists.map((list) => (
                <option key={list.id} value={list.id}>{list.name} ({selectedListId === list.id && list.id === 'default' ? watchlistIds.length : list.items.length})</option>
              ))}
            </select>
            <button className="btn-create-list" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus size={16} /> New List
            </button>
          </div>
        )}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateList} className="create-list-form">
          <input
            type="text"
            className="create-list-input"
            placeholder="E.g., Indie Gems with Dad, Spooky Nights..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-create-list">Create</button>
          <button
            type="button"
            className="btn-row-action"
            onClick={() => setShowCreateForm(false)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Watchlist Tabs */}
      <div className="watchlist-tabs">
        <button
          className={`watchlist-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={`watchlist-tab-btn ${activeTab === "movies" ? "active" : ""}`}
          onClick={() => setActiveTab("movies")}
        >
          Movies
        </button>
        <button
          className={`watchlist-tab-btn ${activeTab === "series" ? "active" : ""}`}
          onClick={() => setActiveTab("series")}
        >
          Series
        </button>
        <button
          className={`watchlist-tab-btn ${activeTab === "shared" ? "active" : ""}`}
          onClick={() => setActiveTab("shared")}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={14} /> Shared with Squad
        </button>
      </div>

      {/* List Display */}
      {activeTab === "shared" ? (
        // Collaborative Squad Watchlist Simulation
        <div>
          <div style={{ background: 'var(--card-surface)', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            ⚠️ <strong>Squad Collaborative List active:</strong> Votes determine the order. Highest voted title floats to the top as the <strong>Squad Pick</strong>! Invite links are synced in real-time.
          </div>

          {sortedSharedList.map((item, index) => {
            const movie = MOCK_MOVIES.find(m => m.id === item.movieId);
            if (!movie) return null;

            return (
              <div key={item.movieId} className="watchlist-item-row" style={{ borderLeft: index === 0 ? '4px solid #ffd700' : 'none' }}>
                {index === 0 && <span className="glow-squad-pick">👑 Squad Pick</span>}

                <div
                  className="watchlist-thumbnail"
                  style={{ backgroundImage: `url(${movie.posterUrl})` }}
                  onClick={() => onSelectMovie(movie)}
                ></div>

                <div className="watchlist-row-info">
                  <div className="watchlist-item-title" onClick={() => onSelectMovie(movie)}>{movie.title}</div>
                  <div className="watchlist-item-meta">
                    <span>{movie.year}</span>
                    <span className="shared-by-text">Added by {item.addedBy}</span>
                  </div>
                  <div className="watchlist-availability">
                    {movie.platforms.slice(0, 2).map((p) => (
                      <span key={p.id} className="mini-platform-badge">
                        {PLATFORMS.find(pl => pl.id === p.id)?.logo} {p.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="watchlist-row-actions">
                  <div className="vote-count-badge">
                    <ThumbsUp size={14} fill="var(--accent-primary)" />
                    <span>{item.votes} votes</span>
                  </div>
                  <button className="btn-row-action" onClick={() => handleVote(item.movieId)}>
                    <ThumbsUp size={16} /> Vote
                  </button>
                  <button
                    className="btn-row-action"
                    onClick={() => {
                      alert(`Directly opening ${movie.title} on ${movie.platforms[0]?.name}!`);
                    }}
                    style={{ background: 'white', color: 'black' }}
                  >
                    <Play size={16} fill="black" /> Watch
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Regular Watchlist View
        <div>
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="watchlist-item-row">
              <div
                className="watchlist-thumbnail"
                style={{ backgroundImage: `url(${movie.posterUrl})` }}
                onClick={() => onSelectMovie(movie)}
              ></div>

              <div className="watchlist-row-info">
                <div className="watchlist-item-title" onClick={() => onSelectMovie(movie)}>{movie.title}</div>
                <div className="watchlist-item-meta">
                  <span>{movie.year} &bull; {movie.runtime}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={11} fill="gold" color="gold" />
                    <span>{movie.cineverseRating}</span>
                  </div>
                </div>
                <div className="watchlist-availability">
                  {movie.platforms.map((p) => (
                    <span key={p.id} className="mini-platform-badge">
                      {PLATFORMS.find(pl => pl.id === p.id)?.logo} {p.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="watchlist-row-actions">
                <button
                  className="btn-row-action btn-row-delete"
                  onClick={() => handleRemoveFromList(movie.id)}
                  title="Remove from watchlist"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className="btn-row-action"
                  onClick={() => {
                    alert(`Opening deep link: redirecting to ${movie.platforms[0]?.name} for ${movie.title}...`);
                  }}
                  style={{ background: 'white', color: 'black' }}
                >
                  <Play size={16} fill="black" /> Watch Now
                </button>
              </div>
            </div>
          ))}

          {filteredMovies.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px' }}>
              No titles in this list yet. Start exploring and click "Add to Watchlist" on movies you like!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
