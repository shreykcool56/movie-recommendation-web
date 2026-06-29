import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use environment variable or fall back to defaults
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cineverse';

let dbPool = null;
let useMockDb = false;

// Mock database in-memory state
const mockDb = {
  users: [],
  refreshTokens: [],
  movies: [],
  syncStatus: [{ id: 1, status: 'idle', last_page: 0, processed_count: 0, total_count: 0, error_message: null, updated_at: new Date() }],
  syncLogs: [],
  transactions: []
};

// Try to initialize PostgreSQL Pool
try {
  dbPool = new Pool({
    connectionString,
    connectionTimeoutMillis: 2000 // fail fast if not running
  });
} catch (err) {
  console.warn('❌ PostgreSQL Connection Failed to Init. Falling back to Mock In-Memory Database.');
  useMockDb = true;
}

// Function to test if the database is reachable with a 2-second timeout
async function testPostgresConnection() {
  if (useMockDb || !dbPool) return false;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.warn('⚠️ PostgreSQL Connection test timed out after 2 seconds. Falling back to Mock DB.');
      resolve(false);
    }, 2000);

    dbPool.connect((err, client, release) => {
      clearTimeout(timer);
      if (err) {
        console.warn('⚠️ PostgreSQL Connection test failed. Error:', err.message);
        resolve(false);
      } else {
        release();
        resolve(true);
      }
    });
  });
}

// SQL query helper
export async function query(text, params = []) {
  if (useMockDb) {
    return mockQuery(text, params);
  }

  try {
    const result = await dbPool.query(text, params);
    return result;
  } catch (err) {
    console.error('❌ PostgreSQL Query Error:', err.message);
    if (err.code === 'ECONNREFUSED' || err.message.includes('connect')) {
      console.warn('⚠️ database connection lost. Falling back to Mock In-Memory Database for this request.');
      useMockDb = true;
      return mockQuery(text, params);
    }
    throw err;
  }
}

// Simulate standard queries for authentication and movie syncing
async function mockQuery(text, params) {
  // Normalize whitespace for parsing
  const cleanSql = text.replace(/\s+/g, ' ').trim();
  
  // 1. INSERT INTO users
  if (cleanSql.startsWith('INSERT INTO users')) {
    const email = params[0];
    const passwordHash = params[1];
    const verificationToken = params[2];
    // Note: is_verified = false is hardcoded in the SQL literal, NOT a $-param
    const name = params[3] || null;
    const otpExpiresAt = params[4] || null;
    
    // Check if user already exists
    const existing = mockDb.users.find(u => u.email === email);
    if (existing) {
      const err = new Error('duplicate key value violates unique constraint "users_email_key"');
      err.code = '23505';
      throw err;
    }
    
    const newUser = {
      id: mockDb.users.length + 1,
      email,
      password_hash: passwordHash,
      verification_token: verificationToken,
      is_verified: false,
      is_premium: false,
      name,
      otp_expires_at: otpExpiresAt,
      created_at: new Date()
    };
    mockDb.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }
  
  // 2. SELECT FROM users WHERE email
  if (cleanSql.includes('SELECT') && cleanSql.includes('FROM users') && cleanSql.includes('email =')) {
    const email = params[0];
    const user = mockDb.users.find(u => u.email === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 3. SELECT FROM users WHERE verification_token
  if (cleanSql.includes('SELECT') && cleanSql.includes('FROM users') && cleanSql.includes('verification_token =')) {
    const token = params[0];
    const user = mockDb.users.find(u => u.verification_token === token);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 4. UPDATE users (verification)
  if (cleanSql.startsWith('UPDATE users')) {
    // Pattern A: "UPDATE users SET is_verified = true, verification_token = null, otp_expires_at = null WHERE id = $1"
    // Used by verify-otp route — only $1 = user.id
    if (cleanSql.includes('is_verified = true') && cleanSql.includes('verification_token = null') && cleanSql.includes('otp_expires_at = null') && cleanSql.includes('WHERE id =')) {
      const id = params[0];
      const user = mockDb.users.find(u => u.id === parseInt(id));
      if (user) {
        user.is_verified = true;
        user.verification_token = null;
        user.otp_expires_at = null;
        return { rows: [user], rowCount: 1 };
      }
    }
    
    // Pattern B: "UPDATE users SET verification_token = $1, otp_expires_at = $2 WHERE id = $3"
    // Used by resend-otp route
    if (cleanSql.includes('verification_token = $') && cleanSql.includes('otp_expires_at = $') && cleanSql.includes('WHERE id =') && !cleanSql.includes('is_verified')) {
      const token = params[0];
      const expiresAt = params[1];
      const id = params[2];
      const user = mockDb.users.find(u => u.id === parseInt(id));
      if (user) {
        user.verification_token = token;
        user.otp_expires_at = expiresAt;
        return { rows: [user], rowCount: 1 };
      }
    }
    
    // Pattern C: "UPDATE users SET is_verified = true, verification_token = null WHERE verification_token = $1"
    // Used by legacy verify-email GET route
    if (cleanSql.includes('is_verified = true') && cleanSql.includes('WHERE verification_token =')) {
      const token = params[0];
      const user = mockDb.users.find(u => u.verification_token === token);
      if (user) {
        user.is_verified = true;
        user.verification_token = null;
        user.otp_expires_at = null;
        return { rows: [user], rowCount: 1 };
      }
    }
  }

  // 5. INSERT INTO refresh_tokens
  if (cleanSql.startsWith('INSERT INTO refresh_tokens')) {
    const userId = params[0];
    const tokenHash = params[1];
    const expiresAt = params[2];
    
    const newToken = {
      id: mockDb.refreshTokens.length + 1,
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      is_revoked: false,
      created_at: new Date()
    };
    mockDb.refreshTokens.push(newToken);
    return { rows: [newToken], rowCount: 1 };
  }

  // 6. SELECT FROM refresh_tokens WHERE token_hash
  if (cleanSql.includes('SELECT') && cleanSql.includes('FROM refresh_tokens') && cleanSql.includes('token_hash =')) {
    const hash = params[0];
    const rt = mockDb.refreshTokens.find(t => t.token_hash === hash);
    return { rows: rt ? [rt] : [], rowCount: rt ? 1 : 0 };
  }

  // 7. UPDATE refresh_tokens (revoke/use)
  if (cleanSql.startsWith('UPDATE refresh_tokens')) {
    if (cleanSql.includes('is_revoked = true') && cleanSql.includes('token_hash =')) {
      const hash = params[0];
      const rt = mockDb.refreshTokens.find(t => t.token_hash === hash);
      if (rt) {
        rt.is_revoked = true;
        return { rows: [rt], rowCount: 1 };
      }
    }
    if (cleanSql.includes('is_revoked = true') && cleanSql.includes('user_id =')) {
      const userId = params[0];
      mockDb.refreshTokens.forEach(t => {
        if (t.user_id === userId) t.is_revoked = true;
      });
      return { rows: [], rowCount: 1 };
    }
  }

  // 8. Movie Sync: SELECT FROM sync_status
  if (cleanSql.includes('SELECT') && cleanSql.includes('FROM sync_status')) {
    return { rows: mockDb.syncStatus, rowCount: mockDb.syncStatus.length };
  }

  // 9. Movie Sync: UPDATE sync_status
  if (cleanSql.startsWith('UPDATE sync_status')) {
    const s = mockDb.syncStatus[0];
    
    const statusMatch = cleanSql.match(/status\s*=\s*\$(\d+)/);
    if (statusMatch) s.status = params[parseInt(statusMatch[1]) - 1];
    
    const lastPageMatch = cleanSql.match(/last_page\s*=\s*\$(\d+)/);
    if (lastPageMatch) s.last_page = parseInt(params[parseInt(lastPageMatch[1]) - 1]);
    
    const processedMatch = cleanSql.match(/processed_count\s*=\s*\$(\d+)/);
    if (processedMatch) s.processed_count = parseInt(params[parseInt(processedMatch[1]) - 1]);
    
    const totalMatch = cleanSql.match(/total_count\s*=\s*\$(\d+)/);
    if (totalMatch) s.total_count = parseInt(params[parseInt(totalMatch[1]) - 1]);
    
    const errorMatch = cleanSql.match(/error_message\s*=\s*\$(\d+)/);
    if (errorMatch) s.error_message = params[parseInt(errorMatch[1]) - 1];
    
    const apiKeyMatch = cleanSql.match(/tmdb_api_key\s*=\s*\$(\d+)/);
    if (apiKeyMatch) s.tmdb_api_key = params[parseInt(apiKeyMatch[1]) - 1];
    
    s.updated_at = new Date();
    return { rows: [s], rowCount: 1 };
  }

  // 10. Movie Sync: INSERT INTO sync_logs
  if (cleanSql.startsWith('INSERT INTO sync_logs')) {
    const recordCount = params[0];
    const status = params[1];
    const details = params[2];
    const log = {
      id: mockDb.syncLogs.length + 1,
      timestamp: new Date(),
      record_count: recordCount,
      status,
      details
    };
    mockDb.syncLogs.push(log);
    return { rows: [log], rowCount: 1 };
  }

  // 11. Movie Sync: INSERT INTO movies ON CONFLICT
  if (cleanSql.startsWith('INSERT INTO movies')) {
    // Determine indices from parameter placeholders
    const id = params[0];
    const title = params[1];
    const type = params[2];
    const genres = params[3];
    const cast = params[4];
    const synopsis = params[5];
    const poster = params[6];
    const trailer = params[7];
    const ratings = params[8];
    const platforms = params[9];
    
    // New fields
    const backdrop_url = params[10];
    const year = params[11];
    const runtime = params[12];
    const languages = params[13];
    const rt_rating = params[14];
    const trailer_id = params[15];
    const cast_details = params[16];
    const industry = params[17];

    const movie = {
      id,
      title,
      type,
      genres,
      cast_members: cast,
      synopsis,
      poster_url: poster,
      trailer_url: trailer,
      ratings,
      platforms,
      backdrop_url,
      year: year ? parseInt(year) : null,
      runtime,
      languages,
      rt_rating,
      trailer_id,
      cast_details: typeof cast_details === 'string' ? JSON.parse(cast_details) : cast_details,
      industry,
      synced_at: new Date()
    };
    const index = mockDb.movies.findIndex(m => m.id === id);
    if (index >= 0) {
      mockDb.movies[index] = movie;
    } else {
      mockDb.movies.push(movie);
    }
    return { rows: [movie], rowCount: 1 };
  }

  // 12. Movie Sync: SELECT COUNT(*) FROM movies
  if (cleanSql.includes('COUNT') && cleanSql.includes('FROM movies')) {
    let movies = [...mockDb.movies];
    const typeMatch = cleanSql.match(/type\s*=\s*\$(\d+)/);
    const industryMatch = cleanSql.match(/industry\s*=\s*\$(\d+)/);
    
    if (typeMatch && params) {
      const idx = parseInt(typeMatch[1]) - 1;
      const typeFilter = params[idx];
      movies = movies.filter(m => m.type === typeFilter);
    }
    
    if (industryMatch && params) {
      const idx = parseInt(industryMatch[1]) - 1;
      const industryFilter = params[idx];
      movies = movies.filter(m => m.industry === industryFilter);
    }
    return { rows: [{ count: movies.length }], rowCount: 1 };
  }

  // 13. Movie Sync: SELECT FROM movies
  if (cleanSql.includes('SELECT') && cleanSql.includes('FROM movies')) {
    let movies = [...mockDb.movies];
    
    // Support filtering by type or industry or both
    const typeMatch = cleanSql.match(/type\s*=\s*\$(\d+)/);
    const industryMatch = cleanSql.match(/industry\s*=\s*\$(\d+)/);
    
    if (typeMatch && params) {
      const idx = parseInt(typeMatch[1]) - 1;
      const typeFilter = params[idx];
      movies = movies.filter(m => m.type === typeFilter);
    }
    
    if (industryMatch && params) {
      const idx = parseInt(industryMatch[1]) - 1;
      const industryFilter = params[idx];
      movies = movies.filter(m => m.industry === industryFilter);
    }
    
    // Sorting (Mock title alphabetical)
    movies.sort((a, b) => a.title.localeCompare(b.title));
    
    // Parse limit and offset from params
    let limit = 50;
    let offset = 0;
    
    if (params && params.length >= 2) {
      limit = params[params.length - 2];
      offset = params[params.length - 1];
    }
    
    const sliced = movies.slice(offset, offset + limit);
    return { rows: sliced, rowCount: sliced.length };
  }

  // 14. UPDATE users SET is_premium
  if (cleanSql.includes('UPDATE users SET is_premium') && cleanSql.includes('WHERE id =')) {
    let isPremium = false;
    let id = null;

    if (cleanSql.includes('is_premium = true')) {
      isPremium = true;
      id = parseInt(params[0]);
    } else if (cleanSql.includes('is_premium = false')) {
      isPremium = false;
      id = parseInt(params[0]);
    } else {
      isPremium = params[0] === true || params[0] === 'true';
      id = parseInt(params[1]);
    }

    const user = mockDb.users.find(u => u.id === id);
    if (user) {
      user.is_premium = isPremium;
      return { rows: [user], rowCount: 1 };
    }
  }

  // 15. INSERT INTO transactions
  if (cleanSql.startsWith('INSERT INTO transactions')) {
    const userId = params[0];
    const paymentId = params[1];
    const orderId = params[2];
    const method = params[3];
    const amount = params[4];
    const status = params[5];
    const utr = params[6];
    
    const newTx = {
      id: mockDb.transactions.length + 1,
      user_id: userId,
      payment_id: paymentId,
      order_id: orderId,
      method,
      amount,
      status,
      utr,
      created_at: new Date()
    };
    mockDb.transactions.push(newTx);
    return { rows: [newTx], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

// Database tables creation helper
export async function initializeDatabaseSchema() {
  const isConnected = await testPostgresConnection();
  if (!isConnected) {
    useMockDb = true;
    console.log('ℹ️ Running in Mock Database Mode. Skipping PG schema creation.');
    return;
  }

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      is_premium BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      name VARCHAR(255),
      otp_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      payment_id VARCHAR(255),
      order_id VARCHAR(255),
      method VARCHAR(50),
      amount NUMERIC(10, 2),
      status VARCHAR(50),
      utr VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      is_revoked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS movies (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50),
      genres TEXT[],
      cast_members TEXT[],
      synopsis TEXT,
      poster_url TEXT,
      trailer_url TEXT,
      ratings NUMERIC(3, 1),
      platforms JSONB,
      backdrop_url TEXT,
      year INT,
      runtime VARCHAR(50),
      languages TEXT[],
      rt_rating VARCHAR(50),
      trailer_id VARCHAR(100),
      cast_details JSONB,
      industry VARCHAR(50),
      synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sync_status (
      id INT PRIMARY KEY DEFAULT 1,
      status VARCHAR(50) DEFAULT 'idle',
      last_page INT DEFAULT 0,
      processed_count INT DEFAULT 0,
      total_count INT DEFAULT 0,
      error_message TEXT,
      tmdb_api_key VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO sync_status (id, status, last_page, processed_count, total_count)
    VALUES (1, 'idle', 0, 0, 0)
    ON CONFLICT (id) DO NOTHING;

    CREATE TABLE IF NOT EXISTS sync_logs (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      record_count INT NOT NULL,
      status VARCHAR(50) NOT NULL,
      details TEXT
    );
  `;

  try {
    await dbPool.query(schemaSql);
    console.log('✅ PostgreSQL Database Schema Initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Could not complete schema verification in PostgreSQL. Error:', err.message);
    console.warn('⚠️ Falling back to in-memory operations if PostgreSQL server becomes unresponsive.');
    useMockDb = true;
  }
}
