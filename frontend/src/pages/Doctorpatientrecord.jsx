import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";

const TAB_LIST = [
  { key: "consultation", label: "Consultation History", icon: "🩺" },
  { key: "medical", label: "Medical History", icon: "📋" },
  { key: "laboratory", label: "Laboratory History", icon: "🧪" },
];

const DoctorPatientRecord = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { dToken, backendUrl } = useContext(DoctorContext);
  const [record, setRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("consultation");
  const [loading, setLoading] = useState(true);

  // Consultation form state
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [consultForm, setConsultForm] = useState({
    chiefComplaint: "", clinicalFindings: "", diagnosis: "",
    treatmentPlan: "", prescription: "", followUpDate: "", notes: "",
  });

  // Medical history edit state
  const [showMedForm, setShowMedForm] = useState(false);
  const [medForm, setMedForm] = useState({
    bloodGroup: "", genotype: "", weight: "", height: "",
    allergies: "", chronicConditions: "", familyHistory: "",
  });

  useEffect(() => {
    if (!dToken) return navigate("/login");
    fetchRecord();
  }, [dToken, patientId]);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/medical-record/patient/${patientId}`,
        { headers: { dToken } }
      );
      if (data.success) {
        setRecord(data.record);
        if (data.record) {
          setMedForm({
            bloodGroup: data.record.bloodGroup || "",
            genotype: data.record.genotype || "",
            weight: data.record.weight || "",
            height: data.record.height || "",
            allergies: (data.record.allergies || []).join(", "),
            chronicConditions: (data.record.chronicConditions || []).join(", "),
            familyHistory: data.record.familyHistory || "",
          });
        }
      }
    } catch {
      toast.error("Failed to load patient record");
    } finally {
      setLoading(false);
    }
  };

  const handleAddConsultation = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/medical-record/consultation/add`,
        { patientId, ...consultForm },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success("Consultation recorded");
        setShowConsultForm(false);
        setConsultForm({ chiefComplaint: "", clinicalFindings: "", diagnosis: "", treatmentPlan: "", prescription: "", followUpDate: "", notes: "" });
        fetchRecord();
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to save consultation");
    }
  };

  const handleUpdateMedHistory = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patientId,
        bloodGroup: medForm.bloodGroup,
        genotype: medForm.genotype,
        weight: medForm.weight ? Number(medForm.weight) : undefined,
        height: medForm.height ? Number(medForm.height) : undefined,
        allergies: medForm.allergies.split(",").map((s) => s.trim()).filter(Boolean),
        chronicConditions: medForm.chronicConditions.split(",").map((s) => s.trim()).filter(Boolean),
        familyHistory: medForm.familyHistory,
      };
      const { data } = await axios.put(
        `${backendUrl}/api/medical-record/medical-history/update`,
        payload,
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success("Medical history updated");
        setShowMedForm(false);
        fetchRecord();
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to update medical history");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading patient record...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-teal-600 mb-4 flex items-center gap-1 hover:underline">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Patient Medical Record</h1>
        <p className="text-sm text-gray-400 mb-6">View consultation, medical and laboratory history</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TAB_LIST.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border ${
                activeTab === tab.key
                  ? "bg-teal-600 text-white border-teal-600 shadow"
                  : "text-gray-600 border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── CONSULTATION HISTORY ── */}
        {activeTab === "consultation" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">Consultation Records</h2>
              <button
                onClick={() => setShowConsultForm((v) => !v)}
                className="bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-teal-700 transition"
              >
                + Add Record
              </button>
            </div>

            {showConsultForm && (
              <form onSubmit={handleAddConsultation} className="bg-white rounded-xl border border-teal-100 shadow-sm p-5 mb-4 space-y-3">
                <h3 className="font-semibold text-teal-700 mb-2">New Consultation Entry</h3>
                {[
                  ["chiefComplaint", "Chief Complaint"],
                  ["clinicalFindings", "Clinical Findings"],
                  ["diagnosis", "Diagnosis"],
                  ["treatmentPlan", "Treatment Plan"],
                  ["prescription", "Prescription"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="text-xs text-gray-500 font-medium uppercase">{label}</label>
                    <textarea
                      rows={2}
                      value={consultForm[field]}
                      onChange={(e) => setConsultForm((f) => ({ ...f, [field]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase">Follow-up Date</label>
                  <input
                    type="date"
                    value={consultForm.followUpDate}
                    onChange={(e) => setConsultForm((f) => ({ ...f, followUpDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase">Notes</label>
                  <textarea
                    rows={2}
                    value={consultForm.notes}
                    onChange={(e) => setConsultForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700 transition">
                    Save Record
                  </button>
                  <button type="button" onClick={() => setShowConsultForm(false)} className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {!record?.consultationHistory?.length ? (
              <EmptyState icon="🩺" text="No consultations recorded yet" />
            ) : (
              <div className="space-y-3">
                {[...record.consultationHistory].reverse().map((c, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">{c.diagnosis || "Consultation"}</span>
                      <span className="text-xs text-gray-400">{new Date(c.date).toLocaleDateString("en-NG", { dateStyle: "medium" })}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {c.chiefComplaint && <InfoRow label="Complaint" value={c.chiefComplaint} />}
                      {c.clinicalFindings && <InfoRow label="Findings" value={c.clinicalFindings} />}
                      {c.treatmentPlan && <InfoRow label="Treatment" value={c.treatmentPlan} />}
                      {c.prescription && <InfoRow label="Prescription" value={c.prescription} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MEDICAL HISTORY ── */}
        {activeTab === "medical" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">Medical History</h2>
              <button
                onClick={() => setShowMedForm((v) => !v)}
                className="bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-teal-700 transition"
              >
                ✏️ Update
              </button>
            </div>

            {showMedForm && (
              <form onSubmit={handleUpdateMedHistory} className="bg-white rounded-xl border border-teal-100 shadow-sm p-5 mb-4 space-y-3">
                <h3 className="font-semibold text-teal-700 mb-2">Update Medical History</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[["bloodGroup","Blood Group"],["genotype","Genotype"],["weight","Weight (kg)"],["height","Height (cm)"]].map(([field, label]) => (
                    <div key={field}>
                      <label className="text-xs text-gray-500 font-medium uppercase">{label}</label>
                      <input
                        type="text"
                        value={medForm[field]}
                        onChange={(e) => setMedForm((f) => ({ ...f, [field]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase">Allergies (comma-separated)</label>
                  <input
                    type="text"
                    value={medForm.allergies}
                    onChange={(e) => setMedForm((f) => ({ ...f, allergies: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase">Chronic Conditions (comma-separated)</label>
                  <input
                    type="text"
                    value={medForm.chronicConditions}
                    onChange={(e) => setMedForm((f) => ({ ...f, chronicConditions: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase">Family History</label>
                  <textarea
                    rows={2}
                    value={medForm.familyHistory}
                    onChange={(e) => setMedForm((f) => ({ ...f, familyHistory: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700 transition">Save</button>
                  <button type="button" onClick={() => setShowMedForm(false)} className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
                </div>
              </form>
            )}

            {!record ? (
              <EmptyState icon="📋" text="No medical history recorded yet" />
            ) : (
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Blood Group" value={record.bloodGroup || "—"} />
                    <StatCard label="Genotype" value={record.genotype || "—"} />
                    <StatCard label="Weight" value={record.weight ? `${record.weight} kg` : "—"} />
                    <StatCard label="Height" value={record.height ? `${record.height} cm` : "—"} />
                  </div>
                </div>
                {record.allergies?.length > 0 && (
                  <Section title="Allergies">
                    <div className="flex flex-wrap gap-2">
                      {record.allergies.map((a, i) => (
                        <span key={i} className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full border border-red-100">⚠️ {a}</span>
                      ))}
                    </div>
                  </Section>
                )}
                {record.chronicConditions?.length > 0 && (
                  <Section title="Chronic Conditions">
                    <div className="flex flex-wrap gap-2">
                      {record.chronicConditions.map((c, i) => (
                        <span key={i} className="bg-orange-50 text-orange-700 text-sm px-3 py-1 rounded-full border border-orange-100">{c}</span>
                      ))}
                    </div>
                  </Section>
                )}
                {record.familyHistory && (
                  <Section title="Family History">
                    <p className="text-sm text-gray-700">{record.familyHistory}</p>
                  </Section>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── LAB HISTORY ── */}
        {activeTab === "laboratory" && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-4">Laboratory History</h2>
            {!record?.laboratoryHistory?.length ? (
              <EmptyState icon="🧪" text="No lab tests recorded for this patient" />
            ) : (
              <div className="space-y-3">
                {[...record.laboratoryHistory].reverse().map((l, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-800">{l.labName}</span>
                      <span className="text-xs text-gray-400">{new Date(l.date).toLocaleDateString("en-NG", { dateStyle: "medium" })}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {l.testsOrdered?.map((t, j) => (
                        <span key={j} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-lg">{t}</span>
                      ))}
                    </div>
                    {l.resultSummary && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mb-2">{l.resultSummary}</p>
                    )}
                    {l.resultUrl && (
                      <a href={l.resultUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 underline">
                        📄 View Result
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => value ? (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-gray-800 mt-0.5 text-sm">{value}</p>
  </div>
) : null;

const StatCard = ({ label, value }) => (
  <div className="bg-teal-50 rounded-lg p-3 text-center">
    <p className="text-lg font-bold text-teal-700">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">{title}</h3>
    {children}
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
    <p className="text-4xl mb-3">{icon}</p>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

export default DoctorPatientRecord;