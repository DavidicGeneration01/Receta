import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const TAB_LIST = [
  { key: "consultation", label: "Consultation History", icon: "🩺" },
  { key: "medical", label: "Medical History", icon: "📋" },
  { key: "laboratory", label: "Laboratory History", icon: "🧪" },
];

const MedicalHistory = () => {
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [record, setRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("consultation");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/medical-record/my-history`, {
        headers: { token },
      });
      if (data.success) setRecord(data.record);
    } catch {
      toast.error("Failed to load medical history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading your medical history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Medical History</h1>
        <p className="text-sm text-gray-500 mb-6">
          Managed by your doctors and Receta administration
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {TAB_LIST.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-teal-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── CONSULTATION HISTORY ── */}
        {activeTab === "consultation" && (
          <div className="space-y-4">
            {!record?.consultationHistory?.length ? (
              <EmptyState icon="🩺" text="No consultation records yet" />
            ) : (
              record.consultationHistory.map((c, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{c.doctorName || "Doctor"}</p>
                      <p className="text-sm text-teal-600">{c.speciality}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(c.date).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Chief Complaint" value={c.chiefComplaint} />
                    <InfoRow label="Clinical Findings" value={c.clinicalFindings} />
                    <InfoRow label="Diagnosis" value={c.diagnosis} />
                    <InfoRow label="Treatment Plan" value={c.treatmentPlan} />
                    <InfoRow label="Prescription" value={c.prescription} />
                    {c.followUpDate && (
                      <InfoRow
                        label="Follow-up Date"
                        value={new Date(c.followUpDate).toLocaleDateString("en-NG")}
                      />
                    )}
                  </div>
                  {c.notes && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                      📝 {c.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── MEDICAL HISTORY ── */}
        {activeTab === "medical" && (
          <div className="space-y-4">
            {!record ? (
              <EmptyState icon="📋" text="No medical history recorded yet" />
            ) : (
              <>
                {/* Vitals */}
                <Section title="Vitals & Profile">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Blood Group" value={record.bloodGroup || "—"} />
                    <StatCard label="Genotype" value={record.genotype || "—"} />
                    <StatCard label="Weight" value={record.weight ? `${record.weight} kg` : "—"} />
                    <StatCard label="Height" value={record.height ? `${record.height} cm` : "—"} />
                  </div>
                </Section>

                {/* Allergies */}
                <Section title="Allergies">
                  {record.allergies?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {record.allergies.map((a, i) => (
                        <span key={i} className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full border border-red-100">
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400">No known allergies</p>}
                </Section>

                {/* Chronic Conditions */}
                <Section title="Chronic Conditions">
                  {record.chronicConditions?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {record.chronicConditions.map((c, i) => (
                        <span key={i} className="bg-orange-50 text-orange-700 text-sm px-3 py-1 rounded-full border border-orange-100">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400">None recorded</p>}
                </Section>

                {/* Current Medications */}
                <Section title="Current Medications">
                  {record.currentMedications?.length ? (
                    <div className="space-y-2">
                      {record.currentMedications.map((m, i) => (
                        <div key={i} className="flex flex-wrap gap-x-6 gap-y-1 bg-blue-50 rounded-lg px-4 py-2 text-sm">
                          <span className="font-medium text-blue-800">{m.name}</span>
                          <span className="text-blue-600">{m.dosage}</span>
                          <span className="text-blue-500">{m.frequency}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400">None</p>}
                </Section>

                {/* Surgical History */}
                <Section title="Surgical History">
                  {record.surgicalHistory?.length ? (
                    <div className="space-y-2">
                      {record.surgicalHistory.map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg px-4 py-2 text-sm">
                          <span className="font-medium text-gray-800">{s.procedure}</span>
                          {s.hospital && <span className="text-gray-500 ml-2">@ {s.hospital}</span>}
                          {s.date && <span className="text-gray-400 ml-2">({new Date(s.date).getFullYear()})</span>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400">None</p>}
                </Section>

                {/* Family History */}
                {record.familyHistory && (
                  <Section title="Family History">
                    <p className="text-sm text-gray-700">{record.familyHistory}</p>
                  </Section>
                )}
              </>
            )}
          </div>
        )}

        {/* ── LABORATORY HISTORY ── */}
        {activeTab === "laboratory" && (
          <div className="space-y-4">
            {!record?.laboratoryHistory?.length ? (
              <EmptyState icon="🧪" text="No lab tests recorded yet" />
            ) : (
              record.laboratoryHistory.map((l, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{l.labName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(l.date).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                      </p>
                    </div>
                    {l.resultUrl && (
                      <a
                        href={l.resultUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition"
                      >
                        View Result
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {l.testsOrdered?.map((t, j) => (
                      <span key={j} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-lg">
                        {t}
                      </span>
                    ))}
                  </div>
                  {l.resultSummary && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-2">
                      📝 {l.resultSummary}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Ordered by: {l.orderedByDoctor}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) =>
  value ? (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-gray-800 mt-0.5">{value}</p>
    </div>
  ) : null;

const StatCard = ({ label, value }) => (
  <div className="bg-teal-50 rounded-lg p-3 text-center">
    <p className="text-lg font-bold text-teal-700">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
      <span className="w-1 h-5 bg-teal-500 rounded-full inline-block" />
      {title}
    </h3>
    {children}
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
    <p className="text-4xl mb-3">{icon}</p>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

export default MedicalHistory;