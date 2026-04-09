import mongoose from "mongoose";

const patientMedicalRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

  // Managed by doctor
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment" },

  // Consultation History (what happened during consultation)
  consultationHistory: [
    {
      date: { type: Date, default: Date.now },
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },
      doctorName: { type: String },
      speciality: { type: String },
      chiefComplaint: { type: String },
      clinicalFindings: { type: String },
      diagnosis: { type: String },
      treatmentPlan: { type: String },
      prescription: { type: String },
      followUpDate: { type: Date },
      notes: { type: String },
    },
  ],

  // Medical History (ongoing conditions, allergies, past history)
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  currentMedications: [
    {
      name: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      startDate: { type: Date },
    },
  ],
  surgicalHistory: [
    {
      procedure: { type: String },
      date: { type: Date },
      hospital: { type: String },
      notes: { type: String },
    },
  ],
  familyHistory: { type: String },
  bloodGroup: { type: String },
  genotype: { type: String },
  weight: { type: Number },
  height: { type: Number },

  // Laboratory History (lab tests ordered/results)
  laboratoryHistory: [
    {
      date: { type: Date, default: Date.now },
      labBookingId: { type: mongoose.Schema.Types.ObjectId, ref: "labBooking" },
      labName: { type: String },
      testsOrdered: [{ type: String }],
      resultSummary: { type: String },
      resultUrl: { type: String },
      orderedByDoctor: { type: String },
    },
  ],

  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },
  lastUpdatedByRole: { type: String, enum: ["doctor", "admin"], default: "doctor" },
}, { timestamps: true });

const patientMedicalRecordModel =
  mongoose.models.patientMedicalRecord ||
  mongoose.model("patientMedicalRecord", patientMedicalRecordSchema);

export default patientMedicalRecordModel;