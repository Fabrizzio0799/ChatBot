import React, { useState, useRef, useEffect } from "react";
import { sendMessage } from "./api";
import { ChatBubble } from "./ChatBubble";
import ReactMarkdown from "react-markdown";
import "./App.css";
import "./ChatBubble.css";

function uniqueId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

export default function App() {
  const [chats, setChats] = useState([
    {
      id: uniqueId(),
      name: "Nuevo chat",
      messages: [
        { content: "¡Hola! Soy tu asistente PDF 🤖", role: "bot" }
      ]
    }
  ]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [editingChatName, setEditingChatName] = useState(null);
  const [tokenInfo, setTokenInfo] = useState({});

  const activeChatIndex = chats.findIndex(c => c.id === activeChatId);
  const activeChat = chats[activeChatIndex];

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat && activeChat.messages]);

  function exportToMarkdown() {
    const md = activeChat.messages.map(msg =>
      msg.role === "user"
        ? `**Tú:** ${msg.content}`
        : `**Bot:** ${msg.content}`
    ).join("\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeChat.name || "conversacion"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleNewChat() {
    const newId = uniqueId();
    const newChat = {
      id: newId,
      name: "Nuevo chat",
      messages: [
        { content: "¡Hola! Soy tu asistente PDF 🤖", role: "bot" }
      ]
    };
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newId);
  }

  function handleSelectChat(id) {
    setActiveChatId(id);
  }

  function handleDeleteChat(id) {
    let idx = chats.findIndex(c => c.id === id);
    let updated = chats.filter(c => c.id !== id);
    setChats(updated);
    if (updated.length > 0) {
      setActiveChatId(updated[Math.max(0, idx - 1)].id);
    } else {
      handleNewChat();
    }
  }

  function handleEditChatName(id, newName) {
    setChats(prev =>
      prev.map(c =>
        c.id === id ? { ...c, name: newName } : c
      )
    );
    setEditingChatName(null);
  }

  function setDefaultChatName(id, question) {
    setChats(prev =>
      prev.map(c =>
        c.id === id && c.name === "Nuevo chat"
          ? { ...c, name: question.slice(0, 28) + (question.length > 28 ? "..." : "") }
          : c
      )
    );
  }

  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;
    setError(null);
    setIsLoading(true);

    if (activeChat.name === "Nuevo chat") {
      setDefaultChatName(activeChat.id, input);
    }

    let userMsg = { content: input, role: "user" };
    let botMsg = { content: "", role: "bot" };

    setChats(prev =>
      prev.map((c, idx) =>
        idx === activeChatIndex
          ? { ...c, messages: [...c.messages, userMsg, botMsg] }
          : c
      )
    );
    setInput("");

    try {
      let tokens = 0, cost = 0;
      await sendMessage(input, (chunk, info) => {
        if (info && info.tokens !== undefined) {
          tokens = info.tokens;
          cost = info.cost;
        }
        botMsg.content += chunk;
        setChats(prev =>
          prev.map((c, idx) =>
            idx === activeChatIndex
              ? {
                  ...c,
                  messages: c.messages.map((msg, i) =>
                    i === c.messages.length - 1
                      ? { ...botMsg }
                      : msg
                  )
                }
              : c
          )
        );
      }, activeChat.id);
      setTokenInfo(prev => ({
        ...prev,
        [activeChat.id]: { tokens, cost }
      }));
    } catch (e) {
      setError("Hubo un error al procesar tu mensaje 😥");
      botMsg.content = "Hubo un error al procesar tu mensaje 😥";
      setChats(prev =>
        prev.map((c, idx) =>
          idx === activeChatIndex
            ? {
                ...c,
                messages: c.messages.map((msg, i) =>
                  i === c.messages.length - 1
                    ? { ...botMsg }
                    : msg
                )
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  function ChatSidebar() {
    return (
      <aside className="chat-sidebar">
        <div className="sidebar-title">
          <b>Conversaciones</b>
          <button onClick={handleNewChat} title="Nuevo chat">＋</button>
        </div>
        <ul>
          {chats.map(chat => (
            <li key={chat.id} className={chat.id === activeChatId ? "active" : ""}>
              {editingChatName === chat.id ? (
                <input
                  value={chat.name}
                  onChange={e => handleEditChatName(chat.id, e.target.value)}
                  onBlur={() => setEditingChatName(null)}
                  autoFocus
                />
              ) : (
                <span
                  onDoubleClick={() => setEditingChatName(chat.id)}
                  title="Haz doble clic para editar"
                >
                  {chat.name}
                </span>
              )}
              <button onClick={() => handleSelectChat(chat.id)} title="Abrir">📄</button>
              {chats.length > 1 &&
                <button onClick={() => handleDeleteChat(chat.id)} title="Borrar">🗑️</button>
              }
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  return (
    <div className="main-wrapper">
      <ChatSidebar />
      <div className="chat-container">
        <button
          className="toggle-dark"
          onClick={() => setDarkMode(dm => !dm)}
          aria-label="Cambiar modo oscuro/claro"
          title={darkMode ? "Modo noche" : "Modo día"}
        >
          {darkMode ? "🌙" : "☀️"}
        </button>
        <button
          onClick={exportToMarkdown}
          className="send-btn"
          style={{ position: "absolute", top: 14, left: 50, fontSize: 16 }}
          title="Exportar conversación"
        >
          📤 Exportar
        </button>
        <div className="messages-list">
          {activeChat.messages.map((msg, i) => {
            const isLast = i === activeChat.messages.length - 1;
            if (
              isLast &&
              msg.role === "bot" &&
              !msg.content &&
              isLoading
            ) {
              return null;
            }
            return (
              <ChatBubble
                key={i}
                isUser={msg.role === "user"}
                message={
                  msg.role === "bot"
                    ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                    : msg.content
                }
              />
            );
          })}
          {isLoading && (
            <ChatBubble
              isUser={false}
              message={
                <span style={{ opacity: 0.7 }}>
                  El bot está escribiendo<span className="dot-anim">...</span>
                </span>
              }
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        {error && (
          <div className="error-message">{error}</div>
        )}
        {tokenInfo[activeChatId] &&
          <div className="token-cost-info">
            Tokens usados: <b>{tokenInfo[activeChatId].tokens}</b> | Costo estimado: <b>${tokenInfo[activeChatId].cost.toFixed(4)}</b>
          </div>
        }
        <form
          className="input-bar"
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isLoading ? "Espera la respuesta..." : "Escribe tu mensaje…"}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-btn"
            title="Enviar"
            disabled={isLoading || !input.trim()}
          >✉️</button>
        </form>
      </div>
    </div>
  );
}
