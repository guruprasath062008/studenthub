const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool = null;
let isFallback = false;

// Standalone fallback memory store
const memoryUsers = [
  {
    id: 1,
    name: 'System Administrator',
    email: 'admin@studenthub.local',
    password: bcrypt.hashSync('Admin@123', 10),
    role: 'admin',
    created_at: new Date()
  },
  {
    id: 2,
    name: 'Prof. Rajesh Sharma',
    email: 'faculty@studenthub.local',
    password: bcrypt.hashSync('Faculty@123', 10),
    role: 'faculty',
    created_at: new Date()
  }
];
let nextUserId = 3;

async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'rootpassword';
  const database = process.env.DB_NAME || 'studenthub_db';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  try {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000
    });

    const conn = await pool.getConnection();
    console.log(`[Auth Service DB] Successfully connected to MySQL at ${host}:${port}/${database}`);
    conn.release();
    isFallback = false;
  } catch (err) {
    console.warn(`[Auth Service DB] MySQL connection to ${host}:${port} unavailable: ${err.message}`);
    console.log('[Auth Service DB] Activating resilient in-memory storage mode for standalone testing.');
    isFallback = true;
  }
}

// Ensure DB is initialized on module load
initDB();

async function query(sql, params = []) {
  if (!isFallback && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('[Auth Service DB] MySQL Query Error:', err.message);
      throw err;
    }
  }

  // Fallback simulator for users table
  const normalized = sql.trim().toLowerCase();

  if (normalized.startsWith('select') && normalized.includes('from `users`') || normalized.includes('from users')) {
    if (normalized.includes('where `email` = ?') || normalized.includes('where email = ?')) {
      const email = params[0];
      const match = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      return match ? [match] : [];
    }
    if (normalized.includes('where `id` = ?') || normalized.includes('where id = ?')) {
      const id = parseInt(params[0], 10);
      const match = memoryUsers.find(u => u.id === id);
      return match ? [match] : [];
    }
    return memoryUsers;
  }

  if (normalized.startsWith('insert into `users`') || normalized.startsWith('insert into users')) {
    const [name, email, hashedPassword, role] = params;
    const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const error = new Error('ER_DUP_ENTRY: Duplicate entry for email');
      error.code = 'ER_DUP_ENTRY';
      throw error;
    }
    const newUser = {
      id: nextUserId++,
      name,
      email,
      password: hashedPassword,
      role: role || 'faculty',
      created_at: new Date()
    };
    memoryUsers.push(newUser);
    return { insertId: newUser.id, affectedRows: 1 };
  }

  return [];
}

module.exports = {
  query,
  initDB,
  isFallbackMode: () => isFallback
};
