const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Put DB in a dedicated /data folder at project root
const dbDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "database.sqlite");

// Check if database file already exists
const dbExists = fs.existsSync(dbPath);
console.log(`Database file ${dbExists ? "exists" : "will be created"} at: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to SQLite:", err);
    process.exit(1); // Exit if can't connect
  } else {
    console.log("✓ Connected to SQLite database");
    // Initialize tables after connection
    initializeTables();
  }
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON", (err) => {
  if (err) console.error("Error enabling foreign keys:", err);
});

// INITIALIZE TABLES WITH ERROR HANDLING
function initializeTables() {
  db.serialize(() => {
    // Create cars table
    db.run(
      `
      CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        price REAL,
        mileage REAL,
        transmission TEXT,
        fuel TEXT,
        color TEXT,
        city TEXT,
        state TEXT,
        imageUrl TEXT,
        description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) console.error("Error creating cars table:", err);
        else console.log("✓ Cars table ready");
      }
    );

    // Create index on make/model for faster searches
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars(make, model)`,
      (err) => {
        if (err) console.error("Error creating index:", err);
      }
    );

    // Create car_images table
    db.run(
      `
      CREATE TABLE IF NOT EXISTS car_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_id INTEGER NOT NULL,
        imageUrl TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
      )
    `,
      (err) => {
        if (err) console.error("Error creating car_images table:", err);
        else console.log("✓ Car images table ready");
      }
    );

    // Create index on car_id for faster lookups
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id)`,
      (err) => {
        if (err) console.error("Error creating car_images index:", err);
      }
    );

    // Create leads table
    db.run(
      `
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        contactPreference TEXT,
        preferredCar TEXT,
        notes TEXT,
        status TEXT DEFAULT 'new',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) console.error("Error creating leads table:", err);
        else console.log("✓ Leads table ready");
      }
    );

    // Create index on status for filtering
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
      (err) => {
        if (err) console.error("Error creating leads index:", err);
      }
    );
  });
}

// HELPER FUNCTIONS FOR COMMON OPERATIONS
// These wrap callbacks in Promises for cleaner async/await syntax

// Get all cars
const getAllCars = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM cars ORDER BY createdAt DESC", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Get single car by ID with images
const getCarById = (carId) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM cars WHERE id = ?", [carId], (err, car) => {
      if (err) reject(err);
      else {
        if (!car) resolve(null);
        else {
          // Get images for this car
          db.all(
            "SELECT * FROM car_images WHERE car_id = ?",
            [carId],
            (err, images) => {
              if (err) reject(err);
              else resolve({ ...car, images: images || [] });
            }
          );
        }
      }
    });
  });
};

// Search cars by make/model
const searchCars = (make, model) => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM cars WHERE 1=1";
    let params = [];

    if (make) {
      query += " AND make LIKE ?";
      params.push(`%${make}%`);
    }
    if (model) {
      query += " AND model LIKE ?";
      params.push(`%${model}%`);
    }

    query += " ORDER BY createdAt DESC";

    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Add new car
const addCar = (carData) => {
  return new Promise((resolve, reject) => {
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
      description,
    } = carData;

    db.run(
      `INSERT INTO cars (year, make, model, price, mileage, transmission, fuel, color, city, state, imageUrl, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [year, make, model, price, mileage, transmission, fuel, color, city, state, imageUrl, description],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...carData });
      }
    );
  });
};

// Update car
const updateCar = (carId, carData) => {
  return new Promise((resolve, reject) => {
    const updates = [];
    const values = [];

    // Dynamically build update query based on provided fields
    for (const [key, value] of Object.entries(carData)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      resolve({ id: carId, ...carData });
      return;
    }

    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(carId);

    const query = `UPDATE cars SET ${updates.join(", ")} WHERE id = ?`;

    db.run(query, values, function (err) {
      if (err) reject(err);
      else resolve({ id: carId, ...carData });
    });
  });
};

// Delete car
const deleteCar = (carId) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM cars WHERE id = ?", [carId], function (err) {
      if (err) reject(err);
      else resolve({ success: true, deletedId: carId });
    });
  });
};

// Add car image
const addCarImage = (carId, imageUrl) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO car_images (car_id, imageUrl) VALUES (?, ?)",
      [carId, imageUrl],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, carId, imageUrl });
      }
    );
  });
};

// Delete car image
const deleteCarImage = (imageId) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM car_images WHERE id = ?", [imageId], function (err) {
      if (err) reject(err);
      else resolve({ success: true, deletedId: imageId });
    });
  });
};

// Get all leads
const getAllLeads = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM leads ORDER BY createdAt DESC", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Get leads by status
const getLeadsByStatus = (status) => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM leads WHERE status = ? ORDER BY createdAt DESC", [status], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Add new lead
const addLead = (leadData) => {
  return new Promise((resolve, reject) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      contactPreference,
      preferredCar,
      notes,
    } = leadData;

    db.run(
      `INSERT INTO leads (firstName, lastName, email, phone, contactPreference, preferredCar, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [firstName, lastName, email, phone, contactPreference, preferredCar, notes],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, status: "new", ...leadData });
      }
    );
  });
};

// Update lead
const updateLead = (leadId, leadData) => {
  return new Promise((resolve, reject) => {
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(leadData)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      resolve({ id: leadId, ...leadData });
      return;
    }

    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(leadId);

    const query = `UPDATE leads SET ${updates.join(", ")} WHERE id = ?`;

    db.run(query, values, function (err) {
      if (err) reject(err);
      else resolve({ id: leadId, ...leadData });
    });
  });
};

// Delete lead
const deleteLead = (leadId) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM leads WHERE id = ?", [leadId], function (err) {
      if (err) reject(err);
      else resolve({ success: true, deletedId: leadId });
    });
  });
};

// VERIFICATION FUNCTION - Call this to check database state
const verifyDatabase = () => {
  return new Promise((resolve, reject) => {
    const status = { tables: {}, ready: false };

    db.all(
      "SELECT name FROM sqlite_master WHERE type='table'",
      [],
      (err, tables) => {
        if (err) {
          reject(err);
          return;
        }

        const tableNames = tables.map((t) => t.name);
        status.tables = {
          cars: tableNames.includes("cars"),
          car_images: tableNames.includes("car_images"),
          leads: tableNames.includes("leads"),
        };

        status.ready = Object.values(status.tables).every((v) => v === true);
        resolve(status);
      }
    );
  });
};

// Export db object and helper functions
module.exports = {
  db,
  // Cars operations
  getAllCars,
  getCarById,
  searchCars,
  addCar,
  updateCar,
  deleteCar,
  addCarImage,
  deleteCarImage,
  // Leads operations
  getAllLeads,
  getLeadsByStatus,
  addLead,
  updateLead,
  deleteLead,
  // Utility
  verifyDatabase,
};