const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lost_and_found',
    });

    const [rows] = await conn.execute('DESCRIBE users');
    console.table(rows);
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

run();
