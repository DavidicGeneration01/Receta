import React, { useContext, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const LabBooking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { backendUrl, token, userData } = useContext(AppContext);
  const printRef = useRef();

  const { lab, tests, billing } = state || {};

  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formConfirmed, setFormConfirmed] = useState(false);

  if (!lab || !tests) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No booking data found.</p>
          <button onClick={() => navigate("/labs")} className="text-teal-600 underline">
            Go back to Labs
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    if (!token) return navigate("/login");
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/lab/book`,
        { labId: lab._id, testIds: tests.map((t) => t._id), notes: "" },
        { headers: { token } }
      );
      if (data.success) {
        setBooking(data.booking);
        toast.success("Lab tests booked successfully!");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmitted = async () => {
    if (!booking) return;
    try {
      await axios.patch(
        `${backendUrl}/api/lab/form-submitted/${booking._id}`,
        {},
        { headers: { token } }
      );
      setFormConfirmed(true);
      toast.success("Form submission recorded!");
    } catch {
      toast.error("Could not record form submission.");
    }
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Receta Lab Bill</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1a1a1a; }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { font-size: 24px; color: #0d9488; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #f0fdfa; text-align: left; padding: 8px 12px; font-size: 13px; color: #0d9488; border-bottom: 2px solid #99f6e4; }
        td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
        .totals td { font-weight: bold; }
        .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; }
      </style></head>
      <body>${printContents}</body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Booking confirmed banner */}
        {booking && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Booking Confirmed!</p>
              <p className="text-sm text-green-600">Reference: <span className="font-mono">{booking._id}</span></p>
            </div>
          </div>
        )}

        {/* Bill */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" ref={printRef}>
          <div className="header text-center mb-6">
            <h1 className="text-2xl font-bold text-teal-700">RECETA</h1>
            <p className="text-gray-500 text-sm">Laboratory Test Invoice</p>
            <p className="text-gray-400 text-xs mt-1">{new Date().toLocaleDateString("en-NG", { dateStyle: "full" })}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium mb-1">Patient</p>
              <p className="font-semibold text-gray-800">{userData?.name || "—"}</p>
              <p className="text-gray-500">{userData?.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium mb-1">Laboratory</p>
              <p className="font-semibold text-gray-800">{lab.name}</p>
              <p className="text-gray-500">{lab.address}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="bg-teal-50 text-teal-700">
                <th className="text-left py-2 px-3 rounded-tl-lg">Test Name</th>
                <th className="text-right py-2 px-3 rounded-tr-lg">Price (₦)</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 px-3 text-gray-700">{t.testName}</td>
                  <td className="py-2 px-3 text-right text-gray-800">₦{t.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₦{billing.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Service Charge (5%)</span>
              <span>₦{billing.serviceCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>VAT (7.5%)</span>
              <span>₦{billing.vat.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-teal-700 text-base border-t pt-2 mt-2">
              <span>TOTAL</span>
              <span>₦{billing.total.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4 footer">
            Receta Health Platform · VAT Reg. Included · Thank you for choosing Receta
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {!booking ? (
            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium transition"
            >
              {submitting ? "Confirming..." : "Confirm Booking"}
            </button>
          ) : (
            <>
              {lab.googleFormUrl && (
                <a
                  href={lab.googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleFormSubmitted}
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
                >
                  📋 Complete Sample Collection Form
                </a>
              )}
              <button
                onClick={handlePrint}
                className="flex-1 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 py-3 rounded-xl font-medium transition"
              >
                🖨️ Print Bill
              </button>
            </>
          )}
          <button
            onClick={() => navigate("/labs")}
            className="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-medium transition"
          >
            Back to Labs
          </button>
        </div>

        {booking && !formConfirmed && lab.googleFormUrl && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p>📌 Please click the form button above to provide sample collection details. Once done, the lab will process your request.</p>
          </div>
        )}
        {formConfirmed && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
            <p>✅ Form submitted! The lab has been notified and will contact you shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabBooking;