// LeadsForm.jsx - Frontend component for submitting leads

import React, { useState } from "react";

const LeadsForm = ({ cars = [] }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    contactPreference: "email",
    preferredCar: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      setError("First name and last name are required");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const newLead = await response.json();
      console.log("Lead created:", newLead);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        contactPreference: "email",
        preferredCar: "",
        notes: "",
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="leads-form-section">
      <h2>Want Us To Call You About A Car?</h2>
      <p>
        Leave your details and a vehicle you are interested in, and someone from
        Grandpas Auto will reach out to you as soon as possible.
      </p>

      <form className="leads-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        {success && (
          <div className="form-success">
            ✓ Thank you! We'll be in touch soon.
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="John"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Doe"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(757) 555-1234"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactPreference">Preferred Contact Method</label>
            <select
              id="contactPreference"
              name="contactPreference"
              value={formData.contactPreference}
              onChange={handleChange}
              className="form-control"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text Message</option>
              <option value="no-preference">No Preference</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="preferredCar">Interested In A Car?</label>
            <select
              id="preferredCar"
              name="preferredCar"
              value={formData.preferredCar}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">-- Select a car --</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.year} {car.make} {car.model} - $
                  {Number(car.price || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Tell us more about what you're looking for..."
            rows="4"
            className="form-control"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary btn-lg"
        >
          {submitting ? "Submitting..." : "Get In Touch"}
        </button>
      </form>
    </section>
  );
};

export default LeadsForm;
