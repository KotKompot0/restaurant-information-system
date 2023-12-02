const mysql = require('mysql2/promise');
require('dotenv').config()

async function query(sql, params) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  });
  const [results, ] = await connection.execute(sql, params);

  return results;
}

module.exports = {
  query
}
