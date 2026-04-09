import mongoose from "mongoose";

const SERVICE_CHARGE_RATE = 0.05; // 5% service charge
const VAT_RATE = 0.075;           // 7.5% VAT (Nigeria standard)

const labBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: "lab", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" }, // referring doctor
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment" },

  // Tests ordered
  tests: [
    {
      testId: { type: mongoose.Schema.Types.ObjectId, ref: "labTest" },
      testName: { type: String },
      price: { type: Number },
    },
  ],

  // Billing
  subtotal: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  vat: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  serviceChargeRate: { type: Number, default: SERVICE_CHARGE_RATE },
  vatRate: { type: Number, default: VAT_RATE },

  // Google Form
  googleFormUrl: { type: String },
  formSubmitted: { type: Boolean, default: false },
  formSubmittedAt: { type: Date },

  // Status
  status: {
    type: String,
    enum: ["pending", "confirmed", "sample_collected", "processing", "completed", "cancelled"],
    default: "pending",
  },

  // Results
  resultUrl: { type: String }, // URL to uploaded result
  resultNotes: { type: String },
  resultUploadedAt: { type: Date },

  // Payment
  paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
  paymentReference: { type: String },

  notes: { type: String },
}, { timestamps: true });

// Auto-calculate billing before save
labBookingSchema.pre("save", function (next) {
  if (this.tests && this.tests.length > 0) {
    this.subtotal = this.tests.reduce((sum, t) => sum + (t.price || 0), 0);
    this.serviceCharge = parseFloat((this.subtotal * SERVICE_CHARGE_RATE).toFixed(2));
    this.vat = parseFloat(((this.subtotal + this.serviceCharge) * VAT_RATE).toFixed(2));
    this.total = parseFloat((this.subtotal + this.serviceCharge + this.vat).toFixed(2));
  }
  next();
});

const labBookingModel = mongoose.models.labBooking || mongoose.model("labBooking", labBookingSchema);
export default labBookingModel;