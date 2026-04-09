import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Pharmacy = () => {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPharmacy();
  }, [pharmacyId]);

  const fetchPharmacy = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/list`);
      if (data.success) {
        const found = data.pharmacies.find((p) => p._id === pharmacyId);
        if (found) setPharmacy(found);
        else toast.error("Pharmacy not found");
      }
    } catch {
      toast.error("Failed to load pharmacy");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading pharmacy details...</p>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-4xl mb-4">💊</p>
          <p className="text-gray-500 mb-4">Pharmacy not found.</p>
          <button
            onClick={() => navigate("/pharmacies")}
            className="text-indigo-600 underline"
          >
            Back to Pharmacies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/pharmacies")}
          className="text-sm text-indigo-600 hover:underline mb-6 flex items-center gap-1"
        >
          ← Back to Pharmacies
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Logo / Icon */}
          {pharmacy.logo ? (
            <img
              src={pharmacy.logo}
              alt={pharmacy.name}
              className="w-20 h-20 rounded-xl object-contain mb-6"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-indigo-50 flex items-center justify-center text-4xl mb-6">
              💊
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-800 mb-1">{pharmacy.name}</h1>

          <div className="mt-6 space-y-4 text-sm text-gray-600">
            {pharmacy.address && (
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Address</p>
                  <p>{pharmacy.address}</p>
                </div>
              </div>
            )}
            {pharmacy.phone && (
              <div className="flex items-start gap-3">
                <span className="text-lg">📞</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Phone</p>
                  <a href={`tel:${pharmacy.phone}`} className="text-indigo-600 hover:underline">
                    {pharmacy.phone}
                  </a>
                </div>
              </div>
            )}
            {pharmacy.email && (
              <div className="flex items-start gap-3">
                <span className="text-lg">✉️</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Email</p>
                  <a href={`mailto:${pharmacy.email}`} className="text-indigo-600 hover:underline">
                    {pharmacy.email}
                  </a>
                </div>
              </div>
            )}
            {pharmacy.operatingHours && (
              <div className="flex items-start gap-3">
                <span className="text-lg">🕐</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">
                    Operating Hours
                  </p>
                  <p>{pharmacy.operatingHours}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50">
            <p className="text-xs text-gray-400 text-center">
              Present your doctor's prescription at this pharmacy to fill your medication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;