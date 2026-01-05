import { useState } from "react";

function Inventory({ cars, onOpenDetail }) {
  if (!cars || cars.length === 0) {
    return (
      <div className="inventory-grid">
        <div className="inventory-empty">
          No vehicles match your search. Try adjusting filters.
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-grid">
      {cars.map((car) => (
        <div
          key={car.id}
          className="car-card"
          onClick={() => onOpenDetail(car)}
        >
          <div className="car-card-image">
            {car.imageUrl ? (
              <img
                src={car.imageUrl}
                alt={`${car.year} ${car.make} ${car.model}`}
              />
            ) : (
              <div className="car-card-image-placeholder">No image</div>
            )}
          </div>
          <div className="car-card-body">
            <h3 className="car-card-title">
              {car.year} {car.make} {car.model}
            </h3>
            <p className="car-card-price">
              ${Number(car.price || 0).toLocaleString()}
            </p>
            <p className="car-card-meta">
              {typeof car.mileage === "number"
                ? `${Number(car.mileage).toLocaleString()} miles`
                : "Mileage not listed"}
              {car.transmission && ` • ${car.transmission}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Inventory;
