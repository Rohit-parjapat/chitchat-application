"use client";
import { useState } from "react";
import Sidebar from "../conponents/Sidebar";
import ChatPage from "./chats/page";
import UserListingPage from "./users/page";
import FriendsPage from "./friends/page";
import PendingRequestsPage from "./pending-requests/page";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState("chats");

  const renderPage = () => {
    switch (selectedOption) {
      case "chats":
        return <ChatPage />;
      case "users":
        return <UserListingPage />;
      case "friends":
        return <FriendsPage />;
      case "pendingRequests":
        return <PendingRequestsPage />;
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar selectedOption={selectedOption} onSelect={setSelectedOption} />

      <main className="flex-1 p-6 overflow-auto bg-gray-50">{renderPage()}</main>
    </div>
  );
}
