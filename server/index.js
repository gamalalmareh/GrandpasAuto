const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const db = require("./db");
const { router: uploadRouter, uploadsDir } = require("./routes/upload");
const carsRouter = require("./routes/cars");
const leadsRouter = require("./routes/leads");

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists (in case upload router didn't yet)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory at:", uploadsDir);
}

// Middleware
app.use(
  cors() // keep open for Amplify + ngrok; tighten later if needed
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// Health check
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// Base path for API
const API_BASE = "/api";

// Mount route modules under /api
app.use(API_BASE, uploadRouter);
app.use(API_BASE, carsRouter);
app.use(API_BASE, leadsRouter);

// Start server (local / ngrok)
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
