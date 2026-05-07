import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },  // ← was slotData
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    serviceCharge: { type: Number, default: 0 }, 
    vat: { type: Number, default: 0 },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    // amount is defined above
}, { timestamps: true })

appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ docId: 1, date: -1 });
appointmentSchema.index({ docId: 1, userId: 1, date: -1 });
appointmentSchema.index({ cancelled: 1, isCompleted: 1, payment: 1 });

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment',appointmentSchema);

export default appointmentModel;
