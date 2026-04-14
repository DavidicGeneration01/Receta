import mongoose from "mongoose";

const labSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true }, // removed required, added sparse
  description: { type: String },
  address: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String },
  },
  phone: { type: String },
  email: { type: String },
  logo: { type: String },
  googleFormUrl: { type: String },
  operatingHours: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const labModel = mongoose.models.lab || mongoose.model("lab", labSchema);
export default labModel;