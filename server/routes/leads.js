const express = require("express");
const db = require("../db");

const router = express.Router();

// ---- Leads status update ----
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
