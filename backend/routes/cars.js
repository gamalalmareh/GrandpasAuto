const express = require('express');
const Car = require('../models/Car');
const authMiddleware = require('../middleware/auth');
const s3 = require('../config/s3');

const router = express.Router();

// GET /api/cars - Get all cars (public)
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cars/:id - Get single car (public)
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    console.error('Error fetching car:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cars - Add new car (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { year, make, model, price, mileage, city, state, imageUrl, images } = req.body;

    if (!year || !make || !model || !price || !imageUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields: year, make, model, price, imageUrl' 
      });
    }

    const newCar = new Car({
      year: Number(year),
      make,
      model,
      price: Number(price),
      mileage: mileage ? Number(mileage) : 0,
      city: city || 'Gloucester',
      state: state || 'VA',
      imageUrl,
      images: images || []
    });

    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    console.error('Error creating car:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/cars/:id - Update car (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { year, make, model, price, mileage, city, state, imageUrl, images } = req.body;

    const updateData = {};
    if (year !== undefined) updateData.year = Number(year);
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (price !== undefined) updateData.price = Number(price);
    if (mileage !== undefined) updateData.mileage = Number(mileage);
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (images !== undefined) updateData.images = images;
    updateData.updatedAt = new Date();

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    console.error('Error updating car:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cars/:id - Delete car and images (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });

    // Delete images from S3 if using AWS
    if (process.env.AWS_S3_BUCKET) {
      const imagesToDelete = [car.imageUrl, ...(car.images || [])].filter(Boolean);
      
      for (const imageUrl of imagesToDelete) {
        try {
          const key = imageUrl.split('/').pop();
          if (key) {
            await s3.deleteObject({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: `cars/${key}`
            }).promise();
          }
        } catch (s3Err) {
          console.warn('S3 delete warning:', s3Err.message);
        }
      }
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car and images deleted successfully' });
  } catch (err) {
    console.error('Error deleting car:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
