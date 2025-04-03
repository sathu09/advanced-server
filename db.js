const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/database.db", (err) => {
    if (err) {
        console.error("❌ Error connecting to database:", err.message);
    } else {
        console.log("✅ Connected to the SQLite database.");
    }
});

// Create Users Table (if not exists)
db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            api_key TEXT UNIQUE
        )`,
        (err) => {
            if (err) {
                console.error("❌ Error creating users table:", err.message);
            } else {
                console.log("✅ Users table is ready.");
            }
        }
    );
});

module.exports = db;
