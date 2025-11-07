const { Pool } = require('pg');

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.log('⚠️  Running without database - sessions will not persist');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database pool connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

async function initDB() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  Skipping database initialization (no DATABASE_URL)');
    return;
  }
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        phone_number VARCHAR(50) PRIMARY KEY,
        creds JSONB,
        keys JSONB,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stats (
        id INT PRIMARY KEY DEFAULT 1,
        total_users INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      INSERT INTO stats (id, total_users) 
      VALUES (1, 0) 
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

async function saveAuthState(phone, creds, keys) {
  if (!process.env.DATABASE_URL) return;
  
  try {
    await pool.query(
      `INSERT INTO sessions (phone_number, creds, keys, updated_at) 
       VALUES ($1, $2, $3, NOW()) 
       ON CONFLICT (phone_number) 
       DO UPDATE SET creds=$2, keys=$3, updated_at=NOW()`,
      [phone, JSON.stringify(creds), JSON.stringify(keys)]
    );
    console.log(`💾 Saved auth state for ${phone}`);
  } catch (error) {
    console.error('❌ Error saving auth state:', error.message);
  }
}

async function loadAuthState(phone) {
  if (!process.env.DATABASE_URL) return null;
  
  try {
    const res = await pool.query(
      'SELECT creds, keys FROM sessions WHERE phone_number=$1', 
      [phone]
    );
    if (res.rows.length > 0) {
      console.log(`📂 Loaded auth state for ${phone}`);
      return {
        creds: res.rows[0].creds,
        keys: res.rows[0].keys || {}
      };
    }
  } catch (error) {
    console.error('❌ Error loading auth state:', error.message);
  }
  return null;
}

async function deleteAuthState(phone) {
  if (!process.env.DATABASE_URL) return;
  
  try {
    await pool.query('DELETE FROM sessions WHERE phone_number=$1', [phone]);
    console.log(`🗑️ Deleted session for ${phone}`);
  } catch (error) {
    console.error('❌ Error deleting auth state:', error.message);
  }
}

async function getTotalUsers() {
  if (!process.env.DATABASE_URL) return 0;
  
  try {
    const res = await pool.query('SELECT COUNT(*) FROM sessions');
    return parseInt(res.rows[0].count);
  } catch (error) {
    console.error('❌ Error getting total users:', error.message);
    return 0;
  }
}

async function saveTotalUsers(count) {
  if (!process.env.DATABASE_URL) return;
  
  try {
    await pool.query(
      'UPDATE stats SET total_users=$1, updated_at=NOW() WHERE id=1', 
      [count]
    );
  } catch (error) {
    console.error('❌ Error saving total users:', error.message);
  }
}

async function loadTotalUsers() {
  if (!process.env.DATABASE_URL) return 0;
  
  try {
    const res = await pool.query('SELECT total_users FROM stats WHERE id=1');
    return res.rows[0]?.total_users || 0;
  } catch (error) {
    console.error('❌ Error loading total users:', error.message);
    return 0;
  }
}

async function sessionExists(phone) {
  if (!process.env.DATABASE_URL) return false;
  
  try {
    const res = await pool.query(
      'SELECT 1 FROM sessions WHERE phone_number=$1', 
      [phone]
    );
    return res.rows.length > 0;
  } catch (error) {
    return false;
  }
}

module.exports = { 
  initDB, 
  saveAuthState, 
  loadAuthState, 
  deleteAuthState,
  getTotalUsers, 
  saveTotalUsers, 
  loadTotalUsers,
  sessionExists,
  pool 
};
