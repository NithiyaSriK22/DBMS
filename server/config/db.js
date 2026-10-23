const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Explicitly load root .env regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function resolveDialect() {
  const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
  const isProduction = process.env.NODE_ENV === 'production' || isVercel;
  const rawDialect = (process.env.DB_DIALECT || '').toLowerCase().trim();

  // If DB_DIALECT is explicitly specified
  if (rawDialect === 'mysql') {
    return 'mysql';
  }

  if (rawDialect === 'sqlite') {
    if (isVercel || isProduction) {
      throw new Error(
        'Configuration Error: DB_DIALECT is set to "sqlite", which is not supported in the Vercel serverless / production environment because the filesystem is read-only. Please set DB_DIALECT=mysql and configure your Aiven MySQL database connection.'
      );
    }
    return 'sqlite';
  }

  // If DB_DIALECT is omitted or empty:
  // In production, on Vercel, or when DB_HOST is present, always select MySQL
  if (isProduction || process.env.DB_HOST) {
    return 'mysql';
  }

  // Default to sqlite for local standalone development only
  return 'sqlite';
}

function resolveDialectSafe() {
  try {
    return resolveDialect();
  } catch (e) {
    return 'mysql';
  }
}

function resolveSslConfig() {
  let caContent = process.env.DB_SSL_CA;
  if (caContent && typeof caContent === 'string') {
    // Unescape literal '\n' characters if passed as an escaped single-line string
    caContent = caContent.replace(/\\n/g, '\n').trim();
  }

  let caFromFile = null;
  const caPath = process.env.DB_SSL_CA_PATH;
  if (caPath) {
    let resolvedPath = path.isAbsolute(caPath) ? caPath : path.resolve(process.cwd(), caPath);
    if (!fs.existsSync(resolvedPath)) {
      const rootPath = path.resolve(__dirname, '../../', caPath);
      if (fs.existsSync(rootPath)) {
        resolvedPath = rootPath;
      }
    }
    if (fs.existsSync(resolvedPath)) {
      caFromFile = fs.readFileSync(resolvedPath, 'utf8');
    } else {
      console.warn(`⚠️  Warning: DB_SSL_CA_PATH specified (${caPath}) but file was not found.`);
    }
  }

  // Automatic fallback to local ca.pem in workspace root if present and no CA provided in env
  if (!caContent && !caFromFile) {
    const defaultLocalCa = path.resolve(__dirname, '../../ca.pem');
    if (fs.existsSync(defaultLocalCa)) {
      try {
        caFromFile = fs.readFileSync(defaultLocalCa, 'utf8');
      } catch (e) {
        // ignore read error on optional fallback
      }
    }
  }

  const effectiveCa = caContent || caFromFile;

  // SSL is active if explicitly enabled via DB_SSL=true, if a CA certificate is provided, or for Aiven cloud hosts
  const isAivenHost = Boolean(process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com'));
  const isSslRequested = process.env.DB_SSL === 'true' || Boolean(effectiveCa) || isAivenHost;

  if (!isSslRequested) {
    return undefined;
  }

  const sslConfig = {};

  if (effectiveCa) {
    sslConfig.ca = effectiveCa;
    // Strict verification enabled by default unless explicitly disabled
    sslConfig.rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
  } else if (process.env.DB_SSL === 'true') {
    if (process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false') {
      sslConfig.rejectUnauthorized = false;
    } else {
      sslConfig.rejectUnauthorized = true;
    }
  } else {
    // For cloud hosts when DB_SSL was not explicitly set to 'true' and no CA is provided, allow default transport negotiation
    return undefined;
  }

  return sslConfig;
}

let dbInstance = null;

class DatabaseAdapter {
  constructor() {
    this.dialect = resolveDialectSafe();
    this.pool = null;
    this.sqliteDb = null;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      this.dialect = resolveDialect();

      if (this.dialect === 'mysql') {
        const requiredVars = [
          { name: 'DB_HOST', value: process.env.DB_HOST },
          { name: 'DB_USER', value: process.env.DB_USER },
          { name: 'DB_PASSWORD', value: process.env.DB_PASSWORD },
          { name: 'DB_NAME', value: process.env.DB_NAME },
        ];

        const missing = requiredVars.filter(v => !v.value).map(v => v.name);
        if (missing.length > 0) {
          const msg = `Missing required MySQL environment variable(s): ${missing.join(', ')}. Please configure these in your Vercel Project Settings (Settings > Environment Variables).`;
          console.error(`❌ FATAL: ${msg}`);
          throw new Error(msg);
        }

        try {
          const mysql = require('mysql2/promise');
          const sslConfig = resolveSslConfig();

          const poolConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '3306', 10),
            waitForConnections: true,
            connectionLimit: process.env.VERCEL === '1' ? 3 : 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000,
            connectTimeout: 10000,
          };

          if (sslConfig) {
            poolConfig.ssl = sslConfig;
          }

          this.pool = mysql.createPool(poolConfig);

          // Test connection
          const connection = await this.pool.getConnection();
          console.log(' Successfully connected to MySQL database: ' + process.env.DB_NAME);
          connection.release();
          return;
        } catch (err) {
          const safeErrorMessage = err.message || 'Unknown database connection failure';
          console.error('❌ FATAL: MySQL database connection failed:', safeErrorMessage);
          // Never fall back to SQLite in production, on Vercel, or when dialect is mysql
          throw new Error(`MySQL database connection failed: ${safeErrorMessage}. Verify that MySQL server is reachable and credentials/SSL settings are valid.`);
        }
      }

      // SQLite Relational Engine (Local Development Only)
      const Database = require('better-sqlite3');
      const dbFilePath = path.join(__dirname, '../../database/biodiversity.db');

      this.sqliteDb = new Database(dbFilePath, { verbose: null });
      // Enforce foreign key constraints
      this.sqliteDb.pragma('foreign_keys = ON');
      this.sqliteDb.pragma('journal_mode = WAL');

      console.log(` Relational SQL Engine initialized (SQLite with Foreign Keys ENFORCED): ${dbFilePath}`);

      // Auto-initialize schema and seeds if new
      this.ensureSchemaAndSeed();
    })();

    try {
      await this.initPromise;
    } catch (err) {
      this.initPromise = null;
      throw err;
    }
  }

  ensureSchemaAndSeed() {
    try {
      const tableCheck = this.sqliteDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Species'").get();
      if (!tableCheck) {
        console.log(' Initializing database tables and realistic seed data...');
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const seedPath = path.join(__dirname, '../../database/seed.sql');

        if (fs.existsSync(schemaPath)) {
          let schemaSql = fs.readFileSync(schemaPath, 'utf8');
          // Format for SQLite compatibility (convert AUTO_INCREMENT to standard SQLite syntax)
          schemaSql = schemaSql
            .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
            .replace(/DEFAULT \(CURRENT_DATE\)/gi, 'DEFAULT CURRENT_DATE');
          
          this.sqliteDb.exec(schemaSql);
        }

        if (fs.existsSync(seedPath)) {
          let seedSql = fs.readFileSync(seedPath, 'utf8');
          this.sqliteDb.exec(seedSql);
        }
        console.log(' Database schema created and 24+ species, habitats, observations, and users seeded!');
      }
    } catch (err) {
      console.error('Database initialization error:', err.message);
    }
  }

  async query(sql, params = []) {
    if (!this.pool && !this.sqliteDb) {
      await this.init();
    }

    if (this.dialect === 'mysql') {
      let adaptedSql = sql.trim();
      // SQLite to MySQL syntax adaptations
      adaptedSql = adaptedSql
        .replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT IGNORE INTO')
        .replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, 'REPLACE INTO')
        .replace(/strftime\s*\(\s*'%Y-%m'\s*,\s*([^)]+)\s*\)/gi, "DATE_FORMAT($1, '%Y-%m')");

      try {
        const [rows] = await this.pool.execute(adaptedSql, params);
        if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
          return {
            insertId: rows.insertId,
            affectedRows: rows.affectedRows,
          };
        }
        return rows;
      } catch (err) {
        if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST' || (err.message && err.message.includes('ECONNRESET'))) {
          const [rows] = await this.pool.execute(adaptedSql, params);
          if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
            return {
              insertId: rows.insertId,
              affectedRows: rows.affectedRows,
            };
          }
          return rows;
        }
        throw err;
      }
    } else {
      // Better-SQLite3
      const cleanSql = sql.trim();
      const isSelect = /^(SELECT|PRAGMA|WITH|EXPLAIN)/i.test(cleanSql);

      // Convert mysql specific syntax if any in query
      let adaptedSql = cleanSql;

      if (isSelect) {
        const stmt = this.sqliteDb.prepare(adaptedSql);
        return stmt.all(params);
      } else {
        const stmt = this.sqliteDb.prepare(adaptedSql);
        const info = stmt.run(params);
        return {
          insertId: info.lastInsertRowid,
          affectedRows: info.changes,
        };
      }
    }
  }

  async getOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }

  async resetDatabase() {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    if (this.dialect === 'sqlite') {
      this.sqliteDb.close();
      const dbFilePath = path.join(__dirname, '../../database/biodiversity.db');
      if (fs.existsSync(dbFilePath)) {
        fs.unlinkSync(dbFilePath);
      }
      return this.init();
    } else {
      // MySQL drop tables
      const tables = ['Conservation_Activity', 'Conservation_Program', 'Species_Observation', 'Species_Threat', 'Species_Habitat', 'Location', 'Threat', 'Researchers', 'Species', 'Habitat', 'Users'];
      for (const table of tables) {
        await this.query(`DROP TABLE IF EXISTS ${table};`);
      }
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await this.pool.query(schemaSql);
      await this.pool.query(seedSql);
    }
  }
}

const db = new DatabaseAdapter();
module.exports = db;
