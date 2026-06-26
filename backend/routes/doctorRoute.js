import express from 'express'
import { doctorList, loginDoctor, appointmentsDoctor, appointmentCancel, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, getDoctorPatients, addDiagnosis, getPatientMedicalRecord } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'


const doctorRouter = express.Router()

/**
 * @openapi
 * tags:
 *   - name: Doctor
 *     description: Doctor-facing endpoints
 */

/**
 * @openapi
 * /api/doctor/list:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: List available doctors
 *     responses:
 *       200:
 *         description: Doctors list
 */
doctorRouter.get('/list',doctorList)

/**
 * @openapi
 * /api/doctor/login:
 *   post:
 *     tags:
 *       - Doctor
 *     summary: Doctor login
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login response
 */
doctorRouter.post('/login',loginDoctor)

/**
 * @openapi
 * /api/doctor/appointments:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Get doctor's appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments list
 */
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)

/**
 * @openapi
 * /api/doctor/complete-appointment:
 *   post:
 *     tags:
 *       - Doctor
 *     summary: Mark appointment complete
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Completed
 */
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)

/**
 * @openapi
 * /api/doctor/cancel-appointment:
 *   post:
 *     tags:
 *       - Doctor
 *     summary: Cancel an appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cancellation response
 */
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)

/**
 * @openapi
 * /api/doctor/dashboard:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Doctor dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)

/**
 * @openapi
 * /api/doctor/profile:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Get doctor profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile
 */
doctorRouter.get('/profile',authDoctor,doctorProfile)

/**
 * @openapi
 * /api/doctor/update-profile:
 *   post:
 *     tags:
 *       - Doctor
 *     summary: Update doctor profile
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
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile)

// New patient management endpoints
/**
 * @openapi
 * /api/doctor/patients:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Get doctor's patients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients list
 */
doctorRouter.get('/patients', authDoctor, getDoctorPatients)

/**
 * @openapi
 * /api/doctor/add-diagnosis:
 *   post:
 *     tags:
 *       - Doctor
 *     summary: Add diagnosis for a patient
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Diagnosis added
 */
doctorRouter.post('/add-diagnosis', authDoctor, addDiagnosis)

/**
 * @openapi
 * /api/doctor/patient-medical-record:
 *   post:
 *     tags:
 *       - Doctor
 *     summary: Retrieve a patient's medical record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Medical record
 */
doctorRouter.post('/patient-medical-record', authDoctor, getPatientMedicalRecord)

export default doctorRouter