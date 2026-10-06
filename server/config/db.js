const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let dbInstance = null;
let currentDialect = process.env.DB_DIALECT || 'sqlite';

class DatabaseAdapter {
  constructor() {
    this.dialect = currentDialect;
    this.pool = null;
    this.sqliteDb = null;
  }

  async init() {
    if (this.dialect === 'mysql') {
      try {
        const mysql = require('mysql2/promise');
        this.pool = mysql.createPool({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'biodiversity_db',
          port: parseInt(process.env.DB_PORT || '3306'),
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });

        // Test connection
        const connection = await this.pool.getConnection();
        console.log(' Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'biodiversity_db'));
        connection.release();
        return;
      } catch (err) {
        console.warn('⚠️  Could not connect to MySQL server (' + err.message + '). Falling back to relational SQLite engine for seamless zero-setup execution.');
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
      const [rows] = await this.pool.execute(sql, params);
      return rows;
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
