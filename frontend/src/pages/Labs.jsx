import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import labBanner from "../assets/Blue Gradient Health Medical Billboard.png";

const CATEGORY_COLORS = {
  Haematology: "bg-red-100 text-red-700",
  Biochemistry: "bg-blue-100 text-blue-700",
  Microbiology: "bg-green-100 text-green-700",
  Serology: "bg-purple-100 text-purple-700",
  Hormones: "bg-yellow-100 text-yellow-700",
  Imaging: "bg-orange-100 text-orange-700",
};

const FALLBACK_IMAGES = [
  "https://res.cloudinary.com/dg12bmvxm/image/upload/SYNLAB-Nigeria_djpa9b",
  "https://res.cloudinary.com/dg12bmvxm/image/upload/Lancet-Laboratories-300x160_enxlwv",
];

const Labs = () => {
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [labsLoading, setLabsLoading] = useState(false);
  const [labsError, setLabsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    setLabsLoading(true);
    setLabsError("");
    try {
      const { data } = await axios.get(`${backendUrl}/api/lab/list`);
      if (!data.success) {
        const message = data.message || "Failed to load labs";
        setLabsError(message);
        toast.error(message);
        return;
      }

      const raw = data.labs || [];

      const groups = raw.reduce((acc, lab) => {
        const name = (lab.name || lab._id || "").toLowerCase().trim();
        if (!acc[name]) acc[name] = [];
        acc[name].push(lab);
        return acc;
      }, {});

      const finalList = Object.values(groups).map((group) => {
        group.sort((a, b) => {
          const aHasAddress = a.address && String(a.address).trim() !== "" ? 1 : 0;
          const bHasAddress = b.address && String(b.address).trim() !== "" ? 1 : 0;
          if (bHasAddress - aHasAddress) return bHasAddress - aHasAddress;

          const aHasHours = a.operatingHours && String(a.operatingHours).trim() !== "" ? 1 : 0;
          const bHasHours = b.operatingHours && String(b.operatingHours).trim() !== "" ? 1 : 0;
          if (bHasHours - aHasHours) return bHasHours - aHasHours;

          const aHasLogo = a.logo ? 1 : 0;
          const bHasLogo = b.logo ? 1 : 0;
          return bHasLogo - aHasLogo;
        });
        return group[0];
      });

      setLabs(finalList);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to load labs";
      setLabsError(message);
      toast.error("Failed to load labs");
    } finally {
      setLabsLoading(false);
    }
  };

  const fetchTests = async (labId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/lab/tests/${labId}`);
      if (data.success) setTests(data.tests);
    } catch {
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLab = (lab) => {
    setSelectedLab(lab);
    setSelectedTests([]);
    setSearchQuery("");
    setActiveCategory("All");
    fetchTests(lab._id);
  };

  const toggleTest = (test) => {
    setSelectedTests((prev) =>
      prev.find((t) => t._id === test._id)
        ? prev.filter((t) => t._id !== test._id)
        : [...prev, test]
    );
  };

  const categories = ["All", ...new Set(tests.map((t) => t.category).filter(Boolean))];

  const filteredTests = tests.filter((t) => {
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const matchSearch = t.testName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const subtotal = selectedTests.reduce((s, t) => s + t.price, 0);
  const serviceCharge = parseFloat((subtotal * 0.05).toFixed(2));
  const vat = parseFloat(((subtotal + serviceCharge) * 0.075).toFixed(2));
  const total = parseFloat((subtotal + serviceCharge + vat).toFixed(2));

  const handleProceed = () => {
    if (!token) {
      toast.info("Please log in to book lab tests");
      return navigate("/login");
    }
    if (!selectedTests.length) return toast.error("Please select at least one test");
    navigate("/lab-booking", {
      state: { lab: selectedLab, tests: selectedTests, billing: { subtotal, serviceCharge, vat, total } },
    });
  };

  return (
  <>
    {/* Hero Section */}
    <div
      className="relative h-[350px] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${labBanner})`,
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center px-6 text-white">
        <div>
          <h1 className="text-5xl font-bold mb-4">
            Diagnostic Laboratories
          </h1>

          <p className="text-lg text-blue-100">
            Book lab tests recommended by your doctor or self-request. Results
            delivered securely.
          </p>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Lab Selection Cards */}
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Select a Laboratory
      </h2>

      {labsLoading && (
        <p className="text-gray-400 bg-white border border-gray-100 rounded-lg p-4 mb-4">
          Loading laboratories...
        </p>
      )}

      {!labsLoading && labsError && (
        <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
          {labsError}
        </p>
      )}

      {!labsLoading && !labsError && labs.length === 0 && (
        <p className="text-gray-500 bg-white border border-gray-100 rounded-lg p-4 mb-4">
          No laboratories are available yet.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {labs.map((lab, idx) => (
          <div
            key={lab._id}
            onClick={() => handleSelectLab(lab)}
            className={`rounded-xl border-2 cursor-pointer transition-all p-5 flex items-start gap-4 shadow-sm hover:shadow-md ${
              selectedLab?._id === lab._id
                ? "border-teal-500 bg-teal-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <img
              src={lab.logo || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
              alt={lab.name}
              className="w-14 h-14 rounded-lg object-contain"
            />

            <div>
              <h3 className="font-bold text-gray-800 text-lg">{lab.name}</h3>
              <p className="text-sm text-gray-500">{lab.address}</p>

              {lab.operatingHours && (
                <p className="text-xs text-teal-600 mt-1">
                  🕐 {lab.operatingHours}
                </p>
              )}

              {selectedLab?._id === lab._id && (
                <span className="mt-2 inline-block text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedLab && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Your existing Tests List and Summary components remain unchanged */}
        </div>
      )}
    </div>
  </>
);
};

export default Labs;