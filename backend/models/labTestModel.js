import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema({
  labId: { type: mongoose.Schema.Types.ObjectId, ref: "lab", required: true },
  testName: { type: String, required: true },
  testCode: { type: String },
  category: { type: String }, // e.g. "Haematology", "Biochemistry", "Microbiology"
  description: { type: String },
  sampleType: { type: String }, // e.g. "Blood", "Urine"
  turnaroundTime: { type: String }, // e.g. "24 hours"
  price: { type: Number, required: true },
  currency: { type: String, default: "NGN" },
  isActive: { type: Boolean, default: true },
  lastUpdatedBy: { type: String }, // lab admin identifier
}, { timestamps: true });

const labTestModel = mongoose.models.labTest || mongoose.model("labTest", labTestSchema);
export default labTestModel;