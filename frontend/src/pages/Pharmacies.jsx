import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Pharmacies = () => {
  const { backendUrl } = useContext(AppContext);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/list`);
      if (data.success) setPharmacies(data.pharmacies);
    } catch {
      toast.error("Failed to load pharmacies");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Pharmacies</h1>
          <p className="text-indigo-100">
            Find pharmacies near you to fill prescriptions from your doctor.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-gray-400">Loading pharmacies...</p>
        ) : pharmacies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">💊</p>
            <p className="text-gray-500">No pharmacies listed yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pharmacies.map((p) => (
              <div key={p._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="w-16 h-16 rounded-lg object-contain mb-4" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center text-3xl mb-4">💊</div>
                )}
                <h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
                {p.address && <p className="text-sm text-gray-500 mt-1">📍 {p.address}</p>}
                {p.phone && <p className="text-sm text-gray-500 mt-1">📞 {p.phone}</p>}
                {p.operatingHours && (
                  <p className="text-xs text-indigo-600 mt-2">🕐 {p.operatingHours}</p>
                )}
                {p.email && (
                  <a
                    href={`mailto:${p.email}`}
                    className="mt-3 inline-block text-xs text-indigo-600 underline hover:text-indigo-800"
                  >
                    {p.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pharmacies;