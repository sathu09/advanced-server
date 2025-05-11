const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5002;
const SECRET_KEY = "your_secret_key"; // ✅ In production, use process.env

app.use(cors());
app.use(express.json());

// ✅ Connect to SQLite
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) return console.error("❌ DB connection error:", err.message);
  console.log("✅ Connected to SQLite database.");
});

// ✅ Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)
`);

db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    author TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

db.run(`
  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    post_id INTEGER,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
)
`);

db.run(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    author TEXT,
    content TEXT,
    FOREIGN KEY(post_id) REFERENCES posts(id)
)
`);

// ✅ JWT Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// ✅ Register
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashed], function (err) {
      if (err) return res.status(500).json({ message: "Error saving user" });

      const token = jwt.sign({ userId: this.lastID, email }, SECRET_KEY, { expiresIn: "1h" });
      res.status(201).json({ message: "User registered", token });
    });
  });
});

// ✅ Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!user) return res.status(401).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ userId: user.id, email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  });
});

// ✅ Fetch All Posts
app.get("/api/posts", (req, res) => {
  db.all("SELECT * FROM posts ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(rows);
  });
});

// ✅ Create Post (protected)
app.post("/api/posts", authenticate, (req, res) => {
  const { title, content } = req.body;
  const author = req.user.email;

  if (!title || !content)
    return res.status(400).json({ message: "Title and content required" });

  db.run(
    "INSERT INTO posts (title, content, author) VALUES (?, ?, ?)",
    [title, content, author],
    function (err) {
      if (err) {
        console.error("❌ Post creation failed:", err.message);
        return res.status(500).json({ message: "Error saving post" });
      }
      res.status(201).json({ id: this.lastID, title, content, author });
    }
  );
});

// ✅ Like a Post (protected)
app.post("/api/posts/:id/like", authenticate, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  // Check if the user has already liked the post
  db.get("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId], (err, row) => {
    if (err) return res.status(500).json({ message: "Error checking like status" });

    if (row) {
      // If already liked, remove the like
      db.run("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId], (err) => {
        if (err) return res.status(500).json({ message: "Error unliking post" });
        return res.json({ message: "Post unliked!" });
      });
    } else {
      // If not liked, add a new like
      db.run("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [userId, postId], (err) => {
        if (err) return res.status(500).json({ message: "Error liking post" });
        return res.json({ message: "Post liked!" });
      });
    }
  });
});

// ✅ Create comment on a post (protected)
app.post("/api/posts/:id/comments", authenticate, (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  const author = req.user.email;

  if (!content) return res.status(400).json({ message: "Comment cannot be empty" });

  db.run(
    "INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)",
    [postId, author, content],
    function (err) {
      if (err) {
        console.error("❌ Error inserting comment:", err.message);
        return res.status(500).json({ message: "Failed to add comment" });
      }
      res.status(201).json({ message: "Comment added", comment: { id: this.lastID, content, author } });
    }
  );
});

// 🗨️ Get comments for a post
app.get("/api/posts/:id/comments", (req, res) => {
  const postId = req.params.id;
  db.all("SELECT * FROM comments WHERE post_id = ?", [postId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Failed to fetch comments" });
    res.json(rows);
  });
});

// 📝 Update post
app.put("/api/posts/:id", authenticate, (req, res) => {
  const { title, content } = req.body;
  const postId = req.params.id;
  const userEmail = req.user.email;

  db.run(
    "UPDATE posts SET title = ?, content = ? WHERE id = ? AND author = ?",
    [title, content, postId, userEmail],
    function (err) {
      if (err) return res.status(500).json({ message: "Error updating post" });
      if (this.changes === 0) return res.status(403).json({ message: "Unauthorized or not found" });
      res.json({ message: "Post updated" });
    }
  );
});

// 🗑️ Delete post
app.delete("/api/posts/:id", authenticate, (req, res) => {
  const postId = req.params.id;
  const userEmail = req.user.email;

  db.run(
    "DELETE FROM posts WHERE id = ? AND author = ?",
    [postId, userEmail],
    function (err) {
      if (err) return res.status(500).json({ message: "Error deleting post" });
      if (this.changes === 0) return res.status(403).json({ message: "Unauthorized or not found" });
      res.json({ message: "Post deleted" });
    }
  );
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 TravelTales backend running at http://localhost:${PORT}`);
});
