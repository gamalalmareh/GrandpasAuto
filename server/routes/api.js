const express = require("express");
const router = express.Router();
const {
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
} = require("../db");

// ============ DATABASE VERIFICATION ============
// Check if tables exist and are ready
router.get("/api/health", async (req, res) => {
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

// ============ CARS ROUTES ============

// GET all cars
router.get("/api/cars", async (req, res) => {
  try {
    const cars = await getAllCars();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single car by ID (with images)
router.get("/api/cars/:id", async (req, res) => {
  try {
    const car = await getCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH cars by make/model
router.get("/api/cars/search", async (req, res) => {
  try {
    const { make, model } = req.query;
    const cars = await searchCars(make, model);
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new car
router.post("/api/cars", async (req, res) => {
  try {
    const carData = req.body;
    
    // Validate required fields
    if (!carData.make || !carData.model) {
      return res
        .status(400)
        .json({ error: "Make and model are required" });
    }

    const newCar = await addCar(carData);
    res.status(201).json(newCar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update car
router.put("/api/cars/:id", async (req, res) => {
  try {
    const updatedCar = await updateCar(req.params.id, req.body);
    res.json(updatedCar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE car
router.delete("/api/cars/:id", async (req, res) => {
  try {
    const result = await deleteCar(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add image to car
router.post("/api/cars/:carId/images", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }
    const image = await addCarImage(req.params.carId, imageUrl);
    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE car image
router.delete("/api/images/:imageId", async (req, res) => {
  try {
    const result = await deleteCarImage(req.params.imageId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ LEADS ROUTES ============

// GET all leads
router.get("/api/leads", async (req, res) => {
  try {
    const leads = await getAllLeads();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET leads by status
router.get("/api/leads/status/:status", async (req, res) => {
  try {
    const leads = await getLeadsByStatus(req.params.status);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new lead
router.post("/api/leads", async (req, res) => {
  try {
    const leadData = req.body;

    // Validate required fields
    if (!leadData.firstName || !leadData.lastName) {
      return res
        .status(400)
        .json({ error: "First name and last name are required" });
    }

    const newLead = await addLead(leadData);
    res.status(201).json(newLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update lead
router.put("/api/leads/:id", async (req, res) => {
  try {
    const updatedLead = await updateLead(req.params.id, req.body);
    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE lead
router.delete("/api/leads/:id", async (req, res) => {
  try {
    const result = await deleteLead(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;