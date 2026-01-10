import { useEffect, useMemo, useState } from "react";
import Inventory from "./components/Inventory.jsx";
import VehicleDetailModal from "./components/VehicleDetailModal.jsx";
import LoginModal from "./components/LoginModal.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import GrandpasLogo from "./assets/GrandpasLogo.png";

// App.jsx
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://defenceable-hugo-exultantly.ngrok-free.dev/api";

function App() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [leads, setLeads] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMake, setFilterMake] = useState("all");
  const [filterModel, setFilterModel] = useState("all");
  const [sortBy, setSortBy] = useState("none");

  // load cars + leads from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [carsRes, leadsRes] = await Promise.all([
          fetch(`${API_BASE}/cars`),
          fetch(`${API_BASE}/leads`),
        ]);
        const [carsData, leadsData] = await Promise.all([
          carsRes.json(),
          leadsRes.json(),
        ]);
        setCars(Array.isArray(carsData) ? carsData : []);
        setLeads(Array.isArray(leadsData) ? leadsData : []);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    loadData();
  }, []);

  const handleOpenDetail = (car) => setSelectedCar(car);
  const handleCloseDetail = () => setSelectedCar(null);

  const handleAdminClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowLoginModal(false);
    setShowAdminPanel(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setShowAdminPanel(false);
  };

  const closeLoginModal = () => setShowLoginModal(false);
  const closeAdminPanel = () => setShowAdminPanel(false);

  const handleSubmitLead = async (leadData) => {
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
      if (!res.ok) throw new Error("Failed to save lead");
      const saved = await res.json();
      setLeads((prev) => [...prev, saved]);
      alert("Thank you! Your request was sent to Grandpas Auto.");
    } catch (err) {
      console.error("Error saving lead", err);
      alert("Could not save your request. Please try again.");
    }
  };

  // filter options
  const { years, makes, models } = useMemo(() => {
    const yearSet = new Set();
    const makeSet = new Set();
    const modelSet = new Set();

    cars.forEach((car) => {
      if (car.year) yearSet.add(String(car.year));
      if (car.make) makeSet.add(car.make);
      if (car.model) modelSet.add(car.model);
    });

    const sortNumericDesc = (arr) =>
      arr
        .map((v) => Number(v))
        .filter((n) => !Number.isNaN(n))
        .sort((a, b) => b - a)
        .map((n) => String(n));

    return {
      years: sortNumericDesc(Array.from(yearSet)),
      makes: Array.from(makeSet).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      ),
      models: Array.from(modelSet).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      ),
    };
  }, [cars]);

  // filtered + sorted list
  const filteredCars = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    let list = cars.filter((car) => {
      const yearStr = String(car.year ?? "");
      const makeStr = String(car.make ?? "");
      const modelStr = String(car.model ?? "");

      const haystack = `${yearStr} ${makeStr} ${modelStr}`.toLowerCase();
      const searchOk = term ? haystack.includes(term) : true;

      const yearOk = filterYear === "all" || yearStr === String(filterYear);
      const makeOk =
        filterMake === "all" ||
        makeStr.toLowerCase() === String(filterMake).toLowerCase();
      const modelOk =
        filterModel === "all" ||
        modelStr.toLowerCase() === String(filterModel).toLowerCase();

      return searchOk && yearOk && makeOk && modelOk;
    });

    if (sortBy === "price-asc") {
      list = [...list].sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0)
      );
    } else if (sortBy === "price-desc") {
      list = [...list].sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0)
      );
    } else if (sortBy === "year-asc") {
      list = [...list].sort(
        (a, b) => Number(a.year || 0) - Number(b.year || 0)
      );
    } else if (sortBy === "year-desc") {
      list = [...list].sort(
        (a, b) => Number(b.year || 0) - Number(a.year || 0)
      );
    }

    return list;
  }, [cars, searchTerm, filterYear, filterMake, filterModel, sortBy]);

  const featured = cars.length > 0 ? cars[0] : null;

  return (
    <div className="app-root">
      <header className="site-header">
        <div className="header-inner">
          <div className="header-logo">
            <div className="logo-mark">
              <img
                src={GrandpasLogo}
                alt="Grandpa's Autos"
                className="logo-image"
              />
              <div className="logo-text">
                <span className="logo-title">Grandpa&apos;s Auto</span>
                <span className="logo-subtitle">Gloucester, VA</span>
              </div>
            </div>
          </div>

          <div className="header-right-block">
            <nav className="main-nav">
              <a href="#inventory">Inventory</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
              <a href="#lead-request">Get a callback</a>
            </nav>

            <div className="header-actions">
              <button
                className="admin-login-btn"
                onClick={handleAdminClick}
                title="Admin Login"
              >
                {isAdminLoggedIn ? "Admin" : "Login"}
              </button>
              {isAdminLoggedIn && (
                <button
                  className="admin-logout-btn"
                  onClick={handleAdminLogout}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="hero-tag">Trusted local dealership</p>
              <h1>Drive away in a car you love.</h1>
              <p className="hero-body">
                Hand‑picked used vehicles with transparent pricing, detailed
                photos, and an easy buying experience from a team that knows
                Gloucester.
              </p>
              <div className="hero-actions">
                <a href="#inventory" className="btn-primary hero-btn">
                  Browse inventory
                </a>
                <a href="#lead-request" className="btn-secondary hero-btn">
                  Request a callback
                </a>
              </div>
              <div className="hero-meta">
                <span>
                  8274 George Washington Memorial Hwy, Gloucester, VA
                </span>
                <span>Sales: (757) 664-3059</span>
              </div>
            </div>

            {featured && (
              <div className="hero-card">
                <div className="hero-card-header">
                  <span className="pill pill-live">Live inventory</span>
                  <span className="hero-card-label">Featured pick</span>
                </div>
                <div className="hero-card-body">
                  {featured.imageUrl && (
                    <div className="hero-card-image">
                      <img
                        src={featured.imageUrl}
                        alt={`${featured.year} ${featured.make} ${featured.model}`}
                      />
                    </div>
                  )}
                  <h2>
                    {featured.year} {featured.make} {featured.model}
                  </h2>
                  <p className="hero-car-price">
                    ${Number(featured.price || 0).toLocaleString()}
                    {typeof featured.mileage === "number" && (
                      <span className="hero-car-meta">
                        {" "}
                        • {Number(featured.mileage).toLocaleString()} miles
                      </span>
                    )}
                  </p>
                  <p className="hero-car-location">
                    {(featured.city || "Gloucester")},{" "}
                    {featured.state || "VA"}
                  </p>
                  <button
                    className="btn-outline hero-view-btn"
                    onClick={() => setSelectedCar(featured)}
                  >
                    View details
                  </button>
                </div>
                <div className="hero-card-footer">
                  <span className="hero-footer-label">Included</span>
                  <span>Multi-point inspection</span>
                  <span>Clean title check</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="inventory" className="inventory-section">
          <div className="inventory-shell">
            <div className="inventory-header-row">
              <div>
                <h2 className="inventory-title">Shop our inventory</h2>
                <p className="inventory-subtitle">
                  Filter by year, make, and model, then sort by price or year.
                </p>
              </div>

              <div className="inventory-controls">
                <div className="inventory-search">
                  <input
                    type="text"
                    className="inventory-search-input"
                    placeholder="Search 2018 Camry, Silverado, etc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="inventory-filters-row">
                  <select
                    className="inventory-select"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                  >
                    <option value="all">All years</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  <select
                    className="inventory-select"
                    value={filterMake}
                    onChange={(e) => setFilterMake(e.target.value)}
                  >
                    <option value="all">All makes</option>
                    {makes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    className="inventory-select"
                    value={filterModel}
                    onChange={(e) => setFilterModel(e.target.value)}
                  >
                    <option value="all">All models</option>
                    {models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    className="inventory-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="none">Sort: default</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="year-desc">Year: newest first</option>
                    <option value="year-asc">Year: oldest first</option>
                  </select>
                </div>
              </div>
            </div>

            <Inventory cars={filteredCars} onOpenDetail={handleOpenDetail} />
          </div>
        </section>

        <section id="lead-request" className="lead-section">
          <div className="lead-inner">
            <div>
              <h2>Want us to call you about a car?</h2>
              <p className="lead-body">
                Leave your details and a vehicle you are interested in, and
                someone from Grandpas Auto will reach out to you as soon as
                possible.
              </p>
            </div>

            <form
              className="lead-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const lead = {
                  firstName: formData.get("firstName")?.toString().trim(),
                  lastName: formData.get("lastName")?.toString().trim(),
                  phone: formData.get("phone")?.toString().trim(),
                  email: formData.get("email")?.toString().trim(),
                  preferredCar: formData
                    .get("preferredCar")
                    ?.toString()
                    .trim(),
                  notes: formData.get("notes")?.toString().trim(),
                  contactPreference: formData
                    .get("contactPreference")
                    ?.toString(),
                };
                if (!lead.firstName || !lead.phone) {
                  alert(
                    "Please include at least your name and phone number."
                  );
                  return;
                }
                await handleSubmitLead(lead);
                e.currentTarget.reset();
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Jane"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="(804) 555-1234"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="preferredCar">Vehicle interested in</label>
                <input
                  type="text"
                  id="preferredCar"
                  name="preferredCar"
                  placeholder="Year, make, model or stock number"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactPreference">
                    Contact preference
                  </label>
                  <select
                    id="contactPreference"
                    name="contactPreference"
                    defaultValue="phone"
                  >
                    <option value="phone">Phone call</option>
                    <option value="text">Text message</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Anything else we should know?</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  placeholder="Best time to call, trade-in details, budget, etc."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Submit lead
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} Grandpas Auto</span>
          <span className="footer-dot">•</span>
          <span>
            8274 George Washington Memorial Hwy, Gloucester, VA 23061
          </span>
        </div>
      </footer>

      {selectedCar && (
        <VehicleDetailModal car={selectedCar} onClose={handleCloseDetail} />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={closeLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showAdminPanel && isAdminLoggedIn && (
        <AdminPanel
          onClose={closeAdminPanel}
          onLogout={handleAdminLogout}
          cars={cars}
          setCars={setCars}
          leads={leads}
          setLeads={setLeads}
        />
      )}
    </div>
  );
}

export default App;
