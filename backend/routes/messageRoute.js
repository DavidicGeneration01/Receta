import express from "express";
import {
  getMessages, getUserConversations, userSendMessage, startConversation,
  markUserMessagesRead, getDoctorConversations, doctorSendMessage,
  markDoctorMessagesRead,
} from "../controllers/messageController.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";

const messageRouter = express.Router();

// User (patient)
messageRouter.get("/user/conversations", authUser, getUserConversations);
messageRouter.post("/user/start", authUser, startConversation);
messageRouter.post("/user/send", authUser, userSendMessage);
messageRouter.patch("/user/read/:conversationId", authUser, markUserMessagesRead);

// Doctor
messageRouter.get("/doctor/conversations", authDoctor, getDoctorConversations);
messageRouter.post("/doctor/send", authDoctor, doctorSendMessage);
messageRouter.patch("/doctor/read/:conversationId", authDoctor, markDoctorMessagesRead);

// Shared (authenticated by either)
messageRouter.get("/messages/:conversationId", authUser, getMessages);

export default messageRouter;