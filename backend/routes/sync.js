import express from 'express';
import { query } from '../db/db.js';
import { runMovieSync, interruptRunningSync } from '../services/movieSyncService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. POST /sync/start - Trigger sync (authenticated)
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const statusResult = await query('SELECT status FROM sync_status WHERE id = 1');
    const status = statusResult.rows[0]?.status;

    if (status === 'running') {
      return res.status(400).json({ error: 'Sync is already running' });
    }

    // Run sync in the background so HTTP call returns immediately
    runMovieSync();

    res.status(202).json({ message: 'Movie sync process started in the background.' });
  } catch (err) {
    console.error('❌ Error triggering sync:', err);
    res.status(500).json({ error: 'Failed to start movie sync.' });
  }
});

// 2. POST /sync/stop - Interrupt sync (authenticated)
router.post('/stop', authenticateToken, (req, res) => {
  interruptRunningSync();
  res.status(200).json({ message: 'Interruption command sent.' });
});

// 2.5 POST /sync/config - Configure TMDB API key (authenticated)
router.post('/config', authenticateToken, async (req, res) => {
  const { apiKey } = req.body;
  try {
    const keyToSave = apiKey && apiKey.trim() ? apiKey.trim() : null;
    await query('UPDATE sync_status SET tmdb_api_key = $1 WHERE id = 1', [keyToSave]);
    res.status(200).json({ message: 'TMDB API key updated successfully.' });
  } catch (err) {
    console.error('❌ Error configuring API key:', err);
    res.status(500).json({ error: 'Failed to update TMDB API key.' });
  }
});

// 2.6 GET /sync/config - Retrieve TMDB API key status (authenticated)
router.get('/config', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT tmdb_api_key FROM sync_status WHERE id = 1');
    const apiKey = result.rows[0]?.tmdb_api_key;
    if (apiKey) {
      const masked = apiKey.length > 8 
        ? `${apiKey.slice(0, 4)}••••••••${apiKey.slice(-4)}` 
        : '••••••••';
      return res.status(200).json({ hasApiKey: true, maskedApiKey: masked });
    }
    res.status(200).json({ hasApiKey: false, maskedApiKey: null });
  } catch (err) {
    console.error('❌ Error fetching API key config:', err);
    res.status(500).json({ error: 'Failed to retrieve API key configuration.' });
  }
});

// 3. GET /sync/status - Fetch current state and latest logs
router.get('/status', async (req, res) => {
  try {
    const statusResult = await query('SELECT * FROM sync_status WHERE id = 1');
    const logsResult = await query('SELECT * FROM sync_logs ORDER BY timestamp DESC LIMIT 10');
    
    const rawStatus = statusResult.rows[0] || { status: 'idle', last_page: 0, processed_count: 0 };
    const status = { ...rawStatus };
    delete status.tmdb_api_key;
    status.hasApiKey = !!rawStatus.tmdb_api_key;

    res.status(200).json({
      status,
      logs: logsResult.rows
    });
  } catch (err) {
    console.error('❌ Error fetching sync status:', err);
    res.status(500).json({ error: 'Failed to retrieve sync status.' });
  }
});

// 4. GET /movies - Retrieve list of synced movies/series (supports pagination and basic filters)
router.get('/movies', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const type = req.query.type; // 'movie' or 'series'
  const industry = req.query.industry; // 'bollywood', 'hollywood', 'tollywood', 'webseries'
  
  try {
    let queryText = 'SELECT * FROM movies WHERE 1=1';
    const params = [];
    
    if (type) {
      queryText += ` AND type = $${params.length + 1}`;
      params.push(type);
    }
    
    if (industry) {
      queryText += ` AND industry = $${params.length + 1}`;
      params.push(industry);
    }
    
    queryText += ` ORDER BY title ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);

    // Count query
    let countQueryText = 'SELECT COUNT(*) FROM movies WHERE 1=1';
    const countParams = [];
    if (type) {
      countQueryText += ` AND type = $${countParams.length + 1}`;
      countParams.push(type);
    }
    if (industry) {
      countQueryText += ` AND industry = $${countParams.length + 1}`;
      countParams.push(industry);
    }

    const countResult = await query(countQueryText, countParams);
    
    res.status(200).json({
      movies: result.rows,
      totalCount: parseInt(countResult.rows[0]?.count || result.rows.length)
    });
  } catch (err) {
    console.error('❌ Error retrieving movies:', err);
    res.status(500).json({ error: 'Failed to retrieve movies list.' });
  }
});

export default router;
