const { Pool } = require('pg');
require('dotenv').config({ override: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render') ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  console.log('Attempting to connect and query...');
  try {
    const res = await pool.query('SELECT 1 as result');
    console.log('Success:', res.rows[0]);
  } catch (err) {
    console.error('Error Object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    if (err.code) console.error('Error Code:', err.code);
  } finally {
    await pool.end();
  }
}

testConnection();
