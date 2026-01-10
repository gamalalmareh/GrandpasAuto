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
          fetch(`${API_BASE}/carsRouter`),
          fetch(`${API_BASE}/leadsRouter`),
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
      {/* rest of your component unchanged */}
    </div>
  );
}

export default App;
