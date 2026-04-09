import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const TABS = ["Labs", "Tests", "Bookings"];
const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  sample_collected: "bg-indigo-100 text-indigo-700",
  processing: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const LabManagement = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [activeTab, setActiveTab] = useState("Labs");

  // Labs
  const [labs, setLabs] = useState([]);
  const [labForm, setLabForm] = useState({ name: "", slug: "", address: "", phone: "", googleFormUrl: "", operatingHours: "" });

  // Tests
  const [selectedLabId, setSelectedLabId] = useState("");
  const [tests, setTests] = useState([]);
  const [testForm, setTestForm] = useState({ labId: "", testName: "", category: "", sampleType: "", turnaroundTime: "", price: "" });

  // Bookings
  const [bookings, setBookings] = useState([]);

  useEffect(() => { fetchLabs(); fetchAllBookings(); }, []);
  useEffect(() => { if (selectedLabId) fetchTests(selectedLabId); }, [selectedLabId]);

  const fetchLabs = async () => {
    const { data } = await axios.get(`${backendUrl}/api/lab/list`);
    if (data.success) setLabs(data.labs);
  };

  const fetchTests = async (labId) => {
    const { data } = await axios.get(`${backendUrl}/api/lab/tests/${labId}`);
    if (data.success) setTests(data.tests);
  };

  const fetchAllBookings = async () => {
    const { data } = await axios.get(`${backendUrl}/api/lab/all-bookings`, { headers: { aToken } });
    if (data.success) setBookings(data.bookings);
  };

  const handleUpsertLab = async (e) => {
    e.preventDefault();
    const { data } = await axios.post(`${backendUrl}/api/lab/upsert`, labForm, { headers: { aToken } });
    if (data.success) { toast.success("Lab saved!"); fetchLabs(); setLabForm({ name: "", slug: "", address: "", phone: "", googleFormUrl: "", operatingHours: "" }); }
    else toast.error(data.message);
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    const payload = { ...testForm, labId: selectedLabId, price: Number(testForm.price) };
    const { data } = await axios.post(`${backendUrl}/api/lab/test/add`, payload, { headers: { aToken } });
    if (data.success) { toast.success("Test added!"); fetchTests(selectedLabId); setTestForm({ labId: "", testName: "", category: "", sampleType: "", turnaroundTime: "", price: "" }); }
    else toast.error(data.message);
  };

  const handleUpdatePrice = async (testId, newPrice) => {
    const { data } = await axios.patch(`${backendUrl}/api/lab/test/price/${testId}`, { price: Number(newPrice) }, { headers: { aToken } });
    if (data.success) { toast.success("Price updated"); fetchTests(selectedLabId); }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    const { data } = await axios.patch(`${backendUrl}/api/lab/booking/status/${bookingId}`, { status }, { headers: { aToken } });
    if (data.success) { toast.success("Status updated"); fetchAllBookings(); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Lab Management</h1>
      <p className="text-sm text-gray-400 mb-6">Manage Syn Lab & Lancet Lab — tests, pricing, and bookings</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
              activeTab === t ? "bg-teal-600 text-white border-teal-600 shadow" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── LABS ── */}
      {activeTab === "Labs" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Add / Update Lab</h3>
            <form onSubmit={handleUpsertLab} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[["name","Lab Name"],["slug","Slug (e.g. syn-lab)"],["address","Address"],["phone","Phone"],["operatingHours","Operating Hours"],["googleFormUrl","Google Form URL"]].map(([field, label]) => (
                <div key={field}>
                  <label className="text-xs text-gray-400 font-medium uppercase">{label}</label>
                  <input
                    type="text"
                    value={labForm[field]}
                    onChange={(e) => setLabForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    required={field === "name" || field === "slug"}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-teal-700 transition">
                  Save Lab
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {labs.map((lab) => (
              <div key={lab._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="font-bold text-gray-800">{lab.name}</p>
                <p className="text-sm text-gray-500">{lab.address}</p>
                <p className="text-xs text-teal-600 mt-1">{lab.operatingHours}</p>
                {lab.googleFormUrl && (
                  <a href={lab.googleFormUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mt-1 block truncate">
                    📋 Form: {lab.googleFormUrl}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TESTS ── */}
      {activeTab === "Tests" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-wrap gap-3 items-end mb-4">
              <div>
                <label className="text-xs text-gray-400 font-medium uppercase">Select Lab</label>
                <select
                  value={selectedLabId}
                  onChange={(e) => setSelectedLabId(e.target.value)}
                  className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                >
                  <option value="">-- choose lab --</option>
                  {labs.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            {selectedLabId && (
              <form onSubmit={handleAddTest} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 border-t pt-4">
                <h3 className="sm:col-span-3 font-semibold text-gray-700 text-sm">Add New Test</h3>
                {[["testName","Test Name"],["category","Category"],["sampleType","Sample Type"],["turnaroundTime","Turnaround"],["price","Price (₦)"]].map(([field, label]) => (
                  <div key={field}>
                    <label className="text-xs text-gray-400 font-medium uppercase">{label}</label>
                    <input
                      type={field === "price" ? "number" : "text"}
                      value={testForm[field]}
                      onChange={(e) => setTestForm((f) => ({ ...f, [field]: e.target.value }))}
                      required={field === "testName" || field === "price"}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                  </div>
                ))}
                <div className="sm:col-span-3">
                  <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-teal-700 transition">
                    Add Test
                  </button>
                </div>
              </form>
            )}
          </div>

          {tests.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-teal-50 text-teal-700">
                  <tr>
                    <th className="text-left py-3 px-4">Test Name</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Sample</th>
                    <th className="text-left py-3 px-4">Turnaround</th>
                    <th className="text-left py-3 px-4">Price (₦)</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((t) => (
                    <TestRow key={t._id} test={t} onUpdatePrice={handleUpdatePrice} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── BOOKINGS ── */}
      {activeTab === "Bookings" && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{b.userId?.name}</p>
                  <p className="text-xs text-gray-400">{b.userId?.email}</p>
                  <p className="text-sm text-teal-600 mt-1">{b.labId?.name}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {b.tests?.map((t, i) => (
                      <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded">{t.testName}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-700">₦{(b.total||0).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status] || "bg-gray-100 text-gray-600"}`}>
                    {b.status?.replace("_"," ").toUpperCase()}
                  </span>
                  <div className="mt-2">
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                    >
                      {["pending","confirmed","sample_collected","processing","completed","cancelled"].map((s) => (
                        <option key={s} value={s}>{s.replace("_"," ")}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-3">🧪</p>
              <p className="text-gray-400">No bookings yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Inline editable price row
const TestRow = ({ test, onUpdatePrice }) => {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(test.price);

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition">
      <td className="py-2 px-4">{test.testName}</td>
      <td className="py-2 px-4 text-gray-500">{test.category || "—"}</td>
      <td className="py-2 px-4 text-gray-500">{test.sampleType || "—"}</td>
      <td className="py-2 px-4 text-gray-500">{test.turnaroundTime || "—"}</td>
      <td className="py-2 px-4">
        {editing ? (
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-24 border border-teal-300 rounded px-2 py-1 text-sm focus:outline-none"
          />
        ) : (
          <span className="font-medium text-teal-700">₦{test.price.toLocaleString()}</span>
        )}
      </td>
      <td className="py-2 px-4">
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => { onUpdatePrice(test._id, price); setEditing(false); }}
              className="text-xs bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700"
            >Save</button>
            <button onClick={() => { setPrice(test.price); setEditing(false); }} className="text-xs text-gray-400 hover:underline">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xs text-teal-600 hover:underline">Edit Price</button>
        )}
      </td>
    </tr>
  );
};

export default LabManagement;