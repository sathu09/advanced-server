const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // For API key generation
const db = require("./db"); // Import the database connection
require("dotenv").config();
app.use(express.json());

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Replace with a strong secret in .env

// 📝 User Registration (Stores Hashed Password & API Key)
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = crypto.randomBytes(16).toString("hex"); // Generate API key

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

// 📝 User Login (JWT Authentication)
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    });
});

// 🔒 Middleware for API Key Authentication
const authenticateAPIKey = (req, res, next) => {
    const apiKey = req.header("x-api-key");
    if (!apiKey) {
        return res.status(403).json({ error: "API key required" });
    }

    db.get("SELECT * FROM users WHERE api_key = ?", [apiKey], (err, user) => {
        if (err || !user) {
            return res.status(403).json({ error: "Invalid API key" });
        }
        req.user = user;
        next();
    });
};

// 🔐 Protected Route (Requires API Key)
app.get("/protected", authenticateAPIKey, (req, res) => {
    res.json({ message: "Welcome! You accessed a protected route.", user: req.user });
});

// ✅ Basic Route to Check Express Server
app.get("/", (req, res) => {
    res.send("Express is working!");
});

// 🚀 Start the Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});



app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`Loaded route: ${r.route.path}`);
    }
});
