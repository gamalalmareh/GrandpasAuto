const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const {
  db,
  getAllCars,
  getCarById,
  searchCars,
  addCar,
  updateCar,
  deleteCar,
  addCarImage,
  deleteCarImage,
  getAllLeads,
  getLeadsByStatus,
  addLead,
  updateLead,
  deleteLead,
  verifyDatabase,
} = require("./db");

const { router: uploadRouter, uploadsDir } = require("./routes/upload");
const carsRouter = require("./routes/cars");
const leadsRouter = require("./routes/leads");
const apiRouter = require("./routes/api");

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

// Database verification endpoint
app.get("/api/health", async (req, res) => {
  try {
    const status = await verifyDatabase();
    res.json({
      status: "ok",
      database: status,
      message: status.ready ? "All tables ready" : "Missing tables",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Base path for API
const API_BASE = "/api";

// Mount route modules under /api
app.use(API_BASE, uploadRouter);
app.use("/api", carsRouter);
app.use("/api", leadsRouter);
app.use("/api", apiRouter); // New comprehensive API routes

// Start server (local / ngrok)
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`ngrok URL: Use your ngrok endpoint for frontend API calls`);
});