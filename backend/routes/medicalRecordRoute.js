import express from "express";
import {
  getPatientRecord, addConsultation, updateMedicalHistory,
  getMyMedicalHistory, adminGetPatientRecord,
} from "../controllers/medicalRecordController.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";
import authAdmin from "../middlewares/authAdmin.js";

const medicalRecordRouter = express.Router();

// Patient
medicalRecordRouter.get("/my-history", authUser, getMyMedicalHistory);

// Doctor
medicalRecordRouter.get("/patient/:patientId", authDoctor, getPatientRecord);
medicalRecordRouter.post("/consultation/add", authDoctor, addConsultation);
medicalRecordRouter.put("/medical-history/update", authDoctor, updateMedicalHistory);

// Admin
medicalRecordRouter.get("/admin/patient/:patientId", authAdmin, adminGetPatientRecord);

export default medicalRecordRouter;