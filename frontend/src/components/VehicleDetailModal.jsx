import { useState } from "react";

function VehicleDetailModal({ car, onClose }) {
  const [mainImageIndex, setMainImageIndex] = useState(0);

  if (!car) return null;

  // Use gallery images if available, otherwise use main image
  const images =
    car.images && car.images.length > 0
      ? car.images
      : car.imageUrl
      ? [car.imageUrl]
      : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>
            {car.year} {car.make} {car.model}
          </h2>
          <p className="modal-price">
            ${Number(car.price || 0).toLocaleString()}
          </p>
          <p className="modal-meta">
            {typeof car.mileage === "number" &&
              `${Number(car.mileage).toLocaleString()} miles`}
            {car.city && car.state && ` • ${car.city}, ${car.state}`}
          </p>
        </div>

        <div className="modal-main-image">
          {images.length > 0 && images[mainImageIndex] ? (
            <img
              src={images[mainImageIndex]}
              alt={`${car.year} ${car.make} ${car.model}`}
            />
          ) : (
            <div className="modal-image-placeholder">No image available</div>
          )}
        </div>

        {images.length > 1 && (
          <div className="modal-gallery">
            <h3>Gallery</h3>
            <div className="modal-gallery-grid">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`modal-gallery-item ${
                    idx === mainImageIndex ? "modal-gallery-item-active" : ""
                  }`}
                  onClick={() => setMainImageIndex(idx)}
                >
                  <img src={img} alt={`Car view ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "1.5rem" }}>
          <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Details</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {car.year && (
              <div>
                <strong>Year:</strong> {car.year}
              </div>
            )}
            {car.make && (
              <div>
                <strong>Make:</strong> {car.make}
              </div>
            )}
            {car.model && (
              <div>
                <strong>Model:</strong> {car.model}
              </div>
            )}
            {car.mileage && (
              <div>
                <strong>Mileage:</strong>{" "}
                {Number(car.mileage).toLocaleString()} miles
              </div>
            )}
            {car.transmission && (
              <div>
                <strong>Transmission:</strong> {car.transmission}
              </div>
            )}
            {car.fuel && (
              <div>
                <strong>Fuel:</strong> {car.fuel}
              </div>
            )}
            {car.color && (
              <div>
                <strong>Color:</strong> {car.color}
              </div>
            )}
          </div>
        </div>

        {car.description && (
          <div style={{ marginTop: "1rem" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Description</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}>
              {car.description}
            </p>
          </div>
        )}

        <div style={{ marginTop: "1.5rem" }}>
          <a
            href="#lead-request"
            className="btn-primary"
            onClick={onClose}
            style={{ display: "inline-block" }}
          >
            Request callback about this car
          </a>
        </div>
      </div>
    </div>
  );
}

export default VehicleDetailModal;
