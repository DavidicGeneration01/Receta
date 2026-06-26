import express from "express"
import {
  addDoctor,
  allDoctors,
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
} from "../controllers/adminController.js"
import upload from "../middlewares/multer.js"
import authAdmin from "../middlewares/authAdmin.js"
import { changeAvailability } from "../controllers/doctorController.js"

const adminRouter = express.Router()

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin operations
 */

/**
 * @openapi
 * /api/admin/add-doctor:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Add a new doctor
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor added
 */
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor)
/**
 * @openapi
 * /api/admin/login:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin login
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
adminRouter.post("/login", loginAdmin)

/**
 * @openapi
 * /api/admin/all-doctors:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Get all doctors (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctors list
 */
adminRouter.post("/all-doctors", authAdmin, allDoctors)

/**
 * @openapi
 * /api/admin/change-availability:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Change doctor availability
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Availability changed
 */
adminRouter.post("/change-availability", authAdmin, changeAvailability)

/**
 * @openapi
 * /api/admin/appointments:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all appointments (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments list
 */
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)

/**
 * @openapi
 * /api/admin/cancel-appointment:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Cancel an appointment (admin)
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
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Admin dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard
 */
adminRouter.get("/dashboard", authAdmin, adminDashboard)

export default adminRouter
