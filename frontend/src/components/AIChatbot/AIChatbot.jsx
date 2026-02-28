import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiCpu } from "react-icons/fi";
import styles from "./AIChatbot.module.css";
import { API_BASE_URL } from "../../utils/constants";
import ReactMarkdown from "react-markdown";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your AI Concierge. I can help you mint NFTs, connect MetaMask, and navigate the platform. How can I assist you today?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const userMsg = inputVal.trim();
    setInputVal("");

    // 1. Add User Message
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // 2. Connect to Backend SSE endpoint
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI");
      }

      // 3. Add empty Assistant Message placeholder to stream into
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr
            .split("\n")
            .filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.choices && parsed.choices[0]?.delta?.content) {
                  const contentChunk = parsed.choices[0].delta.content;

                  // Update the last message in state (the assistant placeholder)
                  setMessages((prev) => {
                    const copy = [...prev];
                    const lastIdx = copy.length - 1;
                    copy[lastIdx] = {
                      ...copy[lastIdx],
                      content: copy[lastIdx].content + contentChunk,
                    };
                    return copy;
                  });
                }
              } catch (parseError) {
                // Occurs frequently with incomplete JSON chunks in SSE streams. Ignore and keep reading.
                console.warn(
                  "SSE Chunk Parse error (ignoring piece):",
                  parseError,
                );
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        copy[lastIdx] = {
          ...copy[lastIdx],
          content:
            "Sorry, I am currently experiencing connection issues to the Groq Neural Network. Please try again later.",
          isError: true,
        };
        return copy;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className={styles.chatWindow}
          >
            {/* Header */}
            <div className={styles.chatHeader}>
              <div className={styles.headerInfo}>
                <h3>
                  <FiCpu className="gradient-text" /> AI Concierge
                </h3>
                <p>Powered by Groq & LLaMa 3</p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={toggleChat}
                aria-label="Close Chat"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className={styles.chatBody}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${styles.message} ${styles[msg.role]}`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              ))}

              {isTyping && (
                <div className={styles.typingIndicator}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className={styles.chatFooter}>
              <form className={styles.inputGroup} onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={!inputVal.trim() || isTyping}
                >
                  <FiSend size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={styles.chatFab}
        onClick={toggleChat}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle AI Concierge"
      >
        {isOpen ? <FiX size={26} /> : <FiMessageSquare size={26} />}
      </motion.button>
    </div>
  );
};

export default AIChatbot;
