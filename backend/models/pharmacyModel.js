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
  operatingHours: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const pharmacyModel = mongoose.models.pharmacy || mongoose.model("pharmacy", pharmacySchema);
export default pharmacyModel;