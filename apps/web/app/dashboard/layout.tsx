"use client"
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useEffect, useState } from "react";
import { ChatProvider } from "@/context/ChatContext";
import api from "@/lib/axios";
import { User } from "@/types/chat";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.get("/users/me").then((res) => {
      setCurrentUser(res.data.user ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await api.post("/users/logout");
    router.push("/login");
  };

  return (
    <ChatProvider>
      <div className="flex h-screen">
        <aside className="w-64 bg-gray-800 text-white flex flex-col">
          <div className="px-6 py-4 text-2xl font-bold border-b border-gray-700">Chat App</div>
          <nav className="flex-1 flex flex-col mt-4">
            <Link href="/dashboard/chats" className="px-6 py-4 hover:bg-gray-700">Chats</Link>
            <Link href="/dashboard/users" className="px-6 py-4 hover:bg-gray-700">Find friends</Link>
            <Link href="/dashboard/friends" className="px-6 py-4 hover:bg-gray-700">Friends</Link>
            <Link href="/dashboard/pending-requests" className="px-6 py-4 hover:bg-gray-700">Pending Friend Requests</Link>
          </nav>
          <footer className="border-t border-gray-700 p-4 text-sm text-gray-400">&copy; 2025 Your Company</footer>
        </aside>
        <div className="flex-1 flex flex-col">
          <Navbar user={currentUser ? { name: currentUser.name ?? "User" } : null} onLogout={handleLogout} />
          <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
        </div>
      </div>
    </ChatProvider>
  );
}
