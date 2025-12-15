const mysql = require('mysql2/promise');

async function checkItems() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lost_and_found',
  });

  try {
    const [rows] = await conn.execute('SELECT * FROM items WHERE status = ?', ['active']);
    console.log('Items found:', rows.length);
    console.log('Sample item:', rows[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

checkItems();
