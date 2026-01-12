// Frontend Example - App.jsx or components/CarsSection.jsx
// Shows how to fetch cars and leads from the database

import React, { useState, useEffect } from "react";

const CarsSection = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    sortBy: "newest", // or "price"
  });

  // Fetch all cars from database on mount
  useEffect(() => {
    fetchCars();
    verifyDatabase();
  }, []);

  // Fetch cars from backend API
  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cars");
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setCars(data);
      setFilteredCars(data);

      // Set first car as featured
      if (data.length > 0) {
        setFeatured(data[0]);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching cars:", err);
    } finally {
      setLoading(false);
    }
  };

  // Verify database is connected
  const verifyDatabase = async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      console.log("Database status:", data);
      if (!data.database.ready) {
        setError("Database tables not ready. Please contact support.");
      }
    } catch (err) {
      console.error("Database check failed:", err);
    }
  };

  // Search/filter cars
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!filters.make && !filters.model) {
      setFilteredCars(cars);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (filters.make) params.append("make", filters.make);
      if (filters.model) params.append("model", filters.model);

      const response = await fetch(`/api/cars/search?${params}`);
      const data = await response.json();
      setFilteredCars(data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // Sort cars
  const handleSort = (sortBy) => {
    let sorted = [...filteredCars];

    if (sortBy === "price-low") {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "mileage") {
      sorted.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
    }

    setFilteredCars(sorted);
    setFilters({ ...filters, sortBy });
  };

  // Handle featured car click
  const handleSelectCar = (car) => {
    setFeatured(car);
  };

  if (loading) {
    return <div className="loading">Loading cars...</div>;
  }

  return (
    <div className="cars-section">
      {error && <div className="error-message">{error}</div>}

      {/* Featured Car Section */}
      {featured && (
        <section className="featured-car">
          <div className="featured-car__content">
            <h2 className="featured-car__title">
              Featured Vehicle
            </h2>
            <p className="featured-car__heading">
              {featured.year} {featured.make} {featured.model}
            </p>
            <p className="featured-car__price">
              ${Number(featured.price || 0).toLocaleString()}
              {typeof featured.mileage === "number" && (
                <span className="featured-car__mileage">
                  {" "}
                  • {Number(featured.mileage).toLocaleString()} miles
                </span>
              )}
            </p>
            <p className="featured-car__location">
              {featured.city || "Gloucester"}, {featured.state || "VA"}
            </p>
            {featured.description && (
              <p className="featured-car__description">{featured.description}</p>
            )}
          </div>
          {featured.imageUrl && (
            <img
              src={featured.imageUrl}
              alt={`${featured.year} ${featured.make} ${featured.model}`}
              className="featured-car__image"
            />
          )}
        </section>
      )}

      {/* Search & Filter Section */}
      <section className="search-section">
        <h2>Shop Our Inventory</h2>
        <p>Filter by year, make, and model, then sort by price or year.</p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Make (e.g., Toyota)"
            value={filters.make}
            onChange={(e) => setFilters({ ...filters, make: e.target.value })}
            className="search-form__input"
          />
          <input
            type="text"
            placeholder="Model (e.g., Camry)"
            value={filters.model}
            onChange={(e) => setFilters({ ...filters, model: e.target.value })}
            className="search-form__input"
          />
          <button type="submit" className="search-form__button">
            Search
          </button>
        </form>

        {/* Sort Options */}
        <div className="sort-options">
          <button
            className={filters.sortBy === "newest" ? "active" : ""}
            onClick={() => handleSort("newest")}
          >
            Newest First
          </button>
          <button
            className={filters.sortBy === "price-low" ? "active" : ""}
            onClick={() => handleSort("price-low")}
          >
            Price: Low to High
          </button>
          <button
            className={filters.sortBy === "price-high" ? "active" : ""}
            onClick={() => handleSort("price-high")}
          >
            Price: High to Low
          </button>
          <button
            className={filters.sortBy === "mileage" ? "active" : ""}
            onClick={() => handleSort("mileage")}
          >
            Lowest Mileage
          </button>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="cars-grid">
        {filteredCars.length === 0 ? (
          <p className="no-results">No cars found. Try adjusting your filters.</p>
        ) : (
          filteredCars.map((car) => (
            <div
              key={car.id}
              className={`car-card ${featured?.id === car.id ? "active" : ""}`}
              onClick={() => handleSelectCar(car)}
            >
              {car.imageUrl && (
                <img src={car.imageUrl} alt={`${car.year} ${car.make}`} />
              )}
              <div className="car-card__content">
                <h3 className="car-card__title">
                  {car.year} {car.make} {car.model}
                </h3>
                <p className="car-card__price">
                  ${Number(car.price || 0).toLocaleString()}
                </p>
                {typeof car.mileage === "number" && (
                  <p className="car-card__mileage">
                    {Number(car.mileage).toLocaleString()} miles
                  </p>
                )}
                <p className="car-card__location">
                  {car.city}, {car.state}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CarsSection;
