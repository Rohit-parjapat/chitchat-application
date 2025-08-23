"use client";
import { useState, useEffect, use } from "react";
import { Message, Participant, User } from "../types/chat";
import socket from "../utils/socket";

type Props = {
  participants: Participant[];
  currentUser: User | null;
};


const ChatBox: React.FC<Props> = ({ currentUser, participants }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket.connect();
    console.log("Connecting to socket...");

    socket.on("private_message", (message: Message) => {
      console.log("Incoming private_message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("private_message");
      socket.disconnect();
    };
  }, []);

  const getConversationId = () => {
    const conversation = participants[0]?.conversationId;
    return conversation || 0;
  };

  const conversationId = getConversationId();

  useEffect(() => {
    const messages = fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations/${conversationId}/messages`, { credentials: 'include' });
    messages.then((res) => res.json()).then((data) => {
      setMessages(data);
      console.log("Fetched messages:", data);
    });
  }, []);
  // get receiverId (first MEMBER found)
  const getReceiverId = () => {
    const member = messages.find((p) => p.senderId !== currentUser?.id);
    return member?.senderId;
  };

  const handleSendMessage = (content: string) => {
    const receiverId = getReceiverId();
    if (!receiverId) {
      console.error("No MEMBER found in participants!");
      return;
    }

    socket.emit("private_message", {
      receiverId,
      message: content,
    });

    setInput("");
  };

  return (
    <section className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto bg-white p-4">
        {messages.map((msg) => {
          return (
            <div
              key={msg.id}
              className={`mb-2 flex ${
                msg.senderId === currentUser?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-xs ${
                  msg.senderId === currentUser?.id ? "bg-green-200" : "bg-gray-200"
                }`}
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
      </div>

      <div className="p-4 border-t bg-gray-50 flex">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer"
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
