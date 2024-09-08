const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./users.db');

db.run(`CREATE TABLE IF NOT EXISTS trusted_users (user_id TEXT PRIMARY KEY)`);

module.exports = db;

//Do Not Touch IT Unless You Know What You Are Doing.