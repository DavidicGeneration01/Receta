import express from "express";
import {
  getMessages, getUserConversations, userSendMessage, startConversation,
  markUserMessagesRead, getDoctorConversations, doctorSendMessage,
  markDoctorMessagesRead,
} from "../controllers/messageController.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";

const messageRouter = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Message
 *     description: Messaging and conversations
 */

// User (patient)
/**
 * @openapi
 * /api/message/user/conversations:
 *   get:
 *     tags:
 *       - Message
 *     summary: Get user's conversations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations list
 */
messageRouter.get("/user/conversations", authUser, getUserConversations);

/**
 * @openapi
 * /api/message/user/start:
 *   post:
 *     tags:
 *       - Message
 *     summary: Start a conversation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Conversation started
 */
messageRouter.post("/user/start", authUser, startConversation);

/**
 * @openapi
 * /api/message/user/send:
 *   post:
 *     tags:
 *       - Message
 *     summary: Send message (user)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Message sent
 */
messageRouter.post("/user/send", authUser, userSendMessage);

/**
 * @openapi
 * /api/message/user/read/{conversationId}:
 *   patch:
 *     tags:
 *       - Message
 *     summary: Mark user messages read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked read
 */
messageRouter.patch("/user/read/:conversationId", authUser, markUserMessagesRead);

// Doctor
/**
 * @openapi
 * /api/message/doctor/conversations:
 *   get:
 *     tags:
 *       - Message
 *     summary: Get doctor's conversations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations list
 */
messageRouter.get("/doctor/conversations", authDoctor, getDoctorConversations);

/**
 * @openapi
 * /api/message/doctor/send:
 *   post:
 *     tags:
 *       - Message
 *     summary: Send message (doctor)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Message sent
 */
messageRouter.post("/doctor/send", authDoctor, doctorSendMessage);

/**
 * @openapi
 * /api/message/doctor/read/{conversationId}:
 *   patch:
 *     tags:
 *       - Message
 *     summary: Mark doctor messages read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked read
 */
messageRouter.patch("/doctor/read/:conversationId", authDoctor, markDoctorMessagesRead);

// Shared (authenticated by either)
/**
 * @openapi
 * /api/message/messages/{conversationId}:
 *   get:
 *     tags:
 *       - Message
 *     summary: Get messages for a conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages
 */
messageRouter.get("/messages/:conversationId", authUser, getMessages);

export default messageRouter;