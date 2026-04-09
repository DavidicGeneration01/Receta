import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";

const DoctorMessages = () => {
  const { dToken, backendUrl } = useContext(DoctorContext);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (dToken) fetchConversations();
    return () => clearInterval(pollRef.current);
  }, [dToken]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      markRead(activeConv._id);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(activeConv._id), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/message/doctor/conversations`, {
        headers: { dToken },
      });
      if (data.success) setConversations(data.conversations);
    } catch {}
  };

  const fetchMessages = async (convId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/message/messages/${convId}`, {
        headers: { dToken },
      });
      if (data.success) setMessages(data.messages);
    } catch {}
  };

  const markRead = async (convId) => {
    try {
      await axios.patch(`${backendUrl}/api/message/doctor/read/${convId}`, {}, { headers: { dToken } });
      fetchConversations();
    } catch {}
  };

  const handleSend = async () => {
    if (!text.trim() || !activeConv) return;
    setSending(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/message/doctor/send`,
        { conversationId: activeConv._id, text: text.trim() },
        { headers: { dToken } }
      );
      if (data.success) {
        setText("");
        fetchMessages(activeConv._id);
        fetchConversations();
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.doctorUnread || 0), 0);

  return (
    <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden m-5" style={{ height: "80vh" }}>
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <p className="font-semibold text-gray-700">Patient Messages</p>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{totalUnread}</span>
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-xs text-gray-400">No patient conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setActiveConv(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition border-b border-gray-50 ${
                  activeConv?._id === conv._id ? "bg-teal-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  <img
                    src={conv.userId?.image || "/default-patient.png"}
                    alt={conv.userId?.name}
                    className="w-11 h-11 rounded-full object-cover bg-gray-100"
                  />
                  {conv.doctorUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {conv.doctorUnread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{conv.userId?.name}</p>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat */}
      {!activeConv ? (
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <p className="text-5xl mb-4">💬</p>
            <p className="text-gray-500 font-medium">Select a patient</p>
            <p className="text-gray-400 text-sm mt-1">Choose a conversation from the left</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
            <img
              src={activeConv.userId?.image || "/default-patient.png"}
              className="w-10 h-10 rounded-full object-cover bg-gray-100"
              alt="Patient"
            />
            <div>
              <p className="font-semibold text-gray-800">{activeConv.userId?.name}</p>
              <p className="text-xs text-gray-400">{activeConv.userId?.email}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-8">No messages yet</p>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderRole === "doctor";
              return (
                <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe ? "bg-teal-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${isMe ? "text-teal-200" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl transition"
            >
              {sending ? "..." : "➤"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMessages;