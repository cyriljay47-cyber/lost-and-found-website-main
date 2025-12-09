const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lost_and_found',
    });

    // Hash the password 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Creating/updating admin user...');
    console.log('Username: admin');
    console.log('Password: admin123');

    // Try to update existing admin, or insert if not exists
    await conn.execute(
      `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)`,
      ['admin', 'admin@lostnfound.com', hashedPassword, 'admin']
    );

    console.log('✓ Admin user created/updated successfully');

    // Verify
    const [rows] = await conn.execute(
      'SELECT id, username, email, role FROM users WHERE username = ?',
      ['admin']
    );
    console.log('Admin user details:', rows);

    await conn.end();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

run();
