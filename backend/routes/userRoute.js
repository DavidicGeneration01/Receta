import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentFlutterwave, verifyFlutterwave, bookLabTest, getUserLabBookings, cancelLabBooking, getMedicalRecord, updateMedicalRecord } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js'

const userRouter = express.Router()

/**
 * @openapi
 * tags:
 *   - name: User
 *     description: User related endpoints
 */

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     tags:
 *       - User
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration response
 */
userRouter.post('/register',registerUser)

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     tags:
 *       - User
 *     summary: User login
 *     requestBody:
 *       required: true
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
 *         description: Login response with token
 */
userRouter.post('/login',loginUser)

/**
 * @openapi
 * /api/user/get-profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
userRouter.get('/get-profile',authUser,getProfile)

/**
 * @openapi
 * /api/user/update-profile:
 *   post:
 *     tags:
 *       - User
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)

/**
 * @openapi
 * /api/user/book-appointment:
 *   post:
 *     tags:
 *       - User
 *     summary: Book an appointment with a doctor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               docId:
 *                 type: string
 *               slotDate:
 *                 type: string
 *               slotTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment booked
 */
userRouter.post('/book-appointment', authUser, bookAppointment)

/**
 * @openapi
 * /api/user/appointments:
 *   get:
 *     tags:
 *       - User
 *     summary: List user appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments list
 */
userRouter.get('/appointments',authUser,listAppointment)

/**
 * @openapi
 * /api/user/cancel-appointment:
 *   post:
 *     tags:
 *       - User
 *     summary: Cancel an appointment
 *     security:
 *       - bearerAuth: []

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               appointmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cancellation response
 */
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-flutterwave',authUser,paymentFlutterwave)
userRouter.post('/verifyFlutterwave',authUser,verifyFlutterwave)

// Lab booking routes
userRouter.post('/book-lab-test', authUser, bookLabTest)
userRouter.get('/lab-bookings', authUser, getUserLabBookings)
userRouter.post('/cancel-lab-booking', authUser, cancelLabBooking)

// Medical record routes
userRouter.get('/medical-record', authUser, getMedicalRecord)
userRouter.post('/update-medical-record', authUser, updateMedicalRecord)

export default userRouter