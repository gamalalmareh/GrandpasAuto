const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Car = require('../models/Car');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing cars
    await Car.deleteMany({});
    console.log('🗑️  Cleared existing cars');

    // Sample car data
    const cars = [
      {
        year: 2022,
        make: 'Toyota',
        model: 'Camry',
        price: 24995,
        mileage: 32000,
        city: 'Gloucester',
        state: 'VA',
        imageUrl: 'https://via.placeholder.com/400x300?text=2022+Toyota+Camry',
        images: [],
        featured: true
      },
      {
        year: 2021,
        make: 'Honda',
        model: 'Civic',
        price: 22500,
        mileage: 28000,
        city: 'Gloucester',
        state: 'VA',
        imageUrl: 'https://via.placeholder.com/400x300?text=2021+Honda+Civic',
        images: [],
        featured: true
      },
      {
        year: 2020,
        make: 'Ford',
        model: 'F-150',
        price: 35000,
        mileage: 42000,
        city: 'Gloucester',
        state: 'VA',
        imageUrl: 'https://via.placeholder.com/400x300?text=2020+Ford+F-150',
        images: [],
        featured: false
      }
    ];

    await Car.insertMany(cars);
    console.log('✅ Seed data inserted:', cars.length, 'cars');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedData();
