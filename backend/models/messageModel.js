import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "conversation", required: true },
  senderId: { type: String, required: true }, // userId or doctorId
  senderRole: { type: String, enum: ["user", "doctor"], required: true },
  text: { type: String },
  attachmentUrl: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const messageModel = mongoose.models.message || mongoose.model("message", messageSchema);
export default messageModel;