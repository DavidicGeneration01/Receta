import conversationModel from "../models/conversationModel.js"
import messageModel from "../models/messageModel.js"
import appointmentModel from "../models/appointmentModel.js"
import { getPagination } from "../utils/queryOptions.js"

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { limit, skip, page } = getPagination(req.query)

    const [messages, total] = await Promise.all([
      messageModel.find({ conversationId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      messageModel.countDocuments({ conversationId }),
    ])

    res.json({ success: true, messages: messages.reverse(), pagination: { page, limit, total } })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.body
    const conversations = await conversationModel
      .find({ userId, isActive: true })
      .populate("doctorId", "name speciality image")
      .populate("appointmentId", "slotDate slotTime")
      .sort({ lastMessageAt: -1 })
      .lean()

    res.json({ success: true, conversations })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const userSendMessage = async (req, res) => {
  try {
    const { userId, conversationId, text, attachmentUrl } = req.body

    const conversation = await conversationModel
      .findOne({ _id: conversationId, userId })
      .select("_id")
      .lean()

    if (!conversation) {
      return res.json({ success: false, message: "Conversation not found" })
    }

    const msg = await messageModel.create({
      conversationId,
      senderId: userId,
      senderRole: "user",
      text,
      attachmentUrl,
    })

    await conversationModel.updateOne(
      { _id: conversationId, userId },
      {
        $set: { lastMessage: text || "Attachment", lastMessageAt: new Date() },
        $inc: { doctorUnread: 1 },
      }
    )

    res.json({ success: true, message: msg })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const startConversation = async (req, res) => {
  try {
    const { userId, doctorId, appointmentId } = req.body

    const appointment = await appointmentModel
      .findOne({ _id: appointmentId, userId, docId: doctorId })
      .select("_id")
      .lean()

    if (!appointment) {
      return res.json({ success: false, message: "No appointment found with this doctor" })
    }

    const conversation = await conversationModel
      .findOneAndUpdate(
        { userId, doctorId, appointmentId },
        { $setOnInsert: { userId, doctorId, appointmentId } },
        { upsert: true, new: true }
      )
      .lean()

    res.json({ success: true, conversation })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const markUserMessagesRead = async (req, res) => {
  try {
    const { userId } = req.body
    const { conversationId } = req.params

    const conversation = await conversationModel
      .findOne({ _id: conversationId, userId })
      .select("_id")
      .lean()

    if (!conversation) {
      return res.json({ success: false, message: "Not found" })
    }

    await Promise.all([
      messageModel.updateMany(
        { conversationId, senderRole: "doctor", isRead: false },
        { $set: { isRead: true } }
      ),
      conversationModel.updateOne({ _id: conversationId, userId }, { $set: { userUnread: 0 } }),
    ])

    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const getDoctorConversations = async (req, res) => {
  try {
    const { docId } = req.body
    const conversations = await conversationModel
      .find({ doctorId: docId, isActive: true })
      .populate("userId", "name image email")
      .populate("appointmentId", "slotDate slotTime")
      .sort({ lastMessageAt: -1 })
      .lean()

    res.json({ success: true, conversations })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const doctorSendMessage = async (req, res) => {
  try {
    const { docId, conversationId, text, attachmentUrl } = req.body

    const conversation = await conversationModel
      .findOne({ _id: conversationId, doctorId: docId })
      .select("_id")
      .lean()

    if (!conversation) {
      return res.json({ success: false, message: "Conversation not found" })
    }

    const msg = await messageModel.create({
      conversationId,
      senderId: docId,
      senderRole: "doctor",
      text,
      attachmentUrl,
    })

    await conversationModel.updateOne(
      { _id: conversationId, doctorId: docId },
      {
        $set: { lastMessage: text || "Attachment", lastMessageAt: new Date() },
        $inc: { userUnread: 1 },
      }
    )

    res.json({ success: true, message: msg })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const markDoctorMessagesRead = async (req, res) => {
  try {
    const { docId } = req.body
    const { conversationId } = req.params

    const conversation = await conversationModel
      .findOne({ _id: conversationId, doctorId: docId })
      .select("_id")
      .lean()

    if (!conversation) {
      return res.json({ success: false, message: "Not found" })
    }

    await Promise.all([
      messageModel.updateMany(
        { conversationId, senderRole: "user", isRead: false },
        { $set: { isRead: true } }
      ),
      conversationModel.updateOne(
        { _id: conversationId, doctorId: docId },
        { $set: { doctorUnread: 0 } }
      ),
    ])

    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}
