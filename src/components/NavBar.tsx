import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex items-center justify-between relative">
      
      {/* LEFT - Brand */}
      <div className="text-lg font-bold">
        GM System
      </div>

      {/* CENTER - Links */}
      <ul className="flex gap-6 text-sm">
        <li className="hover:text-gray-300 cursor-pointer">Home</li>
        <li className="hover:text-gray-300 cursor-pointer">Grand Matériel</li>
        <li className="hover:text-gray-300 cursor-pointer">Reports</li>
      </ul>

      {/* RIGHT - User Menu */}
      <div className="relative">
        {/* User Button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded hover:bg-gray-700"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>User</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg overflow-hidden">
            
            <div className="px-4 py-2 text-sm border-b">
              Signed in
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;