import conversationModel from "../models/conversationModel.js";
import messageModel from "../models/messageModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { getPagination } from "../utils/queryOptions.js";

// ─── SHARED ───────────────────────────────────────────────────────────────────

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit, skip, page } = getPagination(req.query);
    const [messages, total] = await Promise.all([
      messageModel.find({ conversationId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      messageModel.countDocuments({ conversationId }),
    ]);
    res.json({ success: true, messages: messages.reverse(), pagination: { page, limit, total } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── USER (PATIENT) ───────────────────────────────────────────────────────────

// Patient: get all their conversations (only with doctors they had appointments with)
export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversations = await conversationModel
      .find({ userId, isActive: true })
      .populate("doctorId", "name speciality image")
      .populate("appointmentId", "slotDate slotTime")
      .sort({ lastMessageAt: -1 })
      .lean();
    res.json({ success: true, conversations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Patient: send a message
export const userSendMessage = async (req, res) => {
  try {
    const { userId } = req.body;
    const { conversationId, text, attachmentUrl } = req.body;

    // Verify conversation belongs to user
    const conversation = await conversationModel.findOne({ _id: conversationId, userId }).select('_id').lean();
    if (!conversation) return res.json({ success: false, message: "Conversation not found" });

    const msg = new messageModel({
      conversationId,
      senderId: userId,
      senderRole: "user",
      text,
      attachmentUrl,
    });
    await msg.save();

    await conversationModel.updateOne(
      { _id: conversationId, userId },
      { $set: { lastMessage: text || "Attachment", lastMessageAt: new Date() }, $inc: { doctorUnread: 1 } }
    );

    res.json({ success: true, message: msg });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Patient: start or get conversation with a doctor (must have appointment)
export const startConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const { doctorId, appointmentId } = req.body;

    // Verify appointment exists and belongs to user
    const appointment = await appointmentModel.findOne({
      _id: appointmentId,
      userId,
      docId: doctorId,
    }).select('_id').lean();
    if (!appointment) {
      return res.json({ success: false, message: "No appointment found with this doctor" });
    }

    // Check if conversation already exists
    const conversation = await conversationModel.findOneAndUpdate(
      { userId, doctorId, appointmentId },
      { $setOnInsert: { userId, doctorId, appointmentId } },
      { upsert: true, new: true }
    ).lean();

    res.json({ success: true, conversation });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Mark messages as read by user
export const markUserMessagesRead = async (req, res) => {
  try {
    const { userId } = req.body;
    const { conversationId } = req.params;
    const conversation = await conversationModel.findOne({ _id: conversationId, userId }).select('_id').lean();
    if (!conversation) return res.json({ success: false, message: "Not found" });

    await messageModel.updateMany(
      { conversationId, senderRole: "doctor", isRead: false },
      { $set: { isRead: true } }
    );
    await conversationModel.updateOne({ _id: conversationId, userId }, { $set: { userUnread: 0 } });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── DOCTOR ───────────────────────────────────────────────────────────────────

// Doctor: get all their conversations
export const getDoctorConversations = async (req, res) => {
  try {
    const { docId } = req.body;
    const conversations = await conversationModel
      .find({ doctorId: docId, isActive: true })
      .populate("userId", "name image email")
      .populate("appointmentId", "slotDate slotTime")
      .sort({ lastMessageAt: -1 })
      .lean();
    res.json({ success: true, conversations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Doctor: send a message
export const doctorSendMessage = async (req, res) => {
  try {
    const { docId } = req.body;
    const { conversationId, text, attachmentUrl } = req.body;

    const conversation = await conversationModel.findOne({ _id: conversationId, doctorId: docId }).select('_id').lean();
    if (!conversation) return res.json({ success: false, message: "Conversation not found" });

    const msg = new messageModel({
      conversationId,
      senderId: docId,
      senderRole: "doctor",
      text,
      attachmentUrl,
    });
    await msg.save();

    await conversationModel.updateOne(
      { _id: conversationId, doctorId: docId },
      { $set: { lastMessage: text || "Attachment", lastMessageAt: new Date() }, $inc: { userUnread: 1 } }
    );

    res.json({ success: true, message: msg });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Doctor: mark messages as read
export const markDoctorMessagesRead = async (req, res) => {
  try {
    const { docId } = req.body;
    const { conversationId } = req.params;
    const conversation = await conversationModel.findOne({ _id: conversationId, doctorId: docId }).select('_id').lean();
    if (!conversation) return res.json({ success: false, message: "Not found" });

    await messageModel.updateMany(
      { conversationId, senderRole: "user", isRead: false },
      { $set: { isRead: true } }
    );
    await conversationModel.updateOne({ _id: conversationId, doctorId: docId }, { $set: { doctorUnread: 0 } });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
