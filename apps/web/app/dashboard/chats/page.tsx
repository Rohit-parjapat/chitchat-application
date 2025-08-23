"use client";
import { useEffect, useState } from "react";
import { Chat, User } from "../../types/chat";
import ChatSidebar from "../../conponents/ChatSidebar";
import ChatBox from "../../conponents/ChatBox";


export default function Dashboard() {
    const [selectedChat, setSelectedChat] = useState<string>("");
    const [chatList, setChatList] = useState<Chat[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchChatList = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`, { credentials: 'include' });
      const data = await res.json();
      setChatList(data.conversations);
      setCurrentUser(data.currentUser);
      console.log("Fetched chat list:", data);
    };

    fetchChatList();
  }, []);

  const handleLogout = async () => {
    // Clear cookies or tokens if needed
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  };
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <div className="w-full flex justify-end p-4 bg-white border-b">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
      <div className="flex flex-1">
        <ChatSidebar
          chats={chatList}
          onSelect={setSelectedChat}
          selectedId={selectedChat}
          currentUser={currentUser}
        />
        {selectedChat ? (
          <ChatBox currentUser={currentUser} participants={chatList.find((chat) => chat.id === selectedChat)?.participants ?? []} />
        ) : (
          <section className="flex-1 flex items-center justify-center text-gray-400">
            Select a chat to start messaging.
          </section>
        )}
      </div>
    </main>
  );
}