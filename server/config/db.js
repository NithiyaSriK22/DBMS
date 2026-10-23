const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Explicitly load root .env regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let dbInstance = null;

class DatabaseAdapter {
  constructor() {
    this.dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase().trim();
    this.pool = null;
    this.sqliteDb = null;
  }

  async init() {
    // Re-read dialect dynamically at initialization time
    this.dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase().trim();

    if (this.dialect === 'mysql') {
      try {
        const mysql = require('mysql2/promise');

        // Configure SSL for secure cloud MySQL connections (e.g. Aiven)
        let sslConfig = undefined;
        if (process.env.DB_SSL === 'true') {
          sslConfig = {};

          const caPath = process.env.DB_SSL_CA_PATH;
          const caContent = process.env.DB_SSL_CA;

          if (caPath) {
            let resolvedPath = path.isAbsolute(caPath) ? caPath : path.resolve(process.cwd(), caPath);
            if (!fs.existsSync(resolvedPath)) {
              const rootPath = path.resolve(__dirname, '../../', caPath);
              if (fs.existsSync(rootPath)) {
                resolvedPath = rootPath;
              }
            }

            if (fs.existsSync(resolvedPath)) {
              sslConfig.ca = fs.readFileSync(resolvedPath, 'utf8');
            } else {
              console.warn(`⚠️  Warning: DB_SSL_CA_PATH specified (${caPath}) but file was not found.`);
            }
          }
          if (!sslConfig.ca && caContent) {
            sslConfig.ca = caContent;
          }

          // Prefer certificate verification by default unless explicitly disabled
          sslConfig.rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
        }

        const poolConfig = {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'biodiversity_db',
          port: parseInt(process.env.DB_PORT || '3306'),
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 10000,
        };

        if (sslConfig) {
          poolConfig.ssl = sslConfig;
        }

        this.pool = mysql.createPool(poolConfig);

        // Test connection
        const connection = await this.pool.getConnection();
        console.log(' Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'biodiversity_db'));
        connection.release();
        return;
      } catch (err) {
        const isMysqlExplicit = (process.env.DB_DIALECT || '').toLowerCase().trim() === 'mysql';
        if (process.env.NODE_ENV === 'production' || process.env.REQUIRE_MYSQL === 'true' || isMysqlExplicit) {
          console.error('❌ FATAL: MySQL connection failed:', err.message);
          throw new Error(`MySQL connection failed: ${err.message}. Refusing silent SQLite fallback when DB_DIALECT=mysql.`);
        }
        console.warn('⚠️  Could not connect to MySQL server (' + err.message + '). Falling back to relational SQLite engine for local development.');
        this.dialect = 'sqlite';
      }
    }

    // SQLite Relational Engine
    const Database = require('better-sqlite3');
    const dbFilePath = path.join(__dirname, '../../database/biodiversity.db');
    const isNew = !fs.existsSync(dbFilePath);

    this.sqliteDb = new Database(dbFilePath, { verbose: null });
    // Enforce foreign key constraints
    this.sqliteDb.pragma('foreign_keys = ON');
    this.sqliteDb.pragma('journal_mode = WAL');

    console.log(` Relational SQL Engine initialized (SQLite with Foreign Keys ENFORCED): ${dbFilePath}`);

    // Auto-initialize schema and seeds if new
    this.ensureSchemaAndSeed();
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
