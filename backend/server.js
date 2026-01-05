const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploaded images statically
app.use("/uploads", express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "car-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Data file paths
const carsFile = path.join(__dirname, "data", "cars.json");
const leadsFile = path.join(__dirname, "data", "leads.json");

// Helper functions
const readJSON = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Helper function to delete image file from disk
const deleteImageFile = (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Extract filename from URL
    // URL format: http://localhost:5000/uploads/car-xxxxx.jpg
    const urlParts = imageUrl.split("/uploads/");
    if (urlParts.length > 1) {
      const filename = urlParts;
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted image: ${filename}`);
      }
    }
  } catch (err) {
    console.error("Error deleting image file:", err);
  }
};

// ========== IMAGE UPLOAD ENDPOINTS ==========

// Single image upload
app.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Return the URL path to access the image
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Multiple images upload
app.post("/upload-multiple", upload.array("images", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const imageUrls = req.files.map(
      (file) => `http://localhost:${PORT}/uploads/${file.filename}`
    );
    res.json({ imageUrls });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ========== CARS ENDPOINTS ==========

// GET all cars
app.get("/cars", (req, res) => {
  try {
    const cars = readJSON(carsFile);
    res.json(cars);
  } catch (error) {
    console.error("Error reading cars:", error);
    res.status(500).json({ error: "Failed to read cars" });
  }
});

// GET single car
app.get("/cars/:id", (req, res) => {
  try {
    const cars = readJSON(carsFile);
    const car = cars.find((c) => c.id === parseInt(req.params.id));
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    console.error("Error reading car:", error);
    res.status(500).json({ error: "Failed to read car" });
  }
});

// POST new car
app.post("/cars", (req, res) => {
  try {
    const cars = readJSON(carsFile);
    const newCar = {
      id: cars.length > 0 ? Math.max(...cars.map((c) => c.id)) + 1 : 1,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    cars.push(newCar);
    writeJSON(carsFile, cars);
    res.status(201).json(newCar);
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ error: "Failed to create car" });
  }
});

// PUT update car
app.put("/cars/:id", (req, res) => {
  try {
    const cars = readJSON(carsFile);
    const index = cars.findIndex((c) => c.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: "Car not found" });
    }
    const updatedCar = {
      ...cars[index],
      ...req.body,
      id: cars[index].id,
      updatedAt: new Date().toISOString(),
    };
    cars[index] = updatedCar;
    writeJSON(carsFile, cars);
    res.json(updatedCar);
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Failed to update car" });
  }
});

// DELETE car (and all associated images)
app.delete("/cars/:id", (req, res) => {
  try {
    const cars = readJSON(carsFile);
    const carIndex = cars.findIndex((c) => c.id === parseInt(req.params.id));
    
    if (carIndex === -1) {
      return res.status(404).json({ error: "Car not found" });
    }

    const carToDelete = cars[carIndex];

    // Delete featured image (imageUrl)
    if (carToDelete.imageUrl) {
      deleteImageFile(carToDelete.imageUrl);
    }

    // Delete all gallery images (images array)
    if (Array.isArray(carToDelete.images) && carToDelete.images.length > 0) {
      carToDelete.images.forEach((imageUrl) => {
        deleteImageFile(imageUrl);
      });
    }

    // Remove car from database
    const filtered = cars.filter((c) => c.id !== parseInt(req.params.id));
    writeJSON(carsFile, filtered);

    res.json({ 
      message: "Car deleted successfully",
      deletedImages: {
        featured: carToDelete.imageUrl ? 1 : 0,
        gallery: Array.isArray(carToDelete.images) ? carToDelete.images.length : 0
      }
    });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ error: "Failed to delete car" });
  }
});

// ========== LEADS ENDPOINTS ==========

// GET all leads
app.get("/leads", (req, res) => {
  try {
    const leads = readJSON(leadsFile);
    res.json(leads);
  } catch (error) {
    console.error("Error reading leads:", error);
    res.status(500).json({ error: "Failed to read leads" });
  }
});

// POST new lead
app.post("/leads", (req, res) => {
  try {
    const leads = readJSON(leadsFile);
    const newLead = {
      id: leads.length > 0 ? Math.max(...leads.map((l) => l.id)) + 1 : 1,
      ...req.body,
      status: req.body.status || "new",
      createdAt: new Date().toISOString(),
    };
    leads.push(newLead);
    writeJSON(leadsFile, leads);
    res.status(201).json(newLead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

// PATCH update lead status
app.patch("/leads/:id", (req, res) => {
  try {
    const leads = readJSON(leadsFile);
    const index = leads.findIndex((l) => l.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: "Lead not found" });
    }
    const updatedLead = {
      ...leads[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    leads[index] = updatedLead;
    writeJSON(leadsFile, leads);
    res.json(updatedLead);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚗 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
  console.log(`💾 Cars data: ${carsFile}`);
  console.log(`📞 Leads data: ${leadsFile}`);
});
