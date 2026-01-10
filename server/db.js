const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Put DB in a dedicated /data folder at project root
const dbDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to SQLite:", err);
  } else {
    console.log("Connected to SQLite database at", dbPath);
  }
});

// Ensure foreign keys work (for car_images cascades)
db.run("PRAGMA foreign_keys = ON");

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER,
      make TEXT,
      model TEXT,
      price REAL,
      mileage REAL,
      transmission TEXT,
      fuel TEXT,
      color TEXT,
      city TEXT,
      state TEXT,
      imageUrl TEXT,
      description TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS car_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER,
      imageUrl TEXT,
      FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      phone TEXT,
      contactPreference TEXT,
      preferredCar TEXT,
      notes TEXT,
      status TEXT DEFAULT 'new',
      createdAt TEXT
    )
  `);
});

module.exports = db;
