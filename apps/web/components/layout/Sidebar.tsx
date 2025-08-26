import React from "react";

type SidebarProps = {
  selectedOption: string;
  onSelect: (option: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ selectedOption, onSelect }) => {
  const options = [
    { key: "chats", label: "Chats" },
    { key: "users", label: "Find friends" },
    { key: "friends", label: "Friends" },
    { key: "pendingRequests", label: "Pending Friend Requests" },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="px-6 py-4 text-2xl font-bold border-b border-gray-700">
        Chat App
      </div>
      <nav className="flex-1 flex flex-col mt-4">
        {options.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`px-6 py-4 text-left hover:bg-gray-700 focus:outline-none ${
              selectedOption === key ? "bg-gray-700" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
      <footer className="border-t border-gray-700 p-4 text-sm text-gray-400">
        &copy; 2025 Your Company
      </footer>
    </aside>
  );
};

export default Sidebar;
