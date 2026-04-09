import patientMedicalRecordModel from "../models/patientMedicalRecordModel.js";

// ─── DOCTOR ───────────────────────────────────────────────────────────────────

// Doctor: get full patient record (all 3 histories)
export const getPatientRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    let record = await patientMedicalRecordModel
      .findOne({ userId: patientId })
      .populate("consultationHistory.doctorId", "name speciality image")
      .populate("laboratoryHistory.labBookingId");

    if (!record) {
      record = { consultationHistory: [], medicalHistory: {}, laboratoryHistory: [] };
    }
    res.json({ success: true, record });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Doctor: add consultation entry
export const addConsultation = async (req, res) => {
  try {
    const { docId } = req.body;
    const {
      patientId, appointmentId, doctorName, speciality,
      chiefComplaint, clinicalFindings, diagnosis,
      treatmentPlan, prescription, followUpDate, notes,
    } = req.body;

    const entry = {
      date: new Date(),
      doctorId: docId,
      doctorName,
      speciality,
      chiefComplaint,
      clinicalFindings,
      diagnosis,
      treatmentPlan,
      prescription,
      followUpDate,
      notes,
    };

    const record = await patientMedicalRecordModel.findOneAndUpdate(
      { userId: patientId },
      {
        $push: { consultationHistory: entry },
        $set: { lastUpdatedBy: docId, lastUpdatedByRole: "doctor" },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, record, message: "Consultation recorded" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Doctor: update patient medical history (allergies, conditions, medications, etc.)
export const updateMedicalHistory = async (req, res) => {
  try {
    const { docId } = req.body;
    const {
      patientId, allergies, chronicConditions, currentMedications,
      surgicalHistory, familyHistory, bloodGroup, genotype, weight, height,
    } = req.body;

    const update = {
      lastUpdatedBy: docId,
      lastUpdatedByRole: "doctor",
    };
    if (allergies !== undefined) update.allergies = allergies;
    if (chronicConditions !== undefined) update.chronicConditions = chronicConditions;
    if (currentMedications !== undefined) update.currentMedications = currentMedications;
    if (surgicalHistory !== undefined) update.surgicalHistory = surgicalHistory;
    if (familyHistory !== undefined) update.familyHistory = familyHistory;
    if (bloodGroup !== undefined) update.bloodGroup = bloodGroup;
    if (genotype !== undefined) update.genotype = genotype;
    if (weight !== undefined) update.weight = weight;
    if (height !== undefined) update.height = height;

    const record = await patientMedicalRecordModel.findOneAndUpdate(
      { userId: patientId },
      { $set: update },
      { upsert: true, new: true }
    );

    res.json({ success: true, record, message: "Medical history updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── USER (PATIENT) ───────────────────────────────────────────────────────────

// Patient: view own medical history
export const getMyMedicalHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    const record = await patientMedicalRecordModel
      .findOne({ userId })
      .populate("consultationHistory.doctorId", "name speciality image")
      .populate("laboratoryHistory.labBookingId");

    res.json({ success: true, record: record || null });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// Admin: get any patient record
export const adminGetPatientRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const record = await patientMedicalRecordModel
      .findOne({ userId: patientId })
      .populate("consultationHistory.doctorId", "name speciality image")
      .populate("laboratoryHistory.labBookingId")
      .populate("userId", "name email phone image");

    res.json({ success: true, record: record || null });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};