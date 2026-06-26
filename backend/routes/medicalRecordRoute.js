import express from "express";
import {
  getPatientRecord, addConsultation, updateMedicalHistory,
  getMyMedicalHistory, adminGetPatientRecord,
} from "../controllers/medicalRecordController.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";
import authAdmin from "../middlewares/authAdmin.js";

const medicalRecordRouter = express.Router();

/**
 * @openapi
 * tags:
 *   - name: MedicalRecord
 *     description: Medical record endpoints
 */

// Patient
/**
 * @openapi
 * /api/medical-record/my-history:
 *   get:
 *     tags:
 *       - MedicalRecord
 *     summary: Get current user's medical history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medical history
 */
medicalRecordRouter.get("/my-history", authUser, getMyMedicalHistory);

// Doctor
/**
 * @openapi
 * /api/medical-record/patient/{patientId}:
 *   get:
 *     tags:
 *       - MedicalRecord
 *     summary: Get a patient's record (doctor)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: patientId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient record
 */
medicalRecordRouter.get("/patient/:patientId", authDoctor, getPatientRecord);

/**
 * @openapi
 * /api/medical-record/consultation/add:
 *   post:
 *     tags:
 *       - MedicalRecord
 *     summary: Add a consultation entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Consultation added
 */
medicalRecordRouter.post("/consultation/add", authDoctor, addConsultation);

/**
 * @openapi
 * /api/medical-record/medical-history/update:
 *   put:
 *     tags:
 *       - MedicalRecord
 *     summary: Update patient's medical history
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */
medicalRecordRouter.put("/medical-history/update", authDoctor, updateMedicalHistory);

// Admin
/**
 * @openapi
 * /api/medical-record/admin/patient/{patientId}:
 *   get:
 *     tags:
 *       - MedicalRecord
 *     summary: Admin retrieve patient record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: patientId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient record
 */
medicalRecordRouter.get("/admin/patient/:patientId", authAdmin, adminGetPatientRecord);

export default medicalRecordRouter;