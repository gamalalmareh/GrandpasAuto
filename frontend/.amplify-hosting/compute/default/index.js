const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory at:", uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Health check
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// Base path for API
const API_BASE = "/api";

// ---- Image upload: single featured ----
app.post(`${API_BASE}/upload`, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.json({ imageUrl });
});

// ---- Image upload: multiple gallery images ----
app.post(
  `${API_BASE}/upload-multiple`,
  upload.array("images", 20),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrls = req.files.map((f) => `${baseUrl}/uploads/${f.filename}`);
    res.json({ imageUrls });
  }
);

// ---- Cars: get all ----
app.get(`${API_BASE}/cars`, (req, res) => {
  const sql = `
    SELECT c.*, 
      GROUP_CONCAT(ci.imageUrl) AS galleryImages
    FROM cars c
    LEFT JOIN car_images ci ON ci.car_id = c.id
    GROUP BY c.id
    ORDER BY c.id DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const cars = rows.map((row) => ({
      ...row,
      images: row.galleryImages ? row.galleryImages.split(",") : []
    }));
    res.json(cars);
  });
});

// ---- Cars: create ----
app.post(`${API_BASE}/cars`, (req, res) => {
  const {
    year,
    make,
    model,
    price,
    mileage,
    transmission,
    fuel,
    color,
    city,
    state,
    imageUrl,
    images = [],
    description
  } = req.body;

  const sql = `
    INSERT INTO cars
    (year, make, model, price, mileage, transmission, fuel, color, city, state, imageUrl, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    year,
    make,
    model,
    price,
    mileage,
    transmission,
    fuel,
    color,
    city,
    state,
    imageUrl,
    description
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const carId = this.lastID;

    if (images && images.length) {
      const imgSql = `INSERT INTO car_images (car_id, imageUrl) VALUES (?, ?)`;
      const stmt = db.prepare(imgSql);
      images.forEach((url) => stmt.run(carId, url));
      stmt.finalize();
    }

    db.get("SELECT * FROM cars WHERE id = ?", [carId], (err2, carRow) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json({ ...carRow, images });
    });
  });
});

// ---- Cars: update ----
app.put(`${API_BASE}/cars/:id`, (req, res) => {
  const carId = req.params.id;
  const {
    year,
    make,
    model,
    price,
    mileage,
    transmission,
    fuel,
    color,
    city,
    state,
    imageUrl,
    images = [],
    description
  } = req.body;

  const sql = `
    UPDATE cars SET
      year = ?, make = ?, model = ?, price = ?, mileage = ?,
      transmission = ?, fuel = ?, color = ?, city = ?, state = ?,
      imageUrl = ?, description = ?
    WHERE id = ?
  `;
  const params = [
    year,
    make,
    model,
    price,
    mileage,
    transmission,
    fuel,
    color,
    city,
    state,
    imageUrl,
    description,
    carId
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    db.run("DELETE FROM car_images WHERE car_id = ?", [carId], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      if (images && images.length) {
        const imgSql = `INSERT INTO car_images (car_id, imageUrl) VALUES (?, ?)`;
        const stmt = db.prepare(imgSql);
        images.forEach((url) => stmt.run(carId, url));
        stmt.finalize();
      }

      db.get(
        `
        SELECT c.*, GROUP_CONCAT(ci.imageUrl) AS galleryImages
        FROM cars c
        LEFT JOIN car_images ci ON ci.car_id = c.id
        WHERE c.id = ?
        GROUP BY c.id
      `,
        [carId],
        (err3, row) => {
          if (err3) return res.status(500).json({ error: err3.message });
          const updated = {
            ...row,
            images: row.galleryImages ? row.galleryImages.split(",") : []
          };
          res.json(updated);
        }
      );
    });
  });
});

// ---- Cars: delete ----
app.delete(`${API_BASE}/cars/:id`, (req, res) => {
  const carId = req.params.id;
  db.run("DELETE FROM cars WHERE id = ?", [carId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ---- Leads status update ----
app.patch(`${API_BASE}/leads/:id`, (req, res) => {
  const leadId = req.params.id;
  const { status } = req.body;
  db.run(
    "UPDATE leads SET status = ? WHERE id = ?",
    [status, leadId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT * FROM leads WHERE id = ?", [leadId], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(row);
      });
    }
  );
});

// Local dev
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

// Export for Amplify compute
module.exports = app;
