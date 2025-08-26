import React from "react";

interface NavbarProps {
  user: { name: string } | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => (
  <nav className="w-full flex justify-between items-center p-4 bg-white border-b">
    <div className="text-lg font-semibold text-gray-700">
      {user ? `Welcome, ${user.name}` : "Chat App"}
    </div>
    <button
      onClick={onLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
    >
      Logout
    </button>
  </nav>
);

export default Navbar;
