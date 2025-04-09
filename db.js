const sqlite3 = require("sqlite3").verbose();
const path = require("path");


console.log("Using database at:", path.resolve("database/database.db"));

// Connect to DB
const db = new sqlite3.Database("./database/database.db", (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Create tables if exist
db.serialize(() => {
    // Users Table usage tracking
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            api_key TEXT UNIQUE,
            usage_count INTEGER DEFAULT 0,
            last_used TEXT
        )`,
        (err) => {
            if (err) {
                console.error("Error creating users table:", err.message);
            } else {
                console.log("Users table is ready (with usage tracking).");
            }
        }
    );

    // Countries Table
    db.run(
        `CREATE TABLE IF NOT EXISTS countries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            currency TEXT,
            capital TEXT,
            languages TEXT,
            flag TEXT
        )`,
        (err) => {
            if (err) {
                console.error("Error creating countries table:", err.message);
            } else {
                console.log("Countries table is ready.");
            }
        }
    );
});

module.exports = db;
