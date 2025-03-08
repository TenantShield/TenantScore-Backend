const { Pool } = require('pg');

// Define the database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PSSWD}.pshjejcgsobhljpulloj.supabase.co:5432/postgres`,
  ssl: {
    rejectUnauthorized: false // Required for Supabase and some cloud DBs
  }
});

// Export query function for easy database access
module.exports = {
  query: (text, params) => pool.query(text, params),
};
