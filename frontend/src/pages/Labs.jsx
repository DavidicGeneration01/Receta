import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const CATEGORY_COLORS = {
  Haematology: "bg-red-100 text-red-700",
  Biochemistry: "bg-blue-100 text-blue-700",
  Microbiology: "bg-green-100 text-green-700",
  Serology: "bg-purple-100 text-purple-700",
  Hormones: "bg-yellow-100 text-yellow-700",
  Imaging: "bg-orange-100 text-orange-700",
};

const Labs = () => {
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/lab/list`);
      if (data.success) setLabs(data.labs);
    } catch {
      toast.error("Failed to load labs");
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Diagnostic Laboratories</h1>
          <p className="text-teal-100">
            Book lab tests recommended by your doctor or self-request. Results delivered securely.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Lab Selection Cards */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Select a Laboratory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {labs.map((lab) => (
            <div
              key={lab._id}
              onClick={() => handleSelectLab(lab)}
              className={`rounded-xl border-2 cursor-pointer transition-all p-5 flex items-start gap-4 shadow-sm hover:shadow-md ${
                selectedLab?._id === lab._id
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {lab.logo ? (
                <img src={lab.logo} alt={lab.name} className="w-14 h-14 rounded-lg object-contain" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-teal-100 flex items-center justify-center text-2xl">🧪</div>
              )}
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{lab.name}</h3>
                <p className="text-sm text-gray-500">{lab.address}</p>
                {lab.operatingHours && (
                  <p className="text-xs text-teal-600 mt-1">🕐 {lab.operatingHours}</p>
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

        {/* Test Catalog */}
        {selectedLab && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tests List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">
                  {selectedLab.name} — Available Tests
                </h3>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
                />

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs px-3 py-1 rounded-full border transition ${
                        activeCategory === cat
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-white text-gray-600 border-gray-300 hover:border-teal-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <p className="text-center text-gray-400 py-8">Loading tests...</p>
                ) : (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {filteredTests.map((test) => {
                      const isSelected = selectedTests.find((t) => t._id === test._id);
                      return (
                        <div
                          key={test._id}
                          onClick={() => toggleTest(test)}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                            isSelected
                              ? "border-teal-400 bg-teal-50"
                              : "border-gray-100 hover:border-teal-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected ? "bg-teal-500 border-teal-500" : "border-gray-300"
                              }`}
                            >
                              {isSelected && <span className="text-white text-xs">✓</span>}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{test.testName}</p>
                              <p className="text-xs text-gray-400">{test.sampleType} · {test.turnaroundTime}</p>
                              {test.category && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[test.category] || "bg-gray-100 text-gray-600"}`}>
                                  {test.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-semibold text-teal-700 text-sm whitespace-nowrap ml-2">
                            ₦{test.price.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                    {filteredTests.length === 0 && (
                      <p className="text-center text-gray-400 py-8">No tests found</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Summary / Cart */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>

                {selectedTests.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No tests selected yet</p>
                ) : (
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {selectedTests.map((t) => (
                      <div key={t._id} className="flex justify-between text-sm">
                        <span className="text-gray-700 flex-1 pr-2">{t.testName}</span>
                        <span className="text-gray-800 font-medium whitespace-nowrap">₦{t.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Service Charge (5%)</span>
                    <span>₦{serviceCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>VAT (7.5%)</span>
                    <span>₦{vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
                    <span>Total</span>
                    <span className="text-teal-700">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceed}
                  disabled={!selectedTests.length}
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-medium transition"
                >
                  Proceed to Booking
                </button>

                {selectedLab?.googleFormUrl && (
                  <p className="text-xs text-gray-400 text-center mt-3">
                    You'll be redirected to complete a Google Form for sample collection details.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Labs;