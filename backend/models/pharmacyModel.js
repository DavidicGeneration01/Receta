import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String },
  },
  phone: { type: String },
  email: { type: String },
  logo: { type: String },
  // Optional unique identifier used by some deployments/indexes
  licenseNumber: { type: String },
  // e-commerce / ordering fields
  sellsDrugs: { type: Boolean, default: false },
  onlineOrdering: { type: Boolean, default: false },
  supportsDelivery: { type: Boolean, default: false },
  logisticAgent: { type: String },
  catalogueUrl: { type: String },
  operatingHours: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

pharmacySchema.index({ isActive: 1, name: 1 });
pharmacySchema.index({ "location.city": 1, isActive: 1 });

const pharmacyModel = mongoose.models.pharmacy || mongoose.model("pharmacy", pharmacySchema);
export default pharmacyModel;
