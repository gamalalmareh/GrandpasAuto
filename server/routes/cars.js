const express = require("express");
const db = require("../db");

const router = express.Router();

// ---- Cars: get all ----
router.get("/cars", (req, res) => {
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
router.post("/cars", (req, res) => {
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
router.put("/cars/:id", (req, res) => {
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
router.delete("/cars/:id", (req, res) => {
  const carId = req.params.id;
  db.run("DELETE FROM cars WHERE id = ?", [carId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
