const Database = require('better-sqlite3');
const db = new Database('cybertap.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    telegram_id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    points INTEGER DEFAULT 0,
    points_per_hour INTEGER DEFAULT 0,
    last_collect INTEGER DEFAULT 0,
    referrer_id INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS upgrades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    base_cost INTEGER NOT NULL,
    points_per_hour INTEGER NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS user_upgrades (
    telegram_id INTEGER,
    upgrade_id INTEGER,
    level INTEGER DEFAULT 0,
    PRIMARY KEY (telegram_id, upgrade_id)
  );

  CREATE TABLE IF NOT EXISTS daily_rewards (
    telegram_id INTEGER,
    last_claim INTEGER,
    streak INTEGER DEFAULT 0,
    PRIMARY KEY (telegram_id)
  );
`);

const upgradeCount = db.prepare('SELECT COUNT(*) as count FROM upgrades').get();
if (upgradeCount.count === 0) {
  const insertUpgrade = db.prepare('INSERT INTO upgrades (name, base_cost, points_per_hour, icon) VALUES (?, ?, ?, ?)');
  
  insertUpgrade.run('Server Basic', 100, 10, '🖥️');
  insertUpgrade.run('Bot de Mining', 500, 50, '🤖');
  insertUpgrade.run('Ferma de Servere', 2000, 200, '🏭');
  insertUpgrade.run('AI Assistant', 10000, 1000, '🧠');
  insertUpgrade.run('Centru de Date', 50000, 5000, '🏢');
  insertUpgrade.run('Retea Quantum', 200000, 20000, '⚛️');
}

module.exports = db;
