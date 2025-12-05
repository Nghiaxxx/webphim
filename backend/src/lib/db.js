const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'webphim',
  port: process.env.DB_PORT || 3306,
  // SSL configuration (required for Aiven, PlanetScale and some cloud databases)
  // For Aiven, we need to accept self-signed certificates
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false  // Accept self-signed certificates (Aiven uses self-signed)
  } : undefined,
  waitForConnections: true,
  connectionLimit: 50,        // Tăng từ 10 → 50 connections
  queueLimit: 0,
  enableKeepAlive: true,      // Keep connections alive
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,      // 10s timeout
  // Additional security
  multipleStatements: false   // Prevent SQL injection via multiple statements
});

module.exports = pool;


