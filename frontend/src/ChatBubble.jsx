// src/ChatBubble.jsx
import React from "react";
import { motion } from "framer-motion";
import "./ChatBubble.css";

export function ChatBubble({ message, isUser }) {
  return (
    <motion.div
      className={`chat-bubble-row ${isUser ? "right" : "left"}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {!isUser && (
        <span className="chat-avatar bot-avatar" title="Bot">🤖</span>
      )}
      <div className={`chat-bubble ${isUser ? "user" : "bot"}`}>
        {message}
      </div>
      {isUser && (
        <span className="chat-avatar user-avatar" title="Tú">🧑</span>
      )}
    </motion.div>
  );
}
