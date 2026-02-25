import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    // ✅ Change Number to String to support "3 Year"
    experience: { type: String, required: true }, 
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    // ✅ Change Date to Number for Date.now() compatibility
    date: { type: Number, required: true }, 
    slots_booked: { type: Object, default: {} },
  },
  { minimize: false }
);

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;