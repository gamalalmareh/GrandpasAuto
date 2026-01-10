import { useState } from "react";


const API_BASE = "https://defenceable-hugo-exultantly.ngrok-free.dev/";

const UPLOAD_ENDPOINT = `${API_BASE}api/upload`;



function AdminPanel({ onClose, onLogout, cars, setCars, leads, setLeads }) {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    year: "",
    make: "",
    model: "",
    price: "",
    mileage: "",
    transmission: "",
    fuel: "",
    color: "",
    city: "Gloucester",
    state: "VA",
    imageUrl: "",
    images: [],
    description: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleEditCar = (car) => {
    setEditingCar(car.id);
    setFormData({
      year: car.year || "",
      make: car.make || "",
      model: car.model || "",
      price: car.price || "",
      mileage: car.mileage || "",
      transmission: car.transmission || "",
      fuel: car.fuel || "",
      color: car.color || "",
      city: car.city || "Gloucester",
      state: car.state || "VA",
      imageUrl: car.imageUrl || "",
      images: Array.isArray(car.images) ? car.images : [],
      description: car.description || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingCar(null);
    setFormData({
      year: "",
      make: "",
      model: "",
      price: "",
      mileage: "",
      transmission: "",
      fuel: "",
      color: "",
      city: "Gloucester",
      state: "VA",
      imageUrl: "",
      images: [],
      description: "",
    });
  };

  const handleSaveCar = async (e) => {
    e.preventDefault();
    try {
      const method = editingCar ? "PUT" : "POST";
      const url = editingCar
        ? `${API_BASE}api/cars/${editingCar}`
        : `${API_BASE}api/cars`;

      const dataToSave = {
        ...formData,
        imageUrl: formData.imageUrl || (formData.images?.[0] || ""),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();

      if (editingCar) {
        setCars((prev) => prev.map((c) => (c.id === editingCar ? saved : c)));
      } else {
        setCars((prev) => [...prev, saved]);
      }

      handleCancelEdit();
      alert(editingCar ? "Car updated!" : "Car added!");
    } catch (err) {
      console.error("Error saving car", err);
      alert("Error saving car");
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm("Really delete this car?")) return;
    try {
      const res = await fetch(`${API_BASE}api/cars/${carId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setCars((prev) => prev.filter((c) => c.id !== carId));
      alert("Car deleted!");
    } catch (err) {
      console.error("Error deleting car", err);
      alert("Error deleting car");
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("image", file);

    try {
      setUploading(true);
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        body: fd,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        imageUrl: data.imageUrl || prev.imageUrl,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleImagesUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadFormData = new FormData();
    Array.from(files).forEach((file) => {
      uploadFormData.append("images", file);
    });

    try {
      const res = await fetch(`${API_BASE}api/upload-multiple`, {
        method: "POST",
        body: uploadFormData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...(data.imageUrls || [])],
      }));
      alert(`${files.length} image(s) uploaded successfully!`);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateLeadStatus = async (leadId, status) => {
    try {
      const res = await fetch(`${API_BASE}api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
    } catch (err) {
      console.error("Error updating lead", err);
      alert("Error updating lead status");
    }
  };

  const styles = {
    adminFormSection: {
      background: "var(--surface-soft)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      padding: "1.6rem",
      marginBottom: "2rem",
    },
    adminListSection: {
      background: "var(--surface-soft)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      padding: "1.6rem",
    },
    formSectionTitle: {
      fontSize: "0.9rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--text)",
      margin: "1.2rem 0 0.8rem",
      paddingBottom: "0.6rem",
      borderBottom: "1px solid var(--border)",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1rem",
      marginBottom: "0.5rem",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.4rem",
    },
    formGroupLabel: {
      fontSize: "0.8rem",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "var(--text)",
    },
    formInput: {
      padding: "0.7rem 0.9rem",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      fontSize: "0.9rem",
      background: "var(--surface)",
      color: "var(--text)",
      fontFamily: "inherit",
    },
    uploadInputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    uploadFileInput: {
      flex: 1,
      cursor: "pointer",
    },
    uploadStatus: {
      fontSize: "0.75rem",
      padding: "0.3rem 0.6rem",
      borderRadius: "4px",
      background: "rgba(59, 130, 246, 0.1)",
      color: "#3b82f6",
      whiteSpace: "nowrap",
    },
    uploadStatusSuccess: {
      background: "rgba(34, 197, 94, 0.1)",
      color: "#22c55e",
    },
    imagePreview: {
      position: "relative",
      marginTop: "0.8rem",
      borderRadius: "8px",
      overflow: "hidden",
      maxWidth: "150px",
      aspectRatio: "4/3",
      background: "#e5e7eb",
    },
    btnRemoveImage: {
      position: "absolute",
      top: "4px",
      right: "4px",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      background: "rgba(0, 0, 0, 0.6)",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontSize: "1.2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.2s",
    },
    galleryPreview: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      gap: "0.8rem",
      marginTop: "0.8rem",
    },
    galleryItem: {
      position: "relative",
      borderRadius: "8px",
      overflow: "hidden",
      aspectRatio: "1",
      background: "#e5e7eb",
      border: "1px solid var(--border)",
    },
    formActions: {
      display: "flex",
      gap: "0.8rem",
      marginTop: "1.6rem",
      paddingTop: "1.2rem",
      borderTop: "1px solid var(--border)",
    },
    adminEmpty: {
      padding: "2rem",
      textAlign: "center",
      color: "var(--muted)",
      background: "var(--surface)",
      borderRadius: "8px",
      border: "1px dashed var(--border)",
    },
  };

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <div className="admin-header-left">
            <h2>Admin Panel</h2>
            <p>Manage inventory and customer leads</p>
          </div>

          <div className="admin-header-right">
            <button
              className={`tab-btn ${activeTab === "cars" ? "active" : ""}`}
              onClick={() => setActiveTab("cars")}
            >
              Inventory ({cars.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "leads" ? "active" : ""}`}
              onClick={() => setActiveTab("leads")}
            >
              Leads ({leads.length})
            </button>
            <button className="tab-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="admin-body">
          {activeTab === "cars" && (
            <div>
              <div style={styles.adminFormSection}>
                <h3>{editingCar ? "Edit Car" : "Add New Car"}</h3>
                <p className="admin-help">
                  {editingCar
                    ? "Update the car details below"
                    : "Fill in all fields to add a new car to inventory"}
                </p>

                <form onSubmit={handleSaveCar}>
                  <div style={styles.formSectionTitle}>Basic Information</div>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formGroupLabel}>Year *</label>
                      <input
                        type="number"
                        style={styles.formInput}
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formGroupLabel}>Make *</label>
                      <input
                        type="text"
                        style={styles.formInput}
                        value={formData.make}
                        onChange={(e) =>
                          setFormData({ ...formData, make: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formGroupLabel}>Model *</label>
                      <input
                        type="text"
                        style={styles.formInput}
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formGroupLabel}>Price *</label>
                      <input
                        type="number"
                        style={styles.formInput}
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formSectionTitle}>Vehicle Details</div>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formGroupLabel}>Mileage</label>
                      <input
                        type="number"
                        style={styles.formInput}
                        value={formData.mileage}
                        onChange={(e) =>
                          setFormData({ ...formData, mileage: e.target.value })
                        }
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formGroupLabel}>Transmission</label>
                      <input
                        type="text"
                        style={styles.formInput}
                        value={formData.transmission}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transmission: e.target.value,
                          })
                        }
                        placeholder="Automatic, Manual"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formGroupLabel}>Fuel Type</label>
                      <input
                        type="text"
                        style={styles.formInput}
                        value={formData.fuel}
                        onChange={(e) =>
                          setFormData({ ...formData, fuel: e.target.value })
                        }
                        placeholder="Gas, Diesel, Hybrid"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formGroupLabel}>Color</label>
                      <input
                        type="text"
                        style={styles.formInput}
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div style={styles.formSectionTitle}>Images</div>

                  <div style={styles.formGroup}>
                    <label style={styles.formGroupLabel}>
                      Featured Image (Primary)
                    </label>
                    <div style={styles.uploadInputWrapper}>
                      <input
                        type="file"
                        accept="image/*"
                        style={styles.uploadFileInput}
                        onChange={handleUploadImage}
                        disabled={uploading}
                      />
                      {uploading && (
                        <span style={styles.uploadStatus}>Uploading...</span>
                      )}
                      {formData.imageUrl && !uploading && (
                        <span
                          style={{
                            ...styles.uploadStatus,
                            ...styles.uploadStatusSuccess,
                          }}
                        >
                          ✓ Uploaded
                        </span>
                      )}
                    </div>
                    {formData.imageUrl && (
                      <div style={styles.imagePreview}>
                        <img
                          src={formData.imageUrl}
                          alt="Featured"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          style={styles.btnRemoveImage}
                          onClick={() =>
                            setFormData({ ...formData, imageUrl: "" })
                          }
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formGroupLabel}>
                      Gallery Images (Multiple)
                    </label>
                    <div style={styles.uploadInputWrapper}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={styles.uploadFileInput}
                        onChange={handleMultipleImagesUpload}
                        disabled={uploading}
                      />
                      {uploading && (
                        <span style={styles.uploadStatus}>Uploading...</span>
                      )}
                    </div>

                    {formData.images && formData.images.length > 0 && (
                      <div style={styles.galleryPreview}>
                        {formData.images.map((img, idx) => (
                          <div key={idx} style={styles.galleryItem}>
                            <img
                              src={img}
                              alt={`Gallery ${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              style={styles.btnRemoveImage}
                              onClick={() => handleRemoveImage(idx)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formGroupLabel}>Description</label>
                    <textarea
                      style={{ ...styles.formInput, resize: "vertical" }}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows="4"
                      placeholder="Additional details about the vehicle, condition, features, etc."
                    />
                  </div>

                  <div style={styles.formActions}>
                    <button type="submit" className="btn-primary">
                      {editingCar ? "Update Car" : "Add Car"}
                    </button>
                    {editingCar && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div style={styles.adminListSection}>
                <h3>Current Inventory ({cars.length})</h3>

                {cars.length === 0 ? (
                  <p style={styles.adminEmpty}>No cars in inventory yet</p>
                ) : (
                  <div className="cars-grid">
                    {cars.map((car) => (
                      <div key={car.id} className="car-admin-card">
                        <div className="car-admin-preview">
                          <div className="car-image-placeholder">
                            {car.imageUrl ? (
                              <img src={car.imageUrl} alt="Car" />
                            ) : (
                              "📷"
                            )}
                          </div>
                          <div className="car-admin-details">
                            <h4>
                              {car.year} {car.make} {car.model}
                            </h4>
                            <p className="car-price">
                              ${Number(car.price).toLocaleString()}
                            </p>
                            <p className="car-meta">
                              {typeof car.mileage === "number"
                                ? `${Number(car.mileage).toLocaleString()} mi`
                                : "N/A"}
                            </p>
                            {car.images && car.images.length > 0 && (
                              <p className="car-gallery-badge">
                                📸 {car.images.length} photo
                                {car.images.length !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="car-admin-actions">
                          <button
                            className="btn-small"
                            onClick={() => handleEditCar(car)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDeleteCar(car.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "leads" && (
            <div>
              <h3>Customer Leads</h3>
              <p className="admin-help">
                Manage customer callbacks and inquiries
              </p>

              {leads.length === 0 ? (
                <p style={styles.adminEmpty}>No leads yet</p>
              ) : (
                <div className="leads-list">
                  {leads.map((lead) => (
                    <div key={lead.id} className="lead-card">
                      <div className="lead-card-header">
                        <div>
                          <h4>
                            {lead.firstName} {lead.lastName}
                          </h4>
                          <p className="lead-sub">
                            {lead.createdAt
                              ? new Date(
                                  lead.createdAt
                                ).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                        <div className="lead-status-wrap">
                          <label className="lead-status-label">Status</label>
                          <select
                            className="lead-status-select"
                            value={lead.status || "new"}
                            onChange={(e) =>
                              handleUpdateLeadStatus(lead.id, e.target.value)
                            }
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="sold">Sold</option>
                          </select>
                        </div>
                      </div>

                      <div className="lead-grid">
                        <div className="lead-field">
                          <span className="lead-label">Phone</span>
                          <span className="lead-value">{lead.phone}</span>
                        </div>
                        <div className="lead-field">
                          <span className="lead-label">Email</span>
                          <span className="lead-value">
                            {lead.email || "N/A"}
                          </span>
                        </div>
                        <div className="lead-field">
                          <span className="lead-label">Contact Pref</span>
                          <span className="lead-value">
                            {lead.contactPreference || "phone"}
                          </span>
                        </div>
                      </div>

                      {lead.preferredCar && (
                        <div className="lead-notes">
                          <strong>Car Interest:</strong>
                          <p>{lead.preferredCar}</p>
                        </div>
                      )}

                      {lead.notes && (
                        <div className="lead-notes">
                          <strong>Notes:</strong>
                          <p>{lead.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
