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

// Public
labRouter.get("/list", getLabs);
labRouter.get("/tests/:labId", getLabTests);

// User (patient)
labRouter.post("/book", authUser, bookLabTests);
labRouter.get("/my-bookings", authUser, getMyLabBookings);
labRouter.patch("/form-submitted/:bookingId", authUser, markFormSubmitted);

// Doctor
labRouter.get("/patient-lab-history/:patientId", authDoctor, getPatientLabHistory);

// Lab admin (uses authAdmin for now — can be extended to a separate lab auth)
labRouter.post("/test/add", authAdmin, addLabTest);
labRouter.patch("/test/price/:testId", authAdmin, updateTestPrice);
labRouter.patch("/booking/status/:bookingId", authAdmin, updateBookingStatus);
labRouter.post("/upsert", authAdmin, upsertLab);
labRouter.get("/all-bookings", authAdmin, getAllBookings);

export default labRouter;