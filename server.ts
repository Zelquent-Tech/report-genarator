import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");
db.pragma('foreign_keys = ON');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    avatar TEXT,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS business_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    date TEXT,
    revenue REAL,
    expenses REAL,
    customers INTEGER,
    profit REAL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '50mb' }));

  // --- API Routes ---

  // Auth: Sign Up
  app.post("/api/auth/signup", (req, res) => {
    const { email, name, password } = req.body;
    console.log(`Signup attempt: ${email}`);
    try {
      if (!email || !name || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const id = Math.random().toString(36).substr(2, 9);
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
      const stmt = db.prepare("INSERT INTO users (id, email, name, avatar, password) VALUES (?, ?, ?, ?, ?)");
      stmt.run(id, email, name, avatar, password);
      console.log(`Signup successful: ${email}`);
      res.json({ id, email, name, avatar });
    } catch (err: any) {
      console.error(`Signup error: ${err.message}`);
      if (err.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "User already exists" });
      } else {
        res.status(500).json({ error: "Server error during signup" });
      }
    }
  });

  // Auth: Sign In
  app.post("/api/auth/signin", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Auth: Verify Session
  app.get("/api/auth/session/:userId", (req, res) => {
    const { userId } = req.params;
    const user = db.prepare("SELECT id, email, name, avatar FROM users WHERE id = ?").get(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Session invalid" });
    }
  });

  // Data: Upload
  app.post("/api/data/upload", (req, res) => {
    const { userId, data } = req.body;
    console.log(`Data upload attempt for user: ${userId}, rows: ${data?.length}`);
    
    if (!userId || !Array.isArray(data)) {
      console.error("Invalid upload request: missing userId or data is not an array");
      return res.status(400).json({ error: "Invalid request: missing userId or data" });
    }

    // Verify user exists to avoid Foreign Key constraint failure
    const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
    if (!userExists) {
      console.warn(`Upload failed: User ${userId} not found in database (stale session)`);
      return res.status(401).json({ error: "Your session has expired or the user no longer exists. Please sign out and sign in again." });
    }

    try {
      db.transaction(() => {
        const deleteStmt = db.prepare("DELETE FROM business_data WHERE user_id = ?");
        deleteStmt.run(userId);

        const insertStmt = db.prepare("INSERT INTO business_data (user_id, date, revenue, expenses, customers, profit) VALUES (?, ?, ?, ?, ?, ?)");
        for (const row of data) {
          if (!row.date) {
            throw new Error("Missing date in one of the rows");
          }
          insertStmt.run(userId, row.date, row.revenue || 0, row.expenses || 0, row.customers || 0, row.profit || 0);
        }
      })();
      
      console.log(`Data upload successful for user: ${userId}`);
      res.json({ success: true });
    } catch (err: any) {
      console.error(`Data upload error for user ${userId}: ${err.message}`);
      res.status(500).json({ error: `Database error: ${err.message}` });
    }
  });

  // Data: Get
  app.get("/api/data/:userId", (req, res) => {
    const { userId } = req.params;
    
    // Verify user exists to detect stale sessions
    const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
    if (!userId || !userExists) {
      console.warn(`Data fetch failed: User ${userId} not found in database (stale session)`);
      return res.status(401).json({ error: "User session is invalid or has expired." });
    }

    const data = db.prepare("SELECT date, revenue, expenses, customers, profit FROM business_data WHERE user_id = ? ORDER BY date ASC").all(userId);
    res.json(data);
  });

  // API 404 handler
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
