"use client";
import { useEffect, useState } from "react";
import { useChatContext } from "@/context/ChatContext";
import { Chat, User } from "@/types/chat";
import ChatSidebar from "@/components/layout/ChatSidebar";
import api from "@/lib/axios";
import ChatBox from "@/components/layout/ChatBox";

export default function Dashboard() {
  const { selectedChat, setSelectedChat } = useChatContext();
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchChatList = api.get('/messages/conversations');
    fetchChatList.then((res) => {
      setChatList(res.data.conversations);
      setCurrentUser(res.data.currentUser);
      console.log("Fetched Conversations:", res.data.conversations);
    });
  }, []);


  return (
    <main className="flex bg-gray-50 h-full">
      <ChatSidebar
        chats={chatList}
        onSelect={setSelectedChat}
        selectedId={selectedChat}
        currentUser={currentUser}
      />
      {selectedChat ? (
        <ChatBox chatId={selectedChat} userId={currentUser?.id} />
      ) : (
        <section className="flex-1 flex items-center justify-center text-gray-400">
          Select a chat to start messaging.
        </section>
      )}
    </main>
  );
}