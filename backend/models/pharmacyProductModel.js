import mongoose from "mongoose";

const pharmacyProductSchema = new mongoose.Schema(
  {
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "pharmacy", required: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    manufacturer: { type: String, default: "" },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    requiresPrescription: { type: Boolean, default: false },
    description: { type: String, default: "" },
    usage: { type: String, default: "" },
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now }
  }
);

const pharmacyProductModel = mongoose.models.pharmacyProduct || mongoose.model("pharmacyProduct", pharmacyProductSchema);

export default pharmacyProductModel;
