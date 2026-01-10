const express = require("express");
const db = require("../db");

const router = express.Router();

// ---- Leads: get all ----
router.get("/leads", (req, res) => {
  db.all("SELECT * FROM leads ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// ---- Leads: create (public form) ----
router.post("/leads", (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    contactPreference,
    preferredCar,
    notes
  } = req.body;

  if (!firstName || !phone) {
    return res
      .status(400)
      .json({ error: "firstName and phone are required" });
  }

  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO leads
    (firstName, lastName, email, phone, contactPreference, preferredCar, notes, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)
  `;
  const params = [
    firstName,
    lastName || "",
    email || "",
    phone,
    contactPreference || "phone",
    preferredCar || "",
    notes || "",
    createdAt
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const leadId = this.lastID;
    db.get("SELECT * FROM leads WHERE id = ?", [leadId], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(row);
    });
  });
});

// ---- Leads: status update (admin) ----
router.patch("/leads/:id", (req, res) => {
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

module.exports = router;
