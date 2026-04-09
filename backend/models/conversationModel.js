import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment", required: true },
  lastMessage: { type: String },
  lastMessageAt: { type: Date },
  userUnread: { type: Number, default: 0 },
  doctorUnread: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const conversationModel =
  mongoose.models.conversation || mongoose.model("conversation", conversationSchema);
export default conversationModel;