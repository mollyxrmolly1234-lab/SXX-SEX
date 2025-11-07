const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
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
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database init error:', error);
  }
}

async function saveAuthState(phone, creds, keys) {
  try {
    await pool.query(
      `INSERT INTO sessions (phone_number, creds, keys, updated_at) 
       VALUES ($1, $2, $3, NOW()) 
       ON CONFLICT (phone_number) 
       DO UPDATE SET creds=$2, keys=$3, updated_at=NOW()`,
      [phone, JSON.stringify(creds), JSON.stringify(keys)]
    );
  } catch (error) {
    console.error('❌ Error saving auth state:', error);
  }
}

async function loadAuthState(phone) {
  try {
    const res = await pool.query(
      'SELECT creds, keys FROM sessions WHERE phone_number=$1', 
      [phone]
    );
    if (res.rows.length > 0) {
      return {
        creds: res.rows[0].creds,
        keys: res.rows[0].keys || {}
      };
    }
  } catch (error) {
    console.error('❌ Error loading auth state:', error);
  }
  return null;
}

async function deleteAuthState(phone) {
  try {
    await pool.query('DELETE FROM sessions WHERE phone_number=$1', [phone]);
    console.log(`🗑️ Deleted session for ${phone}`);
  } catch (error) {
    console.error('❌ Error deleting auth state:', error);
  }
}

async function getTotalUsers() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM sessions');
    return parseInt(res.rows[0].count);
  } catch (error) {
    console.error('❌ Error getting total users:', error);
    return 0;
  }
}

async function saveTotalUsers(count) {
  try {
    await pool.query(
      'UPDATE stats SET total_users=$1, updated_at=NOW() WHERE id=1', 
      [count]
    );
  } catch (error) {
    console.error('❌ Error saving total users:', error);
  }
}

async function loadTotalUsers() {
  try {
    const res = await pool.query('SELECT total_users FROM stats WHERE id=1');
    return res.rows[0]?.total_users || 0;
  } catch (error) {
    console.error('❌ Error loading total users:', error);
    return 0;
  }
}

async function sessionExists(phone) {
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
