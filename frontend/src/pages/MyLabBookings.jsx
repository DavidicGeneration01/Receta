import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  sample_collected: "bg-indigo-100 text-indigo-700",
  processing: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const MyLabBookings = () => {
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/lab/my-bookings`, {
        headers: { token },
      });
      if (data.success) setBookings(data.bookings);
    } catch {
      toast.error("Failed to load lab bookings");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBill = (booking) => {
    const w = window.open("", "_blank");
    const tests = booking.tests || [];
    const rows = tests.map(
      (t) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${t.testName}</td><td style="padding:8px 12px;text-align:right;border-bottom:1px solid #e5e7eb">₦${(t.price || 0).toLocaleString()}</td></tr>`
    ).join("");

    w.document.write(`
      <html><head><title>Lab Bill – ${booking._id}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#1a1a1a}
        h1{color:#0d9488;text-align:center}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th{background:#f0fdfa;text-align:left;padding:8px 12px;color:#0d9488;border-bottom:2px solid #99f6e4}
        .total-row td{font-weight:bold;border-top:2px solid #e5e7eb;padding-top:12px}
        .footer{margin-top:32px;font-size:11px;color:#9ca3af;text-align:center}
      </style></head>
      <body>
        <h1>RECETA — Lab Invoice</h1>
        <p style="text-align:center;color:#6b7280;font-size:13px">Booking Ref: ${booking._id}</p>
        <p style="text-align:center;color:#6b7280;font-size:13px">${new Date(booking.createdAt).toLocaleDateString("en-NG",{dateStyle:"full"})}</p>
        <p style="margin-top:12px;font-size:13px"><strong>Lab:</strong> ${booking.labId?.name || "—"}</p>
        <table>
          <thead><tr><th>Test Name</th><th style="text-align:right">Price (₦)</th></tr></thead>
          <tbody>
            ${rows}
            <tr><td style="padding:8px 12px">Subtotal</td><td style="text-align:right;padding:8px 12px">₦${(booking.subtotal||0).toLocaleString()}</td></tr>
            <tr><td style="padding:8px 12px">Service Charge (5%)</td><td style="text-align:right;padding:8px 12px">₦${(booking.serviceCharge||0).toLocaleString()}</td></tr>
            <tr><td style="padding:8px 12px">VAT (7.5%)</td><td style="text-align:right;padding:8px 12px">₦${(booking.vat||0).toLocaleString()}</td></tr>
            <tr class="total-row"><td style="padding:8px 12px">TOTAL</td><td style="text-align:right;padding:8px 12px;color:#0d9488">₦${(booking.total||0).toLocaleString()}</td></tr>
          </tbody>
        </table>
        <p class="footer">Receta Health Platform · VAT Inclusive · Thank you</p>
      </body></html>`);
    w.document.close();
    w.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading your lab bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Lab Bookings</h1>
          <button
            onClick={() => navigate("/labs")}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition"
          >
            + New Booking
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">🧪</p>
            <p className="text-gray-500 mb-4">No lab bookings yet</p>
            <button
              onClick={() => navigate("/labs")}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              Browse Labs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{booking.labId?.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-600"}`}>
                        {booking.status?.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Ref: <span className="font-mono">{booking._id}</span> ·{" "}
                      {new Date(booking.createdAt).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-teal-700">₦{(booking.total || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{booking.tests?.length} test(s)</p>
                  </div>
                </div>

                {/* Tests list */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {booking.tests?.map((t, i) => (
                    <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-lg">
                      {t.testName}
                    </span>
                  ))}
                </div>

                {/* Doctor referral */}
                {booking.doctorId && (
                  <p className="text-xs text-gray-500 mb-3">
                    👨‍⚕️ Referred by Dr. {booking.doctorId.name} ({booking.doctorId.speciality})
                  </p>
                )}

                {/* Results */}
                {booking.resultUrl && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-green-700 mb-1">📄 Results Available</p>
                    {booking.resultNotes && (
                      <p className="text-xs text-green-600 mb-2">{booking.resultNotes}</p>
                    )}
                    <a
                      href={booking.resultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 underline"
                    >
                      View / Download Result
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => handlePrintBill(booking)}
                    className="text-sm border border-teal-200 text-teal-700 px-4 py-1.5 rounded-lg hover:bg-teal-50 transition"
                  >
                    🖨️ Print Bill
                  </button>
                  {booking.googleFormUrl && !booking.formSubmitted && (
                    <a
                      href={booking.googleFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm border border-blue-200 text-blue-700 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition"
                    >
                      📋 Complete Form
                    </a>
                  )}
                  {booking.formSubmitted && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      ✅ Form Submitted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLabBookings;