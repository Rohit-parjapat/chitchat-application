/* eslint-disable react/prop-types */
"use client";
import { useState, useEffect, useRef } from "react";

import { Message } from "@/types/chat";
import socket from "@/utils/socket";
import api from "@/lib/axios";
type Props = {
  chatId: string;
  userId?: string;
};

const ChatBox: React.FC<Props> = ({ chatId, userId }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<{ participants: { user: { id: string } }[] } | null>(null);

  useEffect(() => {
    socket.connect();
    socket.on("private_message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socket.off("private_message");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!chatId) return;
    api.get(`/messages/conversations/${chatId}/messages`).then((res) => {
      setMessages(res.data);
    });
  }, [chatId]);

  const getConversation = async () => {
    if (!chatId) return null;
    const res = await api.get(`/messages/conversations/${chatId}`);
    return res.data;
  };
  useEffect(() => {
    getConversation().then((data) => {
      setConversation(data);
    });
  }, [chatId, getConversation]);

  const receiverId = conversation?.participants.find(
    (participant) => participant.user.id !== userId
  )?.user.id;

  const handleSendMessage = (content: string) => {
    if (!receiverId) {
      return;
    }
    socket.emit("private_message", {
      receiverId: receiverId,
      message: content,
    });
    setInput("");
  };

  // Ref for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <section className="flex-1 h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto bg-white p-4">
        {messages.map((msg) => {
          const isMine = userId ? msg.sender.id === userId : false;
          return (
            <div
              key={msg.id}
              className={`mb-2 flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-xs ${isMine ? "bg-green-200" : "bg-gray-200"}`}
              >
                <div>{msg.content}</div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-gray-50 flex">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSendMessage(input); }}
        />
        <button
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
          onClick={() => handleSendMessage(input)}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </section>
  );
};

export default ChatBox;
