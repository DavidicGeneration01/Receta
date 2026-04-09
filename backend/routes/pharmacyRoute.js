import express from "express";
import { getPharmacies, upsertPharmacy } from "../controllers/pharmacyController.js";
import authAdmin from "../middlewares/authAdmin.js";

const pharmacyRouter = express.Router();

pharmacyRouter.get("/list", getPharmacies);
pharmacyRouter.post("/upsert", authAdmin, upsertPharmacy);

export default pharmacyRouter;