import conversationModel from "../models/conversationModel.js";
import messageModel from "../models/messageModel.js";
import appointmentModel from "../models/appointmentModel.js";

// ─── SHARED ───────────────────────────────────────────────────────────────────

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await messageModel.find({ conversationId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
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
      .sort({ lastMessageAt: -1 });
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
    const conversation = await conversationModel.findOne({ _id: conversationId, userId });
    if (!conversation) return res.json({ success: false, message: "Conversation not found" });

    const msg = new messageModel({
      conversationId,
      senderId: userId,
      senderRole: "user",
      text,
      attachmentUrl,
    });
    await msg.save();

    // Update conversation
    conversation.lastMessage = text || "📎 Attachment";
    conversation.lastMessageAt = new Date();
    conversation.doctorUnread += 1;
    await conversation.save();

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
    });
    if (!appointment) {
      return res.json({ success: false, message: "No appointment found with this doctor" });
    }

    // Check if conversation already exists
    let conversation = await conversationModel.findOne({ userId, doctorId, appointmentId });
    if (!conversation) {
      conversation = new conversationModel({ userId, doctorId, appointmentId });
      await conversation.save();
    }

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
    const conversation = await conversationModel.findOne({ _id: conversationId, userId });
    if (!conversation) return res.json({ success: false, message: "Not found" });

    await messageModel.updateMany(
      { conversationId, senderRole: "doctor", isRead: false },
      { $set: { isRead: true } }
    );
    conversation.userUnread = 0;
    await conversation.save();
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
      .sort({ lastMessageAt: -1 });
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

    const conversation = await conversationModel.findOne({ _id: conversationId, doctorId: docId });
    if (!conversation) return res.json({ success: false, message: "Conversation not found" });

    const msg = new messageModel({
      conversationId,
      senderId: docId,
      senderRole: "doctor",
      text,
      attachmentUrl,
    });
    await msg.save();

    conversation.lastMessage = text || "📎 Attachment";
    conversation.lastMessageAt = new Date();
    conversation.userUnread += 1;
    await conversation.save();

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
    const conversation = await conversationModel.findOne({ _id: conversationId, doctorId: docId });
    if (!conversation) return res.json({ success: false, message: "Not found" });

    await messageModel.updateMany(
      { conversationId, senderRole: "user", isRead: false },
      { $set: { isRead: true } }
    );
    conversation.doctorUnread = 0;
    await conversation.save();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};