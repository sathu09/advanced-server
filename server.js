const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const db = require("./db");
require("dotenv").config();

const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;
const SECRET_KEY = "your_secret_key";

// Middleware for API Key Authentication + Usage Tracking
const authenticate = (req, res, next) => {
    const apiKey = req.header("x-api-key") || req.query.apiKey;

    if (!apiKey) {
        return res.status(403).json({ error: "API key required" });
    }

    db.get("SELECT * FROM users WHERE api_key = ?", [apiKey], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(403).json({ error: "Invalid API key" });

        //Track API time use
        const now = new Date().toISOString();
        db.run(
            `UPDATE users SET usage_count = COALESCE(usage_count, 0) + 1, last_used = ? WHERE id = ?`,
            [now, user.id],
            (updateErr) => {
                if (updateErr) {
                    console.error("Failed to update usage stats:", updateErr.message);
                }
            }
        );

        req.user = user;
        next();
    });
};


// Register Route (Public)
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = crypto.randomBytes(16).toString("hex");

    db.run(
        "INSERT INTO users (username, password, api_key) VALUES (?, ?, ?)",
        [username, hashedPassword, apiKey],
        (err) => {
            if (err) {
                return res.status(500).json({ error: "User already exists" });
            }
            res.status(201).json({ message: "User registered", api_key: apiKey });
        }
    );
});

// Login Route (Public)
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, {
            expiresIn: "1h",
        });

        res.json({ message: "Login successful", token, api_key: user.api_key });
    });
});

// Protected Routes

// Fetch Country Data from External API and Save to DB
app.get("/country/:name", authenticate, async (req, res) => {
    try {
        const { name } = req.params;
        const response = await axios.get(`https://restcountries.com/v3.1/name/${name}`);
        const country = response.data[0];

        const countryInfo = {
            name: country.name.common,
            currency: country.currencies ? Object.keys(country.currencies)[0] : "N/A",
            capital: country.capital ? country.capital[0] : "N/A",
            languages: country.languages ? Object.values(country.languages).join(", ") : "N/A",
            flag: country.flags.png,
        };

        // Save to local SQLite DB
        const insertQuery = `
            INSERT OR IGNORE INTO countries (name, currency, capital, languages, flag)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.run(insertQuery, [
            countryInfo.name,
            countryInfo.currency,
            countryInfo.capital,
            countryInfo.languages,
            countryInfo.flag
        ], (err) => {
            if (err) {
                console.error("Failed to insert country into DB:", err.message);
            }
        });

        res.json(countryInfo);
    } catch (error) {
        console.error("API Fetch Error:", error.response?.data || error.message);
        res.status(500).json({
            error: "Could not fetch country data",
            details: error.response?.data || error.message
        });
    }
});

// Get All Saved Countries from DB
app.get("/countries", authenticate, (req, res) => {
    const query = "SELECT * FROM countries";
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error retrieving countries:", err);
            return res.status(500).json({ error: "Failed to get countries" });
        }
        res.json({ countries: rows });
    });
});

//Delete a Country by Name
app.delete("/countries/:name", authenticate, (req, res) => {
    const { name } = req.params;
    db.run("DELETE FROM countries WHERE name = ?", [name], function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to delete country" });
        }
        res.json({ message: `${name} deleted successfully` });
    });
});

// Log routes before server starts
console.log("Registered routes:");
if (app._router && app._router.stack) {
    const routes = app._router.stack
        .filter(r => r.route && r.route.path)
        .map(r => r.route.path);
    console.log(routes);
} else {
    console.warn("Could not read registered routes.");
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
