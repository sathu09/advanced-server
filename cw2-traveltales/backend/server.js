const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5002;

// Get all posts
app.get("/posts", (req, res) => {
    db.all("SELECT * FROM posts ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a new post
app.post("/posts", (req, res) => {
    const { user_id, title, content, country, date_of_visit } = req.body;
    db.run(
        `INSERT INTO posts (user_id, title, content, country, date_of_visit) VALUES (?, ?, ?, ?, ?)`,
        [user_id, title, content, country, date_of_visit],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.listen(PORT, () => {
    console.log(`📝 TravelTales backend running on http://localhost:${PORT}`);
});
