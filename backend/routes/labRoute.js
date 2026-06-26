import express from "express";
import {
  getLabs, getLabTests, bookLabTests, getMyLabBookings,
  markFormSubmitted, getPatientLabHistory, updateTestPrice,
  addLabTest, updateBookingStatus, upsertLab, getAllBookings,
} from "../controllers/labController.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";
import authAdmin from "../middlewares/authAdmin.js";

const labRouter = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Lab
 *     description: Lab and lab booking endpoints
 */

// Public
/**
 * @openapi
 * /api/lab/list:
 *   get:
 *     tags:
 *       - Lab
 *     summary: List labs
 *     responses:
 *       200:
 *         description: Labs list
 */
labRouter.get("/list", getLabs);

/**
 * @openapi
 * /api/lab/tests/{labId}:
 *   get:
 *     tags:
 *       - Lab
 *     summary: Get tests for a lab
 *     parameters:
 *       - name: labId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lab tests
 */
labRouter.get("/tests/:labId", getLabTests);

// User (patient)
/**
 * @openapi
 * /api/lab/book:
 *   post:
 *     tags:
 *       - Lab
 *     summary: Book a lab test
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Booking created
 */
labRouter.post("/book", authUser, bookLabTests);

/**
 * @openapi
 * /api/lab/my-bookings:
 *   get:
 *     tags:
 *       - Lab
 *     summary: Get user's lab bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings list
 */
labRouter.get("/my-bookings", authUser, getMyLabBookings);

/**
 * @openapi
 * /api/lab/form-submitted/{bookingId}:
 *   patch:
 *     tags:
 *       - Lab
 *     summary: Mark lab form submitted
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bookingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 */
labRouter.patch("/form-submitted/:bookingId", authUser, markFormSubmitted);

// Doctor
/**
 * @openapi
 * /api/lab/patient-lab-history/{patientId}:
 *   get:
 *     tags:
 *       - Lab
 *     summary: Get patient's lab history
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
 *         description: Patient lab history
 */
labRouter.get("/patient-lab-history/:patientId", authDoctor, getPatientLabHistory);

// Lab admin (uses authAdmin for now — can be extended to a separate lab auth)
/**
 * @openapi
 * /api/lab/test/add:
 *   post:
 *     tags:
 *       - Lab
 *     summary: Add a lab test
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Test added
 */
labRouter.post("/test/add", authAdmin, addLabTest);

/**
 * @openapi
 * /api/lab/test/price/{testId}:
 *   patch:
 *     tags:
 *       - Lab
 *     summary: Update test price
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Price updated
 */
labRouter.patch("/test/price/:testId", authAdmin, updateTestPrice);

/**
 * @openapi
 * /api/lab/booking/status/{bookingId}:
 *   patch:
 *     tags:
 *       - Lab
 *     summary: Update booking status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bookingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
labRouter.patch("/booking/status/:bookingId", authAdmin, updateBookingStatus);

/**
 * @openapi
 * /api/lab/upsert:
 *   post:
 *     tags:
 *       - Lab
 *     summary: Create or update a lab
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Upserted
 */
labRouter.post("/upsert", authAdmin, upsertLab);

/**
 * @openapi
 * /api/lab/all-bookings:
 *   get:
 *     tags:
 *       - Lab
 *     summary: Get all lab bookings (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings list
 */
labRouter.get("/all-bookings", authAdmin, getAllBookings);

export default labRouter;